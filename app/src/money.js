// money.js — formatting and calendar helpers every view shares.

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const usdCents = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

/** $1,240 — whole dollars for headlines and bars. */
export function fmt(n) { return usd.format(Math.round(n)); }

/** $1,240.50 — cents where a transaction's exact amount matters. */
export function fmtCents(n) { return usdCents.format(n); }

/** A share as a whole percent: 0.42 -> "42%". */
export function pct(part, whole) {
  if (!whole) return '0%';
  return `${Math.round((part / whole) * 100)}%`;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** '2026-11' -> 'November 2026'. */
export function monthName(ym) {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

/** '2026-11-04' -> 'Tue 4 Nov'. */
export function dayName(iso) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

/** Days from today until the next occurrence of a monthly due day. */
export function daysUntilDue(dueDay, today = new Date()) {
  const y = today.getFullYear(), m = today.getMonth();
  let due = new Date(y, m, Math.min(dueDay, 28));
  if (due < new Date(y, m, today.getDate())) due = new Date(y, m + 1, Math.min(dueDay, 28));
  return Math.round((due - new Date(y, m, today.getDate())) / 86400000);
}

/** Escape text before it goes into HTML the views build. */
export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
