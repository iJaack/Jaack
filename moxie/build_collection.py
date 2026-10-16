"""Build the public, sanitized collection snapshot (data/collection.json).

The private inventory (collection_hydrated.json, built from the Moxfield CSV on
the Mac) never enters this repository. Pass its path as the first argument or
in MOXIE_COLLECTION_SOURCE:

    python3 build_collection.py /path/to/collection_hydrated.json [--no-refresh]

Only the fields in CARD_FIELDS are written. Prices paid, tags/provenance,
trade-list counts, last-modified timestamps and condition are never read into
the output. EUR prices are refreshed from the Scryfall API by printing id
(foil-aware); when Scryfall fails for a printing, the hydrated price is kept and
the card is flagged with price_source "snapshot".

build_hub.py does not import the private file: it only reads the committed
data/collection.json and recomputes deck membership from data/versions.
"""
from pathlib import Path
import json,os,sys,time,datetime,urllib.request,urllib.error
from urllib.parse import urlsplit,urlunsplit

P=Path(__file__).resolve().parent
OUT=P/'data'/'collection.json'
USER_AGENT='MoxieCollectionBuild/1.0 (+https://moxie.jaack.me)'
SCRYFALL='https://api.scryfall.com/cards/collection'
BATCH=75
DELAY=0.1
CARD_FIELDS=['key','name','set','collector_number','language','finish','count','type_line','colors','color_identity','rarity','mana_value','scryfall_uri','faces','price_eur','value_eur','price_source','decks']
LANG={'English':'en','Italian':'it','Japanese':'ja','German':'de','French':'fr','Spanish':'es','Portuguese':'pt','Russian':'ru','Korean':'ko','Chinese Simplified':'zhs','Chinese Traditional':'zht','':''}

def card_image(url):
 if not url:return None
 u=urlsplit(url)
 if u.scheme!='https' or u.hostname!='cards.scryfall.io':raise ValueError('image origin: '+url)
 return url
def scryfall_page(url):
 u=urlsplit(url)
 if u.scheme!='https' or u.hostname!='scryfall.com':raise ValueError('source origin: '+url)
 return urlunsplit((u.scheme,u.netloc,u.path,'',''))
def front(name):return name.split(' // ')[0]

def deck_membership():
 """Card names in each deck's current version (data/hub.json latest_version)."""
 hub=json.loads((P/'data/hub.json').read_text());out={}
 for d in hub['decks']:
  v=json.loads((P/'data/versions'/(d['latest_version']+'.json')).read_text())
  for n in list(v['mainboard'])+list(v['sideboard']):
   for k in {n,front(n)}:out.setdefault(k,set()).add(d['id'])
 return {k:sorted(v) for k,v in out.items()}
def attach_decks(cards):
 m=deck_membership()
 for c in cards:c['decks']=m.get(c['name'],m.get(front(c['name']),[]))
 return cards

def fetch_prices(ids):
 """Return {scryfall_id: card} from the Scryfall collection endpoint."""
 found={}
 for i in range(0,len(ids),BATCH):
  body=json.dumps({'identifiers':[{'id':x} for x in ids[i:i+BATCH]]}).encode()
  req=urllib.request.Request(SCRYFALL,data=body,headers={'User-Agent':USER_AGENT,'Accept':'application/json','Content-Type':'application/json'})
  try:
   with urllib.request.urlopen(req,timeout=30) as r:data=json.load(r)
   for c in data.get('data',[]):found[c['id']]=c
  except (urllib.error.URLError,TimeoutError,ValueError) as e:print('Scryfall batch failed:',e,file=sys.stderr)
  time.sleep(DELAY)
 return found

def finish_price(prices,finish):
 key={'foil':'eur_foil','etched':'eur_etched','nonfoil':'eur'}[finish]
 value=prices.get(key)
 if value is None and finish=='etched':value=prices.get('eur_foil')
 return float(value) if value not in (None,'') else None

def faces_from(api,row_sf):
 if api and api.get('image_uris'):return [{'name':api['name'],'image':card_image(api['image_uris']['normal']),'small':card_image(api['image_uris']['small'])}]
 if api and api.get('card_faces') and all(f.get('image_uris') for f in api['card_faces']):
  return [{'name':f['name'],'image':card_image(f['image_uris']['normal']),'small':card_image(f['image_uris']['small'])} for f in api['card_faces']]
 return [{'name':row_sf['name'],'image':card_image(row_sf['image_uri']),'small':card_image(row_sf['image_uri_small'])}]

def build(source,refresh=True):
 rows=json.loads(Path(source).read_text())['cards']
 api=fetch_prices(sorted({r['scryfall']['scryfall_id'] for r in rows})) if refresh else {}
 today=datetime.date.today().isoformat();merged={}
 for r in rows:
  sf=r['scryfall'];finish=(r.get('foil_type') or 'foil') if r.get('foil') else 'nonfoil'
  key='|'.join([sf['scryfall_id'],finish,LANG.get(r.get('language') or '',r.get('language') or '')])
  if key in merged:merged[key]['count']+=int(r['count']);continue
  live=api.get(sf['scryfall_id'])
  price=finish_price(live.get('prices',{}),finish) if live else None
  source_tag='scryfall' if price is not None else None
  if price is None:
   snap=r.get('current_price_eur')
   if snap is not None:price=float(snap);source_tag='snapshot'
  merged[key]={'key':key,'name':sf['name'],'set':sf['set'],'collector_number':sf['collector_number'],'language':LANG.get(r.get('language') or '',r.get('language') or ''),'finish':finish,'count':int(r['count']),
   'type_line':sf.get('type_line') or '','colors':sf.get('colors') or [],'color_identity':sf.get('color_identity') or [],'rarity':sf.get('rarity') or '','mana_value':sf.get('cmc') or 0,
   'scryfall_uri':scryfall_page(sf['scryfall_uri']),'faces':faces_from(live,sf),'price_eur':price,'price_source':source_tag,'_set_name':sf.get('set_name') or sf['set']}
 sets={};cards=[]
 for c in merged.values():
  sets[c['set']]=c.pop('_set_name')
  c['value_eur']=round(c['price_eur']*c['count'],2) if c['price_eur'] is not None else None
  cards.append({k:c.get(k) for k in CARD_FIELDS})
 attach_decks(cards)
 cards.sort(key=lambda c:(c['name'].lower(),c['set'],c['collector_number'],c['finish'],c['language']))
 priced=[c for c in cards if c['value_eur'] is not None]
 data={'schema':1,'generated':today,'prices_as_of':today if api else None,
  'price_note':'Scryfall EUR (Cardmarket trend) per printing and finish; snapshot = earlier cached price used because Scryfall had none.',
  'totals':{'cards':sum(c['count'] for c in cards),'unique':len({c['name'] for c in cards}),'printings':len(cards),'sets':len(sets),'value_eur':round(sum(c['value_eur'] for c in priced),2),
   'priced_cards':sum(c['count'] for c in priced),'unpriced_cards':sum(c['count'] for c in cards if c['value_eur'] is None),'snapshot_priced_cards':sum(c['count'] for c in cards if c['price_source']=='snapshot')},
  'sets':dict(sorted(sets.items(),key=lambda x:x[1].lower())),'cards':cards}
 return data

if __name__=='__main__':
 args=[a for a in sys.argv[1:] if not a.startswith('--')]
 source=args[0] if args else os.environ.get('MOXIE_COLLECTION_SOURCE')
 if not source:sys.exit('Pass the private collection_hydrated.json path (argument or MOXIE_COLLECTION_SOURCE).')
 if Path(source).resolve().is_relative_to(P.parent):sys.exit('Refusing a source inside the repository: keep private inventory outside git.')
 data=build(source,refresh='--no-refresh' not in sys.argv)
 OUT.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n')
 t=data['totals'];print(f"Wrote {OUT.relative_to(P)}: {t['cards']} cards, {t['unique']} unique, {t['sets']} sets, EUR {t['value_eur']}; prices as of {data['prices_as_of']}; {t['snapshot_priced_cards']} snapshot-priced, {t['unpriced_cards']} unpriced")
