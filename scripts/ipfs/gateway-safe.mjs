#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { repairs, redirects, redirectPage, missingImage } from './repairs.mjs';
import { files, rootRelative, internal, scan, textFile } from './urls.mjs';
export function rewrite(url, file) {
  if (!rootRelative(url)) return url;
  const [, pathname, suffix] = url.match(/^([^?#]*)([\s\S]*)$/);
  let relative = path.posix.relative(path.posix.dirname(file), pathname.slice(1)) || '.';
  if (pathname.endsWith('/') && !relative.endsWith('/')) relative += '/';
  return relative + suffix;
}
export function gatewaySafe(input = '_site', output = '_site_ipfs') {
  input = path.resolve(input); output = path.resolve(output);
  if (input === output || input.startsWith(output + path.sep) || output.startsWith(input + path.sep)) throw new Error('Input and output directories must be separate, non-nested directories');
  const source = files(input); // Reject symlinks before copying.
  // Own the output directory only if it is absent, empty, or a previous IPFS build.
  if (fs.existsSync(output) && fs.readdirSync(output).length && !fs.existsSync(path.join(output, '.ipfs-output'))) throw new Error('Refusing to replace an unmarked nonempty output directory');
  fs.rmSync(output, { recursive: true, force: true });
  fs.cpSync(input, output, { recursive: true });
  fs.writeFileSync(path.join(output, '.ipfs-output'), 'gateway-safe\n');
  fs.rmSync(path.join(output, 'CNAME'), { force: true });
  fs.writeFileSync(path.join(output, 'ipfs-missing-image.svg'), missingImage);
  // Legacy source has /en/about/ but no English home; supply a real index instead of a gateway directory listing.
  const syntheticHome = !fs.existsSync(path.join(output, 'en/index.html')) && fs.existsSync(path.join(input, 'index.html'));
  if (syntheticHome) {
    fs.mkdirSync(path.join(output, 'en'), { recursive: true });
    fs.copyFileSync(path.join(input, 'index.html'), path.join(output, 'en/index.html'));
    source.push(path.join(input, 'en/index.html'));
  }
  const js = [];
  let repaired = 0;
  for (const sourceFile of source) {
    const file = path.relative(input, sourceFile).split(path.sep).join('/');
    if (file === 'CNAME' || !textFile(file)) continue;
    const destination = path.join(output, file);
    const text = fs.readFileSync(destination, 'utf8');
    const next = scan(file, text, (url, context) => {
      if (context.kind === 'js') { js.push(`${file}: ${url}`); return url; }
      // Preserve existing relative URLs verbatim. For known scheme-less external links,
      // supply a local redirect target instead of changing the original attribute.
      if (redirects.has(url)) {
        const target = path.resolve(output, path.posix.dirname(syntheticHome && file === 'en/index.html' ? 'index.html' : file), url.split(/[?#]/)[0], 'index.html');
        if (!target.startsWith(output + path.sep)) throw new Error('Redirect escaped output');
        if (!fs.existsSync(target)) {
          fs.mkdirSync(path.dirname(target), { recursive: true });
          fs.writeFileSync(target, redirectPage(redirects.get(url)));
        }
        repaired++;
      }
      if (repairs.has(url)) { repaired++; url = repairs.get(url); }
      // Only the synthesized home moves existing relative URLs to a different depth.
      if (syntheticHome && file === 'en/index.html' && internal(url) && !rootRelative(url)) url = '/' + url;
      return rewrite(url, file);
    });
    if (next !== text) fs.writeFileSync(destination, next);
  }
  if (js.length) throw new Error(`Root-relative JavaScript needs a base-aware implementation:\n${js.join('\n')}`);
  return { repaired, files: files(output).length };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(gatewaySafe(...process.argv.slice(2)))); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
