const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('moxie/nav-menu.js', 'utf8');

function load({ width = 360, reduced = false } = {}) {
  const classes = new Set();
  const listeners = {};
  const timers = new Map();
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
  const button = element({ 'aria-controls': 'hub-menu', 'aria-expanded': 'false' });
  const links = [element(), element()];
  links.forEach(link => { link.closest = selector => selector === 'a[href]' ? link : null; });
  const languages = [element(), element()];
  const sheet = element({ id: 'hub-menu' });
  sheet.querySelector = () => links[0];
  sheet.querySelectorAll = () => [...links, ...languages];
  const nav = {
    classList: { add: name => classes.add(name), remove: (...names) => names.forEach(name => classes.delete(name)) },
    querySelector: selector => selector === '.nav-menu-toggle' ? button : selector === '.hub-tools' ? sheet : null,
    contains: target => [nav, button, sheet, ...links, ...languages].includes(target)
  };
  const media = { matches: false, addEventListener(name, fn) { assert.equal(name, 'change'); this.change = fn; } };
  document = { activeElement: null, querySelector: selector => selector === 'header.hub-header' ? nav : null, addEventListener: (name, fn) => { listeners[name] = fn; } };
  vm.runInNewContext(source, {
    document, window: { matchMedia(query) {
      if (query.includes('reduced-motion')) return { matches: reduced };
      assert.equal(query, '(max-width: 482.98px)');
      media.matches = width <= Number(query.match(/max-width: ([\d.]+)px/)[1]);
      return media;
    } },
    setTimeout(fn, delay) { assert.equal(delay, 160); timers.set(fn, fn); return fn; },
    clearTimeout(id) { timers.delete(id); }
  });
  function key(key, shiftKey = false) {
    const event = { key, shiftKey, prevented: false, preventDefault() { this.prevented = true; } };
    listeners.keydown(event);
    return event;
  }
  return { document, classes, button, sheet, links, languages, media, key, listeners,
    toggle: () => button.listeners.click(), finishFade: () => { timers.forEach(fn => fn()); timers.clear(); } };
}

test('Menu CSS and JavaScript share the bilingual 482.98px breakpoint', () => {
  const css = fs.readFileSync('moxie/jaack-moxie.css', 'utf8');
  const jsBreakpoint = source.match(/matchMedia\('\(max-width: ([\d.]+)px\)'\)/)?.[1];
  assert.equal(jsBreakpoint, '482.98');
  const cssBreakpoints = [...css.matchAll(/@media \(max-width: ([\d.]+)px\)(?: and \(prefers-reduced-motion: reduce\))? \{([\s\S]*?)\n\}/g)]
    .filter(([, , rules]) => rules.includes('header.hub-header.has-menu'))
    .map(([, breakpoint]) => breakpoint);
  assert.equal(cssBreakpoints.length, 2, 'Menu layout and reduced-motion queries');
  for (const breakpoint of cssBreakpoints) assert.equal(breakpoint, jsBreakpoint);
});

for (const width of [360, 420, 466, 480, 481, 482, 482.98, 483, 599, 600, 720, 721, 900]) {
  test(`Menu interaction follows the measured cutoff at ${width}px`, () => {
    const p = load({ width });
    const menu = width <= 482.98;
    assert.equal(p.sheet.inert, menu);
    assert.equal(p.sheet.attrs['aria-hidden'], menu ? 'true' : undefined);
    p.toggle();
    assert.equal(p.button.attrs['aria-expanded'], menu ? 'true' : 'false');
    assert.equal(p.classes.has('is-menu-open'), menu);
    assert.equal(p.sheet.inert, false);
  });
}

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
test('a nested link click closes and returns focus to Menu', () => {
  const p = load(); p.toggle();
  p.sheet.listeners.click({ target: { closest: () => p.links[0] } });
  assert.equal(p.button.attrs['aria-expanded'], 'false');
  assert.equal(p.document.activeElement, p.button);
});
test('aria-controls refers to the one existing hub sheet, with bilingual Menu labels', () => {
  const markup = fs.readFileSync('moxie/build_hub.py', 'utf8');
  const controls = markup.match(/class="nav-menu-toggle"[^>]*aria-controls="([^"]+)"/)[1];
  assert.match(markup, new RegExp(`<div class="hub-tools" id="${controls}">`));
  assert.equal((markup.match(/class="hub-tools"/g) || []).length, 1);
  assert.match(markup, /'menu':\('Menu','Menu'\)/);
  assert.match(markup, /<script src="\/nav-menu.js" defer><\/script>/);
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
test('crossing to desktop clears hidden/inert state and returning to mobile stays closed', () => {
  const p = load(); p.toggle();
  p.media.matches = false; p.media.change();
  assert.equal(p.button.attrs['aria-expanded'], 'false');
  assert.equal(p.sheet.inert, false);
  assert.equal(p.sheet.attrs['aria-hidden'], undefined);
  assert.ok(!p.classes.has('is-menu-closing'));
  assert.equal(p.key('Tab').prevented, false);
  p.toggle();
  assert.equal(p.button.attrs['aria-expanded'], 'false');
  p.media.matches = true; p.media.change();
  assert.equal(p.sheet.inert, true);
});
test('reduced motion closes immediately and reopening cancels a pending fade', () => {
  const reduced = load({ reduced: true }); reduced.toggle(); reduced.toggle();
  assert.ok(!reduced.classes.has('is-menu-closing'));
  const p = load(); p.toggle(); p.toggle(); p.toggle(); p.finishFade();
  assert.ok(p.classes.has('is-menu-open'));
  assert.ok(!p.classes.has('is-menu-closing'));
});

test('mobile sheet is out of flow, above Contents, with full-height links and a reduced-motion override', () => {
  const css = fs.readFileSync('moxie/jaack-moxie.css', 'utf8');
  const mobile = css.match(/@media \(max-width: 482\.98px\) \{([\s\S]*?)\n\}/)[1];
  assert.match(mobile, /\.hub-tools\{\s*position:absolute;top:calc\(100% \+ 8px\);left:0;right:0;z-index:3;/);
  assert.match(mobile, /background:var\(--jk-surface-2\);border:1px solid var\(--jk-hair-2\);border-radius:14px/);
  assert.match(mobile, /opacity:0;visibility:hidden;pointer-events:none;transition:opacity 160ms/);
  assert.match(mobile, /a\.jk-sw\{min-height:44px;padding:0 14px/);
  assert.match(mobile, /\.language a\{min-height:44px;min-width:44px;padding:0 14px/);
  assert.match(css, /@media \(max-width: 482\.98px\) and \(prefers-reduced-motion: reduce\) \{\s*header\.hub-header\.has-menu \.hub-tools\{transition:none\}/);
});

test('mobile sheet keeps destinations in one column and languages in one inline row at the bottom', () => {
  const css = fs.readFileSync('moxie/jaack-moxie.css', 'utf8');
  const mobile = css.match(/@media \(max-width: 482\.98px\) \{([\s\S]*?)\n\}/)[1];
  assert.match(mobile, /\.hub-tools\{[^}]*display:flex;flex-direction:column;align-items:stretch/);
  assert.match(mobile, /\.hub-tools \.global-nav\{flex:none;flex-direction:column;align-items:stretch/);
  assert.match(mobile, /\.hub-tools \.language\{flex-direction:row;flex-wrap:nowrap;align-items:center;gap:0\}/);
  assert.match(mobile, /\.language a\{min-height:44px;min-width:44px;padding:0 14px;justify-content:flex-start\}/);
  assert.match(css, /\.hub-tools \.language\{order:1;flex:0 0 auto\}/);
});

test('bar measurement reserves its bottom plus 14px and CSS uses clearance directly', () => {
  const app = fs.readFileSync('moxie/app.js', 'utf8');
  const measurement = app.match(/\(function\(\)\{\n  const bar=document\.querySelector\('header\.hub-header'\);[\s\S]*?\n\}\)\(\);/);
  assert.ok(measurement, 'header measurement function exists');
  const properties = {};
  let fit;
  const bar = { getBoundingClientRect: () => ({ bottom: 66.2 }) };
  vm.runInNewContext(measurement[0], {
    document: { querySelector: () => bar, documentElement: { style: { setProperty(k, v) { properties[k] = v; } } } },
    ResizeObserver: class { constructor(fn) { fit = fn; } observe(target) { assert.equal(target, bar); } }
  });
  assert.equal(properties['--jk-top-clearance'], '81px');
  assert.equal(properties['--header-height'], '67px');
  bar.getBoundingClientRect = () => ({ bottom: 112 }); fit();
  assert.equal(properties['--jk-top-clearance'], '126px');
  const css = fs.readFileSync('moxie/jaack-moxie.css', 'utf8');
  assert.match(css, /\.layout\{[^}]*padding-top:var\(--jk-top-clearance\)/);
  assert.match(css, /\.mobile-menu\{margin-top:var\(--jk-top-clearance\);top:var\(--jk-top-clearance\)/);
  assert.match(css, /\.plan-month\{[^}]*scroll-margin-top:var\(--jk-top-clearance\)/);
  assert.doesNotMatch(css, /--jk-topbar-h/);
});
