import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { library } from '@/data/texts';
import { VAAR_DEITY, WEEKDAY_DEITY_LABEL } from '@/data/routine/vaar';
import {
  RETURN_HOUR,
  RETURN_INTERVAL_DAYS,
  RETURN_MINUTE,
  RETURN_NOTIF_PREFIX,
  RETURN_REMINDER_CAP,
  RETURN_REMINDER_COPY,
  formatReturnReminderContent,
  planReturnReminders,
} from '../returnReminderPure';

const DAY_MS = 24 * 60 * 60 * 1000;

// A Friday evening — late enough in the day that "today" must not be a slot.
const FRIDAY_NIGHT = new Date(2026, 8, 4, 22, 45); // 4 Sep 2026, 22:45 local

describe('planReturnReminders', () => {
  test('arms the full ladder: cap slots, one every interval, at the fixed morning time', () => {
    const planned = planReturnReminders(FRIDAY_NIGHT);
    assert.equal(planned.length, RETURN_REMINDER_CAP);

    planned.forEach((p, i) => {
      const expectedAbsent = (i + 1) * RETURN_INTERVAL_DAYS;
      assert.equal(p.absentDays, expectedAbsent);
      assert.equal(p.fireDate.getHours(), RETURN_HOUR);
      assert.equal(p.fireDate.getMinutes(), RETURN_MINUTE);
      assert.equal(p.fireDate.getSeconds(), 0);
      // Calendar-day spacing from the start of "today", not 72-hour multiples.
      const startOfToday = new Date(2026, 8, 4);
      const expectedDay = new Date(startOfToday);
      expectedDay.setDate(expectedDay.getDate() + expectedAbsent);
      assert.equal(p.fireDate.getFullYear(), expectedDay.getFullYear());
      assert.equal(p.fireDate.getMonth(), expectedDay.getMonth());
      assert.equal(p.fireDate.getDate(), expectedDay.getDate());
    });
  });

  test('the first slot is never sooner than the interval — an active user hears nothing', () => {
    for (const now of [
      new Date(2026, 8, 4, 0, 1), // just after midnight
      new Date(2026, 8, 4, 7, 59), // a minute before the fire time
      new Date(2026, 8, 4, 8, 0), // exactly at the fire time
      FRIDAY_NIGHT,
    ]) {
      const [first] = planReturnReminders(now);
      const gapDays = (first.fireDate.getTime() - now.getTime()) / DAY_MS;
      // ≥ (interval − 1) days + the remaining part of today — i.e. strictly more
      // than two full days for a three-day interval, whatever the time of day.
      assert.ok(gapDays > RETURN_INTERVAL_DAYS - 1, `gap ${gapDays} for ${now.toISOString()}`);
      assert.ok(first.fireDate.getTime() > now.getTime());
    }
  });

  test('every slot is strictly in the future and identifiers are unique under the family prefix', () => {
    const planned = planReturnReminders(FRIDAY_NIGHT);
    const ids = new Set(planned.map((p) => p.identifier));
    assert.equal(ids.size, planned.length);
    for (const p of planned) {
      assert.ok(p.identifier.startsWith(`${RETURN_NOTIF_PREFIX}:`));
      assert.ok(p.identifier.endsWith(p.dateKey));
      assert.ok(p.fireDate.getTime() > FRIDAY_NIGHT.getTime());
      assert.equal(p.weekday, p.fireDate.getDay());
    }
  });

  test('weekday follows the fire date: a Friday re-arm lands on Mon, Thu, Sun, Wed, Sat', () => {
    const planned = planReturnReminders(FRIDAY_NIGHT);
    assert.deepEqual(
      planned.map((p) => p.weekday),
      [1, 4, 0, 3, 6]
    );
  });

  test('honours a smaller cap / different interval', () => {
    const planned = planReturnReminders(FRIDAY_NIGHT, 2, 7);
    assert.equal(planned.length, 2);
    assert.deepEqual(planned.map((p) => p.absentDays), [7, 14]);
    // Same weekday as the re-arm day for a 7-day interval.
    assert.ok(planned.every((p) => p.weekday === FRIDAY_NIGHT.getDay()));
  });

  test('a re-arm on a DST-free month never drifts the fire hour', () => {
    // Walk a whole year of re-arm days; every slot must still say 08:00 local.
    for (let d = 0; d < 366; d += 7) {
      const now = new Date(2026, 0, 1 + d, 12, 0);
      for (const p of planReturnReminders(now)) {
        assert.equal(p.fireDate.getHours(), RETURN_HOUR);
        assert.equal(p.fireDate.getMinutes(), RETURN_MINUTE);
      }
    }
  });
});

describe('RETURN_REMINDER_COPY', () => {
  const ENTRY_BY_ID = new Map(library.map((e) => [e.id, e] as const));

  test('covers all seven weekdays with non-empty hi/en title and body', () => {
    for (let wd = 0; wd < 7; wd += 1) {
      const c = RETURN_REMINDER_COPY[wd];
      assert.ok(c, `no copy for weekday ${wd}`);
      for (const s of [c.titleHi, c.titleEn, c.bodyHi, c.bodyEn]) {
        assert.ok(s.trim().length > 0);
      }
    }
  });

  test('each weekday title names the vaar deity the routine builder suggests', () => {
    for (let wd = 0; wd < 7; wd += 1) {
      const c = RETURN_REMINDER_COPY[wd];
      const label = WEEKDAY_DEITY_LABEL[wd];
      assert.ok(c.titleHi.includes(label.hi), `${c.titleHi} should name ${label.hi}`);
      // The en label for Saturday is "Shani Dev · Hanuman"; the title uses "&".
      const enHead = label.en.split(' · ')[0];
      assert.ok(c.titleEn.includes(enHead), `${c.titleEn} should name ${enHead}`);
    }
  });

  test('every named text is a shipped, active library entry for that weekday deity', () => {
    for (let wd = 0; wd < 7; wd += 1) {
      const c = RETURN_REMINDER_COPY[wd];
      assert.ok(c.sourceIds.length > 0);
      for (const id of c.sourceIds) {
        const entry = ENTRY_BY_ID.get(id);
        assert.ok(entry, `weekday ${wd} names unknown text ${id}`);
        assert.notEqual(entry.status, 'inactive', `${id} is not active`);
        // Home's FOR TODAY row leads with `VAAR_DEITY[wd]` on an ordinary day, so a
        // text the message names should be tagged with that deity to be waiting
        // there after the tap. Two documented exceptions: Saturday names Shani's
        // own text (Home surfaces Saturday via Hanuman, the shipped VAAR_DEITY[6]),
        // and Sunday names the Surya Ashtakam, tagged `surya` — the vaar map still
        // says `savitr` (Gayatri) from before the PRD-A deity expansion added a
        // separate `surya` id. The title says सूर्य देव, so the text is right; the
        // vaar map is the thing that has drifted (flagged, not fixed here).
        const allowed = new Set<string>([
          VAAR_DEITY[wd],
          ...(wd === 6 ? ['shani'] : []),
          ...(wd === 0 ? ['surya'] : []),
        ]);
        assert.ok(
          entry.deities.some((d) => allowed.has(d)),
          `${id} is not tagged for weekday ${wd}'s deity (${VAAR_DEITY[wd]})`
        );
      }
    }
  });

  test('copy carries no store, connectivity or implementation words (RULEBOOK copy rule)', () => {
    const banned = /offline|on-device|locally|notification|app store|play store/i;
    for (let wd = 0; wd < 7; wd += 1) {
      const c = RETURN_REMINDER_COPY[wd];
      for (const s of [c.titleEn, c.bodyEn]) assert.ok(!banned.test(s), s);
    }
  });
});

describe('formatReturnReminderContent', () => {
  const [monday] = planReturnReminders(FRIDAY_NIGHT); // weekday 1

  test('hi and en read straight from the weekday copy', () => {
    assert.deepEqual(formatReturnReminderContent(monday, 'hi'), {
      title: RETURN_REMINDER_COPY[1].titleHi,
      body: RETURN_REMINDER_COPY[1].bodyHi,
    });
    assert.deepEqual(formatReturnReminderContent(monday, 'en'), {
      title: RETURN_REMINDER_COPY[1].titleEn,
      body: RETURN_REMINDER_COPY[1].bodyEn,
    });
  });

  test('defaults to Hindi', () => {
    assert.deepEqual(formatReturnReminderContent(monday), formatReturnReminderContent(monday, 'hi'));
  });

  test('gu/kn are re-scripted from the Devanagari, never left in Devanagari or Latin', () => {
    for (const lang of ['gu', 'kn'] as const) {
      const { title, body } = formatReturnReminderContent(monday, lang);
      assert.notEqual(title, RETURN_REMINDER_COPY[1].titleHi);
      assert.notEqual(title, RETURN_REMINDER_COPY[1].titleEn);
      assert.ok(!/[\u0900-\u0963\u0966-\u097F]/.test(title), `${lang} title still has Devanagari: ${title}`);
      assert.ok(!/[\u0900-\u0963\u0966-\u097F]/.test(body), `${lang} body still has Devanagari: ${body}`);
      const block = lang === 'gu' ? /[઀-૿]/ : /[ಀ-೿]/;
      assert.ok(block.test(title) && block.test(body));
    }
  });
});
