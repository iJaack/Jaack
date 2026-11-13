(function () {
  'use strict';
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('img:is(.jk-photo-3x2, .jk-photo-4x5, .jk-photo-1x1)').forEach(function (image) {
    function reveal() { image.classList.add('is-loaded'); }
    image.addEventListener('load', reveal, { once: true });
    image.addEventListener('error', reveal, { once: true });
    // Complete includes cached successes and failures whose event already fired.
    if (image.complete || reducedMotion) reveal();
  });
})();
