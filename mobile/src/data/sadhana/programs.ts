/**
 * The bundled Sadhana Program catalog (संकल्प). See PRD-11 §5.1.
 *
 * Every program references EXISTING library content by id — no new content is
 * authored here. Phase 1 ships two `consecutive` reading programs; festival /
 * weekday cadences are Phase 4.
 */
import type { RoutineItem } from '@/data/routine/types';
import type { SadhanaProgram } from './types';

/** Hanuman Chalisa — the same whole-text pāṭh every day, for 41 days. */
const HANUMAN_41: SadhanaProgram = {
  id: 'hanuman-41',
  titleHi: 'हनुमान चालीसा — ४१ दिन',
  titleEn: 'Hanuman Chalisa — 41 Days',
  subtitleHi: 'इकतालीस दिन का संकल्प',
  subtitleEn: 'A 41-day sankalp',
  deity: 'hanuman',
  introHi:
    'इकतालीस दिन तक प्रतिदिन हनुमान चालीसा का पाठ करने का संकल्प लें। कोई दिन छूट जाए तो साधना रुकती है, टूटती नहीं — अगले दिन वहीं से आगे बढ़ें।',
  introEn:
    'Take a sankalp to recite the Hanuman Chalisa once every day for 41 days. Miss a day and the vow pauses, it does not break — pick up the next day where you left off.',
  cadence: { kind: 'consecutive', days: 41 },
  day: { items: [{ id: 'hanuman-chalisa', kind: 'section', sourceId: 'hanuman-chalisa' }] },
};

/** Bhagavad Gītā — one chapter a day, chapters 1…18. */
const GITA_18: SadhanaProgram = {
  id: 'gita-18',
  titleHi: 'श्रीमद्भगवद्गीता — १८ दिनों में',
  titleEn: 'Bhagavad Gītā — in 18 Days',
  subtitleHi: 'प्रतिदिन एक अध्याय',
  subtitleEn: 'One chapter each day',
  deity: 'krishna',
  introHi:
    'अठारह दिनों में सम्पूर्ण गीता — प्रतिदिन एक अध्याय। ७०१ श्लोक अठारह सहज दिनों में पूर्ण होते हैं।',
  introEn:
    'The whole Gītā in eighteen days — one chapter a day. 701 verses become eighteen achievable days.',
  cadence: { kind: 'consecutive', days: 18 },
  days: Array.from({ length: 18 }, (_, i): { items: RoutineItem[] } => ({
    items: [
      {
        id: `gita-ch-${i + 1}`,
        kind: 'chapter',
        sourceId: 'bhagavad-gita',
        chapter: i + 1,
      },
    ],
  })),
};

export const SADHANA_PROGRAMS: readonly SadhanaProgram[] = [HANUMAN_41, GITA_18];

export function getProgram(id: string): SadhanaProgram | undefined {
  return SADHANA_PROGRAMS.find((p) => p.id === id);
}
