/* Layout hook: classify rendered body media without changing article source. */
(() => {
  const prose = document.querySelector('.story > .prose');
  if (!prose) return;

  const isPortrait = node => node.matches('.story-portrait, .story-portrait-row');
  const groupPortraits = () => {
    for (const first of [...prose.children]) {
      if (first.parentElement !== prose || !isPortrait(first)) continue;
      const run = [first];
      let next = first.nextElementSibling;
      while (next && isPortrait(next)) { run.push(next); next = next.nextElementSibling; }
      if (run.length < 2) continue;
      const row = document.createElement('div');
      row.className = 'story-portrait-row';
      first.before(row);
      for (const node of run) {
        if (node.classList.contains('story-portrait-row')) {
          row.append(...node.children);
          node.remove();
        } else row.append(node);
      }
    }
  };

  for (const img of prose.querySelectorAll('img')) {
    const classify = () => {
      // These four portrait phones sit on transparent 1400×980 canvases.
      const paddedPhone = /\/homescreen-2020-iphone-(?:page[1-3]|widget)\.png$/.test(new URL(img.src).pathname);
      if (!img.naturalWidth || (!paddedPhone && img.naturalWidth >= img.naturalHeight)) return;
      img.classList.add('story-portrait');
      let figure = img;
      while (figure.parentElement !== prose) {
        const parent = figure.parentElement;
        // Only standalone images/links/figures; never absorb surrounding prose.
        if (!parent || !parent.matches('a, p, figure') || parent.querySelectorAll('img').length !== 1 ||
            [...parent.childNodes].some(node => node !== figure &&
              !(node.nodeType === 1 && node.matches('figcaption')) && node.textContent.trim())) return;
        figure = parent;
      }
      figure.classList.add('story-portrait');
      groupPortraits();
    };
    if (img.complete) classify();
    else img.addEventListener('load', classify, { once: true });
  }
})();
