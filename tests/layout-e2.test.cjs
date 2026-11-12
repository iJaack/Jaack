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
for (const width of [390, 760, 1100, 1440, 1919, 1920, 2559, 2560, 3440]) {
  test(`E2 hero, selected cards and work groups at ${width}px`, async () => {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    try {
      await page.goto(base);
      await page.evaluate(() => document.fonts.ready);
      const m = await page.evaluate(() => {
        const box = s => { const r = document.querySelector(s).getBoundingClientRect(); return { left:r.left, right:r.right, width:r.width, top:r.top, height:r.height }; };
        const grid = document.querySelector('#selected-work .cards');
        return { hero: box('.hero-visual img'), copy: box('.hero-copy'), title: parseFloat(getComputedStyle(document.querySelector('.hero-title')).fontSize),
          heading:box('#work-title'), card:box('#selected-work .project-feature'), main:box('main'),
          cols:getComputedStyle(grid).gridTemplateColumns.split(' ').length,
          gutter:parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--jk-gutter')),
          links:[...grid.querySelectorAll('h3 a')].map(a => a.getAttribute('href')),
          writing:document.querySelectorAll('.selected-writing > .writing-card:has(img)').length,
          overflow:document.documentElement.scrollWidth > innerWidth };
      });
      near(m.heading.left,m.card.left); near(m.hero.width / m.hero.height,16/9,.01);
      assert.deepEqual(m.links,['/projects/gm10/','/projects/eva-protocol/','/projects/evalanche/','/projects/pommidoro/']);
      assert.equal(m.writing,4);
      assert.equal(m.cols,width < 760 ? 1 : width < 1920 ? 2 : width < 2560 ? 3 : 4);
      assert.equal(m.overflow,false);
      if (width >= 900) {
        near(m.hero.right,width,2);
        near(m.copy.width,(m.main.width - 11*m.gutter)/12*5 + 4*m.gutter);
        near(m.hero.left,m.copy.right + m.gutter);
        near(m.title,Math.min(84,Math.max(44,width*.041)),.1);
        near(m.copy.top + m.copy.height/2,m.hero.top + m.hero.height/2);
      } else if (width < 760) { near(m.hero.left,0); near(m.hero.right,width); assert.ok(m.heading.top < 2000,'Selected work remains within two screens'); }
      await page.goto(base + '/projects/');
      await page.evaluate(() => document.fonts.ready);
      const work = await page.evaluate(() => ({
        grids:[...document.querySelectorAll('.work-group > .cards')].map(grid => ({
          count:grid.children.length, cols:getComputedStyle(grid).gridTemplateColumns.split(' ').length,
          width:grid.getBoundingClientRect().width,
          cards:[...grid.children].map(c => c.getBoundingClientRect().width) })),
        feature:document.querySelector('.work-featured .card-media').getBoundingClientRect().width,
        featureRatio:getComputedStyle(document.querySelector('.work-featured .card-media')).aspectRatio,
        overflow:document.documentElement.scrollWidth > innerWidth
      }));
      assert.equal(work.overflow,false); assert.equal(work.featureRatio,'16 / 9');
      for (const g of work.grids) {
        const columns = g.count === 1 ? 1 : width < 760 ? 1 : width < 1920 ? 2 : width < 2560 ? 3 : Math.min(4,g.count);
        assert.equal(g.cols,columns,JSON.stringify(g));
        if (width >= 2560 && g.count === 2) for (const card of g.cards) near(card,(g.width - 32)/2);
      }
    } finally { await page.close(); }
  });
}
for (const width of [1280,2560]) {
  test(`E2 About portrait sits beside the 28em text at ${width}px`,async () => {
    const page = await browser.newPage({viewport:{width,height:1000}});
    try {
      for (const route of ['/about/','/en/about/']) {
        await page.goto(base + route);
        await page.evaluate(() => document.fonts.ready);
        const m = await page.evaluate(() => {
          const portrait=document.querySelector('.about-portrait').getBoundingClientRect();
          const body=[...document.querySelectorAll('.about-body > [lang]')].find(el => el.getClientRects().length);
          const r=body.getBoundingClientRect(),css=getComputedStyle(body);
          return {width:portrait.width,left:portrait.left,top:portrait.top,textWidth:r.width,textRight:r.right,textTop:r.top,
            size:css.fontSize,leading:css.lineHeight,overflow:document.documentElement.scrollWidth > innerWidth};
        });
        assert.ok(m.width>=420 && m.width<=560); near(m.textWidth,560);
        assert.ok(m.left>m.textRight); near(m.top,m.textTop);
        assert.equal(m.size,'20px'); assert.equal(m.leading,'28px'); assert.equal(m.overflow,false);
      }
    } finally { await page.close(); }
  });
}
for (const width of [760,1920,2560,3440]) {
  test(`E2 reading paths use card tracks and keep the dated archive at ${width}px`,async () => {
    const page=await browser.newPage({viewport:{width,height:1000}});
    try {
      await page.goto(base+'/blog/');
      const columns=await page.locator('.reading-paths').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
      assert.equal(columns,width<1920 ? 2 : 3);
      assert.ok(await page.locator('.list .dated-row').count());
    } finally { await page.close(); }
  });
}
for (const width of [390,1440,3440]) {
  test(`E2 dark diagrams keep the original SVG and surface frame at ${width}px`,async () => {
    const page=await browser.newPage({viewport:{width,height:1000}});
    try {
      await page.goto(base+loops);
      await page.evaluate(()=>document.documentElement.dataset.theme='dark');
      const m=await page.locator('.post-body img').first().evaluate(img=>{
        const css=getComputedStyle(img);return {src:img.getAttribute('src'),filter:css.filter,padding:css.padding,
          radius:css.borderRadius,bg:css.backgroundColor,surface:getComputedStyle(document.documentElement).getPropertyValue('--jk-surface-2').trim()};
      });
      assert.equal(m.src,'/assets/images/2026/loops-overview-codex.svg');
      assert.equal(m.filter,'brightness(0.9)'); assert.equal(m.padding,'14px'); assert.equal(m.radius,'14px');
      assert.equal(m.bg,'rgb(38, 32, 28)'); assert.equal(m.surface,'#26201c');
      assert.equal(await page.locator('beeline-button, script[src*="beeline"]').count(),0);
      const cover=await page.locator('main.post > .title-image').boundingBox(); near(cover.x,0); near(cover.width,width);
    } finally { await page.close(); }
  });
}
test('E2 iPhone cover promotes the three existing screens in both languages',async () => {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  try {
    for (const route of ['/homescreen-iphone-2020-en/','/homescreen-iphone-2020/']) {
      await page.goto(base+route);
      const m=await page.locator('.post-cover-screens').evaluate(stage=>({
        display:getComputedStyle(stage).display,left:stage.getBoundingClientRect().left,width:stage.getBoundingClientRect().width,
        screens:[...stage.querySelectorAll('img')].map(img=>({src:img.getAttribute('src'),height:img.getBoundingClientRect().height,fit:getComputedStyle(img).objectFit}))
      }));
      assert.equal(m.display,'flex'); near(m.left,0); near(m.width,1440); assert.equal(m.screens.length,3);
      m.screens.forEach((s,i)=>{assert.ok(s.src.endsWith(`iphone-page${i+1}.png`));near(s.height,640);assert.equal(s.fit,'contain');});
    }
  } finally { await page.close(); }
});
