import { test } from 'node:test';
import assert from 'node:assert/strict';
import { retrieve, explain } from '../public/assistant-knowledge.js';
import { createAppServer } from '../server.mjs';

test('retrieves product help in three languages and official lesson sources', () => {
  assert.equal(retrieve('How do I use Money Shield?').id, 'shield');
  assert.equal(retrieve('खर्च और बकाया कैसे दर्ज करूँ?').id, 'manager');
  assert.equal(retrieve('प्रलंबित पेमेंटची पुष्टी कशी करू?').id, 'hub');
  assert.match(explain(retrieve('MoneyGuide'), 'mr'), /धडे/);
  assert.match(retrieve('Where do I report a fraud?').url, /cybercrime\.gov\.in/);
  assert.equal(retrieve('How far away is Mars?'), undefined);
});

test('assistant checks consent, sends product context and returns safe clickable web citations', async () => {
  const calls=[];
  let searched=true;
  const provider=async (_url, options)=>{
    calls.push(JSON.parse(options.body));
    return Response.json({output:[
      ...(searched?[{type:'web_search_call',status:'completed'}]:[]),
      {type:'message',role:'assistant',content:[{type:'output_text',text:'पुणे.',annotations:[
        {type:'url_citation',end_index:5,title:'Official source',url:'https://www.india.gov.in/'},
        {type:'url_citation',end_index:3,title:'Invalid',url:'javascript:void(0)'}
      ]}]}
    ]});
  };
  const server=createAppServer({apiKey:'fixture',model:'fixture',provider});
  await new Promise((resolve,reject)=>server.once('error',reject).listen(0,'127.0.0.1',resolve));
  try {
    const url='http://127.0.0.1:' + server.address().port;
    const ask=consent=>fetch(url+'/api/assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'पुणे कुठे आहे?',language:'mr',consent})});
    assert.equal((await fetch(url+'/assistant.js')).status,200);
    assert.equal((await ask(false)).status,400);
    assert.equal(calls.length,0);
    const {answer,sources,citations}=await (await ask(true)).json();
    assert.equal(answer,'पुणे.');
    assert.deepEqual(sources,[{title:'Official source',url:'https://www.india.gov.in/'}]);
    assert.deepEqual(citations,[{...sources[0],number:1,end:5}]);
    assert.deepEqual(calls[0].tools,[{type:'web_search'}]);
    assert.match(calls[0].instructions,/MoneyShield.*MoneyManager.*MoneyGuide/);
    assert.equal(calls[0].input,'पुणे कुठे आहे?');
    assert.equal(calls[0].store,false);
    searched=false;
    assert.equal((await ask(true)).status,502);
  } finally { await new Promise(resolve=>server.close(resolve)); }
});
