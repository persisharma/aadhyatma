/**
 * Per-lunation Sankashti names against published dṛk-convention dates —
 * external truth, never engine output. Runs under `npm run test:engine`
 * (TZ=Asia/Kolkata).
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sankashtiOccurrenceName } from '../sankashtiNames';
import { resolveObservancesForYear } from '../festivalEngine';

test('published occurrence names resolve from the occurrence day', () => {
  // 31 Aug 2026 — the reported day: Bhadrapada (purnimant) → Heramba.
  assert.equal(sankashtiOccurrenceName(new Date(2026, 7, 31)).nameEn, 'Heramba Sankashti Chaturthi');
  assert.equal(sankashtiOccurrenceName(new Date(2026, 7, 31)).nameHi, 'हेरम्ब संकष्टी चतुर्थी');
  // 17 Jan 2025 — Sakat Chauth: Magha → Lambodara.
  assert.equal(sankashtiOccurrenceName(new Date(2025, 0, 17)).nameEn, 'Lambodara Sankashti Chaturthi');
  // 5 Feb 2026 — Phalguna → Dwijapriya.
  assert.equal(sankashtiOccurrenceName(new Date(2026, 1, 5)).nameEn, 'Dwijapriya Sankashti Chaturthi');
  // 29 Oct 2026 — the Karwa Chauth day: Kartika → Vakratunda.
  assert.equal(sankashtiOccurrenceName(new Date(2026, 9, 29)).nameEn, 'Vakratunda Sankashti Chaturthi');
  // 3 Jun 2026 — adhik-maas lunation: always Vibhuvana, never the month name.
  assert.equal(sankashtiOccurrenceName(new Date(2026, 5, 3)).nameEn, 'Vibhuvana Sankashti Chaturthi');
});

test('a Tuesday occurrence is flagged Angarki', () => {
  assert.equal(sankashtiOccurrenceName(new Date(2026, 8, 29)).isAngarki, true); // Tue 29 Sep 2026 (Vighnaraja)
  assert.equal(sankashtiOccurrenceName(new Date(2026, 8, 29)).nameEn, 'Vighnaraja Sankashti Chaturthi');
  assert.equal(sankashtiOccurrenceName(new Date(2026, 7, 31)).isAngarki, false); // Mon 31 Aug 2026
});

test('every resolved 2026 Sankashti occurrence gets a name without throwing', () => {
  const days = resolveObservancesForYear(2026, 'purnimant')
    .filter((o) => o.rule.id === 'sankashti-chaturthi-vrat');
  assert.equal(days.length, 13); // adhik year: 13 lunations
  const names = days.map((o) => sankashtiOccurrenceName(o.date).nameEn);
  assert.equal(new Set(names).size, 13, `each lunation names a distinct form: ${names.join(', ')}`);
});
