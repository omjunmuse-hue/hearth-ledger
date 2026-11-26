// views-dashboard.js — the front door: where the money stands this
// month, where it went, what is due next, and the most recent spending.

import { CATEGORIES, category, totalIncome, totalSpent, totalOutgoings } from './store.js';
import { fmt, fmtCents, monthName, dayName, daysUntilDue, pct } from './money.js';
import { donut } from './charts.js';

export function dashboardView(state) {
  const income = totalIncome(state);
  const out = totalOutgoings(state);
  const saved = totalSpent(state, 'savings');
  const left = income - totalSpent(state);
  const parts = CATEGORIES
    .map((c) => ({ label: c.name, value: totalSpent(state, c.id), color: c.color }))
    .filter((p) => p.value > 0)
    .sort((a, b) => b.value - a.value);
  const nextBills = [...state.bills]
    .map((b) => ({ ...b, inDays: daysUntilDue(b.dueDay, new Date(2026, 10, 26)) }))
    .sort((a, b) => a.inDays - b.inDays)
    .slice(0, 3);
  const recent = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  return `
  <section class="cards">
    <article class="card hero">
      <h2>Left to spend in ${monthName(state.month)}</h2>
      <p class="big">${fmt(left)}</p>
      <p class="sub">of ${fmt(income)} coming in · ${fmt(out)} spent · ${fmt(saved)} moved to savings</p>
      <p class="sub">Savings rate so far: <strong>${pct(saved + Math.max(0, left), income)}</strong> of income kept or still in hand.</p>
    </article>
    <article class="card">
      <h2>Where it went</h2>
      <div class="donut-wrap">${donut(parts)}
        <ul class="legend">${parts.slice(0, 5).map((p) => `<li><i style="background:${p.color}"></i>${p.label}<b>${fmt(p.value)}</b></li>`).join('')}</ul>
      </div>
    </article>
  </section>
  <section class="cards">
    <article class="card">
      <h2>Coming up</h2>
      <ul class="rows">
        ${nextBills.map((b) => `<li><span><strong>${b.name}</strong><small>${category(b.category).name}</small></span><span class="amt">${fmt(b.amount)}<small>${b.inDays === 0 ? 'due today' : `in ${b.inDays} day${b.inDays === 1 ? '' : 's'}`}</small></span></li>`).join('')}
      </ul>
      <p class="more"><a href="#/bills">All bills &amp; goals →</a></p>
    </article>
    <article class="card">
      <h2>Latest spending</h2>
      <ul class="rows">
        ${recent.map((t) => `<li><span><strong>${t.payee}</strong><small>${dayName(t.date)} · ${category(t.category).name}</small></span><span class="amt">${fmtCents(t.amount)}</span></li>`).join('')}
      </ul>
      <p class="more"><a href="#/transactions">All transactions →</a></p>
    </article>
  </section>`;
}
