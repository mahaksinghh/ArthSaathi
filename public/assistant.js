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
const routeLabels = {overview:'Overview',shield:'MoneyShield',manager:'MoneyManager',guide:'MoneyGuide',hub:'Intelligence Hub',report:'Report fraud',privacy:'Privacy & data'};
const action = (name,label,cls='secondary') => `<button type="button" class="${cls}" data-assistant="${name}">${label}</button>`;

export function assistantPage(hi, api) {
  if(!initialized) { language=hi?'hi':'en'; initialized=true; }
  return `<section class="assistant-hero"><div><span class="eyebrow">ARTHSAATHI</span><h1>${c('Your financial assistant','आपका आर्थिक सहायक','तुमचा आर्थिक सहाय्यक')}</h1><p>${c('Ask about this app, money basics or a topic you want to look up.','ऐप, पैसों की बुनियादी बातें या किसी विषय के बारे में पूछें।','अ‍ॅप, पैशांच्या मूलभूत गोष्टी किंवा शोधायच्या विषयाबद्दल विचारा।')}</p></div><div class="assistant-orb" aria-hidden="true">✦</div></section>
  <div class="assistant-grid"><article class="card pane assistant-chat">
    <div class="card-head"><div><h2>${c('Ask ArthSaathi','ArthSaathi से पूछें','ArthSaathi ला विचारा')}</h2><p>${api&&online?c('Web answers enabled','वेब उत्तर चालू','वेब उत्तरे सुरू'):c('Built-in answers','ऐप में उपलब्ध उत्तर','अ‍ॅपमधील उत्तरे')}</p></div>${action('clear',c('Clear chat','चैट साफ़ करें','चॅट साफ करा'))}</div>
    <div id="assistant-thread" class="assistant-thread" role="log" aria-live="polite" aria-relevant="additions text">${messages.length ? messages.map((msg,i)=>`<div class="chat-bubble ${msg.role}"><b>${msg.role==='user'?c('You','आप','तुम्ही'):'ArthSaathi'}</b><div lang="${msg.lang}">${answerText(msg)}</div>${msg.route?`<button type="button" class="text-btn" data-route="${msg.route}">${c('Open','खोलें','उघडा')} · ${routeLabels[msg.route]}</button>`:''}${msg.sources?.length?`<div class="source-row">${msg.sources.map(source=>`<a href="${safe(source.url)}" target="_blank" rel="noopener noreferrer">${safe(source.title)}</a>`).join('')}</div>`:''}${msg.role==='bot'&&speechOut?action('speak:'+i,c('Listen','सुनें','ऐका'),'text-btn'):''}</div>`).join('') : `<div class="chat-welcome"><span class="stat-icon mint" aria-hidden="true">✦</span><p>${c('Ask me how to check a message, record an expense or find an official source.','संदेश जाँचने, खर्च दर्ज करने या आधिकारिक स्रोत ढूँढने के बारे में पूछें।','संदेश तपासणे, खर्च नोंदवणे किंवा अधिकृत स्रोत शोधणे याबद्दल विचारा।')}</p></div>`}
    ${busy?`<p class="chat-wait">${c('Looking for an answer…','उत्तर खोज रहे हैं…','उत्तर शोधत आहे…')}</p>`:''}</div>
    <form id="assistant-form"><label><span>${c('Your question','आपका सवाल','तुमचा प्रश्न')}</span><textarea id="assistant-question" name="assistantQuestion" maxlength="600" required rows="2" placeholder="${c('Type a question…','सवाल लिखें…','प्रश्न लिहा…')}">${safe(draft)}</textarea></label>
    <div class="assistant-controls"><button class="primary" type="submit" ${busy?'disabled':''}>${c('Send question','सवाल भेजें','प्रश्न पाठवा')}</button>${api&&online?`<button class="secondary" type="submit" value="web" ${busy?'disabled':''}>${c('Search the web','वेब पर खोजें','वेबवर शोधा')}</button>`:''}${Speech?action('mic',listening?c('Stop listening','सुनना रोकें','ऐकणे थांबवा'):c('Speak','बोलें','बोला')):''}${speechOut?action('stop',c('Stop audio','आवाज़ रोकें','आवाज थांबवा')):''}</div>
    <p role="status" class="assistant-notice">${safe(notice)}</p></form></article>
    <aside class="assistant-side"><article class="card pane"><h2>${c('Language & access','भाषा और पहुँच','भाषा आणि प्रवेश')}</h2><label class="assistant-language"><span>${c('Conversation language','बातचीत की भाषा','संभाषणाची भाषा')}</span><select id="assistant-language">${Object.entries(languages).map(([code,name])=>`<option value="${code}" ${language===code?'selected':''}>${name}</option>`).join('')}</select></label>
    ${api?`<label class="check"><input type="checkbox" id="assistant-online" ${online?'checked':''}><span>${c('Allow sending my question to the AI provider for web answers','वेब उत्तर के लिए मेरा सवाल एआई प्रदाता को भेजने दें','वेब उत्तरांसाठी माझा प्रश्न AI सेवेकडे पाठवू द्या')}</span></label>`:`<p>${c('Web answers need a configured AI server. Product help and curated lessons are available here.','वेब उत्तरों के लिए एआई सर्वर चाहिए। ऐप की मदद और चुने हुए पाठ यहाँ उपलब्ध हैं।','वेब उत्तरांसाठी AI सर्व्हर आवश्यक आहे. अ‍ॅपची मदत आणि निवडक धडे येथे उपलब्ध आहेत।')}</p>`}
    <p class="subtle">${Speech?c('Your browser may send audio to its speech service. Keep PINs, OTPs and account details out of questions.','ब्राउज़र आवाज़ अपनी सेवा को भेज सकता है। सवाल में पिन, ओटीपी या खाता विवरण न दें।','ब्राउझर आवाज त्याच्या ओळख सेवेला पाठवू शकतो. PIN, OTP किंवा खाते तपशील प्रश्नात देऊ नका।'):c('Voice input is unavailable in this browser. You can still type a question.','इस ब्राउज़र में आवाज़ इनपुट उपलब्ध नहीं है। आप सवाल लिख सकते हैं।','या ब्राउझरमध्ये आवाज इनपुट उपलब्ध नाही. तुम्ही प्रश्न लिहू शकता।')}</p></article>
    <article class="card pane"><h2>${c('Try asking','ये सवाल पूछें','हे प्रश्न विचारा')}</h2><div class="prompt-list">${[knowledge[1],knowledge[2],knowledge[3],knowledge[4]].map(item=>action('prompt:'+item.id,c(...item.title))).join('')}</div></article></aside></div>`;
}
function update(focus=false) {
  if(!ready()) return;
  redraw();
  const thread=document.querySelector('#assistant-thread');
  if(thread) thread.scrollTop=thread.scrollHeight;
  if(focus) document.querySelector('#assistant-question')?.focus({preventScroll:true});
}
async function ask(text, search=false) {
  const question=text.trim();
  if(!question||question.length>600||busy) return;
  const lang=language, ticket=revision;
  messages.push({role:'user',text:question,lang});
  draft=''; notice='';
  const match=retrieve(question);
  if(match && !search) {
    messages.push({role:'bot',lang,text:explain(match,lang),route:match.route,sources:match.url?[{url:match.url,title:match.source}]:[]});
    update(true); return;
  }
  const fallback=c('I couldn’t match that question to the built-in knowledge. Try a product question or an official lesson.','इस सवाल का उत्तर ऐप के ज्ञान में नहीं मिला। किसी सुविधा या आधिकारिक पाठ के बारे में पूछें।','अ‍ॅपच्या माहितीत या प्रश्नाचे उत्तर सापडले नाही. एखाद्या सुविधेबद्दल किंवा अधिकृत धड्याबद्दल विचारा।');
  if(!online) { messages.push({role:'bot',lang,text:fallback}); update(true); return; }
  busy=true; request=new AbortController(); update();
  try {
    const res=await fetch('./api/assistant',{method:'POST',signal:request.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({question,language:lang,consent:true})});
    const data=await res.json();
    if(!res.ok || typeof data.answer!=='string') throw Error('provider');
    if(ticket===revision) messages.push({role:'bot',lang,text:data.answer,sources:data.sources,citations:data.citations});
  } catch {
    if(ticket===revision) messages.push({role:'bot',lang,text:copy(lang,'Web answers are temporarily unavailable. The built-in lessons are still available.','वेब उत्तर अभी उपलब्ध नहीं हैं। ऐप के पाठ उपलब्ध हैं।','वेब उत्तरे सध्या उपलब्ध नाहीत. अ‍ॅपमधील धडे वापरता येतील।')});
  } finally { if(ticket===revision) { busy=false; request=null; update(true); } }
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
    event.preventDefault(); void ask(draft, event.submitter?.value==='web');
  });
  app.addEventListener('click',event=>{
    const command=event.target.closest('[data-assistant]')?.dataset.assistant;
    if(!command) return;
    if(command==='clear') { clearAssistant(); update(true); }
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
