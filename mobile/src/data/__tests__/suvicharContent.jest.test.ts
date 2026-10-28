import fs from 'node:fs';
import path from 'node:path';
import { initialSuvichar, parseSuvicharPreferences, suvicharDeities } from '../suvichar';
import { findSuvicharThought, nextSuvicharThought, sourceForSuvichar, suvicharSourceLabel, suvicharSourcedThoughts, suvicharThoughtForDay, suvicharThoughtsFor } from '../suvicharContent';
import { contentByLang } from '@/utils/localize';

it('integrates every approved catalogue ID and app proposal without changing the approved Hindi', () => {
  const approved = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../../docs/content/suvichar-scripture-integration/reviewed-copy.json'), 'utf8'));
  const all = [...approved.entries, ...approved.app_thought_edits];
  expect(suvicharSourcedThoughts).toHaveLength(621);
  expect(new Set(suvicharSourcedThoughts.map(t => t.id)).size).toBe(621);
  expect(suvicharSourcedThoughts.map(t => [t.id, t.hi])).toEqual(all.map((r: { id: string; revised_hi: string }) => [r.id, r.revised_hi]));
  for (const thought of suvicharSourcedThoughts) {
    expect(thought.en.trim().length).toBeGreaterThan(0);
    expect(thought.hi.length).toBeLessThanOrEqual(57);
    expect(thought.en.length).toBeLessThanOrEqual(150);
    const source = sourceForSuvichar(thought);
    expect(source.url).toMatch(/^https:\/\//);
    expect(source.modeHi).toMatch(/भाव/);
    expect(suvicharSourceLabel(thought, 'en')).toMatch(/Meaning|meaning|lesson/);
  }
});

it.each(suvicharDeities.map(d => d.id))('cycles the complete matching collection for %s in every language, including repeated English senses', deity => {
  const pool = suvicharThoughtsFor(deity);
  expect(pool.length).toBeGreaterThanOrEqual(50);
  for (const lang of ['hi', 'en', 'gu', 'kn'] as const) {
    const seen = new Set<string>();let current = pool[0];
    for (let n=0;n<pool.length;n++) {
      seen.add(current.id);
      current = nextSuvicharThought(deity, contentByLang(lang, current.hi, current.en), current.id);
    }
    expect(seen.size).toBe(pool.length);expect(current.id).toBe(pool[0].id);
  }
});

it('never sends a Krishna teaching into the Ganapati pool and keeps daily changes within each deity', () => {
  const krishna = suvicharThoughtsFor('krishna')[0];
  expect(findSuvicharThought('ganesha', krishna.hi, krishna.id)).toBeUndefined();
  for (const d of suvicharDeities) {
    const pool = suvicharThoughtsFor(d.id), seen = new Set<string>();
    for (let day=0;day<pool.length;day++) seen.add(suvicharThoughtForDay(d.id, day).id);
    expect(seen.size).toBe(pool.length);
    expect(suvicharThoughtForDay(d.id, -1)).toBe(pool[pool.length-1]);
  }
});

it('does not attribute edited words to scripture and preserves selected IDs in favorites', () => {
  const thought = suvicharThoughtsFor('krishna')[0];
  expect(findSuvicharThought('krishna', thought.hi+' मेरा संदेश', thought.id)).toBeUndefined();
  const favorite = { deity: 'krishna', frame: 'mandir-jharokha', message: thought.hi, thoughtId: thought.id, name: 'परिवार' };
  const restored = parseSuvicharPreferences(JSON.stringify({ ...initialSuvichar, ...favorite, favorites: [favorite] }));
  expect(restored.thoughtId).toBe(thought.id);expect(restored.favorites[0]).toEqual(favorite);
  expect(parseSuvicharPreferences(JSON.stringify({ thoughtId: '<script>' })).thoughtId).toBe('');
});
