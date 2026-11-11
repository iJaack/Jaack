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
  const names = { ink2: 'ink-2', accentText: 'accent-text', onAccent: 'on-accent', surface2: 'surface-2' };
  for (const [name, source] of Object.entries(sources)) {
    for (const [mode, palette] of Object.entries(palettes[name])) {
      const actual = theme(read(source), mode);
      for (const [key, value] of Object.entries(palette)) {
        assert.equal(normalize(actual[`--jk-${names[key] || key}`]), normalize(value), `${name} ${mode} ${key}`);
      }
    }
  }
  for (const [source, bg] of [[`${design}/tokens.css`, '#130e0b'],
    ['assets/css/jaack-site.css', '#130e0b'], ['moxie/jaack-moxie.css', '#130e0b']]) {
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

test('Newsreader opts in to the packaged roman and italic, fits its budget and preloads only roman', () => {
  const css = read('assets/css/jaack-site.css');
  const packageCSS = read(`${design}/fonts/newsreader/fonts.css`);
  const faces = [...(packageCSS + css).matchAll(/@font-face\s*\{([^}]+)\}/g)]
    .map(match => match[1]).filter(face => /font-family:\s*"Newsreader"[;]/.test(face));
  assert.equal(faces.length, 2);
  for (const [index, face] of faces.entries()) {
    assert.match(face, /font-family:\s*"Newsreader"/);
    assert.match(face, index ? /font-weight:\s*400;/ : /font-weight:\s*400 700;/);
    assert.match(face, /font-display:\s*swap/);
    assert.ok(face.includes(`Newsreader-${index ? 'italic' : 'roman'}.woff2`));
    assert.match(face, index ? /font-style:\s*italic/ : /font-style:\s*normal/);
    if (index) assert.match(face, /src:\s*url\("Newsreader-italic\.woff2"\) format\("woff2"\);/);
  }
  const fonts = files(`${design}/fonts/newsreader`);
  assert.doesNotMatch(css, /@font-face|Newsreader-(roman|italic)\.woff2/);
  assert.ok(!fs.existsSync(path.join(root, 'assets/fonts/newsreader')));
  assert.ok(fonts.includes(`${design}/fonts/newsreader/OFL.txt`));
  assert.ok(!fonts.some(file => file.endsWith('Newsreader-carta.woff2')));
  const total = fonts.filter(file => file.endsWith('.woff2'))
    .reduce((sum, file) => sum + fs.statSync(path.join(root, file)).size, 0);
  // Roman spans 400–700; static italic is 400. Combined: 149,400 bytes; only roman is preloaded.
  assert.ok(total <= 150000, `${total} bytes exceeds 150 KB`);
  for (const file of files('_site').filter(file => file.endsWith('.html'))) {
    const head = read(file).match(/<head>([\s\S]*?)<\/head>/i)?.[1];
    if (!head || !head.includes('/assets/css/jaack-site.css')) continue;
    const preloads = [...head.matchAll(/<link\b[^>]*rel="preload"[^>]*>/g)]
      .map(match => match[0]).filter(link => /as="font"/.test(link));
    assert.equal(preloads.length, 1, file);
    assert.match(preloads[0], /href="\/assets\/jaack-design-system\/fonts\/newsreader\/Newsreader-roman\.woff2"/);
    assert.match(preloads[0], /type="font\/woff2"/);
    assert.match(preloads[0], /\bcrossorigin\b/);
    assert.match(head, /href="\/assets\/jaack-design-system\/jaack\.css"[^>]*>\s*<link[^>]*href="\/assets\/jaack-design-system\/fonts\/newsreader\/fonts\.css"/);
  }
  assert.match(read('_site/index.html'), /Newsreader-roman\.woff2/);
  assert.match(css, /--jk-serif: var\(--jk-font-read\)/);
  assert.match(read(`${design}/tokens.css`), /--jk-font-read:"Newsreader","Newsreader Fallback Iowan","Newsreader Fallback Georgia"/);
  assert.match(css, /\.post-body\s*\{[^}]*font-family: var\(--jk-serif\); font-size: var\(--jk-fs-body\); line-height: var\(--jk-lh-body\); font-weight: 400/);
});

test('jaack.me editorial typography uses the approved body measure and heading scale', () => {
  const css = stripComments(read('assets/css/jaack-site.css'));
  const root = css.match(/:root\s*\{([^}]*--jk-serif:[^}]+)\}/)?.[1];
  assert.ok(root, 'missing editorial tokens');
  for (const [name, value] of Object.entries({
    'fs-body': '18px', 'lh-body': '28px', baseline: '14px', measure: '33em',
    'fs-h4': '24px', 'lh-h4': '28px', 'fs-h3': '24px', 'lh-h3': '28px',
    'fs-h2': '43px', 'lh-h2': '56px', 'fs-h1': '57px', 'lh-h1': '70px',
    'fs-body-long': '20px', 'lh-body-long': '28px', 'measure-long': '23em'
  })) assert.ok(root.includes(`--jk-${name}: ${value};`), name);
  assert.match(css, /\.post\s*\{[^}]*font-size: var\(--jk-fs-body\);[^}]*max-width: var\(--jk-measure\);/);
  assert.match(css, /\.post-body p,\s*\.post-body li\s*\{\s*line-height: inherit;/);
  for (const [level, selectors] of [
    [1, ['h1', '.header-home .hero-title', '.page > .page-title', '.post > .title',
      '.project-page .page-title', '.wrapper-xwide .post > .title']],
    [2, ['h2', '.contact-section h2', '.section-heading h2', '.app-gallery h2']],
    [3, ['h3', '.writing-entry h3', '.reading-pick h3']], [4, ['h4']]
  ]) {
    for (const selector of selectors) {
      const rule = [...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)].find(([, selectors, body]) =>
        selectors.split(',').some(value => value.trim() === selector) &&
        body.includes(`font-size: var(--jk-fs-h${level});`))?.[2];
      assert.ok(rule, `${selector}: missing heading size`);
      assert.ok(rule.includes(`line-height: var(--jk-lh-h${level});`), selector);
    }
  }
  assert.match(css, /\.writing-entry h3\s*\{[^}]*font-weight: 500;[^}]*font-optical-sizing: auto;[^}]*letter-spacing: -0.01em;/);
  assert.match(css, /\.project-page--carta \.page-title\s*\{[^}]*font-size: var\(--jk-fs-title\);/);
  assert.match(css, /\.project-page--carta \.page-title\s*\{[^}]*font-variation-settings: 'opsz' 72;/);
  const phone = css.match(/@media \(max-width: 479px\) \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(phone, 'missing phone typography spacing');
  assert.match(phone, /:root\s*\{\s*--jk-page-x: 20px;\s*\}/);
  assert.match(phone, /padding-left: max\(var\(--jk-page-x\), env\(safe-area-inset-left\)\);/);
  assert.match(phone, /padding-right: max\(var\(--jk-page-x\), env\(safe-area-inset-right\)\);/);
});

test('headings use the compact scale below 1100px on the 14px grid', () => {
  const css = stripComments(read('assets/css/jaack-site.css'));
  const mobile = css.match(/@media \(max-width: 1099px\) \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(mobile, 'missing mobile heading breakpoint');
  const root = mobile.match(/^\s*:root\s*\{([^}]+)\}\s*$/)?.[1];
  assert.ok(root, 'mobile headings must override root tokens only');
  const tokens = Object.fromEntries([...root.matchAll(/--jk-([\w-]+):\s*([^;]+);/g)]
    .map(([, name, value]) => [name, value.trim()]));
  assert.deepEqual(tokens, {
    'fs-h4': '18px', 'lh-h4': '28px', 'fs-h3': '20px', 'lh-h3': '28px',
    'fs-h2': '32px', 'lh-h2': '42px', 'fs-h1': '43px', 'lh-h1': '56px'
  });
});

test('posts default to long 20/28 at 23em from 600px, with a normal opt-out', () => {
  const css = stripComments(read('assets/css/jaack-site.css'));
  const desktop = css.match(/@media \(min-width: 600px\) \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(desktop, 'missing long article breakpoint');
  assert.match(desktop, /\.post:not\(\[data-measure="normal"\]\),\s*\.post:not\(\[data-measure="normal"\]\) \.post-body,\s*\.post-body--long\s*\{\s*font-size: var\(--jk-fs-body-long\);\s*line-height: var\(--jk-lh-body-long\);/);
  assert.match(desktop, /\.post:not\(\[data-measure="normal"\]\),\s*\.post-body--long\s*\{\s*max-width: var\(--jk-measure-long\);/);
  assert.doesNotMatch(css.replace(desktop, ''), /(?:font-size|line-height|max-width): var\(--jk-(?:fs-body-long|lh-body-long|measure-long)\)/);
  for (const slug of ['2024-review', '2024-review-en', '2024-review-it', 'zk-evms-en']) {
    assert.match(read(`_site/${slug}/index.html`), /<main\b[^>]*class="post"/);
    assert.doesNotMatch(read(`_site/${slug}/index.html`), /data-measure=/);
  }
  assert.match(css, /\.jk-prose\s*\{[^}]*max-width: 26em;[^}]*font-size: var\(--jk-fs-body\);[^}]*line-height: var\(--jk-lh-body\);/);
  assert.equal(read('_site/assets/css/jaack-site.css'), read('assets/css/jaack-site.css'));
});

test('single-row navigation balances desktop insets and pushes the controls right', () => {
  const css = stripComments(read('assets/css/jaack-site.css'));
  assert.match(css, /nav\.site-nav\.jk-top\s*\{[^}]*flex-wrap:\s*nowrap;[^}]*padding:\s*6px 18px;/);
  assert.match(css, /nav\.site-nav \.jk-mark\s*\{[^}]*margin:\s*0 4px 0 0;[^}]*flex:\s*none;/);
  assert.match(css, /nav\.site-nav \.lang-switch\s*\{[^}]*margin-left:\s*auto;/);
  const icons = css.match(/@media \(max-width: 1179\.98px\) \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(icons, 'icons throughout 694–1179px');
  assert.match(read('_includes/nav.html'), /<span class="nav-bar-label">Prenota<\/span><span class="nav-menu-label">Prenota una call<\/span>/);
  assert.match(css, /nav\.site-nav\.is-compact \.nav-bar-label,[^}]*\{ display: none; \}/);
  assert.match(css, /nav\.site-nav\.is-compact \.nav-menu-label,[^}]*\{ display: inline; \}/);
  assert.match(icons, /\.jk-thsw \.i \{ display: inline;/);
  assert.match(icons, /\.jk-thsw \.l\s*\{[^}]*position: absolute;[^}]*clip-path: inset\(50%\);/);
  assert.match(icons, /\.jk-thsw button\s*\{[^}]*min-width: 44px; min-height: 44px; flex: 0 0 44px;/);
});

test('no-JS phone navigation wraps whole labels without clipping and keeps 44px targets', () => {
  const css = stripComments(read('assets/css/jaack-site.css'));
  const phone = css.match(/@media \(max-width: 480px\) \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(phone, 'missing phone navigation rules');
  const links = phone.match(/nav\.site-nav:not\(\.has-menu\) \.nav-links\s*\{([^}]+)\}/)?.[1];
  assert.match(links, /flex-wrap:\s*wrap;/);
  assert.match(links, /overflow:\s*visible;/);
  assert.match(phone, /nav\.site-nav:not\(\.has-menu\) \.nav-links li\s*\{[^}]*flex:\s*none;/);
  const targets = css.match(/nav\.site-nav\.jk-top \.nav-links a\.jk-sw\s*\{([^}]+)\}/)?.[1];
  assert.match(targets, /min-height:\s*44px;/);
  const phoneTargets = phone.match(/nav\.site-nav\.jk-top:not\(\.has-menu\) \.nav-links a\.jk-sw\s*\{([^}]+)\}/)?.[1];
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

test('coffee is a quiet 44px t2 text link with no vendor assets or tracking', () => {
  const html = read('_includes/donation.html');
  const css = stripComments(read('assets/css/jaack-site.css'));
  assert.match(css, /\.donation > \.coffee-link\s*\{[^}]*display: inline-flex;[^}]*align-items: center;[^}]*min-height: 44px;[^}]*color: var\(--jk-t2\);/);
  assert.match(html, /If this was useful, buy me a coffee/);
  assert.match(html, /Se ti è stato utile, offrimi un caffè/);
  assert.match(html, /<span aria-hidden="true">↗<\/span>/);
  assert.doesNotMatch(html, /!important|<style|<img|<script|button|cdn\.|logo/i);
  assert.match(html, /target="_blank" rel="noopener noreferrer"/);
  assert.match(css, /\.post > \.related, \.post > \.donation, \.post > \.author \{ margin: 56px 0 0; \}/);
  assert.match(css, /\.post > \.author > \.toright > \.bio\s*\{[^}]*color: var\(--jk-t2\);[^}]*text-align: left;/);
  assert.match(css, /\.post > \.author > \.toleft > \.selfie\s*\{[^}]*width: 44px; height: 44px;/);
});

// CSS regressions accompany rendered structure and language checks in site_test.rb.
test('post headers remove the title accent and keep mobile covers within the reading budget', () => {
  const css = stripComments(read('assets/css/jaack-site.css'));
  const title = css.match(/\.post > \.title\s*\{[^}]*max-width: 100%;([^}]+)\}/)?.[1];
  assert.match(title, /border: 0;\s*box-shadow: none;/);
  assert.doesNotMatch(title, /accent/);
  assert.match(css, /\.post > \.date\s*\{[^}]*font-size: var\(--jk-fs-xs\);[^}]*text-transform: none;[^}]*color: var\(--jk-t3\);/);
  assert.match(css, /\.post > \.title \{ font-size: clamp\(32px, 9vw, 43px\); line-height: 42px; \}/);
  assert.match(css, /\.post > \.title-image\s*\{[^}]*width: 100%;[^}]*aspect-ratio: 16 \/ 9;[^}]*border-radius: 14px;/);
  assert.match(css.match(/@media \(max-width: 479px\) \{([\s\S]*?)\n\}/)?.[1], /\.post > \.title-image \{ max-height: 140px; \}/);
  assert.match(css, /\.dated-rows > \.dated-row\s*\{[^}]*min-height: 44px;[^}]*border-top: 1px solid var\(--jk-hair\);/);
  assert.match(css, /\.dated-row > time \{ color: var\(--jk-t3\);/);
  assert.match(css, /\.dated-row > a\s*\{[^}]*font-family: var\(--jk-serif\);[^}]*font-size: 20px;[^}]*line-height: 28px;[^}]*color: var\(--jk-ink\);[^}]*text-decoration: none;/);
  assert.match(css, /\.dated-row > a:hover, \.dated-row > a:focus-visible \{ text-decoration: underline;/);
});

test('diagrams break out at 760px while text and unmarked photos keep their left-aligned measure', () => {
  const css = stripComments(read('assets/css/jaack-site.css'));
  const wide = css.match(/@media \(min-width: 760px\) \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(wide);
  assert.match(wide, /\.jk-page > \.post\s*\{[^}]*max-width: min\(100%, 720px\);/);
  assert.match(wide, /--jk-post-measure: calc\(23 \* var\(--jk-fs-body-long\)\);/);
  assert.match(wide, /\.post \.post-body \{ max-width: 100%; overflow: visible; \}/);
  assert.match(wide, /:is\(\.title, \.date, beeline-button, \.related, \.donation, \.author, \.blog-navigation, \.title-image\),\s*\.jk-page > main.post \.post-body > \*\s*\{[^}]*max-width: var\(--jk-post-measure\);[^}]*margin-left: 0;[^}]*margin-right: auto;/);
  assert.match(wide, /:has\(img\[src\$="\.svg"\], img\.figure--diagram, figure\.figure--diagram\),/);
  assert.match(wide, /\.jk-page > main.post > \.title-image:is\(\[src\$="\.svg"\], \.figure--diagram\)\s*\{[^}]*width: 100%;[^}]*max-width: 100%;[^}]*margin-left: 0;[^}]*margin-right: auto;/);
  assert.match(wide, /\.jk-page > main.post > \.title-image:is\(\[src\$="\.svg"\], \.figure--diagram\)\s*\{[^}]*max-height: none;[^}]*aspect-ratio: auto;/);
  assert.match(css, /\.post :is\(img\[src\$="\.svg"\], img\.figure--diagram, figure\.figure--diagram img\)\s*\{[^}]*width: 100%;[^}]*max-width: 100%;[^}]*margin-left: 0;[^}]*margin-right: auto;/);
});

test('about overrides legacy layouts with a 160px portrait stacked above the full prose measure', () => {
  const css = stripComments(read('assets/css/jaack-site.css'));
  assert.match(css, /\.jk-prose \{[^}]*max-width: 26em;/);
  assert.match(css, /\.jk-prose \.about-body \{ display: block; \}/);
  assert.match(css, /\.jk-prose \.about-body > \.about-portrait\s*\{[^}]*display: block;[^}]*float: none;[^}]*width: 160px;[^}]*height: auto;[^}]*border-radius: 14px;[^}]*margin: 0 0 28px;/);
  assert.match(css, /\.jk-prose \.about-body > :is\(\.lang-en, \.lang-it\) \{ max-width: none; \}/);
});

test('code overrides every Pygments token with one accessible palette in both themes', () => {
  const css = stripComments(read('assets/css/jaack-site.css'));
  assert.match(css, /pre, \.highlight\s*\{[^}]*font-size: 14px;\s*line-height: 22px;[^}]*border-radius: 14px;[^}]*overflow-x: auto;[^}]*background: var\(--jk-surface-2\);/);
  assert.match(css, /pre, \.highlight pre \{ padding: 14px 18px; \}/);
  assert.match(css, /code, tt \{ font-size: 0.85em; \}/);
  assert.match(css, /html \.highlight\.highlight \[class\] \{ color: var\(--jk-ink\); background: transparent; \}/);
  // The reset has three classes/attributes plus html, beating even .highlight .gd .x.
  for (const [role, token] of [['.c,', 't3'], ['.k,', 'accent-text'], ['.s,', 'ink-2'], ['.m,', 'ink']]) {
    const rule = css.split('\n').find(line => line.startsWith('html .highlight.highlight :is(' + role));
    assert.ok(rule?.includes(`color: var(--jk-${token});`), role);
    if (role === '.m,') assert.ok(rule.includes('font-style: italic;'));
  }
  for (const rule of css.split('\n').filter(line => line.includes('.highlight'))) {
    assert.doesNotMatch(rule, /#[0-9a-f]{3,8}\b|\b(?:navy|red|blue)\b|data-theme/i);
  }
});

test('all detected diagrams get the same dark frame without inversion', () => {
  const css = stripComments(read('assets/css/jaack-site.css'));
  assert.match(css, /html\[data-theme="dark"\] \.post :is\(img\[src\$="\.svg"\], img\.figure--diagram, figure\.figure--diagram img\)\s*\{[^}]*background: var\(--jk-surface-2\);[^}]*padding: 14px;[^}]*border-radius: 14px;[^}]*filter: brightness\(\.9\);/);
  assert.doesNotMatch(css, /filter:\s*invert/);
  assert.doesNotMatch(read('_layouts/post.html'), /<picture/);
});

test('jaack.me and Moxie vendor the exact v2.0.1 release with MANIFEST and SOURCE', () => {
  for (const vendor of [design, 'moxie/jaack-design-system']) {
    const canonical = [...read(`${vendor}/MANIFEST.txt`).matchAll(/^([a-f0-9]{64})  ([\w./-]+)$/gm)];
    assert.ok(canonical.length > 0, `${vendor}: empty manifest`);
    assert.equal(read(`${vendor}/VERSION`).trim(), '2.0.1');
    assert.equal(read(`${vendor}/SOURCE`), 'iJaack/jaack-design v2.0.1 2cd1bdbe3dd38a185d0b00afd880fdec09cd9f95\n');
    assert.deepEqual(files(vendor).map(file => file.slice(vendor.length + 1)).sort(),
      [...canonical.map(([, , file]) => file), 'MANIFEST.txt', 'SOURCE'].sort());
    for (const [, hash, file] of canonical) {
      assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root, vendor, file))).digest('hex'), hash, `${vendor}/${file}`);
    }
    assert.equal(read(`${vendor}/MANIFEST.txt`), read(`${design}/MANIFEST.txt`));
    assert.equal(read(`${vendor}/SOURCE`), read(`${design}/SOURCE`));
  }
});

test('repo-local WCAG contrast check passes for Forma, jaack.me and Moxie', () => {
  const result = spawnSync('python3', [path.join(__dirname, 'forma-v2/contrast.py')], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.error?.message || result.stdout + result.stderr);
  assert.match(result.stderr, /FAIL: 0/);
  assert.equal(Object.keys(JSON.parse(read('tests/forma-v2/palettes.json'))).length, 3);
});

test('jaack.me dark tokens use the approved Ombra grounds, ink, lines and accent', () => {
  const actual = theme(read('assets/css/jaack-site.css'), 'dark');
  for (const [key, value] of Object.entries({
    bg: '#130e0b', surface: '#1c1713', 'surface-2': '#26201c',
    ink: '#e9e4da', 'ink-2': '#b6b0a8', t2: 'rgba(233,228,218,.72)', t3: 'rgba(233,228,218,.58)',
    hair: 'rgba(233,228,218,.12)', 'hair-2': 'rgba(233,228,218,.20)', edge: 'rgba(233,228,218,.39)',
    accent: '#ba7980', 'accent-text': '#ba7980', 'on-accent': '#130e0b',
    'accent-wash': 'rgba(186,121,128,.12)', focus: 'var(--jk-accent-text)'
  })) assert.equal(normalize(actual[`--jk-${key}`]), normalize(value), key);
  assert.match(read('assets/css/jaack-site.css'), /html\[data-theme="dark"\] \.pv-toggle:hover\s*\{\s*background: var\(--jk-surface-2\);/);
});

test('site code uses top clearance everywhere and contains no old dark ramp or pure black', () => {
  const oldRamp = /#(?:14110e|1b1714|231e1a|11100e|191714|13120e|1a1915|15110f|1d1815|15100e|1e1814|161210|1a1612|12100e|1a1714|f4eee5|cdc3b6|1e1916|120f0c)\b/i;
  const pureBlack = /#000\b|#000000|:\s*black\b|rgba\(0,\s*0,\s*0/i;
  for (const dir of ['assets/css', '_sass', 'assets/js', '_includes', '_layouts']) {
    for (const file of files(dir)) {
      assert.doesNotMatch(read(file), /--jk-topbar-h/, file);
      assert.doesNotMatch(read(file), oldRamp, file);
      assert.doesNotMatch(read(file), pureBlack, file);
    }
  }
  const css = read('assets/css/jaack-site.css');
  assert.match(css, /padding:\s*var\(--jk-top-clearance\)/);
  assert.match(css, /--jk-dock-h: 0px; --jk-dock-gap: 0px;/);
  const taller = [...stripComments(css).matchAll(/([^{}]+)\{[^{}]*--jk-bar-h:\s*(104|192)px;[^{}]*\}/g)];
  assert.equal(taller.length, 2);
  for (const [, selector] of taller) assert.ok(selector.includes('nav.site-nav:not(.has-menu)'), selector);
  assert.match(css, /--jk-bar-h: 61px;/);
  assert.match(css, /--jk-bar-h: 57px;/);
  assert.match(css, /--jk-bar-h: 192px;/);
  assert.match(css, /--jk-bar-gap: calc\(max\(8px, env\(safe-area-inset-top, 0px\)\) - env\(safe-area-inset-top, 0px\)\);/);
  assert.match(read('_sass/pages/notes.sass'), /scroll-margin-top: var\(--jk-top-clearance\)/);
  assert.match(read('assets/css/team1.css'), /top: var\(--jk-top-clearance\)/);
});


test('measured compact sheet uses tokens, 44px links and a Forma opacity fade', () => {
  const css = stripComments(read('assets/css/jaack-site.css'));
  const compact = 'nav\\.site-nav\\.has-menu\\.is-compact';
  const sheet = css.match(new RegExp(compact + ' \\.nav-row\\s*\\{([^}]+)\\}'))[1];
  for (const rule of ['position: absolute;', 'top: calc(100% + 8px);', 'left: 0;', 'right: 0;',
    'background: var(--jk-surface-2);', 'border: 1px solid var(--jk-hair-2);',
    'border-radius: 14px;', 'padding: 6px;', 'visibility: hidden;', 'transition: opacity var(--jk-d-2) var(--jk-ease-out);']) {
    assert.ok(sheet.includes(rule), rule);
  }
  const links = css.match(/nav\.site-nav\.jk-top\.has-menu\.is-compact \.nav-links a\.jk-sw\s*\{([^}]+)\}/)[1];
  for (const rule of ['width: 100%;', 'min-height: 44px;', 'padding: 0 14px;']) assert.ok(links.includes(rule), rule);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?nav\.site-nav\.has-menu\.is-compact \.nav-row \{ transition: none; \}/);
  assert.doesNotMatch(css, /@media \(max-width: 693\.98px\)/);
  assert.match(css, /\.nav-menu-toggle:focus-visible\s*\{[^}]*outline: 2px solid var\(--jk-focus\)/);
  assert.match(read('_layouts/default.html'), /src="\{\{ '\/assets\/js\/nav-menu\.js' \| relative_url \}\}" defer/);
});

test('global frame starts content at clearance and anchors a plain-link footer to short viewports', () => {
  const css = stripComments(read('assets/css/jaack-site.css'));
  assert.match(css, /\.header-home \{ padding: 0 0 20px; \}/);
  assert.match(css, /\.page, \.post, \.home, \.writing, \.projects \{ margin-top: 0; \}/);
  assert.match(css, /\.jk-page > main > :nth-child\(1 of :not\(\[hidden\]\)\),[^}]*\{ margin-top: 0; \}/);
  const wrappers = css.match(/\.wrapper-normal\.jk-page,\s*\.wrapper-large\.jk-page,\s*\.wrapper-xwide\.jk-page\s*\{([^}]+)\}/)[1];
  for (const rule of ['box-sizing: border-box;', 'min-height: 100svh;', 'display: flex;', 'flex-direction: column;']) assert.ok(wrappers.includes(rule), rule);
  assert.match(css, /\.jk-page > main, \.jk-page > footer \{ width: 100%; flex: none; \}/);
  assert.match(css, /footer\.footer-main \{ margin-top: auto;/);
  const links = css.match(/\.footer-main \.footer-links a\s*\{([^}]+)\}/)[1];
  for (const rule of ['min-height: 44px;', 'color: var(--jk-t2);', 'border: 0;', 'text-decoration: none;']) assert.ok(links.includes(rule), rule);
  assert.match(css, /\.footer-main \.footer-links a:hover,\s*\.footer-main \.footer-links a:focus-visible \{ text-decoration: underline;/);
  assert.match(css, /\.footer-main \.footer-links a:focus-visible \{ outline: 2px solid var\(--jk-focus\);/);
});

test('Moxie keeps cool light tokens and uses every approved Ombra dark token', () => {
  const css = read('moxie/jaack-moxie.css');
  const light = theme(css, 'light');
  const dark = theme(css, 'dark');
  for (const [key, value] of Object.entries({
    bg: '#130e0b', surface: '#1c1713', 'surface-2': '#26201c',
    ink: '#e9e4da', 'ink-2': '#b6b0a8', t2: 'rgba(233,228,218,.72)', t3: 'rgba(233,228,218,.58)',
    hair: 'rgba(233,228,218,.12)', 'hair-2': 'rgba(233,228,218,.20)', edge: 'rgba(233,228,218,.39)',
    accent: '#6d8fad', 'accent-text': '#6d8fad', 'on-accent': '#130e0b',
    'accent-wash': 'rgba(109,143,173,.12)', focus: 'var(--jk-accent-text)'
  })) assert.equal(normalize(dark[`--jk-${key}`]), normalize(value), key);
  for (const [key, value] of Object.entries({
    hair: 'rgba(20,24,29,.14)', 'hair-2': 'rgba(20,24,29,.20)', edge: 'rgba(20,24,29,.48)',
    'accent-wash': 'rgba(42,95,138,.12)', focus: 'var(--jk-accent-text)'
  })) assert.equal(normalize(light[`--jk-${key}`]), normalize(value), key);
  const oldRamp = /#(?:13120f|1b1916|24211d|efeae2|cbc4b9|8eb7e0|b7d4f5|101418|14110e|1b1714|231e1a|11100e|191714|13120e|1a1915|15110f|1d1815|15100e|1e1814|161210|1e1916|120f0c|1a1612|12100e|1a1714|f4eee5|cdc3b6)\b/i;
  const pureBlack = /#000\b|#000000|:\s*black\b|rgba\(0,\s*0,\s*0/i;
  for (const file of [...fs.readdirSync(path.join(root, 'moxie'))
    .filter(file => /\.(css|js)$/.test(file)).map(file => `moxie/${file}`),
    'moxie/build_hub.py', 'moxie/dist/style.css']) {
    assert.doesNotMatch(read(file), oldRamp, file);
    assert.doesNotMatch(read(file), pureBlack, file);
    assert.doesNotMatch(read(file), /--jk-topbar-h/, file);
  }
});
