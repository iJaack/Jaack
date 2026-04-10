import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js';

const root = document.querySelector('.acp255-explorer-shell');
if (!root) {
  console.warn('ACP-255 explorer root not found');
} else {
  const colors = {
    acp77: '#ffcc66',
    current: '#ff7a90',
    mono: '#5dd39e',
    hybrid: '#7aa2ff'
  };

  const M255 = 2.654208;
  const ACP77_M = 512;
  const ACP77_K = 1246488515;
  const ACP77_T = 10000;
  const SECONDS_PER_MONTH = 30 * 24 * 60 * 60;

  function currentMultiplier(n) {
    return 1 + 17.84 * Math.exp(-0.3 * (n - 1));
  }

  function networkFactor(V) {
    return 1 + 2.84 * Math.exp(-Math.pow((V - 10000) / 7500, 2));
  }

  function current255(V, n) {
    return n * M255 * currentMultiplier(n) * networkFactor(V);
  }

  function monotonic255(n) {
    return 50 + 35 * Math.log2(n);
  }

  function acp77PerValidatorMonthly(V, sustainedDays) {
    if (V <= ACP77_T) {
      return (ACP77_M * SECONDS_PER_MONTH) / 1e9;
    }
    const x = (V - ACP77_T) * sustainedDays * 24 * 60 * 60;
    const feeRate = ACP77_M * Math.exp(x / ACP77_K);
    return (feeRate * SECONDS_PER_MONTH) / 1e9;
  }

  function acp77Total(V, n, sustainedDays) {
    return n * acp77PerValidatorMonthly(V, sustainedDays);
  }

  const anchors = [3, 10, 15].map((n) => [n, current255(10000, n)]);
  function solve3x3(rows, values) {
    const a = rows.map((row, i) => [...row, values[i]]);
    for (let i = 0; i < 3; i++) {
      let pivot = i;
      for (let r = i + 1; r < 3; r++) {
        if (Math.abs(a[r][i]) > Math.abs(a[pivot][i])) pivot = r;
      }
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

  const [HYB_A, HYB_B, HYB_C] = solve3x3(
    anchors.map(([n]) => [1, Math.log2(n), Math.sqrt(n)]),
    anchors.map(([, y]) => y)
  );

  function hybridBranch(n) {
    return HYB_A + HYB_B * Math.log2(n) + HYB_C * Math.sqrt(n);
  }

  function hybridWeight(V) {
    if (V <= 9000) return 0;
    if (V >= 11000) return 1;
    const t = (V - 9000) / 2000;
    return t * t * (3 - 2 * t);
  }

  function hybrid255(V, n) {
    const w = hybridWeight(V);
    return (1 - w) * current255(V, n) + w * hybridBranch(n);
  }

  const state = {
    fixedV: 800,
    fixedN: 10,
    acp77Days: 30
  };

  const formulas = {
    acp77: (V, n) => acp77Total(V, n, state.acp77Days),
    current: current255,
    mono: (V, n) => monotonic255(n),
    hybrid: hybrid255
  };

  function getEl(id) {
    return root.querySelector(`#${id}`);
  }

  function makeSurface(containerId, color, formulaKey) {
    const container = getEl(containerId);
    if (!container) return { rebuild: () => {} };

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#091321');
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(42, 32, 42);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 6, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const directional = new THREE.DirectionalLight(0xffffff, 0.7);
    directional.position.set(18, 30, 8);
    scene.add(directional);
    scene.add(new THREE.GridHelper(40, 10, 0x33507c, 0x1b2f54));

    const material = new THREE.LineBasicMaterial({ color });
    const linesGroup = new THREE.Group();
    scene.add(linesGroup);

    const axisMat = new THREE.LineBasicMaterial({ color: 0x8ea3cf });
    const axes = new THREE.Group();
    const axisPoints = [
      new THREE.Vector3(-20, 0, -20), new THREE.Vector3(20, 0, -20),
      new THREE.Vector3(-20, 0, -20), new THREE.Vector3(-20, 16, -20),
      new THREE.Vector3(-20, 0, -20), new THREE.Vector3(-20, 0, 20)
    ];
    for (let i = 0; i < axisPoints.length; i += 2) {
      axes.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([axisPoints[i], axisPoints[i + 1]]), axisMat));
    }
    scene.add(axes);

    function build() {
      while (linesGroup.children.length) {
        const obj = linesGroup.children.pop();
        obj.geometry.dispose();
      }

      const Vvals = Array.from({ length: 21 }, (_, i) => i * 1000);
      const Nvals = Array.from({ length: 20 }, (_, i) => i + 1);
      const samples = [];
      for (const V of Vvals) {
        for (const n of Nvals) {
          samples.push(formulas[formulaKey](V, n));
        }
      }
      const maxFee = Math.max(...samples);
      const mapX = (V) => -20 + (V / 20000) * 40;
      const mapZ = (n) => -20 + ((n - 1) / 19) * 40;
      const mapY = (fee) => (fee / maxFee) * 16;

      for (const n of Nvals) {
        const points = Vvals.map((V) => new THREE.Vector3(mapX(V), mapY(formulas[formulaKey](V, n)), mapZ(n)));
        linesGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
      }
      for (const V of Vvals) {
        const points = Nvals.map((n) => new THREE.Vector3(mapX(V), mapY(formulas[formulaKey](V, n)), mapZ(n)));
        linesGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
      }
    }

    build();

    function render() {
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }
    render();

    window.addEventListener('resize', () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });

    return { rebuild: build };
  }

  function drawCanvas(canvasId, datasets, xLabel, tickValues) {
    const canvas = getEl(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth || canvas.parentElement.clientWidth;
    const height = canvas.clientHeight || 300;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const pad = { top: 20, right: 18, bottom: 36, left: 54 };
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;
    const ys = datasets.flatMap((d) => d.data.map((p) => p.y));
    const maxY = Math.max(...ys);
    const minX = Math.min(...datasets.flatMap((d) => d.data.map((p) => p.x)));
    const maxX = Math.max(...datasets.flatMap((d) => d.data.map((p) => p.x)));
    const sx = (x) => pad.left + ((x - minX) / (maxX - minX || 1)) * plotW;
    const sy = (y) => pad.top + plotH - (y / (maxY || 1)) * plotH;

    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (plotH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(width - pad.right, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#6f7db0';
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + plotH);
    ctx.lineTo(width - pad.right, pad.top + plotH);
    ctx.stroke();

    ctx.fillStyle = '#a8b5d8';
    ctx.font = '12px Inter, sans-serif';
    tickValues.forEach((tick) => {
      ctx.fillText(String(tick), sx(tick) - 10, height - 12);
    });
    for (let i = 0; i <= 4; i++) {
      const value = Math.round((maxY / 4) * (4 - i));
      ctx.fillText(String(value), 8, pad.top + (plotH / 4) * i + 4);
    }
    ctx.fillText(xLabel, width / 2 - 40, height - 2);

    datasets.forEach((set) => {
      ctx.strokeStyle = set.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      set.data.forEach((p, i) => {
        const x = sx(p.x), y = sy(p.y);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });

    const legendX = width - 170;
    let legendY = 16;
    datasets.forEach((set) => {
      ctx.fillStyle = set.color;
      ctx.beginPath();
      ctx.arc(legendX, legendY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#dce6ff';
      ctx.fillText(set.label, legendX + 12, legendY + 4);
      legendY += 18;
    });
  }

  const surfaces = [
    makeSurface('surface-acp77', colors.acp77, 'acp77'),
    makeSurface('surface-current', colors.current, 'current'),
    makeSurface('surface-mono', colors.mono, 'mono'),
    makeSurface('surface-hybrid', colors.hybrid, 'hybrid')
  ];

  function redrawSlices() {
    const nData = Array.from({ length: 20 }, (_, i) => i + 1);
    const vData = Array.from({ length: 21 }, (_, i) => i * 1000);

    drawCanvas('sliceN', [
      { label: 'ACP-77', color: colors.acp77, data: nData.map((n) => ({ x: n, y: acp77Total(state.fixedV, n, state.acp77Days) })) },
      { label: 'Current 255', color: colors.current, data: nData.map((n) => ({ x: n, y: current255(state.fixedV, n) })) },
      { label: 'Monotonic 255', color: colors.mono, data: nData.map((n) => ({ x: n, y: monotonic255(n) })) },
      { label: 'Hybrid 255', color: colors.hybrid, data: nData.map((n) => ({ x: n, y: hybrid255(state.fixedV, n) })) }
    ], 'L1 validator count (n)', [1, 5, 10, 15, 20]);

    drawCanvas('sliceV', [
      { label: 'ACP-77', color: colors.acp77, data: vData.map((V) => ({ x: V, y: acp77Total(V, state.fixedN, state.acp77Days) })) },
      { label: 'Current 255', color: colors.current, data: vData.map((V) => ({ x: V, y: current255(V, state.fixedN) })) },
      { label: 'Monotonic 255', color: colors.mono, data: vData.map((V) => ({ x: V, y: monotonic255(state.fixedN) })) },
      { label: 'Hybrid 255', color: colors.hybrid, data: vData.map((V) => ({ x: V, y: hybrid255(V, state.fixedN) })) }
    ], 'Total network validators (V)', [0, 5000, 10000, 15000, 20000]);
  }

  function rebuildAll() {
    surfaces.forEach((s) => s.rebuild());
    redrawSlices();
  }

  const fixedV = getEl('fixedV');
  const fixedN = getEl('fixedN');
  const acp77Days = getEl('acp77Days');
  const fixedVLabel = getEl('fixedVLabel');
  const fixedNLabel = getEl('fixedNLabel');
  const acp77DaysLabel = getEl('acp77DaysLabel');

  fixedV?.addEventListener('input', () => {
    state.fixedV = Number(fixedV.value);
    fixedVLabel.textContent = fixedV.value;
    redrawSlices();
  });
  fixedN?.addEventListener('input', () => {
    state.fixedN = Number(fixedN.value);
    fixedNLabel.textContent = fixedN.value;
    redrawSlices();
  });
  acp77Days?.addEventListener('input', () => {
    state.acp77Days = Number(acp77Days.value);
    acp77DaysLabel.textContent = acp77Days.value;
    rebuildAll();
  });

  new ResizeObserver(() => redrawSlices()).observe(root);
  rebuildAll();
}
