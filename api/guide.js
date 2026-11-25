import { guideExampleQuestion, guideExamples, guideInstructions, topics } from '../public/guide.js';

const model = 'google/gemini-2.5-flash-lite';
const gatewayUrl = 'https://ai-gateway.vercel.sh/v1/chat/completions';
const day = 86_400_000;

function gatewayToken(request) {
  return (process.env.VERCEL === '1' && request.headers.get('x-vercel-oidc-token')) ||
    process.env.VERCEL_OIDC_TOKEN || process.env.AI_GATEWAY_API_KEY;
}

export function createGuideHandler({ provider = fetch, getToken = gatewayToken } = {}) {
  const recent = new Map();

  async function generate(topic, language, token) {
    try {
      const upstream = await provider(gatewayUrl, {
        method: 'POST',
        headers: {Authorization: 'Bearer ' + token, 'Content-Type': 'application/json'},
        signal: AbortSignal.timeout(10_000),
        body: JSON.stringify({
          model,
          max_tokens: 450,
          messages: [
            {role: 'system', content: guideInstructions(topic, language)},
            {role: 'user', content: guideExampleQuestion}
          ]
        })
      });
      if (!upstream.ok) {
        const {error} = await upstream.json().catch(() => ({}));
        const code = error?.type;
        console.warn('MoneyGuide gateway returned', upstream.status,
          typeof code === 'string' && /^[a-z_]{1,60}$/.test(code) ? code : '');
        return '';
      }
      const {choices} = await upstream.json();
      const choice = choices?.[0];
      const answer = choice?.message?.content;
      if (choice?.finish_reason !== 'stop' || typeof answer !== 'string') return '';
      const text = answer.trim();
      return text.length <= 2200 && (language !== 'hi' || /[\u0900-\u097f]/u.test(text)) ? text : '';
    } catch {
      console.warn('MoneyGuide gateway request failed');
      return '';
    }
  }

  return async function explainGuide(request) {
    if (request.method !== 'GET') {
      return Response.json({error: 'Choose a lesson to explain'}, {status: 405, headers: {Allow: 'GET'}});
    }
    const {search, searchParams} = new URL(request.url);
    const topic = topics.find(item => item.id === searchParams.get('topic'));
    const language = searchParams.get('language');
    // Use one public cache key per lesson and language.
    if (!topic || !['en','hi'].includes(language) || search !== `?topic=${topic.id}&language=${language}`) {
      return Response.json({error: 'Unknown lesson or language'}, {status: 400});
    }
    const token = getToken(request);
    let answer = '';
    if (token) {
      let entry = recent.get(search);
      if (!entry || entry.until <= Date.now()) {
        entry = {until: Date.now() + 30_000, answer: generate(topic, language, token)};
        recent.set(search, entry);
        entry.answer.then(text => { if (text) entry.until = Date.now() + day; });
      }
      answer = await entry.answer;
    }
    if (!answer) {
      return Response.json({kind: 'guide', answer: guideExamples[topic.id][language === 'hi' ? 1 : 0]}, {
        headers: {'Cache-Control': 'no-store'}
      });
    }
    return Response.json({kind: 'ai', answer, model}, {
      headers: {
        'Cache-Control': 'public, max-age=300',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=86400'
      }
    });
  };
}

export default {fetch: createGuideHandler()};
