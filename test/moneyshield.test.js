import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assess } from '../public/moneyshield.js';
import { signals } from '../public/guide.js';

test('asks for credentials are distinguished from delivery and safety advice', () => {
  for(const message of [
    'Your OTP is 903211. Do not share it with anyone.',
    'For your safety, share OTP with nobody.',
    'We will send you a one-time security code.',
    'Scammers may ask you to send your OTP in a scam.',
    'Enter your code in the app you opened yourself.'
  ]) assert.equal(assess(message).level, 'low', message);
  for(const message of [
    'Aapka wallet verify karne ke liye O.T.P. bhejo jaldi',
    'We need you to confirm your OTP with our support team.',
    'We will send an OTP. Reply with the OTP to this chat.'
  ]) assert.ok(assess(message).signals.includes('secretRequest'), message);
});

test('survey-inspired requests are flagged with the specific reason', () => {
  for(const [message, reason] of [
    ['Paise lene ke liye QR scan karo.', 'receiveTrap'],
    ['गलती से पैसे भेज दिए। पैसे वापस भेजो।', 'refundDemand'],
    ['Your wallet was debited by 4500. To stop it, call 00000 12345.', 'contactAfterAlert'],
    ['Here is the payment screenshot. Dispatch the order immediately. The bank will update later.', 'proofPressure'],
    ['Bank support: install AnyDesk so we can reverse the charge.', 'remoteAccess'],
    ['Use this link to submit your verification code: https://account-help.test/validate', 'secretEntry']
  ]) {
    const report=assess(message);
    assert.notEqual(report.level,'low',message);
    assert.ok(report.signals.includes(reason),message);
    assert.ok(report.signals.every(key=>signals[key]?.length===2));
  }
  assert.equal(assess('Payment received: ₹2,450. Check your balance in your bank app.').level,'low');
  assert.equal(assess('The loan processing fee is listed in the official app.').level,'low');
});

test('URL checks parse defanged and misleading addresses without putting them in results', () => {
  const input='hxxps://sbi.co[.]in.verify-center.test/kyc?example=private-placeholder';
  const result=assess(input);
  assert.equal(result.level,'high');
  assert.ok(result.signals.includes('lookalike'));
  assert.ok(!JSON.stringify(result).includes('private-placeholder'));
  assert.ok(assess('https://pаytm.com/verify').signals.includes('mixedHost'));
  assert.ok(assess('https://[::1]').signals.includes('ipAddress'));
  assert.ok(assess('https://updates.test/app.apk').signals.includes('appInstall'));
  assert.ok(assess('upi://pay?pa=example@test').signals.includes('paymentLink'));
  assert.equal(assess('https://www.hdfcbank.com/login').level,'low');
  assert.equal(assess('https://docs.example/help/send-otp').level,'low');
  assert.equal(assess('Data:spreadsheet attached').level,'low');
  assert.deepEqual(assess('Contact careers@paytm.example.').signals,[]);
  assert.throws(()=>assess('x'.repeat(4001)));
});
