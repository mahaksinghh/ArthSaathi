import { signals } from './guide.js';
import { qrSignals } from './qr-risk.js';

export { assess } from './moneyshield.js';
export const sample = 'URGENT: ₹2,450 payment received. To release the money, enter your UPI PIN now at http://pay-confirm.example/claim';
export const today = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].map((n, i) => i ? String(n).padStart(2, '0') : n).join('-');
};
export const id = () => globalThis.crypto.randomUUID();
export const clean = (text) => String(text ?? '').trim();
export function paisa(value) {
  const match = /^(\d{1,8})(?:\.(\d{1,2}))?$/.exec(clean(value));
  const amount = match ? Number(match[1]) * 100 + Number((match[2] || '').padEnd(2, '0')) : 0;
  if (!amount) throw Error('amount');
  return amount;
}
export function blank(demo = false) {
  const state = { demo, entries: [], sales: [], scans: [], budgets: {}, keepScans: false };
  if (!demo) return state;
  const items = [
    ['Counter sales', 'income', 4200, -6], ['Wholesale stock', 'expense', 2600, -6],
    ['Counter sales', 'income', 3300, -5], ['Packaging', 'expense', 850, -5],
    ['Bulk order', 'income', 6200, -4], ['Shop supplies', 'expense', 2100, -4],
    ['Counter sales', 'income', 4650, -3], ['Delivery', 'expense', 1400, -3],
    ['Counter sales', 'income', 7250, -2], ['Inventory', 'expense', 3000, -2],
    ['Counter sales', 'income', 5800, -1], ['Utilities', 'expense', 1600, -1],
    ['Counter sales', 'income', 6200, 0], ['Supplier payment', 'expense', 2050, 0]
  ];
  state.entries = items.map(([name, type, value, offset], index) => ({id:'demo-e' + index, name, type, amount:value * 100, date:today(offset), mode:'business', demo:true}));
  state.entries.push({id:'demo-p1',name:'Salary',type:'income',amount:3200000,date:today(-3),mode:'personal',demo:true},{id:'demo-p2',name:'Groceries',type:'expense',amount:235000,date:today(-1),mode:'personal',demo:true});
  state.budgets = { [today().slice(0,7)]: { business:1800000, personal:1200000 } };
  state.sales = [
    { id:'demo-sale', name:'Meera Stores', amount:245000, status:'pending', date:today(), demo:true },
    { id:'demo-due', name:'Aarav Traders', amount:360000, status:'pending', date:today(-2), demo:true }
  ];
  return state;
}
export function confirmSale(state, saleId, checked, date = today()) {
  const sale = state.sales.find(s => s.id === saleId);
  if (!checked || !sale || sale.status !== 'pending' || state.entries.some(e => e.saleId === saleId)) throw Error('confirmation');
  return { ...state, sales: state.sales.map(s => s.id === saleId ? {...s, status:'confirmed', confirmedAt:date} : s),
    entries: [{ id:'receipt-' + sale.id, saleId, name:sale.name, amount:sale.amount, date, mode:'business', type:'income', demo:sale.demo }, ...state.entries] };
}

const qrRiskLevels = ['unassessed', 'low', 'medium', 'high'];
const assessedQrTypes = new Set(['payment', 'link', 'action']);
const knownRiskSignals = new Set([...Object.keys(signals), ...Object.keys(qrSignals)]);

export function attachSaleQrReview(state, saleId, reports, {demo = false, date = today()} = {}) {
  const sale = state.sales.find(row => row.id === saleId);
  // The QR worker returns up to four distinct decoded payloads per image.
  if (!sale || sale.status !== 'pending' || !Array.isArray(reports) || reports.length < 1 || reports.length > 4 ||
    typeof demo !== 'boolean' || (demo && (sale.id !== 'demo-sale' || sale.demo !== true)) ||
    typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !new Date(date).toJSON()?.startsWith(date)) {
    throw Error('qr-review');
  }

  const indicators = new Set();
  let highestLevel = 0;
  let inconclusive = false;
  for (const report of reports) {
    const risk = report?.risk;
    const rank = qrRiskLevels.indexOf(risk?.level);
    if (!assessedQrTypes.has(report?.type) || rank < 1 || !Array.isArray(risk?.signals)) {
      inconclusive = true;
      continue;
    }
    highestLevel = Math.max(highestLevel, rank);
    for (const signal of risk.signals) {
      if (knownRiskSignals.has(signal)) indicators.add(signal);
    }
  }

  const qrReview = {
    date, level: qrRiskLevels[highestLevel], signals: [...indicators],
    codeCount: reports.length, inconclusive, demo,
  };
  return { ...state, sales: state.sales.map(row => row === sale ? { ...row, qrReview } : row) };
}

export function totals(state, mode, month) {
  const entries = state.entries.filter(e => e.mode === mode && (!month || e.date.startsWith(month)));
  const income = entries.reduce((sum, e) => sum + (e.type === 'income' ? e.amount : 0), 0);
  const expense = entries.reduce((sum, e) => sum + (e.type === 'expense' ? e.amount : 0), 0);
  const due = mode === 'business' ? state.sales.reduce((sum, s) => sum + (s.status === 'pending' ? s.amount : 0), 0) : 0;
  return { entries, income, expense, due, net: income - expense };
}
