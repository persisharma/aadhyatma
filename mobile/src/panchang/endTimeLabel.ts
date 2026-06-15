// Tithi and Nakshatra can be "vriddhi" (swollen) — long enough to be present at two
// consecutive sunrises, so the same anga shows on two days and its end time lands on
// the day AFTER the one being viewed. The end-time label drops the date, so "तक 7:38 AM"
// on the first day looks like today's 7:38 AM when it's really the next morning. These
// helpers let the tile flag that. Pure (no RN imports) so it's covered under tsx --test.

// Whole-day difference between two dates in LOCAL time (calendar days, not 24h spans).
export function localDayDelta(end: Date, base: Date): number {
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  const b = new Date(base.getFullYear(), base.getMonth(), base.getDate()).getTime();
  return Math.round((e - b) / 86400000);
}

// True when `end` falls on a later calendar day than `base` (i.e. the anga ends the
// next day or later relative to the day being viewed).
export function endsAfterDay(end: Date | null, base: Date): boolean {
  return end !== null && localDayDelta(end, base) >= 1;
}
