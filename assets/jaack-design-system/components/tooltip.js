// Tooltips.
// 1) Elements with data-jk-tip="text" get a glass tooltip on hover and keyboard focus.
// 2) JaackTip.scrub(box, n, html) turns a chart container into a scrubber: pointer x → index 0..n-1 → html(i) (return null to hide).
//    Text is inserted with textContent unless html() returns a DOM-safe string you built yourself — never pass untrusted input.
(function(root){'use strict';var T={};
  function make(host,wrap){var t=document.createElement('div');t.className='jk-tip jk-glass'+(wrap?' wrap':'');t.setAttribute('role','tooltip');host.appendChild(t);return t;}
  function pos(t,host,x,y){var w=t.offsetWidth,h=t.offsetHeight,W=host.clientWidth;var l=Math.max(0,Math.min(W-w,x-w/2));t.style.transform='translate('+l+'px,'+Math.max(0,y-h-10)+'px)';}
  T.scrub=function(box,n,html){box.classList.add('jk-tipwrap');var t=make(box),hr=document.createElement('div');hr.className='jk-hair';box.appendChild(hr);
    function mv(e){var r=box.getBoundingClientRect(),x=e.clientX-r.left,i=Math.max(0,Math.min(n-1,Math.floor(x/r.width*n)));var s=html(i);if(s==null){out();return;}
      t.innerHTML=s;t.classList.add('on');hr.classList.add('on');var cx=(i+.5)/n*r.width;hr.style.transform='translateX('+cx+'px)';pos(t,box,cx,24);}
    function out(){t.classList.remove('on');hr.classList.remove('on');}
    box.addEventListener('pointermove',mv);box.addEventListener('pointerdown',mv);box.addEventListener('pointerleave',out);};
  function attach(el){var host=el.offsetParent||document.body,t=null;
    function show(){if(!t){t=make(document.body,true);t.style.position='fixed';}t.textContent=el.getAttribute('data-jk-tip');var r=el.getBoundingClientRect();t.classList.add('on');
      var w=t.offsetWidth,l=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2));t.style.transform='translate('+l+'px,'+Math.max(8,r.top-t.offsetHeight-8)+'px)';el.setAttribute('aria-describedby',t.id||(t.id='jktip'+Math.random().toString(36).slice(2,8)));}
    function hide(){if(t)t.classList.remove('on');}
    el.addEventListener('mouseenter',show);el.addEventListener('mouseleave',hide);el.addEventListener('focus',show);el.addEventListener('blur',hide);
    addEventListener('keydown',function(e){if(e.key==='Escape')hide();});}
  root.JaackTip=T;
  document.addEventListener('DOMContentLoaded',function(){[].forEach.call(document.querySelectorAll('[data-jk-tip]'),attach);});
})(window);
