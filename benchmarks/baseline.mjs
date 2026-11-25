// Original MoneyShield detector, before the dataset review. Used for comparison only.
export function assessBaseline(raw) {
  const input = String(raw ?? '').trim().normalize('NFKC').replace(/[\u200B-\u200F\u2060\uFEFF]/g, '');
  if (!input || input.length > 4000) throw Error('scan');
  const checks = new Map();
  const add = (key, weight) => checks.set(key, weight);
  if (/(?:\b(?:otp|upi\s*pin|cvv|password|pin)\b|ओटीपी|यूपीआई\s*पिन|पासवर्ड|पिन)/iu.test(input)) add('secret', 40);
  if (/(?:urgent|immediately|within \d+|act now|blocked|तुरंत|तत्काल|ब्लॉक)/iu.test(input)) add('urgent', 15);
  if (/(?:kyc|account suspended|verify your account|केवाईसी|खाता बंद)/iu.test(input)) add('kyc', 20);
  if (/(?:payment received|release (?:the )?(?:money|payment)|collect request|पैसे मिले|भुगतान प्राप्त)/iu.test(input)) add('claim', 20);
  let urls = input.match(/(?:[a-z][a-z\d+.-]*:\/\/|www\.)[^\s<>"']+|\b(?:[a-z\d-]+\.)+(?:com|in|net|org|xyz|top|app|io|co|ly|gl|example)(?:\/[^\s<>"']*)?/gi) || [];
  for (const value of urls) {
    const token = value.replace(/[.,;!?)\]]+$/, '');
    try {
      const url = new URL(token.includes('://') ? token : 'https://' + token);
      if (!['http:', 'https:'].includes(url.protocol)) add('scheme', 45);
      if (url.protocol === 'http:') add('http', 15);
      if (url.username || url.password || /(?:^|\.)xn--|^(?:\d+\.){3}\d+$|^\[/.test(url.hostname)) add('host', 30);
      if (['bit.ly','tinyurl.com','t.co','is.gd','cutt.ly','rebrand.ly','goo.gl','ow.ly'].includes(url.hostname)) add('short', 20);
      if (/(?:verify|secure|kyc|refund|claim|confirm|login)/i.test(url.hostname + url.pathname)) add('lure', 15);
    } catch { add('malformed', 20); }
  }
  const score = Math.min(100, [...checks.values()].reduce((a, b) => a + b, 0));
  return { score, signals: [...checks.keys()], level: score >= 60 ? 'high' : score >= 25 ? 'medium' : 'low' };
}
