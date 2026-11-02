const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const CID = 'bafybeia2enznhnpq7c7frltoyj6pfekkxv5rw7apzdwjytwivoeovtf2ka';
function run(t, options = {}) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'jaack-pin-test-'));
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
  const log = path.join(tmp, 'calls.jsonl'), summary = path.join(tmp, 'summary.md');
  fs.writeFileSync(path.join(tmp, 'aws'), `#!/usr/bin/env node
const fs = require('node:fs');
const args = process.argv.slice(2);
fs.appendFileSync(process.env.TEST_LOG, JSON.stringify({ service: 'aws', args }) + '\\n');
if (process.env.TEST_UPLOAD_FAIL === 'true') process.exit(1);
if (args.includes('head-object')) console.log(JSON.stringify({ Metadata: { cid: process.env.TEST_MISMATCH === 'true' ? 'different' : '${CID}' } }));
`, { mode: 0o755 });
  const preload = path.join(tmp, 'network-mock.mjs');
  fs.writeFileSync(preload, `import fs from 'node:fs';
globalThis.setTimeout = callback => { queueMicrotask(callback); return 0; };
globalThis.fetch = async (url, options = {}) => {
  if (!String(url).startsWith('https://api.cloudflare.com/')) throw Error('Unexpected network destination');
  fs.appendFileSync(process.env.TEST_LOG, JSON.stringify({ service: 'dns', method: options.method, url: String(url), body: options.body && JSON.parse(options.body) }) + '\\n');
  const records = JSON.parse(process.env.TEST_RECORDS || '[]');
  const result = options.method === 'GET' ? records : JSON.parse(options.body);
  return { ok: true, json: async () => ({ success: true, result, result_info: { total_pages: 1 } }) };
};`);
  const env = { ...process.env, PATH: tmp + path.delimiter + process.env.PATH, GITHUB_SHA: 'a'.repeat(40), GITHUB_STEP_SUMMARY: summary, TEST_LOG: log,
    FILEBASE_ACCESS_KEY: '', FILEBASE_SECRET_KEY: '', FILEBASE_BUCKET: '', CLOUDFLARE_DNSLINK_TOKEN: '', CLOUDFLARE_ZONE_ID: '', IPFS_DNSLINK_NAME: '',
    TEST_MISMATCH: '', TEST_UPLOAD_FAIL: '', TEST_RECORDS: '[]' };
  if (options.pin) Object.assign(env, { FILEBASE_ACCESS_KEY: 'mock', FILEBASE_SECRET_KEY: 'mock', FILEBASE_BUCKET: 'mock-bucket' });
  if (options.dns) Object.assign(env, { CLOUDFLARE_DNSLINK_TOKEN: 'mock', CLOUDFLARE_ZONE_ID: 'b'.repeat(32), IPFS_DNSLINK_NAME: '_dnslink.jaack.me' });
  Object.assign(env, options.env);
  const result = spawnSync(process.execPath, ['--import', preload, path.resolve('scripts/ipfs/publish.mjs'), CID, path.join(tmp, 'site.car')], { env, encoding: 'utf8' });
  return { ...result, calls: fs.existsSync(log) ? fs.readFileSync(log, 'utf8').trim().split('\n').map(JSON.parse) : [], summary: fs.existsSync(summary) ? fs.readFileSync(summary, 'utf8') : '' };
}
test('publish succeeds in CAR-only mode without invoking services', t => {
  const result = run(t);
  assert.equal(result.status, 0, result.stderr); assert.match(result.stdout, /CAR-only/); assert.deepEqual(result.calls, []);
});
test('verified pin succeeds without DNS configuration; upload has CAR import metadata', t => {
  const result = run(t, { pin: true });
  assert.equal(result.status, 0, result.stderr); assert.equal(result.calls.length, 2);
  assert.ok(result.calls[0].args.includes('import=car')); assert.match(result.summary, /pin verified/);
});
test('DNSLink is created only after pin verification', t => {
  const result = run(t, { pin: true, dns: true });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.calls.map(c => c.service), ['aws', 'aws', 'dns', 'dns']);
  assert.equal(result.calls.at(-1).method, 'POST'); assert.equal(result.calls.at(-1).body.content, 'dnslink=/ipfs/' + CID); assert.equal(result.calls.at(-1).body.ttl, 300);
});
test('patches exact-name DNSLink record while preserving unrelated TXT records', t => {
  const result = run(t, { pin: true, dns: true, env: { TEST_RECORDS: JSON.stringify([
    { type: 'TXT', name: '_dnslink.other.me', content: 'dnslink=/ipfs/other', id: 'c'.repeat(32) },
    { type: 'TXT', name: '_dnslink.jaack.me', content: 'verification', id: 'd'.repeat(32) },
    { type: 'TXT', name: '_dnslink.jaack.me', content: 'dnslink=/ipfs/previous', id: 'e'.repeat(32) }
  ]) } });
  assert.equal(result.status, 0, result.stderr); assert.equal(result.calls.at(-1).method, 'PATCH'); assert.ok(result.calls.at(-1).url.endsWith('/' + 'e'.repeat(32))); assert.match(result.summary, /dnslink=\/ipfs\/previous/);
});
test('mismatched Filebase CID retries and prevents DNS updates', t => {
  const result = run(t, { pin: true, dns: true, env: { TEST_MISMATCH: 'true' } });
  assert.notEqual(result.status, 0); assert.match(result.stderr, /did not match/);
  assert.equal(result.calls.length, 13); assert.ok(result.calls.every(c => c.service === 'aws'));
});
test('upload failures and ambiguous DNS records stop publication safely', t => {
  const failed = run(t, { pin: true, dns: true, env: { TEST_UPLOAD_FAIL: 'true' } });
  assert.notEqual(failed.status, 0); assert.equal(failed.calls.length, 1);
  const record = { type: 'TXT', name: '_dnslink.jaack.me', content: 'dnslink=/ipfs/old', id: 'e'.repeat(32) };
  const duplicate = run(t, { pin: true, dns: true, env: { TEST_RECORDS: JSON.stringify([record, record]) } });
  assert.notEqual(duplicate.status, 0); assert.match(duplicate.stderr, /Multiple DNSLink/); assert.ok(!duplicate.calls.some(c => c.method === 'POST' || c.method === 'PATCH'));
});
