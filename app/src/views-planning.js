// views-planning.js — bills and goals: what is owed, when it lands, and
// what the household is saving toward, with the date each goal lands if
// the monthly contribution holds.

import { category } from './store.js';
import { fmt, daysUntilDue } from './money.js';
import { meter } from './charts.js';

export function planningView(state) {
  const today = new Date(2026, 10, 26);
  const bills = [...state.bills]
    .map((b) => ({ ...b, inDays: daysUntilDue(b.dueDay, today) }))
    .sort((a, b) => a.inDays - b.inDays);
  const billsTotal = state.bills.reduce((s, b) => s + b.amount, 0);
  const goals = state.goals.map((g) => {
    const monthsLeft = g.monthly > 0 ? Math.ceil((g.target - g.saved) / g.monthly) : Infinity;
    const lands = new Date(2026, 10 + monthsLeft, 1);
    const when = monthsLeft === Infinity ? 'no monthly amount set'
      : monthsLeft <= 0 ? 'funded — done'
      : `lands ${lands.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} at ${fmt(g.monthly)}/mo`;
    return { ...g, monthsLeft, when };
  });

  return `
  <section class="card wide">
    <h2>Bills — ${fmt(billsTotal)} a month, on rails</h2>
    <p class="sub">Every recurring bill, in the order it lands. The rent and the power bill are the two that
    must never surprise anyone; the rest are small enough to automate and forget.</p>
    <ul class="rows">
      ${bills.map((b) => `<li>
        <span><strong>${b.name}</strong><small>${category(b.category).name} · due on the ${b.dueDay}${suffix(b.dueDay)}</small></span>
        <span class="amt">${fmt(b.amount)}<small>${b.inDays === 0 ? 'due today' : `in ${b.inDays} day${b.inDays === 1 ? '' : 's'}`}</small></span>
      </li>`).join('')}
    </ul>
  </section>
  <section class="card wide">
    <h2>Savings goals</h2>
    <div class="goal-grid">
      ${goals.map((g) => `<article class="goal">
        <h3>${g.name}</h3>
        <p class="goal-amt">${fmt(g.saved)} <span>of ${fmt(g.target)}</span></p>
        ${meter(g.saved, g.target)}
        <p class="sub">${g.when}</p>
      </article>`).join('')}
    </div>
    <p class="sub">The emergency fund comes first on purpose: three months of outgoings is roughly ${fmt(15000)},
    and it is the goal that makes every other surprise in this ledger a smaller one.</p>
  </section>`;
}

function suffix(d) { return d === 1 || d === 21 ? 'st' : d === 2 || d === 22 ? 'nd' : d === 3 || d === 23 ? 'rd' : 'th'; }
