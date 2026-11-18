const DEFAULT_MODELS = ['gemini-3.8-flash'];

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function modelList(env) {
  const raw = (env.GEMINI_MODEL || '').split(',').map(s => s.trim()).filter(Boolean);
  return raw.length ? raw : DEFAULT_MODELS;
}

async function gemini(env, model, input) {
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: input }] }] })
    }
  );
}

export default {
  async fetch(req, env) {
    const origin = env.ALLOWED_ORIGIN || '*';
    const cors = corsHeaders(origin);
    const hasOrigin = req.headers.get('Origin') !== null;
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (hasOrigin && origin !== '*' && req.headers.get('Origin') !== origin)
      return new Response('Forbidden', { status: 403, headers: cors });

    if (req.method === 'GET') {
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', {
        headers: { 'x-goog-api-key': env.GEMINI_API_KEY }
      });
      const body = await r.text();
      if (!r.ok) return new Response('Gemini ' + r.status + ': ' + body.slice(0, 500), { status: 502, headers: cors });
      let names = [];
      try {
        names = (JSON.parse(body).models || [])
          .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
          .map(m => String(m.name || '').replace(/^models\//, ''));
      } catch (e) {}
      return new Response(JSON.stringify({ models: names }), {
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });

    let input = '';
    try { input = String((await req.json()).input || '').slice(0, 12000); } catch (e) {}
    if (!input) return new Response('Bad request', { status: 400, headers: cors });

    let lastStatus = 0, lastBody = '';
    for (const model of modelList(env)) {
      for (let attempt = 0; attempt < 2; attempt++) {
        const r = await gemini(env, model, input);
        if (r.ok) {
          const j = await r.json();
          const text = (j.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
          return new Response(JSON.stringify({ text }), { headers: { ...cors, 'Content-Type': 'application/json' } });
        }
        lastStatus = r.status; lastBody = await r.text();
        if (r.status !== 503 && r.status !== 429) break;
        await new Promise(res => setTimeout(res, 800));
      }
      if (lastStatus === 404) continue;
      if (lastStatus !== 503 && lastStatus !== 429) break;
    }
    if (lastStatus === 429) return new Response('Rate limited', { status: 429, headers: cors });
    return new Response('Gemini ' + lastStatus + ': ' + lastBody.slice(0, 500), { status: 502, headers: cors });
  }
};
