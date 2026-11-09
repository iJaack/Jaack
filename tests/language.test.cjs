const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('assets/js/language.js', 'utf8');

function load({ preferred, browser = 'en-US', fixed = '', storageFails = false, inHead = false } = {}) {
  const classes = new Set();
  const storage = new Map(preferred ? [['site-lang', preferred]] : []);
  const buttons = ['en', 'it'].map(lang => ({
    attrs: { 'data-lang': lang },
    getAttribute(name) { return this.attrs[name]; },
    setAttribute(name, value) { this.attrs[name] = value; },
    addEventListener(name, fn) { this[name] = fn; }
  }));
  const document = {
    documentElement: { getAttribute: () => fixed, lang: 'en', dataset: {} },
    body: { classList: { remove: (...names) => names.forEach(n => classes.delete(n)), add: n => classes.add(n) } },
    querySelectorAll: () => buttons
  };
  const body = document.body;
  let ready;
  if (inHead) {
    document.body = null;
    document.addEventListener = (event, callback) => { assert.equal(event, 'DOMContentLoaded'); ready = callback; };
  }
  const window = { location: { href: '' }, dispatchEvent(event) { this.event = event; } };
  vm.runInNewContext(source, {
    document, window, navigator: { language: browser },
    localStorage: {
      getItem(key) { if (storageFails) throw Error('blocked'); return storage.get(key); },
      setItem(key, value) { if (storageFails) throw Error('blocked'); storage.set(key, value); }
    },
    CustomEvent: function(name, options) { this.type = name; this.detail = options.detail; }
  });
  return { document, window, buttons, classes, storage, mount() { document.body = body; ready(); } };
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

test('theme controls keep visible labels before bilingual context through every state change', () => {
  const theme = fs.readFileSync('assets/jaack-design-system/theme.js', 'utf8');
  const storage = new Map();
  const buttons = [];
  let markup;
  const host = {
    querySelector: () => null,
    appendChild(group) {
      markup = group.innerHTML;
      for (const [, attributes, content] of markup.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
        buttons.push({
          attributes, content, dataset: { m: attributes.match(/data-m="([^"]+)"/)[1] },
          setAttribute(name, value) { this[name] = value; }
        });
      }
    }
  };
  const html = { dataset: {}, classList: { add() {}, remove() {} } };
  const window = {};
  vm.runInNewContext(theme, {
    window, document: {
      documentElement: html, addEventListener() {}, querySelectorAll: () => buttons,
      createElement: () => ({ setAttribute() {}, addEventListener() {} })
    },
    localStorage: {
      getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value),
      removeItem: key => storage.delete(key)
    },
    matchMedia: () => ({ matches: false }), setInterval() {}, setTimeout() {}, clearTimeout() {},
    addEventListener() {}, dispatchEvent() {}, CustomEvent: function() {}
  });
  window.JaackTheme.mount(host);
  assert.equal(buttons.length, 3);
  for (const mode of ['light', 'dark', 'auto']) {
    window.JaackTheme.set(mode);
    for (const [index, button] of buttons.entries()) {
      assert.doesNotMatch(button.attributes, /aria-label=/);
      const label = ['Auto', 'Chiaro', 'Scuro'][index];
      const labelAt = button.content.indexOf(`>${label}</span>`);
      assert.ok(labelAt >= 0 && labelAt < button.content.indexOf('class="visually-hidden"'));
      assert.match(button.content, /class="lang-en" lang="en">, theme<\/span>/);
      assert.match(button.content, /class="lang-it" lang="it">, tema<\/span>/);
      assert.equal(button['aria-pressed'], String(button.dataset.m === mode));
    }
  }
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
