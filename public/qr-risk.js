import { assess } from './moneyshield.js';

const MAX_PAYLOAD = 4000;
const vpaPattern = /^[a-z0-9._+-]{1,256}@[a-z0-9_-]{1,64}$/i;
const hiddenControls = /[\u0000-\u001f\u007f\u00ad\u061c\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/u;
const amountPaise = value=>{
  if(!/^\d{1,10}(?:\.\d{1,2})?$/.test(value)) return null;
  const [whole,fraction='']=value.split('.');
  const paise=Number(whole)*100+Number(fraction.padEnd(2,'0'));
  return paise>0 ? paise : null;
};

export function paymentExpectations(payee='',amount='') {
  const id = payee.trim();
  const total = amount.trim();
  if(id&&!vpaPattern.test(id)) throw Error('expectedPayee');
  if(total&&amountPaise(total)===null) throw Error('expectedAmount');
  return {payee:id.toLowerCase(),amount:total?amountPaise(total):null};
}

const signalWeights = {
  qrPayeeMismatch:88, qrAmountMismatch:76, qrAmbiguous:72, qrInvalid:62, qrHidden:60,
  qrAction:55, qrInsecure:26, qrInvalidLink:38, qrPay:27
};
export const qrSignals = {
  qrPayeeMismatch:['The encoded UPI ID differs from the one you entered.','क्यूआर का यूपीआई आईडी आपके दिए आईडी से अलग है।'],
  qrAmountMismatch:['The encoded amount differs from the amount you entered.','क्यूआर की रकम आपके दिए अमाउंट से अलग है।'],
  qrAmbiguous:['The payment has conflicting or repeated fields.','भुगतान के कुछ फ़ील्ड दोहराए गए हैं या आपस में अलग हैं।'],
  qrInvalid:['The payment contains missing, invalid, or unsupported fields.','भुगतान के कुछ फ़ील्ड गायब, अमान्य या असमर्थित हैं।'],
  qrInvalidLink:['The address is malformed or its destination could not be read.','लिंक का प्रारूप गलत है या उसका गंतव्य पढ़ा नहीं जा सका।'],
  qrHidden:['The code contains invisible or direction-changing characters.','कोड में छिपे या दिशा बदलने वाले अक्षर हैं।'],
  qrAction:['The code can trigger an app, device action, or payment authorization.','कोड कोई ऐप, डिवाइस कार्रवाई या भुगतान अनुमति शुरू कर सकता है।'],
  qrInsecure:['The website uses an unencrypted HTTP connection.','वेबसाइट बिना एन्क्रिप्शन वाले HTTP कनेक्शन का उपयोग करती है।'],
  qrPay:['Scanning this in a payment app can prepare a transfer to the encoded UPI ID.','भुगतान ऐप में यह स्कैन करने से कोड में दिए यूपीआई आईडी को पैसे भेजने की तैयारी हो सकती है।']
};

function risk(keys, existing=null) {
  const signals=[...new Set([...keys,...(existing?.signals || [])])];
  const score=Math.min(100,(existing?.score || 0)+keys.reduce((sum,key)=>sum+signalWeights[key],0));
  return {signals,score,level:score>=60?'high':score>=25?'medium':'low'};
}

function paymentReport(url,raw,expected,indicators) {
  const fields = new Map();
  const repeated = new Set();
  const paymentKeys=['pa','pn','am','cu'];
  for(const [key,value] of url.searchParams) {
    const name=key.toLowerCase();
    if(!paymentKeys.includes(name)) continue;
    if(fields.has(name)) repeated.add(name);
    fields.set(name,value);
  }
  if(repeated.size) indicators.push('qrAmbiguous');
  const payee=repeated.has('pa') ? '' : fields.get('pa') || '';
  const name=repeated.has('pn') ? '' : fields.get('pn') || '';
  const fixedAmount=fields.get('am');
  const currency=fields.get('cu');
  const amount=fixedAmount===undefined || repeated.has('am') || repeated.has('cu') || (currency!==undefined&&currency!=='INR') ? null : amountPaise(fixedAmount);
  const validPayee=vpaPattern.test(payee);
  const changedCase=[...url.searchParams.keys()].some(key=>paymentKeys.includes(key.toLowerCase())&&key!==key.toLowerCase());
  if(!validPayee || (fixedAmount!==undefined && amount===null) || (currency!==undefined && currency!=='INR') ||
    url.username || url.password || url.port || url.hash || changedCase || /%(?![a-f\d]{2})/i.test(raw)) indicators.push('qrInvalid');
  if([...fields.values()].some(value=>hiddenControls.test(value)||value.includes('\uFFFD'))) indicators.push('qrHidden');
  if(expected.payee&&validPayee&&payee.toLowerCase()!==expected.payee) indicators.push('qrPayeeMismatch');
  if(expected.amount!==null&&amount!==null&&amount!==expected.amount) indicators.push('qrAmountMismatch');
  indicators.push('qrPay');
  return {
    type:'payment', name:name.replace(new RegExp(hiddenControls.source,'gu'),'').slice(0,160), payee:validPayee?payee:'', amount,
    comparison:{payeeCompared:Boolean(expected.payee&&validPayee), amountCompared:expected.amount!==null&&amount!==null,
      amountNotEncoded:expected.amount!==null&&fixedAmount===undefined},
    risk:risk([...new Set(indicators)])
  };
}

export function assessQr(raw, expected = paymentExpectations()) {
  if(typeof raw!=='string' || !raw.trim() || raw.length>MAX_PAYLOAD) return {type:'unassessed'};
  const payload=raw.trim();
  const indicators=hiddenControls.test(payload)?['qrHidden']:[];
  if(/^(?:wifi:|mecard:|begin:vcard|sms:|smsto:|tel:|mailto:|geo:|otpauth:)/i.test(payload)) return {type:'unassessed',privatePayload:true};
  const normalized=payload.replace(/^(?:gpay|tez):\/\/upi\/pay(?=[?/#]|$)/i, 'upi://pay');
  let url = null;
  const urlText=/^(?:https?:\/\/|[a-z][a-z\d+.-]*:\/\/|(?:javascript|data|vbscript):)/i.test(normalized) ? normalized :
    /^[^\s@:/]+(?:\.[^\s@:/]+)+\.[a-z]{2,}(?:[/?#]\S*)?$|^[^\s@:/]+\.[a-z]{2,}(?:[/?#]\S*)?$/i.test(payload) ? 'https://'+payload : null;
  if(urlText) {
    try { url=new URL(urlText); } catch { /* Return an inconclusive link result below. */ }
  }
  if (url?.protocol==='upi:' && url.hostname.toLowerCase()==='pay' && ['', '/'].includes(url.pathname)) return paymentReport(url,payload,expected,indicators);
  if (/^upi:/i.test(payload) || /^(?:gpay|tez):\/\/upi\//i.test(payload)) {
    if(/\b(?:mandate|autopay|collect)\b/i.test(payload)) return {type:'action',risk:risk([...indicators,'qrAction','qrPay'])};
    return {type:'action',risk:risk([...indicators,'qrAction','qrInvalid'])};
  }
  if(url && ['http:','https:'].includes(url.protocol)) {
    if(url.protocol==='http:') indicators.push('qrInsecure');
    return {type:'link', host:url.host, risk:risk(indicators,assess(payload))};
  }
  if(urlText) return {type:'action',risk:risk(url?[...indicators,'qrAction']:[...indicators,'qrInvalidLink'])};
  return {type:'unassessed'};
}
