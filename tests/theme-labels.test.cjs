const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('assets/js/theme-labels.js', 'utf8');

function load({ lang = 'en', uiLang, mounted = true, present = true, readyState = 'complete', theme = { FROM: 7, TO: 19 } } = {}) {
  const listeners = new Map();
  const observers = [];
  const buttons = ['auto', 'light', 'dark'].map((mode, index) => ({
    label: { textContent: ['Auto', 'Chiaro', 'Scuro'][index] },
    title: ['Automatico: chiaro dalle 7 alle 19', 'Tema chiaro', 'Tema scuro'][index],
    attrs: { 'data-m': mode, 'aria-pressed': index === 0 ? 'true' : 'false' },
    icon: { textContent: ['◐', '☀', '☾'][index] },
    suffix: { en: ', theme', it: ', tema' },
    getAttribute(name) { return this.attrs[name]; },
    querySelector(selector) { assert.equal(selector, '.l'); return this.label; }
  }));
  const group = {
    attrs: { role: 'group', 'aria-label': 'Tema' }, buttons,
    setAttribute(name, value) { this.attrs[name] = value; },
    querySelectorAll(selector) { assert.equal(selector, 'button[data-m]'); return buttons; }
  };
  const host = {
    querySelector(selector) { assert.equal(selector, '.jk-thsw'); return mounted ? group : null; }
  };
  function addEventListener(name, callback) {
    if (!listeners.has(name)) listeners.set(name, []);
    listeners.get(name).push(callback);
  }
  function dispatch(name, event) {
    for (const callback of listeners.get(name) || []) callback(event);
  }
  const document = {
    documentElement: { lang, dataset: { uiLang } }, readyState,
    querySelectorAll(selector) {
      assert.equal(selector, '[data-jk-theme-switch]');
      return present ? [host] : [];
    },
    addEventListener
  };
  vm.runInNewContext(source, {
    document, window: { JaackTheme: theme, addEventListener },
    MutationObserver: class {
      constructor(callback) { this.callback = callback; observers.push(this); }
      observe(target, options) {
        assert.equal(target, host);
        assert.deepEqual({ ...options }, { childList: true, subtree: true });
        this.active = true;
      }
      disconnect() { this.active = false; }
    }
  });
  return {
    group, observers,
    domReady() { dispatch('DOMContentLoaded'); },
    mount() { mounted = true; },
    flush() { observers.filter(observer => observer.active).forEach(observer => observer.callback()); },
    changeLanguage(next) {
      document.documentElement.dataset.uiLang = next;
      dispatch('languageChanged', { detail: { lang: next } });
    }
  };
}

function assertLabels(group, lang, from = 7, to = 19) {
  const italian = lang === 'it';
  assert.equal(group.attrs['aria-label'], italian ? 'Tema' : 'Theme');
  assert.deepEqual(group.buttons.map(button => button.label.textContent),
    italian ? ['Auto', 'Chiaro', 'Scuro'] : ['Auto', 'Light', 'Dark']);
  assert.deepEqual(group.buttons.map(button => button.title), italian ?
    [`Automatico: chiaro dalle ${from} alle ${to}`, 'Tema chiaro', 'Tema scuro'] :
    [`Automatic: light from ${from} to ${to}`, 'Light theme', 'Dark theme']);
}

test('English labels, titles and group use the theme API hours', () => {
  const page = load({ uiLang: 'en', theme: { FROM: 6, TO: 22 } });
  assertLabels(page.group, 'en', 6, 22);
  assert.equal(page.observers.length, 0);
});

test('Italian labels, titles and group match the vendor', () => {
  assertLabels(load({ uiLang: 'it' }).group, 'it');
});

for (const vendorFirst of [true, false]) {
  test(`switch mounted at DOMContentLoaded is relabelled (${vendorFirst ? 'vendor' : 'localizer'} first)`, () => {
    const page = load({ mounted: false, readyState: 'loading', uiLang: 'en' });
    if (vendorFirst) page.mount();
    page.domReady();
    if (!vendorFirst) {
      assert.equal(page.observers.length, 1);
      assert.equal(page.observers[0].active, true);
      page.mount();
      page.flush();
      assert.equal(page.observers[0].active, false);
    }
    assertLabels(page.group, 'en');
  });
}

test('a switch mounted after the script uses the latest UI language and disconnects its observer', () => {
  const page = load({ mounted: false, uiLang: 'en' });
  assert.equal(page.observers.length, 1);
  page.changeLanguage('it');
  page.mount(); page.flush();
  assertLabels(page.group, 'it');
  assert.equal(page.observers[0].active, false);
});

test('languageChanged updates English to Italian and back without changing controls or suffixes', () => {
  const page = load({ uiLang: 'en' });
  const originals = page.group.buttons.map(button => ({
    button, icon: button.icon, suffix: button.suffix, attrs: { ...button.attrs }
  }));
  page.changeLanguage('it');
  assertLabels(page.group, 'it');
  page.changeLanguage('en');
  assertLabels(page.group, 'en');
  assert.equal(page.group.attrs.role, 'group');
  page.group.buttons.forEach((button, index) => {
    assert.equal(button, originals[index].button);
    assert.equal(button.icon, originals[index].icon);
    assert.equal(button.icon.textContent, ['◐', '☀', '☾'][index]);
    assert.equal(button.suffix, originals[index].suffix);
    assert.deepEqual(button.suffix, { en: ', theme', it: ', tema' });
    assert.deepEqual(button.attrs, originals[index].attrs);
  });
});

test('an Italian post with an English UI shows English theme labels', () => {
  const page = load({ lang: 'it', uiLang: 'en' });
  assertLabels(page.group, 'en');
  page.changeLanguage('it');
  assertLabels(page.group, 'it');
  page.changeLanguage('en');
  assertLabels(page.group, 'en');
});

test('html.lang is the fallback when uiLang is absent', () => {
  assertLabels(load({ lang: 'it' }).group, 'it');
  assertLabels(load({ lang: 'en' }).group, 'en');
});

test('missing JaackTheme uses default hours without throwing', () => {
  assertLabels(load({ theme: null }).group, 'en');
  assertLabels(load({ theme: null, uiLang: 'it' }).group, 'it');
});

test('missing switch does not throw on initialization or language change', () => {
  const page = load({ present: false, readyState: 'loading' });
  page.domReady();
  page.changeLanguage('it');
  page.changeLanguage('en');
  assert.equal(page.observers.length, 0);
});
