/* Cloudflare Worker: pembantu AI untuk dashboard, guna Gemini.
   Kunci API disimpan sebagai Secret di Cloudflare, TIDAK dalam laman.
   Tetapan > Variables and Secrets:
     GEMINI_API_KEY  (Secret)  kunci Gemini BARU anda
     ALLOWED_ORIGIN  (Text)    cth. https://namaanda.github.io
     GEMINI_MODEL    (Text)    pilihan; semak nama model semasa di Google AI Studio */
export default {
  async fetch(req, env) {
    const origin = env.ALLOWED_ORIGIN || '*';
    const cors = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });
    if (origin !== '*' && req.headers.get('Origin') !== origin)
      return new Response('Forbidden', { status: 403, headers: cors });

    let input = '';
    try { input = String((await req.json()).input || '').slice(0, 12000); } catch (e) {}
    if (!input) return new Response('Bad request', { status: 400, headers: cors });

    const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: input }] }] })
      }
    );
    if (r.status === 429) return new Response('Rate limited', { status: 429, headers: cors });
    if (!r.ok) return new Response('Upstream error', { status: 502, headers: cors });
    const j = await r.json();
    const text = (j.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
    return new Response(JSON.stringify({ text }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  }
};
