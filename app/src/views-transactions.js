// views-transactions.js — the ledger: every transaction of the month,
// a working form to add one, a category filter, and a delete on each row.

import { CATEGORIES, category, totalSpent } from './store.js';
import { fmtCents, fmt, dayName, esc } from './money.js';

export function transactionsView(state, filter = 'all') {
  const list = [...state.transactions]
    .filter((t) => filter === 'all' || t.category === filter)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const options = CATEGORIES.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');
  return `
  <section class="card wide">
    <h2>Add a transaction</h2>
    <form id="add-tx" class="tx-form">
      <label>Date <input type="date" name="date" value="2026-11-25" required></label>
      <label>What for <input type="text" name="payee" placeholder="e.g. GreenMart Groceries" required maxlength="60"></label>
      <label>Category <select name="category">${options}</select></label>
      <label>Amount <input type="number" name="amount" min="0.01" step="0.01" placeholder="0.00" required></label>
      <button class="primary" type="submit">Add to the ledger</button>
    </form>
  </section>
  <section class="card wide">
    <h2>The ledger
      <label class="filter">Show
        <select id="tx-filter">
          <option value="all"${filter === 'all' ? ' selected' : ''}>All categories</option>
          ${CATEGORIES.map((c) => `<option value="${c.id}"${filter === c.id ? ' selected' : ''}>${c.name}</option>`).join('')}
        </select>
      </label>
    </h2>
    <p class="sub">${list.length} transaction${list.length === 1 ? '' : 's'} · ${fmt(totalSpent(state, filter === 'all' ? null : filter))} in view</p>
    <ul class="rows tx">
      ${list.map((t) => `<li>
        <span><strong>${esc(t.payee)}</strong><small>${dayName(t.date)} · ${category(t.category).name}</small></span>
        <span class="amt">${fmtCents(t.amount)} <button type="button" class="ghost" data-del="${t.id}" aria-label="Delete ${esc(t.payee)}">✕</button></span>
      </li>`).join('') || '<li><span>No transactions in this category yet this month.</span></li>'}
    </ul>
  </section>`;
}

/** Wire the form, the filter and the delete buttons after rendering. */
export function bindTransactions(state, save, rerender, setFilter) {
  const form = document.getElementById('add-tx');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const amount = Number(fd.get('amount'));
    if (!Number.isFinite(amount) || amount <= 0) return;
    state.transactions.push({
      id: `t${Date.now()}`,
      date: String(fd.get('date')),
      payee: String(fd.get('payee')).trim(),
      category: String(fd.get('category')),
      amount,
    });
    save();
    rerender();
  });
  const sel = document.getElementById('tx-filter');
  if (sel) sel.addEventListener('change', () => setFilter(sel.value));
  document.querySelectorAll('[data-del]').forEach((btn) => btn.addEventListener('click', () => {
    state.transactions = state.transactions.filter((t) => t.id !== btn.dataset.del);
    save();
    rerender();
  }));
}
