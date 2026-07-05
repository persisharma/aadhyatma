/**
 * Display helpers for muhurat times. Pure — 12-hour clock with AM/PM, matching
 * the Panchang tab's existing time cells.
 */
export function formatClock(d: Date): string {
  let h = d.getHours();
  const m = d.getMinutes();
  const pm = h >= 12;
  h %= 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, '0')} ${pm ? 'PM' : 'AM'}`;
}

export function formatRange(a: Date, b: Date): string {
  return `${formatClock(a)} – ${formatClock(b)}`;
}
