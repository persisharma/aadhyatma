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
  thumb: 'ह',
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
  thumb: 'भ',
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

/**
 * Navratri — nine days of Durga worship, calendar-anchored to the festival.
 * Each day rotates through existing Durga content (Chalisa, aarti, and stotras)
 * so the nine nights carry variety without new content.
 */
const NAVRATRI_DAYS: RoutineItem[] = [
  { id: 'durga-chalisa', kind: 'section', sourceId: 'durga-chalisa' },
  { id: 'jai-ambe-gauri', kind: 'section', sourceId: 'jai-ambe-gauri' },
  { id: 'durga-stotram-1', kind: 'chapter', sourceId: 'durga-stotram', chapter: 1 },
  { id: 'durga-stotram-2', kind: 'chapter', sourceId: 'durga-stotram', chapter: 2 },
  { id: 'durga-stotram-3', kind: 'chapter', sourceId: 'durga-stotram', chapter: 3 },
  { id: 'durga-chalisa-repeat', kind: 'section', sourceId: 'durga-chalisa' },
  { id: 'jai-ambe-gauri-repeat', kind: 'section', sourceId: 'jai-ambe-gauri' },
  { id: 'durga-stotram-2-repeat', kind: 'chapter', sourceId: 'durga-stotram', chapter: 2 },
  { id: 'durga-stotram-3-repeat', kind: 'chapter', sourceId: 'durga-stotram', chapter: 3 },
];

const NAVRATRI_9: SadhanaProgram = {
  id: 'navratri-durga-9',
  titleHi: 'नवरात्रि — नौ दिन दुर्गा आराधना',
  titleEn: 'Navratri — Nine Days of Durga',
  thumb: 'दु',
  subtitleHi: 'नवरात्रि से जुड़ा संकल्प',
  subtitleEn: 'A sankalp anchored to Navratri',
  deity: 'durga',
  introHi:
    'नवरात्रि के नौ दिन मां दुर्गा की आराधना का संकल्प। चालीसा, आरती और स्तोत्रों से प्रत्येक दिन का पाठ खुलता है — संकल्प नवरात्रि आरम्भ होते ही जागृत होता है।',
  introEn:
    'A vow to worship Maa Durga through the nine nights of Navratri — each day opens a Chalisa, aarti, or stotram reading. The sankalp awakens when Navratri begins.',
  cadence: { kind: 'festival-window', days: 9, anchorRuleId: 'navratri-start' },
  days: NAVRATRI_DAYS.map((base, i): { items: RoutineItem[] } => {
    // Unique item id per day so completion keys don't collide across the window.
    return { items: [{ ...base, id: `navratri-${i + 1}` }] };
  }),
};

/** Shravan Somvar — a Monday vow through the month of Shravan. */
const SHRAVAN_SOMVAR: SadhanaProgram = {
  id: 'shravan-somvar',
  titleHi: 'सावन सोमवार — शिव संकल्प',
  titleEn: 'Shravan Somvar — Shiva Vow',
  thumb: 'शि',
  subtitleHi: 'श्रावण के हर सोमवार',
  subtitleEn: 'Every Monday of Shravan',
  deity: 'shiva',
  introHi:
    'श्रावण मास के प्रत्येक सोमवार शिव चालीसा का पाठ करने का संकल्प। पाठ केवल सोमवार को खुलता है — शेष दिन विश्राम।',
  introEn:
    'A vow to recite the Shiv Chalisa each Monday of the month of Shravan. The reading opens only on Somvar — other days rest.',
  cadence: { kind: 'weekday', weekday: 1, count: 4, anchorRuleId: 'sawan-somwar-vrat' },
  day: { items: [{ id: 'shiv-chalisa', kind: 'section', sourceId: 'shiv-chalisa' }] },
};

export const SADHANA_PROGRAMS: readonly SadhanaProgram[] = [
  HANUMAN_41,
  GITA_18,
  NAVRATRI_9,
  SHRAVAN_SOMVAR,
];

export function getProgram(id: string): SadhanaProgram | undefined {
  return SADHANA_PROGRAMS.find((p) => p.id === id);
}
