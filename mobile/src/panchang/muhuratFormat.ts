/**
 * Display helpers for muhurat times. Pure — 12-hour clock with AM/PM, matching
 * the Panchang tab's existing time cells.
 */
/** 12-hour clock with AM/PM. Null → '' (matches the Panchang tab's time cells). */
export function formatClock(d: Date | null): string {
  if (!d) return '';
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function formatRange(a: Date, b: Date): string {
  return `${formatClock(a)} – ${formatClock(b)}`;
}
