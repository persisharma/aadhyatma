/**
 * prevailingTithi — the live point query behind the Muhurat glance card's
 * kicker tithi. Runs under `npm run test:engine` (tsx glob).
 *
 * Two halves: synthetic-chain units pinning every walk branch (main → kshaya →
 * successor, null-end termination, index wraps), and a real-engine case on the
 * documented kshaya reference day (Bengaluru 10 Jul 2026: Dashami till 8:16 AM,
 * kshaya Ekadashi till ~5:22 AM on 11 Jul) so the walk agrees with the solver's
 * own chain, not just a hand-built one.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { computePanchangForDate } from '../engine';
import { prevailingTithi } from '../prevailingTithi';
import { TITHI_NAMES_HI, TITHI_NAMES_EN } from '../names';
import type { PanchangData } from '../types';

const BENGALURU = { latitude: 12.9716, longitude: 77.5946, elevation: 920 };

// Minimal PanchangData stand-in: prevailingTithi reads tithi + kshayaTithi only.
function day(tithiIndex: number, end: Date | null, kshaya?: { index: number; end: Date | null }): PanchangData {
  const el = (index: number, endTime: Date | null) => ({
    index,
    paksha: (index < 15 ? 'shukla' : 'krishna') as 'shukla' | 'krishna',
    nameHi: TITHI_NAMES_HI[index],
    nameEn: TITHI_NAMES_EN[index],
    endTime,
  });
  return {
    tithi: el(tithiIndex, end),
    kshayaTithi: kshaya ? el(kshaya.index, kshaya.end) : null,
  } as PanchangData;
}

const at = (h: number, m = 0) => new Date(2026, 7, 21, h, m);

test('before the end instant the sunrise tithi prevails, end included', () => {
  const p = day(8, at(23, 36)); // Navami till 11:36 PM
  assert.equal(prevailingTithi(p, at(5)).nameHi, 'नवमी');
  assert.equal(prevailingTithi(p, at(23, 36)).nameHi, 'नवमी'); // boundary is inclusive
  assert.equal(prevailingTithi(p, at(12))?.endTime?.getTime(), at(23, 36).getTime());
});

test('past the end the successor runs, with no invented end instant', () => {
  const p = day(8, at(23, 36));
  const after = prevailingTithi(p, at(23, 50));
  assert.equal(after.nameHi, 'दशमी');
  assert.equal(after.nameEn, 'Dashami');
  assert.equal(after.endTime, null);
});

test('kshaya day walks main → kshaya → successor', () => {
  // Dashami till 8:16 AM, kshaya Ekadashi till 5:22 AM next day (10 Jul 2026 shape).
  const kshayaEnd = new Date(2026, 7, 22, 5, 22);
  const p = day(9, at(8, 16), { index: 10, end: kshayaEnd });
  assert.equal(prevailingTithi(p, at(7)).nameHi, 'दशमी');
  const mid = prevailingTithi(p, at(14));
  assert.equal(mid.nameHi, 'एकादशी');
  assert.equal(mid.endTime?.getTime(), kshayaEnd.getTime());
  assert.equal(prevailingTithi(p, new Date(2026, 7, 22, 5, 30)).nameHi, 'द्वादशी');
});

test('a null end terminates the walk — no guessing past what the day solved', () => {
  // Main tithi with no solved end: it holds all day.
  assert.equal(prevailingTithi(day(3, null), at(23, 59)).nameHi, 'चतुर्थी');
  // Kshaya link with a null end holds once entered.
  const p = day(9, at(8, 16), { index: 10, end: null });
  assert.equal(prevailingTithi(p, at(23)).nameHi, 'एकादशी');
});

test('successor index wraps: Amavasya → Pratipada and Purnima → krishna Pratipada', () => {
  assert.equal(prevailingTithi(day(29, at(10)), at(11)).nameEn, 'Pratipada'); // 29 → 0
  const afterPurnima = prevailingTithi(day(14, at(10)), at(11));
  assert.equal(afterPurnima.nameEn, 'Pratipada'); // 14 → 15 (krishna)
  assert.equal(afterPurnima.nameHi, TITHI_NAMES_HI[15]);
});

test('kshaya reference day agrees with the real engine chain (Bengaluru 10 Jul 2026)', () => {
  const p = computePanchangForDate(new Date(2026, 6, 10), { location: BENGALURU });
  assert.equal(p.tithi.nameEn, 'Dashami');
  assert.ok(p.kshayaTithi, 'reference day must be kshaya');
  assert.equal(p.kshayaTithi!.nameEn, 'Ekadashi');

  const beforeMainEnd = new Date(p.tithi.endTime!.getTime() - 60_000);
  assert.equal(prevailingTithi(p, beforeMainEnd).nameEn, 'Dashami');

  const inKshaya = new Date(p.tithi.endTime!.getTime() + 60_000);
  const mid = prevailingTithi(p, inKshaya);
  assert.equal(mid.nameEn, 'Ekadashi');
  assert.equal(mid.endTime?.getTime(), p.kshayaTithi!.endTime!.getTime());

  const afterKshaya = new Date(p.kshayaTithi!.endTime!.getTime() + 60_000);
  const successor = prevailingTithi(p, afterKshaya);
  assert.equal(successor.nameEn, 'Dwadashi');
  assert.equal(successor.endTime, null);
});
