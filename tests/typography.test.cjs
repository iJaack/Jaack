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
