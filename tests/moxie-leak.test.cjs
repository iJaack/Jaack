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
  /^\.env(?!\.example$).*$/i,
];
const FORBIDDEN_DIRS = ['.vercel', 'price-update-runs', 'moxfield'];
// collection.<anything> is private inventory, except the sanitized public snapshot
// (moxie/data/collection.json) and its build copy (moxie/dist/collection.json).
const COLLECTION_NAME = /^collection\./i;
const ALLOWED_COLLECTION = new Set(['moxie/data/collection.json', 'moxie/dist/collection.json']);
const COLLECTION_CARD_FIELDS = new Set(['key', 'name', 'set', 'collector_number', 'language', 'finish', 'count',
  'type_line', 'colors', 'color_identity', 'rarity', 'mana_value', 'scryfall_uri', 'faces', 'price_eur',
  'value_eur', 'price_source', 'decks']);
const COLLECTION_TOP_FIELDS = new Set(['schema', 'generated', 'prices_as_of', 'price_note', 'totals', 'sets', 'cards']);
const COLLECTION_TOTAL_FIELDS = new Set(['cards', 'unique', 'printings', 'sets', 'value_eur', 'priced_cards',
  'unpriced_cards', 'snapshot_priced_cards']);
const COLLECTION_FACE_FIELDS = new Set(['name', 'image', 'small']);
const COLLECTION_PRICE_NOTE = 'Scryfall EUR (Cardmarket trend) per printing and finish; snapshot = earlier cached price used because Scryfall had none.';
const PRIVATE_FIELD = /purchase|paid|tag|provenance|trade|modified|condition|alter|proxy/i;
const rel = f => path.relative(ROOT, f).split(path.sep).join('/');
const privateCollection = f => COLLECTION_NAME.test(path.basename(f)) && !ALLOWED_COLLECTION.has(rel(f));
const FORBIDDEN_STRINGS = [
  /Purchase Price/i,
  /purchase_price/i,
  /Tradelist/i,
  /golden-store-/i,
  /cardmarket-import-/i,
  /VERCEL_OIDC/,
  /VERCEL_TOKEN/,
  /\bprj_[A-Za-z0-9]{6,}/,
  /\bteam_[A-Za-z0-9]{6,}/,
  /price_?paid/i,
  /\/Users\/jaack/,
];
const TEXT = new Set(['.py', '.json', '.js', '.cjs', '.mjs', '.css', '.html', '.md', '.txt', '.xml', '.svg', '.yml', '.yaml', '.csv', '.env', '']);
// Env files (.env, .env.local, deploy.env, prod.env.local, ...) are always scanned for credential strings.
const ENV_FILE = /(^|\.)env(\.|$)/i;
const scannable = f => TEXT.has(path.extname(f).toLowerCase()) || ENV_FILE.test(path.basename(f));

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
    privateCollection(f) || FORBIDDEN_DIRS.some(d => f.split(path.sep).includes(d)));
  assert.deepStrictEqual(bad.map(f => path.relative(ROOT, f)), []);
});

test('moxie/ (source and build output) has no private file names', () => {
  const bad = walk(MOXIE).filter(f => {
    const name = path.basename(f.replace(/[\\/]$/, ''));
    if (f.endsWith(path.sep)) return FORBIDDEN_DIRS.includes(name);
    return FORBIDDEN_NAMES.some(rx => rx.test(name)) || privateCollection(f);
  });
  assert.deepStrictEqual(bad.map(f => path.relative(ROOT, f)), []);
});

test('moxie/ contains no purchase, trade-list or credential strings', () => {
  const hits = [];
  for (const f of walk(MOXIE)) {
    if (f.endsWith(path.sep) || !scannable(f)) continue;
    const text = fs.readFileSync(f, 'utf8');
    for (const rx of FORBIDDEN_STRINGS) if (rx.test(text)) hits.push(`${path.relative(ROOT, f)}: ${rx}`);
  }
  assert.deepStrictEqual(hits, []);
});

test('public collection snapshots carry only allowed fields', () => {
  const files = [...ALLOWED_COLLECTION].map(f => path.join(ROOT, f)).filter(f => fs.existsSync(f));
  assert.ok(files.some(f => rel(f) === 'moxie/data/collection.json'), 'moxie/data/collection.json is missing');
  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(f, 'utf8'));
    assert.deepStrictEqual(Object.keys(data).filter(k => !COLLECTION_TOP_FIELDS.has(k)), [], rel(f));
    assert.deepStrictEqual(Object.keys(data.totals).filter(k => !COLLECTION_TOTAL_FIELDS.has(k)), [], `${rel(f)}: totals`);
    assert.strictEqual(data.price_note, COLLECTION_PRICE_NOTE, `${rel(f)}: price_note changed`);
    const walkKeys = (value, where) => {
      if (Array.isArray(value)) value.forEach((v, i) => walkKeys(v, `${where}[${i}]`));
      else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) {
        if (where !== 'sets') assert.ok(!PRIVATE_FIELD.test(k), `${rel(f)}: private field ${where}.${k}`);
        walkKeys(v, where === '' ? k : `${where}.${k}`);
      }
    };
    walkKeys(data, '');
    for (const card of data.cards) {
      assert.deepStrictEqual(Object.keys(card).filter(k => !COLLECTION_CARD_FIELDS.has(k)), [], `${rel(f)}: ${card.name}`);
      for (const face of card.faces) {
        assert.deepStrictEqual(Object.keys(face).filter(k => !COLLECTION_FACE_FIELDS.has(k)), [], `${rel(f)}: ${card.name} face`);
        for (const k of ['image', 'small']) assert.strictEqual(new URL(face[k]).hostname, 'cards.scryfall.io');
      }
    }
  }
});
