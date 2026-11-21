const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('moxie/app.js', 'utf8');

function load({ lang = 'en', mounted = true, present = true, count = 1, from = 7, to = 19 } = {}) {
  const listeners = new Map();
  const observers = [];
  const groups = Array.from({ length: count }, () => {
    const buttons = ['auto', 'light', 'dark'].map((mode, index) => {
      const label = { textContent: ['Auto', 'Chiaro', 'Scuro'][index] };
      return {
        dataset: { m: mode },
        title: [`Automatico: chiaro dalle ${from} alle ${to}`, 'Tema chiaro', 'Tema scuro'][index],
        attrs: { 'aria-pressed': mode === 'auto' ? 'true' : 'false' },
        label, icon: { textContent: ['◐', '☀', '☾'][index] },
        suffix: { en: ', theme', it: ', tema' },
        querySelector(selector) { assert.equal(selector, '.l'); return label; }
      };
    });
    return {
      attrs: { role: 'group', 'aria-label': 'Tema' }, buttons,
      click: () => {},
      setAttribute(name, value) { this.attrs[name] = value; },
      querySelectorAll(selector) { assert.equal(selector, 'button[data-m]'); return buttons; }
    };
  });
  const hosts = groups.map(group => ({
    group: mounted ? group : null,
    querySelector(selector) { assert.equal(selector, '.jk-thsw'); return this.group; }
  }));
  const document = {
    documentElement: { lang, dataset: { theme: 'light' } },
    body: { dataset: { page: 'test' } },
    querySelector: () => null,
    querySelectorAll: selector => present && selector === '[data-jk-theme-switch]' ? hosts : [],
    getElementById: () => null,
    addEventListener(name, callback) {
      if (!listeners.has(name)) listeners.set(name, []);
      listeners.get(name).push(callback);
    }
  };
  const window = { JaackTheme: { FROM: from, TO: to }, addEventListener() {} };
  vm.runInNewContext(source, {
    document, window, location: { hash: '' },
    MutationObserver: class {
      constructor(callback) { this.callback = callback; this.active = false; observers.push(this); }
      observe(host, options) {
        assert.ok(hosts.includes(host));
        assert.deepEqual({ ...options }, { childList: true, subtree: true });
        this.host = host; this.active = true;
      }
      disconnect() { this.active = false; this.disconnected = true; }
    }
  });
  return {
    groups, hosts, observers,
    domReady() {
      present = true;
      for (const callback of listeners.get('DOMContentLoaded') || []) callback();
    },
    mount(index = 0) { hosts[index].group = groups[index]; },
    flush() { observers.filter(observer => observer.active).forEach(observer => observer.callback()); }
  };
}

function assertEnglish(group, from = 7, to = 19) {
  assert.equal(group.attrs['aria-label'], 'Theme');
  assert.deepEqual(group.buttons.map(button => button.label.textContent), ['Auto', 'Light', 'Dark']);
  assert.deepEqual(group.buttons.map(button => button.title),
    [`Automatic: light from ${from} to ${to}`, 'Light theme', 'Dark theme']);
  assert.deepEqual(group.buttons.map(button => button.label.textContent + button.suffix.en),
    ['Auto, theme', 'Light, theme', 'Dark, theme']);
}

function assertControlsUnchanged(group, original) {
  assert.equal(group.attrs.role, 'group');
  assert.equal(group.click, original.click);
  group.buttons.forEach((button, index) => {
    assert.equal(button, original.buttons[index]);
    assert.equal(button.dataset.m, ['auto', 'light', 'dark'][index]);
    assert.equal(button.attrs['aria-pressed'], index === 0 ? 'true' : 'false');
    assert.equal(button.suffix, original.suffixes[index]);
    assert.deepEqual(button.suffix, { en: ', theme', it: ', tema' });
    assert.equal(button.icon.textContent, ['◐', '☀', '☾'][index]);
  });
}

const snapshot = group => ({ click: group.click, buttons: [...group.buttons], suffixes: group.buttons.map(b => b.suffix) });

test('EN switch already mounted is localized immediately and uses the theme API hours', () => {
  const page = load({ from: 6, to: 22 });
  assertEnglish(page.groups[0], 6, 22);
  assert.equal(page.observers.length, 0);
  page.domReady();
  assertEnglish(page.groups[0], 6, 22);
});

for (const order of ['vendor-first', 'localizer-first']) {
  test(`EN switch mounted at DOMContentLoaded is localized with ${order} script order`, () => {
    const page = load({ mounted: false });
    const original = snapshot(page.groups[0]);
    assert.equal(page.observers.length, 1);
    assert.equal(page.observers[0].host, page.hosts[0]);
    if (order === 'vendor-first') page.mount();
    page.domReady();
    if (order === 'localizer-first') page.mount();
    page.flush();
    assertEnglish(page.groups[0]);
    assertControlsUnchanged(page.groups[0], original);
    assert.equal(page.observers.length, 1, 'DOMContentLoaded must not add a duplicate observer');
    assert.equal(page.observers[0].disconnected, true);
    assert.equal(page.observers[0].active, false);
  });
}

test('DOMContentLoaded discovers a host absent when the script first ran', () => {
  const page = load({ present: false });
  assert.equal(page.groups[0].attrs['aria-label'], 'Tema');
  page.domReady();
  assertEnglish(page.groups[0]);
});

test('each host is observed independently until its own switch is relabelled', () => {
  const page = load({ mounted: false, count: 2 });
  page.mount(1); page.flush();
  assertEnglish(page.groups[1]);
  assert.equal(page.observers[0].active, true);
  assert.equal(page.observers[1].active, false);
  page.mount(0); page.flush();
  assertEnglish(page.groups[0]);
  assert.ok(page.observers.every(observer => observer.disconnected));
});

for (const mounted of [true, false]) {
  test(`IT labels, titles and group name remain unchanged (${mounted ? 'already mounted' : 'mounted later'})`, () => {
    const page = load({ lang: 'it', mounted });
    const group = page.groups[0];
    const original = snapshot(group);
    page.domReady(); page.mount(); page.flush();
    assert.equal(group.attrs['aria-label'], 'Tema');
    assert.deepEqual(group.buttons.map(button => button.label.textContent), ['Auto', 'Chiaro', 'Scuro']);
    assert.deepEqual(group.buttons.map(button => button.title),
      ['Automatico: chiaro dalle 7 alle 19', 'Tema chiaro', 'Tema scuro']);
    assert.deepEqual(group.buttons.map(button => button.label.textContent + button.suffix.it),
      ['Auto, tema', 'Chiaro, tema', 'Scuro, tema']);
    assertControlsUnchanged(group, original);
    assert.equal(page.observers.length, 0);
  });
}
