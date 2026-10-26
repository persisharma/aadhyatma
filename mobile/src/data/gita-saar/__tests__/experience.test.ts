import {
  gitaSaarChaptersManifest,
  getGitaSaarChapter,
  getGitaSaarThemes,
} from '..';
import { gitaSaarExperiences } from '../experience';
test('all sixteen themes have distinct bilingual learning frames grounded in their own references', () => {
  expect(Object.keys(gitaSaarExperiences).sort()).toEqual(
    gitaSaarChaptersManifest.map((t) => t.id).sort()
  );
  expect(
    new Set(Object.values(gitaSaarExperiences).map((t) => t.title.en)).size
  ).toBe(16);
  for (const t of getGitaSaarThemes()) {
    const frame = gitaSaarExperiences[t.id];
    const refs = t.groups.flatMap((g) =>
      g.verses.map((v) => `${v.ref.chapter}.${v.ref.verse}`)
    );
    expect(frame.refs.every((ref) => refs.includes(ref))).toBe(true);
    for (const copy of [
      frame.question,
      frame.title,
      frame.first.title,
      frame.first.body,
      frame.second.title,
      frame.second.body,
      frame.takeaway,
      frame.reflection,
    ]) {
      expect(copy.hi.trim().length).toBeGreaterThan(3);
      expect(copy.en.trim().length).toBeGreaterThan(3);
    }
  }
});
test('all 170 existing pages retain the original reference identities and order', () => {
  let total = 0;
  for (const t of gitaSaarChaptersManifest) {
    const chapter = getGitaSaarChapter(t.chapter);
    expect(chapter.id).toBe(t.id);
    expect(chapter.verses).toHaveLength(t.verseCount);
    chapter.verses.forEach((v, i) => {
      expect(v.number).toBe(i + 1);
      expect(v.id).toBe(`saar-${t.id}-${v.gitaChapter}-${v.gitaVerse}`);
    });
    total += chapter.verses.length;
  }
  expect(total).toBe(170);
});
