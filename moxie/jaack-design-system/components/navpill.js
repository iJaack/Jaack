// Nav pill: <div class="jk-pill" role="group" aria-label="…"><button aria-pressed="true" data-v="a">A</button>…</div>
// JaackPill.init(el, onChange) wires keyboard (←/→), the sliding indicator and aria-pressed. Auto-inits [data-jk-pill].
(function(root){'use strict';var P={};
  P.init=function(el,on){if(!el||el._jk)return el&&el._jk;var ind=document.createElement('span');ind.className='jk-ind';ind.setAttribute('aria-hidden','true');el.insertBefore(ind,el.firstChild);
    var bs=[].slice.call(el.querySelectorAll('button'));
    function place(){var b=el.querySelector('button[aria-pressed="true"]')||bs[0];if(!b)return;ind.style.width=b.offsetWidth+'px';ind.style.transform='translateX('+b.offsetLeft+'px)';}
    function set(b,fire){bs.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});place();if(fire&&on)on(b.dataset.v,b);}
    el.addEventListener('click',function(e){var b=e.target.closest('button');if(b&&el.contains(b))set(b,true);});
    el.addEventListener('keydown',function(e){var i=bs.indexOf(document.activeElement);if(i<0)return;var j=e.key==='ArrowRight'?i+1:e.key==='ArrowLeft'?i-1:-1;if(j<0||j>=bs.length)return;e.preventDefault();bs[j].focus();set(bs[j],true);});
    addEventListener('resize',place);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(place);place();
    return el._jk={set:function(v){var b=bs.filter(function(x){return x.dataset.v===v})[0];if(b)set(b,false);},place:place};};
  root.JaackPill=P;
  document.addEventListener('DOMContentLoaded',function(){[].forEach.call(document.querySelectorAll('[data-jk-pill]'),function(el){P.init(el)});});
})(window);
