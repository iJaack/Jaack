#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { scan, decodeHTML, internal } from './urls.mjs';
const [origin, cid, dir = '_site_ipfs', reportFile = path.join(process.env.TMPDIR || '/tmp', 'jaack-ipfs-dry-run.json'), carFile] = process.argv.slice(2);
if (!origin || !cid || !carFile) throw new Error('Usage: gateway-smoke.mjs origin cid dir report car');
const base = new URL(`/ipfs/${cid}/`, origin);
const blog = fs.readdirSync(dir).find(name => name.endsWith('-en') && fs.existsSync(path.join(dir, name, 'index.html')));
if (!blog) throw new Error('No blog post found');
const pages = ['', 'en/', 'projects/', 'projects/carta/', 'about/', `${blog}/`, '404.html'];
const assets = new Set();
async function get(url) {
  const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(20000) });
  if (response.status !== 200) throw new Error(`HTTP ${response.status}: ${url}`);
  return response;
}
async function asset(url) {
  if (assets.has(url.href)) return;
  assets.add(url.href);
  const response = await get(url);
  if (/\.css$/i.test(url.pathname)) {
    const nested = [];
    scan('asset.css', await response.text(), raw => { const next = resolve(raw, url); if (next) nested.push(next); return raw; });
    for (const next of nested) await asset(next);
  } else await response.arrayBuffer();
}
function resolve(raw, page) {
  const value = decodeHTML(raw);
  if (!value || /^(?:data:|blob:|#|mailto:|tel:)/i.test(value)) return;
  const url = new URL(value, page);
  if (url.origin !== base.origin) {
    // Absolute jaack.me references deliberately remain absolute in the archive. Check local
    // equivalents for same-site assets, without contacting the live website.
    if (url.origin !== 'https://jaack.me') return;
    url.href = new URL(url.pathname.slice(1) + url.search, base).href;
  }
  if (!url.pathname.startsWith(base.pathname)) throw new Error(`Asset escaped path gateway: ${raw}`);
  url.hash = '';
  return url;
}
for (const page of pages) {
  const url = new URL(page, base), html = await (await get(url)).text(), refs = [];
  if (!/jaack|giacomo/i.test(html) || !/<html\b/i.test(html)) throw new Error(`Not a site HTML page: ${url}`);
  scan('page.html', html, (raw, context) => {
    if (context.asset && context.kind !== 'js' && (internal(raw) || /^https?:|^\/\//i.test(raw))) {
      const next = resolve(raw, url); if (next) refs.push(next);
    }
    return raw;
  });
  for (const ref of refs) await asset(ref);
  console.log(`HTTP 200: ${url.pathname} (${refs.length} asset references)`);
}
if (!assets.size) throw new Error('No assets checked; HTML scanner or gateway response is invalid');
const report = { cid, carBytes: fs.statSync(carFile).size, pages: pages.length, assets: assets.size, gateway: base.href, reproducible: true };
fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
