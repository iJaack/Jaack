const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('assets/js/language.js', 'utf8');

function load({ preferred, browser = 'en-US', fixed = '', storageFails = false, inHead = false, barBox, theme = 'light', bookingPresent = true } = {}) {
  const classes = new Set();
  const properties = new Map();
  const bookingLink = { setAttribute(name, value) { this[name] = value; } };
  const themeMeta = { setAttribute(name, value) { this[name] = value; } };
  const bar = barBox && { getBoundingClientRect: () => barBox };
  let resize;
  const storage = new Map(preferred ? [['site-lang', preferred]] : []);
  const buttons = ['en', 'it'].map(lang => ({
    attrs: { 'data-lang': lang },
    getAttribute(name) { return this.attrs[name]; },
    setAttribute(name, value) { this.attrs[name] = value; },
    addEventListener(name, fn) { this[name] = fn; }
  }));
  const document = {
    documentElement: { getAttribute: name => name === 'data-theme' ? theme : fixed, lang: 'en', dataset: {},
      style: { setProperty: (name, value) => properties.set(name, value) } },
    body: { classList: { remove: (...names) => names.forEach(n => classes.delete(n)), add: n => classes.add(n) } },
    querySelector: selector => selector === '[data-booking-link]' ? (bookingPresent ? bookingLink : null) :
      selector === 'meta[name="theme-color"]' ? themeMeta :
      selector === 'nav.site-nav' ? bar : null,
    querySelectorAll: () => buttons
  };
  const body = document.body;
  let ready;
  if (inHead) {
    document.body = null;
    document.addEventListener = (event, callback) => { assert.equal(event, 'DOMContentLoaded'); ready = callback; };
  }
  const window = { location: { href: '' }, addEventListener(name, fn) { this[name] = fn; }, dispatchEvent(event) { this.event = event; } };
  vm.runInNewContext(source, {
    document, window, navigator: { language: browser },
    ResizeObserver: class {
      constructor(callback) { resize = callback; }
      observe(target) { assert.equal(target, bar); }
    },
    localStorage: {
      getItem(key) { if (storageFails) throw Error('blocked'); return storage.get(key); },
      setItem(key, value) { if (storageFails) throw Error('blocked'); storage.set(key, value); }
    },
    CustomEvent: function(name, options) { this.type = name; this.detail = options.detail; }
  });
  return { document, window, buttons, classes, storage, properties, themeMeta, bookingLink, resize: () => resize(), mount() { document.body = body; ready(); } };
}

test('Italian browser receives Italian content and document language', () => {
  const p = load({ browser: 'it-IT' });
  assert.equal(p.document.documentElement.lang, 'it');
  assert.ok(p.classes.has('lang-it'));
  assert.equal(p.buttons[1].attrs['aria-pressed'], 'true');
});
test('an explicit preference overrides browser language', () => {
  assert.equal(load({ preferred: 'en', browser: 'it' }).document.documentElement.lang, 'en');
});
test('button switches content, accessible state, storage and event', () => {
  const p = load();
  p.buttons[1].click();
  assert.equal(p.document.documentElement.lang, 'it');
  assert.equal(p.buttons[0].attrs['aria-pressed'], 'false');
  assert.equal(p.storage.get('site-lang'), 'it');
  assert.equal(p.window.event.detail.lang, 'it');
});
test('switch remains usable when storage is blocked', () => {
  const p = load({ storageFails: true });
  p.buttons[1].click();
  assert.ok(p.classes.has('lang-it'));
});
test('single-language article retains its actual document language and reader preference', () => {
  const p = load({ preferred: 'it', fixed: 'en' });
  assert.equal(p.document.documentElement.lang, 'en');
  assert.equal(p.storage.get('site-lang'), 'it');
});
test('translation navigation remains available', () => {
  const p = load({ fixed: 'en' });
  p.window.alternateLangUrl = '/translated-article/';
  p.window.alternateLangCode = 'it';
  p.buttons[1].click();
  assert.equal(p.window.location.href, '/translated-article/');
});
test('invalid stored language falls back to English', () => {
  assert.equal(load({ preferred: 'xx' }).document.documentElement.lang, 'en');
});

test('head initialization selects the translation before paint and mounts controls when DOM is ready', () => {
  const p = load({ browser: 'it-IT', inHead: true });
  assert.equal(p.document.documentElement.dataset.uiLang, 'it');
  assert.equal(p.document.documentElement.lang, 'it');
  assert.equal(p.classes.size, 0);
  p.mount();
  assert.ok(p.classes.has('lang-it'));
  p.buttons[0].click();
  assert.equal(p.document.documentElement.dataset.uiLang, 'en');
  assert.equal(p.document.documentElement.lang, 'en');
});

test('navigation clearance includes one viewport safe-area offset and 14px breath after rounding', () => {
  const barBox = { top: 47, height: 144.25 };
  const p = load({ barBox, theme: 'dark' });
  assert.equal(p.properties.get('--jk-top-clearance'), '206px');
  assert.equal(p.properties.size, 1);
  barBox.top = 8;
  barBox.height = 97.5;
  p.resize();
  assert.equal(p.properties.get('--jk-top-clearance'), '120px');
});

test('browser chrome follows the Ombra dark ground and unchanged light paper on theme changes', () => {
  const p = load({ theme: 'dark' });
  assert.equal(p.themeMeta.content, '#130e0b');
  p.document.documentElement.getAttribute = name => name === 'data-theme' ? 'light' : '';
  p.window.jaacktheme();
  assert.equal(p.themeMeta.content, '#f3eee6');
});

for (const initial of ['en', 'it']) {
  test(`booking accessible name follows ${initial} UI at load and both language switches`, () => {
    const p = load({ preferred: initial, fixed: initial === 'it' ? 'en' : 'it', inHead: true });
    p.mount();
    assert.equal(p.bookingLink['aria-label'], initial === 'it' ? 'Prenota una call' : 'Book a call');
    p.buttons[1].click();
    assert.equal(p.bookingLink['aria-label'], 'Prenota una call');
    assert.equal(p.document.documentElement.dataset.uiLang, 'it');
    p.buttons[0].click();
    assert.equal(p.bookingLink['aria-label'], 'Book a call');
    assert.equal(p.document.documentElement.dataset.uiLang, 'en');
  });
}

test('language switching works without a booking link', () => {
  const p = load({ bookingPresent: false });
  p.buttons[1].click();
  assert.equal(p.document.documentElement.dataset.uiLang, 'it');
});
