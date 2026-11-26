// Cloudflare Worker bound to a Vedansh-owned D1 database. No public read endpoint.
const actions = new Set([
  'kundali_generated',
  'panchang_today_viewed',
  'gita_read',
  'other_read',
  'bead_counted',
  'bookmark_saved',
  'share_handoff',
  'routine_completed',
]);
const fields = ['id', 'cohort', 'version', 'build', 'fact', 'action', 'firstSession'];

export function validEvent(e, now) {
  if (
    !e ||
    typeof e !== 'object' ||
    Object.keys(e).length !== fields.length ||
    !fields.every((k) => Object.hasOwn(e, k))
  )
    return false;
  if (
    typeof e.id !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(e.id) ||
    typeof e.version !== 'string' ||
    !/^\d{1,4}\.\d{1,4}\.\d{1,4}$/.test(e.version) ||
    typeof e.build !== 'string' ||
    !/^\d{1,10}$/.test(e.build) ||
    typeof e.firstSession !== 'boolean' ||
    typeof e.cohort !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(e.cohort)
  )
    return false;
  const start = Date.parse(e.cohort);
  if (!Number.isFinite(start) || new Date(start).toISOString().slice(0, 10) !== e.cohort) return false;
  const elapsed = Math.floor((now + 330 * 60_000) / 86_400_000) - start / 86_400_000;
  if (elapsed < 0 || elapsed > 45) return false;
  if (e.fact === 'first_open') return e.action === null && !e.firstSession;
  if (e.fact === 'first_action') return actions.has(e.action);
  return (
    e.fact === 'day7_return' &&
    elapsed >= 7 &&
    (e.action === null ? !e.firstSession : actions.has(e.action))
  );
}

export default {
  async fetch(req, env) {
    if (new URL(req.url).pathname !== '/events') return new Response(null, { status: 404 });
    if (req.method !== 'POST') return new Response(null, { status: 405 });
    if (!req.headers.get('Content-Type')?.startsWith('application/json'))
      return new Response(null, { status: 415 });
    const reader = req.body?.getReader();
    if (!reader) return new Response(null, { status: 400 });
    let size = 0,
      raw = '';
    const decoder = new TextDecoder();
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 768) {
        await reader.cancel();
        return new Response(null, { status: 413 });
      }
      raw += decoder.decode(value, { stream: true });
    }
    let e;
    try {
      e = JSON.parse(raw + decoder.decode());
    } catch {
      return new Response(null, { status: 400 });
    }
    if (!validEvent(e, Date.now())) return new Response(null, { status: 400 });
    await env.DB.prepare(
      'INSERT INTO retention_events(id,cohort,version,build,fact,action,first_session) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING',
    )
      .bind(e.id, e.cohort, e.version, e.build, e.fact, e.action, Number(e.firstSession))
      .run();
    return new Response(null, { status: 204 });
  },
  async scheduled(_event, env) {
    await env.DB.prepare(
      "DELETE FROM retention_events WHERE cohort < date('now','+330 minutes','-45 days')",
    ).run();
  },
};
