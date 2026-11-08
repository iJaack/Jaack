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
  self.assertEqual((t['cards'],t['unique']),(1238,789))
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
  with tempfile.TemporaryDirectory() as tmp:
   src=Path(tmp)/'collection_hydrated.json';src.write_text(json.dumps({'cards':[dict(row,language='English'),dict(row,language=''),dict(row,language=None,foil=False)]}))
   blank=bc.build(src,refresh=False)['cards']
  self.assertEqual(sorted((c['finish'],c['language'],c['count']) for c in blank),[('foil','en',4),('nonfoil','en',2)])
 def test_trk_batch_adds_only_the_verified_copies(self):
  batch=[('104','nonfoil','De-evolve'),('105','nonfoil','Eject the Warp Core'),('107','nonfoil','Fugitive Listener'),('117','nonfoil','In the Pale Moonlight'),('123','nonfoil','Pattern Buffer Preservation'),('129','nonfoil','Storied Veteran'),('130','nonfoil','Stray from History'),('133','nonfoil','Tenacious Drone'),('134','nonfoil','Test of Loyalty'),('139','nonfoil','Boarding Action'),('139','foil','Boarding Action'),('144','nonfoil',"Captain's Tutelage"),('146','nonfoil','Dahar Master'),('151','nonfoil','Genesis Effect'),('154','nonfoil','Khaaaaaaaaaaaannn!'),('155','foil','Khan, Despot by Design'),('159','nonfoil','The Naked Time'),('163','nonfoil','Planetary Patrol'),('171','nonfoil','Savvy Profiteer'),('173','nonfoil','Starfleet Security'),('174','nonfoil','Tal Shiar Analyst'),('181','nonfoil','The Wrath of Khan'),('189','nonfoil','Cold-Blooded Crew'),('190','nonfoil','Common Goal'),('191','foil','Culber and Stamets, Star-Crossed'),('191','nonfoil','Culber and Stamets, Star-Crossed'),('195','nonfoil','Dominion Supervisor'),('198','nonfoil','Final Frontier'),('200','nonfoil','Genesis Device')]
  cards=self.data['cards'];wanted={(n,f) for n,f,_name in batch};trk=[c for c in cards if c['set']=='trk' and (c['collector_number'],c['finish']) in wanted]
  self.assertEqual(len(batch),29);self.assertEqual(len(trk),29);self.assertEqual(sum(c['count'] for c in trk),29)
  self.assertEqual(sorted((c['collector_number'],c['finish'],c['name'],c['count'],c['language']) for c in trk),sorted((n,f,name,1,'en') for n,f,name in batch))
  self.assertEqual(sum(c['count'] for c in trk if c['finish']=='nonfoil'),26)
  self.assertEqual(sorted(c['collector_number'] for c in trk if c['finish']=='foil'),['139','155','191'])
  unpriced={('130','nonfoil'),('144','nonfoil'),('155','foil'),('163','nonfoil'),('191','foil')}
  for c in trk:
   self.assertEqual(c['decks'],[]);self.assertEqual(c['count'],1)
   if (c['collector_number'],c['finish']) in unpriced:self.assertIsNone(c['price_eur']);self.assertIsNone(c['price_source'])
   else:self.assertEqual(c['price_source'],'scryfall');self.assertGreater(c['price_eur'],0)
  self.assertEqual(self.data['sets']['trk'],'Star Trek')
  kept=[c for c in cards if c['set']!='trk']
  self.assertEqual(sum(c['count'] for c in kept),1182);self.assertEqual(len(kept),909)
  self.assertEqual(hashlib.sha256(json.dumps(kept,ensure_ascii=False,separators=(',',':')).encode()).hexdigest(),'f6333de6b5dc05ff65f31df613a946a81a5ecc2518e6f3587072099a5c35c41d')
  sets={k:v for k,v in self.data['sets'].items() if k!='trk'}
  self.assertEqual(hashlib.sha256(json.dumps(sets,ensure_ascii=False,separators=(',',':'),sort_keys=True).encode()).hexdigest(),'f9f324364cc0ce8e3087300f783a2cebc332e5c80e3fe43be8df3798d97281ad')
 def test_trk_batch27_adds_only_the_verified_copies(self):
  batch=[('203','nonfoil',"I'm a Doctor, Not a . . .",'c07979d4-8a58-4cfb-bffa-74e8bd97c7ff'),('207','nonfoil','Moopsy','dfbaf597-6be2-4aa0-88ae-cc4c94878add'),('208','nonfoil','Mugato','f3c68b20-f202-4d55-bef1-398d96e55c57'),('210','nonfoil','Photosynthetic Physician','88b87ddb-fbf8-4e6e-9895-1b30ae5ad63a'),('213','nonfoil','Saurian Explorer','197abe5e-cde2-4b29-a10f-d6b789776bfa'),('214','nonfoil','Species 8472','b3d74723-4c9e-4fe7-8276-05d5f1b7ba0c'),('221','nonfoil','U.S.S. Discovery, at Black Alert','69b1f87f-ff02-4945-9f07-18dab5035e2d'),('222','nonfoil','U.S.S. Voyager, Lone Wanderer','aaf8a0b2-c6cb-41cb-913d-7ae1d75e555d'),('224','foil','Xenobotanist','20a97cda-42b2-44f1-8e77-f64dd1c98f6f'),('225','nonfoil','Xindi Surveyors','803608aa-ae69-45d2-ae48-f1688d2a6a0d'),('226','foil','All Good Things...','fe5dda31-159c-49c7-962e-a04b771256ea'),('239','nonfoil','Hemmer, Fixing What Is Broken','f3e730d7-3fd1-4bd2-a35b-6fb85bfd3c65'),('243','nonfoil','Kirk, Commanding Officer','245d0430-0967-44f1-8c59-985104a8db30'),('249','nonfoil','Nog, Ambitious Cadet','b513dd60-8573-467b-9c6a-855a0ba86fca'),('262','nonfoil','Cybernetic Specialist','b147f16e-a2d6-4d43-9213-9a2723b0d3ef'),('266','nonfoil','Isolinear Processor','8c1a2c13-5e36-4707-9d90-18c2e58a2b26'),('269','nonfoil','Tea, Earl Grey, Hot','289e8ebe-ab0f-466b-a4e6-d5cf8411e724'),('270','nonfoil','Tricorder','3c872f02-80ac-49e3-a777-3526d35ad7cc'),('272','nonfoil','U.S.S. Cerritos, Following Up','76bf7521-5024-4fdc-9ea1-5e10f2647efb'),('294','nonfoil','Romulus','1bce111b-b07c-4589-9b6d-f0b5f320808c'),('300','nonfoil','Subspace Anomaly','ed62600f-84ae-421e-970a-fd0682c8f280'),('306','nonfoil','Watery Grave','5525d6a6-e532-4047-9da4-bfae7927fecc'),('310','nonfoil','Mountain','87908c55-4ac4-4b57-a8ee-a28640a18f0f'),('314','foil','Swamp','e046c0ef-0af3-4f48-8329-7d659e7d1a89'),('320','nonfoil','Island','a44efa5f-8fbb-43e0-adc4-d05f4be6b9a6'),('323','nonfoil','Mountain','2a844b96-6616-4c39-8f4f-5d14a3b2bd55'),('323','foil','Mountain','2a844b96-6616-4c39-8f4f-5d14a3b2bd55')]
  cards=self.data['cards'];wanted={(n,f) for n,f,_name,_sid in batch}
  added=[c for c in cards if c['set']=='trk' and (c['collector_number'],c['finish']) in wanted]
  self.assertEqual(len(batch),27);self.assertEqual(len(added),27);self.assertEqual(sum(c['count'] for c in added),27)
  self.assertEqual(sorted((c['collector_number'],c['finish'],c['name'],c['count'],c['language'],c['key'].split('|')[0]) for c in added),sorted((n,f,name,1,'',sid) for n,f,name,sid in batch))
  self.assertEqual(sum(c['count'] for c in added if c['finish']=='nonfoil'),23)
  self.assertEqual(sorted(c['collector_number'] for c in added if c['finish']=='foil'),['224','226','314','323'])
  self.assertEqual(sum(1 for c in added if c['collector_number']=='323'),2)
  for c in added:
   self.assertEqual(c['count'],1)
   if (c['collector_number'],c['finish'])==('224','foil'):self.assertIsNone(c['price_eur']);self.assertIsNone(c['price_source'])
   else:self.assertEqual(c['price_source'],'scryfall');self.assertGreater(c['price_eur'],0)
  self.assertEqual(sorted(c['decks'] for c in added if c['name']=='Island'),[['arachnid-blitz']])
  self.assertEqual(sorted(c['decks'] for c in added if c['name']=='Mountain'),[['bending-aggro'],['bending-aggro'],['bending-aggro']])
  self.assertTrue(all(c['decks']==[] for c in added if c['name'] not in {'Island','Mountain'}))
  kept=[c for c in cards if not (c['set']=='trk' and (c['collector_number'],c['finish']) in wanted)]
  self.assertEqual(len(kept),938);self.assertEqual(sum(c['count'] for c in kept),1211)
  self.assertEqual(hashlib.sha256(json.dumps(kept,ensure_ascii=False,separators=(',',':')).encode()).hexdigest(),'da281836dca7d0c63a1cbff79a28996b42c7bc780dfb97fce645a6497e7d6ede')
 def test_no_blank_languages_or_duplicate_printings(self):
  cards=self.data['cards']
  blanks=[c for c in cards if not c['language']]
  self.assertEqual(len(blanks),27);self.assertTrue(all(c['set']=='trk' and int(c['collector_number'])>=203 for c in blanks))
  self.assertTrue(all(c['language'] for c in cards if c['set']!='trk' or int(c['collector_number'])<203))
  keys=[(c['set'],c['collector_number'],c['finish'],c['language']) for c in cards];self.assertEqual(len(keys),len(set(keys)))
if __name__=='__main__':unittest.main()
