const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../_site');
let server, browser, base;
before(async () => {
  server = http.createServer(async (req, res) => {
    try {
      let file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://local').pathname));
      if (!file.startsWith(root + path.sep) && file !== root) throw new Error('Outside site');
      if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
      const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
      res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
      res.end(await fs.readFile(file));
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch();
});
after(async () => {
  await browser?.close();
  await new Promise(resolve => server ? server.close(resolve) : resolve());
});

const routes = ['/', '/about/', '/blog/', '/notes/', '/thoughts-from-token-2049-singapore-24/',
  '/2024-review-en/', '/projects/pommidoro/', '/speaking/', '/projects/', '/team1/', '/harness-companion/'];

for (const width of [390, 1280]) {
  test(`heading families, weights and 14px rhythm at ${width}px`, async () => {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    const failures = [];
    try {
      for (const route of routes) {
        await page.goto(base + route);
        await page.evaluate(() => document.fonts.ready);
        const headings = await page.locator('main :is(h1,h2,h3)').evaluateAll(nodes => nodes
          .filter(node => node.getClientRects().length)
          .map(node => {
            const s = getComputedStyle(node);
            return { tag: node.tagName, text: node.textContent.trim().slice(0,60),
              family: s.fontFamily, weight: s.fontWeight, leading: s.lineHeight,
              top: s.marginTop, bottom: s.marginBottom };
          }));
        assert.ok(headings.length, route);
        for (const h of headings) {
          const label = `${route} ${width}px ${h.tag} ${h.text}`;
          if (['H1','H2'].includes(h.tag) && !/Newsreader/.test(h.family)) failures.push(`${label}: family=${h.family}`);
          if (h.tag === 'H2' && h.weight !== '450') failures.push(`${label}: weight=${h.weight}`);
          for (const key of ['leading','top','bottom']) {
            const px = parseFloat(h[key]);
            if (!Number.isFinite(px) || Math.abs(px - Math.round(px / 14) * 14) > .5) failures.push(`${label}: ${key}=${h[key]}`);
          }
        }
      }
      assert.deepEqual(failures, []);
    } finally { await page.close(); }
  });
}

for (const width of [390, 669, 1280]) {
  test(`shared rows, action targets and jump links at ${width}px`, async () => {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    try {
      for (const lang of ['en', 'it']) {
        await page.goto(base);
        await page.evaluate(lang => localStorage.setItem('site-lang', lang), lang);
        for (const route of ['/', '/blog/', '/notes/', '/speaking/', '/2024-review-en/', '/projects/', '/projects/pommidoro/', '/thoughts-from-token-2049-singapore-24/']) {
          await page.goto(base + route);
          await page.evaluate(() => document.fonts.ready);
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          await page.mouse.move(0, 0);
          const result = await page.evaluate(() => {
            const visible = el => el.getClientRects().length && getComputedStyle(el).display !== 'none';
            const rows = [...document.querySelectorAll('.dated-row')].filter(visible);
            const links = rows.flatMap(row => [...row.querySelectorAll(':scope > a')]);
            const targets = [...links, ...document.querySelectorAll('.text-link, .note-back, .work-jumps a')].filter(visible);
            const jumps = [...document.querySelectorAll('.projects > .work-jumps a')].filter(visible);
            const archive = [...document.querySelectorAll('.list .dated-row > a')].filter(visible);
            return {
              targets: targets.map(el => [el.textContent.trim(), el.getBoundingClientRect().height]),
              titles: links.map(el => [getComputedStyle(el).textDecorationLine, getComputedStyle(el).fontFamily, getComputedStyle(el).fontSize, getComputedStyle(el).lineHeight]),
              columns: rows.map(row => ({ date: row.querySelector('time').getBoundingClientRect().left, title: row.querySelector('a, .row-title').getBoundingClientRect().left,
                dateTop: row.querySelector('time').getBoundingClientRect().top, titleTop: row.querySelector('a, .row-title').getBoundingClientRect().top,
                column: getComputedStyle(row).gridTemplateColumns.split(' ')[0], font: parseFloat(getComputedStyle(row).fontSize) })),
              jumpRows: new Set(jumps.map(el => Math.round(el.getBoundingClientRect().top))).size,
              jumpWidths: jumps.map(el => [el.scrollWidth, el.clientWidth]),
              archiveLefts: archive.map(el => el.getBoundingClientRect().left),
              overflow: document.documentElement.scrollWidth > innerWidth,
              gap: document.querySelector('main').getBoundingClientRect().top - document.querySelector('nav.site-nav').getBoundingClientRect().bottom
            };
          });
          for (const [name, height] of result.targets) assert.ok(height >= 44, `${route} ${lang} ${name}: ${height}px`);
          for (const [decoration, family, size, leading] of result.titles) {
            assert.equal(decoration, 'none', `${route}: title underlined at rest`);
            assert.match(family, /Newsreader/, route);
            assert.equal(size, '20px', route); assert.equal(leading, '28px', route);
          }
          for (const c of result.columns) {
            if (width >= 669) {
              assert.ok(c.title > c.date, `${route}: date must be left of title`);
              assert.ok(Math.abs(parseFloat(c.column) - 7 * c.font) < .5, `${route}: date column must be 7em`);
            } else assert.ok(c.titleTop >= c.dateTop + 27, `${route}: date must sit above title`);
          }
          assert.ok(result.jumpRows <= 2, `${route} ${lang}: ${result.jumpRows} jump rows`);
          for (const [scroll, client] of result.jumpWidths) assert.ok(scroll <= client + 1, `${route}: clipped jump label`);
          if (result.archiveLefts.length) assert.ok(Math.max(...result.archiveLefts) - Math.min(...result.archiveLefts) <= .5, `${route}: archive indent`);
          assert.equal(result.overflow, false, `${route} ${lang}: horizontal overflow`);
          assert.ok(Math.abs(result.gap - 14) <= .5, `${route}: nav gap ${result.gap}px`);
        }
      }
      await page.goto(base + '/notes/');
      const title = page.locator('.dated-row > a').first();
      await title.hover();
      assert.equal(await title.evaluate(el => getComputedStyle(el).textDecorationLine), 'underline');
      await page.mouse.move(0, 0); await title.focus();
      assert.equal(await title.evaluate(el => getComputedStyle(el).textDecorationLine), 'underline');
    } finally { await page.close(); }
  });
}

for (const width of [390, 1280]) {
  test(`migrated media, note measure and chrome at ${width}px`, async () => {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    await page.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
    try {
      for (const route of ['/podcast/', '/projects/carta/', '/newsletter/', '/404.html', '/installare-nodo-ipfs-en/', '/thoughts-from-token-2049-singapore-24/']) {
        await page.goto(base + route);
        await page.evaluate(() => document.fonts.ready);
        const metrics = await page.evaluate(() => {
          const css = el => el && getComputedStyle(el);
          const main = document.querySelector('main');
          const note = main.querySelector('.note');
          const stage = main.querySelector('.pv-stage');
          const side = main.querySelector('.side-by-side');
          const code = main.querySelector('pre');
          const title = note?.querySelector('h1');
          const paragraph = note?.querySelector('.note-body p');
          return {
            overflow: document.documentElement.scrollWidth > innerWidth,
            clip: css(document.body).overflowX,
            wordmark: parseFloat(css(document.querySelector('.site-wordmark')).fontSize),
            side: side && { left: side.querySelector('.toleft').getBoundingClientRect().width, right: side.querySelector('.toright').getBoundingClientRect().width },
            stage: stage && { width: stage.clientWidth, height: stage.clientHeight, ratio: css(stage).aspectRatio },
            note: note && { title: parseFloat(css(title).fontSize), family: css(paragraph).fontFamily, size: css(paragraph).fontSize, leading: css(paragraph).lineHeight, width: main.getBoundingClientRect().width },
            code: code && { bg: css(code).backgroundColor, ink: css(code).color },
            ink: css(document.documentElement).getPropertyValue('--jk-ink').trim()
          };
        });
        assert.equal(metrics.overflow, false, route);
        assert.equal(metrics.clip, 'clip', route);
        assert.ok(Math.abs(metrics.wordmark - 22.88) < .1, `${route}: PR A wordmark metrics`);
        if (metrics.side) { assert.ok(metrics.side.left > 0); assert.ok(metrics.side.right > 0); }
        if (metrics.stage) {
          assert.ok(metrics.stage.width > 0 && metrics.stage.height > 0);
          assert.equal(metrics.stage.ratio, width < 776 ? '358 / 770' : '720 / 820');
        }
        if (metrics.note) {
          assert.ok(metrics.note.title > 18); assert.match(metrics.note.family, /Newsreader/);
          assert.equal(metrics.note.size, '18px'); assert.equal(metrics.note.leading, '28px');
          assert.ok(metrics.note.width <= 26 * 18 + .5);
        }
        if (metrics.code) assert.notEqual(metrics.code.bg, metrics.code.ink);
      }
    } finally { await page.close(); }
  });
}
