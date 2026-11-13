const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const excluded = /^(?:assets\/jaack-design-system\/|moxie\/jaack-design-system\/|assets\/beeline\/|moxie\/dist\/)|\.min\.(?:css|js)$/;
const walk = dir => fs.readdirSync(path.join(root, dir), { withFileTypes: true })
  .flatMap(entry => {
    const file = `${dir}/${entry.name}`;
    if (excluded.test(`${file}/`)) return [];
    return entry.isDirectory() ? walk(file) : [file];
  });
const sources = ['assets', '_sass', '_includes', '_layouts', 'moxie'].flatMap(walk)
  .filter(file => /\.(?:css|sass|scss|js|html|liquid)$/.test(file) && !excluded.test(file));

function splitTransitions(value) {
  let depth = 0;
  return value.split('').map(char => {
    if (char === '(') depth++;
    if (char === ')') depth--;
    return char === ',' && depth === 0 ? '\n' : char;
  }).join('').split('\n');
}

const durationToken = /^--jk-(?:dur-[0-3]|d-(?:[0-3]|fast|fade|theme|pill|draw)|motion-(?:instant|quick|base|slow))$/;
const curveToken = /^--jk-(?:ease-out|ease-in|ease)$/;

function lint(source, file) {
  const errors = [];
  const text = source.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const [, args] of text.matchAll(/cubic-bezier\(([^)]+)\)/g)) {
    const controls = args.split(',').map(Number);
    if ([controls[1], controls[3]].some(y => !Number.isFinite(y) || y < 0 || y > 1)) errors.push('overshoot');
  }
  // Covers CSS/Sass, inline styles, JS style assignments and quoted JS object values.
  const declarations = /\b((?:transition|animation)(?:-[a-z-]+)?)\s*:\s*([^;{}\n]+)|\b((?:transition|animation)(?:Duration|Delay|TimingFunction)?)\s*=\s*(['"`])([^'"`\n]+)\4/g;
  // Sass declarations end at a newline; CSS and embedded CSS may wrap across lines.
  const input = file.endsWith('.sass') ? text : text.replace(/\r?\n/g, ' ');
  for (const match of input.matchAll(declarations)) {
    const property = match[1] || match[3];
    const value = (match[2] || match[5]).replace(/^['"`]|['"`,]$/g, '').trim();
    if (/^transition(?:-property)?$/.test(property) && splitTransitions(value).some(part => /^\s*all\b/i.test(part))) errors.push('transition all');
    for (const [, number, unit] of value.matchAll(/(?<![\w-])(\d*\.?\d+)(ms|s)\b/g)) {
      if (Number(number) * (unit === 's' ? 1000 : 1) > 280) errors.push('duration above 280ms');
    }
    for (const [, token] of value.matchAll(/var\((--[\w-]+)/g)) {
      if (!durationToken.test(token) && !curveToken.test(token)) errors.push(`non-Forma token ${token}`);
    }
    if (/^(?:transition|animation)(?:-duration|Duration)?$/.test(property) && !/^(?:none|initial|inherit|unset|revert)(?:\s|$)/.test(value)) {
      for (const part of splitTransitions(value)) {
        // Zero is documented for motion resets. ACP embeds may lack the token sheet;
        // their only nonzero literal allowance is the canonical 280ms token fallback.
        const withoutFallback = /^assets\/open_source_code\/acp-255-.*\.css$/.test(file)
          ? part.replace(/var\(--jk-d-3,\s*280ms\)/g, 'var(--jk-d-3)') : part;
        const times = [...withoutFallback.matchAll(/(?<![\w-])(\d*\.?\d+)(?:ms|s)\b/g)];
        if (times.some(([, n]) => Number(n) !== 0) ||
            (![...part.matchAll(/var\((--[\w-]+)/g)].some(([, token]) => durationToken.test(token)) && !times.some(([, n]) => Number(n) === 0))) errors.push('missing duration token');
      }
    }
  }
  // Web Animations API uses bare milliseconds rather than CSS time units.
  for (const [, duration] of text.matchAll(/\bduration\s*:\s*(\d+(?:\.\d+)?)/g)) {
    if (Number(duration) > 280) errors.push('duration above 280ms');
  }
  return errors;
}

test('motion lint enforces bounded Forma transitions across shipped source', () => {
  assert.ok(sources.includes('_sass/pages/tags.sass'));
  assert.ok(sources.includes('assets/open_source_code/acp-255-nyt.js'));
  assert.ok(sources.includes('moxie/cards.css'));
  for (const file of sources) assert.deepEqual(lint(read(file), file), [], file);
});

test('motion lint rejects unsafe CSS, Sass and JavaScript declarations', () => {
  for (const bad of ['transition:all 200ms;', 'transition: opacity var(--jk-d-1), all var(--jk-d-1);',
    'transition: color 120ms;', 'animation: fade .6s;', 'transition-duration:281ms;',
    'transition:\n color var(--jk-d-1),\n transform 500ms;', 'transition-property: all;',
    "node.style.transition = 'opacity .7s';", "node.style.animationDuration = '300ms';",
    'transition: color var(--duration-fast);', 'transition: color var(--jk-d-1) var(--ease-smooth-out);',
    'transition: opacity var(--jk-dur-2) var(--jk-ease-inout);',
    'transition: opacity var(--jk-dur-2) var(--jk-spring);',
    'transition: opacity var(--jk-ease-out);',
    'easing: cubic-bezier(.2,-.1,0,1)', 'easing: cubic-bezier(.2,0,0,1.1)',
    'element.animate([], { duration: 500 })']) {
    assert.ok(lint(bad, 'fixture.css').length > 0, bad);
  }
  for (const good of ['transition: opacity var(--jk-dur-2) var(--jk-ease-out);', 'transition: none;', 'transition-duration: 0ms !important;',
    'transition: color var(--jk-d-1) var(--jk-ease-out), transform var(--jk-d-2) var(--jk-ease-out);']) {
    assert.deepEqual(lint(good, 'fixture.css'), [], good);
  }
});

const delayGuard = '@media(prefers-reduced-motion:reduce){*,*::before,*::after{transition-delay:0ms!important;animation-delay:0ms!important;}';
test('built site and Moxie CSS zero both motion delays under reduced motion', () => {
  for (const file of ['_site/assets/css/jaack-site.css', 'moxie/dist/style.css']) {
    assert.ok(read(file).replace(/\s/g, '').includes(delayGuard), file);
  }
});

test('migrated site CSS preserves tokenized motion without the legacy inline sheet', () => {
  const html = read('_site/index.html');
  const inline = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(match => match[1]).join('\n');
  assert.doesNotMatch(read('_layouts/default.html'), /critical-css|scssify/);
  assert.match(html, /href="\/assets\/css\/site-structure\.css"/);
  assert.ok(inline.length < 2000, `${inline.length} bytes of inline CSS`);
  assert.match(read('_site/assets/css/site-structure.css'), /transition: color var\(--jk-d-1\) var\(--jk-ease-out\)/);
  assert.deepEqual(lint(inline, '_site/index.html'), []);
  assert.doesNotMatch(inline, /normalize\.css|fade-in-down|\.animated\b/);
});

const acpSource = read('assets/open_source_code/acp-255-nyt.js');
function loadACP({ reduced = false, observer = true } = {}) {
  const observers = [];
  const motion = { matches: reduced, addEventListener(event, fn) { assert.equal(event, 'change'); this.change = fn; } };
  class Element {
    constructor() {
      this.classes = new Set();
      this.classList = { add: name => this.classes.add(name), remove: name => this.classes.delete(name) };
      this.style = {};
    }
  }
  const elements = Array.from({ length: 12 }, () => new Element());
  elements.forEach(el => { el.parentElement = { querySelectorAll: () => elements }; });
  const context = {
    document: { body: {}, querySelectorAll: selector => selector === '.acp255-nyt .fade-in' ? elements : [] },
    window: {
      matchMedia(query) { assert.equal(query, '(prefers-reduced-motion: reduce)'); return motion; },
      addEventListener() {},
      getComputedStyle: () => ({ getPropertyValue: name => ({ '--jk-d-1': '120ms', '--jk-d-3': '280ms' })[name] })
    },
    HTMLElement: Element
  };
  if (observer) context.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; this.observed = new Set(); observers.push(this); }
    observe(el) { this.observed.add(el); }
    unobserve(el) { this.observed.delete(el); }
    disconnect() { this.observed.clear(); this.disconnected = true; }
  };
  vm.runInNewContext(acpSource, context);
  return { elements, observers, motion };
}

test('ACP reveals scroll entries with a token-based stagger capped at 280ms', () => {
  const { elements, observers } = loadACP();
  assert.ok(elements.every(el => el.classes.has('is-pending')));
  observers[0].callback(elements.map(target => ({ target, isIntersecting: true })));
  assert.deepEqual(elements.map(el => el.style.transitionDelay), ['0ms', '120ms', '240ms', ...Array(9).fill('280ms')]);
  assert.ok(elements.every(el => el.classes.has('is-visible') && !el.classes.has('is-pending')));
  assert.equal(observers[0].observed.size, 0);
});

test('ACP reduced motion and absent observer reveal everything immediately without delay', () => {
  for (const options of [{ reduced: true }, { observer: false }]) {
    const { elements, observers } = loadACP(options);
    assert.equal(observers.length, 0);
    assert.ok(elements.every(el => el.classes.has('is-visible') && !el.classes.has('is-pending') && el.style.transitionDelay === '0ms'));
  }
});

test('ACP changing to reduced motion reveals pending content and clears existing delays', () => {
  const { elements, observers, motion } = loadACP();
  observers[0].callback([{ target: elements[3], isIntersecting: true }]);
  assert.equal(elements[3].style.transitionDelay, '280ms');
  motion.matches = true;
  motion.change();
  assert.ok(observers[0].disconnected);
  assert.ok(elements.every(el => el.classes.has('is-visible') && !el.classes.has('is-pending') && el.style.transitionDelay === '0ms'));
});

test('ACP content is visible by default, with hidden states only for JS and allowed motion', () => {
  const css = read('_site/assets/open_source_code/acp-255-nyt.css');
  assert.match(css, /\.acp255-nyt \.fade-in\s*\{\s*opacity:\s*1;\s*transform:\s*none;/);
  assert.match(css, /@media \(prefers-reduced-motion: no-preference\)\s*\{\s*\.acp255-nyt \.fade-in\.is-pending\s*\{/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.acp255-nyt \.fade-in\s*\{\s*transition:\s*none;/);
  for (const dir of ['_layouts', '_includes', '_posts', '_notes', 'projects']) {
    for (const file of walk(dir)) assert.doesNotMatch(read(file), /class=["'][^"']*\bis-pending\b/, file);
  }
});

test('video checks reduced motion; Helicon chart renders without timed animation', () => {
  assert.match(read('assets/js/project-video.js'), /matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
  assert.doesNotMatch(read('assets/research/helicon/chart.js'), /requestAnimationFrame|setInterval|setTimeout|\.animate\s*\(|\btransition\b|\banimation\b/);
});

test('motion lint accepts every v2.1 duration and curve alias, retaining the ACP-only fallback', () => {
  const durations = ['dur-0', 'dur-1', 'dur-2', 'dur-3', 'd-0', 'd-1', 'd-2', 'd-3',
    'd-fast', 'd-fade', 'd-theme', 'd-pill', 'd-draw',
    'motion-instant', 'motion-quick', 'motion-base', 'motion-slow'];
  for (const duration of durations) {
    for (const curve of ['ease-out', 'ease-in', 'ease']) {
      assert.deepEqual(lint(`transition: opacity var(--jk-${duration}) var(--jk-${curve});`, 'fixture.css'), []);
    }
    assert.deepEqual(lint(`animation-duration: var(--jk-${duration});`, 'fixture.css'), []);
  }
  const fallback = 'transition: opacity var(--jk-d-3, 280ms) var(--jk-ease-out);';
  assert.deepEqual(lint(fallback, 'assets/open_source_code/acp-255-nyt.css'), []);
  assert.ok(lint(fallback, 'fixture.css').includes('missing duration token'));
});

function navigationErrors(source) {
  const text = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const errors = [];
  if (/\bstartViewTransition\b/.test(text)) errors.push('scripted view transition');
  if (/\bfade-in-down\b/.test(text)) errors.push('legacy page fade');
  for (const [, declaration] of text.matchAll(/@view-transition\s*\{([^}]*)\}/g)) {
    if (!/^\s*navigation\s*:\s*none\s*;?\s*$/.test(declaration)) errors.push('navigation view transition');
  }
  for (const block of text.split('}')) {
    const opening = block.lastIndexOf('{');
    if (opening < 0) continue;
    const selectors = block.slice(0, opening).split('{').at(-1);
    const declarations = block.slice(opening + 1);
    const page = selectors.split(',').some(selector => {
      const target = selector.trim().split(/\s+|[>+~]/).filter(Boolean).at(-1) || '';
      return /^(?:html|body|main|#main-content|\.(?:jk-page|page|post|home|writing|projects|wrapper-(?:normal|large|xwide)))(?=$|[.#:[\]])/.test(target);
    });
    if (page && /(?:transition(?:-property)?\s*:\s*[^;]*(?:opacity|\ball\b)|animation(?:-name)?\s*:\s*(?!none\b)[^;]*|opacity\s*:\s*(?:0(?:\.\d+)?|\.\d+)\s*[;}])/i.test(declarations + '}')) {
      errors.push('page-level fade or animation');
    }
  }
  if (/document\.(?:body|documentElement)\.style\.(?:opacity|transition|animation)\s*=/.test(text)) errors.push('scripted page motion');
  return errors;
}

test('shipped source keeps page changes instant and explicitly opts out of view transitions', () => {
  const pages = ['_posts', '_notes', 'projects', 'en', 'team1'].flatMap(walk)
    .filter(file => /\.(?:md|html|css|js|liquid)$/.test(file) && !excluded.test(file));
  const topLevel = fs.readdirSync(root).filter(file => /\.(?:html|md)$/.test(file));
  for (const file of new Set([...sources, ...pages, ...topLevel])) {
    assert.deepEqual(navigationErrors(read(file)), [], file);
  }
  assert.match(read('assets/css/jaack-site.css'), /@view-transition\s*\{\s*navigation:\s*none;\s*\}/);
  assert.match(read('_site/assets/css/jaack-site.css'), /@view-transition\s*\{\s*navigation:\s*none;\s*\}/);
});

test('navigation guard rejects view transitions and page fades while allowing photo fades', () => {
  for (const bad of ['document.startViewTransition(update)', '@view-transition { navigation: auto; }',
    '.fade-in-down { opacity: 0; }', 'body { transition: opacity var(--jk-dur-2); }',
    'html.is-leaving { opacity: 0; }', '.jk-page { animation: fade var(--jk-dur-2); }',
    '.wrapper-large { transition: opacity var(--jk-dur-2); }', 'main { transition-property: opacity; }',
    'document.body.style.opacity = 0;']) assert.ok(navigationErrors(bad).length, bad);
  assert.deepEqual(navigationErrors('@view-transition { navigation: none; }'), []);
  assert.deepEqual(navigationErrors('img.jk-photo-3x2 { transition: opacity var(--jk-dur-2); }'), []);
  assert.deepEqual(navigationErrors('.jk-page > .card { transition: opacity var(--jk-dur-2); }'), []);
});

const photoSelector = 'img:is(.jk-photo-3x2, .jk-photo-4x5, .jk-photo-1x1)';
function loadPhotos({ reduced = false } = {}) {
  function image(className, complete = false, naturalWidth = 0) {
    const classes = new Set([className]);
    return { complete, naturalWidth, loading: 'lazy', classes, listeners: {},
      classList: { add: name => classes.add(name) },
      addEventListener(event, callback, options) { this.listeners[event] = callback; assert.equal(options.once, true); }
    };
  }
  const photos = [image('jk-photo-3x2'), image('jk-photo-4x5'), image('jk-photo-1x1'),
    image('jk-photo-3x2', true, 800), image('jk-photo-3x2', true, 0)];
  const excludedImages = ['app-icon', 'app-monogram', 'logo', 'figure--diagram'].map(name => image(name));
  vm.runInNewContext(read('assets/js/photo-fade.js'), {
    window: { matchMedia(query) { assert.equal(query, '(prefers-reduced-motion: reduce)'); return { matches: reduced }; } },
    document: { querySelectorAll(selector) { assert.equal(selector, photoSelector); return photos; } }
  });
  return { photos, excludedImages };
}

test('only photographs fade after load, preserving lazy loading without timers or network', () => {
  const { photos, excludedImages } = loadPhotos();
  for (const photo of photos.slice(0, 3)) {
    assert.ok(!photo.classes.has('is-loaded'));
    assert.equal(photo.loading, 'lazy');
    photo.listeners.load();
    assert.ok(photo.classes.has('is-loaded'));
  }
  assert.ok(excludedImages.every(image => !image.classes.has('is-loaded')));
  assert.doesNotMatch(read('assets/js/photo-fade.js'), /setTimeout|setInterval|requestAnimationFrame|\.style\b|\.loading\s*=|\.src\s*=/);
});

test('cached photos and cached failures reveal immediately; later errors reveal pending photos', () => {
  const { photos } = loadPhotos();
  assert.ok(photos[3].classes.has('is-loaded'), 'cached successful photo');
  assert.ok(photos[4].classes.has('is-loaded'), 'cached failed photo');
  photos[0].listeners.error();
  assert.ok(photos[0].classes.has('is-loaded'));
});

test('reduced motion reveals all photos immediately, including pending lazy images', () => {
  assert.ok(loadPhotos({ reduced: true }).photos.every(photo => photo.classes.has('is-loaded')));
});

test('photo CSS fades opacity for 200ms, preserves aspect ratios and overrides reduced motion explicitly', () => {
  const css = read('assets/css/jaack-site.css');
  const rule = css.split(`${photoSelector} {`)[1].split('}')[0];
  assert.equal(rule.trim(), 'opacity: 0;\n  transition: opacity var(--jk-dur-2) var(--jk-ease-out);');
  assert.ok(css.includes(`${photoSelector}.is-loaded { opacity: 1; }`));
  assert.ok(css.includes(`@media (prefers-reduced-motion: reduce) {\n  ${photoSelector} { opacity: 1; transition: none; }\n}`));
  for (const [format, ratio] of [['3x2', '3 / 2'], ['4x5', '4 / 5'], ['1x1', '1 / 1']]) {
    assert.ok(css.includes(`.jk-photo-${format} { aspect-ratio: ${ratio}; object-fit: cover; }`));
  }
  assert.match(css, /\.jk-photo-3x2\.jk-photo-contain \{ object-fit: contain;/);
  assert.match(read('assets/jaack-design-system/tokens.css'), /--jk-dur-2:\s*200ms;/);
  assert.match(read('_layouts/default.html'), /src="\{\{ '\/assets\/js\/photo-fade\.js' \| relative_url \}\}" defer/);
  assert.match(read('_site/index.html'), /<script src="\/assets\/js\/photo-fade\.js" defer><\/script>/);
  assert.equal(read('_site/assets/js/photo-fade.js'), read('assets/js/photo-fade.js'));
});
