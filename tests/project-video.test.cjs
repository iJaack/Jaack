const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('assets/js/project-video.js', 'utf8');

function load({ id = 'demo', reduced = false, desktop = false, saveData = false, paused = false, storageFails = false } = {}) {
  const attrs = new Map();
  const button = { hidden: true, setAttribute: (key, value) => attrs.set(key, value) };
  const flags = new Set();
  const media = value => ({ matches: value, addEventListener(name, callback) { this.change = callback; } });
  const motion = media(reduced), wide = media(desktop), connection = media(false);
  connection.saveData = saveData;
  const stage = {};
  const pending = [];
  const video = {
    preload: 'none', autoplay: false, sources: [], plays: 0, loads: 0, paused: true,
    pause() { this.paused = true; },
    load() { this.loads++; },
    replaceChildren(...sources) { this.sources = sources; },
    play() {
      this.plays++;
      this.paused = false;
      return new Promise((resolve, reject) => pending.push({ resolve, reject }));
    }
  };
  const figure = {
    dataset: { pv: id, pvSrc: '/assets/images/work/' + id + '/' + id + '-site-' },
    querySelector: selector => ({ video, button, '.pv-stage': stage })[selector],
    toggleAttribute(key, value) { value ? flags.add(key) : flags.delete(key); },
    setAttribute(key) { flags.add(key); },
    removeAttribute(key) { flags.delete(key); }
  };
  const html = { lang: 'en' };
  let intersect, language;
  const storage = { ['jk.pv.' + id]: paused ? '1' : '0' };
  vm.runInNewContext(source, {
    document: { querySelector: () => figure, documentElement: html,
      createElement(tag) { assert.equal(tag, 'source'); return {}; } },
    navigator: { connection },
    matchMedia: query => query.includes('reduced-motion') ? motion : wide,
    sessionStorage: storageFails ? new Proxy({}, {
      get() { throw Error('blocked'); }, set() { throw Error('blocked'); }
    }) : storage,
    IntersectionObserver: class {
      constructor(callback, options) { intersect = callback; assert.ok(options.threshold.includes(.25)); }
      observe(target) { assert.equal(target, stage); }
    },
    MutationObserver: class {
      constructor(callback) { language = callback; }
      observe(target) { assert.equal(target, html); }
    }
  });
  return { button, flags, video, motion, wide, connection, storage, attrs,
    view(ratio) { intersect([{ isIntersecting: ratio > 0, intersectionRatio: ratio }]); },
    batch(ratios) { intersect(ratios.map(ratio => ({ isIntersecting: ratio > 0, intersectionRatio: ratio }))); },
    language(lang) { html.lang = lang; language(); },
    async resolve() { pending.shift().resolve(); await Promise.resolve(); },
    async reject() { pending.shift().reject(Error('blocked')); await Promise.resolve(); await Promise.resolve(); }
  };
}

test('the script stays below 2 KB and safely exits without a figure', () => {
  assert.ok(Buffer.byteLength(source) < 2048);
  vm.runInNewContext(source, { document: { querySelector: () => null } });
});

test('pause storage uses the project id from the figure', () => {
  const p = load({ id: 'another-project', paused: true });
  p.view(1);
  assert.equal(p.video.plays, 0);
  p.button.onclick();
  assert.deepEqual(p.storage, { 'jk.pv.another-project': '0' });
  p.button.onclick();
  assert.deepEqual(p.storage, { 'jk.pv.another-project': '1' });
});

test('visibility gates playback; system pause preserves the user control state', async () => {
  const p = load();
  assert.equal(p.video.plays, 0);
  assert.equal(p.video.preload, 'none');
  assert.equal(p.video.sources.length, 0);
  assert.equal(p.video.autoplay, false);
  assert.equal(p.button.hidden, false);
  p.view(.24);
  assert.equal(p.video.plays, 0);
  assert.equal(p.video.sources.length, 0);
  p.view(.25);
  assert.equal(p.video.preload, 'auto');
  assert.equal(p.video.autoplay, true);
  assert.equal(p.video.plays, 1);
  assert.equal(p.flags.has('data-pv-ready'), false);
  await p.resolve();
  assert.equal(p.flags.has('data-pv-ready'), true);
  p.view(0);
  assert.equal(p.video.paused, true);
  assert.equal(p.video.autoplay, false);
  assert.equal(p.attrs.get('aria-label'), 'Pause video');
  assert.equal(p.storage['jk.pv.demo'], '0');
  p.view(.6);
  assert.equal(p.video.plays, 2);
});

test('reduced motion, save-data and remembered pause stay on the poster until explicit play', async () => {
  for (const options of [{ reduced: true }, { saveData: true }, { paused: true }]) {
    const p = load(options);
    p.view(1);
    assert.equal(p.video.preload, 'none');
    assert.equal(p.video.plays, 0);
    assert.equal(p.video.loads, 0);
    assert.equal(p.video.sources.length, 0);
    assert.equal(p.video.autoplay, false);
    p.wide.matches = true;
    p.wide.change();
    assert.equal(p.video.sources.length, 0);
    assert.equal(p.video.loads, 0);
    assert.equal(p.attrs.get('aria-label'), 'Play video');
    p.button.onclick();
    assert.equal(p.video.plays, 1);
    assert.equal(p.video.sources.length, 2);
    assert.match(p.video.sources[0].src, /wide\.webm$/);
    assert.equal(p.video.autoplay, true);
    await p.resolve();
    assert.equal(p.flags.has('data-pv-ready'), true);
    assert.equal(p.attrs.get('aria-label'), 'Pause video');
  }
});

test('user pause survives visibility changes and labels follow the site language', async () => {
  const p = load();
  p.view(1);
  await p.resolve();
  p.button.onclick();
  assert.equal(p.video.paused, true);
  assert.equal(p.storage['jk.pv.demo'], '1');
  assert.equal(p.attrs.get('aria-label'), 'Play video');
  p.language('it');
  assert.equal(p.attrs.get('aria-label'), 'Riproduci video');
  assert.equal(p.button.title, 'Riproduci video');
  p.view(0);
  p.view(1);
  assert.equal(p.video.plays, 1);
  p.button.onclick();
  assert.equal(p.storage['jk.pv.demo'], '0');
  assert.equal(p.attrs.get('aria-label'), 'Pausa video');
  assert.equal(p.attrs.has('aria-pressed'), false);
});

test('preference changes while watching restore the poster, including after manual opt-in', async () => {
  for (const preference of ['motion', 'connection']) {
    const p = load();
    p.view(1);
    await p.resolve();
    if (preference === 'motion') p.motion.matches = true;
    else p.connection.saveData = true;
    p[preference].change();
    assert.equal(p.video.paused, true);
    assert.equal(p.video.preload, 'none');
    assert.equal(p.flags.has('data-pv-ready'), false);
    assert.equal(p.attrs.get('aria-label'), 'Play video');
    p.view(0);
    p.view(1);
    assert.equal(p.video.plays, 1);
    p.button.onclick();
    await p.resolve();
    assert.equal(p.flags.has('data-pv-ready'), true);
    p[preference].change();
    assert.equal(p.flags.has('data-pv-ready'), false);
  }
});

test('play rejection restores the poster and explicit play can retry', async () => {
  const p = load();
  p.view(1);
  await p.reject();
  assert.equal(p.flags.has('data-pv-ready'), false);
  assert.equal(p.attrs.get('aria-label'), 'Play video');
  assert.equal(p.video.preload, 'none');
  p.button.onclick();
  await p.resolve();
  assert.equal(p.flags.has('data-pv-ready'), true);
});

test('a stale play rejection after scrolling does not disable autoplay', async () => {
  const p = load();
  p.view(1);
  p.view(0);
  await p.reject();
  assert.equal(p.attrs.get('aria-label'), 'Pause video');
  p.view(1);
  await p.resolve();
  assert.equal(p.flags.has('data-pv-ready'), true);
});

test('source injection selects only the current width and prefers WebM to MP4', () => {
  for (const desktop of [false, true]) {
    const p = load({ id: 'another-project', desktop });
    assert.equal(p.video.sources.length, 0);
    p.view(1);
    assert.deepEqual(p.video.sources.map(s => ({ ...s })), ['webm', 'mp4'].map(ext => ({
      src: `/assets/images/work/another-project/another-project-site-${desktop ? 'wide' : 'compact'}.${ext}`,
      type: `video/${ext}`
    })));
    assert.equal(p.video.loads, 1);
  }
});

test('sources reload only after width-class changes, deferring loads while preferences block', async () => {
  const p = load();
  p.view(1);
  await p.resolve();
  p.view(0);
  p.view(1);
  await p.resolve();
  assert.equal(p.video.loads, 1);
  p.wide.matches = true;
  p.wide.change();
  assert.equal(p.video.loads, 2);
  assert.match(p.video.sources[0].src, /wide\.webm$/);
  await p.resolve();
  p.wide.change();
  assert.equal(p.video.loads, 2);
  await p.resolve();
  p.motion.matches = true;
  p.motion.change();
  p.wide.matches = false;
  p.wide.change();
  assert.equal(p.video.loads, 2);
  assert.equal(p.video.preload, 'none');
  p.button.onclick();
  assert.equal(p.video.loads, 3);
  assert.match(p.video.sources[0].src, /compact\.webm$/);
  await p.resolve();
});

test('width changes outside the visibility gate defer source replacement until visible', async () => {
  const p = load();
  p.view(1);
  await p.resolve();
  p.view(0);
  p.wide.matches = true;
  p.wide.change();
  assert.equal(p.video.loads, 1);
  assert.equal(p.video.autoplay, false);
  p.view(.25);
  assert.equal(p.video.loads, 2);
  assert.match(p.video.sources[0].src, /wide\.webm$/);
  await p.resolve();
});

test('storage denial leaves pause and play available', () => {
  const p = load({ storageFails: true });
  p.view(1);
  p.button.onclick();
  assert.equal(p.video.paused, true);
  p.button.onclick();
  assert.equal(p.video.plays, 2);
});

test('batched visibility entries use the latest intersection', () => {
  const p = load();
  p.batch([.5, 0]);
  assert.equal(p.video.plays, 0);
  p.batch([0, .5]);
  assert.equal(p.video.plays, 1);
});
