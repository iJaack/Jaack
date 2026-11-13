// Fade-in groups when they enter the viewport: opacity only (data never moves or scales). Fades remain under reduced motion, capped by the duration tokens.
(function(){'use strict';
  var els=[].slice.call(document.querySelectorAll('.jk-fx'));
  if(!window.IntersectionObserver){els.forEach(function(e){e.classList.add('in')});return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}})},{threshold:.15});els.forEach(function(e){io.observe(e)});
})();
