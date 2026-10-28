import { initialSuvichar, suvicharArtRequest, suvicharDeities, suvicharFrames, suvicharReflections } from '../suvichar';
import { suvicharThoughts } from '../suvicharTemplates';
import { isAuthoredSuvicharMessage, suvicharTodayTemplates, suvicharVaar, suvicharVaarFor, suvicharVaarTemplates, withTodaysVaar } from '../suvicharVaar';
import { WEEKDAY_LABELS } from '../routine/vaar';
import { contentByLang } from '@/utils/localize';

// 25 October 2026 is a Sunday; the following days run Monday to Saturday.
const on = (date: number) => new Date(2026, 9, date, 9);
const sunday = on(25), monday = on(26), tuesday = on(27), friday = on(30);

it('gives every day a published deity, with Vishnu as Surya-Narayan on Sunday until Surya masters exist', () => {
  for (let date = 25; date <= 31; date++) {
    const vaar = suvicharVaarFor(on(date))!;
    expect(vaar.deities.length).toBeGreaterThan(0);
    for (const deity of vaar.deities) {
      expect(suvicharDeities.some(d => d.id === deity)).toBe(true);
      for (const frame of suvicharFrames) expect(suvicharArtRequest(deity, frame.id)).not.toBeNull();
    }
  }
  expect(suvicharVaarFor(sunday)).toMatchObject({ hi: 'शुभ रविवार', deities: ['vishnu', 'tirupati-balaji'] });
  expect(suvicharVaarFor(friday)!.deities).toEqual(['lakshmi', 'durga']);
});

it('links every catalog deity to at least one day', () => {
  const linked = new Set(suvicharVaar.flatMap(v => v.deities));
  expect(suvicharDeities.filter(d => !linked.has(d.id)).map(d => d.id)).toEqual([]);
  expect(suvicharVaarFor(on(28))!.deities).toEqual(['ganesha', 'saraswati', 'krishna', 'radha-krishna', 'sanwariya-seth', 'khatu-shyam']);
  expect(suvicharVaarFor(on(29))!.deities).toEqual(['vishnu', 'tirupati-balaji', 'jagannath', 'rama', 'ram-darbar']);
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

it('pairs the title only with day-free thoughts', () => {
  const names = WEEKDAY_LABELS.flatMap(l => [l.hi, l.en]);
  for (const r of suvicharThoughts) for (const name of names) {
    expect(r.hi).not.toContain(name); expect(r.en).not.toContain(name);
  }
});

it('offers every deity of the day in all three frames', () => {
  const cards = suvicharVaarTemplates(tuesday);
  expect(cards.map(c => c.id)).toEqual(['hanuman', 'salasar-balaji'].flatMap(d => suvicharFrames.map(f => `vaar-${d}-${f.id}`)));
  // Each weekday tile carries its deity's thought for the day, the same one its deity card shows.
  const daily = suvicharTodayTemplates(tuesday).filter(t => t.kind === 'daily');
  for (const c of cards) expect([c.kind, c.messageHi, c.messageEn]).toEqual(['vaar', daily.find(t => t.deity === c.deity)!.messageHi, daily.find(t => t.deity === c.deity)!.messageEn]);
  expect(suvicharVaarTemplates(monday)).toHaveLength(3);
  expect(suvicharVaarTemplates(sunday).map(c => c.deity)).toEqual(['vishnu', 'vishnu', 'vishnu', 'tirupati-balaji', 'tirupati-balaji', 'tirupati-balaji']);
});

it('gives the day’s own card a new thought every day until all have been shown', () => {
  const first = new Date(2026, 9, 26);
  const shown = suvicharThoughts.map((_, i) => {
    const date = new Date(first.getFullYear(), first.getMonth(), first.getDate() + i);
    const lead = suvicharVaarFor(date)!.deities[0];
    return suvicharTodayTemplates(date).find(t => t.kind === 'daily' && t.deity === lead)!.messageEn;
  });
  expect(new Set(shown).size).toBe(suvicharThoughts.length);
});

it('opens on today’s card unless the reader wrote the message', () => {
  const kept = { ...initialSuvichar, frame: 'pushp-aangan' as const, name: 'परिवार', favorites: [] };
  expect(withTodaysVaar(kept, tuesday)).toEqual({ ...kept, deity: 'hanuman', message: '', vaar: true });
  expect(withTodaysVaar({ ...kept, deity: 'salasar-balaji' }, tuesday).deity).toBe('salasar-balaji');
  const wish = { ...kept, message: 'दीपावली की हार्दिक शुभकामनाएँ। आपके घर में सुख, सद्भाव और समृद्धि का प्रकाश बना रहे।' };
  expect(withTodaysVaar(wish, tuesday)).toMatchObject({ vaar: true, message: '' });
  const authored = { ...kept, message: 'आपका दिन मंगलमय हो।' };
  expect(withTodaysVaar(authored, tuesday)).toBe(authored);
  expect(withTodaysVaar(kept, sunday)).toMatchObject({ deity: 'vishnu', vaar: true });
});

it('treats shipped text in every reading language as replaceable', () => {
  const r = suvicharReflections[3];
  for (const lang of ['hi', 'en', 'gu', 'kn'] as const) expect(isAuthoredSuvicharMessage(contentByLang(lang, r.hi, r.en))).toBe(false);
  expect(isAuthoredSuvicharMessage('')).toBe(false);
  expect(isAuthoredSuvicharMessage('मेरा अपना संदेश')).toBe(true);
});
