import assert from 'node:assert/strict';
import { test } from 'node:test';

import { computePanchangForDate } from '../engine';
import { computeMuhuratDay } from '../muhurat';
import { buildPanchangShareModel, karanaSuccessorIndex } from '../panchangShareModel';
import type { PanchangData, ResolvedObservance } from '../types';

const BENGALURU = { latitude: 12.9716, longitude: 77.5946, elevation: 920 };

function solve(date: Date) {
  const p = computePanchangForDate(date, { location: BENGALURU });
  const next = computePanchangForDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1), { location: BENGALURU });
  return { p, md: computeMuhuratDay(p.sunrise, p.sunset, next.sunrise, date.getDay()) };
}

const valmiki = {
  date: new Date(2026, 9, 26),
  rule: { nameHi: 'वाल्मीकि जयंती', nameEn: 'Valmiki Jayanti', deityHi: 'महर्षि वाल्मीकि', deityEn: 'Maharshi Valmiki' },
} as unknown as ResolvedObservance;

test('26 Oct 2026, Bengaluru: the card carries the engine solve, in the order the card reads', () => {
  const { p, md } = solve(new Date(2026, 9, 26));
  const m = buildPanchangShareModel({ p, md, observances: [valmiki], placeHi: 'बेंगलुरु', placeEn: 'Bengaluru', calendarSystem: 'purnimant', lang: 'hi' });

  assert.equal(m.place, 'बेंगलुरु');
  assert.equal(m.date, 'सोमवार, 26 अक्टूबर 2026');
  assert.equal(m.identity, 'आश्विन शुक्ल पूर्णिमा · पूर्णिमांत · विक्रम संवत् 2083');
  assert.deepEqual([m.brahma, m.sunrise, m.sunset, m.moonrise], ['4:35 – 5:23 AM', '6:11 AM', '5:55 PM', '5:58 PM']);
  assert.deepEqual(m.festival, { name: 'वाल्मीकि जयंती · महर्षि वाल्मीकि', more: 0 });

  assert.deepEqual(m.tithi, { name: 'पूर्णिमा', lines: ['9:41 AM तक, फिर प्रतिपदा'] });
  assert.deepEqual(m.nakshatra, { name: 'अश्विनी', lines: ['5:39 PM तक, फिर भरणी'] });
  assert.deepEqual(m.karana, { name: 'बव', lines: ['9:41 AM तक, फिर बालव'] });

  // Every kaal is a daytime window, so the card drops AM/PM to keep one line.
  assert.deepEqual([m.abhijit, m.rahu, m.gulika, m.yamaganda], ['11:40 – 12:26', '7:39 – 9:07', '1:31 – 2:59', '10:35 – 12:03']);
  assert.deepEqual(m.day.map((c) => c.start), ['6:11', '7:39', '9:07', '10:35', '12:03', '1:31', '2:59', '4:27']);
  assert.deepEqual(m.day.map((c) => c.name), ['अमृत', 'काल', 'शुभ', 'रोग', 'उद्वेग', 'चर', 'लाभ', 'अमृत']);
  assert.equal(m.night.length, 8);

  assert.equal(m.surya.value, 'तुला');
  assert.deepEqual([m.chandra.value, m.chandra.line], ['मेष · पूर्व', 'पूर्व, उत्तर शुभ']);
  assert.deepEqual([m.dishaShool.value, m.dishaShool.valueWarn], ['पूर्व', true]);
  // पाताल at sunrise (havan barred) until the tithi ends, then पृथ्वी.
  assert.deepEqual([m.agni.value, m.agni.line, m.agni.lineWarn], ['पाताल', 'हवन वर्जित · 9:41 AM से पृथ्वी', true]);
});

test('English and Gujarati render the same day without Devanagari leaking into English', () => {
  const { p, md } = solve(new Date(2026, 9, 26));
  const en = buildPanchangShareModel({ p, md, observances: [valmiki, valmiki], placeHi: 'बेंगलुरु', placeEn: 'Bengaluru', calendarSystem: 'amanta', lang: 'en' });
  assert.equal(en.place, 'Bengaluru');
  assert.equal(en.identity, 'Ashwin Shukla Purnima · Amanta · Vikram Samvat 2083');
  assert.equal(en.date, 'Monday, 26 October 2026');
  assert.deepEqual(en.tithi.lines, ['till 9:41 AM, then Pratipada']);
  assert.equal(en.agni.line, 'avoid havan · Prithvi from 9:41 AM');
  assert.deepEqual(en.festival, { name: 'Valmiki Jayanti · Maharshi Valmiki', more: 1 });
  assert.ok(!/[ऀ-ॿ]/.test(JSON.stringify(en)), 'no Devanagari in the English card');

  const gu = buildPanchangShareModel({ p, md, observances: [], placeHi: 'बेंगलुरु', placeEn: 'Bengaluru', calendarSystem: 'purnimant', lang: 'gu' });
  assert.equal(gu.festival, null);
  assert.ok(/[઀-૿]/.test(gu.tithi.name), 'Gujarati re-scripts the Devanagari');
});

function day(over: Partial<PanchangData>): PanchangData {
  const { p } = solve(new Date(2026, 9, 26));
  return { ...p, ...over };
}
const at = (h: number, m = 0, d = 26) => new Date(2026, 9, d, h, m);

test('karana successor: movable cycle, fixed tail, and विष्टि → शकुनि only in कृष्ण चतुर्दशी', () => {
  const karana = (index: number, end: Date | null) => ({ index, nameHi: '', nameEn: '', endTime: end });
  const tithi = (index: number, end: Date | null) => ({ index, nameHi: '', nameEn: '', endTime: end, paksha: index < 15 ? 'shukla' as const : 'krishna' as const });

  assert.equal(karanaSuccessorIndex(day({ karana: karana(0, at(9)) })), 1); // बव → बालव
  assert.equal(karanaSuccessorIndex(day({ karana: karana(7, at(9)) })), 8); // शकुनि → चतुष्पद
  assert.equal(karanaSuccessorIndex(day({ karana: karana(10, at(9)) })), 0); // किंस्तुघ्न → बव
  // विष्टि inside कृष्ण चतुर्दशी (ends before the tithi does) → शकुनि.
  assert.equal(karanaSuccessorIndex(day({ tithi: tithi(28, at(20)), kshayaTithi: null, karana: karana(6, at(8)) })), 7);
  // विष्टि ending with शुक्ल चतुर्थी → बव.
  assert.equal(karanaSuccessorIndex(day({ tithi: tithi(3, at(20)), kshayaTithi: null, karana: karana(6, at(20)) })), 0);
  // विष्टि that runs into the day's next tithi, when that tithi is कृष्ण चतुर्दशी.
  assert.equal(karanaSuccessorIndex(day({ tithi: tithi(27, at(7)), kshayaTithi: null, karana: karana(6, at(18)) })), 7);
});

test('a kshaya tithi day names both ends and what follows the kshaya one', () => {
  const p = day({
    tithi: { index: 12, nameHi: 'त्रयोदशी', nameEn: 'Trayodashi', endTime: at(6, 20), paksha: 'shukla' },
    kshayaTithi: { index: 13, nameHi: 'चतुर्दशी', nameEn: 'Chaturdashi', endTime: at(4, 10, 27), paksha: 'shukla' },
  });
  const { md } = solve(new Date(2026, 9, 26));
  const m = buildPanchangShareModel({ p, md, observances: [], placeHi: 'बेंगलुरु', placeEn: 'Bengaluru', calendarSystem: 'purnimant', lang: 'hi' });
  assert.deepEqual(m.tithi.lines, ['6:20 AM तक, फिर चतुर्दशी (क्षय)', '4:10 AM, 27 अक्टू तक, फिर पूर्णिमा']);
});
