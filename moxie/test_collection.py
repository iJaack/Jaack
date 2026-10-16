"""Public collection snapshot: privacy boundary, totals, prices and both page languages."""
import unittest,json,re,hashlib,subprocess,sys,tempfile
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
P=Path(__file__).resolve().parent;D=P/'dist'
ALLOWED={'key','name','set','collector_number','language','finish','count','type_line','colors','color_identity','rarity','mana_value','scryfall_uri','faces','price_eur','value_eur','price_source','decks'}
FORBIDDEN=re.compile(r'purchase|price_?paid|paid|tag|provenance|trade|last_modified|modified|condition|alter|proxy',re.I)
class Page(HTMLParser):
 def __init__(self):super().__init__();self.images=0;self.rows=0;self.links=[];self.scripts=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='img':self.images+=1
  if tag=='tr':self.rows+=1
  if tag=='a' and 'data-language' in a:self.links.append(a['href'])
  if tag=='script' and a.get('src'):self.scripts.append(a['src'])
class CollectionTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.raw=(P/'data/collection.json').read_text();cls.data=json.loads(cls.raw);cls.public=json.loads((D/'collection.json').read_text())
 def test_only_safe_fields(self):
  self.assertEqual(set(self.data),{'schema','generated','prices_as_of','price_note','totals','sets','cards'})
  for c in self.data['cards']:
   self.assertEqual(set(c),ALLOWED,c['name'])
   for k in c:self.assertNotRegex(k,FORBIDDEN)
   for f in c['faces']:
    self.assertEqual(set(f),{'name','image','small'})
    for k in ['image','small']:self.assertEqual((urlsplit(f[k]).scheme,urlsplit(f[k]).hostname),('https','cards.scryfall.io'))
   self.assertEqual(urlsplit(c['scryfall_uri']).hostname,'scryfall.com');self.assertEqual(urlsplit(c['scryfall_uri']).query,'')
   self.assertIn(c['finish'],{'nonfoil','foil','etched'});self.assertIn(c['price_source'],{'scryfall','snapshot',None})
  self.assertNotRegex(self.raw,'(?i)'+'|'.join(['purch'+'ase','price_?'+'paid','trade'+'list','golden'+'-store-','cardmarket'+'-import-','Near Mint','last_modified']))
 def test_totals_are_consistent(self):
  t=self.data['totals'];cards=self.data['cards']
  self.assertEqual(t['cards'],sum(c['count'] for c in cards));self.assertEqual(t['printings'],len(cards))
  self.assertEqual(t['unique'],len({c['name'] for c in cards}));self.assertEqual(t['sets'],len(self.data['sets']))
  self.assertAlmostEqual(t['value_eur'],round(sum(c['value_eur'] or 0 for c in cards),2),places=2)
  self.assertEqual(t['cards'],t['priced_cards']+t['unpriced_cards'])
  for c in cards:
   if c['price_eur'] is None:self.assertIsNone(c['value_eur'])
   else:self.assertAlmostEqual(c['value_eur'],round(c['price_eur']*c['count'],2),places=2)
  self.assertEqual((t['cards'],t['unique']),(1182,740))
  self.assertEqual(len({c['key'] for c in cards}),len(cards))
  self.assertRegex(self.data['prices_as_of'] or '',r'^\d{4}-\d{2}-\d{2}$')
 def test_deck_membership_follows_current_versions(self):
  hub=json.loads((P/'data/hub.json').read_text());current=json.loads((P/'data/versions'/(next(d for d in hub['decks'] if d['id']=='mono-green-landfall')['latest_version']+'.json')).read_text())
  owned={c['name'] for c in self.public['cards'] if 'mono-green-landfall' in c['decks']}
  self.assertIn('Torpor Orb',owned);self.assertNotIn('Warg Tactics',owned)
  for c in self.public['cards']:
   if 'mono-green-landfall' in c['decks']:self.assertTrue(c['name'] in current['mainboard'] or c['name'] in current['sideboard'] or c['name'].split(' // ')[0] in current['mainboard'] or c['name'].split(' // ')[0] in current['sideboard'],c['name'])
 def test_pages_in_both_languages(self):
  for l,slug,other,words in [('it','collezione','/en/collection/',['La collezione.','Valore','Prezzi al']),('en','collection','/it/collezione/',['The collection.','Value','Prices as of'])]:
   html=(D/l/slug/'index.html').read_text();p=Page();p.feed(html)
   self.assertEqual(set(p.links),{f'/{l}/{slug}/',other})
   self.assertEqual(p.images,0,'Initial HTML must not request card images')
   self.assertEqual(p.rows,len(self.data['cards'])+1,'Static table lists every printing without JavaScript')
   self.assertIn('/moxie-collection.js',p.scripts);self.assertIn('data-src="/collection.json"',html)
   for w in words:self.assertIn(w,html)
   self.assertIn(f'href="/{l}/{slug}/"',(D/l/'index.html').read_text(),'nav link')
   self.assertIn(f'https://moxie.jaack.me/{l}/{slug}/',(D/'sitemap.xml').read_text())
 def test_copy_is_paired_and_reviewed(self):
  copy=json.loads((P/'collection-copy.json').read_text())
  def keys(x,p=''):return sorted([p+k for k in x]+sum([keys(v,p+k+'.') for k,v in x.items() if isinstance(v,dict)],[]))
  self.assertEqual(keys(copy['it']),keys(copy['en']))
  self.assertEqual(hashlib.sha256((P/'collection-copy.json').read_bytes()).hexdigest(),json.loads((P/'translation-state.json').read_text())['collection'])
 def test_size_budget(self):
  self.assertLess(len(self.raw.encode()),1_500_000)
 def test_builder_strips_private_fields(self):
  row={'count':2,'trade'+'list_count':1,'name':'X','edition':'tst','condition':'Near Mint','language':'Italian','foil':True,'foil_type':'foil','last_modified':'2026-01-01','collector_number':'1','alter':False,'proxy':False,'purchase'+'_price':'9.99','tags':'golden'+'-store-2026-03-13','current_price_eur':1.5,'total_value_eur':3.0,
   'scryfall':{'scryfall_id':'00000000-0000-0000-0000-000000000000','name':'X','set':'tst','set_name':'Test','collector_number':'1','rarity':'rare','type_line':'Creature — Test','cmc':2,'colors':['G'],'color_identity':['G'],'scryfall_uri':'https://scryfall.com/card/tst/1/x?utm_source=api','image_uri':'https://cards.scryfall.io/normal/front/0/0/x.jpg','image_uri_small':'https://cards.scryfall.io/small/front/0/0/x.jpg','prices':{'eur':1.0,'eur_foil':1.5}}}
  sys.path.insert(0,str(P));import build_collection as bc
  with tempfile.TemporaryDirectory() as tmp:
   src=Path(tmp)/'collection_hydrated.json';src.write_text(json.dumps({'cards':[row,dict(row,condition='Excellent')]}))
   out=bc.build(src,refresh=False)
  text=json.dumps(out);self.assertNotRegex(text,'|'.join([r'9\.99','golden'+'-store','Near Mint','Excellent','2026-01-01','trade'+'list']))
  c=out['cards'][0];self.assertEqual((c['count'],c['finish'],c['language'],c['price_eur'],c['value_eur'],c['price_source']),(4,'foil','it',1.5,6.0,'snapshot'))
  self.assertIsNone(out['prices_as_of'])
if __name__=='__main__':unittest.main()
