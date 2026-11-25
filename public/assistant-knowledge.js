import { topics } from './guide.js';

export const languages = {en:'English',hi:'हिन्दी',mr:'मराठी'};
export const speechLocales = {en:'en-IN',hi:'hi-IN',mr:'mr-IN'};
export const copy = (language, en, hi, mr) => ({en,hi,mr}[language] || en);

export const knowledge = [
  {id:'overview', keywords:'arthsaathi arth saathi feature help dashboard overview what can how use help अर्थसाथी अर्थ साथी सुविधा मदत शुरू शुरुआत कैसे वापर', title:['What can ArthSaathi do?','ArthSaathi क्या करता है?','ArthSaathi काय करते?'], text:[
    'ArthSaathi has three tools: MoneyShield checks suspicious messages and URLs, MoneyManager tracks finances and dues, and MoneyGuide explains financial topics. The Intelligence Hub links a suspicious claim to a pending sale. Choose Explore demo for fictional data or Start empty for your own records.',
    'MoneyShield संदिग्ध संदेश और लिंक जाँचता है। MoneyManager आमदनी, खर्च और बकाया दर्ज करता है। MoneyGuide पैसे से जुड़े विषय समझाता है। इंटेलिजेंस हब संदिग्ध दावे को लंबित बिक्री से जोड़ता है। शुरुआत में डेमो या खाली कार्यक्षेत्र चुनें।',
    'MoneyShield संशयास्पद संदेश आणि लिंक तपासते. MoneyManager उत्पन्न, खर्च आणि थकबाकी नोंदवते. MoneyGuide आर्थिक विषय समजावते. इंटेलिजन्स हब संशयास्पद दावा प्रलंबित विक्रीशी जोडतो. सुरुवातीला डेमो किंवा रिकामी जागा निवडा।'], route:'overview'},
  {id:'shield', keywords:'moneyshield suspicious scam message link url risk score fraud otp pin phishing check fake sms whatsapp फर्जी धोखा जोखिम जाँच संदेश लिंक पिन फसवणूक संशयास्पद तपास',title:['How do I check a suspicious message?','संदिग्ध संदेश कैसे जाँचूँ?','संशयास्पद संदेश कसा तपासू?'], text:[
    'Open MoneyShield, paste a message or URL and select Check for risk. It shows a risk score, matched indicators, and a next step. It looks for requests for PINs or OTPs, fake transfer or refund claims, and suspicious link structure. Check payments in your own bank or UPI app.',
    'MoneyShield खोलें, संदेश या यूआरएल चिपकाएँ और जोखिम जाँचें चुनें। स्कोर, मिले संकेत और अगला कदम दिखेंगे। यह पिन या ओटीपी माँगना, नकली ट्रांसफर या रिफंड के दावे और संदिग्ध लिंक पहचानता है। भुगतान अपने बैंक या यूपीआई ऐप में देखें।',
    'MoneyShield उघडा, संदेश किंवा URL पेस्ट करा आणि जोखीम तपासा निवडा. गुण, जुळलेले संकेत आणि पुढील कृती दिसेल. PIN किंवा OTP मागणे, बनावट हस्तांतरण किंवा परताव्याचे दावे आणि संशयास्पद लिंक तपासल्या जातात. तुमच्या बँक किंवा UPI अ‍ॅपमध्ये पेमेंट तपासा.'],route:'shield'},
  {id:'manager', keywords:'moneymanager ledger business personal sales budget expense income cash chart khata dues payable ग्राहक बहीखाता खर्च बजट आय आमदनी बकाया उत्पन्न अंदाजपत्रक थकबाकी',title:['How do I track expenses and dues?','खर्च और बकाया कैसे दर्ज करूँ?','खर्च आणि थकबाकी कशी नोंदवू?'],text:[
    'Open MoneyManager and select Personal or Business. Use Add a ledger entry for income or expenses, and set a monthly spending budget next to the cash-flow chart. In Business, add unpaid sales under Customer dues. They remain outside income until you record confirmation in the Hub.',
    'MoneyManager में व्यक्तिगत या व्यवसाय चुनें। आमदनी या खर्च के लिए बहीखाते में रिकॉर्ड जोड़ें और चार्ट के पास मासिक बजट तय करें। व्यवसाय में ग्राहक के बकाया के तहत अवैतनिक बिक्री जोड़ें। हब में पुष्टि के बाद ही यह आमदनी में शामिल होगी।',
    'MoneyManager मध्ये वैयक्तिक किंवा व्यवसाय निवडा. उत्पन्न किंवा खर्चाची नोंद करा आणि चार्टजवळ मासिक खर्च मर्यादा ठरवा. व्यवसायात ग्राहकांच्या थकबाकीत न भरलेली विक्री नोंदवा. हबमध्ये पुष्टी केल्यानंतरच ती उत्पन्नात जोडली जाते।'],route:'manager'},
  {id:'guide', keywords:'moneyguide financial education lessons source learn guidance official se bi literacy पाठ गाइड सलाह स्रोत शिक्षा मार्गदर्शन धडा',title:['What can I learn in MoneyGuide?','MoneyGuide में क्या सीख सकता हूँ?','MoneyGuide मध्ये काय शिकता येते?'],text:[
    'MoneyGuide has sourced lessons on UPI safety, budgeting, emergency savings and reporting fraud. Choose a topic and open its official source. The lessons work without an AI key.',
    'MoneyGuide में यूपीआई सुरक्षा, बजट, आपातकालीन बचत और धोखाधड़ी की शिकायत पर स्रोत आधारित पाठ हैं। विषय चुनकर उसका आधिकारिक स्रोत खोलें। पाठ एआई कुंजी के बिना उपलब्ध हैं।',
    'MoneyGuide मध्ये UPI सुरक्षा, बजेट, आपत्कालीन बचत आणि फसवणूक नोंदवण्याचे संदर्भासह धडे आहेत. विषय निवडा आणि अधिकृत स्रोत उघडा. धड्यांसाठी AI की आवश्यक नाही।'],route:'guide'},
  {id:'hub', keywords:'hub confirm verification verify pending sale received payment credit receipt intelligence बैंक भुगतान पुष्टि जमा बिक्री पडताळणी पुष्टी पेमेंट', title:['How do I confirm a pending payment?','लंबित भुगतान की पुष्टि कैसे करूँ?','प्रलंबित पेमेंटची पुष्टी कशी करू?'],text:[
    'Check the message in MoneyShield and choose Link to a sale. Select the pending sale and link the risk summary. Independently check the matching incoming credit in your own official bank or UPI app. In the Hub, check the attestation and record your confirmation. ArthSaathi records the receipt and cannot verify the bank payment itself.',
    'MoneyShield में संदेश जाँचकर बिक्री से जोड़ें चुनें। लंबित बिक्री चुनें और जोखिम सारांश जोड़ें। अपने बैंक या यूपीआई ऐप में जमा राशि अलग से देखें। हब में पुष्टि का विकल्प चुनकर दर्ज करें। ArthSaathi रसीद दर्ज करता है और खुद बैंक भुगतान सत्यापित नहीं कर सकता।',
    'MoneyShield मध्ये संदेश तपासा आणि तो प्रलंबित विक्रीशी जोडा. तुमच्या अधिकृत बँक किंवा UPI अ‍ॅपमध्ये जमा रक्कम स्वतंत्रपणे तपासा. हबमध्ये पुष्टीची खूण करून तुमची पुष्टी नोंदवा. ArthSaathi पावती नोंदवते, बँक पेमेंट स्वतः तपासत नाही।'],route:'hub'},
  {id:'privacy',keywords:'privacy export delete history saved storage sync consent microphone गोपनीयता डेटा मिटाएँ स्टोरेज इतिहास निर्यात हटाएँ गोपनीयता माहिती काढा',title:['Where is my data saved?','मेरा डेटा कहाँ सहेजा जाता है?','माझा डेटा कुठे साठवला जातो?'],text:[
    'Your records stay in this browser. Privacy & data lets you export or delete the workspace, clear the current scan and opt into summary history. This assistant does not read financial records. If you enable online answers, the typed or transcribed question can go to the AI provider. Browser speech recognition may also use its own online service.',
    'आपके रिकॉर्ड इसी ब्राउज़र में रहते हैं। गोपनीयता और डेटा से निर्यात, मिटाना, मौजूदा जाँच साफ़ करना और इतिहास चालू करना संभव है। सहायक वित्तीय रिकॉर्ड नहीं पढ़ता। ऑनलाइन उत्तर चालू करने पर सवाल एआई प्रदाता तक जा सकता है। आवाज़ पहचान के लिए ब्राउज़र अपनी ऑनलाइन सेवा इस्तेमाल कर सकता है।',
    'तुमच्या नोंदी याच ब्राउझरमध्ये राहतात. गोपनीयता आणि डेटा विभागातून निर्यात, हटवणे आणि तपासणी इतिहास नियंत्रित करता येतो. सहाय्यक आर्थिक नोंदी वाचत नाही. ऑनलाइन उत्तरे सुरू केल्यावर प्रश्न AI सेवेकडे जाऊ शकतो. आवाज ओळखण्यासाठी ब्राउझर स्वतःची ऑनलाइन सेवा वापरू शकतो।'],route:'privacy'}
];
const marathi = {
  upi:'स्वतःच्या बँक किंवा UPI अ‍ॅपमध्ये जमा रक्कम तपासा. पेमेंटचा संदेश बनावट असू शकतो. पैसे मिळवण्यासाठी UPI PIN टाकू नका किंवा अनपेक्षित कलेक्ट विनंती मंजूर करू नका.',
  budget:'उत्पन्न आणि खर्च नोंदवा. वास्तववादी मासिक खर्च मर्यादा ठरवा आणि गरजेनुसार बदला. प्रत्येक बचत उद्दिष्टासाठी रक्कम आणि अंतिम तारीख ठरवा.',
  savings:'अनपेक्षित खर्चासाठी उत्पन्नाचा काही भाग बाजूला ठेवा. नियमितपणे परवडेल इतक्या रकमेपासून सुरुवात करा आणि स्वतंत्र नोंद ठेवा.',
  report:'पैसे गेले असतील तर बँकेच्या अधिकृत माध्यमातून संपर्क साधा आणि भारतात 1930 वर त्वरित फोन करा. राष्ट्रीय सायबर गुन्हे पोर्टलवर तक्रार करा आणि व्यवहाराचा संदर्भ व स्क्रीनशॉट जतन करा.'
};
const topicKeywords = {upi:'upi pin otp collect qr यूपीआई पिन क्यूआर युपीआय',budget:'budget budgeting limit monthly बजट सीमा खर्च अंदाजपत्रक',savings:'saving savings emergency fund बचत आपातकालीन आपत्कालीन',report:'report lost stolen complaint 1930 cybercrime शिकायत पैसे कटे रिपोर्ट तक्रार फसवणूक'};
export const lessons = topics.map(topic=>({...topic, keywords:topicKeywords[topic.id], text:[...topic.body,marathi[topic.id]],route:topic.id==='report'?'report':'guide'}));
const tokenize = s=>s.normalize('NFKC').toLowerCase().match(/[\p{L}\p{M}\p{N}]+/gu) || [];
const stop = new Set('how what do i a an the and my to in can does is it of for me how ही का की कैसे मैं क्या और में की के है का कसे कशी काय मध्ये'.split(' '));
export function retrieve(question) {
  const normalized = question.normalize('NFKC').toLowerCase().replace(/money[\s-]+(shield|manager|guide)/g,'money$1');
  const words=new Set(tokenize(normalized).filter(word=>!stop.has(word)));
  const forced = /\b1930\b|\b(?:report|file) (?:a |the )?(?:scam|fraud|complaint)\b|शिकायत|तक्रार/.test(normalized) ? 'report' :
    normalized.match(/\bmoney(shield|manager|guide)\b/)?.[1];
  if(forced) return [...knowledge,...lessons].find(item=>item.id===forced);
  if(/\barthsaathi\b|अर्थसाथी|अर्थ साथी/i.test(normalized)) return knowledge[0];
  const title=[...knowledge,...lessons].find(item=>item.title.some(value=>tokenize(value).join(' ')===tokenize(normalized).join(' ')));
  if(title) return title;
  return [...knowledge,...lessons].map(item=>{
    const terms=new Set(tokenize(item.keywords));
    const hits=[...words].filter(word=>terms.has(word)).length;
    return {item, score:hits};
  }).filter(row=>row.score>=2 && row.score / words.size >= .5).sort((a,b)=>b.score-a.score)[0]?.item;
}
export function explain(item, language) {
  return item?.text[{en:0,hi:1,mr:2}[language] ?? 0];
}
