const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('assets/js/project-video.js', 'utf8');

function load({ id = 'demo', reduced = false, desktop = false, saveData = false, paused = false, storageFails = false, frameCallback = true } = {}) {
  const attrs = new Map();
  const button = { hidden: true, setAttribute: (key, value) => attrs.set(key, value) };
  const flags = new Set();
  const media = value => ({ matches: value, addEventListener(name, callback) { this.change = callback; } });
  const motion = media(reduced), wide = media(desktop), connection = media(false);
  connection.saveData = saveData;
  const stage = {};
  const pending = [];
  const frames = new Map(), timers = new Map(), listeners = new Map();
  let sequence = 0;
  const video = {
    preload: 'none', autoplay: false, sources: [], plays: 0, loads: 0, paused: true,
    videoWidth: 0, currentTime: 0, readyState: 0,
    addEventListener(event, callback) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(callback);
    },
    removeEventListener(event, callback) { listeners.get(event)?.delete(callback); },
    pause() { this.paused = true; },
    load() { this.loads++; },
    replaceChildren(...sources) { this.sources = sources; },
    play() {
      this.plays++;
      this.paused = false;
      return new Promise((resolve, reject) => pending.push({ resolve, reject }));
    }
  };
  if (frameCallback) {
    video.requestVideoFrameCallback = callback => { frames.set(++sequence, callback); return sequence; };
    video.cancelVideoFrameCallback = handle => frames.delete(handle);
  }
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
    setTimeout(callback, delay) {
      assert.equal(delay, 500);
      timers.set(++sequence, callback);
      return sequence;
    },
    clearTimeout: handle => timers.delete(handle),
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
  return { button, flags, video, motion, wide, connection, storage, attrs, frames, timers, listeners,
    paint() {
      const entry = frames.entries().next().value;
      assert.ok(entry, 'a frame callback is pending');
      frames.delete(entry[0]);
      entry[1]();
    },
    emit(event) { for (const callback of [...(listeners.get(event) || [])]) callback(); },
    timeout() {
      const entry = timers.entries().next().value;
      assert.ok(entry, 'a fallback timeout is pending');
      timers.delete(entry[0]);
      entry[1]();
    },
    view(ratio) { intersect([{ isIntersecting: ratio > 0, intersectionRatio: ratio }]); },
    batch(ratios) { intersect(ratios.map(ratio => ({ isIntersecting: ratio > 0, intersectionRatio: ratio }))); },
    language(lang) { html.lang = lang; language(); },
    async resolve() { pending.shift().resolve(); await Promise.resolve(); },
    async reject() { pending.shift().reject(Error('blocked')); await Promise.resolve(); await Promise.resolve(); }
  };
}

test('the script stays below 2.5 KB and safely exits without a figure', () => {
  assert.ok(Buffer.byteLength(source) < 2560);
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
  assert.equal(p.flags.has('data-pv-ready'), false);
  p.paint();
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
    p.paint();
    assert.equal(p.flags.has('data-pv-ready'), true);
    assert.equal(p.attrs.get('aria-label'), 'Pause video');
  }
});

test('user pause survives visibility changes and labels follow the site language', async () => {
  const p = load();
  p.view(1);
  await p.resolve();
  p.paint();
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
    p.paint();
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
    p.paint();
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
  p.paint();
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
  p.paint();
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
  p.paint();
  p.view(0);
  p.view(1);
  await p.resolve();
  p.paint();
  assert.equal(p.video.loads, 1);
  p.wide.matches = true;
  p.wide.change();
  assert.equal(p.video.loads, 2);
  assert.match(p.video.sources[0].src, /wide\.webm$/);
  await p.resolve();
  p.paint();
  p.wide.change();
  assert.equal(p.video.loads, 2);
  await p.resolve();
  p.paint();
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
  p.paint();
});

test('width changes outside the visibility gate defer source replacement until visible', async () => {
  const p = load();
  p.view(1);
  await p.resolve();
  p.paint();
  p.view(0);
  p.wide.matches = true;
  p.wide.change();
  assert.equal(p.video.loads, 1);
  assert.equal(p.video.autoplay, false);
  p.view(.25);
  assert.equal(p.video.loads, 2);
  assert.match(p.video.sources[0].src, /wide\.webm$/);
  await p.resolve();
  p.paint();
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

test('stale play resolutions cannot register a frame callback', async () => {
  const p = load();
  p.view(1);
  p.view(0);
  await p.resolve();
  assert.equal(p.frames.size, 0);
  assert.equal(p.flags.has('data-pv-ready'), false);
});

test('pending frame callbacks cannot reveal video after width, preference or visibility changes', async () => {
  for (const change of ['width', 'motion', 'connection', 'visibility', 'pause']) {
    const p = load();
    p.view(1);
    await p.resolve();
    const stale = [...p.frames.values()][0];
    if (change === 'width') {
      p.wide.matches = true;
      p.wide.change();
    } else if (change === 'motion') {
      p.motion.matches = true;
      p.motion.change();
    } else if (change === 'connection') {
      p.connection.saveData = true;
      p.connection.change();
    } else if (change === 'visibility') p.view(0);
    else p.button.onclick();
    assert.equal(p.frames.size, 0);
    stale();
    assert.equal(p.flags.has('data-pv-ready'), false, change);
    if (change === 'width') {
      await p.resolve();
      assert.equal(p.flags.has('data-pv-ready'), false);
      p.paint();
      assert.equal(p.flags.has('data-pv-ready'), true);
    }
  }
});

test('fallback events require video dimensions and evidence of a frame', async () => {
  for (const event of ['timeupdate', 'playing', 'loadeddata']) {
    for (const evidence of ['currentTime', 'readyState']) {
      const p = load({ frameCallback: false });
      p.view(1);
      await p.resolve();
      assert.equal(p.flags.has('data-pv-ready'), false);
      p.video[evidence] = evidence === 'currentTime' ? .01 : 2;
      p.emit(event);
      assert.equal(p.flags.has('data-pv-ready'), false);
      p.video[evidence] = 0;
      p.video.videoWidth = 720;
      p.emit(event);
      assert.equal(p.flags.has('data-pv-ready'), false);
      p.video[evidence] = evidence === 'currentTime' ? .01 : 2;
      p.emit(event);
      assert.equal(p.flags.has('data-pv-ready'), true);
      assert.equal(p.timers.size, 0);
      assert.ok([...p.listeners.values()].every(callbacks => callbacks.size === 0));
    }
  }
});

test('fallback timeout requires video dimensions and later events can still reveal a frame', async () => {
  for (const width of [0, 720]) {
    const p = load({ frameCallback: false });
    p.view(1);
    await p.resolve();
    p.video.videoWidth = width;
    p.timeout();
    assert.equal(p.flags.has('data-pv-ready'), width > 0);
    if (!width) {
      p.video.videoWidth = 720;
      p.video.readyState = 2;
      p.emit('loadeddata');
      assert.equal(p.flags.has('data-pv-ready'), true);
    }
    assert.ok([...p.listeners.values()].every(callbacks => callbacks.size === 0));
  }
});

test('fallback waiters are cleaned up and stale events or timeouts cannot restore ready', async () => {
  for (const change of ['width', 'motion', 'connection', 'visibility', 'pause']) {
    const p = load({ frameCallback: false });
    p.view(1);
    await p.resolve();
    const staleEvent = [...p.listeners.get('loadeddata')][0];
    const staleTimeout = [...p.timers.values()][0];
    if (change === 'width') {
      p.wide.matches = true;
      p.wide.change();
    } else if (change === 'motion') {
      p.motion.matches = true;
      p.motion.change();
    } else if (change === 'connection') {
      p.connection.saveData = true;
      p.connection.change();
    } else if (change === 'visibility') p.view(0);
    else p.button.onclick();
    assert.equal(p.timers.size, 0);
    assert.ok([...p.listeners.values()].every(callbacks => callbacks.size === 0));
    p.video.videoWidth = 720;
    p.video.readyState = 2;
    staleEvent();
    staleTimeout();
    assert.equal(p.flags.has('data-pv-ready'), false, change);
  }
});
