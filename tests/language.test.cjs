const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('assets/js/language.js', 'utf8');

function load({ preferred, browser = 'en-US', fixed = '', storageFails = false } = {}) {
  const classes = new Set();
  const storage = new Map(preferred ? [['site-lang', preferred]] : []);
  const buttons = ['en', 'it'].map(lang => ({
    attrs: { 'data-lang': lang },
    getAttribute(name) { return this.attrs[name]; },
    setAttribute(name, value) { this.attrs[name] = value; },
    addEventListener(name, fn) { this[name] = fn; }
  }));
  const document = {
    documentElement: { getAttribute: () => fixed, lang: 'en' },
    body: { classList: { remove: (...names) => names.forEach(n => classes.delete(n)), add: n => classes.add(n) } },
    querySelectorAll: () => buttons
  };
  const window = { location: { href: '' }, dispatchEvent(event) { this.event = event; } };
  vm.runInNewContext(source, {
    document, window, navigator: { language: browser },
    localStorage: {
      getItem(key) { if (storageFails) throw Error('blocked'); return storage.get(key); },
      setItem(key, value) { if (storageFails) throw Error('blocked'); storage.set(key, value); }
    },
    CustomEvent: function(name, options) { this.type = name; this.detail = options.detail; }
  });
  return { document, window, buttons, classes, storage };
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
