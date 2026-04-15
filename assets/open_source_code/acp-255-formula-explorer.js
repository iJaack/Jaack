/// <reference path="./acp-255-types.d.ts" />

(function () {
  var roots = document.querySelectorAll('.acp255-story');
  if (!roots.length) return;

  /** @type {Record<Acp255ChartColorKey, string>} */
  var colors = { acp77: '#e8c547', current: '#ff7a90', mono: '#5dd39e', hybrid: '#7aa2ff' };
  /** @type {Record<Acp255FormulaKey, Acp255ChartColorKey>} */
  var formulaKeyMap = { acp77: 'acp77', gaussian: 'current', mono: 'mono', hybrid: 'hybrid' };

  function formatFee(value) {
    if (!isFinite(value)) return '—';
    if (value >= 1000) return value.toFixed(0) + ' AVAX';
    if (value >= 100) return value.toFixed(1) + ' AVAX';
    return value.toFixed(2) + ' AVAX';
  }

  roots.forEach(function (root) {
    var M255 = 2.654208;
    var ACP77_M = 512;
    var ACP77_K = 1246488515;
    var ACP77_T = 10000;
    var SECONDS_PER_MONTH = 30 * 24 * 60 * 60;
    /** @type {Acp255State} */
    var state = { fixedV: 800, fixedN: 10, acp77Days: 30 };
    /** @type {Acp255FormulaKey | null} */
    var activeFormula = null;

    function getEl(id) { return root.querySelector('#' + id); }
    function currentMultiplier(n) { return 1 + 17.84 * Math.exp(-0.3 * (n - 1)); }
    function networkFactor(V) { return 1 + 2.84 * Math.exp(-Math.pow((V - 10000) / 7500, 2)); }
    function current255(V, n) { return n * M255 * currentMultiplier(n) * networkFactor(V); }
    function monotonic255(n) { return 50 + 35 * Math.log(n) / Math.log(2); }
    function acp77PerValidatorMonthly(V, sustainedDays) {
      if (V <= ACP77_T) return (ACP77_M * SECONDS_PER_MONTH) / 1e9;
      var x = (V - ACP77_T) * sustainedDays * 24 * 60 * 60;
      var feeRate = ACP77_M * Math.exp(x / ACP77_K);
      return (feeRate * SECONDS_PER_MONTH) / 1e9;
    }
    function acp77Total(V, n, sustainedDays) { return n * acp77PerValidatorMonthly(V, sustainedDays); }

    function solve3x3(rows, values) {
      var a = rows.map(function (row, i) { return row.concat([values[i]]); });
      for (var i = 0; i < 3; i++) {
        var pivot = i;
        for (var r = i + 1; r < 3; r++) if (Math.abs(a[r][i]) > Math.abs(a[pivot][i])) pivot = r;
        var tmp = a[i]; a[i] = a[pivot]; a[pivot] = tmp;
        var div = a[i][i];
        for (var j = i; j < 4; j++) a[i][j] /= div;
        for (var rr = 0; rr < 3; rr++) {
          if (rr === i) continue;
          var factor = a[rr][i];
          for (var jj = i; jj < 4; jj++) a[rr][jj] -= factor * a[i][jj];
        }
      }
      return [a[0][3], a[1][3], a[2][3]];
    }

    var anchors = [3, 10, 15].map(function (n) { return [n, current255(10000, n)]; });
    var coeff = solve3x3(anchors.map(function (a) { return [1, Math.log(a[0]) / Math.log(2), Math.sqrt(a[0])]; }), anchors.map(function (a) { return a[1]; }));
    function hybridBranch(n) { return coeff[0] + coeff[1] * (Math.log(n) / Math.log(2)) + coeff[2] * Math.sqrt(n); }
    function hybridWeight(V) {
      if (V <= 9000) return 0;
      if (V >= 11000) return 1;
      var t = (V - 9000) / 2000; return t * t * (3 - 2 * t);
    }
    function hybrid255(V, n) { var w = hybridWeight(V); return (1 - w) * current255(V, n) + w * hybridBranch(n); }

    function syncLabels() {
      [['fixedVLabel', state.fixedV], ['fixedNLabel', state.fixedN], ['acp77DaysLabel', state.acp77Days]].forEach(function (pair) {
        var el = getEl(pair[0]); if (el) el.textContent = String(pair[1]);
      });
    }

    function updateLiveCards() {
      var vals = {
        acp77: acp77Total(state.fixedV, state.fixedN, state.acp77Days),
        current: current255(state.fixedV, state.fixedN),
        mono: monotonic255(state.fixedN),
        hybrid: hybrid255(state.fixedV, state.fixedN)
      };
      getEl('live-acp77').textContent = formatFee(vals.acp77);
      getEl('live-current').textContent = formatFee(vals.current);
      getEl('live-mono').textContent = formatFee(vals.mono);
      getEl('live-hybrid').textContent = formatFee(vals.hybrid);
    }

    /**
     * @param {string} id
     * @param {Acp255Series[]} datasets
     * @param {string} xLabel
     * @param {number[]} tickValues
     */
    function drawCanvas(id, datasets, xLabel, tickValues) {
      var canvas = getEl(id);
      if (!(canvas instanceof HTMLCanvasElement)) return;
      var ctx = canvas.getContext('2d');
      if (!ctx) return;
      var ratio = Math.min(window.devicePixelRatio || 1, 2);
      var width = canvas.clientWidth || 600;
      var height = canvas.clientHeight || 320;
      canvas.width = width * ratio; canvas.height = height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0); ctx.clearRect(0, 0, width, height);
      var pad = { top: 20, right: 20, bottom: 44, left: 56 };
      var plotW = width - pad.left - pad.right, plotH = height - pad.top - pad.bottom;
      var ys = []; datasets.forEach(function (d) { d.data.forEach(function (p) { ys.push(p.y); }); });
      var maxY = Math.max.apply(null, ys.concat([1]));
      var xs = []; datasets.forEach(function (d) { d.data.forEach(function (p) { xs.push(p.x); }); });
      var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
      function sx(x) { return pad.left + ((x - minX) / (maxX - minX || 1)) * plotW; }
      function sy(y) { return pad.top + plotH - (y / maxY) * plotH; }
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
      for (var i = 0; i <= 4; i++) { var gy = pad.top + (plotH / 4) * i; ctx.beginPath(); ctx.moveTo(pad.left, gy); ctx.lineTo(width - pad.right, gy); ctx.stroke(); }
      ctx.strokeStyle = '#333'; ctx.beginPath(); ctx.moveTo(pad.left, pad.top); ctx.lineTo(pad.left, pad.top + plotH); ctx.lineTo(width - pad.right, pad.top + plotH); ctx.stroke();
      ctx.fillStyle = '#888'; ctx.font = '12px Geist Mono, monospace'; ctx.textAlign = 'center';
      tickValues.forEach(function (tick) { ctx.fillText(String(tick), sx(tick), height - 14); });
      ctx.textAlign = 'right';
      for (var y = 0; y <= 4; y++) ctx.fillText(String(Math.round((maxY / 4) * (4 - y))), pad.left - 8, pad.top + (plotH / 4) * y + 4);
      ctx.textAlign = 'center'; ctx.fillText(xLabel, width / 2, height - 2);
      var activeColorKey = activeFormula ? formulaKeyMap[activeFormula] : null;
      datasets.forEach(function (set) {
        var isActive = !activeColorKey || set.color === colors[activeColorKey];
        ctx.globalAlpha = isActive ? 1 : 0.15;
        ctx.strokeStyle = set.color;
        ctx.lineWidth = (activeColorKey && isActive) ? 3.2 : 2.4;
        ctx.beginPath();
        set.data.forEach(function (p, idx) { var x = sx(p.x), y = sy(p.y); if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    }

    function redraw() {
      syncLabels(); updateLiveCards();
      var nData = Array.from({ length: 20 }, function (_, i) { return i + 1; });
      var vData = Array.from({ length: 21 }, function (_, i) { return i * 1000; });
      drawCanvas('sliceN', [
        { color: colors.acp77, data: nData.map(function (n) { return { x: n, y: acp77Total(state.fixedV, n, state.acp77Days) }; }) },
        { color: colors.current, data: nData.map(function (n) { return { x: n, y: current255(state.fixedV, n) }; }) },
        { color: colors.mono, data: nData.map(function (n) { return { x: n, y: monotonic255(n) }; }) },
        { color: colors.hybrid, data: nData.map(function (n) { return { x: n, y: hybrid255(state.fixedV, n) }; }) }
      ], 'L1 validator count (n)', [1,5,10,15,20]);
      drawCanvas('sliceV', [
        { color: colors.acp77, data: vData.map(function (V) { return { x: V, y: acp77Total(V, state.fixedN, state.acp77Days) }; }) },
        { color: colors.current, data: vData.map(function (V) { return { x: V, y: current255(V, state.fixedN) }; }) },
        { color: colors.mono, data: vData.map(function (V) { return { x: V, y: monotonic255(state.fixedN) }; }) },
        { color: colors.hybrid, data: vData.map(function (V) { return { x: V, y: hybrid255(V, state.fixedN) }; }) }
      ], 'Total network validators (V)', [0,5000,10000,15000,20000]);
    }

    ['fixedV','fixedN','acp77Days'].forEach(function (id) {
      var el = getEl(id); if (!(el instanceof HTMLInputElement)) return;
      var input = /** @type {HTMLInputElement} */ (el);
      input.addEventListener('input', function () { state[id === 'fixedV' ? 'fixedV' : id === 'fixedN' ? 'fixedN' : 'acp77Days'] = Number(input.value); redraw(); });
    });

    var resizeTimer;
    window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(redraw, 80); });
    redraw();

    /** @type {Acp255ExplorerApi} */
    window.acp255Explorer = {
      compute: {
        current255: current255,
        monotonic255: monotonic255,
        hybrid255: hybrid255,
        acp77Total: acp77Total,
        hybridBranch: hybridBranch
      },
      highlightFormula: function (/** @type {Acp255FormulaKey | null} */ name) {
        activeFormula = name;
        root.setAttribute('data-active-formula', name || '');
        redraw();
      },
      clearHighlight: function () {
        activeFormula = null;
        root.removeAttribute('data-active-formula');
        redraw();
      },
      setParams: function (params) {
        if (params.fixedV !== undefined) {
          state.fixedV = params.fixedV;
          var el = /** @type {HTMLInputElement | null} */ (getEl('fixedV'));
          if (el) el.value = String(params.fixedV);
        }
        if (params.fixedN !== undefined) {
          state.fixedN = params.fixedN;
          var el2 = /** @type {HTMLInputElement | null} */ (getEl('fixedN'));
          if (el2) el2.value = String(params.fixedN);
        }
        if (params.acp77Days !== undefined) {
          state.acp77Days = params.acp77Days;
          var el3 = /** @type {HTMLInputElement | null} */ (getEl('acp77Days'));
          if (el3) el3.value = String(params.acp77Days);
        }
        redraw();
      }
    };
  });
})();
