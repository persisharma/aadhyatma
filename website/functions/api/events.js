import { normalizeBatch, RETENTION_MS } from '../../app/analytics/core.mjs';
const json = (body,status=200) => new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Robots-Tag':'noindex'}});
export async function onRequestPost({request,env}) {
  if(!env.DB) return json({error:'Analytics storage is not configured'},503);
  if(request.headers.get('Origin') !== new URL(request.url).origin) return json({error:'Same-origin requests only'},403);
  // Enforce the limit while reading, including chunked requests.
  const reader = request.body?.getReader();
  if(!reader) return json({error:'Missing body'},400);
  let size=0, chunks=[];
  for(;;) { const {value,done}=await reader.read(); if(done) break; size+=value.length; if(size>65536) { await reader.cancel(); return json({error:'Batch too large'},413); } chunks.push(value); }
  const bytes = new Uint8Array(size); let offset=0;
  for(const chunk of chunks) { bytes.set(chunk,offset); offset+=chunk.length; }
  let batch;
  try { batch=normalizeBatch(JSON.parse(new TextDecoder().decode(bytes))); }
  catch { return json({error:'Invalid events'},400); }
  if(!batch.length) return json({accepted:0},202);
  try {
    await env.DB.batch([...batch.map(e=>env.DB.prepare('INSERT OR IGNORE INTO website_events (id, ts, payload) VALUES (?1, ?2, ?3)').bind(e.id,e.ts,JSON.stringify(e))),env.DB.prepare('DELETE FROM website_events WHERE ts < ?1').bind(Date.now()-RETENTION_MS)]);
    return json({accepted:batch.length},202);
  } catch { return json({error:'Unable to save events'},503); }
}
