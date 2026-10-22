import { summarize, RETENTION_MS } from '../../app/analytics/core.mjs';
const json = (body,status=200) => new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Robots-Tag':'noindex'}});
export async function onRequestGet({request,env}) {
  if(!env.ANALYTICS_ADMIN_TOKEN || env.ANALYTICS_ADMIN_TOKEN.length < 32) return json({error:'Owner access is not configured'},503);
  const token=request.headers.get('Authorization')?.replace(/^Bearer /,'') || '';
  const encoder=new TextEncoder();
  const [a,b] = await Promise.all([crypto.subtle.digest('SHA-256',encoder.encode(token)),crypto.subtle.digest('SHA-256',encoder.encode(env.ANALYTICS_ADMIN_TOKEN))]);
  let diff=0; const aa=new Uint8Array(a),bb=new Uint8Array(b);
  for(let i=0;i<aa.length;i++) diff |= aa[i]^bb[i];
  if(diff) return json({error:'Owner access required'},401);
  if(!env.DB) return json({error:'Analytics storage is not configured'},503);
  try {
    const {results}=await env.DB.prepare('SELECT payload FROM website_events WHERE ts >= ?1 ORDER BY ts DESC LIMIT 100001').bind(Date.now()-RETENTION_MS).all();
    const truncated=results.length>100000;
    return json({...summarize(results.slice(0,100000).map(row=>JSON.parse(row.payload)),Object.fromEntries(new URL(request.url).searchParams)),mode:'production',storage:'First-party website events · 30-day retention',truncated});
  } catch { return json({error:'Unable to read stats'},503); }
}
