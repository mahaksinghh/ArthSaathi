import { copy } from './assistant-knowledge.js';

export function calculate(question) {
  const normalized = question.normalize('NFKC')
    .replace(/[०-९]/g, digit=>String(digit.charCodeAt(0)-0x966))
    .replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-')
    .replace(/^(?:what\s+is|calculate|solve)\s+/i,'');
  const expression = normalized.replace(/कितना(?: होता)? है|कितने होते हैं|किती(?: होतात| होते)?|क्या है/g,'').trim().replace(/[=?।]+$/,'').trim();
  if (!expression || expression.length>100 || !/[+*/-]/.test(expression) || !/^[\d.()+*/\s-]+$/.test(expression)) return null;
  const tokens = expression.match(/\d+(?:\.\d*)?|\.\d+|[()+*/-]/g) || [];
  let cursor=0;
  function factor() {
    const token=tokens[cursor++];
    if(token==='-') return -factor();
    if(token==='+') return factor();
    if(token==='(') {
      const value=sum();
      if(tokens[cursor++]!==')') throw Error('parenthesis');
      return value;
    }
    if(token===undefined || !/^[\d.]/.test(token)) throw Error('number');
    return Number(token);
  }
  function product() {
    let value=factor();
    while(tokens[cursor]==='*' || tokens[cursor]==='/') {
      const operator=tokens[cursor++];
      const right=factor();
      if(operator==='/' && right===0) throw new RangeError();
      value=operator==='*' ? value*right : value/right;
    }
    return value;
  }
  function sum() {
    let value=product();
    while(tokens[cursor]==='+' || tokens[cursor]==='-') {
      const operator=tokens[cursor++];
      const right=product();
      value=operator==='+' ? value+right : value-right;
    }
    return value;
  }
  try {
    const value=sum();
    if(cursor!==tokens.length) return null;
    return {expression,value:Number.isFinite(value) ? Number(value.toPrecision(14)) : null};
  } catch(error) {
    return error instanceof RangeError ? {expression,divisionByZero:true} : null;
  }
}

export const quickQuestions = {
  math:['What is 2 + 2?','2 + 2 कितना है?','2 + 2 किती?'],
  science:['Why is the sky blue?','आसमान नीला क्यों है?','आकाश निळे का असते?'],
  geography:['What is the capital of France?','फ्रांस की राजधानी क्या है?','फ्रान्सची राजधानी काय आहे?']
};
const facts = [
  {pattern:/^(?:(?:what is |define )?photosynthesis|प्रकाश संश्लेषण क्या है|प्रकाशसंश्लेषण काय आहे)$/iu,
    text:['Photosynthesis is how plants, algae, and some bacteria use light energy to make sugars. Plants use water and carbon dioxide in the process and release oxygen.','प्रकाश संश्लेषण में पौधे, शैवाल और कुछ जीवाणु प्रकाश ऊर्जा से शर्करा बनाते हैं। पौधे इस प्रक्रिया में पानी और कार्बन डाइऑक्साइड का उपयोग करते हैं और ऑक्सीजन छोड़ते हैं।','प्रकाशसंश्लेषणात वनस्पती, शैवाल आणि काही जीवाणू प्रकाशाच्या ऊर्जेने साखर तयार करतात. वनस्पती पाणी आणि कार्बन डायऑक्साइड वापरतात आणि ऑक्सिजन सोडतात.'],url:'https://science.nasa.gov/astrobiology/learning-resources/alp/what-does-life-need-for-survival/',source:'NASA'},
  {pattern:/^(?:(?:what is )?the capital (?:city )?of france|फ्रांस की राजधानी(?: क्या है)?|फ्रान्सची राजधानी(?: काय आहे)?)$/iu,
    text:['Paris is the capital of France.','पेरिस फ्रांस की राजधानी है।','पॅरिस ही फ्रान्सची राजधानी आहे।'],url:'https://european-union.europa.eu/principles-countries-history/eu-countries/france_fr',source:'European Union'},
  {pattern:/^(?:why is the sky blue|(?:आसमान|आकाश) नीला क्यों है|आकाश निळे का असते)$/iu,
    text:['The daytime sky looks blue because air molecules scatter shorter wavelengths of sunlight, such as blue, more strongly than longer wavelengths, such as red.','दिन में आसमान नीला दिखता है क्योंकि हवा के अणु सूर्य के प्रकाश की छोटी तरंगों, जैसे नीले रंग, को लाल जैसी लंबी तरंगों की तुलना में ज़्यादा बिखेरते हैं।','हवेचे रेणू सूर्यप्रकाशातील निळ्यासारख्या लहान तरंगलांबी लालसारख्या मोठ्या तरंगलांबीपेक्षा अधिक विखुरतात. त्यामुळे आकाश निळे दिसते।'],url:'https://spaceplace.nasa.gov/blue-sky/en/',source:'NASA'}
];
const indiaPm = /^(?:(?:(?:who is|name|tell me) )?(?:the )?(?:current )?(?:pm|prime minister) (?:of )?india(?: now)?|(?:who is )?india(?:'s|s) (?:current )?(?:pm|prime minister)|india (?:ka|ke) (?:pm|prime minister)(?: (?:kaun|kon)(?: hai| hain)?)?|भारत के (?:वर्तमान )?(?:प्रधानमंत्री|प्रधान मंत्री|पीएम)(?: कौन हैं?)?|भारताचे (?:सध्याचे )?पंतप्रधान(?: कोण आहेत)?)[?!.।]*$/iu;

export function generalAnswer(question, language) {
  const normalized=question.normalize('NFKC').trim().replace(/\s+/gu,' ');
  if(/^(?:hi+|hello+|hey+|yo+|namaste|namaskar|नमस्ते|नमस्कार)[!.?।]*$/iu.test(normalized)) {
    return {text:copy(language,'Hi! What would you like to know?','नमस्ते! आप क्या जानना चाहते हैं?','नमस्कार! तुम्हाला काय जाणून घ्यायचे आहे?')};
  }
  // Repair this common typo only within the office-and-country phrase.
  if(indiaPm.test(normalized.replace(/\b(pm|prime minister) od india\b/i,'$1 of India'))) {
    return {text:copy(language,
      'Narendra Modi is the Prime Minister of India, as verified on 25 November 2026.',
      '25 नवंबर 2026 की पुष्टि के अनुसार नरेंद्र मोदी भारत के प्रधानमंत्री हैं।',
      '२५ नोव्हेंबर २०२६ रोजी पडताळलेल्या माहितीनुसार नरेंद्र मोदी भारताचे पंतप्रधान आहेत.'),
      sources:[{url:'https://www.pmindia.gov.in/en/pms-profile/',title:'Prime Minister’s Office, India'}],kind:'fact'};
  }
  const result=calculate(question);
  if(result) {
    const text=result.divisionByZero ? copy(language,'Division by zero is undefined.','शून्य से भाग देना परिभाषित नहीं है।','शून्याने भाग देणे अपरिभाषित आहे।') :
      result.value===null ? copy(language,'This result is outside the calculator’s range.','यह परिणाम कैलकुलेटर की सीमा से बाहर है।','हे उत्तर गणकाच्या मर्यादेबाहेर आहे।') : result.expression + ' = ' + result.value;
    return {text,kind:'math'};
  }
  const fact=facts.find(item=>item.pattern.test(question.trim().replace(/[?!.।]+$/,'')));
  if(fact) return {text:copy(language,...fact.text),sources:[{url:fact.url,title:fact.source}],kind:'fact'};
  return null;
}

export function containsPrivateDetails(question) {
  return /(?:[a-z0-9._%+-]+@[a-z0-9.-]+(?:\.[a-z]{2,})?|\b(?:otp|pin|cvv|password|account number)\s*(?:is|:|=)?\s*[०-९\d]{3,}|(?:[०-९\d][ -]?){8,})/iu.test(question);
}
