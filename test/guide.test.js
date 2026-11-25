import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGuideHandler} from '../api/guide.js';

const request = (search, options) => new Request('https://example.com/api/guide?' + search, options);

test('public guide accepts fixed lesson selections and coalesces repeated generation', async () => {
  const calls = [];
  const provider = async (url, options) => {
    calls.push({url, body: JSON.parse(options.body)});
    return Response.json({choices: [{finish_reason: 'stop', message: {content: 'बजट बनाने का उदाहरण।'}}]});
  };
  const explain = createGuideHandler({provider, getToken: () => 'sandbox-key'});
  const budget = 'topic=budget&language=hi';
  assert.equal((await explain(request(budget, {method:'POST'}))).status, 405);
  assert.equal((await explain(request(budget + '&question=custom'))).status, 400);
  assert.equal((await explain(request('topic=other&language=hi'))).status, 400);
  assert.equal((await explain(request('topic=upi&language=other'))).status, 400);
  assert.equal(calls.length, 0);
  const results = await Promise.all([explain(request(budget)), explain(request(budget))]);
  for (const result of results) {
    const payload = await result.json();
    assert.equal(payload.kind, 'ai');
    assert.equal(payload.answer, 'बजट बनाने का उदाहरण।');
    assert.match(result.headers.get('Vercel-CDN-Cache-Control'), /s-maxage=/);
  }
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://ai-gateway.vercel.sh/v1/chat/completions');
  assert.match(calls[0].body.messages[0].content, /natural Hindi.*मासिक बजट/);
  assert.match(calls[0].body.messages[1].content, /one clearly fictional example/);
});

test('public guide returns labeled examples if credentials are absent or the output is unusable', async () => {
  const noCredentials = createGuideHandler({getToken: () => ''});
  const response = await noCredentials(request('topic=upi&language=en'));
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  const fallback = await response.json();
  assert.equal(fallback.kind, 'guide');
  assert.match(fallback.answer, /₹500 incoming payment/);
  const provider = async () => Response.json({choices: [{finish_reason:'length', message:{content:'Partial answer'}}]});
  const explain = createGuideHandler({provider, getToken: () => 'sandbox-key'});
  const incomplete = await (await explain(request('topic=savings&language=hi'))).json();
  assert.equal(incomplete.kind, 'guide');
  assert.match(incomplete.answer, /₹1,200 जमा/);
});
