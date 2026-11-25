import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assess, attachSaleQrReview, blank, confirmSale, sample, totals } from '../public/core.js';
import { assessQr, paymentExpectations } from '../public/qr-risk.js';

const date = '2026-11-25';

test('attaches a QR summary without crediting sales or persisting decoded payment data', () => {
  const state = blank(true);
  state.sales[0].risk = assess(sample);
  const before = totals(state, 'business');
  const report = assessQr('upi://pay?pa=unexpected%40demo&pn=Do%20not%20store&am=2450&cu=INR',
    paymentExpectations('merchant@demo', '2450'));
  const reviewed = attachSaleQrReview(state, 'demo-sale', [report], {demo:true, date});
  assert.deepEqual(reviewed.sales[0].qrReview, {
    date, level:'high', signals:['qrPayeeMismatch','qrPay'], codeCount:1, inconclusive:false, demo:true,
  });
  assert.equal(reviewed.sales[0].status, 'pending');
  assert.strictEqual(reviewed.sales[0].risk, state.sales[0].risk);
  assert.strictEqual(reviewed.entries, state.entries);
  assert.equal(state.sales[0].qrReview, undefined);
  assert.deepEqual(totals(reviewed, 'business'), before);
  assert.doesNotMatch(JSON.stringify(reviewed), /unexpected@demo|merchant@demo|Do not store|upi:\/\//);
});

test('ignores corrupt reports and unknown data while preserving the highest assessed level', () => {
  const state = blank(true);
  const reports = [
    {type:'link', host:'private.example', risk:{level:'low', signals:['http','private.example']}},
    {type:'payment', payee:'private@demo', risk:{level:'high', signals:['http','qrPayeeMismatch','__proto__','private@demo']}},
    {type:'unassessed', risk:{level:'constructor', signals:['qrHidden']}},
    null,
  ];
  assert.deepEqual(attachSaleQrReview(state, 'demo-sale', reports, {date}).sales[0].qrReview, {
    date, level:'high', signals:['http','qrPayeeMismatch'], codeCount:4, inconclusive:true, demo:false,
  });
  assert.deepEqual(attachSaleQrReview(state, 'demo-sale', [{type:'unassessed'}], {date}).sales[0].qrReview, {
    date, level:'unassessed', signals:[], codeCount:1, inconclusive:true, demo:false,
  });
});

test('rejects invalid attachments and keeps receipt confirmation independent of the QR review', () => {
  const state = blank(true);
  const reports = [{type:'unassessed'}];
  assert.throws(() => attachSaleQrReview(state, 'demo-due', reports, {demo:true}), /qr-review/);
  assert.throws(() => attachSaleQrReview(state, 'missing', reports), /qr-review/);
  assert.throws(() => attachSaleQrReview(state, 'demo-sale', []), /qr-review/);
  assert.throws(() => attachSaleQrReview(state, 'demo-sale', Array(5).fill(reports[0])), /qr-review/);
  assert.throws(() => attachSaleQrReview(state, 'demo-sale', reports, {date:'2026-02-31'}), /qr-review/);

  const reviewed = attachSaleQrReview(state, 'demo-sale', reports, {demo:true, date});
  assert.throws(() => confirmSale(reviewed, 'demo-sale', false, date), /confirmation/);
  const confirmed = confirmSale(reviewed, 'demo-sale', true, date);
  assert.equal(confirmed.entries.filter(entry => entry.saleId === 'demo-sale').length, 1);
  assert.strictEqual(confirmed.sales[0].qrReview, reviewed.sales[0].qrReview);
  assert.throws(() => confirmSale(confirmed, 'demo-sale', true, date), /confirmation/);
  assert.throws(() => attachSaleQrReview(confirmed, 'demo-sale', reports), /qr-review/);
});

test('matching sale QR data still leaves the credit unconfirmed', () => {
  const state=blank(true);
  const expected=paymentExpectations('meera@demo','2450');
  const report=assessQr('upi://pay?pa=meera%40demo&am=2450&cu=INR',expected);
  const next=attachSaleQrReview(state,'demo-sale',[report],{date});
  assert.equal(next.sales[0].status,'pending');
  assert.deepEqual(totals(state,'business'),totals(next,'business'));
  assert.deepEqual(next.sales[0].qrReview.signals,['qrPay']);
});
