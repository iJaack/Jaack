/* Collection page: progressive enhancement over the static table in the HTML. */
(()=>{
'use strict';
const root=document.querySelector('[data-collection]');if(!root)return;
const it=document.documentElement.lang==='it';
let C,DECKS;try{C=JSON.parse(root.querySelector('.collection-copy').textContent);DECKS=JSON.parse(root.querySelector('.collection-decks').textContent);}catch{return;}
const app=root.querySelector('.collection-app'),status=root.querySelector('.collection-status'),fallback=root.querySelector('.collection-static');
const PAGE=96;
const nf=new Intl.NumberFormat(it?'it-IT':'en-GB',{style:'currency',currency:'EUR'});
const money=v=>v==null?'—':nf.format(v);
const int=new Intl.NumberFormat(it?'it-IT':'en-GB');
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const TYPES=['creature','planeswalker','battle','instant','sorcery','artifact','enchantment','land'];
const typeOf=t=>{const s=(t||'').toLowerCase().split('—')[0];return TYPES.filter(x=>s.includes(x));};
const colorOf=c=>c.colors.length>1?['M',...c.colors]:c.colors.length?c.colors:['C'];
const safeImage=u=>{try{const x=new URL(u);return x.protocol==='https:'&&x.hostname==='cards.scryfall.io'?u:null;}catch{return null;}};
const safePage=u=>{try{const x=new URL(u);return x.protocol==='https:'&&x.hostname==='scryfall.com'?u:null;}catch{return null;}};
let data,cards=[],shown=PAGE,view='list';
const state={q:'',set:'',color:'',type:'',rarity:'',finish:'',language:'',deck:'',sort:'name'};

function select(key,label,options){
 const wrap=el('label');wrap.append(el('span',null,label));const s=el('select');s.dataset.key=key;
 s.append(new Option(C.all,''));for(const [v,t] of options)s.append(new Option(t,v));
 s.addEventListener('change',()=>{state[key]=s.value;shown=PAGE;render();});wrap.append(s);return wrap;
}
function build(){
 const filters=el('div','collection-filters');
 const search=el('label','search');search.append(el('span',null,C.search));
 const input=el('input');input.type='search';input.placeholder=C.search_placeholder;input.autocomplete='off';
 let timer;input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>{state.q=input.value.trim().toLowerCase();shown=PAGE;render();},120);});
 search.append(input);filters.append(search);
 const has=k=>v=>cards.some(c=>k(c).includes(v));
 filters.append(
  select('set',C.set,Object.entries(data.sets).filter(([k])=>cards.some(c=>c.set===k)).map(([k,v])=>[k,`${v} (${k.toUpperCase()})`])),
  select('color',C.color,Object.entries(C.colors).filter(([k])=>has(colorOf)(k))),
  select('type',C.type,Object.entries(C.types).filter(([k])=>k==='other'?cards.some(c=>!typeOf(c.type_line).length):has(c=>typeOf(c.type_line))(k))),
  select('rarity',C.rarity,Object.entries(C.rarities).filter(([k])=>cards.some(c=>c.rarity===k))),
  select('finish',C.finish,['nonfoil','foil','etched'].filter(f=>cards.some(c=>c.finish===f)).map(f=>[f,C[f]])),
  select('language',C.language,[...new Set(cards.map(c=>c.language))].map(k=>[k||'none',C.languages[k]||k])),
  select('deck',C.deck,Object.entries(DECKS).filter(([k])=>cards.some(c=>c.decks.includes(k)))),
  (()=>{const w=el('label');w.append(el('span',null,C.sort));const s=el('select');s.dataset.key='sort';
   for(const k of ['name','set','mana','count','value'])s.append(new Option(C['sort_'+k],k));
   s.addEventListener('change',()=>{state.sort=s.value;shown=PAGE;render();});w.append(s);return w;})()
 );
 const bar=el('div','collection-bar');const count=el('p','collection-count');count.setAttribute('aria-live','polite');
 const toolbar=el('div','card-toolbar');toolbar.setAttribute('role','group');toolbar.setAttribute('aria-label',C.view);
 for(const v of ['list','grid']){const b=el('button',null,C[v]);b.type='button';b.dataset.view=v;b.setAttribute('aria-pressed',String(v===view));b.addEventListener('click',()=>{view=v;toolbar.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.view===v)));render();});toolbar.append(b);}
 const reset=el('button','collection-reset',C.reset);reset.type='button';
 reset.addEventListener('click',()=>{Object.assign(state,{q:'',set:'',color:'',type:'',rarity:'',finish:'',language:'',deck:''});input.value='';filters.querySelectorAll('select').forEach(s=>{s.value=s.dataset.key==='sort'?state.sort:'';});shown=PAGE;render();});
 bar.append(count,reset,toolbar);
 const results=el('div','collection-results');const more=el('div','collection-more');
 const moreButton=el('button','button',C.show_more);moreButton.type='button';moreButton.addEventListener('click',()=>{shown+=PAGE;render();});more.append(moreButton);
 app.append(filters,bar,results,more);
 return {count,results,more};
}
function matches(c){
 if(state.q&&!(c.name.toLowerCase().includes(state.q)||c.type_line.toLowerCase().includes(state.q)))return false;
 if(state.set&&c.set!==state.set)return false;
 if(state.color&&!colorOf(c).includes(state.color))return false;
 if(state.type){const t=typeOf(c.type_line);if(state.type==='other'?t.length:!t.includes(state.type))return false;}
 if(state.rarity&&c.rarity!==state.rarity)return false;
 if(state.finish&&c.finish!==state.finish)return false;
 if(state.language&&(c.language||'none')!==state.language)return false;
 if(state.deck&&!c.decks.includes(state.deck))return false;
 return true;
}
const byName=(a,b)=>a.name.localeCompare(b.name);
const SORTS={name:byName,set:(a,b)=>(data.sets[a.set]||a.set).localeCompare(data.sets[b.set]||b.set)||a.collector_number.localeCompare(b.collector_number,undefined,{numeric:true}),mana:(a,b)=>a.mana_value-b.mana_value||byName(a,b),count:(a,b)=>b.count-a.count||byName(a,b),value:(a,b)=>(b.value_eur??-1)-(a.value_eur??-1)||byName(a,b)};
function asset(c){const faces=c.faces.map(f=>({name:f.name,image:safeImage(f.image),small:safeImage(f.small)})).filter(f=>f.image&&f.small);return faces.length?{name:c.name,url:safePage(c.scryfall_uri)||'https://scryfall.com',faces}:null;}
function open(list,index,trigger){
 if(!window.MoxieCards)return;const items=[],assets={};
 list.forEach(c=>{const a=asset(c);if(a){items.push({name:c.key,quantity:c.count});assets[c.key]=a;}});
 const at=items.findIndex(x=>x.name===list[index].key);if(at>=0)window.MoxieCards.open(items,at,assets,trigger);
}
const meta=c=>`${c.set.toUpperCase()} #${c.collector_number} · ${C[c.finish]}${c.language?' · '+c.language.toUpperCase():''}`;
let ui;
function render(){
 const list=cards.filter(matches).sort(SORTS[state.sort]);
 const total=list.reduce((s,c)=>s+(c.value_eur||0),0),qty=list.reduce((s,c)=>s+c.count,0);
 ui.count.textContent=C.results.replace('{cards}',int.format(qty)).replace('{printings}',int.format(list.length)).replace('{value}',money(Math.round(total*100)/100));
 const page=list.slice(0,shown);ui.results.replaceChildren();
 if(!list.length){ui.results.append(el('p','small',C.no_results));}
 else if(view==='grid'){
  const grid=el('div','collection-grid');
  page.forEach((c,i)=>{const b=el('button','card-tile');b.type='button';b.setAttribute('aria-label',`${c.name}, ${c.count}×, ${meta(c)}, ${money(c.price_eur)}`);
   const a=asset(c);b.append(a&&window.MoxieCards?window.MoxieCards.picture(a.faces[0]):el('span','card-picture'));
   const label=el('span','card-label');label.append(el('span','card-count',`${c.count}×`));const name=el('span','card-name',c.name.split(' //')[0]);
   name.append(el('span','card-meta',meta(c)),el('span','card-meta card-price',`${money(c.price_eur)}${c.price_source==='snapshot'?' *':''}`));label.append(name);b.append(label);
   b.addEventListener('click',()=>open(page,i,b));grid.append(b);});
  ui.results.append(grid);
 }else{
  const wrap=el('div','collection-table-wrap'),table=el('table','collection-table'),thead=el('thead'),hr=el('tr');
  for(const k of ['name','set','number','finish','language','qty','price','value']){const th=el('th',['qty','price','value'].includes(k)?'num':null,C[k]);th.scope='col';hr.append(th);}
  thead.append(hr);const tb=el('tbody');
  page.forEach((c,i)=>{const tr=el('tr'),th=el('th');th.scope='row';const b=el('button',null,c.name);b.type='button';b.addEventListener('click',()=>open(page,i,b));th.append(b);
   if(c.decks.length)th.append(el('span','deck-tags',c.decks.map(d=>DECKS[d]||d).join(' · ')));tr.append(th);
   const abbr=el('abbr',null,c.set.toUpperCase());abbr.title=data.sets[c.set]||c.set;const td=el('td');td.append(abbr);tr.append(td);
   tr.append(el('td',null,c.collector_number),el('td',null,C[c.finish]),el('td',null,C.languages[c.language]||c.language),el('td','num',String(c.count)));
   const price=el('td','num',money(c.price_eur));if(c.price_source==='snapshot'){const f=el('span','price-flag',' *');f.title=C.snapshot_note;price.append(f);}
   tr.append(price,el('td','num',money(c.value_eur)));tb.append(tr);});
  table.append(thead,tb);wrap.append(table);ui.results.append(wrap);
 }
 ui.more.hidden=list.length<=shown;
}
status.textContent=C.loading;
fetch(root.dataset.src).then(r=>{if(!r.ok)throw Error('collection');return r.json();}).then(d=>{
 if(!d||!Array.isArray(d.cards))throw Error('format');data=d;cards=d.cards;
 ui=build();render();app.hidden=false;fallback.hidden=true;status.textContent='';
}).catch(()=>{status.textContent=C.error;});
})();
