// Background parallax: the background (never the data) moves at 0.2× scroll, capped at 25 % of the viewport.
// Disabled below 768 px and under prefers-reduced-motion. No inline script needed: include with <script src defer>.
(function(){'use strict';
  var bg=document.querySelector('.jk-bg');if(!bg)return;
  var rm=function(){try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}};
  var tick=false;function upd(){tick=false;if(rm()||innerWidth<768){bg.style.transform='';return;}bg.style.transform='translate3d(0,'+(-Math.min(scrollY*.2,innerHeight*.25)).toFixed(1)+'px,0)';}
  addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(upd);}},{passive:true});addEventListener('resize',upd);upd();
})();
