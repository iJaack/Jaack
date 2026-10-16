"""Progressively enhanced card browsing shared by deck versions and guides."""
import html,json
COPY={
 'it':{'list':'Lista','gallery':'Galleria','deck':'Mazzo','view':'Vista delle carte','reference':'Immagini di riferimento; la stampa può differire dalle tue copie.','count':'{unique} carte diverse · {total} copie','loading':'','explore':'Esplora le carte'},
 'en':{'list':'List','gallery':'Gallery','deck':'Deck','view':'Card view','reference':'Reference images; the printing may differ from your copies.','count':'{unique} unique cards · {total} copies','loading':'','explore':'Explore the cards'}}
def card_browser(board,lang,label,listing=None):
 c=COPY[lang]
 if listing is None:listing='<ul class="deck-list">'+''.join(f'<li><span class="quantity">{q}</span><span>{html.escape(n)}</span></li>' for n,q in board.items())+'</ul>'
 data=json.dumps([{'name':n,'quantity':q} for n,q in board.items()],ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
 controls=''.join(f'<button type="button" data-card-view="{mode}" aria-pressed="{str(mode=="list").lower()}">{c[mode]}</button>' for mode in ['list','gallery','deck'])
 return f'''<div class="card-browser" data-board-label="{html.escape(label,quote=True)}"><script type="application/json" class="card-data">{data}</script><div class="card-toolbar" role="group" aria-label="{c['view']} - {html.escape(label,quote=True)}" hidden>{controls}</div><p class="card-summary">{c['count'].format(unique=len(board),total=sum(board.values()))}</p><p class="card-status" role="status" aria-live="polite"></p><div class="card-list-view">{listing}</div><div class="card-gallery" hidden></div><div class="card-deck" hidden></div><p class="small card-reference" hidden>{c['reference']}</p></div>'''
