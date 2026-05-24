import assert from 'node:assert/strict';

import type { ActivityTotals } from '../../contexts/UserActivityContext';
import { buildSadhakSnapshot, type SnapshotInput } from '../snapshot';

function emptyTotals(): ActivityTotals {
  return {
    totalReads: 0,
    totalBeads: 0,
    totalRounds: 0,
    perSource: {},
    perMantra: {},
    activeDays: 0,
  };
}

function baseInput(over: Partial<SnapshotInput> = {}): SnapshotInput {
  return {
    installDate: '2026-04-01',
    installAppVersion: '1.4.0',
    appVersion: '1.4.0',
    platform: 'ios',
    lang: 'hi',
    todayDate: '2026-05-24',

    currentStreak: 0,
    longestStreak: 0,
    activeDaysLifetime: 0,
    activeDaysLast7: 0,
    activeDaysLast30: 0,
    lastActiveDate: null,

    lifetime: emptyTotals(),
    today: emptyTotals(),

    bookmarkCount: 0,
    bookmarksPerSource: {},

    sourcesStarted: 0,

    reminderEnabled: false,
    reminderHour: null,
    theme: 'light',
    ...over,
  };
}

// 1. Brand-new install → persona 'new', tier 'curious', null derived fields.
{
  const snap = buildSadhakSnapshot(baseInput());
  assert.equal(snap.primary_persona, 'new');
  assert.equal(snap.engagement_tier, 'curious');
  assert.equal(snap.favorite_mantra, null);
  assert.equal(snap.primary_source, null);
  assert.equal(snap.days_since_install, 53);
  assert.equal(snap.days_since_last_open, null);
  assert.equal(snap.sadhana_score, 0);
}

// 2. Reader-heavy user → persona 'reader'.
{
  const snap = buildSadhakSnapshot(
    baseInput({
      activeDaysLifetime: 5,
      lifetime: {
        ...emptyTotals(),
        totalReads: 500,
        perSource: { 'bhagavad-gita': 400, 'hanuman-chalisa': 100 },
      },
    })
  );
  assert.equal(snap.primary_persona, 'reader');
  assert.equal(snap.primary_source, 'bhagavad-gita');
  // Section key gets flattened with snake-case sourceId.
  assert.equal(snap['reads_bhagavad_gita'], 400);
  assert.equal(snap['reads_hanuman_chalisa'], 100);
}

// 3. Japa-heavy user → persona 'japaka' + favorite mantra picked by weight.
{
  const snap = buildSadhakSnapshot(
    baseInput({
      activeDaysLifetime: 10,
      lifetime: {
        ...emptyTotals(),
        totalReads: 5,
        totalBeads: 50,
        totalRounds: 30,
        perMantra: {
          'ram-mantra': { beads: 20, rounds: 25 }, // score 25*108+20 = 2720
          'shiva-mantra': { beads: 30, rounds: 5 }, // score 570
        },
      },
    })
  );
  assert.equal(snap.primary_persona, 'japaka');
  assert.equal(snap.favorite_mantra, 'ram-mantra');
  assert.equal(snap['japa_ram_mantra_beads'], 20);
  assert.equal(snap['japa_ram_mantra_rounds'], 25);
}

// 4. Engagement tier progression.
{
  const tiers = [
    { over: { activeDaysLifetime: 0 }, tier: 'curious' },
    { over: { activeDaysLifetime: 7 }, tier: 'regular' },
    { over: { activeDaysLifetime: 30 }, tier: 'devoted' },
    { over: { activeDaysLifetime: 90, currentStreak: 30 }, tier: 'master' },
    { over: { activeDaysLifetime: 2, currentStreak: 14 }, tier: 'devoted' },
    { over: { activeDaysLifetime: 2, currentStreak: 3 }, tier: 'regular' },
  ] as const;
  for (const c of tiers) {
    const snap = buildSadhakSnapshot(baseInput(c.over));
    assert.equal(snap.engagement_tier, c.tier, `expected ${c.tier} for ${JSON.stringify(c.over)}`);
  }
}

// 5. Sadhana score combines reads, rounds × 108, beads, bookmarks × 5.
{
  const snap = buildSadhakSnapshot(
    baseInput({
      bookmarkCount: 10,
      lifetime: { ...emptyTotals(), totalReads: 50, totalBeads: 20, totalRounds: 3 },
    })
  );
  // 50 + 3*108 + 20 + 10*5 = 50 + 324 + 20 + 50 = 444
  assert.equal(snap.sadhana_score, 444);
}

// 6. last_active_date drives days_since_last_open.
{
  const snap = buildSadhakSnapshot(
    baseInput({ lastActiveDate: '2026-05-22', todayDate: '2026-05-24' })
  );
  assert.equal(snap.days_since_last_open, 2);
}

// 7. Today's per-source distribution flattens into today_reads_<source> keys.
{
  const snap = buildSadhakSnapshot(
    baseInput({
      today: {
        ...emptyTotals(),
        totalReads: 12,
        perSource: { sundarkand: 12 },
      },
    })
  );
  assert.equal(snap.today_reads, 12);
  assert.equal(snap['today_reads_sundarkand'], 12);
}

// 8. Snapshot is a flat object — no nested values land in PostHog properties.
{
  const snap = buildSadhakSnapshot(
    baseInput({
      lifetime: {
        ...emptyTotals(),
        totalReads: 10,
        perSource: { 'bhagavad-gita': 10 },
        perMantra: { 'om-namah-shivaya': { beads: 1, rounds: 0 } },
      },
      bookmarksPerSource: { 'hanuman-chalisa': 3 },
    })
  );
  for (const v of Object.values(snap)) {
    const t = typeof v;
    assert.ok(
      v === null || t === 'string' || t === 'number' || t === 'boolean',
      `snapshot value must be flat scalar — got ${t} (${String(v)})`
    );
  }
}

console.log('snapshot.test.ts — all assertions passed');
