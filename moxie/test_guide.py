"""Validate the playable examples, balanced side plans and public build boundary."""
import json,re,hashlib,unittest
from pathlib import Path
from collections import Counter
from html.parser import HTMLParser
P=Path(__file__).resolve().parent;G=json.loads((P/'guide.json').read_text());D=G['deck']
class Page(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.links=[];self.hands=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if 'href' in a:self.links.append(a['href'])
  if tag=='details' and a.get('class')=='hand':self.hands+=1
class GuideTests(unittest.TestCase):
 def test_lists(self):
  self.assertEqual(sum(c['quantity'] for c in D['mainboard'].values()),60)
  self.assertEqual(sum(c['quantity'] for c in D['sideboard'].values()),15)
  self.assertEqual(D['sideboard']['Warg Tactics']['quantity'],2)
  self.assertNotIn('Origin of Metalbending',D['sideboard'])
 def test_side_plans(self):
  for key,(ins,outs) in G['plans'].items():
   self.assertEqual(sum(ins.values()),sum(outs.values()),key)
   post=Counter({n:c['quantity'] for n,c in D['mainboard'].items()});post.subtract(outs);post.update(ins)
   self.assertEqual(sum(post.values()),60)
   self.assertTrue(all(D['sideboard'].get(n,{}).get('quantity',0)>=q for n,q in ins.items()))
   self.assertTrue(all(q>=0 and (q<=4 or n=='Forest') for n,q in post.items()))
 def test_twelve_real_hands(self):
  self.assertEqual(len(G['hands']),12)
  for hand in G['hands']:
   pool=Counter({n:c['quantity'] for n,c in D['mainboard'].items()})
   if hand['id'] in ['post-aggro','post-izzet']:
    ins,outs=G['plans']['ground' if hand['id']=='post-aggro' else 'izzet'];pool.subtract(outs);pool.update(ins)
   self.assertEqual(len(hand['cards']),7,hand['id'])
   self.assertTrue(all(pool[n]>=q for n,q in Counter(hand['cards']).items()),hand['id'])
  six=next(x for x in G['hands'] if x['id']=='six');kept=six['cards'].copy();kept.remove(six['bottom']);self.assertEqual(len(kept),6)
 def test_links_and_public_boundary(self):
  text=(P/'dist/it/guides/mono-green-landfall/index.html').read_text();page=Page();page.feed(text)
  self.assertEqual(len(page.ids),len(set(page.ids)))
  self.assertEqual(page.hands,12)
  for link in page.links:
   if link.startswith('#'):self.assertIn(link[1:],page.ids)
   if link.startswith('/'):self.assertTrue((P/'dist'/link[1:]).exists())
  self.assertNotRegex(text,r'/Users/|API_KEY|access_token|purchases\.json|collection\.csv')
  self.assertEqual({x.name for x in (P/'dist').iterdir() if x.is_file()},{'index.html','style.css','app.js','cards.js','moxie-collection.js','collection.json','card-images.json','robots.txt','sitemap.xml','vercel.json','favicon.svg','theme.js','jaack.css','jaack.js','mono-green-landfall-galactus-11-settembre-2026.pdf','mono-green-landfall-galactus-11-september-2026-en.pdf'})
if __name__=='__main__':unittest.main()
