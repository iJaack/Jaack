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
      if (!/^--jk-(?:d-[123]|ease-out)$/.test(token)) errors.push(`non-Forma token ${token}`);
    }
    if (/^(?:transition|animation)(?:-duration|Duration)?$/.test(property) && !/^(?:none|initial|inherit|unset|revert)(?:\s|$)/.test(value)) {
      for (const part of splitTransitions(value)) {
        // Zero is documented for motion resets. ACP embeds may lack the token sheet;
        // their only nonzero literal allowance is the canonical 280ms token fallback.
        const withoutFallback = /^assets\/open_source_code\/acp-255-.*\.css$/.test(file)
          ? part.replace(/var\(--jk-d-3,\s*280ms\)/g, 'var(--jk-d-3)') : part;
        const times = [...withoutFallback.matchAll(/(?<![\w-])(\d*\.?\d+)(?:ms|s)\b/g)];
        if (times.some(([, n]) => Number(n) !== 0) ||
            (!/var\(--jk-d-[123]\b/.test(part) && !times.some(([, n]) => Number(n) === 0))) errors.push('missing duration token');
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
    'easing: cubic-bezier(.2,-.1,0,1)', 'easing: cubic-bezier(.2,0,0,1.1)',
    'element.animate([], { duration: 500 })']) {
    assert.ok(lint(bad, 'fixture.css').length > 0, bad);
  }
  for (const good of ['transition: none;', 'transition-duration: 0ms !important;',
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
