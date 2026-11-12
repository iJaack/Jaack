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
        near(m.measure, measure);
        if (route === loops) near(m.wide, wide, 80);
        else {
          const phone = await page.locator('.prose img').first().evaluate(img => {
            const r = img.getBoundingClientRect(), stage = img.closest('.story-portrait').getBoundingClientRect();
            const prose = img.closest('.prose').getBoundingClientRect(), css = getComputedStyle(img);
            return { width:r.width, height:r.height, left:stage.left, right:stage.right, proseLeft:prose.left, proseRight:prose.right, fit:css.objectFit, max:css.maxHeight, photo:[...img.classList].some(c => c.startsWith('jk-photo-')) };
          });
          assert.equal(phone.fit,'contain'); assert.equal(phone.max,'800px'); assert.equal(phone.photo,false);
          assert.ok(phone.height <= 800);
          assert.ok(phone.left >= phone.proseLeft - 1 && phone.right <= phone.proseRight + 1);
          if (width >= 1100) assert.ok(phone.width < wide - 80);
          assert.equal(await page.locator('.prose > .story-portrait').count(),4,'prose-separated phones stay individual');
          assert.equal(await page.locator('.prose > .story-portrait-row').count(),0);
        }
        assert.equal(m.size, '20px'); assert.equal(m.leading, '28px'); assert.match(m.family, /Newsreader/);
        assert.deepEqual(m.toc, m.headings); assert.ok(m.headings.length);
        assert.equal(m.overflow, false);
        if (width >= 1100) { assert.equal(m.rail, 'block'); assert.equal(m.sticky,'sticky'); assert.ok(m.left > m.frameLeft + 160); }
        else { assert.equal(m.rail, 'none'); if (route === loops) near(m.figureLeft, 0); }
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
          compact:grid.matches('.app-grid') && !grid.querySelector('.card-media'),
          count:grid.children.length, cols:getComputedStyle(grid).gridTemplateColumns.split(' ').length,
          width:grid.getBoundingClientRect().width, gap:parseFloat(getComputedStyle(grid).columnGap),
          cards:[...grid.children].map(c => { const r=c.getBoundingClientRect(); return {width:r.width,top:r.top,left:r.left,right:r.right}; }) })),
        copyWidths:[...document.querySelectorAll('.work-entry .work-description p')].map(p => ({width:p.getBoundingClientRect().width,size:parseFloat(getComputedStyle(p).fontSize)})),
        feature:document.querySelector('.work-featured .card-media').getBoundingClientRect().width,
        featureRatio:getComputedStyle(document.querySelector('.work-featured .card-media')).aspectRatio,
        featureStart:getComputedStyle(document.querySelector('.work-featured > .card-media')).gridColumn,
        copyStart:getComputedStyle(document.querySelector('.work-featured > .work-copy')).gridColumn,
        featureHeight:document.querySelector('.work-featured img').getBoundingClientRect().height,
        featureMax:getComputedStyle(document.querySelector('.work-featured img')).maxHeight,
        copyWidth:document.querySelector('.work-featured > .work-copy').getBoundingClientRect().width,
        gridWidth:document.querySelector('.work-featured').getBoundingClientRect().width,
        gutter:parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--jk-gutter')),
        overflow:document.documentElement.scrollWidth > innerWidth
      }));
      assert.equal(work.overflow,false); assert.equal(work.featureRatio,'16 / 9');
      assert.equal(work.featureMax,'700px'); assert.ok(work.featureHeight <= 700);
      if (width >= 900) {
        assert.equal(work.featureStart,'1 / 8'); assert.equal(work.copyStart,'8 / -1');
        near(work.copyWidth,(work.gridWidth - 11*work.gutter)/12*5 + 4*work.gutter);
      }
      for (const p of work.copyWidths) assert.ok(p.width <= p.size * 32 + 1,'Card running text stays within 32em');
      for (const g of work.grids) {
        const rows = [...new Set(g.cards.map(c=>Math.round(c.top)))].map(top=>g.cards.filter(c=>Math.round(c.top)===top));
        const occupancy = width < 760 ? Array(g.count).fill(1) : g.count === 5 ? (g.compact && width >= 1920 ? [5] : [3,2]) : g.count === 4 && width < 1440 ? [2,2] : [g.count];
        assert.deepEqual(rows.map(row=>row.length),occupancy,JSON.stringify(g));
        assert.ok(rows.every(row=>row.length <= (g.compact && width >= 1920 ? 5 : 4)),'Only compact app groups may have five visual columns');
        if (g.count === 1) near(g.cards[0].width,(g.width-g.gap*((width<760 ? 1 : width<1440 ? 2 : 4)-1))/(width<760 ? 1 : width<1440 ? 2 : 4));
        else for (const row of rows) {
          for (const card of row) near(card.width,(g.width-g.gap*(row.length-1))/row.length);
          near(row.at(-1).right-row[0].left,g.width);
        }
      }
    } finally { await page.close(); }
  });
}
for (const width of [390,1100,1440,2560,3440]) {
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
          const title=document.querySelector('.page-title').getBoundingClientRect();
          const frame=document.querySelector('main').getBoundingClientRect();
          return {width:portrait.width,left:portrait.left,top:portrait.top,textWidth:r.width,textRight:r.right,textTop:r.top,
            titleTop:title.top,center:(r.left+portrait.right)/2,frameCenter:(frame.left+frame.right)/2,
            size:css.fontSize,leading:css.lineHeight,overflow:document.documentElement.scrollWidth > innerWidth};
        });
        if (width >= 1100) {
          assert.ok(m.width>=420 && m.width<=560); near(m.textWidth,560);
          near(m.left-m.textRight,12,2); near(m.top,m.titleTop,4); near(m.center,m.frameCenter,16);
        } else { near(m.width,160); assert.ok(m.textTop > m.top + 160); }
        assert.equal(m.size,'20px'); assert.equal(m.leading,'28px'); assert.equal(m.overflow,false);
      }
    } finally { await page.close(); }
  });
}
for (const width of [760,1440,1920,2560,3440]) {
  test(`E2 reading paths use card tracks and keep the dated archive at ${width}px`,async () => {
    const page=await browser.newPage({viewport:{width,height:1000}});
    try {
      await page.goto(base+'/blog/');
      const columns=await page.locator('.reading-paths').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
      assert.equal(columns,width<1920 ? 2 : 3);
      assert.ok(await page.locator('.list .dated-row').count());
      for (const lang of ['en','it']) {
        await page.evaluate(lang => window.toggleGlobalLang(lang),lang);
        const archive=await page.locator(`.list.lang-${lang} .archive-years`).evaluate(el => ({
          columns:getComputedStyle(el).gridTemplateColumns.split(' ').length,
          years:[...el.querySelectorAll('.archive-year')].map(section => ({
            label:section.querySelector('h3').textContent.trim(),sticky:getComputedStyle(section.querySelector('h3')).position,
            dates:[...section.querySelectorAll('time')].map(time => time.dateTime.slice(0,4))
          }))
        }));
        assert.equal(archive.columns,width < 1440 ? 1 : width < 1920 ? 2 : width < 2560 ? 3 : 4);
        assert.ok(archive.years.length > 1);
        assert.equal(new Set(archive.years.map(y=>y.label)).size,archive.years.length);
        for (const year of archive.years) {
          assert.match(year.label,/^\d{4}$/); assert.equal(year.sticky,'sticky'); assert.ok(year.dates.length);
          assert.ok(year.dates.every(date => date === year.label),JSON.stringify(year));
        }
      }
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
test('E2 defines exactly the three photographic formats and applies them without cropping screenshots',async () => {
  const css=await fs.readFile(path.resolve(__dirname,'../assets/css/jaack-site.css'),'utf8');
  for (const [format,ratio] of [['3x2','3 / 2'],['4x5','4 / 5'],['1x1','1 / 1']]) {
    assert.ok(css.includes(`.jk-photo-${format} { aspect-ratio: ${ratio}; object-fit: cover; }`));
  }
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  try {
    await page.goto(base+'/recensione-caricatore-wireless-spigen-en/');
    for (const route of ['/recensione-caricatore-wireless-spigen-en/','/recensione-caricatore-wireless-spigen/']) {
      await page.goto(base+route);
      for (const suffix of ['-2','-3','-4','']) {
        const photo=page.locator(`.post-body img[src$="Spigen-Steadiboost-Flex${suffix}.jpg"]`);
        const m=await photo.evaluate(img=>({classes:[...img.classList],ratio:getComputedStyle(img).aspectRatio,fit:getComputedStyle(img).objectFit}));
        assert.ok(m.classes.includes('image'),'preserve the source image class');
        assert.ok(m.classes.includes('jk-photo-3x2')); assert.equal(m.ratio,'3 / 2'); assert.equal(m.fit,suffix ? 'contain' : 'cover');
      }
    }
    await page.goto(base+'/about/');
    assert.ok(await page.locator('.about-portrait').evaluate(img=>img.classList.contains('jk-photo-1x1')));
    await page.goto(base);
    const screenshots=await page.locator('.card-media img').evaluateAll(imgs=>imgs.map(img=>({classes:[...img.classList],fit:getComputedStyle(img).objectFit})));
    assert.ok(screenshots.length>=8);
    for (const img of screenshots) { assert.ok(img.classes.every(c=>!c.startsWith('jk-photo-'))); assert.equal(img.fit,'contain'); }
    const hero=page.locator('.hero-visual img'); await hero.evaluate(img=>img.decode());
    assert.ok(await hero.evaluate(img=>img.naturalWidth>0));
    await page.goto(base+'/projects/');
    const featured=page.locator('.work-featured img'); await featured.evaluate(img=>img.decode());
    assert.equal(await featured.evaluate(img=>img.naturalWidth),1672);
  } finally { await page.close(); }
});

for (const width of [1440,1920,2560,3440]) {
  test(`E2 centers bounded story rails and reserves absent notes at ${width}px`,async () => {
    const page=await browser.newPage({viewport:{width,height:1000}});
    try {
      await page.goto(base+loops);
      await page.evaluate(()=>document.fonts.ready);
      const measure=()=>page.evaluate(()=>{
        const frame=document.querySelector('main').getBoundingClientRect();
        const group=document.querySelector('.story').getBoundingClientRect();
        const rail=document.querySelector('.story-rail').getBoundingClientRect();
        const p=document.querySelector('.prose > p:not(:has(img))').getBoundingClientRect();
        return {frameCenter:(frame.left+frame.right)/2,groupCenter:(group.left+group.right)/2,
          frameLeft:frame.left,railLeft:rail.left,textLeft:p.left,width:p.width,groupWidth:group.width};
      });
      const initial=await measure();
      near(initial.groupCenter,initial.frameCenter,16);
      assert.ok(initial.railLeft > initial.frameLeft + 80);
      near(initial.width,width >= 1920 ? 640 : 560);
      await page.evaluate(()=>{
        let notes=document.querySelector('.story-notes');
        if (!notes) { notes=document.createElement('aside'); notes.className='story-notes'; document.querySelector('.story').append(notes); }
        notes.replaceChildren();
      });
      const empty=await measure(); near(empty.textLeft,initial.textLeft); near(empty.groupWidth,initial.groupWidth);
      await page.locator('.story-notes').evaluate(el=>el.remove());
      const absent=await measure(); near(absent.textLeft,initial.textLeft); near(absent.groupCenter,initial.frameCenter,16);
    } finally { await page.close(); }
  });
}

for (const width of [390,760,1440,1919,1920,2560,3440]) {
  test(`E2 Small apps fills compact rows without a preview at ${width}px`,async t => {
    const page=await browser.newPage({viewport:{width,height:1000}});
    try {
      await page.goto(base);
      await page.evaluate(()=>document.fonts.ready);
      assert.equal(await page.locator('.app-preview').count(),0);
      assert.equal(await page.locator('.app-gallery > figure, .app-gallery .card-media').count(),0);
      for (const [lang,eyebrow,title,intro] of [
        ['en','Made for the everyday','Small apps.Useful details.','The sea, a workout, a focused hour, a delivery, a thread. Five native apps I’m working on.'],
        ['it','Per le cose di ogni giorno','Piccole app.Dettagli utili.','Il mare, un allenamento, un’ora di concentrazione, una consegna, un thread. Cinque app native a cui sto lavorando.']
      ]) {
        await page.evaluate(lang=>window.toggleGlobalLang(lang),lang);
        assert.equal(await page.locator(`.app-gallery .work-meta .lang-${lang}`).textContent(),eyebrow);
        assert.equal(await page.locator(`#apps-title .lang-${lang}`).textContent(),title);
        assert.equal(await page.locator(`.app-gallery .section-intro .lang-${lang}`).textContent(),intro);
        const m=await page.locator('.app-gallery').evaluate(gallery=>{
          const rect=el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,top:r.top,bottom:r.bottom};};
          const grid=gallery.querySelector('.app-links');
          return {gallery:rect(gallery),intro:rect(gallery.querySelector('.app-gallery-copy')),grid:rect(grid),
            gap:parseFloat(getComputedStyle(grid).columnGap),
            cards:[...grid.children].map(card=>({...rect(card),href:card.getAttribute('href')})),
            icons:[...grid.querySelectorAll('img, .app-monogram')].map(rect)};
        });
        near(m.grid.width,m.gallery.width); near(m.grid.left,m.gallery.left);
        assert.ok(m.intro.bottom < m.grid.top,'Intro stays above the full-width grid');
        assert.deepEqual(m.cards.map(c=>c.href),['/projects/sea-temperature/','/projects/hundred/','/projects/pommidoro/','/projects/parcelpilot/','/projects/carta/']);
        assert.equal(m.icons.length,5); m.icons.forEach(icon=>near(icon.width,64));
        const rows=[...new Set(m.cards.map(c=>Math.round(c.top)))].map(top=>m.cards.filter(c=>Math.round(c.top)===top));
        assert.deepEqual(rows.map(row=>row.length),width<760 ? [1,1,1,1,1] : width<1920 ? [3,2] : [5]);
        for (const row of rows) {
          row.forEach(card=>near(card.width,(m.grid.width-m.gap*(row.length-1))/row.length));
          near(row[0].left,m.grid.left); near(row.at(-1).right,m.grid.right);
        }
        t.diagnostic(JSON.stringify({viewport:width,lang,smallApps:{preview:false,intro:true,rows:rows.map(row=>row.length),widths:rows.map(row=>row.map(c=>c.width))}}));
      }
      assert.equal(await page.locator('.app-gallery img[src*="pommidoro-screen"]').count(),0);
      assert.equal(await page.locator('#selected-work .cards > .project-feature').count(),4);
      assert.equal(await page.locator('#selected-work .card-media img[src*="pommidoro-screen"]').count(),1);
      assert.equal(await page.locator('img[src*="pommidoro-screen"]').count(),1);
      assert.equal(await page.locator('.app-gallery img[src*="carta"]').count(),0);
      assert.equal(await page.locator('.app-links a[href="/projects/carta/"] .app-monogram').textContent(),'C');
      assert.equal(await page.locator('.app-links a[href="/projects/pommidoro/"] img').getAttribute('src'),'/assets/images/work/pommidoro.png');
    } finally { await page.close(); }
  });
}

for (const width of [390,760,1440,1919,1920,2560,3440]) {
  test(`E2 Work uses text and compact icon cards at ${width}px`,async t => {
    const page=await browser.newPage({viewport:{width,height:1000}});
    try {
      await page.goto(base+'/projects/');
      await page.evaluate(()=>document.fonts.ready);
      const textIds=['redbridge','acps','ideas','portfolio-os','routescan'];
      for (const id of textIds) {
        assert.equal(await page.locator(`#${id} .card-media`).count(),0,`${id} has no empty stage`);
        assert.equal(await page.locator(`#${id} .work-meta`).count(),1);
        assert.equal(await page.locator(`#${id} h3 a`).count(),1);
        assert.ok(await page.locator(`#${id} .work-description p`).count());
      }
      const icons=await page.locator('#eva, #hundred, #carta, #sea-temperature, #parcelpilot, #pommidoro').evaluateAll(cards=>cards.map(card=>{
        const icon=card.querySelector('.work-heading > .app-icon, .work-heading > .app-monogram');
        const r=icon.getBoundingClientRect(),title=card.querySelector('h3').getBoundingClientRect();
        return {id:card.id,media:card.querySelectorAll('.card-media').length,width:r.width,height:r.height,
          titleGap:title.left-r.right,centerDelta:(title.top+title.bottom-r.top-r.bottom)/2};
      }));
      assert.equal(icons.length,6);
      for (const icon of icons) {
        assert.equal(icon.media,0,icon.id); assert.ok(icon.width>=56 && icon.width<=64,JSON.stringify(icon));
        near(icon.height,icon.width); near(icon.titleGap,14); near(icon.centerDelta,0);
      }
      for (const id of ['gm10','eva-protocol','evalanche','lg-tv-use']) {
        assert.equal(await page.locator(`#${id} .card-media`).count(),1,`${id} keeps its artwork`);
        assert.equal(await page.locator(`#${id} .card-media`).evaluate(el=>getComputedStyle(el).aspectRatio),'3 / 2');
      }
      assert.equal(await page.locator('img[src*="pommidoro-screen"]').count(),0);
      assert.equal(await page.locator('#pommidoro .app-icon').getAttribute('src'),'/assets/images/work/pommidoro.png');
      const work=await page.evaluate(()=>{
        const rect=el=>{const r=el.getBoundingClientRect();return {id:el.id,width:r.width,top:r.top};};
        return {redbridge:rect(document.querySelector('#redbridge')),
          ventures:[...document.querySelectorAll('[aria-labelledby="group-ventures"] > .cards > .work-entry')].map(rect),
          native:[...document.querySelectorAll('.app-grid > .work-entry')].map(rect)};
      });
      assert.deepEqual(work.ventures.map(c=>c.id),['gm10','eva','eva-protocol']);
      assert.deepEqual(work.native.map(c=>c.id),['sea-temperature','hundred','pommidoro','parcelpilot','carta']);
      if (width>=760) {
        assert.ok(work.ventures.every(c=>Math.abs(c.top-work.ventures[0].top)<1));
        if (width>=1920) assert.ok(work.native.every(c=>Math.abs(c.top-work.native[0].top)<1));
        else {
          assert.ok(work.native.slice(0,3).every(c=>Math.abs(c.top-work.native[0].top)<1));
          near(work.native[3].top,work.native[4].top); assert.ok(work.native[3].top>work.native[0].top);
        }
      }
      if (width>=2560) assert.ok(work.redbridge.width>=500 && work.redbridge.width<=850);
      t.diagnostic(JSON.stringify({viewport:width,...work,icons}));
    } finally {await page.close();}
  });
}

test('E2 groups only consecutive natural portrait media and caps rows at 900px',async () => {
  const page=await browser.newPage({viewport:{width:2560,height:1400}});
  try {
    await page.goto(base+loops);
    await page.evaluate(()=>{
      const screen='/assets/images/work/carta/carta-publish-native-preview.png';
      const prose=document.querySelector('.prose');
      prose.innerHTML=`<p id="before">Before.</p><img src="${screen}" alt="One"><p><a href="${screen}"><img src="${screen}" alt="Two"></a></p><figure><img src="${screen}" alt="Three"><figcaption>Caption.</figcaption></figure><p id="between">Between.</p><p><img src="${screen}" alt="Four"></p><img src="${screen}" alt="Five"><h2 id="heading">Heading.</h2><img src="${screen}" alt="Six"><p>After.</p><p>Inline prose <img src="${screen}" alt="Inline"> stays inline.</p>`;
    });
    await page.addScriptTag({url:base+'/assets/js/story-media.js'});
    await page.locator('.prose img').evaluateAll(imgs=>Promise.all(imgs.map(img=>img.decode())));
    await page.waitForFunction(()=>document.querySelectorAll('.story-portrait-row').length===2);
    const m=await page.evaluate(()=>({
      rows:[...document.querySelectorAll('.story-portrait-row')].map(row=>({
        count:row.children.length,display:getComputedStyle(row).display,
        heights:[...row.querySelectorAll('img')].map(img=>img.getBoundingClientRect().height),
        fits:[...row.querySelectorAll('img')].map(img=>getComputedStyle(img).objectFit)
      })),
      individuals:document.querySelectorAll('.prose > .story-portrait').length,
      before:document.querySelector('#before').textContent,between:document.querySelector('#between').textContent,
      caption:document.querySelector('.story-portrait-row figcaption').textContent,
      inline:document.querySelector('img[alt="Inline"]').closest('p').className,
      inlineWidth:document.querySelector('img[alt="Inline"]').closest('p').getBoundingClientRect().width,
      inlineFit:getComputedStyle(document.querySelector('img[alt="Inline"]')).objectFit,
      overflow:document.documentElement.scrollWidth>innerWidth
    }));
    assert.deepEqual(m.rows.map(row=>row.count),[3,2]);
    for(const row of m.rows) {
      assert.equal(row.display,'flex'); row.heights.forEach(h=>near(h,900));
      assert.ok(row.fits.every(fit=>fit==='contain'));
    }
    assert.equal(m.individuals,1); assert.equal(m.before,'Before.'); assert.equal(m.between,'Between.');
    assert.equal(m.caption,'Caption.'); assert.equal(m.inline,''); near(m.inlineWidth,640); assert.equal(m.inlineFit,'contain'); assert.equal(m.overflow,false);
  } finally { await page.close(); }
});
