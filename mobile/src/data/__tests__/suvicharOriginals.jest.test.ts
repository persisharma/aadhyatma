import originals from '../suvichar-content/originals.json';
import { MESSAGE_LIMIT, parseSuvicharPreferences, suvicharDeityCatalog } from '../suvichar';
import { findSuvicharThought, isSourcedSuvicharMessage, nextSuvicharThought, sourceForSuvichar, suvicharSourceLabel, suvicharThoughtForDay, suvicharThoughtsFor } from '../suvicharContent';
import { isSuvicharThought, suvicharTemplatesFor } from '../suvicharTemplates';
import { contentByLang } from '@/utils/localize';

it('preserves the original 76 thoughts and adds eight Hare Ka Sahara reflections with complete bilingual copy', () => {
  expect(originals.entries).toHaveLength(84);
  expect(new Set(originals.entries.map(t => t.id)).size).toBe(84);
  expect(new Set(originals.entries.map(t => t.hi)).size).toBe(84);
  expect(originals.entries.slice(0, 76).map(t => t.id)).toEqual(Array.from({ length: 76 }, (_, i) => `VD-${String(i + 1).padStart(4, '0')}`));
  expect(originals.source.kind).toBe('app-written-original-reflections');
  expect(originals.source.referenceUrls).toEqual([]);
  const deities = new Set<string>(suvicharDeityCatalog.map(d => d.id));
  for (const t of originals.entries) {
    expect(t.id).toMatch(/^VD-\d{4}$/);
    expect(t.hi.trim().length).toBeGreaterThan(0);
    expect(t.en.trim().length).toBeGreaterThan(0);
    expect(t.hi.length).toBeLessThanOrEqual(MESSAGE_LIMIT);
    expect(t.en.length).toBeLessThanOrEqual(MESSAGE_LIMIT);
    for (const deity of t.deities) expect(deities.has(deity)).toBe(true);
  }
});

it.each(Array.from({ length: 8 }, (_, i) => `VD-${String(i + 77).padStart(4, '0')}`))('offers Hare Ka Sahara thought %s only for Khatu Shyam, with persistent IDs in every script', id => {
  const thought = suvicharThoughtsFor('khatu-shyam').find(t => t.id === id)!;
  expect(thought).toBeDefined();
  expect(thought.categoryHi).toBe('हारे का सहारा');
  expect(originals.entries.find(t => t.id === id)!.deities).toEqual(['khatu-shyam']);
  for (const deity of suvicharDeityCatalog.filter(d => d.id !== 'khatu-shyam')) {
    expect(suvicharThoughtsFor(deity.id).some(t => t.id === id)).toBe(false);
  }
  for (const lang of ['hi', 'en', 'gu', 'kn'] as const) {
    const message = contentByLang(lang, thought.hi, thought.en);
    expect(findSuvicharThought('khatu-shyam', message, id)?.id).toBe(id);
    expect(suvicharSourceLabel(thought, lang)).not.toMatch(/चालीसा|Chalisa|गीता|Gita/);
    const favorite = { deity: 'khatu-shyam', frame: 'mandir-jharokha', name: 'परिवार', message, thoughtId: id };
    expect(parseSuvicharPreferences(JSON.stringify({ favorites: [favorite] })).favorites[0]).toEqual(favorite);
  }
});

it.each(suvicharDeityCatalog.map(d => d.id))('makes every eligible original available first for %s, without leaking another shrine', deity => {
  const relevant = originals.entries.filter(t => !t.deities.length || t.deities.includes(deity));
  const actual = suvicharThoughtsFor(deity).filter(t => t.id.startsWith('VD-'));
  expect(actual.map(t => t.id).sort()).toEqual(relevant.map(t => t.id).sort());
  expect(suvicharThoughtsFor(deity).slice(0, relevant.length)).toEqual(actual);
  const specific = relevant.filter(t => t.deities.length);
  if (specific.length) expect(actual[0].id).toBe(specific[0].id);
});

it('keeps original message lookup separate for deities that formerly shared a family', () => {
  const khatu = originals.entries.find(t => t.id === 'VD-0037')!;
  for (const lang of ['hi', 'en', 'gu', 'kn'] as const) {
    const message = contentByLang(lang, khatu.hi, khatu.en);
    expect(findSuvicharThought('khatu-shyam', message, khatu.id)?.id).toBe(khatu.id);
    expect(findSuvicharThought('krishna', message)).toBeUndefined();
    expect(findSuvicharThought('jagannath', message)).toBeUndefined();
  }
});

it.each(suvicharDeityCatalog.map(d => d.id))('uses only eligible originals and dohas for the daily and weekday rotation of %s', deity => {
  const eligible = suvicharThoughtsFor(deity).filter(t => t.id.startsWith('VD-') || t.id.startsWith('DH-'));
  const ids = new Set<string>();
  for (let day = 0; day < eligible.length; day++) {
    const t = suvicharThoughtForDay(deity, day);
    ids.add(t.id);
    expect(eligible).toContain(t);
    const template = suvicharTemplatesFor(day).find(t => t.kind === 'daily' && t.deity === deity)!;
    expect(template).toMatchObject({ thoughtId: t.id, messageHi: t.hi, messageEn: t.en });
  }
  expect(ids.size).toBe(eligible.length);
  expect(suvicharThoughtForDay(deity, -1)).toEqual(eligible[eligible.length - 1]);
});

it('labels originals honestly, cycles all scripts, preserves favorites and drops attribution after edits', () => {
  const t = suvicharThoughtsFor('hanuman').find(t => t.id === 'VD-0055')!;
  expect(t).toBeDefined();
  expect(sourceForSuvichar(t).url).toBe('');
  expect(suvicharSourceLabel(t, 'hi')).toBe('वेदांश · मौलिक विचार');
  expect(suvicharSourceLabel(t, 'en')).toBe('Vedansh · Original reflection');
  for (const lang of ['hi', 'en', 'gu', 'kn'] as const) {
    const message = contentByLang(lang, t.hi, t.en);
    expect(findSuvicharThought('hanuman', message, t.id)?.id).toBe(t.id);
    expect(isSourcedSuvicharMessage(message)).toBe(true);
    expect(isSuvicharThought(message)).toBe(true);
    expect(nextSuvicharThought('hanuman', message, t.id).id).not.toBe(t.id);
    expect(findSuvicharThought('hanuman', message + '!', t.id)).toBeUndefined();
    const f = { deity: 'hanuman', frame: 'mandir-jharokha', message, name: 'परिवार', thoughtId: t.id };
    const restored = parseSuvicharPreferences(JSON.stringify({ ...f, favorites: [f] }));
    expect(restored.thoughtId).toBe(t.id);
    expect(restored.favorites[0]).toEqual(f);
  }
});

