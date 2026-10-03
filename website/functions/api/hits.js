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
const SOURCE = /^[a-z0-9][a-z0-9_.-]{0,39}$/;

export async function onRequest({ request, env }) {
  if (request.method !== 'GET' && request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { allow: 'GET, POST' } });
  }
  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'counter storage not bound' }), { status: 503, headers: HEADERS });
  }

  const params = new URL(request.url).searchParams;

  // The stats page: every row, totals first, then pages, then campaign sources.
  if (request.method === 'GET' && params.has('all')) {
    const { results } = await env.DB.prepare('SELECT k, n FROM hits ORDER BY n DESC').all();
    const pick = (prefix) => results.filter((r) => r.k.startsWith(prefix))
      .map((r) => ({ name: r.k.slice(prefix.length), count: Number(r.n) }));
    const total = Number((results.find((r) => r.k === 'total') || { n: 0 }).n);
    return new Response(JSON.stringify({ total, pages: pick('page:'), sources: pick('src:') }), { status: 200, headers: HEADERS });
  }

  const raw = params.get('p') || '/';
  const page = PAGES.has(raw) ? raw : null;
  const keys = page ? ['total', `page:${page}`] : ['total'];
  const sql = request.method === 'POST' ? BUMP : READ;

  // Campaign source of a /get/ visit (its utm_source), counted on its own row.
  // Short slugs only, so a stray link cannot fill the table with junk keys.
  const src = (params.get('src') || '').toLowerCase();
  if (page === '/get/' && request.method === 'POST' && SOURCE.test(src)) keys.push(`src:${src}`);

  const results = await env.DB.batch(keys.map((k) => env.DB.prepare(sql).bind(k)));
  const [total, count] = results.map((r) => (r.results[0] ? Number(r.results[0].n) : 0));

  return new Response(JSON.stringify({ total, page, count: page ? count : null }), { status: 200, headers: HEADERS });
}
