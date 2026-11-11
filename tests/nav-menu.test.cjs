const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('assets/js/nav-menu.js', 'utf8');

function load({ width = 700, linksWidth = 400, reduced = false, duration = '200ms' } = {}) {
  const classes = new Set();
  const listeners = {};
  const timers = new Map();
  const delays = [];
  const frames = [];
  const windowListeners = {};
  let resized, mounted, fontsReady;
  let document;
  function element(attrs = {}) {
    return {
      attrs, listeners: {},
      getAttribute(name) { return this.attrs[name]; },
      setAttribute(name, value) { this.attrs[name] = value; },
      removeAttribute(name) { delete this.attrs[name]; },
      addEventListener(name, fn) { this.listeners[name] = fn; },
      focus() { document.activeElement = this; }
    };
  }
  const button = element({ 'aria-controls': 'site-menu', 'aria-expanded': 'false' });
  const links = [element(), element()];
  links.forEach(link => { link.closest = selector => selector === 'a[href]' ? link : null; });
  const languages = [element(), element()];
  const sheet = element({ id: 'site-menu' });
  sheet.querySelector = () => links[0];
  sheet.querySelectorAll = () => [...links, ...languages];
  const mark = element(), navLinks = element(), language = element(), theme = element();
  mark.getBoundingClientRect = () => ({ width: 100 });
  navLinks.getBoundingClientRect = () => ({ width: linksWidth });
  language.getBoundingClientRect = () => ({ width: 88 });
  theme.getBoundingClientRect = () => ({ width: 140 });
  const nav = {
    get clientWidth() { return width; },
    classList: { add: name => classes.add(name), remove: (...names) => names.forEach(name => classes.delete(name)) },
    querySelector: selector => ({ '.nav-menu-toggle': button, '.nav-row': sheet,
      '.jk-mark': mark, '.nav-links': navLinks, '.lang-switch': language,
      '[data-jk-theme-switch]': theme })[selector],
    contains: target => [nav, button, sheet, ...links, ...languages].includes(target)
  };
  document = { activeElement: null, querySelector: () => nav,
    fonts: { ready: { then(fn) { fontsReady = fn; } } },
    addEventListener: (name, fn) => { listeners[name] = fn; } };
  vm.runInNewContext(source, {
    document, window: {
      matchMedia(query) { assert.equal(query, '(prefers-reduced-motion: reduce)'); return { matches: reduced }; },
      requestAnimationFrame(fn) { frames.push(fn); return frames.length; },
      addEventListener(name, fn) { windowListeners[name] = fn; },
      getComputedStyle(el) { if (el === sheet) return { getPropertyValue(name) { assert.equal(name, '--jk-d-2'); return duration; } }; return el === nav ? { paddingLeft: '18px', paddingRight: '18px', columnGap: '8px' } :
        { marginLeft: el === language && !classes.has('is-measuring') ? '100px' : '0px', marginRight: el === mark ? '4px' : '0px' }; },
      ResizeObserver: class { constructor(fn) { resized = fn; } observe(el) { assert.ok([nav, theme].includes(el)); } },
      MutationObserver: class { constructor(fn) { mounted = fn; } observe(el) { assert.equal(el, theme); } }
    },
    setTimeout(fn, delay) { delays.push(delay); timers.set(fn, fn); return fn; },
    clearTimeout(id) { timers.delete(id); }
  });
  function flush() { while (frames.length) frames.shift()(); }
  flush();
  function key(key, shiftKey = false) {
    const event = { key, shiftKey, prevented: false, preventDefault() { this.prevented = true; } };
    listeners.keydown(event);
    return event;
  }
  return { document, classes, button, sheet, links, languages, delays, key, listeners, flush, windowListeners,
    setWidth: value => { width = value; }, setLinksWidth: value => { linksWidth = value; },
    resize: () => { windowListeners.resize(); flush(); },
    observeResize: () => { resized(); flush(); }, mount: () => { mounted(); flush(); },
    fontsReady: () => { fontsReady(); flush(); },
    toggle: () => button.listeners.click(), finishFade: () => { timers.forEach(fn => fn()); timers.clear(); } };
}

test('Menu uses measured intrinsic item widths, gaps and insets, without a viewport breakpoint', () => {
  assert.doesNotMatch(source, /matchMedia\('\(max-width:/);
  assert.ok(load({ width: 791 }).classes.has('is-compact'), '756px of items cannot fit the 755px inner width');
  const fit = load({ width: 792 });
  assert.ok(!fit.classes.has('is-compact'), 'exactly 756px fits');
  assert.ok(!fit.classes.has('is-measuring'), 'measurement class is removed before paint');
  assert.equal(fit.sheet.inert, false);
  assert.equal(fit.sheet.attrs['aria-hidden'], undefined);
  fit.toggle();
  assert.equal(fit.button.attrs['aria-expanded'], 'false');
});
test('languageChanged remeasures wider and narrower labels at the same viewport', () => {
  const p = load({ width: 800 });
  assert.ok(!p.classes.has('is-compact'));
  p.setLinksWidth(420); p.windowListeners.languageChanged(); p.flush();
  assert.ok(p.classes.has('is-compact'));
  p.setLinksWidth(400); p.windowListeners.languageChanged(); p.flush();
  assert.ok(!p.classes.has('is-compact'));
});
test('ResizeObserver, window resize, mounted theme and loaded fonts all remeasure', () => {
  for (const trigger of ['resize', 'observeResize', 'mount', 'fontsReady']) {
    const p = load({ width: 800 });
    p.setLinksWidth(450); p[trigger]();
    assert.ok(p.classes.has('is-compact'), trigger);
    p.setLinksWidth(350); p[trigger]();
    assert.ok(!p.classes.has('is-compact'), trigger);
  }
});
test('remeasure preserves an open compact sheet when the inline items still do not fit', () => {
  const p = load(); p.toggle(); p.resize();
  assert.equal(p.button.attrs['aria-expanded'], 'true');
  assert.equal(p.sheet.inert, false);
  assert.ok(p.classes.has('is-menu-open'));
});

test('open exposes the sheet, updates expanded state and focuses the first link', () => {
  const p = load();
  assert.ok(p.classes.has('has-menu'));
  assert.equal(p.sheet.inert, true);
  p.toggle();
  assert.equal(p.button.attrs['aria-expanded'], 'true');
  assert.ok(p.classes.has('is-menu-open'));
  assert.equal(p.sheet.inert, false);
  assert.equal(p.sheet.attrs['aria-hidden'], undefined);
  assert.equal(p.document.activeElement, p.links[0]);
});
test('button closes the sheet and returns focus after opening', () => {
  const p = load(); p.toggle(); p.toggle();
  assert.equal(p.button.attrs['aria-expanded'], 'false');
  assert.ok(!p.classes.has('is-menu-open'));
  assert.equal(p.sheet.inert, true);
  assert.equal(p.sheet.attrs['aria-hidden'], 'true');
  assert.equal(p.document.activeElement, p.button);
  assert.ok(p.classes.has('is-menu-closing'));
  p.finishFade();
  assert.ok(!p.classes.has('is-menu-closing'));
});
test('Escape closes and returns focus to Menu', () => {
  const p = load(); p.toggle();
  assert.equal(p.key('Escape').prevented, true);
  assert.equal(p.button.attrs['aria-expanded'], 'false');
  assert.equal(p.document.activeElement, p.button);
});
for (const event of ['click', 'pointerdown']) {
  test(`outside ${event} closes; inside ${event} keeps the sheet open`, () => {
    const p = load(); p.toggle();
    p.listeners[event]({ target: p.links[0] });
    assert.equal(p.button.attrs['aria-expanded'], 'true');
    let prevented = false;
    p.listeners[event]({ type: event, target: {}, preventDefault() { prevented = true; } });
    assert.equal(prevented, event === 'pointerdown');
    assert.equal(p.button.attrs['aria-expanded'], 'false');
    assert.equal(p.document.activeElement, p.button);
  });
}
test('a nested link click closes without overriding navigation focus', () => {
  const p = load(); p.toggle();
  p.sheet.listeners.click({ target: { closest: () => p.links[0] } });
  assert.equal(p.button.attrs['aria-expanded'], 'false');
  assert.equal(p.document.activeElement, p.links[0]);
});
test('aria-controls refers to the one existing sheet, with bilingual Menu labels', () => {
  const markup = fs.readFileSync('_includes/nav.html', 'utf8');
  const controls = markup.match(/class="nav-menu-toggle"[^>]*aria-controls="([^"]+)"/)[1];
  assert.match(markup, new RegExp(`<div class="nav-row" id="${controls}">`));
  assert.equal((markup.match(/class="nav-row"/g) || []).length, 1);
  assert.match(markup, /<span class="lang-en" lang="en">Menu<\/span><span class="lang-it" lang="it">Menu<\/span>/);
});
test('focus trap wraps Tab last to first and Shift+Tab first to last', () => {
  const p = load(); p.toggle();
  p.languages[1].focus();
  assert.equal(p.key('Tab').prevented, true);
  assert.equal(p.document.activeElement, p.button);
  p.key('Tab', true);
  assert.equal(p.document.activeElement, p.languages[1]);
  p.button.focus(); p.key('Tab');
  assert.equal(p.document.activeElement, p.links[0]);
});
test('fitting inline clears hidden/inert state and returning to compact stays closed', () => {
  const p = load(); p.toggle();
  p.setWidth(900); p.resize();
  assert.equal(p.button.attrs['aria-expanded'], 'false');
  assert.equal(p.sheet.inert, false);
  assert.equal(p.sheet.attrs['aria-hidden'], undefined);
  assert.ok(!p.classes.has('is-menu-closing'));
  assert.equal(p.key('Tab').prevented, false);
  p.toggle();
  assert.equal(p.button.attrs['aria-expanded'], 'false');
  p.setWidth(700); p.resize();
  assert.equal(p.sheet.inert, true);
});
test('reduced motion closes immediately and reopening cancels a pending fade', () => {
  const reduced = load({ reduced: true }); reduced.toggle(); reduced.toggle();
  assert.ok(!reduced.classes.has('is-menu-closing'));
  const p = load(); p.toggle(); p.toggle(); p.toggle(); p.finishFade();
  assert.ok(p.classes.has('is-menu-open'));
  assert.ok(!p.classes.has('is-menu-closing'));
});


test('closing follows the computed millisecond token with a 200ms fallback', () => {
  for (const [duration, expected] of [[' 240ms ', 240], ['120ms', 120], ['280ms', 280], ['', 200], ['invalid', 200], ['0.2s', 200]]) {
    const p = load({ duration }); p.toggle(); p.toggle();
    assert.deepEqual(p.delays, [expected], duration);
    p.finishFade();
    assert.ok(!p.classes.has('is-menu-closing'));
  }
});
test('zero token and reduced motion skip the closing timer altogether', () => {
  for (const options of [{ duration: '0ms' }, { reduced: true, duration: '280ms' }]) {
    const p = load(options); p.toggle(); p.toggle();
    assert.deepEqual(p.delays, []);
    assert.ok(!p.classes.has('is-menu-closing'));
  }
});
