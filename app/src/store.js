// store.js — the household's books: categories, the seeded November the
// site opens on, and persistence in localStorage so edits survive a
// reload. Every figure on every page is computed from this one state.

export const CATEGORIES = [
  { id: 'housing', name: 'Housing', color: '#b3543f', kind: 'need' },
  { id: 'groceries', name: 'Groceries', color: '#5d8a4a', kind: 'need' },
  { id: 'utilities', name: 'Utilities & bills', color: '#4a6d8a', kind: 'need' },
  { id: 'transport', name: 'Transport', color: '#7a6a9e', kind: 'need' },
  { id: 'health', name: 'Health', color: '#3f8a7d', kind: 'need' },
  { id: 'kids', name: 'Kids & school', color: '#c98a2d', kind: 'need' },
  { id: 'dining', name: 'Dining out', color: '#c25e7e', kind: 'want' },
  { id: 'fun', name: 'Fun & streaming', color: '#8a5da0', kind: 'want' },
  { id: 'shopping', name: 'Shopping', color: '#546e7a', kind: 'want' },
  { id: 'savings', name: 'Savings', color: '#2e7d4f', kind: 'save' },
];

export function category(id) { return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1]; }

const KEY = 'hearth-ledger-v1';

/** The books as they open the first time: one household, mid-November. */
function seed() {
  return {
    household: 'The Marlowe Household',
    month: '2026-11',
    incomes: [
      { name: 'Salary — Alex', amount: 4850 },
      { name: 'Salary — Priya', amount: 2100 },
      { name: 'Weekend tutoring', amount: 420 },
    ],
    plans: { housing: 1650, groceries: 780, utilities: 340, transport: 260, health: 180, kids: 320, dining: 240, fun: 130, shopping: 300, savings: 900 },
    transactions: [
      ['2026-11-01', 'Rent — Maple Court', 'housing', 1650],
      ['2026-11-02', 'GreenMart Groceries', 'groceries', 148.20],
      ['2026-11-03', 'City Power & Light', 'utilities', 96.40],
      ['2026-11-04', 'Metro Card top-up', 'transport', 60],
      ['2026-11-05', 'Transfer to savings', 'savings', 900],
      ['2026-11-06', 'Pharmacy — CVS', 'health', 42.75],
      ['2026-11-07', 'GreenMart Groceries', 'groceries', 132.60],
      ['2026-11-08', 'Noodle House (family dinner)', 'dining', 68.40],
      ['2026-11-09', 'StreamBox + MusicPass', 'fun', 27.98],
      ['2026-11-10', 'School books & supplies', 'kids', 84.50],
      ['2026-11-12', 'Fuel — Shell', 'transport', 52.30],
      ['2026-11-13', 'Water & sewer', 'utilities', 58.20],
      ['2026-11-14', 'GreenMart Groceries', 'groceries', 156.90],
      ['2026-11-15', 'Winter shoes — Maya', 'kids', 74.99],
      ['2026-11-16', 'Dentist co-pay', 'health', 85],
      ['2026-11-18', 'Farmers market', 'groceries', 63.25],
      ['2026-11-19', 'Cinema — family night', 'fun', 46],
      ['2026-11-20', 'Internet — FiberLink', 'utilities', 59.99],
      ['2026-11-21', 'Birthday gift — Leo', 'shopping', 39.50],
      ['2026-11-22', 'GreenMart Groceries', 'groceries', 141.35],
      ['2026-11-23', 'Pizza Friday', 'dining', 42.80],
      ['2026-11-24', 'Car insurance (monthly)', 'transport', 118.60],
    ].map(([date, payee, cat, amount], i) => ({ id: `t${i + 1}`, date, payee, category: cat, amount })),
    bills: [
      { id: 'b1', name: 'Rent — Maple Court', amount: 1650, dueDay: 1, category: 'housing' },
      { id: 'b2', name: 'City Power & Light', amount: 96, dueDay: 6, category: 'utilities' },
      { id: 'b3', name: 'Internet — FiberLink', amount: 59.99, dueDay: 20, category: 'utilities' },
      { id: 'b4', name: 'Car insurance', amount: 118.60, dueDay: 24, category: 'transport' },
      { id: 'b5', name: 'StreamBox + MusicPass', amount: 27.98, dueDay: 9, category: 'fun' },
      { id: 'b6', name: 'Phone plans (x2)', amount: 84, dueDay: 27, category: 'utilities' },
      { id: 'b7', name: 'Gym — FitWorks', amount: 45, dueDay: 28, category: 'health' },
    ],
    goals: [
      { id: 'g1', name: 'Emergency fund', target: 15000, saved: 9250, monthly: 500 },
      { id: 'g2', name: 'Summer trip — coast', target: 2400, saved: 1380, monthly: 200 },
      { id: 'g3', name: 'New laptop', target: 1200, saved: 950, monthly: 200 },
    ],
    history: [
      { month: '2026-06', income: 7150, spent: 5980 },
      { month: '2026-07', income: 7150, spent: 6410 },
      { month: '2026-08', income: 7370, spent: 6690 },
      { month: '2026-09', income: 7370, spent: 6120 },
      { month: '2026-10', income: 7370, spent: 6285 },
    ],
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* a fresh start beats a broken one */ }
  return seed();
}

export function saveState(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode: the session still works */ }
}

export function resetState() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  return seed();
}

/** Money in this month: the sum of the income lines. */
export function totalIncome(state) {
  return state.incomes.reduce((s, i) => s + i.amount, 0);
}

/** Money out this month, optionally only one category. */
export function totalSpent(state, categoryId = null) {
  return state.transactions
    .filter((t) => !categoryId || t.category === categoryId)
    .reduce((s, t) => s + t.amount, 0);
}

/** Spending that is not the savings transfer itself. */
export function totalOutgoings(state) {
  return totalSpent(state) - totalSpent(state, 'savings');
}
