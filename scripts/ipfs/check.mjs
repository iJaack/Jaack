#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { files, scan, textFile, rootRelative, internal, decodeHTML } from './urls.mjs';
export function forbidden(file) {
  const parts = file.split('/'), name = parts.at(-1);
  return parts.some(p => /^(moxie|\.git|\.tools|\.bundle|node_modules|vendor|scripts|tests|\.vercel|price-update-runs|moxfield)$/i.test(p)) ||
    file.toLowerCase() === 'docs/ipfs.md' || /^(\.env.*|Gemfile.*|id_rsa.*|collection\..*|collection.*\.csv|collection_hydrated\.json|collection_sanity\.json|cardmarket_prices\.json|purchases.*|scryfall_cache.*\.json)$/i.test(name) || /\.(pem|key)$/i.test(name);
}
export function check(dir = '_site_ipfs', options = {}) {
  const errors = [], root = path.resolve(dir);
  const totalLimit = Number(options.totalLimit ?? process.env.IPFS_MAX_TOTAL_MB ?? 300) * 1024 * 1024;
  const fileLimit = Number(options.fileLimit ?? process.env.IPFS_MAX_FILE_MB ?? 25) * 1024 * 1024;
  if (![totalLimit, fileLimit].every(n => Number.isFinite(n) && n > 0)) throw new Error('Size budgets must be positive numbers (MB)');
  let totalBytes = 0, references = 0;
  const list = files(root);
  for (const full of list) {
    const file = path.relative(root, full).split(path.sep).join('/');
    if (forbidden(file)) errors.push(`${file}: forbidden publish path`);
    const size = fs.statSync(full).size; totalBytes += size;
    if (size > fileLimit) errors.push(`${file}: ${size} bytes exceeds file budget ${fileLimit}`);
    if (!textFile(file)) continue;
    try { scan(file, fs.readFileSync(full, 'utf8'), raw => {
      const url = decodeHTML(raw).trim();
      if (rootRelative(url)) errors.push(`${file}: root-relative URL ${raw}`);
      if (!internal(url)) return raw;
      references++;
      try {
        const pathname = decodeURIComponent(url.split(/[?#]/)[0]);
        const target = path.resolve(path.dirname(full), pathname || '.');
        if (target !== root && !target.startsWith(root + path.sep)) throw new Error('escapes publish directory');
        const stat = fs.statSync(target);
        if (stat.isDirectory() && !fs.statSync(path.join(target, 'index.html')).isFile()) throw new Error('directory has no index.html');
        if (pathname.endsWith('/') && !stat.isDirectory()) throw new Error('directory URL targets a file');
      } catch (error) { errors.push(`${file}: broken link ${raw} (${error.code || error.message})`); }
      return raw;
    }); } catch (error) { errors.push(`${file}: ${error.message}`); }
  }
  // Also inspect empty directories: forbidden content must not be published even when empty.
  const walkDirs = dir => { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) if (entry.isDirectory()) {
    const full = path.join(dir, entry.name), rel = path.relative(root, full).split(path.sep).join('/');
    if (forbidden(rel)) errors.push(`${rel}/: forbidden publish directory`);
    walkDirs(full);
  } }; walkDirs(root);
  if (totalBytes > totalLimit) errors.push(`Total ${totalBytes} bytes exceeds budget ${totalLimit}`);
  return { files: list.length, totalBytes, references, errors };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const report = check(process.argv[2]);
    if (report.errors.length) { console.error(`IPFS validation failed (${report.errors.length}):\n${report.errors.join('\n')}`); process.exitCode = 1; }
    else console.log(`IPFS validation passed: ${report.files} files, ${report.references} references, ${report.totalBytes} bytes`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
