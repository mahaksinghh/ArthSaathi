import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assess, sample, blank, confirmSale, totals, paisa, today } from '../public/core.js';

test('demo payment is high risk with independent, deduplicated reasons', () => {
  const result = assess(sample);
  assert.equal(result.level, 'high');
  assert.deepEqual(result.signals, ['receiveTrap','urgent','http','lure']);
  assert.equal(result.score, 100);
  assert.equal(assess('OTP OTP OTP').score, 0);
  assert.deepEqual(assess('Reply with the OTP. Send the OTP.').signals, ['secretRequest']);
});
test('Hindi KYC and PIN lures are detected', () => {
  assert.equal(assess('तुरंत केवाईसी करें और यूपीआई पिन डालें').level, 'high');
});
test('URL shape indicators include shortened links and embedded credentials', () => {
  assert.ok(assess('bit.ly/example').signals.includes('short'));
  assert.ok(assess('https://bank.example@127.0.0.1/verify').signals.includes('urlCredentials'));
  assert.equal(assess('Thank you').score, 0);
  assert.throws(()=>assess(' '));
});
test('paisa parsing preserves precision and rejects inappropriate representations', () => {
  assert.equal(paisa('2450.05'), 245005);
  for (const value of ['0','-10','10.009','NaN','1e3','Infinity','100000000']) assert.throws(()=>paisa(value));
});
test('linking stays outside cash flow and manual confirmation credits exactly once', () => {
  const state = blank(true);
  const before = totals(state,'business');
  state.sales[0].risk = assess(sample);
  assert.deepEqual(totals(state,'business'), before);
  assert.throws(()=>confirmSale(state,'demo-sale',false));
  const confirmed = confirmSale(state,'demo-sale',true);
  assert.equal(confirmed.sales[0].status,'confirmed');
  assert.equal(confirmed.sales[0].risk.score,100);
  assert.equal(confirmed.entries[0].demo,true);
  assert.equal(totals(confirmed,'business').income - before.income,245000);
  assert.equal(before.due - totals(confirmed,'business').due,245000);
  assert.deepEqual(totals(confirmed,'personal'),totals(state,'personal'));
  assert.throws(()=>confirmSale(confirmed,'demo-sale',true));
  assert.equal(state.sales[0].status,'pending');
});
test('empty workspace and month filtering', () => {
  assert.equal(totals(blank(),'business').net,0);
  const state=blank();
  state.entries.push({mode:'business',amount:25,type:'expense',date:today()});
  assert.equal(totals(state,'business',today().slice(0,7)).net,-25);
  assert.equal(totals(state,'business','1900-01').net,0);
});
