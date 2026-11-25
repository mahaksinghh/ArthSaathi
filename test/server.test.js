import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAppServer } from '../server.mjs';

async function withServer(options, run) {
  const server=createAppServer(options);
  await new Promise((resolve,reject)=>server.once('error',reject).listen(0,'127.0.0.1',resolve));
  try { await run('http://127.0.0.1:' + server.address().port); }
  finally { await new Promise(resolve=>server.close(resolve)); }
}

test('local app serves assets and reports that AI is off without credentials', async () => {
  await withServer({},async base=>{
    assert.match(await (await fetch(base)).text(),/ArthSaathi/);
    assert.match(await (await fetch(base + '/mentor.html')).text(),/\?demo=sale-qr/);
    assert.match((await fetch(base + '/app.js')).headers.get('content-type'),/javascript/);
    assert.match(await (await fetch(base + '/moneyshield.js')).text(), /export function assess/);
    assert.match((await fetch(base + '/qr-worker.js')).headers.get('content-type'),/javascript/);
    assert.match((await fetch(base + '/demos/demo-mismatched-upi.png')).headers.get('content-type'),/image\/png/);
    assert.deepEqual(await (await fetch(base + '/api/status')).json(),{llm:false});
    assert.equal((await fetch(base + '/api/guide',{method:'POST'})).status,503);
    assert.equal((await fetch(base + '/.env')).status,404);
  });
});
test('AI endpoint requires consent, forwards lesson only and reads provider text', async () => {
  const requests=[];
  const provider=async (url, options)=>{
    requests.push({url,body:JSON.parse(options.body)});
    return Response.json({output:[{type:'message',role:'assistant',content:[{type:'output_text',text:'Test fixture.'}]}]});
  };
  await withServer({apiKey:'test-key',model:'test-model',provider},async base=>{
    const ask=(consent,origin=base)=>fetch(base+'/api/guide',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({topic:'upi',language:'en',question:'How do I check?',consent})});
    assert.equal((await ask(false)).status,400);
    assert.equal((await ask(true,'https://example.org')).status,403);
    assert.equal(requests.length,0);
    assert.deepEqual(await (await ask(true)).json(),{answer:'Test fixture.'});
    assert.equal(requests[0].body.store,false);
    assert.match(requests[0].body.instructions,/incoming credit/);
    assert.equal(requests[0].body.input,'How do I check?');
  });
});
