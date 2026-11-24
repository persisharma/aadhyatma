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
