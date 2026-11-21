/**
 * The pre-dawn rule, in one place.
 *
 * The Hindu day runs sunrise to sunrise, so between civil midnight and that
 * day's sunrise it is still YESTERDAY's — a festival kept last night is the one
 * running, not whatever the new calendar date carries. The Panchang tab's
 * ribbon and the Home strip both read this, so they cannot disagree about which
 * observance is on at 1 AM.
 *
 * Pure and tiny on purpose: the Home strip is on the launch graph.
 */

/** True while `now` is before the civil day's own sunrise. */
export function isPreDawn(sunrise: Date | null | undefined, now: number = Date.now()): boolean {
  return sunrise != null && now < sunrise.getTime();
}

/** How a carried-over observance is named: "जन्माष्टमी की रात्रि" / "Janmashtami night". */
export function tonightTitle(rule: { nameHi: string; nameEn: string }): { hi: string; en: string } {
  return { hi: `${rule.nameHi} की रात्रि`, en: `${rule.nameEn} night` };
}
