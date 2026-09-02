/**
 * आज का विधान — the Phase 2 briefing (PRD-41 §6). Not a new engine: a fixed
 * set of STANDING QUESTIONS asked on the user's behalf through the same
 * resolver the search box uses, so every card here is an answer card and every
 * improvement to an intent improves the briefing for free.
 *
 * Pure (no React). Loaded lazily by `TodayVidhanScreen` through a dynamic
 * import, like `engine.ts` — it must never sit on the launch graph (§13.7),
 * and the screen computes it after interactions, never on the mount frame.
 */
import { getObservancesForDate, getUpcomingObservances } from '@/panchang/festivalEngine';
import { askQuestion } from './engine';
import type { AskAnswer, AskContext, Localized } from './types';

export type BriefingSection = {
  key: string;
  heading: Localized;
  answer: AskAnswer;
};

/** Days ahead the "coming up" card may look when nothing is observed today. */
export const BRIEFING_LOOKAHEAD_DAYS = 7;

function answerOf(question: string, ctx: AskContext): AskAnswer | null {
  const r = askQuestion(question, ctx);
  return r.kind === 'answer' ? r.answer : null;
}

export function composeBriefing(ctx: AskContext): BriefingSection[] {
  const out: BriefingSection[] = [];
  const push = (key: string, heading: Localized, answer: AskAnswer | null) => {
    if (answer) out.push({ key, heading, answer });
  };

  // 1. What is today.
  push('day', { hi: 'आज', en: 'Today' }, answerOf('आज की तिथि क्या है', ctx));

  // 2. What today asks of me — the observance being kept, or the next one coming.
  const today = new Date(ctx.now);
  today.setHours(0, 0, 0, 0);
  const todays = getObservancesForDate(today, ctx.calendarSystem, ctx.location);
  if (todays.length > 0) {
    push(
      'observance',
      { hi: 'आज का व्रत / पर्व', en: "Today's observance" },
      answerOf('कब है', { ...ctx, seed: { type: 'observance', id: todays[0].rule.id } })
    );
  } else {
    const upcoming = getUpcomingObservances(today, 3, ctx.calendarSystem, BRIEFING_LOOKAHEAD_DAYS, ctx.location).find(
      (o) => o.date.getTime() > today.getTime()
    );
    if (upcoming) {
      push(
        'upcoming',
        { hi: 'आगे आ रहा है', en: 'Coming up' },
        answerOf('कब है', { ...ctx, seed: { type: 'observance', id: upcoming.rule.id } })
      );
    }
  }

  // 3. The day's windows.
  push('muhurat', { hi: 'शुभ-अशुभ समय', en: "Today's windows" }, answerOf('राहु काल कब है', ctx));

  // 4. What is due in my sankalp — only when one is running.
  push('sadhana', { hi: 'आपका संकल्प', en: 'Your sankalp' }, answerOf('मेरा संकल्प कितना हुआ', ctx));

  return out;
}

export const briefing = { composeBriefing };
export type BriefingModule = typeof briefing;
