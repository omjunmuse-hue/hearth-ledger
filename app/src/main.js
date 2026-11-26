// main.js — Hearth & Ledger boot and routing: five views, one state,
// hash routes so every page is reached by a link and the back button
// works the way a visitor expects.

import { loadState, saveState, resetState } from './store.js';
import { dashboardView } from './views-dashboard.js';
import { budgetView, bindBudget } from './views-budget.js';
import { transactionsView, bindTransactions } from './views-transactions.js';
import { planningView } from './views-planning.js';
import { insightsView } from './views-insights.js';

let state = loadState();
let txFilter = 'all';

const view = document.getElementById('view');
const navLinks = document.querySelectorAll('nav a[data-route]');

const ROUTES = {
  '/': () => dashboardView(state),
  '/budget': () => budgetView(state),
  '/transactions': () => transactionsView(state, txFilter),
  '/bills': () => planningView(state),
  '/insights': () => insightsView(state),
};

function currentRoute() {
  const hash = location.hash.replace(/^#/, '');
  return ROUTES[hash] ? hash : '/';
}

function render() {
  const route = currentRoute();
  view.innerHTML = ROUTES[route]();
  navLinks.forEach((a) => a.classList.toggle('on', a.dataset.route === route));
  const save = () => saveState(state);
  if (route === '/budget') bindBudget(state, save, render);
  if (route === '/transactions') bindTransactions(state, save, render, (f) => { txFilter = f; render(); });
  view.scrollTop = 0;
  window.scrollTo(0, 0);
}

document.getElementById('reset-books').addEventListener('click', () => {
  state = resetState();
  txFilter = 'all';
  render();
});

addEventListener('hashchange', render);
render();
