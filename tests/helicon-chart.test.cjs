const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { nearestIndex, validate, format } = require('../assets/research/helicon/chart.js');
const rows = require('../_data/helicon_avax.json');
test('all interactive observations match the published source, including supply shares', () => {
  const [header, ...lines] = fs.readFileSync('assets/research/helicon/monthly-snapshots.csv', 'utf8').trim().split('\n');
  const keys = header.split(',');
  const source = lines.map(line => Object.fromEntries(line.split(',').map((v, i) => [keys[i], v]))).filter(r => r.token === 'AVAX');
  assert.equal(rows.length, 72);
  assert.deepEqual(rows, source.map(r => ({ date: r.date, price: Number(r.price_usd), circulating: Number(r.circulating), ratio: Number(r.ratio) })));
  assert.ok(validate(rows));
  for (const r of rows) assert.ok(Math.abs(r.ratio - r.circulating / 720e6) < 1e-12);
});
test('inspection uses actual timestamps and clamps to the first and last observation', () => {
  assert.equal(nearestIndex(rows, Date.UTC(2019, 0, 1)), 0);
  assert.equal(nearestIndex(rows, Date.UTC(2028, 0, 1)), 71);
  rows.forEach((r, i) => assert.equal(nearestIndex(rows, Date.parse(r.date)), i));
  const midpoint = (Date.parse(rows[0].date) + Date.parse(rows[1].date)) / 2;
  assert.equal(nearestIndex(rows, midpoint - 1), 0);
  assert.equal(nearestIndex(rows, midpoint + 1), 1);
});
test('readout formats UTC snapshots, USD and the policy-ceiling share', () => {
  assert.deepEqual(format(rows[0]), { date: '4 Oct 2020', price: '$3.96', circulating: '24,500,000', ratio: '3.4%' });
  assert.equal(format(rows.at(-1)).date, '6 Sept 2026');
  assert.equal(format(rows.at(-1)).ratio, '60.0%');
});
test('invalid or unordered observations leave the static fallback available', () => {
  assert.equal(validate([]), false);
  assert.equal(validate([null, rows[1]]), false);
  assert.equal(validate([...rows].reverse()), false);
  assert.equal(validate([{ ...rows[0], price: NaN }, ...rows.slice(1)]), false);
  assert.equal(validate([{ ...rows[0], ratio: 1.1 }, ...rows.slice(1)]), false);
});
