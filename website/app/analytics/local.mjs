import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { timingSafeEqual } from 'node:crypto';
import { normalizeBatch, summarize, RETENTION_MS } from './core.mjs';
export function analyticsPlugin(options = {}) {
  const file = options.file || resolve('.local/analytics.json');
  let chain = Promise.resolve();
  async function read() {
    try { return JSON.parse(await readFile(file, 'utf8')); }
    catch (e) { if (e.code === 'ENOENT') return []; throw e; }
  }
  const middleware = async (req, res, next) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/hits') {
      // Preview only: show the live site's all-time counter, read-only. Never forwards
      // a POST, so previewing can't add visits to the real counts.
      if (req.method !== 'GET' || url.searchParams.get('all') !== '1') { res.writeHead(405, { 'Content-Type':'application/json' }); return res.end('{"error":"Read-only in preview"}'); }
      try {
        const live = await fetch('https://vedansh.app/api/hits?all=1', { headers: { 'Cache-Control':'no-store' } });
        res.writeHead(live.ok ? 200 : 502, { 'Content-Type':'application/json', 'Cache-Control':'no-store', 'X-Robots-Tag':'noindex', 'X-Vedansh-Hits-Source':'vedansh.app' });
        return res.end(await live.text());
      } catch { res.writeHead(502, { 'Content-Type':'application/json' }); return res.end('{"error":"Live counter unreachable"}'); }
    }
    if (!['/api/events','/api/stats'].includes(url.pathname)) return next();
    const send = (code, body) => { res.writeHead(code, { 'Content-Type':'application/json', 'Cache-Control':'no-store', 'X-Robots-Tag':'noindex' }); res.end(JSON.stringify(body)); };
    try {
      if (url.pathname === '/api/stats') {
        if(req.method !== 'GET') return send(405, {error:'Method not allowed'});
        const loopback = ['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
        const expected = process.env.ANALYTICS_ADMIN_TOKEN;
        const supplied = req.headers.authorization?.replace(/^Bearer /,'') || '';
        const authorized = expected && supplied.length === expected.length && timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
        if(!loopback && !authorized) return send(401,{error:'Owner access required'});
        await chain;
        return send(200, {...summarize(await read(), Object.fromEntries(url.searchParams)), mode:'local', storage:'Local preview data · retained for 30 days'});
      }
      if(req.method !== 'POST') return send(405,{error:'Method not allowed'});
      if(!req.headers.origin || new URL(req.headers.origin).host !== req.headers.host) return send(403,{error:'Same-origin requests only'});
      let size = 0, chunks = [];
      for await(const chunk of req) { size += chunk.length; if(size > 65536) return send(413,{error:'Batch too large'}); chunks.push(chunk); }
      const batch = normalizeBatch(JSON.parse(Buffer.concat(chunks).toString()));
      const operation = chain.then(async () => {
        const rows = (await read()).filter(e => e.ts > Date.now()-RETENTION_MS);
        const ids = new Set(rows.map(e => e.id));
        for(const e of batch) if(!ids.has(e.id)) { rows.push(e); ids.add(e.id); }
        await mkdir(dirname(file),{recursive:true});
        await writeFile(file+'.tmp', JSON.stringify(rows.slice(-100000)));
        await rename(file+'.tmp',file);
      });
      chain = operation.catch(() => {});
      await operation;
      send(202,{accepted:batch.length});
    } catch(e) { send(e instanceof SyntaxError || /Invalid|Expected/.test(e.message) ? 400 : 500,{error:'Unable to process analytics request'}); }
  };
  return { name:'vedansh-first-party-analytics', configureServer(server) { server.middlewares.use(middleware); }, configurePreviewServer(server) { server.middlewares.use(middleware); } };
}
