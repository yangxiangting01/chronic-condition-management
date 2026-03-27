// ===== Lightweight Canvas Chart Library =====
const Charts = {
  // Line chart
  line(canvasId, labels, datasets, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height;
    const pad = { top: 20, right: 16, bottom: 36, left: 44 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;

    ctx.clearRect(0, 0, W, H);

    // Compute range
    const allVals = datasets.flatMap(d => d.data);
    const minV = options.min !== undefined ? options.min : Math.min(...allVals) * 0.95;
    const maxV = options.max !== undefined ? options.max : Math.max(...allVals) * 1.05;
    const range = maxV - minV || 1;

    const toX = i => pad.left + (i / (labels.length - 1)) * chartW;
    const toY = v => pad.top + chartH - ((v - minV) / range) * chartH;

    // Grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    const gridCount = 4;
    for (let i = 0; i <= gridCount; i++) {
      const y = pad.top + (i / gridCount) * chartH;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();
      const val = maxV - (i / gridCount) * range;
      ctx.fillStyle = '#a0aec0';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(val), pad.left - 6, y + 4);
    }

    // X labels
    ctx.fillStyle = '#a0aec0';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((l, i) => {
      ctx.fillText(l, toX(i), H - 8);
    });

    // Datasets
    datasets.forEach(ds => {
      const pts = ds.data.map((v, i) => ({ x: toX(i), y: toY(v) }));

      // Fill area
      if (ds.fill) {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pad.top + chartH);
        pts.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(pts[pts.length - 1].x, pad.top + chartH);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
        grad.addColorStop(0, ds.color + '40');
        grad.addColorStop(1, ds.color + '00');
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Line
      ctx.beginPath();
      ctx.strokeStyle = ds.color;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();

      // Dots
      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = ds.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    });
  },

  // Bar chart
  bar(canvasId, labels, datasets, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height;
    const pad = { top: 16, right: 16, bottom: 36, left: 44 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;

    ctx.clearRect(0, 0, W, H);

    const allVals = datasets.flatMap(d => d.data);
    const maxV = options.max || Math.max(...allVals) * 1.1 || 1;
    const barGroupW = chartW / labels.length;
    const barW = (barGroupW * 0.6) / datasets.length;
    const gap = barGroupW * 0.2;

    // Grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (i / 4) * chartH;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();
      ctx.fillStyle = '#a0aec0';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(maxV - (i / 4) * maxV), pad.left - 6, y + 4);
    }

    // X labels
    ctx.fillStyle = '#a0aec0';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((l, i) => {
      ctx.fillText(l, pad.left + i * barGroupW + barGroupW / 2, H - 8);
    });

    // Bars
    datasets.forEach((ds, di) => {
      ds.data.forEach((v, i) => {
        const barH = (v / maxV) * chartH;
        const x = pad.left + i * barGroupW + gap + di * (barW + 2);
        const y = pad.top + chartH - barH;
        ctx.fillStyle = ds.color;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, y, barW, barH, [3, 3, 0, 0]) : ctx.rect(x, y, barW, barH);
        ctx.fill();
      });
    });
  },

  // Donut chart
  donut(canvasId, data, colors, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height;
    const cx = W / 2, cy = H / 2;
    const r = Math.min(W, H) / 2 - 8;
    const inner = r * 0.6;

    ctx.clearRect(0, 0, W, H);

    const total = data.reduce((a, b) => a + b, 0) || 1;
    let startAngle = -Math.PI / 2;

    data.forEach((v, i) => {
      const angle = (v / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, startAngle + angle);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.fill();
      startAngle += angle;
    });

    // Inner circle
    ctx.beginPath();
    ctx.arc(cx, cy, inner, 0, Math.PI * 2);
    ctx.fillStyle = options.bg || '#fff';
    ctx.fill();

    // Center text
    if (options.centerText) {
      ctx.fillStyle = '#2d3748';
      ctx.font = `bold ${options.centerFontSize || 18}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(options.centerText, cx, cy - 8);
      if (options.centerSubText) {
        ctx.font = `11px sans-serif`;
        ctx.fillStyle = '#718096';
        ctx.fillText(options.centerSubText, cx, cy + 12);
      }
    }
  },

  // Ring progress
  ring(canvasId, value, max, color, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height;
    const cx = W / 2, cy = H / 2;
    const r = Math.min(W, H) / 2 - 6;
    const lw = options.lineWidth || 8;

    ctx.clearRect(0, 0, W, H);

    // Background ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = lw;
    ctx.stroke();

    // Progress ring
    const progress = Math.min(value / max, 1);
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
};
