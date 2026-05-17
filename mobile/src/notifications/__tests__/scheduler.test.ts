import assert from 'node:assert/strict';

import {
  applyQuietHours,
  computeFireDates,
  formatNotificationContent,
  IOS_PENDING_CAP,
  ROLLING_WINDOW_DAYS,
} from '../pure';
import { hashDateKey, pickVerseForDateKey, toDateKey } from '../seed';
import type { UniformVerse } from '@/data/versePool';

// Rolling window is well under the iOS pending-notification cap.
{
  assert.ok(
    ROLLING_WINDOW_DAYS <= IOS_PENDING_CAP,
    'ROLLING_WINDOW_DAYS must be ≤ IOS_PENDING_CAP to stay within iOS limits'
  );
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

// applyQuietHours: non-wrapping window shifts time forward to quietEnd.
{
  const shifted = applyQuietHours(
    { hour: 5, minute: 30 },
    { hour: 5, minute: 0 },
    { hour: 8, minute: 0 }
  );
  assert.deepEqual(shifted, { hour: 8, minute: 0 });
}

// applyQuietHours: wrapping window (22:00 → 06:00). Time inside wraps to quietEnd.
{
  const shiftedEarly = applyQuietHours(
    { hour: 5, minute: 0 },
    { hour: 22, minute: 0 },
    { hour: 6, minute: 0 }
  );
  assert.deepEqual(shiftedEarly, { hour: 6, minute: 0 });

  const shiftedLate = applyQuietHours(
    { hour: 23, minute: 0 },
    { hour: 22, minute: 0 },
    { hour: 6, minute: 0 }
  );
  assert.deepEqual(shiftedLate, { hour: 6, minute: 0 });
}

// applyQuietHours: time outside wrapping window is preserved verbatim.
{
  const preserved = applyQuietHours(
    { hour: 7, minute: 0 },
    { hour: 22, minute: 0 },
    { hour: 6, minute: 0 }
  );
  assert.deepEqual(preserved, { hour: 7, minute: 0 });
}

// applyQuietHours: time exactly at quietEnd is preserved (boundary is exclusive end).
{
  const atBoundary = applyQuietHours(
    { hour: 6, minute: 0 },
    { hour: 22, minute: 0 },
    { hour: 6, minute: 0 }
  );
  assert.deepEqual(atBoundary, { hour: 6, minute: 0 });
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

// formatNotificationContent produces Hindi-led title + verse + source label body.
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
  const { title, body } = formatNotificationContent(verse);
  assert.equal(title, 'दैनिक भक्ति');
  assert.ok(body.includes('कर्मण्येवाधिकारस्ते'));
  assert.ok(body.includes('Bhagavad Gītā'));
  assert.ok(body.includes('Shloka 2.47'));
}
