import { defaultSuvichar, initialSuvichar, suvicharArtRequest, suvicharDeities, suvicharFrames, suvicharReflections } from '../suvichar';
import { suvicharVaarTemplates } from '../suvicharTemplates';
import { isAuthoredSuvicharMessage, suvicharDayKey, suvicharVaar, suvicharVaarFor, suvicharVaarReflection, withTodaysVaar } from '../suvicharVaar';
import { WEEKDAY_LABELS } from '../routine/vaar';
import { contentByLang } from '@/utils/localize';

// 25 October 2026 is a Sunday; the following days run Monday to Saturday.
const on = (date: number) => new Date(2026, 9, date, 9);
const sunday = on(25), monday = on(26), tuesday = on(27), friday = on(30);

it('gives Monday to Saturday a published deity, and hides Sunday until Surya masters exist', () => {
  expect(suvicharVaarFor(sunday)).toBeNull();
  for (let date = 26; date <= 31; date++) {
    const vaar = suvicharVaarFor(on(date))!;
    expect(vaar.deities.length).toBeGreaterThan(0);
    for (const deity of vaar.deities) {
      expect(suvicharDeities.some(d => d.id === deity)).toBe(true);
      for (const frame of suvicharFrames) expect(suvicharArtRequest(deity, frame.id)).not.toBeNull();
    }
  }
  expect(suvicharVaarFor(friday)!.deities).toEqual(['lakshmi', 'durga']);
});

it('lists only catalog deities and leaves out any whose masters are not yet published', () => {
  for (const vaar of suvicharVaar) for (const deity of vaar.deities) expect(suvicharDeities.some(d => d.id === deity)).toBe(true);
  const thursday = suvicharVaar[4].deities;
  const live = thursday.filter(d => suvicharFrames.every(f => suvicharArtRequest(d, f.id)));
  expect(suvicharVaarFor(on(29))!.deities).toEqual(live);
  expect(live.slice(0, 2)).toEqual(['vishnu', 'tirupati-balaji']);
});

it('titles each day with its own weekday name', () => {
  suvicharVaar.forEach((vaar, day) => {
    expect(vaar.hi).toBe(`शुभ ${WEEKDAY_LABELS[day].hi}`);
    expect(vaar.en).toMatch(/^Shubh [A-Z][a-z]+(var|war)$/);
  });
  expect(suvicharVaarFor(tuesday)!.en).toBe('Shubh Mangalwar');
});

it('pairs the title with day-free reflections that change from one day to the next', () => {
  const names = WEEKDAY_LABELS.flatMap(l => [l.hi, l.en]);
  for (const r of [defaultSuvichar, ...suvicharReflections]) for (const name of names) {
    expect(r.hi).not.toContain(name); expect(r.en).not.toContain(name);
  }
  expect(suvicharVaarReflection(tuesday)).toBe(suvicharVaarReflection(on(27)));
  for (let date = 26; date < 31; date++) expect(suvicharVaarReflection(on(date))).not.toBe(suvicharVaarReflection(on(date + 1)));
});

it('offers every deity of the day in all three frames', () => {
  const cards = suvicharVaarTemplates(tuesday);
  expect(cards.map(c => c.id)).toEqual(['hanuman', 'salasar-balaji'].flatMap(d => suvicharFrames.map(f => `vaar-${d}-${f.id}`)));
  expect(cards.every(c => c.kind === 'vaar' && c.messageHi === suvicharVaarReflection(tuesday).hi)).toBe(true);
  expect(suvicharVaarTemplates(monday)).toHaveLength(3);
  expect(suvicharVaarTemplates(sunday)).toEqual([]);
});

it('opens on today’s card unless the reader wrote the message', () => {
  const kept = { ...initialSuvichar, frame: 'pushp-aangan' as const, name: 'परिवार', favorites: [] };
  expect(withTodaysVaar(kept, tuesday)).toEqual({ ...kept, deity: 'hanuman', message: '', vaar: true });
  expect(withTodaysVaar({ ...kept, deity: 'salasar-balaji' }, tuesday).deity).toBe('salasar-balaji');
  const wish = { ...kept, message: 'दीपावली की हार्दिक शुभकामनाएँ। आपके घर में सुख, सद्भाव और समृद्धि का प्रकाश बना रहे।' };
  expect(withTodaysVaar(wish, tuesday)).toMatchObject({ vaar: true, message: '' });
  const authored = { ...kept, message: 'आपका दिन मंगलमय हो।' };
  expect(withTodaysVaar(authored, tuesday)).toBe(authored);
  expect(withTodaysVaar(kept, sunday)).toBe(kept);
});

it('treats shipped text in every reading language as replaceable', () => {
  const r = suvicharReflections[3];
  for (const lang of ['hi', 'en', 'gu', 'kn'] as const) expect(isAuthoredSuvicharMessage(contentByLang(lang, r.hi, r.en))).toBe(false);
  expect(isAuthoredSuvicharMessage('')).toBe(false);
  expect(isAuthoredSuvicharMessage('मेरा अपना संदेश')).toBe(true);
});

it('keys the local calendar day', () => {
  expect(suvicharDayKey(new Date(2026, 9, 27, 23, 59))).toBe(suvicharDayKey(new Date(2026, 9, 27, 0, 1)));
  expect(suvicharDayKey(new Date(2026, 9, 27, 23, 59))).not.toBe(suvicharDayKey(new Date(2026, 9, 28, 0, 1)));
});
