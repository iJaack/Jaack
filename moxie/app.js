// Progressive enhancement: navigation and all content remain available without JS.
const lang=document.documentElement.lang;
const legacy=['hands','main','side','opening','icetill','fetch','kill','wagon','esper','maduin','engines','lands','answers','matchups','ground','blue','control','check'];
if(document.body.dataset.page==='home'&&(legacy.includes(location.hash.slice(1))||location.hash.startsWith('#hand-'))){location.replace('/'+lang+'/guides/mono-green-landfall/'+location.hash);}
const hands=document.querySelector('#hand-filter');
if(hands)hands.addEventListener('change',()=>{let n=0;document.querySelectorAll('.hand').forEach(x=>{x.hidden=hands.value!=='all'&&x.dataset.verdict!==hands.value;if(!x.hidden)n++;});document.querySelector('#hand-count').textContent=n+' '+(lang==='it'?'esempi visibili':'examples visible');});
const decks=document.querySelector('#deck-filter');
if(decks)decks.addEventListener('change',()=>{document.querySelectorAll('.archive-row').forEach(x=>{x.hidden=decks.value!=='all'&&x.dataset.status!==decks.value;});});
document.querySelectorAll('.mobile-menu nav a').forEach(a=>a.addEventListener('click',()=>{document.querySelector('.mobile-menu').open=false;}));
document.querySelectorAll('[data-language]').forEach(a=>a.addEventListener('click',()=>{a.hash=location.hash;}));
function openHash(){
  let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
  const el=document.getElementById(id);if(!el)return;
  if(el.classList.contains('hand')){if(hands){hands.value='all';hands.dispatchEvent(new Event('change'));}el.open=true;}
  requestAnimationFrame(()=>el.scrollIntoView({block:'start',behavior:'instant'}));
}
window.addEventListener('hashchange',openHash);
window.addEventListener('pageshow',event=>{if(!event.persisted)openHash();});
openHash();
function paintThemeColor(){
  const meta=document.querySelector('meta[name="theme-color"]');
  if(!meta)return;
  meta.content=document.documentElement.dataset.theme==='dark'?'#121314':'#f7f5f0';
}
paintThemeColor();
window.addEventListener('jaacktheme',paintThemeColor);
