import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateGunaMilanFromLongitudes } from '../gunaMilan';

/**
 * Independent published fixture:
 * Prokerala sample Guna Milan report, retrieved 2026-08-10.
 * https://api.prokerala.com/reports/sample/guna-milan-en.pdf
 *
 * Groom Jose: Moon 126°57′39″, Magha 3, Leo.
 * Bride Mini: Moon 7°43′59″, Ashwini 3, Aries.
 * Page 12 publishes the eight expected scores and total 20/36.
 */
test('published Mini/Jose report matches all eight independent row scores', () => {
  const groomLongitude = 126 + 57 / 60 + 39 / 3600;
  const brideLongitude = 7 + 43 / 60 + 59 / 3600;
  const result = calculateGunaMilanFromLongitudes(groomLongitude, brideLongitude);

  assert.equal(result.groom.nakshatraIndex, 9); // Magha
  assert.equal(result.groom.padaIndex, 2);
  assert.equal(result.groom.rashiIndex, 4); // Leo
  assert.equal(result.bride.nakshatraIndex, 0); // Ashwini
  assert.equal(result.bride.padaIndex, 2);
  assert.equal(result.bride.rashiIndex, 0); // Aries
  assert.deepEqual(
    Object.fromEntries(result.kootas.map(({ id, score }) => [id, score])),
    {
      varna: 1,
      vashya: 0,
      tara: 3,
      yoni: 2,
      grahaMaitri: 5,
      gana: 1,
      bhakoot: 0,
      nadi: 8,
    }
  );
  assert.equal(result.total, 20);
  assert.equal(result.baseBand, 'middling');
  assert.equal(result.band, 'middling');
});

test('DrikPanchang same-Nadi priority changes interpretation at 28/36', () => {
  const result = calculateGunaMilanFromLongitudes(7, 7);
  assert.equal(result.total, 28);
  assert.equal(result.baseBand, 'very-good');
  assert.equal(result.band, 'below-reference');
  assert.deepEqual(result.flags.find((flag) => flag.id === 'nadi'), {
    id: 'nadi',
    present: true,
    cancelled: false,
    cancellationRule: null,
  });
});

/**
 * Independent published fixture, Himalayan Vedic World EK10 sample report,
 * retrieved 2026-08-10. The report publishes Chitra/Virgo groom and
 * Uttara-Ashadha/Sagittarius bride classifications with total 19.5/36.
 * https://himalayavedicworld.com/img/SamplePDF/EK10MarriageMatchingEnglish.pdf
 */
test('published Chitra/Uttara-Ashadha report preserves fractional scores', () => {
  const result = calculateGunaMilanFromLongitudes(175, 268);
  assert.deepEqual(
    Object.fromEntries(result.kootas.map(({ id, score }) => [id, score])),
    {
      varna: 0,
      vashya: 0.5,
      tara: 1.5,
      yoni: 2,
      grahaMaitri: 0.5,
      gana: 0,
      bhakoot: 7,
      nadi: 8,
    }
  );
  assert.equal(result.total, 19.5);
});

test('B. V. Raman Bhakoot cancellations cover same and friendly rashi lords', () => {
  const sameLord = calculateGunaMilanFromLongitudes(5, 215).flags.find((flag) => flag.id === 'bhakoot');
  assert.deepEqual(sameLord, {
    id: 'bhakoot', present: true, cancelled: true, cancellationRule: 'same-rashi-lord',
  });

  const friendlyLords = calculateGunaMilanFromLongitudes(5, 125).flags.find((flag) => flag.id === 'bhakoot');
  assert.deepEqual(friendlyLords, {
    id: 'bhakoot', present: true, cancelled: true, cancellationRule: 'friendly-rashi-lords',
  });

  const noCancellation = calculateGunaMilanFromLongitudes(35, 245).flags.find((flag) => flag.id === 'bhakoot');
  assert.deepEqual(noCancellation, {
    id: 'bhakoot', present: true, cancelled: false, cancellationRule: null,
  });
});
