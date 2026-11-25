export const topics = [
  {id:'upi', icon:'◈', title:['UPI payment safety','यूपीआई भुगतान सुरक्षा'], body:['Open your own banking or UPI app and look for the incoming credit. A payment message can be fabricated. When receiving money, never enter a UPI PIN or approve an unexpected collect request.','अपना बैंक या यूपीआई ऐप खोलकर जमा राशि देखें। भुगतान का संदेश नकली हो सकता है। पैसे पाने के लिए यूपीआई पिन न डालें और अनजान भुगतान अनुरोध स्वीकार न करें।'], source:'RBI', url:'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=53185'},
  {id:'budget', icon:'▤', title:['Make a monthly budget','मासिक बजट बनाएँ'], body:['Record all income and expenses. Set a realistic spending limit, review it regularly and adjust it when income or bills change. Give each savings goal an amount and a deadline.','सारी आय और खर्च लिखें। खर्च की व्यावहारिक सीमा तय करें और आय या बिल बदलने पर उसे समायोजित करें। हर बचत लक्ष्य के लिए राशि और समय तय करें।'], source:'SEBI Investor', url:'https://investor.sebi.gov.in/moneymatters-budandfinangoal.html'},
  {id:'savings', icon:'◎', title:['Build emergency savings','आपातकालीन बचत बनाएँ'], body:['Set aside a portion of income for unexpected expenses. Start with an amount you can sustain, and track it separately from your everyday spending.','अचानक आने वाले खर्चों के लिए आय का कुछ हिस्सा अलग रखें। ऐसी राशि से शुरुआत करें जिसे नियमित रूप से बचा सकें और उसे रोज़ के खर्च से अलग दर्ज करें।'], source:'SEBI Investor', url:'https://investor.sebi.gov.in/moneymatters-whysave.html'},
  {id:'report', icon:'!', title:['Report financial cyber fraud','वित्तीय साइबर धोखाधड़ी की शिकायत'], body:['If money was lost, contact your bank using its official channel and call 1930 promptly. File a complaint on the National Cyber Crime Reporting Portal and keep evidence such as screenshots and the transaction reference.','पैसे कटने पर बैंक के आधिकारिक माध्यम से संपर्क करें और तुरंत 1930 पर कॉल करें। राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल पर शिकायत करें और स्क्रीनशॉट व लेनदेन की पहचान सुरक्षित रखें।'], source:'National Cyber Crime Reporting Portal', url:'https://cybercrime.gov.in/'}
];
export const signals = {
 secret:['Mentions a sensitive credential such as a PIN, OTP or password.','इसमें पिन, ओटीपी या पासवर्ड जैसी गोपनीय जानकारी का ज़िक्र है।'],
 urgent:['Uses urgency or threatens a restriction.','जल्दबाज़ी का दबाव या रोक लगाने की धमकी है।'],
 kyc:['Mentions account verification or KYC.','खाता सत्यापन या केवाईसी का ज़िक्र है।'],
 claim:['Contains a payment or collect-request claim.','भुगतान मिलने या भुगतान अनुरोध का दावा है।'],
 scheme:['Uses a link scheme other than HTTP or HTTPS.','लिंक में HTTP या HTTPS के अलावा कोई तरीका है।'],
 http:['Uses an unencrypted HTTP link.','लिंक बिना एन्क्रिप्शन वाले HTTP का उपयोग करता है।'],
 host:['Uses an IP address, encoded domain, or embedded credentials.','लिंक में आईपी पता, एन्कोडेड डोमेन या लॉगिन जानकारी है।'],
 short:['A link shortener hides the final destination.','छोटा लिंक असली गंतव्य छिपाता है।'],
 lure:['The domain or path uses terms such as claim, verify or login.','डोमेन या पाथ में दावा, सत्यापन या लॉगिन जैसे शब्द हैं।'],
 malformed:['A link could not be parsed.','एक लिंक पढ़ा नहीं जा सका।']
};
