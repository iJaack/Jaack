(function () {
  'use strict';
  var nav = document.querySelector('header.hub-header');
  if (!nav) return;
  var button = nav.querySelector('.nav-menu-toggle');
  var sheet = nav.querySelector('.hub-tools');
  if (!button || !sheet) return;
  var mobile = window.matchMedia('(max-width: 482.98px)');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var open = false;
  var fade;

  function close(returnFocus) {
    var wasOpen = open;
    open = false;
    button.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-menu-open', 'is-menu-closing');
    clearTimeout(fade);
    sheet.inert = mobile.matches;
    if (mobile.matches) sheet.setAttribute('aria-hidden', 'true');
    else sheet.removeAttribute('aria-hidden');
    var duration = window.getComputedStyle(sheet).getPropertyValue('--jk-d-2').trim();
    var delay = reducedMotion.matches ? 0 : (/^\d+(?:\.\d+)?ms$/.test(duration) ? parseFloat(duration) : 200);
    if (wasOpen && mobile.matches && delay > 0) {
      nav.classList.add('is-menu-closing');
      fade = setTimeout(function () { nav.classList.remove('is-menu-closing'); }, delay);
    }
    if (wasOpen && returnFocus) button.focus();
  }

  button.addEventListener('click', function () {
    if (!mobile.matches) return;
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
    if (event.target.closest('a[href]')) close(true);
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
  mobile.addEventListener('change', function () { close(false); });
  nav.classList.add('has-menu');
  close(false);
})();
