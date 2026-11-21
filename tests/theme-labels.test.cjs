const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('assets/jaack-design-system/theme.js', 'utf8');

function load({ lang = 'en', uiLang, from = 7, to = 19, present = true } = {}) {
  const listeners = new Map();
  const storage = new Map();
  let observer;
  let group;
  const html = { lang, dataset: { uiLang }, classList: { add() {}, remove() {} } };
  const host = {
    querySelector: () => group || null,
    appendChild(node) { group = node; }
  };
  function addEventListener(name, callback) {
    if (!listeners.has(name)) listeners.set(name, []);
    listeners.get(name).push(callback);
  }
  function dispatch(name, event) {
    for (const callback of listeners.get(name) || []) callback(event);
  }
  function createElement(tag) {
    assert.equal(tag, 'div');
    return {
      attrs: {}, buttons: [],
      setAttribute(name, value) { this.attrs[name] = value; },
      addEventListener,
      set innerHTML(markup) {
        this.buttons = [...markup.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].map(([, attrs, content]) => ({
          attrs: {}, markup: attrs, content,
          dataset: { m: attrs.match(/data-m="([^"]+)"/)[1] },
          label: { textContent: '' }, suffix: { textContent: '' },
          setAttribute(name, value) { this.attrs[name] = value; },
          querySelector(selector) {
            assert.ok(['.l', '.visually-hidden'].includes(selector));
            return selector === '.l' ? this.label : this.suffix;
          }
        }));
      },
      querySelectorAll(selector) { assert.equal(selector, 'button[data-m]'); return this.buttons; }
    };
  }
  const document = {
    documentElement: html,
    currentScript: { dataset: { lightFrom: String(from), lightTo: String(to) } },
    addEventListener, createElement,
    querySelectorAll(selector) {
      if (selector === '[data-jk-theme-switch]') return present ? [host] : [];
      if (selector === '.jk-thsw') return group ? [group] : [];
      assert.equal(selector, '.jk-thsw button');
      return group ? group.buttons : [];
    }
  };
  const window = {
    MutationObserver: class {
      constructor(callback) { observer = callback; }
      observe(target, options) {
        assert.equal(target, html);
        assert.equal(options.attributes, true);
        assert.deepEqual(Array.from(options.attributeFilter), ['lang', 'data-ui-lang']);
      }
    }
  };
  vm.runInNewContext(source, {
    document, window, addEventListener, dispatchEvent() {},
    localStorage: {
      getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value),
      removeItem: key => storage.delete(key)
    },
    matchMedia: () => ({ matches: false }),
    setInterval() {}, setTimeout() {}, clearTimeout() {}, CustomEvent: function() {}
  });
  return {
    get group() { return group; }, html, theme: window.JaackTheme,
    domReady() { dispatch('DOMContentLoaded'); },
    changeLanguage(next, viaAttribute = false) {
      html.dataset.uiLang = next;
      if (viaAttribute) observer();
      else dispatch('languageChanged', { detail: { lang: next } });
    }
  };
}

function assertLabels(group, lang, from = 7, to = 19) {
  const italian = lang === 'it';
  assert.equal(group.attrs.role, 'group');
  assert.equal(group.attrs['aria-label'], italian ? 'Tema' : 'Theme');
  assert.deepEqual(group.buttons.map(button => button.label.textContent),
    italian ? ['Auto', 'Chiaro', 'Scuro'] : ['Auto', 'Light', 'Dark']);
  assert.deepEqual(group.buttons.map(button => button.title), italian ?
    [`Automatico: chiaro dalle ${from} alle ${to}`, 'Tema chiaro', 'Tema scuro'] :
    [`Automatic: light from ${from} to ${to}`, 'Light theme', 'Dark theme']);
  for (const button of group.buttons) {
    assert.equal(button.suffix.textContent, italian ? ', tema' : ', theme');
    assert.doesNotMatch(button.markup, /aria-label=/);
    assert.match(button.content, /class="i" aria-hidden="true"/);
    assert.ok(button.content.indexOf('class="l"') < button.content.indexOf('class="visually-hidden"'));
  }
}

for (const lang of ['en', 'it']) {
  test(`package mounts identical ${lang} labels, titles and group using configured hours`, () => {
    const page = load({ lang, from: 6, to: 22 });
    page.domReady();
    assertLabels(page.group, lang, 6, 22);
  });
}

test('mount uses the UI language selected after the head script, ahead of the content language', () => {
  const page = load({ lang: 'it' });
  page.changeLanguage('en');
  page.domReady();
  assertLabels(page.group, 'en');
});

for (const viaAttribute of [false, true]) {
  test(`package follows EN/IT changes via ${viaAttribute ? 'HTML attributes' : 'languageChanged'} and preserves controls and mode`, () => {
    const page = load({ lang: 'it', uiLang: 'en' });
    page.domReady();
    const buttons = [...page.group.buttons];
    for (const mode of ['light', 'dark', 'auto']) {
      page.theme.set(mode);
      for (const lang of ['it', 'en']) {
        page.changeLanguage(lang, viaAttribute);
        assertLabels(page.group, lang);
        page.group.buttons.forEach((button, index) => {
          assert.equal(button, buttons[index]);
          assert.equal(button.attrs['aria-pressed'], String(button.dataset.m === mode));
        });
      }
    }
  });
}

test('package follows html.lang changes when no UI language is set', () => {
  const page = load();
  page.domReady();
  page.html.lang = 'it';
  page.changeLanguage(undefined, true);
  assertLabels(page.group, 'it');
});

test('missing switch does not throw at mount or on language change', () => {
  const page = load({ present: false });
  page.domReady();
  page.changeLanguage('it');
  assert.equal(page.group, undefined);
});
