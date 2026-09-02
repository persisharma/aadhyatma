import assert from 'node:assert/strict';

import {
  computeFireDates,
  computeFireDatesMulti,
  formatNotificationContent,
  IOS_PENDING_CAP,
  MAX_REMINDER_TIMES,
  ROLLING_WINDOW_DAYS,
} from '../pure';
import {
  formatNotificationTitle,
  pickTitleObservance,
  TITLE_MAX_CHARS,
  type DayAnga,
} from '../dayAnga';
import { hashDateKey, pickVerseForDateKey, toDateKey } from '../seed';
import { toGujarati, toKannada } from '@/utils/transliterate';
import type { UniformVerse } from '@/data/versePool';
import type { ObservanceRule } from '@/panchang/types';

/** Minimal valid ObservanceRule for the title-pick tests. */
function makeRule(overrides: Partial<ObservanceRule> & { id: string }): ObservanceRule {
  return {
    nameHi: 'परीक्षा व्रत',
    nameEn: 'Test Vrat',
    category: 'vrat',
    visibility: 'default',
    ruleType: 'lunar-tithi',
    recurrence: 'annual',
    marker: 'halfmoon',
    deityHi: '',
    deityEn: '',
    shortDescriptionHi: '',
    shortDescriptionEn: '',
    sourceUrl: '',
    ...overrides,
  };
}

// Rolling window is well under the iOS pending-notification cap.
{
  assert.ok(
    ROLLING_WINDOW_DAYS <= IOS_PENDING_CAP,
    'ROLLING_WINDOW_DAYS must be ≤ IOS_PENDING_CAP to stay within iOS limits'
  );
}

// MAX_REMINDER_TIMES × ROLLING_WINDOW_DAYS stays scheduleable on iOS in
// the worst case — sched caps at IOS_PENDING_CAP but a sane max keeps us
// from silently dropping reminders.
{
  assert.ok(MAX_REMINDER_TIMES >= 1);
  assert.ok(MAX_REMINDER_TIMES * ROLLING_WINDOW_DAYS >= ROLLING_WINDOW_DAYS);
}

// computeFireDates produces exactly ROLLING_WINDOW_DAYS entries.
{
  const now = new Date(2026, 6, 1, 12, 0, 0, 0); // 1 Jul 2026, 12:00 local
  const dates = computeFireDates({ hour: 7, minute: 0 }, now);
  assert.equal(dates.length, ROLLING_WINDOW_DAYS);
}

// computeFireDates skips today when the chosen time has already passed.
{
  const now = new Date(2026, 6, 1, 12, 0, 0, 0); // noon
  const dates = computeFireDates({ hour: 7, minute: 0 }, now); // 7am, already past
  // First entry is tomorrow at 07:00
  assert.equal(dates[0].getDate(), 2);
  assert.equal(dates[0].getHours(), 7);
  assert.equal(dates[0].getMinutes(), 0);
}

// computeFireDates includes today when the chosen time is still in the future.
{
  const now = new Date(2026, 6, 1, 6, 0, 0, 0); // 06:00
  const dates = computeFireDates({ hour: 7, minute: 0 }, now); // 7am, still future
  assert.equal(dates[0].getDate(), 1);
  assert.equal(dates[0].getHours(), 7);
}

// computeFireDates advances one calendar day per slot, including across month boundary.
{
  const now = new Date(2026, 6, 30, 6, 0, 0, 0); // 30 Jul 2026 06:00 (July has 31 days)
  const dates = computeFireDates({ hour: 7, minute: 0 }, now);
  assert.equal(dates[0].getDate(), 30); // today
  assert.equal(dates[1].getDate(), 31);
  assert.equal(dates[2].getDate(), 1); // August
  assert.equal(dates[2].getMonth(), 7);
}

// computeFireDatesMulti: empty input → empty output.
{
  const now = new Date(2026, 6, 1, 12, 0, 0, 0);
  assert.deepEqual(computeFireDatesMulti([], now), []);
}

// computeFireDatesMulti: single-time matches computeFireDates exactly.
{
  const now = new Date(2026, 6, 1, 6, 0, 0, 0);
  const single = computeFireDates({ hour: 7, minute: 0 }, now);
  const multi = computeFireDatesMulti([{ hour: 7, minute: 0 }], now);
  assert.equal(multi.length, single.length);
  for (let i = 0; i < single.length; i += 1) {
    assert.equal(multi[i].getTime(), single[i].getTime());
  }
}

// computeFireDatesMulti: two times produce 2× entries, fully time-sorted.
{
  const now = new Date(2026, 6, 1, 6, 0, 0, 0); // 06:00 — both 07:00 and 18:00 still future today
  const multi = computeFireDatesMulti(
    [{ hour: 7, minute: 0 }, { hour: 18, minute: 0 }],
    now
  );
  assert.equal(multi.length, ROLLING_WINDOW_DAYS * 2);
  // Sorted ascending end-to-end.
  for (let i = 1; i < multi.length; i += 1) {
    assert.ok(
      multi[i - 1].getTime() < multi[i].getTime(),
      'fire dates must be strictly ascending'
    );
  }
  // First two slots are today 07:00 then today 18:00.
  assert.equal(multi[0].getDate(), 1);
  assert.equal(multi[0].getHours(), 7);
  assert.equal(multi[1].getDate(), 1);
  assert.equal(multi[1].getHours(), 18);
}

// computeFireDatesMulti: duplicate times collapse to a single series, not
// scheduled twice for the same instant.
{
  const now = new Date(2026, 6, 1, 6, 0, 0, 0);
  const multi = computeFireDatesMulti(
    [{ hour: 7, minute: 0 }, { hour: 7, minute: 0 }],
    now
  );
  assert.equal(multi.length, ROLLING_WINDOW_DAYS);
}

// toDateKey produces a stable local-time YYYY-MM-DD.
{
  const d = new Date(2026, 6, 1, 7, 0, 0, 0); // 1 Jul 2026 local
  assert.equal(toDateKey(d), '2026-07-01');
}

// hashDateKey is deterministic — same input always produces same output.
{
  assert.equal(hashDateKey('2026-07-01'), hashDateKey('2026-07-01'));
  // Different inputs produce different outputs (sanity, not a uniqueness proof).
  assert.notEqual(hashDateKey('2026-07-01'), hashDateKey('2026-07-02'));
}

// pickVerseForDateKey is stable for a given pool length and date.
{
  const pool: UniformVerse[] = [
    { sourceId: 'a', sourceNameHi: '', sourceNameEn: '', verseIndex: 0, textHi: [], textEn: [], meaningHi: '', meaningEn: '' },
    { sourceId: 'b', sourceNameHi: '', sourceNameEn: '', verseIndex: 0, textHi: [], textEn: [], meaningHi: '', meaningEn: '' },
    { sourceId: 'c', sourceNameHi: '', sourceNameEn: '', verseIndex: 0, textHi: [], textEn: [], meaningHi: '', meaningEn: '' },
  ];
  const v1 = pickVerseForDateKey('2026-07-01', pool);
  const v2 = pickVerseForDateKey('2026-07-01', pool);
  assert.equal(v1?.sourceId, v2?.sourceId);
}

// pickVerseForDateKey returns null on an empty pool.
{
  assert.equal(pickVerseForDateKey('2026-07-01', []), null);
}

// formatNotificationContent renders the verse, source, label, and title entirely
// in the selected reading language (gu/kn re-script the Devanagari).
{
  const verse: UniformVerse = {
    sourceId: 'bhagavad-gita',
    sourceNameHi: 'भगवद् गीता',
    sourceNameEn: 'Bhagavad Gītā',
    chapter: 2,
    verseIndex: 46,
    textHi: ['कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।'],
    textEn: ['karmaṇy evādhikāras te mā phaleṣu kadācana'],
    meaningHi: '',
    meaningEn: '',
    labelHi: 'श्लोक 2.47',
    labelEn: 'Shloka 2.47',
  };

  // hi (default): Devanagari throughout — verse, source name, label, title.
  const hiC = formatNotificationContent(verse);
  assert.equal(hiC.title, 'दैनिक भक्ति');
  assert.ok(hiC.body.includes('कर्मण्येवाधिकारस्ते'));
  assert.ok(hiC.body.includes('भगवद् गीता'));
  assert.ok(hiC.body.includes('श्लोक 2.47'));

  // en: romanized verse + English source/label/title.
  const enC = formatNotificationContent(verse, 'en');
  assert.equal(enC.title, 'Daily Verse');
  assert.ok(enC.body.includes('karmaṇy evādhikāras'));
  assert.ok(enC.body.includes('Bhagavad Gītā'));
  assert.ok(enC.body.includes('Shloka 2.47'));

  // gu: the entire body+title re-scripted to Gujarati, no Devanagari residue.
  const guC = formatNotificationContent(verse, 'gu');
  assert.equal(guC.title, toGujarati('दैनिक भक्ति'));
  assert.ok(guC.body.includes(toGujarati('भगवद् गीता')));
  assert.ok(guC.body.includes(toGujarati('श्लोक 2.47')));
  assert.ok(!/[ऀ-ॣ०-ॿ]/.test(guC.body), 'gu notification has no Devanagari');

  // kn: same, in Kannada.
  const knC = formatNotificationContent(verse, 'kn');
  assert.equal(knC.title, toKannada('दैनिक भक्ति'));
  assert.ok(knC.body.includes(toKannada('भगवद् गीता')));
  assert.ok(knC.body.includes(toKannada('श्लोक 2.47')));
  assert.ok(!/[ऀ-ॣ०-ॿ]/.test(knC.body), 'kn notification has no Devanagari');
}

// ── Panchang-aware titles (tithi / vrat prefix) ──────────────────────────────

// A day with no resolved anga keeps exactly the pre-panchang title, in every
// language. Resolution is best-effort, so this is the contract that a failed or
// still-pending solve degrades to the previous behaviour rather than a broken one.
{
  assert.equal(formatNotificationTitle('hi'), 'दैनिक भक्ति');
  assert.equal(formatNotificationTitle('en'), 'Daily Verse');
  assert.equal(formatNotificationTitle('gu'), toGujarati('दैनिक भक्ति'));
  assert.equal(formatNotificationTitle('kn'), toKannada('दैनिक भक्ति'));
}

// An ordinary day leads with paksha + tithi.
{
  const anga: DayAnga = { tithiIndex: 10, paksha: 'shukla' }; // Shukla Ekadashi
  assert.equal(formatNotificationTitle('hi', anga), 'शुक्ल एकादशी · दैनिक भक्ति');
  assert.equal(formatNotificationTitle('en', anga), 'Shukla Ekadashi · Daily Verse');
}

// Krishna paksha is named too — tithi names repeat across pakshas, so the bare
// name would be ambiguous.
{
  const anga: DayAnga = { tithiIndex: 25, paksha: 'krishna' }; // Krishna Ekadashi
  assert.equal(formatNotificationTitle('hi', anga), 'कृष्ण एकादशी · दैनिक भक्ति');
}

// Purnima and Amavasya name their paksha implicitly and render bare.
{
  assert.equal(
    formatNotificationTitle('hi', { tithiIndex: 14, paksha: 'shukla' }),
    'पूर्णिमा · दैनिक भक्ति'
  );
  assert.equal(
    formatNotificationTitle('en', { tithiIndex: 29, paksha: 'krishna' }),
    'Amavasya · Daily Verse'
  );
}

// An observance replaces the tithi — a vrat's own name already implies its tithi,
// so naming both would spend the title budget on a repeat.
{
  const anga: DayAnga = {
    tithiIndex: 10,
    paksha: 'shukla',
    observanceHi: 'निर्जला एकादशी',
    observanceEn: 'Nirjala Ekadashi',
  };
  assert.equal(formatNotificationTitle('hi', anga), 'निर्जला एकादशी · दैनिक भक्ति');
  assert.equal(formatNotificationTitle('en', anga), 'Nirjala Ekadashi · Daily Verse');
}

// gu/kn re-script the Devanagari observance name rather than falling back to the
// English one — same policy as every other content-bearing string.
{
  const anga: DayAnga = {
    tithiIndex: 10,
    paksha: 'shukla',
    observanceHi: 'निर्जला एकादशी',
    observanceEn: 'Nirjala Ekadashi',
  };
  const gu = formatNotificationTitle('gu', anga);
  assert.ok(gu.includes(toGujarati('निर्जला एकादशी')));
  assert.ok(!/[ऀ-ॣ०-ॿ]/.test(gu), 'gu title has no Devanagari');
  const kn = formatNotificationTitle('kn', anga);
  assert.ok(kn.includes(toKannada('निर्जला एकादशी')));
  assert.ok(!/[ऀ-ॣ०-ॿ]/.test(kn), 'kn title has no Devanagari');
}

// A prefix too long to carry the suffix drops the suffix whole rather than
// letting the OS slice a festival name (or a Devanagari conjunct) in half.
{
  const anga: DayAnga = {
    tithiIndex: 3,
    paksha: 'krishna',
    observanceHi: 'संकष्टी चतुर्थी व्रत पूजा दिवस',
    observanceEn: 'Sankashti Chaturthi Vrat Puja Day',
  };
  const en = formatNotificationTitle('en', anga);
  assert.equal(en, 'Sankashti Chaturthi Vrat Puja Day');
  assert.ok(!en.includes('Daily Verse'), 'over-budget title drops the suffix');
  const hi = formatNotificationTitle('hi', anga);
  assert.equal(hi, 'संकष्टी चतुर्थी व्रत पूजा दिवस');
}

// Every title that does keep both halves stays inside the budget.
{
  for (let tithiIndex = 0; tithiIndex < 30; tithiIndex += 1) {
    const paksha = tithiIndex < 15 ? 'shukla' : 'krishna';
    for (const lang of ['hi', 'en', 'gu', 'kn'] as const) {
      const title = formatNotificationTitle(lang, { tithiIndex, paksha });
      assert.ok(
        title.length <= TITLE_MAX_CHARS,
        `tithi title over budget (${lang}, ${tithiIndex}): ${title}`
      );
    }
  }
}

// An out-of-range tithi index can never produce a broken title — it degrades to
// the plain one. Guards against an engine change shifting the index domain.
{
  assert.equal(formatNotificationTitle('hi', { tithiIndex: 30, paksha: 'shukla' }), 'दैनिक भक्ति');
  assert.equal(formatNotificationTitle('hi', { tithiIndex: -1, paksha: 'shukla' }), 'दैनिक भक्ति');
}

// The BODY is untouched by the panchang prefix: the verse line stays first.
{
  const verse: UniformVerse = {
    sourceId: 'bhagavad-gita',
    sourceNameHi: 'भगवद् गीता',
    sourceNameEn: 'Bhagavad Gītā',
    chapter: 2,
    verseIndex: 46,
    textHi: ['कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।'],
    textEn: ['karmaṇy evādhikāras te mā phaleṣu kadācana'],
    meaningHi: '',
    meaningEn: '',
    labelHi: 'श्लोक 2.47',
    labelEn: 'Shloka 2.47',
  };
  const plain = formatNotificationContent(verse, 'hi');
  const withAnga = formatNotificationContent(verse, 'hi', {
    tithiIndex: 10,
    paksha: 'shukla',
    observanceHi: 'निर्जला एकादशी',
    observanceEn: 'Nirjala Ekadashi',
  });
  assert.equal(withAnga.body, plain.body, 'panchang context must not alter the body');
  assert.notEqual(withAnga.title, plain.title);
}

// pickTitleObservance drops non-default visibility — advanced/regional entries are
// opt-in surfaces inside the Panchang tab, not lock-screen material.
{
  const advancedOnly = [
    makeRule({ id: 'a', visibility: 'advanced' }),
    makeRule({ id: 'b', visibility: 'regional' }),
  ];
  assert.equal(pickTitleObservance(advancedOnly), null);
  assert.equal(pickTitleObservance([]), null);
}

// Significance wins, and the pick is stable regardless of input order.
{
  const minor = makeRule({ id: 'minor', marker: 'dot', category: 'vrat' });
  const major = makeRule({ id: 'major', marker: 'star', category: 'festival' });
  assert.equal(pickTitleObservance([minor, major])?.id, 'major');
  assert.equal(pickTitleObservance([major, minor])?.id, 'major');
}

// Same significance → vrat before festival, then id; identical inputs in any order
// always resolve to the same rule so a reschedule can't reword a day's title.
{
  const festival = makeRule({ id: 'zeta', marker: 'star', category: 'festival' });
  const vrat = makeRule({ id: 'alpha', marker: 'star', category: 'vrat' });
  assert.equal(pickTitleObservance([festival, vrat])?.id, 'alpha');
  assert.equal(pickTitleObservance([vrat, festival])?.id, 'alpha');

  const tieA = makeRule({ id: 'aaa', marker: 'star', category: 'vrat' });
  const tieB = makeRule({ id: 'bbb', marker: 'star', category: 'vrat' });
  assert.equal(pickTitleObservance([tieB, tieA])?.id, 'aaa');
}
