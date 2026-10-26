"""Public Modern plan: source fidelity, playable stages, budget and locale parity."""
import hashlib,json,unittest
from collections import Counter
from decimal import Decimal
from pathlib import Path
from html.parser import HTMLParser
from test_cards import CardPage
from test_hub import Doc

P=Path(__file__).resolve().parent;D=P/'dist'
def eur(value):return Decimal(str(value))

class PlanPage(HTMLParser):
 def __init__(self):
  super().__init__();self.months=[];self.open_months=[];self.current=None;self.progress=None;self.current_month=None;self.rows=0;self.tables={};self.row=None;self.cell=None
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='article' and a.get('class')=='plan-month':
   self.current_month=int(a['id'].split('-')[1]);self.months.append(self.current_month)
  if tag=='details' and a.get('class')=='plan-details' and 'open' in a:self.open_months.append(self.current_month)
  if tag=='a' and a.get('aria-current')=='step':self.current=a['href']
  if tag=='progress':self.progress=(int(a['value']),int(a['max']))
  if tag=='tr':self.rows+=1;self.row=[]
  if tag in ['td','th']:self.cell=''
 def handle_data(self,text):
  if self.cell is not None:self.cell+=text
 def handle_endtag(self,tag):
  if tag in ['td','th'] and self.cell is not None:self.row.append(self.cell);self.cell=None
  if tag=='tr':self.tables.setdefault(self.current_month,[]).append(self.row);self.row=None

class PlanTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.plan=json.loads((P/'data/broodscale-plan.json').read_text());cls.progress=json.loads((P/'data/broodscale-progress.json').read_text());cls.copy=json.loads((P/'broodscale-copy.json').read_text())
 def test_supplied_public_plan_is_unchanged(self):
  self.assertEqual(hashlib.sha256((P/'data/broodscale-plan.json').read_bytes()).hexdigest(),'e8b7acfdb5b66dc5a4411fc7bd882a242dead0b739d84811a279204cb3b55d67')
 def test_every_month_has_a_playable_60_plus_15(self):
  self.assertEqual([m['month'] for m in self.plan['months']],list(range(1,self.plan['totalMonths']+1)))
  for m in self.plan['months']:
   for board,count in [('mainboard',60),('sideboard',15)]:
    entries=m[board];self.assertEqual(sum(x['qty'] for x in entries),count)
    self.assertEqual(len({x['card'] for x in entries}),len(entries))
   copies=Counter()
   for b in ['mainboard','sideboard']:
    for x in m[b]:copies[x['card']]+=x['qty']
   self.assertTrue(all(isinstance(q,int) and q>0 and (q<=4 or n=='Forest') for n,q in copies.items()))
  last=self.plan['months'][-1]
  for board in ['mainboard','sideboard']:self.assertEqual(last[board],self.plan['finalList'][board])
  final={x['card']:x['qty'] for x in last['mainboard']};side={x['card']:x['qty'] for x in last['sideboard']}
  self.assertEqual((final['Glaring Fleshraker'],final['Sire of Seven Deaths'],final['Dismember'],side['Dismember'],side['Disruptor Flute']),(2,1,1,2,1))
 def test_budget_and_carryover_reconcile_to_the_cent(self):
  carry=Decimal(0);total=Decimal(0)
  for m in self.plan['months']:
   self.assertEqual(eur(m['carryoverInEur']),carry)
   self.assertEqual(eur(m['budgetEur']),eur(self.plan['budgetPerMonth']))
   available=carry+eur(m['budgetEur']);self.assertEqual(eur(m['availableEur']),available)
   for x in m['purchases']:self.assertEqual(x['qty']*eur(x['unitEur']),eur(x['subtotalEur']))
   spend=sum(eur(x['subtotalEur']) for x in m['purchases']);self.assertEqual(spend,eur(m['spendEur']))
   self.assertLessEqual(spend,available);carry=available-spend;total+=spend
   self.assertEqual(carry,eur(m['carryoverOutEur']))
  self.assertEqual(total,eur(self.plan['totalSpendEur']));self.assertEqual(total,Decimal('638.00'));self.assertEqual(carry,Decimal('12.00'))
 def test_rendered_months_keep_exact_boards_and_purchases(self):
  for l in ['it','en']:
   text=(D/l/'modern/broodscale/index.html').read_text();cards=CardPage();cards.feed(text);page=PlanPage();page.feed(text)
   self.assertEqual(page.months,list(range(1,14)));self.assertEqual(cards.images,0)
   self.assertEqual(len(cards.data),26)
   for m,main,side in zip(self.plan['months'],cards.data[::2],cards.data[1::2]):
    for board,rendered in [('mainboard',main),('sideboard',side)]:self.assertEqual({x['name']:x['quantity'] for x in rendered},{x['card']:x['qty'] for x in m[board]})
    rows=page.tables[m['month']][1:];self.assertEqual(len(rows),len(m['purchases']))
    for x,row in zip(m['purchases'],rows):
     self.assertEqual(row[0],str(x['qty']));self.assertTrue(row[1].startswith(x['card']))
     self.assertIn(x['cheapestPrinting'],row[1]);self.assertIn(self.copy[l]['translations'][x['role']],row[1])
     for value,key in zip(row[2:],['unitEur','subtotalEur']):
      self.assertEqual(eur(value.replace('€','').replace(' ','').replace(',','.')),eur(x[key]))
   self.assertEqual(page.rows,13+sum(len(m['purchases']) for m in self.plan['months']))
   links=Doc();links.feed(text)
   self.assertTrue(any(u.startswith('https://scryfall.com/card/') for u in links.links))
   for key in ['source','tournament']:self.assertIn(self.copy[l][key],text)
 def test_actual_progress_is_separate_from_planned_spend(self):
  p=self.progress;self.assertEqual(p,{'startMonth':'2026-11','currentMonth':1,'completedMonths':0,'actualSpendEur':0,'purchasedCards':0})
  for l in ['it','en']:
   text=(D/l/'modern/broodscale/index.html').read_text();page=PlanPage();page.feed(text)
   self.assertEqual(page.progress,(p['completedMonths'],self.plan['totalMonths']))
   self.assertEqual(page.current,'#month-'+str(p['currentMonth']));self.assertEqual(page.open_months,[p['currentMonth']])
   self.assertIn('novembre 2026' if l=='it' else 'November 2026',text)
   self.assertIn('0 carte acquistate' if l=='it' else '0 cards purchased',text)
   self.assertIn('Spesa effettiva: € 0,00' if l=='it' else 'Actual spend: €0.00',text)
 def test_paired_copy_and_current_play_context(self):
  it,en=self.copy['it'],self.copy['en'];self.assertEqual(set(it),set(en));self.assertEqual(set(it['translations']),set(en['translations']))
  self.assertEqual(it['notes'],[m['notes'] for m in self.plan['months']]);self.assertEqual(len(en['notes']),13)
  self.assertEqual(hashlib.sha256((P/'broodscale-copy.json').read_bytes()).hexdigest(),json.loads((P/'translation-state.json').read_text())['broodscale'])
  for l in ['it','en']:
   for path in ['index.html','decks/mono-green-landfall/index.html','modern/broodscale/index.html']:
    text=(D/l/path).read_text();self.assertIn('Endstep',text);self.assertIn(f'href="/{l}/modern/broodscale/"',text)
   text=(D/l/'modern/broodscale/index.html').read_text()
   self.assertIn('mercoledì' if l=='it' else 'Wednesday',text);self.assertIn('Golden Store Talenti',text)
   for k in ['prices','rules','modification','status_note']:self.assertIn(self.copy[l][k],text)
   if l=='en':self.assertNotRegex(text,r'già posseduto|sostituto temporaneo|Riporto|Forza stimata|Mese \d')
   self.assertLess(len(text.encode()),150_000)

if __name__=='__main__':unittest.main()
