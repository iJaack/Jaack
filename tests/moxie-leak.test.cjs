'use strict';
// Fails if private Moxie collection data or credentials end up in the repository
// or in the public moxie.jaack.me build output (moxie/dist, when present).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const MOXIE = path.join(ROOT, 'moxie');

const FORBIDDEN_NAMES = [
  /^collection.*\.csv$/i,
  /^collection_hydrated\.json$/i,
  /^collection_sanity\.json$/i,
  /^cardmarket_prices\.json$/i,
  /^purchases.*$/i,
  /^scryfall_cache.*\.json$/i,
  /^\.env.*$/i,
];
const FORBIDDEN_DIRS = ['.vercel', 'price-update-runs', 'moxfield'];
const FORBIDDEN_STRINGS = [
  /Purchase Price/i,
  /purchase_price/i,
  /Tradelist/i,
  /golden-store-/i,
  /cardmarket-import-/i,
  /VERCEL_OIDC/,
  /\/Users\/jaack/,
];
const TEXT = new Set(['.py', '.json', '.js', '.cjs', '.mjs', '.css', '.html', '.md', '.txt', '.xml', '.svg', '.yml', '.yaml', '.csv', '']);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__pycache__' || entry.name === 'node_modules') continue;
      out.push(full + path.sep);
      walk(full, out);
    } else out.push(full);
  }
  return out;
}

function trackedFiles() {
  try {
    return execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8' })
      .split('\0').filter(Boolean).map(f => path.join(ROOT, f));
  } catch { return []; }
}

test('no private Moxie files are tracked anywhere in the repository', () => {
  const bad = trackedFiles().filter(f => FORBIDDEN_NAMES.some(rx => rx.test(path.basename(f))) ||
    FORBIDDEN_DIRS.some(d => f.split(path.sep).includes(d)));
  assert.deepStrictEqual(bad.map(f => path.relative(ROOT, f)), []);
});

test('moxie/ (source and build output) has no private file names', () => {
  const bad = walk(MOXIE).filter(f => {
    const name = path.basename(f.replace(/[\\/]$/, ''));
    if (f.endsWith(path.sep)) return FORBIDDEN_DIRS.includes(name);
    return FORBIDDEN_NAMES.some(rx => rx.test(name));
  });
  assert.deepStrictEqual(bad.map(f => path.relative(ROOT, f)), []);
});

test('moxie/ contains no purchase, trade-list or credential strings', () => {
  const hits = [];
  for (const f of walk(MOXIE)) {
    if (f.endsWith(path.sep) || !TEXT.has(path.extname(f).toLowerCase())) continue;
    const text = fs.readFileSync(f, 'utf8');
    for (const rx of FORBIDDEN_STRINGS) if (rx.test(text)) hits.push(`${path.relative(ROOT, f)}: ${rx}`);
  }
  assert.deepStrictEqual(hits, []);
});
