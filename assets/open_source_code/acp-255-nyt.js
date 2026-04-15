/// <reference path="./acp-255-types.d.ts" />

(function () {
  'use strict';

  if (window.renderMathInElement) {
    window.renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\[', right: '\\]', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false }
      ],
      throwOnError: false
    });
  }

  var fadeEls = document.querySelectorAll('.acp255-nyt .fade-in');
  if (fadeEls.length) {
    var fadeObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          if (!(e.target instanceof HTMLElement)) return;
          var parent = e.target.parentElement;
          var siblings = parent ? parent.querySelectorAll('.fade-in') : [];
          var idx = Array.prototype.indexOf.call(siblings, e.target);
          e.target.style.transitionDelay = (idx * 0.08) + 's';
          e.target.classList.add('is-visible');
          fadeObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    fadeEls.forEach(function (el) { fadeObs.observe(el); });
  }

  var formulaSections = document.querySelectorAll('.acp255-nyt .section-formula[data-formula]');
  if (formulaSections.length) {
    var syncObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && window.acp255Explorer) {
          var name = e.target.getAttribute('data-formula');
          if (name === 'acp77' || name === 'gaussian' || name === 'mono' || name === 'hybrid') {
            window.acp255Explorer.highlightFormula(name);
          }
        }
      });
    }, { threshold: 0.3, rootMargin: '-10% 0px -40% 0px' });
    formulaSections.forEach(function (s) { syncObs.observe(s); });

    var clearObs = new IntersectionObserver(function (entries) {
      var hasVisibleEntry = false;
      entries.forEach(function (e) { if (e.isIntersecting) hasVisibleEntry = true; });
      if (!hasVisibleEntry && window.acp255Explorer) window.acp255Explorer.clearHighlight();
    }, { threshold: 0 });
    formulaSections.forEach(function (s) { clearObs.observe(s); });
  }

  var miniCharts = document.querySelectorAll('.acp255-nyt .mini-chart[data-formula]');

  function drawMini(container) {
    var canvas = container.querySelector('canvas');
    if (!(canvas instanceof HTMLCanvasElement) || !window.acp255Explorer || !window.acp255Explorer.compute) return;

    /** @type {Acp255ComputeApi} */
    var compute = window.acp255Explorer.compute;
    /** @type {Acp255MiniChartConfig} */
    var config = {
      formula: /** @type {Acp255FormulaKey} */ (container.getAttribute('data-formula') || 'acp77'),
      fixedV: parseInt(container.getAttribute('data-fixed-v'), 10) || 10000,
      fixedN: parseInt(container.getAttribute('data-fixed-n'), 10) || 10,
      days: parseInt(container.getAttribute('data-days'), 10) || 30
    };

    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    var W = rect.width;
    var H = rect.height;

    var colors = { acp77: '#e8c547', gaussian: '#ff7a90', mono: '#5dd39e', hybrid: '#7aa2ff' };
    var color = colors[config.formula] || '#888';

    var points = [];
    var maxY = 0;
    for (var n = 1; n <= 20; n++) {
      var y = 0;
      if (config.formula === 'acp77') y = compute.acp77Total(config.fixedV, n, config.days);
      else if (config.formula === 'gaussian') y = compute.current255(config.fixedV, n);
      else if (config.formula === 'mono') y = compute.monotonic255(n);
      else if (config.formula === 'hybrid') y = compute.hybrid255(config.fixedV, n);
      points.push({ x: n, y: y });
      if (y > maxY) maxY = y;
    }
    if (maxY === 0) maxY = 1;

    var pad = { top: 20, right: 20, bottom: 32, left: 52 };
    var plotW = W - pad.left - pad.right;
    var plotH = H - pad.top - pad.bottom;

    function xPos(v) { return pad.left + ((v - 1) / 19) * plotW; }
    function yPos(v) { return pad.top + plotH - (v / (maxY * 1.15)) * plotH; }

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (var g = 0; g <= 4; g++) {
      var gy = pad.top + (plotH / 4) * g;
      ctx.beginPath(); ctx.moveTo(pad.left, gy); ctx.lineTo(W - pad.right, gy); ctx.stroke();
    }

    ctx.fillStyle = '#555';
    ctx.font = '11px Geist Mono, monospace';
    ctx.textAlign = 'center';
    [1, 5, 10, 15, 20].forEach(function (v) {
      ctx.fillText(String(v), xPos(v), H - pad.bottom + 18);
    });
    ctx.textAlign = 'right';
    for (var gy2 = 0; gy2 <= 4; gy2++) {
      var val = (maxY * 1.15 / 4) * (4 - gy2);
      var label = val >= 100 ? Math.round(val) : val.toFixed(1);
      ctx.fillText(String(label), pad.left - 8, pad.top + (plotH / 4) * gy2 + 4);
    }

    ctx.fillStyle = '#555';
    ctx.textAlign = 'center';
    ctx.fillText('validators (n)', W / 2, H - 2);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    points.forEach(function (p, i) {
      var px = xPos(p.x);
      var py = yPos(p.y);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();

    ctx.globalAlpha = 0.08;
    ctx.fillStyle = color;
    ctx.beginPath();
    points.forEach(function (p, i) {
      var px = xPos(p.x);
      var py = yPos(p.y);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.lineTo(xPos(20), yPos(0));
    ctx.lineTo(xPos(1), yPos(0));
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    [1, 5, 10, 15, 20].forEach(function (n) {
      var p = points[n - 1];
      if (!p) return;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(xPos(p.x), yPos(p.y), 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawAllMini() {
    miniCharts.forEach(drawMini);
  }

  function waitAndDraw() {
    if (window.acp255Explorer && window.acp255Explorer.compute) {
      drawAllMini();
    } else {
      setTimeout(waitAndDraw, 100);
    }
  }
  if (miniCharts.length) waitAndDraw();

  var miniResizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(miniResizeTimer);
    miniResizeTimer = setTimeout(drawAllMini, 100);
  });
})();
