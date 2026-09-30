// Visit counter for Cloudflare Pages — same contract as the Netlify version in
// netlify-functions/hits.mjs, so script.js does not care which host serves it.
//
// Integers in a D1 table bound as DB: a site total and one count per real
// page. Nothing about the visitor is stored. D1 rather than KV because KV
// caches reads per location for up to a minute, so a burst of visitors (a
// shared post) all read the same number and overwrite each other's +1. Here
// the increment happens inside SQLite, so no visit is lost.

const PAGES = new Set([
  '/', '/privacy/', '/terms/', '/support/', '/get/',
  '/hi/', '/hi/privacy/', '/hi/terms/', '/hi/support/',
]);

const HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };

const BUMP = 'INSERT INTO hits (k, n) VALUES (?1, 1) ON CONFLICT(k) DO UPDATE SET n = n + 1 RETURNING n';
const READ = 'SELECT n FROM hits WHERE k = ?1';

export async function onRequest({ request, env }) {
  if (request.method !== 'GET' && request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { allow: 'GET, POST' } });
  }
  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'counter storage not bound' }), { status: 503, headers: HEADERS });
  }

  const raw = new URL(request.url).searchParams.get('p') || '/';
  const page = PAGES.has(raw) ? raw : null;
  const keys = page ? ['total', `page:${page}`] : ['total'];
  const sql = request.method === 'POST' ? BUMP : READ;

  const results = await env.DB.batch(keys.map((k) => env.DB.prepare(sql).bind(k)));
  const [total, count] = results.map((r) => (r.results[0] ? Number(r.results[0].n) : 0));

  return new Response(JSON.stringify({ total, page, count: page ? count : null }), { status: 200, headers: HEADERS });
}
