/* One article chart; all values come from the embedded dated CMC observations. */
(function () {
  'use strict';
  function nearestIndex(rows, timestamp) {
    let best = 0;
    for (let i = 1; i < rows.length; i++) {
      if (Math.abs(Date.parse(rows[i].date) - timestamp) < Math.abs(Date.parse(rows[best].date) - timestamp)) best = i;
    }
    return best;
  }
  function validate(rows) {
    return Array.isArray(rows) && rows.length > 1 && rows.every((r, i) =>
      r && Number.isFinite(Date.parse(r.date)) && Number.isFinite(r.price) && r.price > 0 &&
      Number.isFinite(r.circulating) && r.circulating > 0 && Number.isFinite(r.ratio) && r.ratio >= 0 && r.ratio <= 1 &&
      (!i || Date.parse(r.date) > Date.parse(rows[i - 1].date)));
  }
  function format(r) {
    return {
      date: new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(r.date)),
      price: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(r.price),
      circulating: new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(r.circulating),
      ratio: (r.ratio * 100).toFixed(1) + '%'
    };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { nearestIndex, validate, format };
  if (typeof document === 'undefined') return;
  const figure = document.getElementById('avax-history');
  if (!figure) return;
  let rows;
  try { rows = JSON.parse(document.getElementById('avax-history-data').textContent); } catch (_) { return; }
  if (!validate(rows)) return;
  const panel = figure.querySelector('.helicon-interactive');
  const plot = figure.querySelector('.helicon-plot');
  const slider = figure.querySelector('input');
  const ns = 'http://www.w3.org/2000/svg';
  let index = rows.length - 1;
  let geometry, crosshair, dot;
  const first = Date.parse(rows[0].date), last = Date.parse(rows[index].date);
  const ceiling = Math.ceil(Math.max(...rows.map(r => r.price)) / 25) * 25;
  function element(tag, attrs, text) {
    const el = document.createElementNS(ns, tag);
    for (const [name, value] of Object.entries(attrs || {})) el.setAttribute(name, value);
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function select(next) {
    index = Math.max(0, Math.min(rows.length - 1, Math.round(next)));
    const row = rows[index], values = format(row);
    for (const [key, value] of Object.entries(values)) figure.querySelector('[data-value="' + key + '"]').textContent = value;
    slider.value = index;
    slider.setAttribute('aria-valuetext', `${values.date}, ${values.price}, ${values.circulating} AVAX circulating, ${values.ratio} of cap`);
    if (crosshair) {
      const x = geometry.x(Date.parse(row.date)), y = geometry.y(row.price);
      crosshair.setAttribute('x1', x); crosshair.setAttribute('x2', x);
      dot.setAttribute('cx', x); dot.setAttribute('cy', y);
    }
  }
  function render() {
    const width = Math.max(280, Math.round(plot.getBoundingClientRect().width));
    const height = width < 500 ? 240 : 320;
    const left = 44, right = width - 14, top = 25, bottom = height - 30;
    geometry = { x: t => left + (t - first) / (last - first) * (right - left), y: v => bottom - v / ceiling * (bottom - top) };
    const svg = element('svg', { viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-labelledby': 'avax-svg-title avax-svg-desc' });
    svg.append(element('title', { id: 'avax-svg-title' }, 'AVAX monthly price in USD, October 2020 to September 2026'));
    svg.append(element('desc', { id: 'avax-svg-desc' }, 'Inspect monthly prices and circulating supply with the slider below. This is historical price data, not a forecast.'));
    svg.append(element('text', { x: left, y: 14 }, 'USD'));
    for (let value = 0; value <= ceiling; value += 25) {
      const y = geometry.y(value);
      svg.append(element('line', { x1: left, x2: right, y1: y, y2: y, class: 'helicon-grid' }));
      svg.append(element('text', { x: left - 8, y: y + 4, 'text-anchor': 'end' }, String(value)));
    }
    for (let year = 2021; year <= 2026; year += width < 500 ? 2 : 1) {
      svg.append(element('text', { x: geometry.x(Date.UTC(year, 0, 1)), y: height - 8, 'text-anchor': 'middle' }, String(year)));
    }
    svg.append(element('polyline', { points: rows.map(r => `${geometry.x(Date.parse(r.date))},${geometry.y(r.price)}`).join(' '), class: 'helicon-price-line' }));
    crosshair = element('line', { y1: top, y2: bottom, class: 'helicon-crosshair' });
    dot = element('circle', { r: 4.5, class: 'helicon-selected' });
    svg.append(crosshair, dot);
    function inspect(event) {
      const rect = svg.getBoundingClientRect();
      const localX = (event.clientX - rect.left) / rect.width * width;
      const fraction = Math.max(0, Math.min(1, (localX - left) / (right - left)));
      select(nearestIndex(rows, first + fraction * (last - first)));
    }
    svg.addEventListener('pointermove', event => { if (event.pointerType !== 'touch') inspect(event); });
    svg.addEventListener('pointerdown', inspect);
    plot.replaceChildren(svg);
    select(index);
  }
  slider.max = rows.length - 1;
  slider.addEventListener('input', () => select(Number(slider.value)));
  panel.hidden = false;
  try { render(); } catch (_) { panel.hidden = true; return; }
  figure.querySelector('.helicon-fallback').hidden = true;
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(render).observe(plot);
  else window.addEventListener('resize', render);
})();
