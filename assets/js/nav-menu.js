(function () {
  'use strict';
  var nav = document.querySelector('nav.site-nav');
  if (!nav) return;
  var button = nav.querySelector('.nav-menu-toggle');
  var sheet = nav.querySelector('.nav-row');
  if (!button || !sheet) return;
  var compact = false;
  var frame;
  var theme = nav.querySelector('[data-jk-theme-switch]');
  var items = [nav.querySelector('.jk-mark'), nav.querySelector('.nav-links'),
    nav.querySelector('.lang-switch'), theme];
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var open = false;
  var fade;

  function close(returnFocus) {
    var wasOpen = open;
    open = false;
    button.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-menu-open', 'is-menu-closing');
    clearTimeout(fade);
    sheet.inert = compact;
    if (compact) sheet.setAttribute('aria-hidden', 'true');
    else sheet.removeAttribute('aria-hidden');
    var duration = window.getComputedStyle(sheet).getPropertyValue('--jk-d-2').trim();
    var delay = reducedMotion.matches ? 0 : (/^\d+(?:\.\d+)?ms$/.test(duration) ? parseFloat(duration) : 200);
    if (wasOpen && compact && delay > 0) {
      nav.classList.add('is-menu-closing');
      fade = setTimeout(function () { nav.classList.remove('is-menu-closing'); }, delay);
    }
    if (wasOpen && returnFocus) button.focus();
  }

  button.addEventListener('click', function () {
    if (!compact) return;
    if (open) { close(true); return; }
    clearTimeout(fade);
    nav.classList.remove('is-menu-closing');
    open = true;
    sheet.inert = false;
    sheet.removeAttribute('aria-hidden');
    button.setAttribute('aria-expanded', 'true');
    nav.classList.add('is-menu-open');
    sheet.querySelector('a[href]').focus();
  });
  sheet.addEventListener('click', function (event) {
    if (event.target.closest('a[href]')) close(false);
  });
  function outside(event) {
    if (open && !nav.contains(event.target)) {
      // Keep the pointer's default focus action from undoing the return to Menu.
      if (event.type === 'pointerdown') event.preventDefault();
      close(true);
    }
  }
  document.addEventListener('pointerdown', outside);
  document.addEventListener('click', outside);
  document.addEventListener('keydown', function (event) {
    if (!open) return;
    if (event.key === 'Escape') { event.preventDefault(); close(true); }
    if (event.key !== 'Tab') return;
    var controls = [button].concat(Array.from(sheet.querySelectorAll('a[href], button:not([disabled])')));
    var index = controls.indexOf(document.activeElement);
    var next = (index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
    event.preventDefault();
    controls[next].focus();
  });
  function measure() {
    frame = null;
    // Restore the natural inline layout only for this synchronous measurement.
    // rAF restores compact styling before paint, including an open sheet.
    nav.classList.remove('is-compact');
    nav.classList.add('is-measuring');
    var style = window.getComputedStyle(nav);
    var available = nav.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    var needed = (items.length - 1) * (parseFloat(style.columnGap) || 0);
    items.forEach(function (item) {
      var itemStyle = window.getComputedStyle(item);
      needed += item.getBoundingClientRect().width + (parseFloat(itemStyle.marginLeft) || 0) +
        (parseFloat(itemStyle.marginRight) || 0);
    });
    nav.classList.remove('is-measuring');
    var next = needed > available;
    if (next) nav.classList.add('is-compact');
    if (next !== compact) {
      compact = next;
      close(false);
    }
  }
  function scheduleMeasure() {
    if (frame == null) frame = window.requestAnimationFrame(measure);
  }
  window.addEventListener('resize', scheduleMeasure);
  window.addEventListener('languageChanged', scheduleMeasure);
  if (window.ResizeObserver) {
    var observer = new window.ResizeObserver(scheduleMeasure);
    observer.observe(nav);
    observer.observe(theme);
  }
  // theme.js mounts at DOMContentLoaded; localization can change its text later.
  if (window.MutationObserver) {
    new window.MutationObserver(scheduleMeasure).observe(theme, {
      childList: true, subtree: true, characterData: true
    });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleMeasure);
  document.addEventListener('DOMContentLoaded', scheduleMeasure);
  nav.classList.add('has-menu');
  close(false);
  scheduleMeasure();
})();
