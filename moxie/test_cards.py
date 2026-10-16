"""Cards/quantity integrity and image loading/privacy regressions."""
import unittest,json,re
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
P=Path(__file__).resolve().parent;D=P/'dist'
class CardPage(HTMLParser):
 def __init__(self):super().__init__();self.data=[];self.in_card=False;self.images=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='script' and a.get('class')=='card-data':self.in_card=True
  if tag=='img':self.images+=1
 def handle_data(self,data):
  if self.in_card:self.data.append(json.loads(data))
 def handle_endtag(self,tag):
  if tag=='script':self.in_card=False
class CardTests(unittest.TestCase):
 def test_all_images_are_public_reference_only(self):
  assets=json.loads((D/'card-images.json').read_text());names=set()
  for f in (P/'data/versions').glob('*.json'):
   v=json.loads(f.read_text());names.update(v['mainboard']);names.update(v['sideboard'])
  self.assertEqual(set(assets),names)
  for n,a in assets.items():
   self.assertEqual(set(a),{'name','url','faces'});self.assertEqual(a['name'],n)
   self.assertEqual(urlsplit(a['url']).hostname,'scryfall.com')
   self.assertTrue(a['faces'])
   for face in a['faces']:
    self.assertEqual(set(face),{'name','image','small'})
    for k in ['image','small']:
     u=urlsplit(face[k]);self.assertEqual((u.scheme,u.hostname),('https','cards.scryfall.io'))
  self.assertEqual(len(assets['Esper Origins // Summon: Esper Maduin']['faces']),2)
 def test_profile_and_version_keep_exact_boards(self):
  hub=json.loads((P/'data/hub.json').read_text())
  for deck in hub['decks']:
   v=json.loads((P/'data/versions'/(deck['latest_version']+'.json')).read_text())
   for l in ['it','en']:
    for path in [f'{l}/decks/{deck["id"]}/index.html',f'{l}/decks/{deck["id"]}/versions/{v["id"]}/index.html']:
     page=CardPage();page.feed((D/path).read_text());self.assertEqual(len(page.data),2)
     self.assertEqual({x['name']:x['quantity'] for x in page.data[0]},v['mainboard'])
     self.assertEqual({x['name']:x['quantity'] for x in page.data[1]},v['sideboard'])
     self.assertEqual(page.images,0,'Initial HTML must not request card images')
 def test_guide_and_language_controls(self):
  for l,labels in [('it',['Lista','Galleria','Mazzo']),('en',['List','Gallery','Deck'])]:
   h=(D/l/'guides/mono-green-landfall/index.html').read_text();p=CardPage();p.feed(h)
   self.assertEqual([sum(x['quantity'] for x in b) for b in p.data],[60,15]);self.assertEqual(p.images,0)
   for mode,label in zip(['list','gallery','deck'],labels):self.assertIn(f'data-card-view="{mode}"',h);self.assertIn('>'+label+'</button>',h)
if __name__=='__main__':unittest.main()
