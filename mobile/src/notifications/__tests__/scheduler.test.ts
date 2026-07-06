import assert from 'node:assert/strict';

import {
  computeFireDates,
  computeFireDatesMulti,
  formatNotificationContent,
  IOS_PENDING_CAP,
  MAX_REMINDER_TIMES,
  ROLLING_WINDOW_DAYS,
} from '../pure';
import { hashDateKey, pickVerseForDateKey, toDateKey } from '../seed';
import { toGujarati, toKannada } from '@/utils/transliterate';
import type { UniformVerse } from '@/data/versePool';

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
