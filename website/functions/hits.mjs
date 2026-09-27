// Site visit counter — the only server-side code the site has.
//
// A single counter per page plus a site total, kept in Netlify Blobs (site-
// scoped, so it survives deploys). Nothing about the visitor is stored: no IP,
// no user agent, no cookie, no identifier of any kind — the store holds
// integers and nothing else.
//
// POST increments and returns the counts; GET only reads them. The page
// decides which to send (see script.js: one POST per browser session).
//
// Blobs has no atomic increment. Strong consistency makes each request see the
// previous request's write, so only genuinely simultaneous visits can lose a
// count — an acceptable trade for a visitor counter against running a
// database.

import { getStore } from '@netlify/blobs';

// Only real pages get their own counter; everything else lands in the total,
// so a crawler probing junk paths cannot grow the store without bound.
const PAGES = new Set([
  '/', '/privacy/', '/terms/', '/support/', '/get/',
  '/hi/', '/hi/privacy/', '/hi/terms/', '/hi/support/',
]);

const HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

async function read(store, key) {
  const value = await store.get(key, { type: 'json' });
  return value && Number.isFinite(value.n) ? value.n : 0;
}

export default async (request) => {
  if (request.method !== 'GET' && request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { allow: 'GET, POST' } });
  }

  const url = new URL(request.url);
  const raw = url.searchParams.get('p') || '/';
  const page = PAGES.has(raw) ? raw : null;
  const store = getStore({ name: 'hits', consistency: 'strong' });

  let total = await read(store, 'total');
  let count = page ? await read(store, `page:${page}`) : null;

  if (request.method === 'POST') {
    total += 1;
    await store.setJSON('total', { n: total });
    if (page) {
      count += 1;
      await store.setJSON(`page:${page}`, { n: count });
    }
  }

  return new Response(JSON.stringify({ total, page, count }), { status: 200, headers: HEADERS });
};

export const config = { path: '/api/hits' };
