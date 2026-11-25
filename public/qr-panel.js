import { assessQr, paymentExpectations, qrSignals } from './qr-risk.js';
import { signals } from './guide.js';

const maxBytes=10*1024*1024;
const maxSide=1280;
const demoFiles={
  payment:'demo-mismatched-upi.png',
  link:'demo-suspicious-link.png'
};
let file=null;
let payee='';
let amount='';
let outcome=null;
let control=null;
let saleScope=null;

const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const say=(hi,en,hindi)=>hi?hindi:en;
const asMoney=(number,hi)=>new Intl.NumberFormat(hi?'hi-IN':'en-IN',{style:'currency',currency:'INR'}).format(number/100);

export function clearQrPanel() {
  control?.abort();
  control=null;
  file=null;
  payee='';
  amount='';
  outcome=null;
  saleScope=null;
}

export function prepareSaleQr(sale) {
  clearQrPanel();
  const {id,name,amount:paise,demo} = sale;
  saleScope={id,name,amount:paise,demo:demo===true};
  amount=(paise/100).toFixed(2);
}

const isDemoSale=()=>saleScope?.id==='demo-sale' && saleScope.demo;

function showOutcome(hi) {
  const t=(en,hindi)=>say(hi,en,hindi);
  if(!outcome) return `<div class="empty">${t('Scan an image to see what the code points to and which indicators matched.','कोड का गंतव्य और जोखिम संकेत देखने के लिए चित्र स्कैन करें।')}</div>`;
  if(outcome.state==='working') return `<div class="notice">${t('Reading the QR in this browser…','इस ब्राउज़र में क्यूआर पढ़ रहे हैं…')}</div>`;
  if(outcome.state!=='done') {
    const messages={
      file:t('Choose a QR image first.','पहले कोई क्यूआर चित्र चुनें।'),
      size:t('Choose an image smaller than 10 MB.','10 एमबी से छोटा चित्र चुनें।'),
      format:t('Choose a PNG, JPEG, or WebP image.','PNG, JPEG या WebP चित्र चुनें।'),
      expectedPayee:t('Enter an expected UPI ID in the form name@provider.','name@provider के रूप में अपेक्षित यूपीआई आईडी डालें।'),
      expectedAmount:t('Enter a positive amount with up to two decimal places.','दो दशमलव अंकों तक की धनात्मक राशि डालें।'),
      decode:t('This image could not be read. Try a different PNG, JPEG, or WebP file.','चित्र पढ़ा नहीं जा सका। कोई दूसरा PNG, JPEG या WebP चुनें।'),
      noCode:t('No QR code could be decoded. Try a sharper image with all four corners visible.','क्यूआर पढ़ा नहीं जा सका। चारों कोने दिखाते हुए साफ़ चित्र आज़माएँ।'),
      demo:t('The demo image is unavailable. Try selecting your own image.','डेमो चित्र उपलब्ध नहीं है। अपना चित्र चुनकर देखें।')
    };
    return `<div class="notice">${messages[outcome.state] || messages.decode}</div>`;
  }
  const types={
    payment:t('UPI payment','यूपीआई भुगतान'), link:t('Website link','वेबसाइट लिंक'),
    action:t('App or unsupported link','ऐप या असमर्थित लिंक'), unassessed:t('Unsupported QR content','असमर्थित क्यूआर सामग्री')
  };
  const levels={high:t('High risk','अधिक जोखिम'),medium:t('Review before acting','कदम उठाने से पहले जाँचें'),low:t('Few or no signals','कम या कोई संकेत नहीं')};
  const demo=outcome.demo==='payment'?t('Fictional demo · Expected meera@demo and ₹2,450.00','काल्पनिक डेमो · अपेक्षित आईडी meera@demo और ₹2,450.00'):
    outcome.demo==='link'?t('Fictional demo QR','काल्पनिक डेमो क्यूआर'):'';
  return `${demo?`<p class="qr-count"><strong>${demo}</strong></p>`:''}<p class="qr-count">${outcome.reports.length>1 ? t('Multiple codes read. Review each result.','एक से ज़्यादा कोड पढ़े गए। हर परिणाम देखें।') : t('QR code read','क्यूआर पढ़ा गया')}</p>${outcome.reports.map((item,i)=>{
    const report=item.risk;
    const comparison=item.comparison;
    const payeeMatches=comparison?.payeeCompared&&!report.signals.includes('qrPayeeMismatch');
    const amountMatches=comparison?.amountCompared&&!report.signals.includes('qrAmountMismatch');
    return `<div class="qr-reading"><div class="qr-reading-head"><h3>${outcome.reports.length>1?(i+1)+' · ':''}${types[item.type]}</h3>${report?`<span class="qr-badge ${report.level}">${levels[report.level]}</span>`:''}</div>
      ${item.type==='link'?`<dl><dt>${t('Actual destination host','असली वेबसाइट होस्ट')}</dt><dd dir="ltr">${escape(item.host)}</dd></dl>`:''}
      ${item.type==='payment'?`<dl><dt>${t('Encoded UPI ID','कोड में यूपीआई आईडी')}</dt><dd dir="ltr">${escape(item.payee)||t('Missing or invalid','गायब या अमान्य')}</dd>
        ${item.name?`<dt>${t('Name in code','कोड में नाम')}</dt><dd>${escape(item.name)}</dd>`:''}
        <dt>${t('Amount in code','कोड में रकम')}</dt><dd>${item.amount!==null?asMoney(item.amount,hi):t('No readable fixed amount','कोई पढ़ने योग्य तय रकम नहीं')}</dd></dl>`:''}
      ${report ? `<ul class="signal-list">${report.signals.map(key=>{
        const label=qrSignals[key]||signals[key];
        return label?`<li>${label[hi?1:0]}</li>`:'';
      }).join('') || `<li>${t('The available checks found no matching indicators.','उपलब्ध जाँच में कोई संकेत नहीं मिला।')}</li>`}</ul>`:
        `<p>${t('The image was decoded, but this format could not be evaluated for fraud.','चित्र पढ़ा गया, लेकिन इस फ़ॉर्मेट में धोखाधड़ी की जाँच नहीं हो सकी।')}</p>`}
      ${payeeMatches?`<p>${t('UPI ID matches the value you entered.','यूपीआई आईडी आपके दिए आईडी से मेल खाता है।')}</p>`:''}
      ${amountMatches?`<p>${t('The fixed amount matches the value you entered.','तय रकम आपके दिए अमाउंट से मेल खाती है।')}</p>`:''}
      ${comparison?.amountNotEncoded?`<p>${t('This code leaves the amount open. Check it in your official payment app.','कोड में रकम तय नहीं है। आधिकारिक भुगतान ऐप में जाँचें।')}</p>`:''}
      ${item.type==='payment'?`<div class="notice">${t('Confirm the recipient and amount independently in your official payment app. Receiving money does not require approving a payment.','प्राप्तकर्ता और रकम अपने आधिकारिक भुगतान ऐप में खुद जाँचें। पैसे पाने के लिए भुगतान मंज़ूर करने की ज़रूरत नहीं होती।')}</div>`:item.type==='link'?`<div class="notice">${t('Use the organization’s website or app that you already know. This scan did not open the address.','संस्था की परिचित वेबसाइट या ऐप इस्तेमाल करें। इस जाँच ने पता नहीं खोला।')}</div>`:''}
      </div>`;
  }).join('')}${saleScope ? `<div class="actions"><button type="button" class="primary" data-qr-save>${t('Save QR review to sale','क्यूआर समीक्षा बिक्री में सहेजें')}</button></div>` : ''}`;
}

export function qrPanel(hi) {
  const t=(en,hindi)=>say(hi,en,hindi);
  return `<div class="two-grid"><article class="card pane"><h2>${t('Upload a QR image','क्यूआर चित्र चुनें')}</h2>
    ${saleScope ? `<div class="notice qr-sale-context"><strong>${escape(saleScope.name)} · ${asMoney(saleScope.amount,hi)}</strong><div>${t('Pending sale · The expected amount comes from your ledger. Enter the intended recipient’s UPI ID if you know it independently.','लंबित बिक्री · अपेक्षित रकम बहीखाते से ली गई है। प्राप्तकर्ता की यूपीआई आईडी स्वतंत्र रूप से पता हो तो डालें।')}</div></div>` : ''}
    <p>${t('Screenshots and photos stay in this browser. Scanning never opens a link or starts a payment.','स्क्रीनशॉट और फ़ोटो इसी ब्राउज़र में रहते हैं। स्कैन से लिंक नहीं खुलता और भुगतान शुरू नहीं होता।')}</p>
    <form id="qr-scan">
      <label class="qr-file"><span>${t('QR image','क्यूआर चित्र')}</span><input id="qr-file" type="file" accept="image/png,image/jpeg,image/webp"><small id="qr-file-name">${file?.name?escape(file.name):'PNG, JPEG, WebP · 10 MB'}</small></label>
      <fieldset class="qr-expect"><legend>${saleScope?t('Compare to the sale','बिक्री से तुलना करें'):t('Compare a payment · optional','भुगतान की तुलना करें · वैकल्पिक')}</legend>
      <p>${t('Enter the UPI ID or amount you already know for this payment.','इस भुगतान का वह यूपीआई आईडी या रकम डालें जो आपको पहले से पता हो।')}</p>
      <label><span>${t('Expected UPI ID','अपेक्षित यूपीआई आईडी')}</span><input id="qr-payee" type="text" maxlength="321" value="${escape(payee)}" placeholder="merchant@provider" autocomplete="off" spellcheck="false"></label>
      <label><span>${t('Expected amount (₹)','अपेक्षित रकम (₹)')}</span><input id="qr-amount" type="text" maxlength="13" inputmode="decimal" value="${escape(amount)}" placeholder="2450.00" autocomplete="off" ${saleScope?'readonly':''}></label></fieldset>
      <button class="primary" type="submit" ${outcome?.state==='working'?'disabled':''}>${t('Scan QR','क्यूआर स्कैन करें')}</button>
    </form>
    ${(!saleScope || isDemoSale()) ? `<div class="qr-demos"><button type="button" class="secondary" data-qr-demo="payment">${saleScope ? t('Scan sample for this sale','इस बिक्री के लिए डेमो स्कैन करें') : t('Try payee mismatch','यूपीआई आईडी का अंतर आज़माएँ')}</button>${saleScope ? '' : `<button type="button" class="secondary" data-qr-demo="link">${t('Try suspicious link','संदिग्ध लिंक आज़माएँ')}</button>`}</div>` : ''}
    ${saleScope ? `<div class="actions"><button type="button" class="secondary" data-route="hub">${t('Back to sale review','बिक्री समीक्षा पर वापस जाएँ')}</button></div>` : ''}
  </article><article class="card pane"><h2>${t('QR assessment','क्यूआर आकलन')}</h2><div id="qr-outcome" aria-live="polite">${showOutcome(hi)}</div></article></div>`;
}

async function decodeImage(blob, signal) {
  if(blob.size>maxBytes) throw Error('size');
  const bytes=new Uint8Array(await blob.slice(0,12).arrayBuffer());
  const png=bytes.length>=8&&[137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n);
  const jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
  const webp=String.fromCharCode(...bytes.subarray(0,4))==='RIFF'&&String.fromCharCode(...bytes.subarray(8,12))==='WEBP';
  if(!png&&!jpeg&&!webp) throw Error('format');
  const bitmap=await createImageBitmap(blob);
  let image;
  try {
    const ratio=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(bitmap.width*ratio));
    canvas.height=Math.max(1,Math.round(bitmap.height*ratio));
    const ctx=canvas.getContext('2d',{alpha:false,willReadFrequently:true});
    ctx.fillStyle='#fff';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
    image=ctx.getImageData(0,0,canvas.width,canvas.height);
  } finally { bitmap.close(); }
  signal.throwIfAborted();
  return new Promise((resolve,reject)=>{
    const worker=new Worker(new URL('./qr-worker.js',import.meta.url),{type:'module'});
    const finish=()=>{
      clearTimeout(timeout);
      signal.removeEventListener('abort',onAbort);
      worker.terminate();
    };
    const onAbort=()=>{finish();reject(Error('abort'));};
    const timeout=setTimeout(()=>{finish();reject(Error('decode'));},15000);
    signal.addEventListener('abort',onAbort,{once:true});
    worker.onmessage=({data})=>{finish();if(data.failed) reject(Error('decode'));else resolve(data.codes);};
    worker.onerror=()=>{finish();reject(Error('decode'));};
    worker.postMessage({data:image.data,width:image.width,height:image.height},[image.data.buffer]);
  });
}

export function wireQrPanel(app, isActive, getHindi, saveForSale) {
  const paint=()=>{
    const target=document.querySelector('#qr-outcome');
    if(!isActive()||!target) return;
    target.innerHTML=showOutcome(getHindi());
    const submit=app.querySelector('#qr-scan button[type=submit]');
    if(submit) submit.disabled=outcome?.state==='working';
  };
  const resetOutcome=()=>{
    control?.abort();
    control=null;
    outcome=null;
    paint();
  };
  app.addEventListener('change',event=>{
    if(event.target.id!=='qr-file') return;
    file=event.target.files[0]||null;
    document.querySelector('#qr-file-name').textContent=file?.name||'PNG, JPEG, WebP · 10 MB';
    resetOutcome();
  });
  app.addEventListener('input',event=>{
    if(event.target.id==='qr-payee') payee=event.target.value;
    else if(event.target.id==='qr-amount' && !saleScope) amount=event.target.value;
    else return;
    resetOutcome();
  });
  async function run(demo) {
    resetOutcome();
    const request=new AbortController();
    control=request;
    outcome={state:'working'};
    paint();
    try {
      const expected=demo==='payment'?paymentExpectations('meera@demo',saleScope?amount:'2450.00'):
        demo?paymentExpectations():paymentExpectations(payee,amount);
      let source=file;
      if(demo) {
        const response=await fetch('./demos/'+demoFiles[demo],{signal:request.signal});
        if(!response.ok) throw Error('demo');
        source=await response.blob();
      }
      if(!source) throw Error('file');
      const codes=await decodeImage(source,request.signal);
      if(control===request) outcome=codes.length ? {state:'done',demo,reports:codes.map(code=>assessQr(code,expected))} : {state:'noCode'};
    } catch(error) {
      const known=['file','size','format','expectedPayee','expectedAmount','demo'];
      if(control===request) outcome={state:known.includes(error.message)?error.message:'decode'};
    } finally {
      if(control===request) {control=null;paint();}
    }
  }
  app.addEventListener('submit',event=>{
    if(event.target.id!=='qr-scan') return;
    event.preventDefault();
    void run();
  });
  app.addEventListener('click',event=>{
    if(event.target.closest('[data-qr-save]') && saleScope && outcome?.state==='done') {
      saveForSale(saleScope,outcome.reports,Boolean(outcome.demo));
      return;
    }
    const demo=event.target.closest('[data-qr-demo]')?.dataset.qrDemo;
    if(demo && Object.hasOwn(demoFiles,demo) && (!saleScope || (demo==='payment' && isDemoSale()))) void run(demo);
  });
}
