import { assess, attachSaleQrReview, blank, confirmSale, totals, today, sample, clean, paisa, id } from './core.js';
import { topics, signals, safetyActions } from './guide.js';
import { assistantPage, wireAssistant, clearAssistant } from './assistant.js';
import { qrPanel, wireQrPanel, clearQrPanel, prepareSaleQr } from './qr-panel.js';
import { qrSignals } from './qr-risk.js';

const key = 'arthsaathi.v1';
const isolatedDemo = new URLSearchParams(location.search).get('demo')==='sale-qr';
const receiptSample = 'Payment received: ₹2,450. Demo reference TX-2450. Check your transaction history in your UPI app.';
const app = document.querySelector('#app');
let state;
let storageError = false;
try { if(!isolatedDemo) state = JSON.parse(localStorage.getItem(key)); } catch { storageError = true; }
state = isolatedDemo ? blank(true) : state?.entries && state?.sales ? state : null;
let hi = state?.language === 'hi';
let mode = state?.mode === 'personal' ? 'personal' : 'business';
let route = isolatedDemo ? 'hub' : 'overview';
let shieldMode = 'message';
let period = 7;
let draft = '';
let result = null;
let selectedTopic = 'upi';
let selectedSale = isolatedDemo ? 'demo-sale' : '';
let api = false;
let answer = '';
let busy = false;
let toastTimer;

const t = (en, hindi) => hi ? hindi : en;
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const money = n => new Intl.NumberFormat(hi ? 'hi-IN' : 'en-IN', {style:'currency',currency:'INR',maximumFractionDigits:2, minimumFractionDigits:n % 100 ? 2 : 0}).format(n / 100);
const dateText = (date, options = {day:'numeric',month:'short'}) => new Intl.DateTimeFormat(hi ? 'hi-IN' : 'en-IN', options).format(new Date(date + 'T12:00:00'));
const month = () => today().slice(0, 7);
const layouts = () => [
  ['overview','▦',t('Overview','अवलोकन')], ['shield','◇','MoneyShield'], ['manager','▥','MoneyManager'],
  ['guide','◫','MoneyGuide'], ['hub','⌘',t('Intelligence Hub','इंटेलिजेंस हब')], ['assistant','✦',t('Ask ArthSaathi','ArthSaathi से पूछें')]
];
const section = (title, details) => `<div class="section-head"><h1>${title}</h1><p>${details}</p></div>`;
const btn = (action, label, cls = '') => `<button type="button" class="${cls}" data-action="${action}">${label}</button>`;
const nav = (target, label, cls = '') => `<button type="button" class="${cls}" data-route="${target}">${label}</button>`;
const marker = row => row.demo ? `<span class="tag">${t('Demo','डेमो')}</span>` : '';
const topicText = words => words[hi ? 1 : 0];

function persist(next) {
  state = next;
  if(isolatedDemo) return;
  try {
    localStorage.setItem(key, JSON.stringify(state));
    storageError = false;
  } catch { storageError = true; }
}
function toast(text) {
  const el = document.querySelector('#toast');
  el.textContent = text;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.textContent = ''; }, 4500);
}
function navigate(target) {
  if(route==='shield' && target!=='shield') clearQrPanel();
  route = target;
  render();
  window.scrollTo(0, 0);
  document.querySelector('#main')?.focus();
}
function label(text, field) {return `<label><span>${text}</span>${field}</label>`;}
function submit(text) {return `<button class="primary" type="submit">${text}</button>`;}
function logo() {return `<div class="brand"><img src="./mark.svg" alt=""><div>Arth<span>Saathi</span><small>${t('YOUR MONEY COMPANION','आपका आर्थिक साथी')}</small></div></div>`;}
function onboarding() {
  return `<main class="welcome" id="main" tabindex="-1"><div class="welcome-top">${logo()}${btn('language',t('हिन्दी','English'),'secondary')}</div><div class="welcome-content">
    <span class="eyebrow">HACKNOVA 2026 · TRACK 1</span>
    <h1>${t('Take charge of your everyday money.','अपने रोज़ के पैसों की कमान संभालें।')}</h1>
    <p>${t('Spot suspicious payment messages, keep a simple ledger, and know what to do before handing over a sale.','संदिग्ध भुगतान संदेश पहचानें, सरल बहीखाता रखें और बिक्री पूरी करने से पहले सही कदम जानें।')}</p>
    <div class="welcome-buttons">${btn('demo',t('Explore demo','डेमो देखें'),'primary')}${btn('empty',t('Start empty','खाली शुरुआत'),'secondary')}</div>
    <a href="./mentor.html" class="outline project-evidence">${t('Why ArthSaathi?','ArthSaathi क्यों?')}</a>
    <a href="./build-evidence.html" class="outline project-evidence">${t('Covexcode CLI used for QA · View evidence','Covexcode CLI से QA · प्रमाण देखें')}</a>
    <small>${t('The demo uses fictional records. Your workspace stays in this browser.','डेमो में काल्पनिक रिकॉर्ड हैं। आपका डेटा इसी ब्राउज़र में रहता है।')}</small>
    </div><footer>THE SOLVERS · HACKNOVA TRACK 1</footer></main>`;
}
function render() {
  document.documentElement.lang = hi ? 'hi' : 'en';
  document.querySelector('.skip').textContent = t('Skip to content','मुख्य सामग्री पर जाएँ');
  if (!state) { app.innerHTML = onboarding(); return; }
  const pages = {overview, shield, manager, guide, hub, report, privacy, assistant:()=>assistantPage(hi, api)};
  app.innerHTML = `<div class="layout"><aside class="sidebar">${logo()}
    <div class="side-caption">${t('WORKSPACE','कार्यक्षेत्र')}</div>
    <nav aria-label="${t('Workspace','कार्यक्षेत्र')}">${layouts().map(([name, icon, title]) => `<button type="button" data-route="${name}" ${name === route ? 'aria-current="page"' : ''}><span class="nav-icon" aria-hidden="true">${icon}</span>${title}</button>`).join('')}</nav>
    <div class="side-bottom"><div class="side-caption">${t('SUPPORT','सहायता')}</div><nav aria-label="${t('Support','सहायता')}">${nav('report',`<span class="nav-icon" aria-hidden="true">⊕</span>${t('Report fraud','धोखाधड़ी की शिकायत')}`)}${nav('privacy',`<span class="nav-icon" aria-hidden="true">⚙</span>${t('Privacy & data','गोपनीयता और डेटा')}`)}</nav>
    <div class="team"><span>TS</span><div>The Solvers<small>HackNova · Track 1</small></div></div></div></aside>
    <div class="workspace"><header class="top"><div class="crumb"><b>ArthSaathi</b><span> / </span>${layouts().find(row=>row[0]===route)?.[2] || (route==='report'?t('Report fraud','धोखाधड़ी की शिकायत'):t('Privacy & data','गोपनीयता और डेटा'))}</div><div class="top-actions">${state.demo ? `<span class="demo-dot">${isolatedDemo?t('Isolated demo','अलग डेमो'):t('Demo workspace','डेमो कार्यक्षेत्र')}</span>` : ''}${btn('language',t('हिन्दी','English'),'secondary language')}</div></header>
    <main id="main" tabindex="-1">${isolatedDemo?`<div class="demo-context"><span>${t('Fictional example. Refresh to start over.','काल्पनिक उदाहरण। फिर से शुरू करने के लिए रिफ्रेश करें।')}</span><a href="./">${t('Exit guided demo','गाइडेड डेमो से बाहर निकलें')}</a></div>`: ''}${storageError ? `<p role="alert" class="notice">${t('Browser storage is unavailable. Changes may be lost on reload.','ब्राउज़र स्टोरेज उपलब्ध नहीं है। पेज दोबारा खोलने पर बदलाव मिट सकते हैं।')}</p>` : ''}${pages[route]()}</main>
    <footer class="foot">${t('ArthSaathi · Built by The Solvers','ArthSaathi · The Solvers द्वारा निर्मित')}<a href="./mentor.html">${t('Why ArthSaathi?','ArthSaathi क्यों?')}</a><a href="./build-evidence.html">${t('Covexcode CLI · QA evidence','Covexcode CLI · QA प्रमाण')}</a><span>HackNova 2026 / Track 1</span></footer></div></div>`;
}
function modeSwitch() {
  return `<div class="seg" aria-label="${t('Ledger mode','बहीखाता मोड')}">${['business','personal'].map(value=>`<button type="button" data-mode="${value}" aria-pressed="${mode===value}">${value==='business'?t('Business','व्यवसाय'):t('Personal','व्यक्तिगत')}</button>`).join('')}</div>`;
}
function stats() {
  const {income, expense, due, net} = totals(state, mode, month());
  return `<div class="stats">${[
    ['↗',t('Money in','आमदनी'),income,t('This month','इस महीने'),'mint'],
    ['↙',t('Money out','खर्च'),expense,t('This month','इस महीने'),'peach'],
    ['≋',t('Net cash flow','शुद्ध नकदी प्रवाह'),net,t('Income minus expenses','आमदनी घटा खर्च'),'lavender'],
    ...(mode==='business' ? [['◷',t('Pending dues','बकाया'),due,t('All open sales','सभी लंबित बिक्री'),'sand']] : [])
  ].map(([icon,title,value,meta,tone])=>`<article class="card stat"><span class="stat-icon ${tone}" aria-hidden="true">${icon}</span><p>${title}</p><strong>${money(value)}</strong><small>${meta}</small></article>`).join('')}</div>`;
}
function chart() {
  const groups = Array.from({length:period}, (_,i)=>{
    const date = today(i+1-period);
    const records = state.entries.filter(row=>row.mode===mode&&row.date===date);
    return {date, income:records.reduce((a,r)=>a+(r.type==='income'?r.amount:0),0),expense:records.reduce((a,r)=>a+(r.type==='expense'?r.amount:0),0)};
  });
  const peak = Math.max(1,...groups.flatMap(g=>[g.income,g.expense]));
  return `<article class="card chart-card"><div class="card-head"><div><h2>${t('Cash flow','नकदी प्रवाह')}</h2><p>${t('Daily income and expenses','दैनिक आमदनी और खर्च')}</p></div><select id="period" aria-label="${t('Chart period','चार्ट अवधि')}"><option value="7" ${period===7?'selected':''}>${t('Last 7 days','पिछले 7 दिन')}</option><option value="14" ${period===14?'selected':''}>${t('Last 14 days','पिछले 14 दिन')}</option></select></div>
    <div class="legend"><span>${t('Income','आमदनी')}</span><span>${t('Expenses','खर्च')}</span></div>
    <div class="chart" style="--count:${period}">${groups.map((g,i)=>`<div class="barcol"><button type="button" class="bars" data-chart="${i}" data-label="${esc(dateText(g.date))} · ${t('Income','आमदनी')} ${money(g.income)} · ${t('Expenses','खर्च')} ${money(g.expense)}" aria-label="${esc(dateText(g.date))} · ${t('Income','आमदनी')} ${money(g.income)} · ${t('Expenses','खर्च')} ${money(g.expense)}"><i style="--height:${100*g.income/peak}%"></i><i style="--height:${100*g.expense/peak}%"></i></button><small>${period===7||i%2 ? dateText(g.date,{weekday:period===7?'short':'narrow'}) : ''}</small></div>`).join('')}</div>
    <p class="chart-detail" id="chart-detail" role="status">${t('Select a day for exact amounts.','सटीक राशि के लिए दिन चुनें।')}</p></article>`;
}
function overview() {
  return `<div class="hero"><div><span class="eyebrow">${t('YOUR FINANCIAL WORKSPACE','आपका आर्थिक कार्यक्षेत्र')}</span><h1>${t('Your money, in focus.','आपके पैसों की साफ़ तस्वीर।')}</h1><p>${t('Track what comes in, see what goes out, and check suspicious payments before you act.','आमदनी और खर्च देखें, और किसी संदिग्ध भुगतान पर कदम उठाने से पहले उसकी जाँच करें।')}</p><div class="hero-actions">${btn('open-message',t('Check a message','संदेश जाँचें'),'primary')}${nav('manager',t('Open ledger','बहीखाता खोलें'),'outline')}${nav('assistant',t('Ask ArthSaathi','ArthSaathi से पूछें'),'outline')}</div></div><div class="hero-art" aria-hidden="true"><div class="orbit"></div><div class="orbit two"></div><div class="orbit three"></div><div class="hero-mark"><img src="./mark.svg" alt=""></div><i></i><b></b></div></div>
    <a class="secondary project-evidence" href="./mentor.html">${t('Why ArthSaathi?','ArthSaathi क्यों?')}</a>
    <a class="secondary project-evidence" href="./build-evidence.html">${t('Covexcode CLI used for QA · View evidence','Covexcode CLI से QA · प्रमाण देखें')}</a><div class="overview-title"><h2>${t('Financial snapshot','आर्थिक झलक')}</h2>${modeSwitch()}</div>${stats()}<div class="dashboard-grid">${chart()}<article class="card spotlight"><span class="stat-icon mint" aria-hidden="true">⌘</span><h2>${t('Intelligence Hub','इंटेलिजेंस हब')}</h2><p>${t('Compare a QR against an open sale, then record credit after checking your own bank app.','क्यूआर की लंबित बिक्री से तुलना करें और बैंक ऐप में जमा देखने के बाद पुष्टि दर्ज करें।')}</p><div class="spot-count"><strong>${state.sales.filter(s=>s.status==='pending').length}</strong> ${t('sales awaiting payment','बिक्री के भुगतान बाकी')}</div>${nav('hub',t('Open Intelligence Hub','इंटेलिजेंस हब खोलें'),'secondary')}</article></div>`;
}
function riskReasons(scan) {
  return scan.signals.flatMap(key=>Object.hasOwn(signals,key)?[topicText(signals[key])]:[]);
}
function showRisk(scan) {
  const label = {high:t('High risk','अधिक जोखिम'),medium:t('Review before acting','कदम उठाने से पहले जाँचें'),low:t('Few or no signals','कम या कोई संकेत नहीं')};
  const reasons = riskReasons(scan);
  const action = safetyActions.find(([keys])=>keys.some(key=>scan.signals.includes(key)))?.[1];
  const details = scan.version===2 ? t('Risk indicator score. Check the claim independently before acting.','जोखिम संकेतों का स्कोर। कदम उठाने से पहले दावे की खुद जाँच करें।') :
    t('Saved result from the earlier detector. Rescan to use the updated checks.','पुराने डिटेक्टर का सहेजा परिणाम। नए नियमों से दोबारा जाँच सकते हैं।');
  return `<div class="risk ${scan.level}"><div class="risk-score"><strong>${scan.score}</strong><span>/ 100</span></div><div><h3>${label[scan.level]}</h3><p>${details}</p></div></div>
  <ul class="signal-list">${reasons.map(reason=>`<li>${reason}</li>`).join('') || `<li>${t('No matching indicators in this text. A receipt or message alone cannot confirm payment.','इस टेक्स्ट में कोई संकेत नहीं मिला। रसीद या संदेश से अकेले भुगतान की पुष्टि नहीं होती।')}</li>`}</ul>
  <div class="notice"><strong>${t('What to do','अगला कदम')}</strong><div>${action ? topicText(action) : t('Open the bank or UPI app you normally use to check the claim or incoming credit.','दावा या जमा राशि जाँचने के लिए अपना नियमित बैंक या यूपीआई ऐप खोलें।')}</div></div>`;
}
function assessment() {
  return result ? `${showRisk(result)}<div class="actions">${nav('hub',t('Link to a sale','बिक्री से जोड़ें'),'primary')}${nav('report',t('Reporting help','शिकायत सहायता'),'secondary')}</div>` :
    `<div class="empty">${t('Run a check to see the score, matched signals and next step.','स्कोर, मिले संकेत और अगला कदम देखने के लिए जाँच चलाएँ।')}</div>`;
}
function shield() {
  const control = `<div class="seg shield-modes" aria-label="${t('Scan type','स्कैन का प्रकार')}">
    <button type="button" data-action="shield-message" aria-pressed="${shieldMode==='message'}">${t('Message or link','संदेश या लिंक')}</button>
    <button type="button" data-action="shield-qr" aria-pressed="${shieldMode==='qr'}">${t('QR check','क्यूआर जाँच')}</button>
  </div>`;
  const intro = section('MoneyShield', t('Check messages, links, or QR codes for explainable scam indicators.','संदेश, लिंक या क्यूआर कोड में धोखाधड़ी के संकेत और कारण देखें।'));
  if(shieldMode==='qr') return intro+control+qrPanel(hi);
  return `${intro}${control}
    <div class="two-grid"><article class="card pane"><h2>${t('Message & link check','संदेश और लिंक जाँच')}</h2><p>${t('Analysis runs in this browser. Links are never opened.','जाँच इसी ब्राउज़र में होती है। लिंक नहीं खोले जाते।')}</p>
    <form id="scan">${label(t('Paste a message or URL','संदेश या यूआरएल चिपकाएँ'),`<textarea name="message" required maxlength="4000" rows="6" placeholder="${t('Paste the suspicious text here…','संदिग्ध संदेश यहाँ चिपकाएँ…')}">${esc(draft)}</textarea>`)}<div class="actions">${submit(t('Check for risk','जोखिम जाँचें'))}${btn('sample',t('Use demo scam','डेमो धोखा लें'),'secondary')}${btn('sample-receipt',t('Use demo receipt','डेमो रसीद लें'),'secondary')}</div></form></article>
    <article class="card pane"><h2>${t('Risk assessment','जोखिम आकलन')}</h2><div id="scan-result" aria-live="polite">${assessment()}</div></article></div>
    ${state.keepScans ? `<article class="card pane spaced"><h2>${t('Scan history','जाँच का इतिहास')}</h2><p>${t('Scores and matching indicators only.','केवल स्कोर और मिले संकेत।')}</p>${state.scans.map(s=>`<div class="line"><span>${dateText(s.date)} · ${riskReasons(s).join(' ') || t('No matches','कोई संकेत नहीं')}</span><b>${s.score}/100</b></div>`).join('') || `<p>${t('No saved checks.','कोई सहेजी जाँच नहीं।')}</p>`}</article>` : ''}`;
}
function manager() {
  const {entries, expense} = totals(state, mode, month());
  const budget = state.budgets?.[month()]?.[mode];
  const fieldName = `<input name="name" required maxlength="80">`;
  const fieldMoney = `<input name="amount" required inputmode="decimal" placeholder="0.00" pattern="[0-9]{1,8}([.][0-9]{1,2})?">`;
  const fieldDate = `<input name="date" type="date" required max="${today()}" value="${today()}">`;
  return `<div class="overview-title page-title">${section('MoneyManager',t('Track personal and business finances in separate ledgers.','व्यक्तिगत और व्यवसाय के पैसों के अलग बहीखाते रखें।'))}${modeSwitch()}</div>
    ${stats()}<div class="dashboard-grid spaced">${chart()}<article class="card pane"><h2>${t('Monthly spending budget','मासिक खर्च बजट')}</h2><p>${budget ? `${money(expense)} / ${money(budget)} · ${Math.round(expense/budget*100)}%` : t('Set a spending limit for this month.','इस महीने की खर्च सीमा तय करें।')}</p>
    ${budget ? `<progress aria-label="${t('Budget usage','बजट उपयोग')}" max="${budget}" value="${Math.min(expense,budget)}"></progress>` : ''}
    <form id="budget">${label(t('Budget amount (₹)','बजट राशि (₹)'),fieldMoney)}${submit(t('Save budget','बजट सहेजें'))}</form></article></div>
    <div class="two-grid spaced"><article class="card pane"><h2>${t('Add a ledger entry','बहीखाते में दर्ज करें')}</h2><form id="entry">${label(t('Description','विवरण'),fieldName)}
    ${label(t('Type','प्रकार'),`<select name="type"><option value="income">${t('Income','आमदनी')}</option><option value="expense">${t('Expense','खर्च')}</option></select>`)}
    ${label(t('Amount (₹)','राशि (₹)'),fieldMoney)}${label(t('Date','तारीख'),fieldDate)}${submit(t('Save entry','रिकॉर्ड सहेजें'))}</form></article>
    ${mode==='business' ? `<article class="card pane"><h2>${t('Customer dues · Digital khata','ग्राहक का बकाया · डिजिटल खाता')}</h2><p>${t('Add an unpaid sale. It stays outside cash flow until confirmation.','अवैतनिक बिक्री जोड़ें। पुष्टि तक यह नकदी प्रवाह में शामिल नहीं होगी।')}</p><form id="sale">${label(t('Customer or sale name','ग्राहक या बिक्री का नाम'),fieldName)}${label(t('Amount due (₹)','बकाया राशि (₹)'),fieldMoney)}${label(t('Sale date','बिक्री की तारीख'),fieldDate)}${submit(t('Add pending sale','लंबित बिक्री जोड़ें'))}</form>${nav('hub',t('View customer dues','ग्राहक का बकाया देखें'),'secondary spaced')}</article>` : ''}</div>
    <article class="card pane spaced"><h2>${t('Ledger entries','बहीखाता रिकॉर्ड')}</h2><p>${t('All recorded dates','सभी दर्ज तारीखें')}</p>
    ${[...totals(state,mode).entries].sort((a,b)=>b.date.localeCompare(a.date)).map(e=>`<div class="line"><div><b>${esc(e.name)}</b> ${marker(e)}<small>${dateText(e.date)} · ${e.type==='income'?t('Income','आमदनी'):t('Expense','खर्च')}</small></div><strong class="${e.type}">${e.type==='income'?'+':'−'}${money(e.amount)}</strong></div>`).join('') || `<div class="empty">${t('No entries yet.','अभी कोई रिकॉर्ड नहीं।')}</div>`}</article>`;
}
function qrReviewLabel(review) {
  return {
    high:t('High risk','अधिक जोखिम'),
    medium:t('Review before acting','कदम उठाने से पहले जाँचें'),
    low:t('Few or no signals','कम या कोई संकेत नहीं'),
    unassessed:t('Inconclusive','नतीजा स्पष्ट नहीं')
  }[review.level];
}
function saleQrReview(review) {
  if(!review) return '';
  const reasons=review.signals.flatMap(key=>{
    const label=qrSignals[key] || signals[key];
    return label ? [`<li>${topicText(label)}</li>`] : [];
  });
  return `<section class="qr-reading" aria-label="${t('Saved QR review','सहेजी क्यूआर समीक्षा')}">
    <div class="qr-reading-head"><h3>${t('Saved QR review','सहेजी क्यूआर समीक्षा')}</h3><span class="qr-badge ${review.level==='unassessed'?'medium':review.level}">${qrReviewLabel(review)}</span></div>
    <p>${dateText(review.date)} · ${review.codeCount} ${t('decoded QR code(s)','पढ़े गए क्यूआर कोड')}</p>
    ${reasons.length?`<ul class="signal-list">${reasons.join('')}</ul>`:''}
    ${review.inconclusive?`<p>${t('At least one decoded code could not be assessed.','कम से कम एक पढ़े गए कोड की जाँच पूरी नहीं हुई।')}</p>`:''}
  </section>`;
}
function hub() {
  const pending = state.sales.filter(s=>s.status==='pending');
  const sale = state.sales.find(s=>s.id===selectedSale);
  const isPending = sale?.status==='pending';
  return `${section(t('Financial Intelligence Hub','वित्तीय इंटेलिजेंस हब'),t('Review a QR or payment message against a sale before recording incoming credit.','जमा राशि दर्ज करने से पहले क्यूआर या भुगतान संदेश की बिक्री से तुलना करें।'))}
    <div class="step-strip"><span>1 · ${t('Choose a sale','बिक्री चुनें')}</span><span>2 · ${t('Review the QR or message','क्यूआर या संदेश जाँचें')}</span><span>3 · ${t('Confirm incoming credit','जमा की पुष्टि करें')}</span></div>
    <div class="two-grid"><article class="card pane"><h2>${t('Customer dues','ग्राहक का बकाया')}</h2>
    ${state.sales.map(s=>`<div class="line"><div><b>${esc(s.name)}</b> ${marker(s)}<small>${s.status==='pending'?t('Pending','लंबित'):t('User-confirmed','उपयोगकर्ता ने पुष्टि की')}${s.risk ? ' · ' + t('Linked message risk','जुड़ा संदेश जोखिम') + ' ' + s.risk.score + '/100' : ''}${s.qrReview ? ' · QR ' + qrReviewLabel(s.qrReview) : ''}</small></div><div class="due-end"><strong>${money(s.amount)}</strong>${btn('select:'+esc(s.id),t('Review','समीक्षा'),'text-btn')}</div></div>`).join('') || `<p>${t('No customer dues. Add a pending sale in MoneyManager.','ग्राहक का कोई बकाया नहीं। MoneyManager में लंबित बिक्री जोड़ें।')}</p>`}
    <div class="spaced"><h3>${t('Message check','संदेश जाँच')}</h3>
    ${result && pending.length ? `<p>${t('Current MoneyShield assessment','मौजूदा MoneyShield आकलन')} · <b>${result.score}/100</b></p>
    <form id="link">${label(t('Pending sale','लंबित बिक्री'),`<select name="sale" required><option value="">${t('Choose a sale','बिक्री चुनें')}</option>${pending.map(s=>`<option value="${esc(s.id)}" ${s.id===selectedSale?'selected':''}>${esc(s.name)} · ${money(s.amount)}</option>`).join('')}</select>`)}${submit(t('Link risk summary','जोखिम सारांश जोड़ें'))}</form>` : btn('open-message',t('Check a message','संदेश जाँचें'),'secondary spaced')}</div></article>
    <article class="card pane"><h2 tabindex="-1" id="sale-review-title">${t('Sale review','बिक्री समीक्षा')}</h2>
    ${sale ? `<p><b>${esc(sale.name)}</b> · ${money(sale.amount)} ${marker(sale)}</p>
    ${isPending ? `<div class="actions">${btn('sale-qr',t(sale.qrReview?'Scan another QR for this sale':'Check a QR for this sale',sale.qrReview?'इस बिक्री का दूसरा क्यूआर जाँचें':'इस बिक्री के लिए क्यूआर जाँचें'),'secondary')}</div>` : ''}
    ${saleQrReview(sale.qrReview)}
    ${sale.risk ? showRisk(sale.risk) : ''}
    ${isPending ? `<section class="spaced"><h3>${t('Confirm credit manually','खुद जमा राशि की पुष्टि करें')}</h3><p>${t('Open your own bank or UPI app and check for an incoming credit matching the sale. Leave the sale pending if the credit is missing.','अपने बैंक या यूपीआई ऐप में बिक्री से मेल खाती जमा राशि देखें। रकम जमा न हुई हो तो बिक्री लंबित रखें।')}</p>
    <form id="confirm"><label class="check"><input type="checkbox" name="checked" required><span>${sale.demo ? t('For this fictional demo, simulate that I personally checked the incoming credit.','इस काल्पनिक डेमो में मानें कि मैंने स्वयं जमा राशि देखी।') : t('I personally checked the incoming credit in my bank or UPI app.','मैंने बैंक या यूपीआई ऐप में खुद जमा राशि देखी है।')}</span></label>${submit(sale.demo?t('Record demo confirmation','डेमो पुष्टि दर्ज करें'):t('Record my confirmation','मेरी पुष्टि दर्ज करें'))}</form></section>` : `<div class="notice">${t('User-confirmed credit recorded in the business ledger.','उपयोगकर्ता द्वारा पुष्टि की गई जमा राशि व्यवसाय के बहीखाते में दर्ज है।')}</div><div class="actions">${btn('open-business-ledger',t('View business ledger','व्यवसाय का बहीखाता देखें'),'secondary')}</div>`}`
    : `<div class="empty">${t('Choose a sale to review its QR and any linked message.','क्यूआर और जुड़े संदेश की जाँच के लिए बिक्री चुनें।')}</div>`}
    <p>${t('ArthSaathi does not contact your bank or initiate a payment.','ArthSaathi बैंक से संपर्क नहीं करता और भुगतान शुरू नहीं करता।')}</p>
    ${nav('guide',t('Read UPI safety guide','यूपीआई सुरक्षा गाइड पढ़ें'),'secondary')}</article></div>`;
}
function guide() {
  const topic = topics.find(item=>item.id===selectedTopic);
  return `${section('MoneyGuide',t('Practical money guidance from official Indian sources.','भारत के आधिकारिक स्रोतों से पैसे से जुड़ी व्यावहारिक सलाह।'))}
    <div class="topic-grid">${topics.map(item=>`<button type="button" class="card topic" data-topic="${item.id}" aria-pressed="${item.id===selectedTopic}"><span class="stat-icon mint" aria-hidden="true">${item.icon}</span><b>${topicText(item.title)}</b><small>${item.source}</small></button>`).join('')}</div>
    <article class="card pane spaced"><h2>${topicText(topic.title)}</h2><p>${topicText(topic.body)}</p><a class="secondary link" href="${topic.url}" target="_blank" rel="noopener noreferrer">${t('Read source','स्रोत पढ़ें')} · ${topic.source}</a></article>
    <article class="card pane spaced"><h2>${t('Optional AI explanation','वैकल्पिक एआई व्याख्या')}</h2><p>${api ? t('With your consent, your question and the selected lesson are sent to the configured AI provider. Keep personal and financial details out.','आपकी सहमति से प्रश्न और चुना पाठ एआई प्रदाता को भेजे जाते हैं। निजी या वित्तीय जानकारी न डालें।') : t('AI is disabled here. The sourced lessons above work without it.','यहाँ एआई बंद है। ऊपर दिए गए स्रोत आधारित पाठ इसके बिना चलते हैं।')}</p>
    ${api ? `<form id="ask">${label(t('Question about this lesson','इस पाठ के बारे में प्रश्न'),'<textarea name="question" required maxlength="500" rows="3"></textarea>')}<label class="check"><input name="consent" type="checkbox" required><span>${t('Send this question to the AI provider.','यह प्रश्न एआई प्रदाता को भेजें।')}</span></label><button type="submit" class="primary" ${busy?'disabled':''}>${busy?t('Waiting for provider…','प्रदाता की प्रतीक्षा…'):t('Ask AI','एआई से पूछें')}</button></form>
    ${answer ? `<div class="notice answer" role="status">${esc(answer)}</div>` : ''}` : ''}</article>`;
}
function report() {
  const topic = topics.find(s=>s.id==='report');
  return `${section(t('Report financial fraud','वित्तीय धोखाधड़ी की शिकायत'),t('Official reporting channels for India.','भारत में शिकायत के आधिकारिक माध्यम।'))}
    <article class="card pane"><h2>${t('Act quickly if money was lost','पैसे कटे हों तो तुरंत कदम उठाएँ')}</h2><p>${topicText(topic.body)}</p>
    <div class="actions"><a class="primary link" href="tel:1930">${t('Call 1930','1930 पर कॉल करें')}</a><a class="secondary link" href="${topic.url}" target="_blank" rel="noopener noreferrer">${t('Open official reporting portal','आधिकारिक शिकायत पोर्टल खोलें')}</a></div></article>`;
}
function privacy() {
  if(isolatedDemo) return `${section(t('Privacy & data','गोपनीयता और डेटा'),t('This fictional demo resets on refresh. Your usual workspace is separate.','यह काल्पनिक डेमो रिफ्रेश पर फिर से शुरू होता है। आपका सामान्य कार्यक्षेत्र अलग है।'))}<a class="secondary" href="./">${t('Open my workspace','मेरा कार्यक्षेत्र खोलें')}</a>`;
  return `${section(t('Privacy & data','गोपनीयता और डेटा'),t('Choose what stays on this device.','चुनें कि इस डिवाइस पर क्या सहेजा जाए।'))}
    <div class="two-grid"><article class="card pane"><h2>${t('On this browser','इस ब्राउज़र पर')}</h2><p>${t('The ledger, dues, budgets and linked risk summaries are saved in this browser. Raw scan text stays in memory until cleared or the page closes. QR images and decoded details clear when you leave the QR screen. An exported copy contains your saved records.','बहीखाता, बकाया, बजट और जुड़े जोखिम सारांश इसी ब्राउज़र में रहते हैं। जाँच का मूल संदेश साफ़ करने या पेज बंद करने तक मेमोरी में रहता है। क्यूआर स्क्रीन छोड़ते ही चित्र और पढ़ी गई जानकारी हट जाती है। निर्यात में सहेजे रिकॉर्ड होते हैं।')}</p>
    <label class="check"><input id="history" type="checkbox" ${state.keepScans?'checked':''}><span>${t('Keep scan summaries on this device','जाँच सारांश इस डिवाइस पर रखें')}</span></label>
    <div class="actions">${btn('export',t('Export my data','मेरा डेटा निर्यात करें'),'secondary')}${btn('clear-scan',t('Clear current scan','मौजूदा जाँच साफ़ करें'),'secondary')}</div></article>
    <article class="card pane"><h2>${t('Delete workspace','कार्यक्षेत्र मिटाएँ')}</h2><p>${t('This removes all ArthSaathi records from this browser and returns to onboarding.','इससे इस ब्राउज़र से ArthSaathi के सभी रिकॉर्ड मिट जाएँगे और शुरुआती स्क्रीन खुलेगी।')}</p>${btn('delete',t('Delete local data','स्थानीय डेटा मिटाएँ'),'danger')}</article></div>`;
}

app.addEventListener('input', e => {
  if (e.target.name!=='message') return;
  draft=e.target.value;
  if (result) {
    result=null;
    document.querySelector('#scan-result').innerHTML=assessment();
  }
});
app.addEventListener('change', e => {
  if (e.target.id==='period') { period=Number(e.target.value); render(); document.querySelector('#period')?.focus(); }
  if (e.target.id==='history') {
    const enabled=e.target.checked;
    persist({...state,keepScans:enabled,scans:enabled?state.scans:[]});
    if (storageError) render();
  }
});
app.addEventListener('click', e => {
  const b=e.target.closest('button');
  if (!b) return;
  const {action,route:target,mode:nextMode,topic,chart:chartDay,label:detail} = b.dataset;
  if (target) { if (target==='guide' && route==='hub') selectedTopic='upi'; navigate(target); }
  if (nextMode) { mode=nextMode; persist({...state,mode}); render(); document.querySelector(`[data-mode="${mode}"]`)?.focus(); }
  if (chartDay!==undefined) document.querySelector('#chart-detail').textContent=detail;
  if (topic) { selectedTopic=topic; answer=''; render(); document.querySelector(`[data-topic="${topic}"]`)?.focus(); }
  if (action==='language') { hi=!hi; if(state) persist({...state,language:hi?'hi':'en'}); render(); document.querySelector('[data-action="language"]')?.focus(); }
  if (action==='demo'||action==='empty') { mode='business'; persist({...blank(action==='demo'),language:hi?'hi':'en',mode}); navigate('overview'); }
  if (action==='shield-message' || action==='shield-qr') {
    const next = action==='shield-qr'?'qr':'message';
    if(next===shieldMode) return;
    if(next==='message') clearQrPanel();
    shieldMode=next;
    render();
    document.querySelector(`[data-action="${action}"]`)?.focus();
  }
  if (action==='sample' || action==='sample-receipt') { draft=action==='sample' ? sample : receiptSample; result=null; render(); document.querySelector('[name="message"]').focus(); }
  if (action?.startsWith('select:')) { selectedSale=action.slice(7); render(); document.querySelector('#sale-review-title')?.focus(); }
  if(action==='open-message') { clearQrPanel(); shieldMode='message'; navigate('shield'); }
  if(action==='open-business-ledger') { mode='business'; persist({...state,mode}); navigate('manager'); }
  if(action==='sale-qr') {
    const sale=state.sales.find(s=>s.id===selectedSale && s.status==='pending');
    if(sale) { prepareSaleQr(sale); shieldMode='qr'; navigate('shield'); }
  }
  if (action==='clear-scan') { draft=''; result=null; toast(t('Current scan cleared.','मौजूदा जाँच साफ़ है।')); }
  if (action==='export') {
    const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));
    const download=document.createElement('a'); download.href=url; download.download='arthsaathi-data.json'; download.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  if (action==='delete' && window.confirm(t('Permanently delete this browser’s ArthSaathi data?','इस ब्राउज़र से ArthSaathi का डेटा हमेशा के लिए मिटाएँ?'))) {
    try { if(!isolatedDemo) localStorage.removeItem(key); } catch { toast(t('Browser blocked data deletion.','ब्राउज़र ने डेटा मिटाने से रोका।')); return; }
    clearAssistant(); state=null; draft=''; result=null; selectedSale=''; answer=''; navigate('overview');
  }
});
app.addEventListener('submit', async e => {
  e.preventDefault();
  const form=e.target;
  if(form.id==='assistant-form'||form.id==='qr-scan') return;
  const data=new FormData(form);
  const get=name=>clean(data.get(name));
  const type=form.id;
  try {
    if (type==='scan') {
      draft=get('message'); result=assess(draft);
      if(state.keepScans) persist({...state,scans:[{...result,date:today()},...state.scans].slice(0,30)});
    }
    if (type==='entry'||type==='sale') {
      const name=get('name'), date=get('date'), amount=paisa(get('amount'));
      if(!name||name.length>80||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)||date>today()) throw Error('field');
      const row={ id:id(), name, date, amount, demo:state.demo };
      if(type==='entry') persist({...state,entries:[{...row,mode,type:get('type')==='expense'?'expense':'income'},...state.entries]});
      else if(mode==='business') persist({...state,sales:[{...row,status:'pending'},...state.sales]});
      toast(t('Record saved.','रिकॉर्ड सहेजा गया।'));
    }
    if (type==='budget') {
      const current=month();
      persist({...state,budgets:{...state.budgets,[current]:{...state.budgets[current],[mode]:paisa(get('amount'))}}});
      toast(t('Budget saved.','बजट सहेजा गया।'));
    }
    if (type==='link') {
      selectedSale=get('sale');
      if(!result||!state.sales.some(s=>s.id===selectedSale&&s.status==='pending')) throw Error('field');
      persist({...state,sales:state.sales.map(s=>s.id===selectedSale?{...s,risk:result}:s)});
      toast(t('Risk summary linked.','जोखिम सारांश जोड़ा गया।'));
    }
    if (type==='confirm') {
      persist(confirmSale(state,selectedSale,data.has('checked')));
      toast(t('Confirmation recorded and income added.','पुष्टि दर्ज हुई और आमदनी जुड़ी।'));
    }
    if(type==='ask' && api && !busy && data.has('consent')) {
      const question=get('question'), topic=selectedTopic;
      if(!question) throw Error('field');
      busy=true; answer=''; render();
      try {
        const res=await fetch('./api/guide',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,topic,language:hi?'hi':'en',consent:true})});
        const payload=await res.json();
        if(!res.ok||!payload.answer) throw Error('provider');
        if(selectedTopic===topic) answer=payload.answer;
      } catch { if(selectedTopic===topic) answer=t('AI is unavailable right now. The sourced lesson is above.','एआई अभी उपलब्ध नहीं है। स्रोत आधारित पाठ ऊपर है।'); }
      finally { busy=false; if(route==='guide') render(); }
      return;
    }
    render();
    if (type==='link' || type==='confirm') document.querySelector('#sale-review-title')?.focus();
    else if (type==='scan') document.querySelector('.risk')?.scrollIntoView({block:'nearest'});
  } catch {
    if (type==='scan') { toast(t('Enter a message or link of up to 4,000 characters.','चार हज़ार अक्षरों तक का संदेश या लिंक डालें।')); return; }
    toast(t('Check the required fields and use an amount greater than zero with up to two decimal places.','ज़रूरी फ़ील्ड देखें। राशि शून्य से अधिक हो और दशमलव के बाद अधिकतम दो अंक हों।'));
  }
});
window.addEventListener('storage', event=>{
  if (isolatedDemo || (event.key!==key && event.key!==null)) return;
  try {
    state=JSON.parse(localStorage.getItem(key));
    if(state) { mode=state.mode||'business'; hi=state.language==='hi'; }
    else { clearAssistant(); clearQrPanel(); route='overview'; draft=''; result=null; selectedSale=''; }
    render();
  } catch { storageError=true; render(); }
});
wireQrPanel(app, ()=>route==='shield'&&shieldMode==='qr'&&Boolean(state), ()=>hi, (scope,reports,demo)=>{
  try {
    const sale=state.sales.find(s=>s.id===scope.id && s.amount===scope.amount && s.status==='pending');
    if(!sale || scope.id!==selectedSale) throw Error('sale');
    persist(attachSaleQrReview(state,sale.id,reports,{demo}));
    navigate('hub');
    document.querySelector('#sale-review-title')?.focus();
    toast(t('QR review saved. The sale is still pending.','क्यूआर समीक्षा सहेजी गई। बिक्री अभी लंबित है।'));
  } catch {
    toast(t('This sale is no longer available for QR review.','इस बिक्री की क्यूआर समीक्षा अब उपलब्ध नहीं है।'));
  }
});
wireAssistant(app, render, ()=>route==='assistant' && Boolean(state));
render();
fetch('./api/status').then(r=>r.ok?r.json():null).then(value=>{api=value?.llm===true;if(['guide','assistant'].includes(route)) render();}).catch(()=>{});
