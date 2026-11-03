#!/usr/bin/env node
// Only CI invokes this entry point. Credentials stay in environment variables and are never logged.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const env = process.env;
const [cid, car] = process.argv.slice(2);
if (!/^b[a-z2-7]+$/.test(cid || '') || !car || !/^[0-9a-f]{40}$/.test(env.GITHUB_SHA || '')) throw new Error('Invalid CID, CAR, or commit');
const summary = message => { if (env.GITHUB_STEP_SUMMARY) fs.appendFileSync(env.GITHUB_STEP_SUMMARY, message + '\n'); };
if (![env.FILEBASE_ACCESS_KEY, env.FILEBASE_SECRET_KEY, env.FILEBASE_BUCKET].every(Boolean)) {
  console.log('::notice::Filebase secrets are incomplete; CAR-only mode. No pin or DNS changes.');
  summary('\nCAR-only mode: Filebase secrets are incomplete.');
  process.exit(0);
}
const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
const key = `jaack-me/${timestamp}-${env.GITHUB_SHA.slice(0, 7)}-${cid}.car`;
const awsEnv = { ...env, AWS_ACCESS_KEY_ID: env.FILEBASE_ACCESS_KEY, AWS_SECRET_ACCESS_KEY: env.FILEBASE_SECRET_KEY, AWS_REGION: 'us-east-1', AWS_DEFAULT_REGION: 'us-east-1', AWS_EC2_METADATA_DISABLED: 'true', AWS_PAGER: '' };
// Use argument arrays; never interpolate credentials, bucket names, or record names into shell code.
function aws(args) {
  try { return execFileSync('aws', ['--endpoint-url', 'https://s3.filebase.com', ...args], { env: awsEnv, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 300000 }); }
  catch { throw new Error('Filebase S3 request failed (credentials and response suppressed)'); }
}
aws(['s3', 'cp', car, `s3://${env.FILEBASE_BUCKET}/${key}`, '--metadata', 'import=car', '--only-show-errors']);
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
let matched = false;
for (let attempt = 0; attempt < 12; attempt++) {
  try {
    const head = JSON.parse(aws(['s3api', 'head-object', '--bucket', env.FILEBASE_BUCKET, '--key', key, '--output', 'json']));
    if (head.Metadata?.cid === cid) { matched = true; break; }
  } catch { /* The object metadata can lag behind the upload. */ }
  if (attempt < 11) await pause(10000);
}
if (!matched) throw new Error('Filebase root CID metadata did not match the local CID after retries; DNSLink unchanged');
console.log('Filebase pin verified against local root CID.');
summary(`\nFilebase pin verified. Object key: \`${key}\`.`);
if (![env.CLOUDFLARE_DNSLINK_TOKEN, env.CLOUDFLARE_ZONE_ID, env.IPFS_DNSLINK_NAME].every(Boolean)) {
  console.log('::notice::DNSLink token or variables are incomplete; verified Filebase pin retained, DNS unchanged.');
  summary('\nDNSLink unchanged: token or variables are incomplete.');
  process.exit(0);
}
if (!/^[a-f0-9]{32}$/i.test(env.CLOUDFLARE_ZONE_ID) || !/^(?:[a-z0-9_-]+\.)+[a-z0-9-]+$/i.test(env.IPFS_DNSLINK_NAME)) throw new Error('Invalid DNSLink zone ID or record name');
const endpoint = `https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/dns_records`;
async function cloudflare(url, method = 'GET', body) {
  let response;
  try { response = await fetch(url, { method, headers: { Authorization: `Bearer ${env.CLOUDFLARE_DNSLINK_TOKEN}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(30000) }); }
  catch { throw new Error('Cloudflare network request failed; response suppressed'); }
  if (!response.ok) throw new Error(`Cloudflare request failed (HTTP ${response.status})`);
  const data = await response.json();
  if (!data.success) throw new Error('Cloudflare API rejected the DNSLink request');
  return data;
}
const records = [];
for (let page = 1; ; page++) {
  const query = new URLSearchParams({ type: 'TXT', name: env.IPFS_DNSLINK_NAME, per_page: '100', page: String(page) });
  const data = await cloudflare(`${endpoint}?${query}`);
  records.push(...data.result.filter(r => r.type === 'TXT' && r.name.toLowerCase() === env.IPFS_DNSLINK_NAME.toLowerCase() && r.content.startsWith('dnslink=')));
  if (page >= (data.result_info?.total_pages || 1)) break;
}
if (records.length > 1) throw new Error('Multiple DNSLink TXT records at the exact name; refusing ambiguous update');
const old = records[0], content = `dnslink=/ipfs/${cid}`;
if (old && !/^[a-f0-9]{32}$/i.test(old.id)) throw new Error('Invalid Cloudflare record ID');
const saved = await cloudflare(old ? `${endpoint}/${old.id}` : endpoint, old ? 'PATCH' : 'POST', { type: 'TXT', name: env.IPFS_DNSLINK_NAME, content, ttl: 300 });
if (saved.result?.content !== content) throw new Error('Cloudflare returned unexpected DNSLink content');
// JSON formatting keeps untrusted old TXT content from injecting Markdown structure.
summary(`\nDNSLink \`${env.IPFS_DNSLINK_NAME}\` updated (TTL 300).\n\nOld: ${JSON.stringify(old?.content ?? null)}\n\nNew: \`${content}\``);
console.log('DNSLink update verified.');
