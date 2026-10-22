"""Regression tests for locale parity, immutable history and public routes."""
import unittest,json,hashlib,re
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
P=Path(__file__).resolve().parent;D=P/'dist'
class Doc(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.links=[];self.lang=None;self.hands=0;self.languages=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='html':self.lang=a.get('lang')
  if a.get('id'):self.ids.append(a['id'])
  if tag=='a':
   self.links.append(a.get('href',''))
   if 'data-language' in a:self.languages.append(a.get('href'))
  if tag=='details' and a.get('class')=='hand':self.hands+=1
class HubTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.routes=json.loads((P/'routes.json').read_text());cls.hub=json.loads((P/'data/hub.json').read_text());cls.versions={f.stem:json.loads(f.read_text()) for f in (P/'data/versions').glob('*.json')}
 def test_every_page_has_equivalent_languages(self):
  self.assertEqual(len(self.routes),48)
  # Localized slugs: the collection lives at /it/collezione/ and /en/collection/.
  slug={'it':{'collection/':'collezione/'},'en':{'collezione/':'collection/'}}
  local=lambda l,rest:slug[l].get(rest,rest)
  self.assertEqual({local('en',x[4:]) for x in self.routes if x.startswith('/it/')},{x[4:] for x in self.routes if x.startswith('/en/')})
  for route in self.routes:
   page=Doc();page.feed((D/route.lstrip('/')/'index.html').read_text());self.assertEqual(page.lang,route.split('/')[1]);self.assertEqual(len(page.languages),2)
   self.assertEqual(set(page.languages),{'/it/'+local('it',route[4:]),'/en/'+local('en',route[4:])})
 def test_internal_links_resolve(self):
  for route in self.routes+['/']:
   f=D/route.lstrip('/')/'index.html';page=Doc();page.feed(f.read_text());self.assertEqual(len(page.ids),len(set(page.ids)),route)
   for link in page.links:
    u=urlsplit(link)
    if u.scheme or u.netloc:continue
    target=D/u.path.lstrip('/') if u.path else f
    if target.is_dir():target=target/'index.html'
    self.assertTrue(target.is_file(),(route,link))
    if u.fragment:
     dest=Doc();dest.feed(target.read_text());self.assertIn(unquote(u.fragment),dest.ids,(route,link))
 def test_translation_identity(self):
  it=json.loads((P/'guide.json').read_text());en=json.loads((P/'guide.en.json').read_text());self.assertEqual(it['deck'],en['deck']);self.assertEqual(it['plans'],en['plans']);self.assertEqual(len(en['pages']),24)
  for a,b in zip(it['pages'],en['pages']):
   self.assertEqual(a['key'],b['key']);self.assertEqual([x[0] for x in a['blocks']],[x[0] for x in b['blocks']])
   for x,y in zip(a['blocks'],b['blocks']):
    if x[0]=='row':self.assertEqual(x,y)
    if x[0]=='ref':self.assertEqual(x[1][1],y[1][1])
  for a,b in zip(it['hands'],en['hands']):self.assertEqual(a['id'],b['id']);self.assertEqual(a['cards'],b['cards']);self.assertEqual(a.get('bottom'),b.get('bottom'))
  for lang in ['it','en']:
   p=Doc();p.feed((D/lang/'guides/mono-green-landfall/index.html').read_text());self.assertEqual(p.hands,12)
 def test_snapshots_and_events_remain_honest(self):
  hashes=json.loads((P/'data/versions.sha256.json').read_text())
  for n,h in hashes.items():self.assertEqual(hashlib.sha256((P/'data/versions'/n).read_bytes()).hexdigest(),h)
  upcoming=next(e for e in self.hub['events'] if e['status']=='planned');self.assertIsNone(upcoming['result']);self.assertEqual(upcoming['version_relation'],'prepared');self.assertIn(upcoming['version_id'],self.versions)
  march=next(e for e in self.hub['events'] if e['id']=='fnm-2026-03-13');self.assertIsNone(march['version_id'])
  for lang in ['it','en']:self.assertNotIn('/versions/mono-green-2026-09-10',(D/lang/'journal/fnm-2026-03-13/index.html').read_text())
  spider=self.versions['arachnid-blitz-2025-12-21'];self.assertEqual(spider['counts']['main'],61);self.assertEqual(spider['declared_counts']['main'],63)
  for v in self.versions.values():
   self.assertEqual(sum(v['mainboard'].values()),v['counts']['main']);self.assertEqual(sum(v['sideboard'].values()),v['counts']['side'])
 def test_reality_fracture_report_is_public_without_invented_decklist(self):
  event=next(e for e in self.hub['events'] if e['id']=='reality-fracture-prerelease-2026-09-25')
  self.assertEqual(event['date'],'2026-09-25')
  self.assertEqual(event['status'],'reported')
  self.assertIsNone(event['deck_id'])
  self.assertIsNone(event['version_id'])
  for lang,result in [('it','2 vittorie, 3 sconfitte'),('en','2 wins, 3 losses')]:
   path='/journal/reality-fracture-prerelease-2026-09-25/'
   page=(D/lang/path.lstrip('/')/'index.html').read_text()
   self.assertIn(result,page)
   self.assertIn('Arcane Amphisbaena',page)
   self.assertIn('Ghalta the Unstoppable',page)
   self.assertNotIn('/decks/mono-green-landfall',page)
   self.assertIn(path,(D/lang/'journal/index.html').read_text())
   self.assertIn(path,(D/lang/'index.html').read_text())
 def test_public_boundary_and_language_copy(self):
  for f in D.rglob('*'):
   if not f.is_file() or '.vercel' in f.parts:continue
   self.assertNotIn(f.suffix,['.py','.env','.jsonl'])
   if f.suffix in ['.html','.js','.css','.txt']:self.assertNotRegex(f.read_text(),r'/Users/|API_KEY|access_token|collection\.csv|purchases\.json')
  self.assertIn('I mazzi, e quello',(D/'it/index.html').read_text());self.assertIn('Decks, and what',(D/'en/index.html').read_text())
  for f in (D/'en').rglob('*.html'):self.assertNotRegex(f.read_text(),r'Nessun risultato|Lista preparata per la serata|DENTRO:|FUORI:|Torna all’inizio|Mostra gli esempi')
 def test_torpor_update_preserves_history_and_updates_active_routes(self):
  old=self.versions['mono-green-2026-09-10-warg'];new=self.versions['mono-green-2026-10-01-torpor']
  self.assertEqual(new['mainboard'],old['mainboard'])
  self.assertEqual(new['sideboard'].get('Torpor Orb'),2)
  self.assertNotIn('Warg Tactics',new['sideboard'])
  self.assertEqual({n:q for n,q in new['sideboard'].items() if n!='Torpor Orb'},{n:q for n,q in old['sideboard'].items() if n!='Warg Tactics'})
  self.assertEqual(old['sideboard']['Warg Tactics'],2)
  deck=next(d for d in self.hub['decks'] if d['id']=='mono-green-landfall')
  self.assertEqual(deck['latest_version'],new['id'])
  event=next(e for e in self.hub['events'] if e['id']=='torpor-orb-update-2026-10-01')
  self.assertEqual((event['version_id'],event['status'],event['version_relation']),(new['id'],'preparation','prepared'))
  self.assertIsNone(event['result'])
  for lang in ['it','en']:
   url=f'/{lang}/{deck["guide_path"]}/';guide=(D/lang/deck['guide_path']/'index.html').read_text()
   self.assertIn('Sunderflock',guide)
   self.assertIn('Summon: Esper Maduin',guide)
   self.assertIn('/versions/'+new['id']+'.txt',guide)
   for page in ['index.html','decks/mono-green-landfall/index.html','guides/index.html','guides/mono-green-landfall/index.html']:
    self.assertIn(url,(D/lang/page).read_text())
 def test_league_report_2026_10_16(self):
  event=self.hub['events'][0];self.assertEqual((event['id'],event['date'],event['status']),('league-talenti-2026-10-16','2026-10-16','reported'))
  self.assertEqual((event['version_id'],event['version_relation']),('mono-green-2026-10-01-torpor','played'))
  self.assertEqual(len(event['notes']),4)
  for lang in ['it','en']:
   page=(D/lang/'journal/league-talenti-2026-10-16/index.html').read_text()
   for text in ['Golden Store Talenti','Sunderflock','Icetill Explorer','/versions/mono-green-2026-10-01-torpor/']:self.assertIn(text,page)
   self.assertIn('/journal/league-talenti-2026-10-16/',(D/lang/'journal/index.html').read_text())
 def test_deck_color_themes(self):
  for lang in ['it','en']:
   for slug,theme in [('mono-green-landfall','theme-g'),('bending-aggro','theme-rg'),('arachnid-blitz','theme-gu')]:
    self.assertIn('class="deck-theme '+theme+'"',(D/lang/'decks'/slug/'index.html').read_text())
   self.assertIn('class="deck-theme theme-g"',(D/lang/'guides/mono-green-landfall/index.html').read_text())
   self.assertNotIn('class="deck-theme',(D/lang/'index.html').read_text())
  css=(D/'style.css').read_text()+(D/'jaack.css').read_text()
  self.assertIn('--jk-bg:#121314',css)
  self.assertIn('--jk-accent:#e8c547',css)
  self.assertIn('.theme-rg{--accent:#ed887c;--deck-stripe:linear-gradient(90deg,#ed887c 0% 50%,#7fc49a 50% 100%)}',css)
  self.assertNotIn('#184936',css)
 def test_legacy_pdf_and_downloads(self):
  for pdf in ['mono-green-landfall-galactus-11-settembre-2026.pdf','mono-green-landfall-galactus-11-september-2026-en.pdf']:
   self.assertEqual((D/pdf).read_bytes()[:5],b'%PDF-')
  for v in self.versions.values():self.assertTrue((D/'versions'/(v['id']+'.txt')).is_file())
if __name__=='__main__':unittest.main()
