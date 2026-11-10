const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const design = 'assets/jaack-design-system';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const files = dir => fs.readdirSync(path.join(root, dir), { withFileTypes: true })
  .flatMap(entry => entry.isDirectory() ? files(`${dir}/${entry.name}`) : [`${dir}/${entry.name}`]);
const cssIn = dir => files(dir).filter(file => file.endsWith('.css'));
const stripComments = css => css.replace(/\/\*[\s\S]*?\*\//g, '');
const theme = (css, name) => {
  const match = css.match(new RegExp(`html\\[data-theme="${name}"\\]\\s*\\{([^}]+)\\}`));
  assert.ok(match, `missing ${name} theme`);
  return Object.fromEntries([...match[1].matchAll(/(--jk-[\w-]+)\s*:\s*([^;]+);/g)]
    .map(([, key, value]) => [key, value.trim()]));
};
const normalize = value => value.replace(/\s/g, '').replace(/(?<=[,(])0\.(\d+)/g, '.$1');

test('all shipped CSS is free of pure black (including built inline styles)', () => {
  // No allowlist is needed: alpha masks use white; shadows use warm ink.
  const shipped = [...cssIn('assets/css'), `${design}/jaack.css`, `${design}/tokens.css`,
    ...cssIn(`${design}/components`), ...fs.readdirSync(path.join(root, 'moxie'))
      .filter(file => file.endsWith('.css')).map(file => `moxie/${file}`),
    'moxie/jaack-design-system/jaack.css'];
  const pureBlack = /#000\b|#000000|(?<![-\w])black\b|rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)/i;
  for (const file of shipped) assert.doesNotMatch(read(file), pureBlack, file);
  for (const file of files('_site').filter(file => file.endsWith('.html'))) {
    for (const [, css] of read(file).matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
      assert.doesNotMatch(css, pureBlack, file);
    }
  }
  for (const file of shipped.filter(file => file.endsWith('.css'))) {
    assert.doesNotMatch(read(file), /rgba\(\s*0\s*,\s*0\s*,\s*0\s*,/i, file);
  }
});

test('both themes match the local spec palettes, including the three dark backgrounds', () => {
  const palettes = JSON.parse(read('tests/forma-v2/palettes.json'));
  const sources = { [Object.keys(palettes)[0]]: `${design}/tokens.css`,
    'jaack.me': 'assets/css/jaack-site.css', moxie: 'moxie/jaack-moxie.css' };
  const names = { ink2: 'ink-2', accentText: 'accent-text', onAccent: 'on-accent' };
  for (const [name, source] of Object.entries(sources)) {
    for (const [mode, palette] of Object.entries(palettes[name])) {
      const actual = theme(read(source), mode);
      for (const [key, value] of Object.entries(palette)) {
        assert.equal(normalize(actual[`--jk-${names[key] || key}`]), normalize(value), `${name} ${mode} ${key}`);
      }
    }
  }
  for (const [source, bg] of [[`${design}/tokens.css`, '#14110e'],
    ['assets/css/jaack-site.css', '#161210'], ['moxie/jaack-moxie.css', '#13120f']]) {
    assert.equal(theme(read(source), 'dark')['--jk-bg'], bg);
  }
});

test('shared rhythm and motion follow Forma v2 with reduced motion and a static opt-in veil', () => {
  const tokens = read(`${design}/tokens.css`);
  for (const [name, value] of Object.entries({ 's20': '80px', 's24': '96px', 's32': '128px',
    lh: '1.6', 'fs-body': '17px', 'fs-lede': '20px', 'row-pad': '12px', 'row-pad-data': '9px',
    'group-gap': '48px', 'hero-gap': '32px', 'chapter-gap': '128px', 'chapter-gap-m': '72px',
    'page-x': 'clamp(20px,6vw,120px)', measure: '64ch' })) {
    assert.ok(tokens.includes(`--jk-${name}:${value};`), name);
  }
  for (const file of [`${design}/tokens.css`, ...cssIn(`${design}/components`)]) {
    const css = stripComments(read(file));
    for (const [, number, unit] of css.matchAll(/(?<![\w-])(\d*\.?\d+)(ms|s)\b/g)) {
      assert.ok(Number(number) * (unit === 's' ? 1000 : 1) <= 280, `${file}: ${number}${unit}`);
    }
    assert.doesNotMatch(css, /jkdrift|--jk-spring:linear|\binfinite\b/, file);
    for (const [, args] of css.matchAll(/cubic-bezier\(([^)]+)\)/g)) {
      for (const control of args.split(',').map(Number)) assert.ok(control >= 0 && control <= 1, file);
    }
  }
  for (const [index, duration] of [[1, 120], [2, 200], [3, 280]]) {
    assert.match(tokens, new RegExp(`--jk-d-${index}:\\s*${duration}ms;`));
  }
  assert.match(tokens, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(tokens, /:root\{--jk-d-1:0ms;--jk-d-2:0ms;--jk-d-3:0ms\}/);
  assert.match(tokens, /animation-duration:0ms!important;animation-iteration-count:1!important;transition-duration:0ms!important;scroll-behavior:auto!important/);
  assert.match(read(`${design}/theme.js`), /\},220\)/);
  const background = read(`${design}/components/background.css`);
  assert.match(background, /\.jk-bg\{display:none;/);
  assert.match(background, /html\[data-jk-veil\] \.jk-bg\{display:block\}/);
  assert.doesNotMatch(background, /animation|will-change|@keyframes/);
  assert.doesNotMatch(read(`${design}/components/background.js`), /scroll|translate|requestAnimationFrame/);
  assert.doesNotMatch(read('_layouts/default.html'), /class="jk-bg"/);
  assert.ok(!fs.existsSync(path.join(root, '_includes/progress-bar.html')));
  assert.doesNotMatch(read('_layouts/post.html'), /progress-bar/);
  for (const source of ['assets/css/jaack-site.css', 'moxie/jaack-moxie.css']) {
    assert.doesNotMatch(read(source), /--jk-bg-[123]/);
  }
});

test('Newsreader uses the supplied 400–700 subsets, fits its budget and preloads only roman in built heads', () => {
  const css = read('assets/css/jaack-site.css');
  const faces = [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(match => match[1]);
  assert.equal(faces.length, 2);
  for (const [index, face] of faces.entries()) {
    assert.match(face, /font-family:\s*"Newsreader"/);
    assert.match(face, /font-weight:\s*400 700/);
    assert.match(face, /font-display:\s*swap/);
    assert.ok(face.includes(`Newsreader-${index ? 'italic' : 'roman'}.woff2`));
    assert.ok(face.includes(`font-style: ${index ? 'italic' : 'normal'}`));
  }
  const fonts = files('assets/fonts/newsreader');
  assert.ok(fonts.includes('assets/fonts/newsreader/OFL.txt'));
  assert.ok(!fonts.some(file => file.endsWith('Newsreader-carta.woff2')));
  const total = fonts.filter(file => file.endsWith('.woff2'))
    .reduce((sum, file) => sum + fs.statSync(path.join(root, file)).size, 0);
  assert.ok(total <= 240000, `${total} bytes exceeds 240 KB`);
  for (const file of files('_site').filter(file => file.endsWith('.html'))) {
    const head = read(file).match(/<head>([\s\S]*?)<\/head>/i)?.[1];
    if (!head || !head.includes('/assets/css/jaack-site.css')) continue;
    const preloads = [...head.matchAll(/<link\b[^>]*rel="preload"[^>]*>/g)]
      .map(match => match[0]).filter(link => /as="font"/.test(link));
    assert.equal(preloads.length, 1, file);
    assert.match(preloads[0], /href="\/assets\/fonts\/newsreader\/Newsreader-roman\.woff2"/);
    assert.match(preloads[0], /type="font\/woff2"/);
    assert.match(preloads[0], /\bcrossorigin\b/);
  }
  assert.match(read('_site/index.html'), /Newsreader-roman\.woff2/);
  assert.match(css, /--jk-serif: "Newsreader", "Iowan Old Style", Georgia, serif/);
  assert.match(css, /\.post-body\s*\{[^}]*font-family: var\(--jk-serif\); font-size: 19px; line-height: 1.6; font-weight: 400/);
});

test('phone navigation wraps whole labels without clipping and keeps 44px targets', () => {
  const css = stripComments(read('assets/css/jaack-site.css'));
  const phone = css.match(/@media \(max-width: 480px\) \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(phone, 'missing phone navigation rules');
  const links = phone.match(/nav\.site-nav \.nav-links\s*\{([^}]+)\}/)?.[1];
  assert.match(links, /flex-wrap:\s*wrap;/);
  assert.match(links, /overflow:\s*visible;/);
  assert.match(phone, /nav\.site-nav \.nav-links li\s*\{[^}]*flex:\s*none;/);
  const targets = css.match(/nav\.site-nav\.jk-top \.nav-links a\.jk-sw\s*\{([^}]+)\}/)?.[1];
  assert.match(targets, /min-height:\s*44px;/);
  const phoneTargets = phone.match(/nav\.site-nav\.jk-top \.nav-links a\.jk-sw\s*\{([^}]+)\}/)?.[1];
  assert.match(phoneTargets, /white-space:\s*nowrap;/);
  assert.match(phoneTargets, /padding:\s*6px 6px;/);
  for (const [, rule] of css.matchAll(/[^{}]*\.nav-links[^{}]*\ba(?:\.jk-sw)?[^{}]*\{([^}]+)\}/g)) {
    assert.doesNotMatch(rule, /text-overflow:\s*ellipsis|overflow(?:-x)?:\s*(?:hidden|clip)/);
  }
});

test('includes and layouts never request Google Fonts', () => {
  for (const file of [...files('_includes'), ...files('_layouts')]) {
    assert.doesNotMatch(read(file), /fonts\.googleapis\.com/i, file);
  }
});

test('Carta keeps its paper stage with a dark token border and no dark shadow', () => {
  const css = read('assets/css/jaack-site.css');
  const stage = css.match(/^\.pv-stage\s*\{([^}]+)\}/m)?.[1];
  assert.match(stage, /background:\s*#F5F1E8 var\(--pv-grain, none\)/);
  const dark = css.match(/html\[data-theme="dark"\] \.pv-stage\s*\{([^}]+)\}/)?.[1];
  assert.match(dark, /box-sizing:\s*border-box;/);
  assert.match(dark, /border:\s*1px solid var\(--jk-surface-2\);/);
  assert.match(dark, /box-shadow:\s*none;/);
  assert.doesNotMatch(dark, /inset|0 24px 60px/);
});

test('donation button uses accessible accent tokens and only fades on interaction', () => {
  const html = read('_includes/donation.html');
  const button = html.match(/\.bmc-button\{([^}]+)\}/)?.[1];
  assert.match(button, /background-color:\s*var\(--jk-accent\)/);
  assert.match(button, /color:\s*var\(--jk-on-accent\)/);
  assert.match(button, /font-family:\s*var\(--jk-font\)/);
  assert.match(button, /transition:\s*opacity var\(--jk-d-2\) var\(--jk-ease-out\)/);
  const interaction = html.match(/\.bmc-button:hover[^}]+\{([^}]+)\}/)?.[1];
  assert.match(interaction, /opacity:\s*0\.85/);
  assert.match(interaction, /color:\s*var\(--jk-on-accent\)/);
  assert.doesNotMatch(interaction, /shadow|background|transform/);
  assert.doesNotMatch(html, /#FF5F5F|#ffffff|Arial|cursive/i);
  assert.match(html, /src="https:\/\/cdn\.buymeacoffee\.com\/buttons\/bmc-new-btn-logo\.svg"/);
});

test('Moxie vendors an exact design-system copy, excluding screenshots', () => {
  const canonical = files(design).filter(file => !file.startsWith(`${design}/screenshots/`))
    .map(file => file.slice(design.length + 1)).sort();
  const copy = files('moxie/jaack-design-system')
    .map(file => file.slice('moxie/jaack-design-system/'.length)).sort();
  assert.deepEqual(copy, canonical);
  for (const [, file, hash] of read(`${design}/VERSION`).matchAll(/^  ([\w./-]+): ([a-f0-9]{64})$/gm)) {
    assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root, design, file))).digest('hex'), hash, file);
  }
  for (const file of canonical) assert.deepEqual(fs.readFileSync(path.join(root, design, file)),
    fs.readFileSync(path.join(root, 'moxie/jaack-design-system', file)), file);
});

test('repo-local WCAG contrast check passes for Forma, jaack.me and Moxie', () => {
  const result = spawnSync('python3', [path.join(__dirname, 'forma-v2/contrast.py')], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.error?.message || result.stdout + result.stderr);
  assert.match(result.stderr, /FAIL: 0/);
  assert.equal(Object.keys(JSON.parse(read('tests/forma-v2/palettes.json'))).length, 3);
});
