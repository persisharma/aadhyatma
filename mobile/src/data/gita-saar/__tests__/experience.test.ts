import {
  gitaSaarChaptersManifest,
  getGitaSaarChapter,
  getGitaSaarThemes,
} from '..';
import { gitaSaarExperiences } from '../experience';
import { gitaSaarStories } from '../stories';
import { getGitaChapter } from '../../gita';
import { getValmikiRamayanChapter } from '../../valmiki-ramayan';
import illustrationManifest from '../../readerIllustrationManifest.json';
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

test('every theme has its own published illustration and a source-grounded three-beat story', () => {
  const ids = gitaSaarChaptersManifest.map((theme) => theme.id);
  expect(Object.keys(gitaSaarStories).sort()).toEqual([...ids].sort());
  expect(new Set(ids.map((id) => gitaSaarStories[id].imageStem)).size).toBe(16);
  for (const theme of getGitaSaarThemes()) {
    const story = gitaSaarStories[theme.id];
    const image = illustrationManifest.assets[story.imageStem as keyof typeof illustrationManifest.assets];
    expect(image).toMatchObject({ ext: 'webp', width: 960, height: 480 });
    expect(story.beats).toHaveLength(3);
    expect(story.sources.length).toBeGreaterThan(0);
    expect(story.sources.every((source) => source.url.startsWith('https://'))).toBe(true);
    for (const source of story.sources) {
      if (!source.inAppRef) continue;
      if (source.inAppRef.kind === 'gita') {
        expect(getGitaChapter(source.inAppRef.chapter).verses[source.inAppRef.verse - 1]?.number).toBe(source.inAppRef.verse);
      } else {
        const { kanda, sarga } = source.inAppRef;
        expect(
          getValmikiRamayanChapter(kanda).verses.some((verse) =>
            verse.reference.startsWith(`${kanda}.${sarga}.`)
          )
        ).toBe(true);
      }
    }
    const refs = theme.groups.flatMap((group) => group.verses.map((verse) => `${verse.ref.chapter}.${verse.ref.verse}`));
    expect(story.gitaRefs.length).toBeGreaterThan(0);
    expect(story.gitaRefs.every((ref) => refs.includes(ref))).toBe(true);
    for (const copy of [story.title, story.imageCaption, ...story.beats.flatMap((beat) => [beat.title, beat.body]), story.connection, story.everyday]) {
      expect(copy.hi.trim().length).toBeGreaterThan(3);
      expect(copy.en.trim().length).toBeGreaterThan(3);
    }
  }
});

test('the three Valmiki story citations resolve to the bundled sargas', () => {
  const refs = Object.values(gitaSaarStories).flatMap((story) =>
    story.sources.flatMap((source) =>
      source.inAppRef?.kind === 'valmiki-ramayan'
        ? [`${source.inAppRef.kanda}.${source.inAppRef.sarga}`]
        : []
    )
  );
  expect(refs).toEqual(['1.43', '1.44', '6.18']);
});
