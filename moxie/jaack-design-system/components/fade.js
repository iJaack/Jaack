// Fade-in groups when they enter the viewport: opacity only (data never moves or scales). Skipped under reduced motion.
(function(){'use strict';
  var els=[].slice.call(document.querySelectorAll('.jk-fx'));var rm=false;try{rm=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
  if(rm||!window.IntersectionObserver){els.forEach(function(e){e.classList.add('in')});return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}})},{threshold:.15});els.forEach(function(e){io.observe(e)});
})();
