/* Card images are requested only after a reader chooses Gallery or Deck. */
(()=>{
'use strict';
const browsers=[...document.querySelectorAll('.card-browser')];if(!browsers.length)return;
const it=document.documentElement.lang==='it';
const text=it?{loading:'Caricamento delle carte…',error:'Immagini non disponibili. Puoi riprovare o usare la lista.',missing:'Immagine non disponibile',open:'Apri il mazzo',closeDeck:'Richiudi il mazzo',browse:'Scorri le carte',previous:'Carta precedente',next:'Carta successiva',close:'Chiudi',flip:'Gira carta',source:'Apri su Scryfall',of:'di',copies:'copie',reference:'Immagine di riferimento',front:'Fronte',back:'Retro'}:{loading:'Loading cards…',error:'Images are unavailable. Try again or use the list.',missing:'Image unavailable',open:'Open the deck',closeDeck:'Close the deck',browse:'Swipe through the cards',previous:'Previous card',next:'Next card',close:'Close',flip:'Flip card',source:'Open on Scryfall',of:'of',copies:'copies',reference:'Reference image',front:'Front',back:'Back'};
const copies=q=>q===1?(it?'copia':'copy'):text.copies;
const node=(tag,className,content)=>{const el=document.createElement(tag);if(className)el.className=className;if(content!==undefined)el.textContent=content;return el;};
const button=(label,className,action)=>{const el=node('button',className,label);el.type='button';if(action)el.addEventListener('click',action);return el;};
let assetPromise;
function assets(){if(!assetPromise)assetPromise=fetch('/card-images.json').then(r=>{if(!r.ok)throw Error('images');return r.json();}).then(data=>{for(const item of Object.values(data)){const sourceURL=new URL(item.url);if(sourceURL.protocol!=='https:'||sourceURL.hostname!=='scryfall.com')throw Error('source origin');if(!Array.isArray(item.faces)||!item.faces.length)throw Error('faces');for(const f of item.faces){for(const k of ['image','small']){const u=new URL(f[k]);if(u.protocol!=='https:'||u.hostname!=='cards.scryfall.io')throw Error('image origin');}}}return data;}).catch(e=>{assetPromise=null;throw e;});return assetPromise;}
function picture(face,eager=false){
 const wrap=node('span','card-picture');const img=node('img');img.width=672;img.height=936;img.alt=face.name;img.loading=eager?'eager':'lazy';img.decoding='async';
 img.src=face.image;const fallback=node('span','card-image-error',text.missing);fallback.hidden=true;
 img.addEventListener('error',()=>{img.hidden=true;fallback.hidden=false;});wrap.append(img,fallback);return wrap;
}
// One accessible lightbox per page, shared by all card lists.
const dialog=node('dialog','card-dialog');dialog.setAttribute('aria-labelledby','card-dialog-title');
const dialogHeader=node('div','card-dialog-header');const title=node('h2',null,'');title.id='card-dialog-title';
const closeButton=button('×','card-dialog-close',()=>dialog.close());closeButton.setAttribute('aria-label',text.close);dialogHeader.append(title,closeButton);
const imageArea=node('div','card-dialog-image');const caption=node('p','card-dialog-caption');caption.setAttribute('aria-live','polite');
const tools=node('div','card-dialog-tools');const previous=button('←','card-icon-button',()=>showCard(modalIndex-1));previous.setAttribute('aria-label',text.previous);
const flip=button(text.flip,'card-flip',()=>{faceIndex=faceIndex?0:1;paintModal();});
const next=button('→','card-icon-button',()=>showCard(modalIndex+1));next.setAttribute('aria-label',text.next);tools.append(previous,flip,next);
const source=node('a','card-source',text.source+' ↗');source.target='_blank';source.rel='noopener noreferrer';
dialog.append(dialogHeader,imageArea,caption,tools,source);document.body.append(dialog);
let modalCards=[],modalAssets={},modalIndex=0,faceIndex=0,opener=null;
function paintModal(){
 const card=modalCards[modalIndex],asset=modalAssets[card.name];if(!asset)return;
 const face=asset.faces[faceIndex]||asset.faces[0];title.textContent=face.name;imageArea.replaceChildren(picture(face,true));
 caption.textContent=`${card.quantity} ${copies(card.quantity)} · ${modalIndex+1} ${text.of} ${modalCards.length} · ${faceIndex?text.back:text.front}`;
 flip.hidden=asset.faces.length<2;flip.setAttribute('aria-pressed',String(faceIndex===1));previous.disabled=modalIndex===0;next.disabled=modalIndex===modalCards.length-1;
 source.href=asset.url;
}
function showCard(index){modalIndex=Math.max(0,Math.min(modalCards.length-1,index));faceIndex=0;paintModal();}
function openModal(cards,index,data,trigger){modalCards=cards;modalAssets=data;opener=trigger;showCard(index);dialog.showModal();document.documentElement.classList.add('card-modal-open');closeButton.focus();}
dialog.addEventListener('close',()=>{document.documentElement.classList.remove('card-modal-open');if(opener?.isConnected)opener.focus({preventScroll:true});imageArea.replaceChildren();});
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();showCard(modalIndex-1);}if(event.key==='ArrowRight'){event.preventDefault();showCard(modalIndex+1);}});
function tile(card,index,cards,data,kind='gallery'){
 const asset=data[card.name];const el=button('',kind==='gallery'?'card-tile':'deck-card');el.setAttribute('aria-label',`${card.name}, ${card.quantity} ${copies(card.quantity)}`);
 if(asset)el.append(picture(asset.faces[0]));else el.append(node('span','card-picture card-image-error',text.missing));
 const label=node('span','card-label');label.append(node('span','card-count',`${card.quantity}×`),node('span','card-name',card.name.split(' //')[0]));el.append(label);
 el.addEventListener('click',()=>openModal(cards,index,data,el));return el;
}
function deckView(host,cards,data){
 const stage=node('div','deck-stage');const cover=button('','deck-cover');cover.setAttribute('aria-label',text.open);cover.setAttribute('aria-expanded','false');
 const stack=node('span','deck-stack');stack.setAttribute('aria-hidden','true');
 cards.slice(0,3).forEach(card=>{const asset=data[card.name];if(asset)stack.append(picture({...asset.faces[0],image:asset.faces[0].small}));});
 cover.append(stack,node('span','deck-open-label',text.open+' →'));
 const panel=node('div','deck-panel');panel.hidden=true;
 const rail=node('div','deck-rail');rail.setAttribute('role','group');rail.setAttribute('aria-label',text.browse);rail.tabIndex=0;
 const nav=node('div','deck-controls');const prev=button('←','card-icon-button',()=>jump(active-1));prev.setAttribute('aria-label',text.previous);const count=node('span','deck-position');count.setAttribute('aria-live','polite');const forward=button('→','card-icon-button',()=>jump(active+1));forward.setAttribute('aria-label',text.next);
 const shut=button(text.closeDeck,'deck-shut',()=>{panel.hidden=true;cover.hidden=false;cover.setAttribute('aria-expanded','false');cover.focus({preventScroll:true});});nav.append(prev,count,forward);panel.append(rail,nav,shut);stage.append(cover,panel);host.append(stage);
 let active=0,ready=false,raf=0;
 function report(){count.textContent=`${active+1} ${text.of} ${cards.length}`;prev.disabled=active===0;forward.disabled=active===cards.length-1;}
 function jump(index){active=Math.max(0,Math.min(cards.length-1,index));const card=rail.children[active];if(card){const left=card.offsetLeft;rail.scrollTo({left,behavior:'instant'});}report();}
 cover.addEventListener('click',()=>{if(!ready){cards.forEach((card,i)=>rail.append(tile(card,i,cards,data,'deck')));ready=true;}cover.hidden=true;panel.hidden=false;cover.setAttribute('aria-expanded','true');report();rail.focus({preventScroll:true});requestAnimationFrame(()=>rail.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));});
 rail.addEventListener('scroll',()=>{if(raf)cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{const rr=rail.getBoundingClientRect();let best=Infinity;[...rail.children].forEach((c,i)=>{const delta=Math.abs(c.getBoundingClientRect().left-rr.left);if(delta<best){best=delta;active=i;}});report();});},{passive:true});
 rail.addEventListener('keydown',e=>{if(e.target!==rail)return;if(e.key==='ArrowRight'){e.preventDefault();jump(active+1);}if(e.key==='ArrowLeft'){e.preventDefault();jump(active-1);}});
 report();
}
for(const root of browsers){
 let cards;try{cards=JSON.parse(root.querySelector('.card-data').textContent);}catch{continue;}
 if(!Array.isArray(cards)||!cards.length)continue;
 const toolbar=root.querySelector('.card-toolbar');toolbar.hidden=false;
 const list=root.querySelector('.card-list-view'),gallery=root.querySelector('.card-gallery'),deck=root.querySelector('.card-deck'),status=root.querySelector('.card-status'),reference=root.querySelector('.card-reference');
 let mode='list',galleryReady=false,deckReady=false;
 async function setMode(value){mode=value;root.dataset.view=value;toolbar.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.cardView===value)));list.hidden=value!=='list';gallery.hidden=true;deck.hidden=true;reference.hidden=value==='list';status.textContent='';if(value==='list')return;
  status.textContent=text.loading;
  try{const data=await assets();if(mode!==value)return;if(cards.some(c=>!data[c.name]))throw Error('missing card');
   if(value==='gallery'){if(!galleryReady){cards.forEach((c,i)=>gallery.append(tile(c,i,cards,data)));galleryReady=true;}gallery.hidden=false;}
   else{if(!deckReady){deckView(deck,cards,data);deckReady=true;}deck.hidden=false;}
   status.textContent='';
  }catch{if(mode===value)status.textContent=text.error;}
 }
 toolbar.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.cardView)));
}
})();
