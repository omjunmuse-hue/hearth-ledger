// charts.js — small dependency-free SVG charts: a category donut and a
// grouped bar chart for the six-month view. Server-rendered strings, so
// they appear in the page the moment it loads.

/** A donut of shares: parts = [{label, value, color}]. */
export function donut(parts, size = 190) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  const r = size / 2 - 6, cx = size / 2, cy = size / 2, stroke = 26;
  let acc = 0;
  const arcs = parts.map((p) => {
    const frac = p.value / total;
    const a0 = -Math.PI / 2 + acc * Math.PI * 2;
    acc += frac;
    const a1 = -Math.PI / 2 + acc * Math.PI * 2;
    if (frac <= 0.001) return '';
    const large = frac > 0.5 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    return `<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" fill="none" stroke="${p.color}" stroke-width="${stroke}"/>`;
  }).join('');
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Spending by category">${arcs}</svg>`;
}

/** Grouped bars: rows = [{label, a, b}] with two series (income, spent). */
export function groupedBars(rows, aColor = '#2e7d4f', bColor = '#b3543f', height = 170) {
  const max = Math.max(...rows.flatMap((r) => [r.a, r.b])) * 1.12;
  const w = 560, bw = 26, gap = 14, groupW = bw * 2 + gap + 34;
  const bars = rows.map((r, i) => {
    const x = 18 + i * groupW;
    const ha = (r.a / max) * (height - 34), hb = (r.b / max) * (height - 34);
    return `<rect x="${x}" y="${height - 18 - ha}" width="${bw}" height="${ha}" rx="3" fill="${aColor}"/>` +
      `<rect x="${x + bw + 4}" y="${height - 18 - hb}" width="${bw}" height="${hb}" rx="3" fill="${bColor}"/>` +
      `<text x="${x + bw}" y="${height - 3}" text-anchor="middle" font-size="11" fill="#5a6579">${r.label}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${w} ${height}" width="100%" role="img" aria-label="Income versus spending by month">${bars}</svg>`;
}

/** One horizontal meter: spent against plan, red past the line. */
export function meter(spent, plan) {
  const frac = plan > 0 ? spent / plan : 0;
  const shown = Math.min(1, frac);
  const cls = frac > 1 ? 'over' : frac > 0.85 ? 'warn' : 'ok';
  return `<div class="meter ${cls}"><span style="width:${Math.round(shown * 100)}%"></span></div>`;
}
