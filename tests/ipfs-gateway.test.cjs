const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const modules = Promise.all([import('../scripts/ipfs/gateway-safe.mjs'), import('../scripts/ipfs/check.mjs')]);
async function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'jaack-ipfs-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const input = path.join(dir, 'input'), output = path.join(dir, 'output');
  fs.cpSync(path.join(__dirname, 'fixtures/ipfs'), input, { recursive: true });
  const [{ gatewaySafe }, { check }] = await modules;
  gatewaySafe(input, output);
  return { input, output, check, gatewaySafe };
}
test('rewrites depths, every srcset candidate, styles, metadata, JSON and directory URLs', async t => {
  const { output, check } = await fixture(t);
  const home = fs.readFileSync(path.join(output, 'index.html'), 'utf8');
  const deep = fs.readFileSync(path.join(output, 'nested/deep/index.html'), 'utf8');
  assert.match(home, /href="about\/\?lang=en#intro"/);
  assert.match(home, /assets\/a.svg\?x=1#p 1x, assets\/a.svg 2x, data:image\/svg\+xml,foo 3x/);
  for (const value of ['https://jaack.me/about/', '//example.org/a', 'mailto:test@example.org', 'tel:123', '#a']) assert.ok(home.includes(`"${value}"`));
  assert.match(deep, /href="\.\.\/\.\.\/"/);
  assert.match(deep, /data-alt-url="\.\.\/\.\.\/about\/"/);
  assert.match(deep, /src=\.\.\/\.\.\/assets\/a.svg/);
  assert.match(home, /url\('assets\/a.svg\?q#f'\)/);
  assert.match(fs.readFileSync(path.join(output, 'assets/site.css'), 'utf8'), /url\(a.svg\?#font\)/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(output, 'manifest.webmanifest'))).icons[0].src, 'assets/a.svg');
  assert.ok(!fs.existsSync(path.join(output, 'CNAME')));
  assert.deepEqual(check(output).errors, []);
});
test('language switching uses rewritten data URLs from a nested gateway page', async t => {
  const { output } = await fixture(t);
  const html = fs.readFileSync(path.join(output, 'nested/deep/index.html'), 'utf8');
  const alt = html.match(/data-alt-url="([^"]+)"/)[1];
  const context = {
    window: { location: {}, dispatchEvent() {} },
    document: {
      documentElement: { getAttribute: () => 'it' },
      body: { classList: { add() {}, remove() {} } }, querySelectorAll: () => [],
      querySelector: selector => selector === '[data-alt-url]' ? { getAttribute: key => key === 'data-alt-url' ? alt : 'en' } : null
    },
    localStorage: { getItem() {}, setItem() {} }, navigator: { language: 'it' }, CustomEvent: function () {}
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../assets/js/language.js'), 'utf8'), context);
  context.window.toggleGlobalLang('en');
  assert.equal(new URL(context.window.location.href, 'http://localhost/ipfs/cid/nested/deep/').pathname, '/ipfs/cid/about/');
});
test('audit fails on runtime JS root paths instead of guessing their base', async t => {
  const { input, output, gatewaySafe } = await fixture(t);
  fs.writeFileSync(path.join(input, 'assets/runtime.js'), 'fetch("/assets/data.json");');
  assert.throws(() => gatewaySafe(input, output), /base-aware/);
});
test('denies all private data and deployment sources, including empty directories', async t => {
  const { output, check } = await fixture(t);
  const names = ['moxie/data.json', '.env.example', 'Gemfile.lock', 'nested/tls.pem', 'tls.key', 'id_rsa.pub', '.git/config', 'node_modules/a', 'vendor/a', 'docs/IPFS.md', 'scripts/a', 'tests/a', 'collection.csv', 'collection.any', 'collection_hydrated.json', 'collection_sanity.json', 'cardmarket_prices.json', 'purchases.json', 'scryfall_cache.json', '.vercel/a', 'price-update-runs/a', 'moxfield/a'];
  for (const name of names) { const f = path.join(output, name); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, 'private'); }
  fs.mkdirSync(path.join(output, 'nested/moxie'));
  const errors = check(output).errors;
  for (const name of names) assert.ok(errors.some(e => e.startsWith(name + ':')), name);
  assert.ok(errors.some(e => e.startsWith('nested/moxie/')));
});
test('detects broken references, traversal, roots, missing directory indexes, and budgets', async t => {
  const { output, check } = await fixture(t);
  fs.mkdirSync(path.join(output, 'empty'));
  fs.writeFileSync(path.join(output, 'bad.html'), '<img src="absent.png"><a href="../outside">escape</a><a href="empty/">empty</a><img src="/assets/a.svg"><img srcset="absent2.png 1x, absent3.png 2x">');
  const errors = check(output, { totalLimit: 0.001, fileLimit: 0.00001 }).errors.join('\n');
  for (const text of ['absent.png', 'escapes publish directory', 'empty/', 'root-relative', 'absent2.png', 'absent3.png', 'exceeds file budget', 'exceeds budget']) assert.ok(errors.includes(text), text);
});
test('preserves suffixes, same-directory links, and rejects dangerous copy destinations', async t => {
  const [{ rewrite }] = await modules;
  assert.equal(rewrite('/about/?q=a%20b#c', 'about/index.html'), './?q=a%20b#c');
  assert.equal(rewrite('/?q#f', 'index.html'), './?q#f');
  const { input, gatewaySafe } = await fixture(t);
  assert.throws(() => gatewaySafe(input, input), /separate/);
  assert.throws(() => gatewaySafe(input, path.join(input, 'output')), /non-nested/);
});
