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

const near = (actual, expected, tolerance = 1) => assert.ok(Math.abs(actual - expected) <= tolerance,
  `expected ${expected} ± ${tolerance}, got ${actual}`);
const loops = '/the-loops-i-set-up-so-my-agent-system-doesnt-lie-to-me/';
for (const [width, measure, wide] of [[390,358,390], [1440,560,1100], [1920,640,1400], [2560,640,1800], [3440,640,2200]]) {
  test(`E2 story measure, rails, ToC and wide figures at ${width}px`, async () => {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    try {
      for (const route of [loops, '/homescreen-iphone-2020-en/']) {
        await page.goto(base + route);
        await page.evaluate(() => document.fonts.ready);
        const m = await page.evaluate(() => {
          const prose = document.querySelector('.prose');
          const p = prose.querySelector(':scope > p:not(:has(img))');
          const figure = prose.querySelector(':scope > img, :scope > p:has(img)');
          const rail = document.querySelector('.story-rail');
          const toc = [...rail.querySelectorAll('.story-toc a')];
          return { measure: p.getBoundingClientRect().width, left: p.getBoundingClientRect().left,
            frameLeft: document.querySelector('main').getBoundingClientRect().left,
            size: getComputedStyle(p).fontSize, leading: getComputedStyle(p).lineHeight,
            family: getComputedStyle(p).fontFamily, wide: figure.getBoundingClientRect().width,
            figureLeft: figure.getBoundingClientRect().left, rail: getComputedStyle(rail).display,
            sticky: getComputedStyle(rail).position,
            headings: [...prose.querySelectorAll('h2[id]')].map(h => [h.id,h.textContent.trim()]),
            toc: toc.map(a => [a.hash.slice(1),a.textContent.trim()]),
            overflow: document.documentElement.scrollWidth > innerWidth };
        });
        near(m.measure, measure); near(m.wide, wide, 80);
        assert.equal(m.size, '20px'); assert.equal(m.leading, '28px'); assert.match(m.family, /Newsreader/);
        assert.deepEqual(m.toc, m.headings); assert.ok(m.headings.length);
        assert.equal(m.overflow, false);
        if (width >= 1100) { assert.equal(m.rail, 'block'); assert.equal(m.sticky,'sticky'); assert.ok(m.left > m.frameLeft + 160); }
        else { assert.equal(m.rail, 'none'); near(m.figureLeft, 0); }
      }
    } finally { await page.close(); }
  });
}
