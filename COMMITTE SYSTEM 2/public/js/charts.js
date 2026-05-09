/* ============================================================
   MONEY COMMITTEE SYSTEM — Canvas Charts
   ============================================================ */

class MCSChart {
  constructor(canvas, type, data, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.type = type;
    this.data = data;
    this.options = options;
    this.animProgress = 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  resize() {
    const parent = this.canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = parent.clientWidth * dpr;
    this.canvas.height = parent.clientHeight * dpr;
    this.canvas.style.width = parent.clientWidth + 'px';
    this.canvas.style.height = parent.clientHeight + 'px';
    this.ctx.scale(dpr, dpr);
    this.w = parent.clientWidth;
    this.h = parent.clientHeight;
    if (this.animProgress >= 1) this.draw(1);
  }

  animate() {
    const duration = 800;
    const start = performance.now();
    const step = (now) => {
      this.animProgress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - this.animProgress, 3);
      this.draw(ease);
      if (this.animProgress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  draw(t) {
    this.ctx.clearRect(0, 0, this.w, this.h);
    if (this.type === 'bar') this.drawBar(t);
    else if (this.type === 'line') this.drawLine(t);
    else if (this.type === 'doughnut') this.drawDoughnut(t);
    else if (this.type === 'area') this.drawArea(t);
  }

  getColors() {
    const style = getComputedStyle(document.documentElement);
    return {
      primary: '#4F46E5',
      secondary: '#22C55E',
      accent: '#06B6D4',
      text: style.getPropertyValue('--text-primary').trim() || '#0F172A',
      muted: style.getPropertyValue('--text-tertiary').trim() || '#94A3B8',
      border: style.getPropertyValue('--border-color').trim() || '#E2E8F0',
      bg: style.getPropertyValue('--bg-tertiary').trim() || '#F1F5F9',
    };
  }

  drawBar(t) {
    const { labels, data, data2 } = this.data;
    const c = this.getColors();
    const pad = { top: 20, right: 20, bottom: 40, left: 50 };
    const cw = this.w - pad.left - pad.right;
    const ch = this.h - pad.top - pad.bottom;
    const max = Math.max(...data, ...(data2 || [])) * 1.15;
    const barCount = data2 ? 2 : 1;
    const groupWidth = cw / labels.length;
    const barWidth = Math.min(groupWidth * 0.3, 28);
    const gap = barCount > 1 ? 4 : 0;

    // Grid lines
    this.ctx.strokeStyle = c.border;
    this.ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (ch / 4) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(pad.left, y);
      this.ctx.lineTo(this.w - pad.right, y);
      this.ctx.stroke();
      this.ctx.fillStyle = c.muted;
      this.ctx.font = '11px Inter, sans-serif';
      this.ctx.textAlign = 'right';
      this.ctx.fillText(Math.round(max - (max / 4) * i).toLocaleString(), pad.left - 8, y + 4);
    }

    // Labels
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = c.muted;
    labels.forEach((label, i) => {
      const x = pad.left + groupWidth * i + groupWidth / 2;
      this.ctx.fillText(label, x, this.h - pad.bottom + 20);
    });

    // Bars
    labels.forEach((_, i) => {
      const x = pad.left + groupWidth * i + groupWidth / 2;
      const h1 = (data[i] / max) * ch * t;
      const bx1 = barCount > 1 ? x - barWidth - gap / 2 : x - barWidth / 2;

      // Primary bar
      const grad1 = this.ctx.createLinearGradient(0, pad.top + ch - h1, 0, pad.top + ch);
      grad1.addColorStop(0, c.primary);
      grad1.addColorStop(1, '#818CF8');
      this.ctx.fillStyle = grad1;
      this.roundRect(bx1, pad.top + ch - h1, barWidth, h1, 4);

      // Secondary bar
      if (data2) {
        const h2 = (data2[i] / max) * ch * t;
        const bx2 = x + gap / 2;
        const grad2 = this.ctx.createLinearGradient(0, pad.top + ch - h2, 0, pad.top + ch);
        grad2.addColorStop(0, c.accent);
        grad2.addColorStop(1, '#67E8F9');
        this.ctx.fillStyle = grad2;
        this.roundRect(bx2, pad.top + ch - h2, barWidth, h2, 4);
      }
    });
  }

  drawLine(t) {
    const { labels, data, data2 } = this.data;
    const c = this.getColors();
    const pad = { top: 20, right: 20, bottom: 40, left: 50 };
    const cw = this.w - pad.left - pad.right;
    const ch = this.h - pad.top - pad.bottom;
    const allData = [...data, ...(data2 || [])];
    const max = Math.max(...allData) * 1.15;
    const stepX = cw / (labels.length - 1);

    // Grid
    this.ctx.strokeStyle = c.border;
    this.ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (ch / 4) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(pad.left, y);
      this.ctx.lineTo(this.w - pad.right, y);
      this.ctx.stroke();
      this.ctx.fillStyle = c.muted;
      this.ctx.font = '11px Inter, sans-serif';
      this.ctx.textAlign = 'right';
      this.ctx.fillText(Math.round(max - (max / 4) * i).toLocaleString(), pad.left - 8, y + 4);
    }

    // Labels
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = c.muted;
    labels.forEach((label, i) => {
      this.ctx.fillText(label, pad.left + stepX * i, this.h - pad.bottom + 20);
    });

    const drawDataLine = (dataset, color) => {
      const visibleCount = Math.ceil(dataset.length * t);
      this.ctx.beginPath();
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 2.5;
      this.ctx.lineJoin = 'round';
      for (let i = 0; i < visibleCount; i++) {
        const x = pad.left + stepX * i;
        const y = pad.top + ch - (dataset[i] / max) * ch;
        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.stroke();

      // Dots
      for (let i = 0; i < visibleCount; i++) {
        const x = pad.left + stepX * i;
        const y = pad.top + ch - (dataset[i] / max) * ch;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 4, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(x, y, 2, 0, Math.PI * 2);
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();
      }
    };

    drawDataLine(data, c.primary);
    if (data2) drawDataLine(data2, c.secondary);
  }

  drawArea(t) {
    const { labels, data } = this.data;
    const c = this.getColors();
    const pad = { top: 10, right: 10, bottom: 30, left: 40 };
    const cw = this.w - pad.left - pad.right;
    const ch = this.h - pad.top - pad.bottom;
    const max = Math.max(...data) * 1.2;
    const stepX = cw / (labels.length - 1);
    const visibleCount = Math.ceil(labels.length * t);

    // Area fill
    this.ctx.beginPath();
    this.ctx.moveTo(pad.left, pad.top + ch);
    for (let i = 0; i < visibleCount; i++) {
      const x = pad.left + stepX * i;
      const y = pad.top + ch - (data[i] / max) * ch;
      this.ctx.lineTo(x, y);
    }
    this.ctx.lineTo(pad.left + stepX * (visibleCount - 1), pad.top + ch);
    this.ctx.closePath();
    const grad = this.ctx.createLinearGradient(0, pad.top, 0, pad.top + ch);
    grad.addColorStop(0, 'rgba(79,70,229,0.2)');
    grad.addColorStop(1, 'rgba(79,70,229,0.01)');
    this.ctx.fillStyle = grad;
    this.ctx.fill();

    // Line
    this.ctx.beginPath();
    this.ctx.strokeStyle = c.primary;
    this.ctx.lineWidth = 2;
    for (let i = 0; i < visibleCount; i++) {
      const x = pad.left + stepX * i;
      const y = pad.top + ch - (data[i] / max) * ch;
      if (i === 0) this.ctx.moveTo(x, y); else this.ctx.lineTo(x, y);
    }
    this.ctx.stroke();
  }

  drawDoughnut(t) {
    const { labels, data, colors } = this.data;
    const c = this.getColors();
    const cx = this.w / 2;
    const cy = this.h / 2;
    const r = Math.min(cx, cy) - 20;
    const innerR = r * 0.65;
    const total = data.reduce((a, b) => a + b, 0);
    let startAngle = -Math.PI / 2;

    data.forEach((val, i) => {
      const sliceAngle = (val / total) * Math.PI * 2 * t;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, r, startAngle, startAngle + sliceAngle);
      this.ctx.arc(cx, cy, innerR, startAngle + sliceAngle, startAngle, true);
      this.ctx.closePath();
      this.ctx.fillStyle = colors[i];
      this.ctx.fill();
      startAngle += sliceAngle;
    });

    // Center text
    this.ctx.fillStyle = c.text;
    this.ctx.font = 'bold 24px Poppins, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(total, cx, cy - 6);
    this.ctx.font = '12px Inter, sans-serif';
    this.ctx.fillStyle = c.muted;
    this.ctx.fillText('Total', cx, cy + 14);

    // Legend
    const legendY = this.h - 16;
    const legendWidth = labels.length * 90;
    const startX = cx - legendWidth / 2;
    labels.forEach((label, i) => {
      const x = startX + i * 90;
      this.ctx.fillStyle = colors[i];
      this.ctx.fillRect(x, legendY - 4, 10, 10);
      this.ctx.fillStyle = c.muted;
      this.ctx.font = '11px Inter, sans-serif';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(label, x + 14, legendY + 4);
    });
  }

  roundRect(x, y, w, h, r) {
    if (h <= 0) return;
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + w - r, y);
    this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    this.ctx.lineTo(x + w, y + h);
    this.ctx.lineTo(x, y + h);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
    this.ctx.closePath();
    this.ctx.fill();
  }
}

// Helper to init charts on visible pages
function initChart(canvasId, type, data, options) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  return new MCSChart(canvas, type, data, options);
}
