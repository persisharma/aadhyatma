/**
 * Pure view-model for the Today's Practice screen (PRD-10). Keeping the summary
 * lines, the "offered" item tail, and the mala-bead math out of the component
 * makes them unit-testable without a provider tree (same convention as
 * `components/routineBannerView.ts`). No React, no theme — strings only.
 *
 * Numerals stay Western in both languages, matching the existing screen
 * (`{done}/{total}`); only the surrounding words branch on language.
 */

export type PracticeSummary = {
  /** Headline, e.g. "4 of 6" or "6 of 6 offered". */
  big: string;
  /** Sub-line, e.g. "2 readings remaining" or "Today's practice is complete". */
  sub: string;
  /** True only when there is something scheduled and all of it is offered. */
  allDone: boolean;
};

/** Headline + sub-line for the completion summary card. */
export function practiceSummary(doneCount: number, total: number, isHi: boolean): PracticeSummary {
  const allDone = total > 0 && doneCount >= total;
  if (allDone) {
    return {
      allDone: true,
      big: isHi ? `${total} में से ${total} अर्पित` : `${total} of ${total} offered`,
      sub: isHi ? 'आज की साधना पूर्ण' : "Today's practice is complete",
    };
  }
  const remaining = Math.max(0, total - doneCount);
  return {
    allDone: false,
    big: isHi ? `${total} में से ${doneCount}` : `${doneCount} of ${total}`,
    sub: isHi
      ? `${remaining} पाठ शेष`
      : `${remaining} reading${remaining === 1 ? '' : 's'} remaining`,
  };
}

/**
 * Formats an epoch-ms completion time as a 12-hour clock, e.g. "7:12 AM".
 * Returns null for a missing/sentinel time (0 = "offered, time unknown" — a
 * migrated legacy mark or an auto-japam completion that carries no timestamp),
 * so callers fall back to a plain "offered".
 */
export function formatOfferedTime(ms: number | undefined, isHi: boolean): string | null {
  if (ms == null || ms <= 0 || !Number.isFinite(ms)) return null;
  const d = new Date(ms);
  let h = d.getHours();
  const m = d.getMinutes();
  const isPm = h >= 12;
  h %= 12;
  if (h === 0) h = 12;
  const mm = String(m).padStart(2, '0');
  if (isHi) return `${h}:${mm} ${isPm ? 'अपराह्न' : 'पूर्वाह्न'}`;
  return `${h}:${mm} ${isPm ? 'PM' : 'AM'}`;
}

/** The state tail shown on an item row: "offered 7:12 AM" / "offered" / "Tap to read". */
export function offeredTail(done: boolean, doneAt: number | undefined, isHi: boolean): string {
  if (!done) return isHi ? 'पढ़ने के लिए टैप करें' : 'Tap to read';
  const t = formatOfferedTime(doneAt, isHi);
  if (t) return isHi ? `${t} · अर्पित` : `offered ${t}`;
  return isHi ? 'अर्पित' : 'offered';
}

export type MalaBeads = {
  /** Beads drawn lit, capped at `capacity`. */
  lit: number;
  /** Total beads drawn (excludes the meru). */
  capacity: number;
  /** Index of the most-recent lit bead (the one that pulses), or -1 if none. */
  todayIndex: number;
  /** True when the streak is 0 (draw an all-unlit "start your mala" string). */
  empty: boolean;
};

/**
 * Bead layout for the mala streak strip. The numeric streak label stays
 * authoritative; the strip caps at `capacity` beads so a long streak doesn't
 * overflow the row. The most-recent lit bead is flagged for a gentle pulse.
 */
export function malaBeads(streak: number, capacity = 7): MalaBeads {
  const lit = Math.max(0, Math.min(streak, capacity));
  return { lit, capacity, todayIndex: lit - 1, empty: streak <= 0 };
}

/** Label beside the mala, e.g. "7 day mala" / "start your mala today". */
export function malaLabel(streak: number, isHi: boolean): string {
  if (streak <= 0) return isHi ? 'आज से माला आरम्भ करें' : 'Start your mala today';
  if (isHi) return `${streak} दिन की माला`;
  return `${streak} day mala`;
}
