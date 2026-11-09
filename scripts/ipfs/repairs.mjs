// Existing site defects repaired only in the IPFS copy. No network requests or guessed remote assets.
export const redirects = new Map([
  ...['terminal.co', 'italia.campus-party.org', 'tweaknology.org', 'avascan.info'].map(host => [host, `https://${host}`]),
  ['www.americanexpress.it/amico/gIACOB7yXC?XLINK=MYCP', 'https://www.americanexpress.it/amico/gIACOB7yXC?XLINK=MYCP'],
]);
export const repairs = new Map([
  ['/homescreen-2020-iphone', '/homescreen-iphone-2020/'],
  ['/podcast/ovvietà-ricompensa', '/podcast-ovvietà-ricompensa/'],
  ['/assets/images/projects/2030/cover.jpg', '/assets/images/projects/2030/2030_cover.png'],
  ['/assets/images/framework-propositi-2020.jpg', '/assets/images/obiettivi-2020.png'],
  // The checkout has no originals for these images. Explicit placeholders avoid fabricating them.
  ...['/assets/images/projects/2030/locandina.jpg', '/assets/images/projects/2030/foto-talk.jpg',
    '/assets/images/2026/autoscan-architecture.png', '/assets/images/ipfs-node-install.jpg']
    .map(url => [url, '/ipfs-missing-image.svg']),
]);
export const missingImage = '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="120" role="img" aria-label="Original image unavailable"><rect width="100%" height="100%" fill="#eee"/><text x="24" y="66" font-family="sans-serif" font-size="20">Original image unavailable in this archive</text></svg>\n';

export function redirectPage(target) {
  const escaped = target.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${escaped}"><title>External link</title></head><body><a href="${escaped}">Continue to the original external destination</a></body></html>\n`;
}
