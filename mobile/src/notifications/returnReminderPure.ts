/**
 * Pure, side-effect-free planner for return reminders (वापसी स्मरण).
 *
 * A return reminder is the "we miss you" nudge: it fires only when the app has
 * NOT been opened for a while. The mechanism is the classic local-notification
 * trick — every app open (cold start or foreground) cancels the family and
 * re-arms it from today, so the earliest slot is always `RETURN_INTERVAL_DAYS`
 * after the last open, and a user who keeps coming back never hears it at all.
 * Nothing is persisted; the pending queue IS the state.
 *
 * Every slot carries the copy for the weekday it lands on — the presiding vaar
 * deity from `data/routine/vaar.ts` and an invitation to a bundled text for that
 * deity — because "आज मंगलवार, हनुमान चालीसा का दिन" is a reason to open the app
 * today, whereas a generic "come back" is spam. A tap lands on Home, whose
 * FOR TODAY row leads with the same weekday deity's texts on an ordinary day.
 *
 * Deterministic and dependency-free — no `expo-notifications`, no astronomy, no
 * `Date.now()` — so it can be unit-tested via `tsx` without bootstrapping React
 * Native. `now` is always parameterised.
 */

import type { Lang } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';

/** Identifier prefix for all return reminders. Lets us cancel just ours. */
export const RETURN_NOTIF_PREFIX = 'return-reminder';

/** Days of silence before the first nudge, and between consecutive nudges. */
export const RETURN_INTERVAL_DAYS = 3;

/**
 * How many nudges are armed per re-arm — i.e. the ladder is 3, 6, 9, 12 and 15
 * days after the last open, then silence. Two reasons it is not longer: the
 * shared iOS budget of 64 pending notifications is already tight across the
 * families (see design.md §38), and a user who has ignored five nudges over two
 * weeks has answered; a sixth is nagging, not a reminder.
 */
export const RETURN_REMINDER_CAP = 5;

/**
 * Local fire time. After the daily-verse default (07:00) and the festive slot
 * (07:30) so an absent user with those still armed never gets two pushes in the
 * same instant, and early enough to still be "this morning's practice".
 */
export const RETURN_HOUR = 8;
export const RETURN_MINUTE = 0;

export type ReturnReminderCopy = {
  /** Weekday + presiding deity, e.g. `मंगलवार · हनुमान का दिन`. */
  titleHi: string;
  titleEn: string;
  /** One-line invitation naming a bundled text for that deity. */
  bodyHi: string;
  bodyEn: string;
  /**
   * `LibraryEntry.id`s the body names. Not used for routing (a tap lands on
   * Home) — kept so `returnReminderPure.test.ts` can hold the copy to texts
   * the app actually ships, the same seam `festiveReminders.test.ts` provides.
   */
  sourceIds: readonly string[];
};

/**
 * Hand-authored copy per weekday (0 = Sunday … 6 = Saturday), aligned with
 * `VAAR_DEITY` / `WEEKDAY_DEITY_LABEL` in `data/routine/vaar.ts`. hi/en only:
 * gu/kn are re-scripted from the Devanagari at format time via `contentByLang`,
 * like every other content-bearing notification string.
 */
export const RETURN_REMINDER_COPY: Readonly<Record<number, ReturnReminderCopy>> = {
  0: {
    titleHi: 'रविवार · सूर्य देव का दिन',
    titleEn: "Sunday · Surya's day",
    bodyHi: 'सूर्याष्टकम् के साथ दिन का आरंभ करें — कुछ ही मिनट की साधना।',
    bodyEn: 'Begin the day with the Surya Ashtakam — a few minutes of practice.',
    sourceIds: ['surya-ashtakam'],
  },
  1: {
    titleHi: 'सोमवार · शिव का दिन',
    titleEn: "Monday · Shiva's day",
    bodyHi: 'रुद्राष्टकम् का पाठ करें — शिव की शरण में मन शांत होता है।',
    bodyEn: "Read the Rudrashtakam — the mind settles in Shiva's refuge.",
    sourceIds: ['rudrashtakam'],
  },
  2: {
    titleHi: 'मंगलवार · हनुमान का दिन',
    titleEn: "Tuesday · Hanuman's day",
    bodyHi: 'हनुमान चालीसा का पाठ करें — बल, बुद्धि और निर्भयता का दिन।',
    bodyEn: 'Read the Hanuman Chalisa — a day for strength, wisdom and courage.',
    sourceIds: ['hanuman-chalisa'],
  },
  3: {
    titleHi: 'बुधवार · गणेश का दिन',
    titleEn: "Wednesday · Ganesha's day",
    bodyHi: 'गणेश चालीसा से विघ्न दूर करें — आज की साधना प्रतीक्षा में है।',
    bodyEn: "Clear the way with the Ganesh Chalisa — today's practice is waiting.",
    sourceIds: ['ganesh-chalisa'],
  },
  4: {
    titleHi: 'गुरुवार · विष्णु का दिन',
    titleEn: "Thursday · Vishnu's day",
    bodyHi: 'विष्णु चालीसा या विष्णु सहस्रनाम — कुछ मिनट भगवान के नामों के साथ।',
    bodyEn: "The Vishnu Chalisa or Sahasranama — a few minutes with the Lord's names.",
    sourceIds: ['vishnu-chalisa', 'vishnu-sahasranama'],
  },
  5: {
    titleHi: 'शुक्रवार · दुर्गा का दिन',
    titleEn: "Friday · Durga's day",
    bodyHi: 'दुर्गा चालीसा का पाठ करें — माँ की कृपा का दिन।',
    bodyEn: "Read the Durga Chalisa — a day for the Mother's grace.",
    sourceIds: ['durga-chalisa'],
  },
  6: {
    titleHi: 'शनिवार · शनि देव · हनुमान का दिन',
    titleEn: "Saturday · Shani Dev & Hanuman's day",
    bodyHi: 'शनि अष्टकम् या हनुमान चालीसा — शनिवार की साधना के लिए कुछ मिनट।',
    bodyEn: "The Shani Ashtakam or Hanuman Chalisa — a few minutes for Saturday's practice.",
    sourceIds: ['shani-ashtakam', 'hanuman-chalisa'],
  },
};

export type PlannedReturnNotification = {
  identifier: string;
  fireDate: Date;
  /** Local `YYYY-MM-DD` of the fire day. */
  dateKey: string;
  /** `fireDate.getDay()` — selects the copy. */
  weekday: number;
  /** Whole days since the re-arm the slot belongs to: 3, 6, 9, … */
  absentDays: number;
};

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Plan the ladder of return reminders from `now`: one slot every `intervalDays`
 * local days at `RETURN_HOUR:RETURN_MINUTE`, `cap` slots in total, the first
 * `intervalDays` days after today. Slots are counted in calendar days (not
 * 72-hour multiples) so a fire day's weekday copy is exact, and because the
 * planner has no memory of the last open, the caller MUST cancel the family
 * before scheduling the result — see `returnScheduler.ts`.
 */
export function planReturnReminders(
  now: Date,
  cap: number = RETURN_REMINDER_CAP,
  intervalDays: number = RETURN_INTERVAL_DAYS
): PlannedReturnNotification[] {
  const base = startOfLocalDay(now);
  const planned: PlannedReturnNotification[] = [];
  for (let i = 1; i <= cap; i += 1) {
    const absentDays = i * intervalDays;
    const fire = new Date(base);
    fire.setDate(fire.getDate() + absentDays);
    fire.setHours(RETURN_HOUR, RETURN_MINUTE, 0, 0);
    // Cannot be in the past for any intervalDays ≥ 1, but a defensive skip
    // keeps a mis-configured caller from scheduling an immediate fire.
    if (fire.getTime() <= now.getTime()) continue;
    const dateKey = toDateKey(fire);
    planned.push({
      identifier: `${RETURN_NOTIF_PREFIX}:${dateKey}`,
      fireDate: fire,
      dateKey,
      weekday: fire.getDay(),
      absentDays,
    });
  }
  return planned;
}

/** Copy for one planned slot, in the reading language (gu/kn derived from hi). */
export function formatReturnReminderContent(
  p: PlannedReturnNotification,
  lang: Lang = 'hi'
): { title: string; body: string } {
  const copy = RETURN_REMINDER_COPY[p.weekday];
  return {
    title: contentByLang(lang, copy.titleHi, copy.titleEn),
    body: contentByLang(lang, copy.bodyHi, copy.bodyEn),
  };
}
