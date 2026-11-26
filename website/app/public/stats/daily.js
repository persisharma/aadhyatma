// Daily visits on /stats/: the counter's `days` rows (India-time dates) turned
// into one bar per day. Pure functions so the node tests can check them.
const DAY_MS = 86400000;
const IST_OFFSET_MS = 330 * 60000;

export const istToday = (now = Date.now()) => new Date(now + IST_OFFSET_MS).toISOString().slice(0, 10);

// From the first counted day up to today, at most `limit` days; a day with no
// row had no visits (the counter was already running), so it shows as 0.
export function dailySeries(rows, today, limit = 30) {
  if (!rows || !rows.length) return [];
  const counts = new Map(rows.map((r) => [r.name, Number(r.count)]));
  const first = Date.parse(rows.map((r) => r.name).sort()[0]);
  const end = Date.parse(today);
  const start = Math.max(first, end - (limit - 1) * DAY_MS);
  const series = [];
  for (let t = start; t <= end; t += DAY_MS) {
    const date = new Date(t).toISOString().slice(0, 10);
    series.push({ date, count: counts.get(date) || 0 });
  }
  return series;
}

// Where each day's visits came from. The counter's `daySources` rows are
// { date, kind: 'get' | 'site', source: utm_source or 'direct', count }. They
// fold into four fixed channels (stacked bottom to top in this order); visits
// counted before the counter wrote `dsrc:` rows stay `unsplit`.
export const CHANNELS = [
  { id: 'direct', label: 'Direct / untagged' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'other', label: 'Other campaigns' },
  { id: 'get', label: 'Download link /get/' },
];
const INSTAGRAM = new Set(['instagram', 'ig', 'insta']);
export const channelOf = (kind, source) => (kind === 'get' ? 'get' : source === 'direct' ? 'direct' : INSTAGRAM.has(source) ? 'instagram' : 'other');

export function splitBySource(series, daySources = []) {
  const byDate = new Map();
  for (const r of daySources || []) {
    if (!byDate.has(r.date)) byDate.set(r.date, []);
    byDate.get(r.date).push({ kind: r.kind, source: r.source, count: Number(r.count) });
  }
  return series.map((d) => {
    const rows = byDate.get(d.date) || [];
    const parts = { direct: 0, instagram: 0, other: 0, get: 0, unsplit: 0 };
    for (const r of rows) parts[channelOf(r.kind, r.source)] += r.count;
    parts.unsplit = Math.max(0, d.count - CHANNELS.reduce((sum, c) => sum + parts[c.id], 0));
    const tags = rows.filter((r) => r.source !== 'direct').sort((a, b) => b.count - a.count);
    return { ...d, parts, tags };
  });
}
