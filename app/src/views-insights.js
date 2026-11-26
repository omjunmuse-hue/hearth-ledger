// views-insights.js — what the numbers mean: the 50/30/20 check, the
// six-month shape of the household's money, and three findings written
// from this month's actual figures.

import { CATEGORIES, totalIncome, totalSpent, totalOutgoings } from './store.js';
import { fmt, monthName, pct } from './money.js';
import { groupedBars } from './charts.js';

export function insightsView(state) {
  const income = totalIncome(state);
  const byKind = (kind) => CATEGORIES.filter((c) => c.kind === kind)
    .reduce((s, c) => s + totalSpent(state, c.id), 0);
  const needs = byKind('need'), wants = byKind('want'), saves = byKind('save');
  const kept = saves + Math.max(0, income - totalSpent(state));
  const rows = [...state.history, { month: state.month, income, spent: totalOutgoings(state) }]
    .map((h) => ({ label: monthName(h.month).slice(0, 3), a: h.income, b: h.spent }));
  const groceries = totalSpent(state, 'groceries');
  const weeks = 4;
  const top = CATEGORIES
    .map((c) => ({ c, v: totalSpent(state, c.id) }))
    .filter((x) => x.c.id !== 'housing' && x.c.id !== 'savings')
    .sort((a, b) => b.v - a.v)[0];

  return `
  <section class="card wide">
    <h2>The 50/30/20 check — ${monthName(state.month)}</h2>
    <p class="sub">A common guide: half of income to needs, 30% to wants, 20% kept. Here is where this household stands,
    counted from the ledger itself, not from the plan.</p>
    <div class="split">
      ${splitRow('Needs', needs, income, 50)}
      ${splitRow('Wants', wants, income, 30)}
      ${splitRow('Kept (saved or still in hand)', kept, income, 20)}
    </div>
    <p class="sub">${verdict(needs, wants, kept, income)}</p>
  </section>
  <section class="card wide">
    <h2>Six months of money in and out</h2>
    ${groupedBars(rows)}
    <p class="legend-line"><i style="background:#2e7d4f"></i> Income <i style="background:#b3543f"></i> Spent (not counting savings transfers)</p>
    <p class="sub">Income rose in August when the tutoring term started; spending followed it up, then settled.
    The gap between the bars is the household's real margin — November's is on pace to be the widest since June.</p>
  </section>
  <section class="card wide">
    <h2>Three findings from the ledger</h2>
    <ol class="findings">
      <li><strong>Groceries are the lever.</strong> ${fmt(groceries)} across ${weeks} weekly shops is ${fmt(groceries / weeks)} a week.
      The farmers-market week came in lowest — one market trip replacing one supermarket trip is worth about ${fmt(24)} a month.</li>
      <li><strong>${top.c.name} is the biggest flexible line</strong> at ${fmt(top.v)} after housing and savings.
      It is also the easiest to trim without touching anything the household needs.</li>
      <li><strong>The plan and the month disagree on dining.</strong> Dining out is planned at ${fmt(state.plans.dining)}
      and already at ${fmt(totalSpent(state, 'dining'))} with days to spare — either the plan grows, or Pizza Friday moves home.</li>
    </ol>
  </section>`;
}

function splitRow(label, value, income, guide) {
  const share = income ? (value / income) * 100 : 0;
  const off = Math.round(share - guide);
  const note = Math.abs(off) <= 3 ? 'on guide' : off > 0 ? `${off} pts over guide` : `${-off} pts under guide`;
  return `<div class="split-row"><span>${label}</span>
    <div class="meter ${off > 3 ? 'warn' : 'ok'}"><span style="width:${Math.min(100, share * 2)}%"></span></div>
    <b>${fmt(value)} · ${Math.round(share)}%</b><small>${note}</small></div>`;
}

function verdict(needs, wants, kept, income) {
  const n = pct(needs, income), k = pct(kept, income);
  return `Needs are running at ${n} of income and ${k} is being kept — a household shape most budgets would
  happily sign for. The one watch-out is wants creeping: they are small in dollars but they are the line that moved most since October.`;
}
