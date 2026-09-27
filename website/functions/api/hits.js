// Visit counter for Cloudflare Pages — same contract as the Netlify version in
// netlify-functions/hits.mjs, so script.js does not care which host serves it.
//
// Integers in a Workers KV namespace bound as HITS: a site total and one count
// per real page. Nothing about the visitor is stored. KV is eventually
// consistent, so two visits within a second or so of each other can land as
// one — acceptable for a visitor counter.

const PAGES = new Set([
  '/', '/privacy/', '/terms/', '/support/', '/get/',
  '/hi/', '/hi/privacy/', '/hi/terms/', '/hi/support/',
]);

const HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };

export async function onRequest({ request, env }) {
  if (request.method !== 'GET' && request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { allow: 'GET, POST' } });
  }
  if (!env.HITS) {
    return new Response(JSON.stringify({ error: 'counter storage not bound' }), { status: 503, headers: HEADERS });
  }

  const raw = new URL(request.url).searchParams.get('p') || '/';
  const page = PAGES.has(raw) ? raw : null;
  const read = async (key) => {
    const n = Number(await env.HITS.get(key));
    return Number.isFinite(n) ? n : 0;
  };

  let total = await read('total');
  let count = page ? await read(`page:${page}`) : null;

  if (request.method === 'POST') {
    total += 1;
    await env.HITS.put('total', String(total));
    if (page) {
      count += 1;
      await env.HITS.put(`page:${page}`, String(count));
    }
  }
  return new Response(JSON.stringify({ total, page, count }), { status: 200, headers: HEADERS });
}
