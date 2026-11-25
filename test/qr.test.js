import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';
import { decodeQrPixels } from '../public/qr-decode.js';
import { assessQr, paymentExpectations } from '../public/qr-risk.js';

const official=paymentExpectations('MEERA@demo','2450');
const upi='upi://pay?pa=meera%40demo&am=2450.00&cu=INR';

test('payment comparisons surface a wrong UPI ID and amount without confirming a matching recipient',()=>{
  const clean=assessQr(upi,official);
  assert.equal(clean.payee,'meera@demo');
  assert.equal(clean.amount,245000);
  assert.equal(clean.risk.level,'medium');
  assert.deepEqual(clean.comparison,{payeeCompared:true,amountCompared:true,amountNotEncoded:false});
  const bad=assessQr(upi.replace('meera','other').replace('2450.00','2450.01'),official);
  assert.equal(bad.risk.level,'high');
  assert.ok(bad.risk.signals.includes('qrPayeeMismatch'));
  assert.ok(bad.risk.signals.includes('qrAmountMismatch'));
  assert.ok(assessQr('upi://pay?pa=meera@demo',official).comparison.amountNotEncoded);
  assert.throws(()=>paymentExpectations('not-a-vpa',''),/expectedPayee/);
  assert.throws(()=>paymentExpectations('','2.499'),/expectedAmount/);
});

test('QR fixture alerts on the scanned recipient only, even when the amount matches',()=>{
  const {payee,amount,risk}=assessQr('upi://pay?pa=collection%40demo&am=2450.00&cu=INR',official);
  assert.equal(payee,'collection@demo');
  assert.equal(amount,245000);
  assert.equal(risk.level,'high');
  assert.deepEqual(risk.signals,['qrPayeeMismatch','qrPay']);
});

test('ambiguous fields, invalid currency and app actions are flagged',()=>{
  const repeated=assessQr(upi+'&pa=other@demo',official);
  assert.ok(repeated.risk.signals.includes('qrAmbiguous'));
  assert.equal(repeated.comparison.payeeCompared,false);
  assert.equal(repeated.payee,'');
  assert.ok(assessQr('upi://pay?pa=foo@demo&am=10&cu=USD').risk.signals.includes('qrInvalid'));
  assert.equal(assessQr('upi://pay?pa=foo@demo&am=10&cu=USD').amount,null);
  assert.ok(assessQr('upi://mandate?pa=foo@demo').risk.signals.includes('qrAction'));
  assert.equal(assessQr('gpay://upi/pay?pa=meera%40demo').type,'payment');
});

test('website destination and unsupported private content are reported without exposing raw secrets',()=>{
  const report=assessQr('https://pay-confirm.example@redirect.test/verify?key=private-do-not-log');
  assert.equal(report.host,'redirect.test');
  assert.equal(report.risk.level,'high');
  assert.ok(!JSON.stringify(report).includes('private-do-not-log'));
  assert.equal(assessQr('http://example.test').risk.level,'medium');
  const wifi=assessQr('WIFI:S:Network;P:private-password;;');
  assert.equal(wifi.type,'unassessed');
  assert.ok(!JSON.stringify(wifi).includes('private-password'));
  assert.equal(assessQr('000201ABCD').type,'unassessed');
});

async function fixture(name) {
  // Demo assets are 8-bit grayscale PNGs with unfiltered rows and one IDAT chunk.
  const png=await readFile(new URL('../public/demos/'+name,import.meta.url));
  const width=png.readUInt32BE(16);
  const height=png.readUInt32BE(20);
  assert.equal(png.readUInt32BE(37),0x49444154);
  const source=inflateSync(png.subarray(41,41+png.readUInt32BE(33)));
  const data=new Uint8ClampedArray(width*height*4).fill(255);
  for(let y=0; y<height; y++) {
    assert.equal(source[(width+1)*y],0);
    for(let x=0; x<width; x++) data.fill(source[(width+1)*y+x+1],4*(y*width+x),4*(y*width+x)+3);
  }
  return {data,width,height};
}

test('reads the shipped QR files and finds distinct codes in a two-code image',async()=>{
  const left=await fixture('demo-mismatched-upi.png');
  const right=await fixture('demo-suspicious-link.png');
  const width=left.width+right.width, height=Math.max(left.height,right.height);
  const data=new Uint8ClampedArray(width*height*4).fill(255);
  for(const [image,x] of [[left,0],[right,left.width]]) {
    for(let row=0;row<image.height;row++) {
      data.set(image.data.subarray(row*image.width*4,(row+1)*image.width*4),(row*width+x)*4);
    }
  }
  const reports=decodeQrPixels({data,width,height}).map(code=>assessQr(code,official));
  assert.equal(reports.length,2);
  assert.equal(reports.find(report=>report.type==='payment')?.payee,'collection@demo');
  assert.equal(reports.find(report=>report.type==='link')?.host,'redirect.test');
  assert.ok(reports.every(report=>report.risk.level==='high'));
  assert.deepEqual(decodeQrPixels({data:new Uint8ClampedArray(1600).fill(255),width:20,height:20}),[]);
});
