(function () {
  'use strict';
  customElements.whenDefined('beeline-button').then(function () {
    document.querySelectorAll('beeline-button').forEach(function (button) {
      var root = button.shadowRoot;
      if (!root || root.querySelector('style[data-jaack-beeline-skin]')) return;
      var style = document.createElement('style');
      style.setAttribute('data-jaack-beeline-skin', '');
      // Escape the attribute values so the stylesheet itself contains no hex colours.
      style.textContent = 'svg.trigger path[fill="\\23 1c7df9"], svg.trigger path[fill="\\23 fff"] { fill: var(--jk-ink-2); }\n' +
        'svg.trigger g > path:first-child { fill: none; stroke: var(--jk-hair-2); stroke-width: 1.5px; vector-effect: non-scaling-stroke; }';
      root.appendChild(style);
    });
  });
})();
