const weights = {
  secretRequest: 64, secretEntry: 38, receiveTrap: 73, collectApproval: 35,
  refundDemand: 56, proofPressure: 44, kycPressure: 32, contactAfterAlert: 31, agent: 24,
  remoteAccess: 50, appInstall: 60, advanceFee: 54, deliveryFee: 37, legalThreat: 62,
  accountUpdate: 22, urgent: 10,
  scheme: 65, schemeOther: 25, paymentLink: 27, urlCredentials: 62, lookalike: 53, ipAddress: 25,
  idn: 12, mixedHost: 34, short: 12, http: 9, lure: 9, malformed: 12
};

const credential = String.raw`\b(?:o[\s.-]?t[\s.-]?p|one[ -]time (?:password|passcode|code)|(?:upi[\s-]*)?pin|m[\s-]?pin|c[\s.]?v[\s.]?v|pass(?:word|code)|(?:security|verification|login) code|(?:debit |credit )?card (?:number|details)|net[ -]?banking password)\b|ओ[\s.]?टी[\s.]?पी|(?:यूपीआई[\s-]*)?पिन|सीवीवी|पासवर्ड|सुरक्षा कोड|वेरिफिकेशन कोड|कार्ड(?: नंबर| की जानकारी)`;
const deliver = String.raw`\b(?:send|share|reply(?: with)?|tell|text|forward|disclose|give|provide|dictate|dm|read (?:out|back)|message (?:me|us|the agent))\b|भेज(?:ें|ो|ना| दीजिए)|बत(?:ाएँ|ाएं|ाओ|ा दें|ाइए)|शेयर कर(?:ें|ो|ना| दें)|दे दीजिए|साझा कर(?:ें|ो)|\b(?:bhej(?:o|iye|na| do)|bat(?:ao|aiye|a do)|de do|share karo)\b`;
const enter = String.raw`\b(?:enter|type|input|submit|fill in)\b|डाल(?:ें|ो|ना| दीजिए)|दर्ज़ कर(?:ें|ो)|दर्ज कर(?:ें|ो)|भर(?:ें|ो)|\b(?:daal(?:o|iye|na| do)|dalo|bharo)\b`;
const receive = String.raw`\b(?:(?:receive|collect|release|get|claim|accept|unlock) (?:the |your |my |this )?(?:money|funds|payment|refund|cashback|credit)|(?:money|payment|refund|cashback) (?:is )?(?:pending|on hold|to receive))\b|पैस(?:े|ा) (?:पाने|लेने|मिलने)|भुगतान (?:पाने|प्राप्त करने)|रिफंड (?:पाने|लेने)|राशि (?:पाने|जारी करने)|\b(?:paise|paisa|payment|refund) (?:lene|paane|pane|receive karne)\b`;
const scanQr = String.raw`\b(?:scan|use|open)\b.{0,24}\bqr(?: code)?\b|क्यूआर.{0,18}स्कैन|\bqr.{0,18}scan\b`;
const approve = String.raw`\b(?:approve|accept|authori[sz]e|confirm|tap (?:yes|approve))\b|मंज़ूर|मंजूर|स्वीकार|अप्रूव|\bapprove kar(?:o|na)\b`;
const collect = String.raw`\b(?:collect|payment|debit|autopay|mandate|upi) (?:request|mandate)\b|(?:कलेक्ट|पेमेंट|भुगतान) (?:रिक्वेस्ट|अनुरोध)`;
const payment = String.raw`\b(?:payment|upi|bank|wallet|funds|deposit|refund|cashback|transfer|balance|transaction)\b|यूपीआई|बैंक|खात[ाे]|वॉलेट|बैलेंस|पैसे|राशि|भुगतान|रिफंड|\b(?:paisa|paise|khata)\b`;
const returnMoney = String.raw`\b(?:send (?:it |the money |the amount )?back|return (?:it|the money|the funds|the amount)|refund (?:it|me|the money|the transfer|to)|reverse (?:it|the transfer|the payment))\b|पैसे (?:वापस|लौटा)|राशि (?:वापस|लौटा)|वापस भेज|\b(?:paise? wapas|wapas bhej|waapis bhej)\w*`;
const wrongTransfer = String.raw`\b(?:wrong (?:upi|number|account|transfer|recipient)|incorrect (?:transfer|account)|accidental(?:ly)? (?:sent|transfer|deposit)|transferred by mistake|sent (?:it |you )?.{0,32}by mistake|mistaken (?:transfer|payment|deposit)|reimbursement)\b|गलती से.{0,40}(?:भेज|पैसे|ट्रांसफर|जमा)|गलत (?:नंबर|खाते|यूपीआई)|\b(?:galti se|galat (?:account|number|upi))\b`;
const proof = String.raw`\b(?:screenshot|payment proof|proof of payment|receipt)\b|स्क्रीनशॉट|भुगतान का सबूत|रसीद`;
const releaseGoods = String.raw`\b(?:hand over|release|dispatch|ship|deliver|give me) (?:the |my |your )?(?:goods|order|parcel|item|product|package)\b|सामान .{0,14}(?:दे दो|भेज)|ऑर्डर भेज|\b(?:dispatch|deliver) kardo\b`;
const avoidVerification = /\b(?:no need to (?:check|verify)|(?:do not|don['’]t) (?:check|verify)|do not wait|don't wait|bank.{0,24}(?:catch up|update later|settle later)|balance.{0,24}(?:update|show).{0,12}later)\b|जाँच की ज़रूरत नहीं|चेक मत करो|बैलेंस बाद में/i;
const account = String.raw`\b(?:kyc|(?:bank |wallet |upi )?account|aadhaa?r|sim(?: card)?|electricity)\b|के[ -]?वाई[ -]?सी|खात[ाे]|सिम|आधार|बिजली`;
const pressure = String.raw`\b(?:block(?:ed|ing)?|suspend(?:ed|ing)?|freez(?:e|en)|clos(?:e|ed)|deactivat(?:e|ed|ion)|disconnect(?:ed|ion)?|expir(?:e|es|ed|ing)|restrict(?:ed|ion)?)\b|ब्लॉक|बंद|निलंबित|निष्क्रिय|\b(?:band ho|block ho)\b`;
const urgency = /\b(?:urgent(?:ly)?|immediate(?:ly)?|act now|right now|within \d{1,3} (?:min(?:ute)?s?|hours?)|last chance|final warning|by midnight|today only)\b|तुरंत|तत्काल|अभी|आखिरी चेतावनी|\b(?:turant|abhi|jaldi)\b/iu;
const kyc = /\bkyc\b|के[ -]?वाई[ -]?सी/iu;
const externalAction = /\b(?:click|tap|follow|visit|call|whatsapp|reply|contact|dial|download|(?:use|open) (?:this |the )?link|complete.{0,16}here|update.{0,12}here)\b|क्लिक|फोन करें|कॉल|लिंक खोल|व्हाट्सऐप|\b(?:link kholo|call karo)\b/iu;
const agentRole = /\b(?:i(?:'m| am) (?:an? |your )?(?:(?:bank|mobile money|wallet|upi|rbi|customer support) )?(?:agent|officer|representative)|(?:calling|message) from (?:the )?(?:bank|support team|rbi|mobile money|wallet)|(?:bank|rbi|upi|wallet|mobile money) (?:support|helpdesk|agent|officer)|customer care)\b|बैंक (?:अधिकारी|एजेंट|सपोर्ट)|आरबीआई अधिकारी|बैंक से बोल|\bbank se bol\w*/iu;
const installAction = /\b(?:install|download|sideload|run|open|start|enable|allow|give access|connect)\b|इंस्टॉल|डाउनलोड|चलाएँ|एक्सेस दें|\b(?:install|download) kar\w*/iu;
const remoteTool = /\b(?:anydesk|teamviewer|quicksupport|remote (?:access|control)|screen[ -]shar(?:e|ing)|share (?:your |the )?screen)\b|स्क्रीन शेयर|रिमोट (?:एक्सेस|कंट्रोल)/iu;
const bait = /\b(?:prize|lottery|reward|refund|cashback|loan|grant|job|investment|scholarship|winnings)\b|इनाम|लॉटरी|रिफंड|कैशबैक|लोन|ऋण|नौकरी|निवेश/iu;
const requestedFee = /\b(?:(?:pay|send|deposit|transfer|submit) .{0,32}(?:fee|charge)|(?:fee|charge) (?:is )?(?:due|required) (?:first|before|to)|(?:fee|charge) upfront)\b|(?:फ़ीस|फीस|शुल्क).{0,26}(?:जमा|भेज|चुक|दे)|\bfee (?:do|de do|pehle)\b/iu;
const fee = /\b(?:advance fee|registration fee|processing fee|release fee|activation fee|verification fee|upfront fee|fee first|fee upfront|pay (?:the |a |a small )?fee|payment required to release)\b|(?:पहले|अग्रिम) .{0,22}(?:फ़ीस|फीस|शुल्क)|(?:प्रोसेसिंग|रजिस्ट्रेशन) (?:फ़ीस|फीस|शुल्क)|\bfee (?:do|de do|pehle)\b/iu;
const delivery = /\b(?:parcel|package|shipment|delivery|courier|customs)\b|पार्सल|कूरियर|डिलीवरी/iu;
const deliveryIssue = /\b(?:undelivered|failed|held|reschedule|redeliver(?:y)?|address.{0,20}(?:incomplete|missing|update|wrong)|(?:delivery|redelivery|customs) (?:fee|charge))\b|पता.{0,20}(?:गलत|अपडेट)|डिलीवरी.{0,20}शुल्क/iu;
const debitAlert = /\b(?:debited|withdraw(?:al|n)|unauthori[sz]ed (?:payment|transaction|debit))\b|खाते से.{0,30}(?:कटे|काट)|डेबिट|निकासी/iu;
const messageContact = /\b(?:call|dial|whatsapp|text|contact)\b.{0,46}(?:\+?\d[\s()-]*){7,}|(?:कॉल|फोन|व्हाट्सऐप).{0,28}(?:\+?\d[\s()-]*){7,}/iu;
const legal = /\b(?:digital arrest|arrest warrant|police case|frozen by police|money laundering case)\b|डिजिटल गिरफ्तारी|गिरफ्तारी का वारंट/iu;
const demandMoney = /\b(?:send|transfer|pay|deposit)\b.{0,36}\b(?:money|funds|amount|rupees|fee|security deposit|bank account)\b|पैसे भेज|राशि जमा|\bpaise bhej/iu;

const pair = (first, second, distance) => new RegExp(`(?:${first})[^\\n]{0,${distance}}(?:${second})|(?:${second})[^\\n]{0,${distance}}(?:${first})`, 'iu');
const inMessage = source=>new RegExp(source,'iu');
const hasPayment = inMessage(payment);
const mentionsReceipt = inMessage(receive);
const mentionsWrongTransfer = inMessage(wrongTransfer);
const asksToReturnMoney = inMessage(returnMoney);
const mentionsProof = inMessage(proof);
const asksToReleaseGoods = inMessage(releaseGoods);
const asksForSecret = pair(deliver, credential, 42);
const confirmsSecret = pair(String.raw`\b(?:confirm|verify)\b|पुष्टि करें`, credential, 28);
const sharingChannel = /\bwith (?:me|us|(?:(?:our|the|your) )?(?:customer (?:care|support)|support team|agent|officer|caller))\b|(?:हमारे|इस) (?:एजेंट|सपोर्ट) को/iu;
const asksToEnter = pair(enter, credential, 36);
const receivingWithPin = pair(String.raw`(?:${enter})[^\n]{0,25}(?:\b(?:upi[ -]?)?pin\b|यूपीआई पिन|पिन)`, receive, 58);
const receivingWithQr = pair(scanQr, receive, 55);
const receivingWithCollect = pair(collect, receive, 54);
const approvalRequest = pair(approve, collect, 40);
const pressuredAccount = pair(account, pressure, 45);
const demandsRefund = pair(wrongTransfer, returnMoney, 105);

const cautionAction = String.raw`(?:share|send|reply|tell|text|give|provide|disclose|enter|type|fill|submit|scan|approve|authori[sz]e|accept|install|download|click|pay|transfer|return)`;
const preventativeAdvice = new RegExp(String.raw`^(?:(?:security (?:tip|reminder|alert)|for your (?:security|safety)|please(?: note)?)[,:\s]+)*(?:(?:never|do not|don['’]t|no need to|avoid)\s+(?:ever\s+)?${cautionAction}\b|कभी\s+(?:भी\s+)?(?:किसी|ओटीपी|पिन|अपना|शेयर)|किसी को.{0,34}(?:मत|न)\s*(?:बत|दें)|(?:अपना\s+)?(?:ओटीपी|पिन|पासवर्ड).{0,40}(?:मत|नहीं|न)\s*(?:बत|शेयर|दें|कर|डाल))|\b(?:will|would|shall|does|do)\s+(?:not|never)\s+(?:ever\s+)?(?:ask|request)\b|\b(?:never asks?|is not required)\b`, 'iu');
const negatedRequest = new RegExp(String.raw`\b(?:never|do not|don['’]t|without|not required to)\s+(?:ever\s+)?${cautionAction}\b[^.;!?\n]{0,46}|(?:ओटीपी|पिन|पासवर्ड)[^।!?\n]{0,30}(?:शेयर न करें|न बताएं|मत बताओ|न डालें)`, 'giu');

const informationalCredential = new RegExp(String.raw`\b(?:(?:i|we) (?:will|can|(?:am|are) going to)|(?:i|we)['’]ll) (?:send|share|give|forward|text)\b[^\n.;]{0,45}?(?:${credential})|\b(?:someone|scammers?|fraudsters?|people) (?:may|might|could) (?:ask|tell) you to (?:send|share|enter|give|reply with)\b[^\n.;]{0,42}?(?:${credential})|(?:${deliver})[^\n.;]{0,28}?(?:${credential}) (?:with (?:no one|nobody)|to nobody)\b`, 'giu');

const shortenedDomains = new Set(['bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'cutt.ly', 'rebrand.ly', 'goo.gl', 'ow.ly', 'shorturl.at', 'rb.gy', 'tiny.cc', 'lnkd.in']);
const protectedDomains = ['rbi.org.in', 'npci.org.in', 'sbi.co.in', 'onlinesbi.sbi', 'hdfcbank.com', 'icicibank.com', 'axisbank.com', 'phonepe.com', 'paytm.com', 'uidai.gov.in', 'incometax.gov.in'];
const protectedBrand = /(?:^|[.-])(?:hdfcbank|icicibank|axisbank|onlinesbi|phonepe|paytm|uidai|incometax|bankofbaroda|npci)(?:[.-]|$)/i;
const accountPath = /(?:^|[./_?=&#-])(?:kyc|verify|verification|refund|claim|confirm|login|secure|unlock|validate)(?:$|[./_?=&#-])/i;
// Plain hostnames are recognized conservatively so email addresses and ordinary text are not scanned as links.
const linkPattern = /(?:[a-z][a-z\d+.-]*:\/\/)[^\s<>"'“”‘’]+|(?<![\p{L}\p{N}_@.\-])(?:www\.)?(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]{0,61}[\p{L}\p{N}])?\.)+(?:com|in|net|org|biz|xyz|top|app|io|co|ly|gl|me|cc|info|site|online|live|link|click|dev|shop|test|example|[a-z]{2}|xn--[a-z\d-]{2,59})(?![\p{L}\p{N}_@-])(?::\d{1,5})?(?:[/?#][^\s<>"'“”‘’]*)?/giu;
const apk = /\.apk(?=$|[?&#\s)\].,;!])/iu;

function inspectLinks(input, mark) {
  const urlText = input.replace(/\bhxxp(s?):(?=\/\/)/gi, 'http$1:')
    .replace(/\[(?:\s*\.\s*)\]|\(\.\)|[。．｡](?=[\p{L}\p{N}])/gu, '.');
  const links = new Set();
  const message = urlText.replace(linkPattern, candidate=>{ links.add(candidate); return ' '; });
  let routeToApp = false;
  if (/(?:^|\s|[("'\[])(?:(?:javascript|vbscript)\s*:\s*\S|data:[^\s,]*,\S)/iu.test(urlText)) mark('scheme');
  for (const candidate of links) {
    const token = candidate.replace(/[.,;!?>}]+$/u, '').replace(/\)+$/u, '').replace(/(?<!\[[a-f\d:]+)\]$/iu, '');
    const explicit = /^[a-z][a-z\d+.-]*:\/\//i.test(token);
    try {
      const url = new URL(explicit ? token : 'https://' + token);
      const host = url.hostname.toLowerCase().replace(/\.$/, '');
      if (url.protocol === 'upi:') {
        routeToApp = true;
        mark('paymentLink');
        continue;
      }
      if (!['http:', 'https:'].includes(url.protocol)) {
        mark(['intent:', 'javascript:', 'vbscript:', 'data:', 'file:'].includes(url.protocol) ? 'scheme' : 'schemeOther');
        continue;
      }
      if (url.protocol === 'http:') mark('http');
      if (url.username || url.password) mark('urlCredentials');
      if (/^(?:\d{1,3}\.){3}\d{1,3}$|^\[/.test(host)) mark('ipAddress');
      if (/(?:^|\.)xn--/.test(host)) mark('idn');
      const originalHost = token.replace(/^[a-z][a-z\d+.-]*:\/\//i, '').split(/[/?#]/, 1)[0].split('@').at(-1);
      if (originalHost.split('.').some(part=>/[a-z]/i.test(part) && /[\p{Script=Cyrillic}\p{Script=Greek}]/u.test(part))) mark('mixedHost');
      if (shortenedDomains.has(host.replace(/^www\./, ''))) mark('short');
      const path = url.pathname + url.search;
      const lure = accountPath.test(host + path);
      if (lure) mark('lure');
      const knownRoot = protectedDomains.some(root=>host===root || host.endsWith('.' + root));
      const rootInside = protectedDomains.some(root=>('.'+host+'.').includes('.'+root+'.'));
      if (!knownRoot && (rootInside || (lure && protectedBrand.test(host)))) mark('lookalike');
      if (apk.test(url.pathname)) mark('appInstall');
    } catch {
      mark('malformed');
    }
  }
  return { hasLink: links.size>0, routeToApp, message };
}

function activeWording(input) {
  return input.split(/\n+|[!;?।]+|\.(?=\s)|,(?=\s*(?:never|do not|don['’]t|कभी))|\b(?:but|however)\b|लेकिन|मगर/iu)
    .map(clause=>clause.trim())
    .filter(clause=>clause && !preventativeAdvice.test(clause))
    .map(clause=>clause.replace(negatedRequest, '').replace(informationalCredential, ''))
    .join('\n');
}

export function assess(raw) {
  const source = String(raw ?? '').trim();
  if (!source || source.length>4000) throw Error('scan');
  const input = source.normalize('NFKC').replace(/[\u00AD\u061C\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/gu, '')
    .replace(/[०-९]/g, digit=>String(digit.charCodeAt(0)-0x966));
  if (!input.trim()) throw Error('scan');

  const signals = new Set();
  const mark = key=>signals.add(key);
  const {hasLink, routeToApp, message} = inspectLinks(input, mark);
  const wording = activeWording(message.replace(/\bo[ ._-]+t[ ._-]+p\.?(?=\s|$)/giu, 'OTP'));
  const linkedAction = externalAction.test(wording) && hasLink;
  const receiveContext = mentionsReceipt.test(wording);
  const timed = urgency.test(wording);
  const agentText = agentRole.test(wording);
  const urgentKyc = timed && kyc.test(wording);
  const accountThreat = pressuredAccount.test(wording);

  if (asksForSecret.test(wording) || (confirmsSecret.test(wording) && sharingChannel.test(wording))) mark('secretRequest');
  const receiveTrap = receivingWithPin.test(wording) || receivingWithQr.test(wording) ||
    (receivingWithCollect.test(wording) && approvalRequest.test(wording)) ||
    (receiveContext && routeToApp && linkedAction);
  if (receiveTrap) mark('receiveTrap');
  if (approvalRequest.test(wording) && !receiveTrap) mark('collectApproval');
  if (asksToEnter.test(wording) && !receiveTrap && (linkedAction || agentText || accountThreat || urgentKyc)) mark('secretEntry');
  if (demandsRefund.test(wording) || (mentionsWrongTransfer.test(wording) && asksToReturnMoney.test(wording))) mark('refundDemand');
  const paymentClaimed = /\b(?:already paid|payment (?:sent|received|done)|i(?:'ve| have) paid)\b|भुगतान हो गया|\bpayment ho gaya\b/iu.test(wording);
  if (asksToReleaseGoods.test(wording) && ((mentionsProof.test(wording) && (timed || paymentClaimed)) ||
    ((mentionsProof.test(wording) || paymentClaimed) && avoidVerification.test(input)))) mark('proofPressure');

  if ((accountThreat && (externalAction.test(wording) || timed || hasLink || signals.has('secretRequest'))) ||
    (urgentKyc && (linkedAction || signals.has('secretEntry') || signals.has('secretRequest')))) mark('kycPressure');
  else if (linkedAction && /\b(?:update (?:your )?kyc|verify (?:your )?(?:account|identity)|complete (?:your )?kyc)\b|केवाईसी (?:अपडेट|पूरी)|खाते का सत्यापन/iu.test(wording)) mark('accountUpdate');
  if (agentText && (signals.has('secretRequest') || signals.has('secretEntry') || signals.has('refundDemand') || (hasPayment.test(wording) && (externalAction.test(wording) || demandMoney.test(wording))))) mark('agent');
  if (remoteTool.test(wording) && (installAction.test(wording) || /share (?:your|the) screen|स्क्रीन शेयर/iu.test(wording))) mark('remoteAccess');
  if (installAction.test(wording) && apk.test(wording)) mark('appInstall');
  if (bait.test(wording) && fee.test(wording) && (requestedFee.test(wording) || linkedAction)) mark('advanceFee');
  if (delivery.test(wording) && deliveryIssue.test(wording) && (linkedAction || demandMoney.test(wording) || fee.test(wording))) mark('deliveryFee');
  if (debitAlert.test(wording) && messageContact.test(wording)) mark('contactAfterAlert');
  if (legal.test(wording) && demandMoney.test(wording)) mark('legalThreat');
  if (timed && [...signals].some(key=>weights[key]>=22 && !['ipAddress','paymentLink'].includes(key))) mark('urgent');

  // Order explanations by contribution. Save these IDs and a score, never the pasted text or links.
  const reasons = [...signals].sort((a,b)=>weights[b]-weights[a]);
  const score = Math.min(100, reasons.reduce((sum,key)=>sum+weights[key],0));
  return { score, signals:reasons, level:score>=60?'high':score>=25?'medium':'low', version:2 };
}
