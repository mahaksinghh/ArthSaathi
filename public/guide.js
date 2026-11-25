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
 malformed:['A link could not be parsed.','एक लिंक पढ़ा नहीं जा सका।'],
 secretRequest:['Asks you to send a PIN, OTP, password, or card details to another person or channel.','इसमें किसी व्यक्ति या चैनल को पिन, ओटीपी, पासवर्ड या कार्ड विवरण भेजने को कहा गया है।'],
 secretEntry:['Pairs a request to enter private details with a link, claimed support agent, or account warning.','गोपनीय जानकारी डालने के अनुरोध के साथ लिंक, कथित एजेंट या खाते की चेतावनी है।'],
 receiveTrap:['Asks you to enter a PIN, scan a QR code, or approve a request to receive money. These actions can authorize a debit.','पैसे पाने के नाम पर पिन डालने, क्यूआर स्कैन करने या अनुरोध स्वीकार करने को कहा गया है। ऐसा करने से पैसा कट सकता है।'],
 collectApproval:['Asks you to approve a payment or collect request that can withdraw money.','भुगतान या कलेक्ट अनुरोध मंज़ूर करने को कहा गया है, जिससे पैसा कट सकता है।'],
 refundDemand:['Claims a transfer was sent by mistake and asks you to send it back.','गलती से पैसे भेजने का दावा करके रकम वापस भेजने को कहा गया है।'],
 proofPressure:['Uses a receipt or payment claim to rush handover of an order or discourage independent checking.','रसीद या भुगतान का दावा करके सामान जल्दी देने या खुद जाँच न करने का दबाव है।'],
 kycPressure:['Uses KYC, an account restriction, or a service shutdown to push you to act.','केवाईसी, खाते पर रोक या सेवा बंद होने के बहाने कदम उठाने का दबाव है।'],
 accountUpdate:['Directs you to a link to verify an account or update KYC.','खाते की जाँच या केवाईसी अपडेट करने के लिए लिंक पर जाने को कहा गया है।'],
 contactAfterAlert:['Claims a debit or withdrawal and asks you to contact a number supplied in the message.','पैसे कटने का दावा करके संदेश में दिए नंबर पर संपर्क करने को कहा गया है।'],
 agent:['A claimed support agent or official asks you to take a sensitive action.','कथित एजेंट या अधिकारी आपसे संवेदनशील कदम उठाने को कह रहा है।'],
 remoteAccess:['Requests screen sharing or installation of remote-control software.','स्क्रीन शेयर करने या दूर से नियंत्रण देने वाला सॉफ़्टवेयर लगाने को कहा गया है।'],
 appInstall:['Provides an Android app file or asks you to install one.','इसमें एंड्रॉइड ऐप फ़ाइल दी गई है या उसे इंस्टॉल करने को कहा गया है।'],
 advanceFee:['Pairs a prize, loan, refund, or similar offer with an upfront fee.','इनाम, ऋण, रिफंड या ऐसे ऑफ़र के साथ पहले शुल्क माँगा गया है।'],
 deliveryFee:['Uses a delivery problem to ask you to pay or follow a link.','डिलीवरी में दिक्कत के नाम पर पैसे या लिंक खोलने को कहा गया है।'],
 legalThreat:['Uses a claimed arrest or police case to demand money.','गिरफ्तारी या पुलिस केस का दावा करके पैसे माँगे गए हैं।'],
 schemeOther:['The link may open a separate service or app outside a normal web page.','लिंक सामान्य वेब पेज के बाहर कोई दूसरी सेवा या ऐप खोल सकता है।'],
 paymentLink:['Contains a link that can open a payment app and start a payment.','लिंक भुगतान ऐप खोलकर भुगतान शुरू कर सकता है।'],
 urlCredentials:['Contains login-style text before the real website address.','लिंक में असली वेबसाइट पते से पहले लॉगिन जैसा टेक्स्ट है।'],
 lookalike:['An organization’s name or domain appears inside a different web address.','किसी संस्था का नाम या डोमेन दूसरे वेबसाइट पते में दिखाई देता है।'],
 ipAddress:['The link uses a numerical IP address as the destination.','लिंक में वेबसाइट की जगह संख्यात्मक आईपी पता है।'],
 idn:['The address uses an encoded internationalized domain name. This can be legitimate.','वेबसाइट का पता एन्कोडेड अंतरराष्ट्रीय डोमेन नाम है। यह वैध भी हो सकता है।'],
 mixedHost:['The address mixes characters from different scripts that can look alike.','वेबसाइट पते में अलग-अलग लिपियों के एक जैसे दिखने वाले अक्षर हैं।']
};

export const safetyActions = [
  [['receiveTrap','collectApproval','paymentLink'],['Do not enter a PIN, scan a QR code, or approve a request to receive money. Check the incoming credit in the app you normally use.','पैसे पाने के लिए पिन न डालें, क्यूआर स्कैन न करें और अनुरोध मंज़ूर न करें। अपने नियमित ऐप में जमा राशि देखें।']],
  [['refundDemand','proofPressure'],['Check the transfer in your own bank or UPI app before returning money or handing over goods. If there is a dispute, contact your bank through its official channel.','पैसे लौटाने या सामान देने से पहले अपने बैंक या यूपीआई ऐप में लेनदेन जाँचें। विवाद हो तो बैंक के आधिकारिक माध्यम से संपर्क करें।']],
  [['secretRequest','secretEntry'],['Keep your PIN, OTP, password and card details private. Open the official app separately to check the message.','अपना पिन, ओटीपी, पासवर्ड और कार्ड विवरण गोपनीय रखें। दावे की जाँच के लिए आधिकारिक ऐप खुद खोलें।']],
  [['appInstall','remoteAccess'],['Avoid installing the file or sharing your screen. If you need support, contact the provider through its official app or website.','फ़ाइल इंस्टॉल करने या स्क्रीन शेयर करने से बचें। सहायता चाहिए तो संस्था के आधिकारिक ऐप या वेबसाइट से संपर्क करें।']],
  [['kycPressure','accountUpdate','contactAfterAlert','agent','legalThreat','lookalike'],['Use an official app or a contact number you find independently. Avoid using the link or number from the message.','आधिकारिक ऐप या स्वतंत्र रूप से खोजे गए नंबर का उपयोग करें। संदेश में दिए लिंक या नंबर का उपयोग न करें।']],
  [['advanceFee','deliveryFee'],['Check the offer or delivery directly with the organization before paying. Use a contact method you find independently.','भुगतान से पहले संबंधित संस्था से ऑफ़र या डिलीवरी की पुष्टि करें। संपर्क का तरीका खुद खोजें।']]
];
