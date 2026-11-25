import { generalAnswer, quickQuestions, containsPrivateDetails } from './general-answers.js';
import { copy, languages, speechLocales, knowledge, retrieve, explain } from './assistant-knowledge.js';

const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
const speechOut = window.speechSynthesis;
const messages = [];
let language = 'en';
let initialized = false;
let online = false;
let busy = false;
let listening = false;
let recognition;
let draft = '';
let notice = '';
let redraw = () => {};
let ready = () => false;
let revision = 0;
let request;
const c = (en,hi,mr) => copy(language,en,hi,mr);
const safe = text => String(text ?? '').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
function answerText(msg) {
  if(!msg.citations?.length) return safe(msg.text);
  const chars=Array.from(msg.text);
  let cursor=0;
  let html='';
  for(const cite of msg.citations) {
    const end=Math.max(cursor,Math.min(chars.length,cite.end));
    html+=safe(chars.slice(cursor,end).join(''))+` <a class="inline-cite" href="${safe(cite.url)}" target="_blank" rel="noopener noreferrer" title="${safe(cite.title)}">[${cite.number}]</a>`;
    cursor=end;
  }
  return html+safe(chars.slice(cursor).join(''));
}
const kindName = kind=>({
  math:c('Calculator','कैलकुलेटर','गणक'),fact:c('Quick fact','तुरंत जानकारी','झटपट माहिती'),
  product:c('ArthSaathi help','ArthSaathi सहायता','ArthSaathi मदत'),
  web:c('Web answer','वेब उत्तर','वेब उत्तर')
}[kind]);
const routeLabels = {overview:'Overview',shield:'MoneyShield',manager:'MoneyManager',guide:'MoneyGuide',hub:'Intelligence Hub',report:'Report fraud',privacy:'Privacy & data'};
const action = (name,label,cls='secondary') => `<button type="button" class="${cls}" data-assistant="${name}">${label}</button>`;

export function assistantPage(hi, api) {
  if(!initialized) { language=hi?'hi':'en'; initialized=true; }
  return `<section class="assistant-hero"><div><span class="eyebrow"><span aria-hidden="true">✦</span> ASK ARTHSAATHI</span><h1>${c('What’s on your mind?','आज क्या जानना चाहेंगे?','आज काय जाणून घ्यायचे आहे?')}</h1><p>${c('Ask a quick question, work out a calculation, or get help with your money tools.','कोई सवाल पूछें, हिसाब लगाएँ या अपने आर्थिक टूल की मदद लें।','प्रश्न विचारा, हिशोब करा किंवा आर्थिक साधनांची मदत घ्या।')}</p></div><div class="assistant-orb" aria-hidden="true"><span>✦</span><i>✧</i></div></section>
  <div class="assistant-grid"><article class="card assistant-chat">
    <div class="assistant-chat-head"><span class="assistant-avatar" aria-hidden="true">✦</span><div><h2>${c('Ask ArthSaathi','ArthSaathi से पूछें','ArthSaathi ला विचारा')}</h2><p>${c('General questions and product help','सामान्य सवाल और ऐप की मदद','सामान्य प्रश्न आणि अ‍ॅपची मदत')}</p></div>${action('clear',c('Clear chat','चैट साफ़ करें','चॅट साफ करा'),'assistant-quiet')}</div>
    <div id="assistant-thread" class="assistant-thread" role="log" aria-live="polite" aria-relevant="additions text">${messages.length ? messages.map((msg,i)=>`<div class="chat-bubble ${msg.role}"><div class="bubble-head"><b>${msg.role==='user'?c('You','आप','तुम्ही'):'ArthSaathi'}</b>${msg.kind?`<span>${kindName(msg.kind)}</span>`:''}</div><div lang="${msg.lang}">${answerText(msg)}</div>${msg.route?`<button type="button" class="text-btn" data-route="${msg.route}">${c('Open','खोलें','उघडा')} · ${routeLabels[msg.route]}</button>`:''}${msg.sources?.length?`<div class="source-row">${msg.sources.map(source=>`<a href="${safe(source.url)}" target="_blank" rel="noopener noreferrer">${safe(source.title)}</a>`).join('')}</div>`:''}${msg.role==='bot'&&speechOut?action('speak:'+i,c('Listen','सुनें','ऐका'),'text-btn'):''}</div>`).join('') : `<div class="chat-welcome"><span class="assistant-avatar" aria-hidden="true">✦</span><h3>${c('Start with anything you’re curious about','जो जानना चाहें, उससे शुरू करें','जे जाणून घ्यायचे आहे त्यापासून सुरू करा')}</h3><p>${c('Try a question below, type your own, or use the microphone.','नीचे से सवाल चुनें, अपना सवाल लिखें या माइक्रोफ़ोन इस्तेमाल करें।','खालील प्रश्न निवडा, स्वतःचा प्रश्न लिहा किंवा मायक्रोफोन वापरा।')}</p><div class="quick-pills">${Object.entries(quickQuestions).map(([key,words])=>action('quick:'+key,c(...words),'assistant-pill')).join('')}</div></div>`}
    ${busy?`<p class="chat-wait">${c('Looking for an answer…','उत्तर खोज रहे हैं…','उत्तर शोधत आहे…')}</p>`:''}</div>
    <form id="assistant-form"><label><span>${c('Your question','आपका सवाल','तुमचा प्रश्न')}</span><textarea id="assistant-question" name="assistantQuestion" maxlength="600" required rows="2" placeholder="${c('Ask a question…','सवाल पूछें…','प्रश्न विचारा…')}">${safe(draft)}</textarea></label>
    <div class="assistant-controls">${Speech?action('mic',listening?c('Stop listening','सुनना रोकें','ऐकणे थांबवा'):c('Speak','बोलें','बोला'),'assistant-quiet'):''}${speechOut?action('stop',c('Stop audio','आवाज़ रोकें','आवाज थांबवा'),'assistant-quiet'):''}<button class="primary assistant-send" type="submit" ${busy?'disabled':''}>${c('Send question','सवाल भेजें','प्रश्न पाठवा')}</button></div>
    <p role="status" class="assistant-notice">${safe(notice)}</p></form></article>
    <aside class="assistant-side"><article class="card pane assistant-settings"><h2>${c('Make it yours','अपनी पसंद चुनें','तुमची पसंती निवडा')}</h2><label class="assistant-language"><span>${c('Conversation language','बातचीत की भाषा','संभाषणाची भाषा')}</span><select id="assistant-language">${Object.entries(languages).map(([code,name])=>`<option value="${code}" ${language===code?'selected':''}>${name}</option>`).join('')}</select></label>
    ${api?`<label class="check"><input type="checkbox" id="assistant-online" ${online?'checked':''}><span>${c('Allow AI-powered web answers','एआई वाले वेब उत्तर चालू करें','AI वापरून वेब उत्तरे सुरू करा')}</span></label>`:''}
    <p class="subtle">${Speech?c('Your browser may send audio to its speech service. Keep PINs, OTPs and account details out of questions.','ब्राउज़र आवाज़ अपनी सेवा को भेज सकता है। सवाल में पिन, ओटीपी या खाता विवरण न दें।','ब्राउझर आवाज त्याच्या ओळख सेवेला पाठवू शकतो. PIN, OTP किंवा खाते तपशील प्रश्नात देऊ नका।'):c('Voice input is unavailable in this browser. You can still type a question.','इस ब्राउज़र में आवाज़ इनपुट उपलब्ध नहीं है। आप सवाल लिख सकते हैं।','या ब्राउझरमध्ये आवाज इनपुट उपलब्ध नाही. तुम्ही प्रश्न लिहू शकता।')}</p></article>
    <article class="card pane"><h2>${c('Explore ArthSaathi','ArthSaathi जानें','ArthSaathi समजून घ्या')}</h2><div class="prompt-list">${[knowledge[1],knowledge[2],knowledge[3],knowledge[4]].map((item,index)=>action('prompt:'+item.id,`<span aria-hidden="true">${['◇','▥','◫','⌘'][index]}</span><span>${c(...item.title)}</span>`,'assistant-prompt')).join('')}</div></article></aside></div>`;
}
function update(focus=false) {
  if(!ready()) return;
  redraw();
  const thread=document.querySelector('#assistant-thread');
  if(thread) thread.scrollTop=thread.scrollHeight;
  if(focus) document.querySelector('#assistant-question')?.focus({preventScroll:true});
}
async function ask(text) {
  const question=text.trim();
  if(!question||question.length>600||busy) return;
  const lang=language, ticket=revision;
  const reply=answer=>messages.push({role:'bot',lang,...answer});
  messages.push({role:'user',text:question,lang});
  draft=''; notice='';
  const direct=generalAnswer(question,lang);
  if(direct) { reply(direct); update(true); return; }
  if(containsPrivateDetails(question)) {
    reply({text:copy(lang,'Please remove the private numbers or account details and ask again.','निजी नंबर या खाते की जानकारी हटाकर दोबारा पूछें।','खाजगी क्रमांक किंवा खाते तपशील काढून पुन्हा विचारा.')});
    update(true); return;
  }
  const match=retrieve(question);
  if(match) {
    reply({text:explain(match,lang),route:match.route,kind:'product',sources:match.url?[{url:match.url,title:match.source}]:[]});
    update(true); return;
  }
  const clarification={text:copy(lang,
    'I couldn’t verify a relevant answer. Can you rephrase the question or name the specific topic?',
    'मुझे इस सवाल का भरोसेमंद जवाब नहीं मिला। सवाल दूसरे शब्दों में या विषय का नाम लिखकर पूछ सकते हैं?',
    'या प्रश्नाचे विश्वासार्ह उत्तर सापडले नाही. प्रश्न वेगळ्या शब्दांत किंवा विषयाचे नाव देऊन विचाराल का?')};
  if(!online) { reply(clarification); update(true); return; }
  const controller=new AbortController();
  busy=true; request=controller; update();
  let answer;
  try {
    const res=await fetch('./api/assistant',{method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({question,language:lang,consent:true})});
    const data=await res.json();
    if(res.ok && typeof data.answer==='string' && data.answer.trim()) answer={text:data.answer,kind:'web',sources:data.sources,citations:data.citations};
  } catch { /* A failed provider request leaves no verified answer to display. */ }
  finally {
    if(ticket===revision) {
      reply(answer || clarification);
      busy=false; request=null; update(true);
    }
  }
}

export function clearAssistant() {
  revision++; request?.abort(); request=null; busy=false; messages.length=0; draft=''; notice=''; online=false;
  if(recognition) { const current=recognition; recognition=null; current.abort(); }
  listening=false; speechOut?.cancel();
}
export function wireAssistant(app, render, isOpen) {
  redraw=render; ready=isOpen;
  app.addEventListener('input',event=>{if(event.target.id==='assistant-question') draft=event.target.value;});
  app.addEventListener('change',event=>{
    if(event.target.id==='assistant-language') { recognition?.stop(); language=event.target.value; update(); document.querySelector('#assistant-language')?.focus(); }
    if(event.target.id==='assistant-online') { online=event.target.checked; update(); document.querySelector('#assistant-online')?.focus(); }
  });
  app.addEventListener('submit',event=>{
    if(event.target.id!=='assistant-form') return;
    event.preventDefault(); void ask(draft);
  });
  app.addEventListener('click',event=>{
    const command=event.target.closest('[data-assistant]')?.dataset.assistant;
    if(!command) return;
    if(command==='clear') { clearAssistant(); update(true); }
    if(command.startsWith('quick:')) {const question=quickQuestions[command.slice(6)]; if(question) void ask(c(...question));}
    if(command==='stop') speechOut?.cancel();
    if(command.startsWith('speak:')) {
      const msg=messages[Number(command.slice(6))];
      if(!msg||!speechOut) return;
      speechOut.cancel();
      const output=new SpeechSynthesisUtterance(msg.text);
      output.lang=speechLocales[msg.lang];
      const voices=speechOut.getVoices();
      const voice=voices.find(item=>item.lang===output.lang) || voices.find(item=>item.lang.startsWith(msg.lang));
      if(voice) output.voice=voice;
      else if(voices.length) { notice=c('No matching voice is installed for this answer language.','इस भाषा की आवाज़ उपलब्ध नहीं है।','या भाषेचा आवाज उपलब्ध नाही।'); update(); return; }
      output.onerror=()=>{notice=c('Audio playback was unavailable.','आवाज़ चलाना संभव नहीं था।','आवाज प्ले करता आला नाही।');update();};
      speechOut.speak(output);
    }
    if(command.startsWith('prompt:')) {const item=knowledge.find(row=>row.id===command.slice(7)); if(item) void ask(c(...item.title));}
    if(command==='mic'&&Speech) {
      if(listening) {recognition.stop(); return;}
      const current=new Speech();
      recognition=current; current.lang=speechLocales[language]; current.interimResults=false;
      current.onresult=event=>{if(recognition!==current)return; draft=event.results[0][0].transcript.slice(0,600); notice=c('Review your transcript and send it when ready.','लिखे हुए सवाल की समीक्षा करके भेजें।','लिप्यंतर तपासा आणि तयार झाल्यावर पाठवा।');};
      current.onerror=()=>{if(recognition!==current)return; notice=c('Speech recognition could not capture your question. Try typing or check microphone permission.','आवाज़ दर्ज नहीं हुई। सवाल लिखें या माइक्रोफ़ोन की अनुमति जाँचें।','आवाज टिपता आला नाही. प्रश्न लिहा किंवा मायक्रोफोनची परवानगी तपासा।');};
      current.onend=()=>{if(recognition!==current)return; recognition=null; listening=false; update(true);};
      try { current.start(); listening=true; notice=c('Listening…','सुन रहे हैं…','ऐकत आहे…');update(); }
      catch { recognition=null; notice=c('Microphone could not start.','माइक्रोफ़ोन शुरू नहीं हुआ।','मायक्रोफोन सुरू झाला नाही।');update(); }
    }
  });
}
