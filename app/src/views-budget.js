// views-budget.js — the monthly plan: one envelope per category, what
// was planned against what was spent, editable in place. Saving a plan
// writes it to the store and re-renders, so the numbers always agree.

import { CATEGORIES, totalIncome, totalSpent } from './store.js';
import { fmt, monthName, pct } from './money.js';
import { meter } from './charts.js';

export function budgetView(state) {
  const income = totalIncome(state);
  const plannedTotal = CATEGORIES.reduce((s, c) => s + (state.plans[c.id] ?? 0), 0);
  const rows = CATEGORIES.map((c) => {
    const plan = state.plans[c.id] ?? 0;
    const spent = totalSpent(state, c.id);
    const left = plan - spent;
    return `<tr class="${left < 0 ? 'over-row' : ''}">
      <td><i class="dot" style="background:${c.color}"></i><strong>${c.name}</strong></td>
      <td><label class="sr" for="plan-${c.id}">Planned for ${c.name}</label>
          <input id="plan-${c.id}" data-plan="${c.id}" type="number" min="0" step="10" value="${plan}"></td>
      <td>${fmt(spent)}</td>
      <td>${meter(spent, plan)}</td>
      <td class="${left < 0 ? 'neg' : 'pos'}">${left < 0 ? `−${fmt(-left)} over` : `${fmt(left)} left`}</td>
      <td class="dim">${pct(spent, income)} of income</td>
    </tr>`;
  }).join('');

  return `
  <section class="card wide">
    <h2>The ${monthName(state.month)} plan</h2>
    <p class="sub">Income is <strong>${fmt(income)}</strong> and the plan assigns <strong>${fmt(plannedTotal)}</strong> of it.
    ${plannedTotal > income
      ? `<span class="neg">That is ${fmt(plannedTotal - income)} more than comes in — trim an envelope below.</span>`
      : `The unassigned <strong>${fmt(income - plannedTotal)}</strong> is the month's cushion.`}
    Change any planned amount and press Save — every page updates from the same books.</p>
    <div class="table-wrap"><table class="budget">
      <thead><tr><th>Category</th><th>Planned</th><th>Spent</th><th></th><th>Standing</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <p><button id="save-plans" class="primary" type="button">Save the plan</button>
    <span id="plan-note" class="sub" role="status"></span></p>
    <h3>How the plan is shaped</h3>
    <p class="sub">Needs (housing, food, bills, transport, health, kids) come first, then wants, then savings —
    the Insights page checks this plan against the 50/30/20 guide and shows where November actually landed.</p>
  </section>`;
}

/** Wire the Save button after the view renders. */
export function bindBudget(state, save, rerender) {
  const btn = document.getElementById('save-plans');
  if (!btn) return;
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-plan]').forEach((input) => {
      const v = Number(input.value);
      if (Number.isFinite(v) && v >= 0) state.plans[input.dataset.plan] = v;
    });
    save();
    rerender();
    const note = document.getElementById('plan-note');
    if (note) note.textContent = 'Saved — the whole site now runs on this plan.';
  });
}
