"""Build the source-backed, bilingual deck diary. Only dist is public."""
from pathlib import Path
from collections import Counter
import json,html,hashlib,shutil
from card_views import card_browser, COPY as CARD_COPY
from build_collection import attach_decks
P=Path(__file__).resolve().parent;DIST=P/'dist';DIST.mkdir(exist_ok=True)
H=json.loads((P/'data/hub.json').read_text());VERS={f.stem:json.loads(f.read_text()) for f in sorted((P/'data/versions').glob('*.json'))};DECKS={d['id']:d for d in H['decks']}
G={l:json.loads((P/('guide.json' if l=='it' else 'guide.en.json')).read_text()) for l in ['it','en']}
STATE=json.loads((P/'translation-state.json').read_text())
CC=json.loads((P/'collection-copy.json').read_text());assert hashlib.sha256((P/'collection-copy.json').read_bytes()).hexdigest()==STATE['collection'],'Collection copy changed: review IT + EN and update translation-state.json'
COLL=json.loads((P/'data/collection.json').read_text());attach_decks(COLL['cards'])
for l in G:assert hashlib.sha256((P/('guide.json' if l=='it' else 'guide.en.json')).read_bytes()).hexdigest()==STATE[l],'Translation changed: review and update translation-state.json'
assert G['it']['deck']==G['en']['deck'] and G['it']['plans']==G['en']['plans']
for board_name in ['mainboard','sideboard']:
 assert {n:x['quantity'] for n,x in G['it']['deck'][board_name].items()}==VERS['mono-green-2026-09-10-warg'][board_name], 'Guide no longer matches its dated version'
PDF={'it':'mono-green-landfall-galactus-11-settembre-2026.pdf','en':'mono-green-landfall-galactus-11-september-2026-en.pdf'}
for f in PDF.values():shutil.copy2(P/'pdf'/f,DIST/f)
esc=html.escape
WORDS={
 'decks':('Mazzi','Decks'),'collection':('Collezione','Collection'),'journal':('Diario','Journal'),'guides':('Guide','Guides'),'skip':('Vai al contenuto','Skip to content'),'index':('Indice','Contents'),'top':('Torna all’inizio','Back to top'),
 'home_title':('I mazzi, e quello<br/><i>che mi insegnano.</i>','Decks, and what<br/><i>they teach me.</i>'),'home_intro':('Liste, cambi di idea e serate al tavolo. La storia dei miei mazzi di Magic, una versione alla volta.','Lists, changes of mind and nights at the table. The story of my Magic decks, one version at a time.'),
 'active':('Attivo','Active'),'archived':('Archiviato','Archived'),'incomplete':('Incompleto','Incomplete'),'proposal':('Proposta','Proposal'),'current':('Preparato','Prepared'),'planned':('In programma','Planned'),'reported':('Resoconto','Reported'),'preparation':('Preparazione','Preparation'),
 'latest_saved':('Ultima lista conservata','Latest saved list'),'latest':('La lista attuale','Current list'),'history':('Storia del mazzo','Deck history'),'read_guide':('Apri la guida','Read the guide'),'upcoming':('La prossima serata','Next session'),'recent':('Ultime dal diario','Latest journal entries'),'all_decks':('Tutti i mazzi','All decks'),'archive_intro':('Mazzi attivi e liste conservate. Ogni snapshot mantiene la propria data, anche quando il mazzo cambia.','Active decks and preserved lists. Each snapshot keeps its own date, even as the deck changes.'),
 'filter_decks':('Mostra i mazzi','Show decks'),'all':('Tutti','All'),'versions':('Versioni conservate','Preserved versions'),'view_version':('Apri questa versione','Open this version'),'main':('Main deck','Main deck'),'side':('Sideboard','Sideboard'),'download_list':('Scarica la lista','Download the list'),'compare':('Cosa è cambiato','What changed'),'from_previous':('Rispetto alla versione precedente','Compared with the previous version'),'in':('Dentro','In'),'out':('Fuori','Out'),'unchanged':('Nessuna modifica','No changes'),'first_version':('Prima lista conservata per questo mazzo.','First preserved list for this deck.'),
 'recorded_count':('Conteggio delle righe conservate','Count of the preserved rows'),'source_count':('Conteggio dichiarato nel documento','Count stated in the document'),'not_current':('Snapshot storico: non è una raccomandazione di legalità attuale.','Historical snapshot: not a recommendation about current legality.'),
 'sessions':('Serate collegate','Related sessions'),'none_sessions':('Non ci sono ancora resoconti collegati a questo mazzo.','No session reports are linked to this deck yet.'),'journal_intro':('Risultati, preparazione e cose da ricordare. Una serata resta legata alla sua lista quando quella versione è stata conservata.','Results, preparation and lessons worth keeping. A session stays linked to its list when that version has been preserved.'),
 'no_result':('Nessun risultato registrato','No result recorded'),'prepared_list':('Lista preparata per la serata','List prepared for this session'),'played_list':('Lista usata nella serata','List used in this session'),'unknown_list':('La lista esatta della serata non è stata conservata.','The exact list used in this session was not preserved.'),'notes':('Cosa resta della serata','Notes from the session'),'read_entry':('Leggi il resoconto','Read the entry'),
 'guide_intro':('Guide pratiche legate a una versione del mazzo. Da leggere al telefono, oppure da scaricare in PDF.','Practical guides tied to a deck version. Read on your phone or download as a PDF.'),'guide_title':('Mono Green<br/><i>Landfall.</i>','Mono Green<br/><i>Landfall.</i>'),'guide_sub':('La guida per sederti al tavolo con un piano. Dodici mani iniziali, le interazioni del mazzo e la side, carta per carta.','A guide to sitting down with a plan. Twelve opening hands, the deck’s interactions and its sideboard, card by card.'),'guide_nav':('In questa guida','In this guide'),'pdf':('Scarica PDF italiano','Download English PDF'),'pdf_short':('PDF italiano','English PDF'),'hands_title':('Hai sette carte.<br/>Le tieni?','Seven cards.<br/>Do you keep?'),'hands_intro':('Apri un esempio per vedere le sette carte, la scelta e i primi turni. Tutte le mani usano carte della versione conservata.','Open an example to see all seven cards, the decision and the first turns. Every hand uses cards from the preserved version.'),'hands_count':('12 esempi','12 examples'),'hands_nav':('12 mani iniziali','12 opening hands'),'filter_hands':('Mostra gli esempi','Show examples'),'all_hands':('Tutte le mani','All hands'),'keep':('Da tenere','Keep'),'mulligan':('Da cambiare','Mulligan'),'depends':('Dipende dal matchup','Depends on the matchup'),'examples_visible':('esempi visibili','examples visible'),'why':('Perché','Why'),'line':('Come partire','Opening sequence'),'london':('Dopo un mulligan peschi di nuovo sette. Quando decidi di tenere, ne metti una in fondo per ogni mulligan fatto.','After a mulligan, draw seven again. Once you decide to keep, put one card on the bottom for each mulligan taken.'),
 'snapshot_guide':('Guida della versione del 10 settembre 2026','Guide for the September 10, 2026 version'),'related':('Da dove arriva','Where it came from'),'version_date':('Versione del','Version dated'),'footer':('Moxie raccoglie la storia dei miei mazzi. Le liste storiche e i resoconti incompleti mantengono i loro limiti.','Moxie collects the history of my decks. Historical lists and incomplete reports retain their limitations.'),'disclaimer':('Guida indipendente, non affiliata a Wizards of the Coast. Magic: The Gathering è un marchio di Wizards of the Coast.','Independent guide, not affiliated with Wizards of the Coast. Magic: The Gathering is a trademark of Wizards of the Coast.'),'counts_unit':('carte','cards'),'visit_deck':('Vai al mazzo','View deck'),'no_stats':('I resoconti disponibili non bastano per calcolare statistiche complessive attendibili.','The available reports are not enough to calculate reliable overall statistics.'),'language':('Lingua','Language')}
def t(k,l):return WORDS[k][0 if l=='it' else 1]
def tx(x,l):return x[l] if isinstance(x,dict) else x
SLUGS={'collection':{'it':'collezione','en':'collection'}}
def lpath(k,l):return SLUGS[k][l] if k in SLUGS else k
def route(l,path=''):return '/'+l+'/'+path.strip('/')+('/' if path.strip('/') else '')
def deckpath(d):return 'decks/'+d['id']
def versionpath(v):return 'decks/'+v['deck_id']+'/versions/'+v['id']
def eventpath(e):return 'journal/'+e['id']
def guidepath():return 'guides/mono-green-landfall'
def currentguidepath():return DECKS['mono-green-landfall'].get('guide_path',guidepath())
def a(u,label,cl=''):return f'<a class="{cl}" href="{esc(u,quote=True)}">{label}</a>'
def badge(status,l):return f'<span class="status {status}">{t(status,l)}</span>'
def dates(date,l):
 year,month,day=date.split('-');months={'it':['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'],'en':['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']}
 return (f'{int(day)} {months[l][int(month)-1]} {year}' if l=='it' else f'{months[l][int(month)-1]} {int(day)}, {year}')
ROUTES={}
def theme(d):return 'theme-'+''.join(d['colors']).lower()
def shell(l,path,title,body,nav=None,section='',deck_id=None,paths=None):
 paths=paths or {'it':path,'en':path};path=paths[l]
 page_theme=('deck-theme '+theme(DECKS[deck_id])) if deck_id else ''
 other='en' if l=='it' else 'it';canonical='https://moxie.jaack.me'+route(l,paths[l])
 langs=''.join(f'<a data-language href="{route(ll,paths[ll])}" lang="{ll}" hreflang="{ll}"'+(' aria-current="page"' if ll==l else '')+f'>{ll.upper()}</a>' for ll in ['it','en'])
 globalnav=''.join(a(route(l,lpath(k,l)),t(k,l),'selected' if section==k else '') for k in ['decks','journal','guides','collection'])
 toc=''
 if nav:
  links='<nav aria-label="'+t('index',l)+'">'+''.join(a('#'+key,esc(label)) for key,label in nav)+'</nav>'
  toc=f'<details class="mobile-menu"><summary>{t("index",l)}</summary>{links}</details>'
  left=f'<aside class="sidebar"><p>{t("guide_nav",l)}</p>{links}</aside>'
 else:left=''
 document=f'''<!doctype html><html lang="{l}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#0c0c0c"><meta name="description" content="{esc(title,quote=True)} - Moxie"><title>{esc(title)} | Moxie</title><link rel="canonical" href="{canonical}"><link rel="alternate" hreflang="it" href="https://moxie.jaack.me{route('it',paths['it'])}"><link rel="alternate" hreflang="en" href="https://moxie.jaack.me{route('en',paths['en'])}"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css"><script src="/app.js" defer></script><script src="/cards.js" defer></script>{'<script src="/moxie-collection.js" defer></script>' if section=='collection' else ''}</head><body id="top" class="{page_theme}" data-lang="{l}" data-page="{esc(path or 'home',quote=True)}"><a class="skip" href="#content">{t('skip',l)}</a><header class="hub-header"><div class="header-inner"><a class="brand" href="{route(l)}">moxie<span aria-hidden="true">.</span></a><nav class="global-nav" aria-label="Moxie">{globalnav}</nav><nav class="language" aria-label="{t('language',l)}">{langs}</nav></div></header>{toc}<div class="layout {'with-toc' if nav else 'hub-layout'}">{left}<main id="content">{body}<footer><p>{'Aggiornato il' if l=='it' else 'Updated'} {dates(H['updated'],l)} · IT | EN</p><p>{t('footer',l)}</p><p>{t('disclaimer',l)}</p></footer></main></div><a class="backtop" href="#top" aria-label="{t('top',l)}">↑</a></body></html>'''
 out=DIST/l/path/'index.html' if path else DIST/l/'index.html';out.parent.mkdir(parents=True,exist_ok=True);out.write_text(document);ROUTES[route(l,path)]=out
 return document

def deckrow(d,l):
 v=VERS[d['latest_version']];count=f'{v["counts"]["main"]} + {v["counts"]["side"]}'
 return f'<article class="archive-row {theme(d)}" data-status="{d["status"]}"><div class="row-meta">{badge(d["status"],l)}<span>{esc(tx(d["format"],l))}</span><span>{count}</span></div><h2>{a(route(l,deckpath(d)),esc(d["name"]))}</h2><p>{esc(tx(d["summary"],l))}</p><span class="small">{dates(v["date"],l)}</span></article>'
def eventrow(e,l):
 result=tx(e['result'],l) if e['result'] else t('no_result',l)
 deck_theme=theme(DECKS[e['deck_id']]) if e.get('deck_id') else ''
 venue=f'<p>{esc(e["venue"])}</p>' if e.get('venue') else ''
 return f'<article class="journal-row {deck_theme}"><div class="row-meta"><time datetime="{e["date"]}">{dates(e["date"],l)}</time>{badge(e["status"],l)}</div><h3>{a(route(l,eventpath(e)),esc(tx(e["title"],l)))}</h3>{venue}<p>{esc(tx(e["summary"],l))}</p><span class="small">{esc(result)}</span></article>'
def board_html(b,l,label):
 return card_browser(b,l,label)
def sortedversions(did):return sorted([v for v in VERS.values() if v['deck_id']==did],key=lambda v:(v['date'],{'archived':0,'incomplete':0,'proposal':1,'current':2}[v['status']]))
def changes(v,l):
 vs=sortedversions(v['deck_id']);ix=vs.index(v)
 if ix==0:return '<p class="small">'+t('first_version',l)+'</p>'
 old=vs[ix-1];out=f'<p class="small">{t("from_previous",l)}: {a(route(l,versionpath(old)),esc(tx(old["label"],l)))}</p>'
 for board,key in [('mainboard','main'),('sideboard','side')]:
  ins={n:v[board].get(n,0)-old[board].get(n,0) for n in set(v[board])|set(old[board]) if v[board].get(n,0)>old[board].get(n,0)};outs={n:old[board].get(n,0)-v[board].get(n,0) for n in set(v[board])|set(old[board]) if old[board].get(n,0)>v[board].get(n,0)}
  out+='<h3>'+t(key,l)+'</h3>'
  if not ins and not outs:out+='<p>'+t('unchanged',l)+'</p>'
  for label,items,sign in [('in',ins,'+'),('out',outs,'−')]:
   if items:out+='<p><strong>'+t(label,l)+':</strong> '+', '.join(f'{sign}{q} {esc(n)}' for n,q in sorted(items.items()))+'</p>'
 return out

def render_guide(l):
 g=G[l];blocksout=[]
 def prose(x):
  pairs={'it': [('I piani alle pagine 15-17','I piani nelle sezioni della side'),('di pagina 16','nella sezione mazzi blu'),('pagine 18-23','<a href="#hands">esempi di mani iniziali</a>')], 'en':[('pages 15-17','the sideboard sections'),('page 16','the blue-decks section'),('pages 18-23','<a href="#hands">opening-hand examples</a>')]}
  for x1,x2 in pairs[l]:x=x.replace(x1,x2)
  return x
 nav=[('hands',t('hands_nav',l))]
 for pg in g['pages']:
  if pg['key']=='index' or pg['key'].startswith('hands-'):continue
  nav.append((pg['key'],pg['title']));bs=[];rows=[]
  def flush():
   if rows:bs.append('<ul class="deck-list">'+''.join(rows)+'</ul>');rows.clear()
  for kind,x in pg['blocks']:
   if kind=='row':
    q,n,u=x;rows.append(f'<li><span class="quantity">{q}</span><a target="_blank" rel="noopener noreferrer" href="{esc(u,quote=True)}">{esc(n)}</a></li>');continue
   flush()
   if kind=='heading':bs.append('<h3>'+esc(x)+'</h3>')
   elif kind=='box':bs.append('<aside class="note">'+prose(x)+'</aside>')
   elif kind=='ref':bs.append(f'<p class="reference"><a href="{esc(x[1],quote=True)}" target="_blank" rel="noopener noreferrer">{esc(x[0])} ↗</a></p>')
   elif kind in ['body','small','plan']:bs.append(f'<p class="{kind}">'+prose(x)+'</p>')
  flush()
  content=''.join(bs)
  if pg['key'] in ['main','side']:
   board_name='mainboard' if pg['key']=='main' else 'sideboard'
   content=card_browser({n:x['quantity'] for n,x in g['deck'][board_name].items()},l,t(pg['key'],l),content)
  blocksout.append(f'<section class="chapter" id="{pg["key"]}"><h2>{esc(pg["title"])}</h2>'+content+'</section>')
 hands=[]
 for i,h in enumerate(g['hands'],1):
  verdict=h['verdict'];category='depends' if verdict in ['DIPENDE','DEPENDS'] else 'mulligan' if verdict=='MULLIGAN' else 'keep';cards=''.join(f'<li><span>{q}</span> {esc(n.split(" //")[0])}</li>' for n,q in Counter(h['cards']).items())
  hands.append(f'<details class="hand" data-verdict="{category}" id="hand-{h["id"]}"><summary><span class="hand-number">{i:02}</span><span class="hand-title">{esc(h["title"])}</span><span class="verdict {category}">{esc(verdict)}</span></summary><div class="hand-body"><p class="context">{esc(h["context"])}</p><ul class="hand-cards">{cards}</ul><p><strong>{t("why",l)}.</strong> {esc(h["reason"])}</p><p><strong>{t("line",l)}.</strong> {esc(h["line"])}</p><aside class="note">{esc(h["lesson"])}</aside></div></details>')
 handsection=f'<section id="hands" class="chapter"><div class="section-heading"><h2>{t("hands_title",l)}</h2><span class="counter">{t("hands_count",l)}</span></div><p>{t("hands_intro",l)}</p><label class="filter-label" for="hand-filter">{t("filter_hands",l)}</label><select id="hand-filter" data-filter="hands"><option value="all">{t("all_hands",l)}</option><option value="keep">{t("keep",l)}</option><option value="mulligan">{t("mulligan",l)}</option><option value="depends">{t("depends",l)}</option></select><p id="hand-count" class="small" aria-live="polite">12 {t("examples_visible",l)}</p>'+''.join(hands)+f'<p class="small">{t("london",l)}</p></section>'
 v=VERS['mono-green-2026-09-10-warg']
 intro=f'<header class="intro"><p class="breadcrumb">{a(route(l,"guides"),t("guides",l))} / Mono Green Landfall</p><h1>{t("guide_title",l)}</h1><p>{t("guide_sub",l)}</p><p class="small">{a(route(l,versionpath(v)),t("snapshot_guide",l))}</p><div class="actions">{a("#hands",t("hands_nav",l),"button primary")}{a("/"+PDF[l],t("pdf",l)+" · 24", "button")}</div></header>'
 if currentguidepath()!=guidepath():
  message={'it':'Questa guida e i PDF descrivono la lista del 10 settembre. La side attuale contiene 2 Torpor Orb al posto di 2 Warg Tactics: usa il nuovo piano del 1 ottobre.','en':'This guide and its PDFs describe the September 10 list. The current sideboard has 2 Torpor Orb instead of 2 Warg Tactics: use the new October 1 plan.'}
  intro+='<aside class="note"><p>'+message[l]+'</p>'+a(route(l,currentguidepath()),'Torpor Orb · 1 ottobre 2026' if l=='it' else 'Torpor Orb · October 1, 2026','button primary')+'</aside>'
 return shell(l,guidepath(),'Mono Green Landfall - '+t('guides',l),intro+handsection+''.join(blocksout),nav,'guides',deck_id='mono-green-landfall')

def render_current_guide(l):
 d=DECKS['mono-green-landfall'];v=VERS[d['latest_version']]
 title={'it':'Mono Green Landfall: il piano con Torpor Orb','en':'Mono Green Landfall: the Torpor Orb plan'}
 intro=f'<header class="intro"><p class="breadcrumb">{a(route(l,"guides"),t("guides",l))} / Mono Green Landfall</p><h1 class="version-title">{title[l]}</h1><p>{dates(v["date"],l)} · 60 + 15</p><aside class="note">{esc(tx(v["note"],l))}</aside><div class="actions">{a(route(l,versionpath(v)),t("latest",l),"button primary")}{a("/versions/"+v["id"]+".txt",t("download_list",l),"button")}</div></header>'
 nav=[];sections=[]
 for section in d['guide_sections']:
  key=section['id'];label=tx(section['title'],l);nav.append((key,label))
  sections.append(f'<section class="chapter" id="{key}"><h2>{esc(label)}</h2>'+''.join('<p>'+esc(tx(p,l))+'</p>' for p in section['paragraphs'])+'</section>')
 for board,key in [('mainboard','main'),('sideboard','side')]:
  label=t(key,l);nav.append((key,label));sections.append(f'<section class="chapter" id="{key}"><h2>{label} · {v["counts"][key]}</h2>{board_html(v[board],l,label)}</section>')
 references={'it':'Carte e regole','en':'Cards and rules'};nav.append(('references',references[l]))
 sources=[('Torpor Orb · Mystery Booster 2 #236','https://scryfall.com/card/mb2/236/torpor-orb'),('Sunderflock','https://scryfall.com/card/ecl/74/sunderflock'),('Leatherhead, Swamp Stalker','https://scryfall.com/card/tmt/117/leatherhead-swamp-stalker'),('Wizards · Torpor Orb','https://magic.wizards.com/en/news/feature/outlaws-of-thunder-junction-release-notes'),('Wizards · Saga chapters','https://magic.wizards.com/en/news/feature/final-fantasy-mechanics')]
 sections.append('<section class="chapter" id="references"><h2>'+references[l]+'</h2>'+''.join('<p>'+a(u,esc(label))+'</p>' for label,u in sources)+'</section>')
 archive={'it':'Mani iniziali e guida del 10 settembre','en':'Opening hands and the September 10 guide'}
 sections.append('<section class="chapter"><h2>'+archive[l]+'</h2><p>'+('Il main è invariato. Gli esempi di mani restano utili; per la side usa il piano aggiornato sopra.' if l=='it' else 'The main is unchanged. The opening-hand examples remain useful; use the updated plan above for the sideboard.')+'</p>'+a(route(l,guidepath())+'#hands',t('hands_nav',l),'button')+'</section>')
 shell(l,currentguidepath(),title[l],intro+''.join(sections),nav,'guides',deck_id=d['id'])

def money(x,l):
 if x is None:return '—'
 s=f'{x:,.2f}'
 return ('€ '+s.replace(',','X').replace('.',',').replace('X','.')) if l=='it' else '€'+s
def render_collection(l):
 c=CC[l];T=COLL['totals'];asof=COLL.get('prices_as_of')
 finish=lambda f:c[f]
 stat=lambda v,label,cl='':f'<div class="stat {cl}"><strong>{v}</strong><span>{label}</span></div>'
 asof_txt=(c['prices_as_of']+' '+dates(asof,l)) if asof else c['price_note']
 totals='<div class="collection-totals" aria-label="'+esc(c['title'],quote=True)+'">'+stat(f"{T['cards']:,}".replace(',','.' if l=='it' else ','),c['cards'])+stat(T['unique'],c['unique'])+stat(T['sets'],c['sets'])+stat(money(T['value_eur'],l),c['total'],'stat-value')+'</div>'
 note=f'<p class="small collection-note">{esc(asof_txt)}. {esc(c["price_note"])}'+(f' {T["unpriced_cards"]} {esc(c["unpriced"])}.' if T['unpriced_cards'] else '')+'</p>'
 deckname={d['id']:d['name'] for d in H['decks']}
 head=''.join(f'<th scope="col"{" class=num" if k in ("qty","price","value") else ""}>{esc(c[k])}</th>' for k in ['name','set','number','finish','language','qty','price','value'])
 rows=[]
 for x in COLL['cards']:
  flag=' <span class="price-flag" title="'+esc(c['snapshot_note'],quote=True)+'">*</span>' if x['price_source']=='snapshot' else ''
  decks=(' <span class="deck-tags">'+' · '.join(esc(deckname[d]) for d in x['decks'])+'</span>') if x['decks'] else ''
  rows.append(f'<tr><th scope="row"><a href="{esc(x["scryfall_uri"],quote=True)}" target="_blank" rel="noopener noreferrer">{esc(x["name"])}</a>{decks}</th><td><abbr title="{esc(COLL["sets"].get(x["set"],x["set"]),quote=True)}">{esc(x["set"].upper())}</abbr></td><td>{esc(x["collector_number"])}</td><td>{esc(finish(x["finish"]))}</td><td>{esc(c["languages"].get(x["language"],x["language"]))}</td><td class="num">{x["count"]}</td><td class="num">{money(x["price_eur"],l)}{flag}</td><td class="num">{money(x["value_eur"],l)}</td></tr>')
 table=f'<div class="collection-table-wrap"><table class="collection-table"><thead><tr>{head}</tr></thead><tbody>'+''.join(rows)+'</tbody></table></div>'
 copy=json.dumps({k:v for k,v in c.items()},ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
 decks=json.dumps(deckname,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
 body=f'<header class="intro"><h1>{esc(c["title"])}</h1><p>{esc(c["intro"])}</p></header>{totals}{note}<section class="collection" data-collection data-src="/collection.json" id="collection"><script type="application/json" class="collection-copy">{copy}</script><script type="application/json" class="collection-decks">{decks}</script><div class="collection-app" hidden></div><p class="collection-status small" role="status" aria-live="polite"></p><div class="collection-static">{table}</div></section>'
 shell(l,lpath('collection',l),c['nav'],body,section='collection',paths={'it':lpath('collection','it'),'en':lpath('collection','en')})

for l in ['it','en']:
 active=DECKS['mono-green-landfall'];cv=VERS[active['latest_version']]
 intro=f'<header class="intro home-intro"><h1>{t("home_title",l)}</h1><p>{t("home_intro",l)}</p></header>'
 feature=f'<section class="chapter"><div class="row-meta">{badge("active",l)}<span>Standard · 60 + 15</span></div><h2>Mono Green Landfall</h2><p>{esc(tx(active["summary"],l))}</p><div class="actions">{a(route(l,currentguidepath()),t("read_guide",l),"button primary")}{a(route(l,deckpath(active)),t("history",l),"button")}</div></section>'
 upcoming_events=[e for e in H['events'] if e['status']=='planned' and e['date']>=H['updated']]
 upcoming=f'<section class="chapter"><h2>{t("upcoming",l)}</h2>{eventrow(upcoming_events[0],l)}</section>' if upcoming_events else ''
 latest=f'<section class="chapter"><h2>{t("recent",l)}</h2>'+''.join(eventrow(e,l) for e in H['events'][:3] if e['status']!='planned')+a(route(l,'journal'),t('journal',l)+' →')+'</section>'
 home=shell(l,'',t('decks',l),intro+feature+upcoming+latest)
 if l=='it':(DIST/'index.html').write_text(home)
 body=f'<header class="intro"><h1>{t("decks",l)}.</h1><p>{t("archive_intro",l)}</p></header><label class="filter-label" for="deck-filter">{t("filter_decks",l)}</label><select id="deck-filter" data-filter="decks">'+''.join(f'<option value="{k}">{t(k,l)}</option>' for k in ['all','active','archived','incomplete'])+'</select><div class="deck-archive">'+''.join(deckrow(d,l) for d in H['decks'])+'</div>'
 shell(l,'decks',t('decks',l),body,section='decks')
 shell(l,'journal',t('journal',l),f'<header class="intro"><h1>{t("journal",l)}.</h1><p>{t("journal_intro",l)}</p></header>'+''.join(eventrow(e,l) for e in H['events'])+f'<p class="small">{t("no_stats",l)}</p>',section='journal')
 current=f'<article class="archive-row"><div class="row-meta"><span>{dates(cv["date"],l)}</span><span>60 + 15</span></div><h2>{a(route(l,currentguidepath()),"Mono Green Landfall · Torpor Orb")}</h2><p>{esc(tx(active["summary"],l))}</p>{a(route(l,currentguidepath()),t("read_guide",l),"button primary")}</article>' if currentguidepath()!=guidepath() else ''
 shell(l,'guides',t('guides',l),f'<header class="intro"><h1>{t("guides",l)}.</h1><p>{t("guide_intro",l)}</p></header>'+current+f'<article class="archive-row"><div class="row-meta"><span>10 / 09 / 2026</span><span>60 + 15</span></div><h2>{a(route(l,guidepath()),"Mono Green Landfall · 10 / 09 / 2026")}</h2><p>{t("guide_sub",l)}</p><div class="actions">{a(route(l,guidepath()),t("read_guide",l),"button")}{a("/"+PDF[l],t("pdf",l),"button")}</div></article>',section='guides')
 for d in H['decks']:
  v=VERS[d['latest_version']];body=f'<p class="breadcrumb">{a(route(l,"decks"),t("decks",l))}</p><header class="intro"><div class="row-meta">{badge(d["status"],l)}<span>{esc(tx(d["format"],l))}</span></div><h1>{esc(d["name"])}</h1><p>{esc(tx(d["story"],l))}</p><div class="actions">{a(route(l,versionpath(v)),t("latest" if d["status"]=="active" else "latest_saved",l),"button primary")}'
  if d.get('guide'):body+=a(route(l,currentguidepath()),t('read_guide',l),'button')
  body+=a('#cards',CARD_COPY[l]['explore'],'button')
  body+='</div></header><section class="chapter" id="cards"><h2>'+CARD_COPY[l]['explore']+'</h2><h3>'+t('main',l)+'</h3>'+board_html(v['mainboard'],l,t('main',l))+'<h3>'+t('side',l)+'</h3>'+board_html(v['sideboard'],l,t('side',l))+'</section><section class="chapter"><h2>'+t('versions',l)+'</h2>'
  for vv in reversed(sortedversions(d['id'])):body+=f'<article class="version-row"><div class="row-meta"><time>{dates(vv["date"],l)}</time>{badge(vv["status"],l)}<span>{vv["counts"]["main"]} + {vv["counts"]["side"]}</span></div><h3>{a(route(l,versionpath(vv)),esc(tx(vv["label"],l)))}</h3><p>{esc(tx(vv["note"],l))}</p></article>'
  body+='</section><section class="chapter"><h2>'+t('sessions',l)+'</h2>';events=[e for e in H['events'] if e['deck_id']==d['id']];body+=''.join(eventrow(e,l) for e in events) if events else '<p>'+t('none_sessions',l)+'</p>';body+='</section>'
  if d['related']:body+='<section class="chapter"><h2>'+t('related',l)+'</h2>'+''.join(a(route(l,deckpath(DECKS[x])),esc(DECKS[x]['name']),'button') for x in d['related'])+'</section>'
  shell(l,deckpath(d),d['name'],body,section='decks',deck_id=d['id'])
 for v in VERS.values():
  d=DECKS[v['deck_id']];path=versionpath(v);note=esc(tx(v['note'],l));body=f'<p class="breadcrumb">{a(route(l,deckpath(d)),esc(d["name"]))}</p><header class="intro"><div class="row-meta"><time>{dates(v["date"],l)}</time>{badge(v["status"],l)}</div><h1 class="version-title">{esc(tx(v["label"],l))}</h1><p>{v["counts"]["main"]} + {v["counts"]["side"]} {t("counts_unit",l)}</p><aside class="note">{note}</aside>{a("/versions/"+v["id"]+".txt",t("download_list",l),"button")}</header>'
  if v.get('declared_counts') and v['declared_counts']!=v['counts']:body+=f'<aside class="note"><strong>{t("recorded_count",l)}:</strong> {v["counts"]["main"]}+{v["counts"]["side"]}<br/><strong>{t("source_count",l)}:</strong> {v["declared_counts"]["main"]}+{v["declared_counts"]["side"]}</aside>'
  body+=f'<section class="chapter"><h2>{t("compare",l)}</h2>{changes(v,l)}</section><section class="chapter" id="main"><h2>{t("main",l)} · {v["counts"]["main"]}</h2>{board_html(v["mainboard"],l,t('main',l))}</section><section class="chapter" id="side"><h2>{t("side",l)} · {v["counts"]["side"]}</h2>{board_html(v["sideboard"],l,t('side',l))}</section>'
  if d.get('guide') and v['id']==d['latest_version']:body+=a(route(l,currentguidepath()),t('read_guide',l),'button')
  shell(l,path,tx(v['label'],l),body,section='decks',deck_id=d['id'])
 for e in H['events']:
  d=DECKS[e['deck_id']] if e.get('deck_id') else None
  place=esc(e['venue']) if e.get('venue') else ''
  place+=(' · ' if place else '')+esc(e['time']) if 'time' in e else ''
  body=f'<p class="breadcrumb">{a(route(l,"journal"),t("journal",l))}</p><header class="intro"><div class="row-meta"><time>{dates(e["date"],l)}</time>{badge(e["status"],l)}</div><h1 class="version-title">{esc(tx(e["title"],l))}</h1>'+(f'<p>{place}</p>' if place else '')+'<p>'+esc(tx(e['summary'],l))+'</p></header>'
  if e['result']:body+='<aside class="note">'+esc(tx(e['result'],l))+'</aside>'
  else:body+='<p class="small">'+t('no_result',l)+'</p>'
  if e['version_id']:
   vv=VERS[e['version_id']];body+='<section class="chapter"><h2>'+t('prepared_list' if e['version_relation']=='prepared' else 'played_list',l)+'</h2>'+a(route(l,versionpath(vv)),esc(tx(vv['label'],l)),'button')+'</section>'
  else:body+='<aside class="note">'+t('unknown_list',l)+'</aside>'
  if e['notes']:body+='<section class="chapter"><h2>'+t('notes',l)+'</h2>'+''.join('<p>'+esc(tx(x,l))+'</p>' for x in e['notes'])+'</section>'
  if d:body+=a(route(l,deckpath(d)),t('visit_deck',l)+': '+esc(d['name']),'button')
  shell(l,eventpath(e),tx(e['title'],l),body,section='journal',deck_id=d['id'] if d else None)
 render_guide(l)
 if currentguidepath()!=guidepath():render_current_guide(l)
 render_collection(l)

(DIST/'versions').mkdir(exist_ok=True)
for v in VERS.values():(DIST/'versions'/(v['id']+'.txt')).write_text('Deck\n'+''.join(f'{q} {n}\n' for n,q in v['mainboard'].items())+'\nSideboard\n'+''.join(f'{q} {n}\n' for n,q in v['sideboard'].items()))
(DIST/'favicon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#0c0c0c"/><text x="10" y="45" font-family="Arial,sans-serif" font-size="44" font-weight="700" fill="#f0ede8">m<tspan fill="#e8c547">.</tspan></text></svg>')
palette={'W':'#e5d8af','U':'#80b5e8','B':'#b6b2c4','R':'#ed887c','G':'#7fc49a','C':'#bec3c7'}
themes=[]
for colors in sorted({tuple(d['colors']) for d in H['decks']}):
 assert colors and all(c in palette for c in colors)
 shades=[palette[c] for c in colors];stripe=shades[0] if len(shades)==1 else 'linear-gradient(90deg,'+','.join(f'{color} {i*100/len(shades):g}% {(i+1)*100/len(shades):g}%' for i,color in enumerate(shades))+')'
 themes.append('.theme-'+''.join(colors).lower()+'{--accent:'+shades[0]+';--deck-stripe:'+stripe+'}')
(DIST/'style.css').write_text((P/'style.css').read_text()+(P/'hub.css').read_text()+(P/'cards.css').read_text()+(P/'moxie-collection.css').read_text()+'\n'+'\n'.join(themes))
(DIST/'app.js').write_text((P/'app.js').read_text())
(DIST/'cards.js').write_text((P/'cards.js').read_text())
(DIST/'moxie-collection.js').write_text((P/'moxie-collection.js').read_text())
(DIST/'collection.json').write_text(json.dumps(COLL,ensure_ascii=False,separators=(',',':')))
shutil.copy2(P/'card-images.json',DIST/'card-images.json')
(DIST/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: https://moxie.jaack.me/sitemap.xml\n')
(DIST/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>https://moxie.jaack.me'+u+'</loc></url>' for u in ROUTES)+'</urlset>')
config={'version':2,'framework':None,'buildCommand':None,'outputDirectory':'.','headers':[{'source':'/(.*)','headers':[{'key':'X-Content-Type-Options','value':'nosniff'},{'key':'Referrer-Policy','value':'strict-origin-when-cross-origin'},{'key':'Cache-Control','value':'public, max-age=0, must-revalidate'}]}]};(DIST/'vercel.json').write_text(json.dumps(config,indent=2))
(P/'routes.json').write_text(json.dumps(list(ROUTES),indent=2));(P/'build-manifest.json').write_text(json.dumps({str(f.relative_to(DIST)):hashlib.sha256(f.read_bytes()).hexdigest() for f in DIST.rglob('*') if f.is_file() and '.vercel' not in f.parts},indent=2))
print('Built',len(ROUTES),'localized pages;',len(VERS),'versions;',len(H['events']),'journal entries; IT + EN guides and PDFs; collection of',COLL['totals']['cards'],'cards')
