const roots = document.querySelectorAll('.acp255-story');

function formatFee(value) {
  if (!Number.isFinite(value)) return '—';
  if (value >= 1000) return `${value.toFixed(0)} AVAX`;
  if (value >= 100) return `${value.toFixed(1)} AVAX`;
  return `${value.toFixed(2)} AVAX`;
}

async function loadThree() {
  try {
    const THREE = await import('https://esm.sh/three@0.161.0');
    const controlsModule = await import('https://esm.sh/three@0.161.0/examples/jsm/controls/OrbitControls.js');
    return { THREE, OrbitControls: controlsModule.OrbitControls };
  } catch (error) {
    console.warn('ACP-255 explorer: 3D modules unavailable', error);
    return null;
  }
}

roots.forEach(async (root) => {
  const colors = {
    acp77: '#e8c547',
    current: '#ff7a90',
    mono: '#5dd39e',
    hybrid: '#7aa2ff'
  };

  const M255 = 2.654208;
  const ACP77_M = 512;
  const ACP77_K = 1246488515;
  const ACP77_T = 10000;
  const SECONDS_PER_MONTH = 30 * 24 * 60 * 60;

  const state = { fixedV: 800, fixedN: 10, acp77Days: 30 };

  const currentMultiplier = (n) => 1 + 17.84 * Math.exp(-0.3 * (n - 1));
  const networkFactor = (V) => 1 + 2.84 * Math.exp(-Math.pow((V - 10000) / 7500, 2));
  const current255 = (V, n) => n * M255 * currentMultiplier(n) * networkFactor(V);
  const monotonic255 = (n) => 50 + 35 * Math.log2(n);

  function acp77PerValidatorMonthly(V, sustainedDays) {
    if (V <= ACP77_T) return (ACP77_M * SECONDS_PER_MONTH) / 1e9;
    const x = (V - ACP77_T) * sustainedDays * 24 * 60 * 60;
    const feeRate = ACP77_M * Math.exp(x / ACP77_K);
    return (feeRate * SECONDS_PER_MONTH) / 1e9;
  }

  const acp77Total = (V, n, sustainedDays) => n * acp77PerValidatorMonthly(V, sustainedDays);

  function solve3x3(rows, values) {
    const a = rows.map((row, i) => [...row, values[i]]);
    for (let i = 0; i < 3; i++) {
      let pivot = i;
      for (let r = i + 1; r < 3; r++) if (Math.abs(a[r][i]) > Math.abs(a[pivot][i])) pivot = r;
      [a[i], a[pivot]] = [a[pivot], a[i]];
      const div = a[i][i];
      for (let j = i; j < 4; j++) a[i][j] /= div;
      for (let r = 0; r < 3; r++) {
        if (r === i) continue;
        const factor = a[r][i];
        for (let j = i; j < 4; j++) a[r][j] -= factor * a[i][j];
      }
    }
    return [a[0][3], a[1][3], a[2][3]];
  }

  const anchors = [3, 10, 15].map((n) => [n, current255(10000, n)]);
  const [HYB_A, HYB_B, HYB_C] = solve3x3(
    anchors.map(([n]) => [1, Math.log2(n), Math.sqrt(n)]),
    anchors.map(([, y]) => y)
  );

  const hybridBranch = (n) => HYB_A + HYB_B * Math.log2(n) + HYB_C * Math.sqrt(n);
  const hybridWeight = (V) => V <= 9000 ? 0 : V >= 11000 ? 1 : ((t) => t * t * (3 - 2 * t))((V - 9000) / 2000);
  const hybrid255 = (V, n) => (1 - hybridWeight(V)) * current255(V, n) + hybridWeight(V) * hybridBranch(n);

  function getEl(id) {
    return root.querySelector(`#${id}`);
  }

  function syncLabels() {
    [['fixedVLabel', state.fixedV], ['fixedNLabel', state.fixedN], ['acp77DaysLabel', state.acp77Days]].forEach(([id, value]) => {
      const el = getEl(id);
      if (el) el.textContent = String(value);
    });
  }

  function updateLiveCards() {
    const values = {
      acp77: acp77Total(state.fixedV, state.fixedN, state.acp77Days),
      current: current255(state.fixedV, state.fixedN),
      mono: monotonic255(state.fixedN),
      hybrid: hybrid255(state.fixedV, state.fixedN)
    };
    getEl('live-acp77').textContent = formatFee(values.acp77);
    getEl('live-current').textContent = formatFee(values.current);
    getEl('live-mono').textContent = formatFee(values.mono);
    getEl('live-hybrid').textContent = formatFee(values.hybrid);
  }

  function drawCanvas(canvasId, datasets, xLabel, tickValues) {
    const canvas = getEl(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth || 600;
    const height = canvas.clientHeight || 320;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const pad = { top: 20, right: 20, bottom: 42, left: 58 };
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;
    const ys = datasets.flatMap((d) => d.data.map((p) => p.y));
    const maxY = Math.max(...ys) || 1;
    const minX = Math.min(...datasets.flatMap((d) => d.data.map((p) => p.x)));
    const maxX = Math.max(...datasets.flatMap((d) => d.data.map((p) => p.x)));
    const sx = (x) => pad.left + ((x - minX) / (maxX - minX || 1)) * plotW;
    const sy = (y) => pad.top + plotH - (y / maxY) * plotH;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (plotH / 4) * i;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke();
    }

    ctx.strokeStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + plotH);
    ctx.lineTo(width - pad.right, pad.top + plotH);
    ctx.stroke();

    ctx.fillStyle = '#888';
    ctx.font = '12px Geist Mono, monospace';
    ctx.textAlign = 'center';
    tickValues.forEach((tick) => ctx.fillText(String(tick), sx(tick), height - 12));
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      ctx.fillText(String(Math.round((maxY / 4) * (4 - i))), pad.left - 8, pad.top + (plotH / 4) * i + 4);
    }
    ctx.textAlign = 'center';
    ctx.fillText(xLabel, width / 2, height - 2);

    datasets.forEach((set) => {
      ctx.strokeStyle = set.color;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      set.data.forEach((p, i) => {
        const x = sx(p.x), y = sy(p.y);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  }

  function redrawSlices() {
    const nData = Array.from({ length: 20 }, (_, i) => i + 1);
    const vData = Array.from({ length: 21 }, (_, i) => i * 1000);
    drawCanvas('sliceN', [
      { label: 'ACP-77', color: colors.acp77, data: nData.map((n) => ({ x: n, y: acp77Total(state.fixedV, n, state.acp77Days) })) },
      { label: 'Gaussian', color: colors.current, data: nData.map((n) => ({ x: n, y: current255(state.fixedV, n) })) },
      { label: 'Monotonic', color: colors.mono, data: nData.map((n) => ({ x: n, y: monotonic255(n) })) },
      { label: 'Hybrid', color: colors.hybrid, data: nData.map((n) => ({ x: n, y: hybrid255(state.fixedV, n) })) }
    ], 'L1 validator count (n)', [1, 5, 10, 15, 20]);
    drawCanvas('sliceV', [
      { label: 'ACP-77', color: colors.acp77, data: vData.map((V) => ({ x: V, y: acp77Total(V, state.fixedN, state.acp77Days) })) },
      { label: 'Gaussian', color: colors.current, data: vData.map((V) => ({ x: V, y: current255(V, state.fixedN) })) },
      { label: 'Monotonic', color: colors.mono, data: vData.map((V) => ({ x: V, y: monotonic255(state.fixedN) })) },
      { label: 'Hybrid', color: colors.hybrid, data: vData.map((V) => ({ x: V, y: hybrid255(V, state.fixedN) })) }
    ], 'Total network validators (V)', [0, 5000, 10000, 15000, 20000]);
  }

  function fallback3D(containerId) {
    const container = getEl(containerId);
    if (container) container.innerHTML = '<div class="three-fallback">3D view unavailable here. The fee cards and 2D comparisons still work below.</div>';
  }

  function buildAmbient(THREE) {
    const mount = root.querySelector('.acp255-ambient');
    if (!mount) return null;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 0, 18);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    mount.appendChild(renderer.domElement);

    const particles = 180;
    const positions = new Float32Array(particles * 3);
    for (let i = 0; i < particles; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 28;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0xe8c547, size: 0.06, transparent: true, opacity: 0.55 });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x2d2d2d, transparent: true, opacity: 0.35 });
    const lineGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-12, -4, -2), new THREE.Vector3(12, 3, -3),
      new THREE.Vector3(-10, 5, -1), new THREE.Vector3(10, -2, -2)
    ]);
    scene.add(new THREE.LineSegments(lineGeom, lineMaterial));

    function resize() {
      const w = Math.max(mount.clientWidth, 10);
      const h = Math.max(mount.clientHeight, 10);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }

    let raf;
    function render() {
      points.rotation.y += 0.0008;
      points.rotation.x += 0.0003;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    }
    resize(); render();
    return { resize, destroy: () => cancelAnimationFrame(raf) };
  }

  function buildSurfaceFactory(THREE, OrbitControls) {
    return function makeSurface(containerId, color, formula) {
      const container = getEl(containerId);
      if (!container) return { rebuild: () => {}, resize: () => {} };
      let renderer;
      try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
      catch { fallback3D(containerId); return { rebuild: () => {}, resize: () => {} }; }

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
      camera.position.set(42, 30, 42);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.target.set(0, 5, 0);
      scene.add(new THREE.AmbientLight(0xffffff, 0.9));
      const light = new THREE.DirectionalLight(0xffffff, 0.5); light.position.set(10, 20, 10); scene.add(light);
      scene.add(new THREE.GridHelper(40, 10, 0x333333, 0x222222));
      const linesGroup = new THREE.Group(); scene.add(linesGroup);
      const material = new THREE.LineBasicMaterial({ color });

      function resize() {
        const w = Math.max(container.clientWidth, 100);
        const h = Math.max(container.clientHeight, 240);
        camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false);
      }

      function build() {
        while (linesGroup.children.length) {
          const obj = linesGroup.children.pop();
          obj.geometry.dispose();
        }
        const Vvals = Array.from({ length: 21 }, (_, i) => i * 1000);
        const Nvals = Array.from({ length: 20 }, (_, i) => i + 1);
        const samples = [];
        for (const V of Vvals) for (const n of Nvals) samples.push(formula(V, n));
        const maxFee = Math.max(...samples) || 1;
        const mapX = (V) => -20 + (V / 20000) * 40;
        const mapZ = (n) => -20 + ((n - 1) / 19) * 40;
        const mapY = (fee) => (fee / maxFee) * 16;
        for (const n of Nvals) {
          const pts = Vvals.map((V) => new THREE.Vector3(mapX(V), mapY(formula(V, n)), mapZ(n)));
          linesGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), material));
        }
        for (const V of Vvals) {
          const pts = Nvals.map((n) => new THREE.Vector3(mapX(V), mapY(formula(V, n)), mapZ(n)));
          linesGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), material));
        }
      }

      let raf;
      function render() { controls.update(); renderer.render(scene, camera); raf = requestAnimationFrame(render); }
      resize(); build(); render();
      return { rebuild: build, resize, destroy: () => cancelAnimationFrame(raf) };
    };
  }

  const fixedV = getEl('fixedV');
  const fixedN = getEl('fixedN');
  const acp77Days = getEl('acp77Days');
  let surfaces = [];
  let ambient = null;

  function rebuildAll() {
    syncLabels();
    updateLiveCards();
    redrawSlices();
    surfaces.forEach((s) => { s.resize?.(); s.rebuild?.(); });
    ambient?.resize?.();
  }

  fixedV?.addEventListener('input', () => { state.fixedV = Number(fixedV.value); rebuildAll(); });
  fixedN?.addEventListener('input', () => { state.fixedN = Number(fixedN.value); rebuildAll(); });
  acp77Days?.addEventListener('input', () => { state.acp77Days = Number(acp77Days.value); rebuildAll(); });

  const observer = new ResizeObserver(() => {
    clearTimeout(root.__acpResize);
    root.__acpResize = setTimeout(rebuildAll, 80);
  });
  observer.observe(root);

  syncLabels();
  updateLiveCards();
  redrawSlices();

  const threeBundle = await loadThree();
  if (threeBundle) {
    ambient = buildAmbient(threeBundle.THREE);
    const makeSurface = buildSurfaceFactory(threeBundle.THREE, threeBundle.OrbitControls);
    surfaces = [
      makeSurface('surface-acp77', colors.acp77, (V, n) => acp77Total(V, n, state.acp77Days)),
      makeSurface('surface-current', colors.current, current255),
      makeSurface('surface-mono', colors.mono, (_V, n) => monotonic255(n)),
      makeSurface('surface-hybrid', colors.hybrid, hybrid255)
    ];
  } else {
    ['surface-acp77', 'surface-current', 'surface-mono', 'surface-hybrid'].forEach(fallback3D);
  }

  rebuildAll();
});


const revealObserver = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("is-visible");
  });
}, { threshold: 0.18 }) : null;

document.querySelectorAll(".reveal-card").forEach((card) => {
  if (revealObserver) revealObserver.observe(card); else card.classList.add("is-visible");
});
