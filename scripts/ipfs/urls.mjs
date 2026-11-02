// Small, dependency-free URL scanner. HTML raw-text elements are kept out of the tag scanner.
import fs from 'node:fs';
import path from 'node:path';
export const rootRelative = value => /^\/(?!\/)/.test(value);
export const internal = value => value && !/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value);
export function decodeHTML(value) {
  return value.replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi, entity => {
    const named = { '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };
    return named[entity.toLowerCase()] ?? String.fromCodePoint(entity[2].toLowerCase() === 'x' ? parseInt(entity.slice(3), 16) : parseInt(entity.slice(2), 10));
  });
}
export function css(text, visit) {
  return text.replace(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]*))\s*\)/gi,
    (all, a, b, c) => all.replace(a ?? b ?? c, visit(a ?? b ?? c, { asset: true, kind: 'css' })));
}
export function srcset(text, visit) {
  // Follow srcset tokenization: commas belong to data URLs until whitespace; other URLs end at a comma.
  return text.replace(/(^|[\s,]+)(data:[^\s]+|[^\s,]+)([^,]*)(,|$)/gi,
    (all, space, url, descriptor, comma) => space + visit(url, { asset: true, kind: 'srcset' }) + descriptor + comma);
}
export function javascript(text, visit) {
  // Audit root-path string literals, including template literal prefixes. Do not rewrite arbitrary JS:
  // relative strings in an external script resolve against the document, not the script's location.
  const tokens = /\/\*[\s\S]*?\*\/|\/\/[^\n\r]*|(["'`])(?:\\[\s\S]|(?!\1)[^\\])*?\1/g;
  for (const hit of text.matchAll(tokens)) {
    if (!hit[1]) continue; // comments
    const value = hit[0].slice(1, -1);
    if (!rootRelative(value) || value.startsWith('/*')) continue;
    const before = text.slice(Math.max(0, hit.index - 20), hit.index);
    const after = text.slice(hit.index + hit[0].length, hit.index + hit[0].length + 8);
    // Audited BeeLine bundle: unused Vue build-time BASE_URL and closing-tag construction.
    if (value === '/' && (/BASE_URL:$/.test(before) || (/\+$/.test(before) && /^\+h\+f/.test(after)))) continue;
    visit(value, { kind: 'js', asset: false });
  }
  return text;
}
export function html(text, visit) {
  return text.replace(/<!--[\s\S]*?-->|<(script|style)\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/\1\s*>|<[a-z][^>"']*(?:(?:"[^"]*"|'[^']*')[^>"']*)*>/gi, (all, raw, attrs, body) => {
    if (all.startsWith('<!--')) return all;
    const tag = (raw || all.match(/^<([\w:-]+)/)[1]).toLowerCase();
    const opening = raw ? `<${raw}${attrs}>` : all;
    const rewritten = opening.replace(/([^\s=<>]+)(\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g, (attr, name, equals, a, b, c) => {
      const key = name.toLowerCase(), value = a ?? b ?? c;
      let next = value;
      const use = (url, extra = {}) => visit(url, { tag, attr: key, asset: key !== 'href' || !['a', 'area', 'base'].includes(tag), ...extra });
      if (key === 'style') next = css(value, use);
      else if (key === 'srcset' || key === 'imagesrcset') next = srcset(value, use);
      else if (/^(href|src|poster|action|formaction|cite|background|longdesc|xlink:href|manifest)$/.test(key) || key.startsWith('data-')) {
        // data-* may also carry prose, JSON, numbers, language codes, etc.
        if (!key.startsWith('data-') || /^(?:\/(?!\/)|\.\.?\/)/.test(value) || /(?:url|src|href|poster)$/.test(key)) next = use(value, { asset: !key.startsWith('data-') && key !== 'action' && key !== 'formaction' && (key !== 'href' || !['a', 'area'].includes(tag)) });
      } else if (tag === 'meta' && key === 'content' && /^(?:\/(?!\/)|\.\.?\/)/.test(value)) next = use(value, { asset: false });
      return name + equals + (a !== undefined ? `"${next}"` : b !== undefined ? `'${next}'` : next);
    });
    if (!raw) return rewritten;
    const nextBody = tag === 'style' ? css(body, visit) : javascript(body, visit);
    return rewritten + nextBody + all.slice(opening.length + body.length);
  });
}
export function scan(file, text, visit) {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.html' || ext === '.svg') return html(text, visit);
  if (ext === '.css') return css(text, visit);
  if (ext === '.js' || ext === '.mjs') return javascript(text, visit);
  if (ext === '.json' || ext === '.webmanifest') {
    const walk = value => {
      if (typeof value === 'string') return rootRelative(value) || /^\.\.?\//.test(value) ? visit(value, { kind: 'json', asset: true }) : value;
      if (Array.isArray(value)) return value.map(walk);
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, walk(v)]));
      return value;
    };
    return JSON.stringify(walk(JSON.parse(text)), null, 2) + '\n';
  }
  return text;
}
export function files(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlink is not publishable: ${full}`);
    if (entry.isDirectory()) out.push(...files(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}
export const textFile = file => /\.(html|css|svg|js|mjs|json|webmanifest)$/i.test(file);
