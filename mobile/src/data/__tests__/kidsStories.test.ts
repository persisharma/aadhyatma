import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { kidsStories, getKidsStory, storyDeities, storiesForDeity, plannedStories, storyPageIndex, storyText } from '../kidsStories';

test('deity shelves contain only published stories, with future titles kept separate', () => {
  assert.deepEqual(storyDeities.map(deity => deity.id), ['krishna', 'ganesha', 'hanuman']);
  for (const story of kidsStories) {
    assert.ok(storyDeities.some(deity => deity.id === story.deityId), `${story.id}: unknown deity`);
  }
  assert.deepEqual(storiesForDeity('krishna').map(story => story.id), ['krishna-janma']);
  assert.deepEqual(storiesForDeity('ganesha'), []);
  assert.deepEqual(storiesForDeity('hanuman'), []);
  for (const planned of plannedStories) assert.equal(getKidsStory(planned.id), undefined);
});

test('stories have unique stable pages and authored text in all four languages', () => {
  assert.equal(new Set(kidsStories.map(story => story.id)).size, kidsStories.length);
  for (const story of kidsStories) {
    assert.ok(story.pages.length > 1);
    assert.equal(new Set(story.pages.map(page => page.id)).size, story.pages.length);
    for (const lang of ['hi', 'en', 'gu', 'kn'] as const) {
      for (const value of [story.title, story.description, story.takeaway, story.sourceNote, ...story.pages.flatMap(page => [page.title, page.text])]) {
        assert.ok(value[lang]?.trim(), `${story.id}: missing ${lang} translation`);
      }
    }
  }
});

test('locale selection changes narration while keeping the shared illustration and page', () => {
  const story = getKidsStory('krishna-janma')!;
  const index = storyPageIndex(story, 'yamuna-crossing');
  assert.equal(index, 11);
  const page = story.pages[index];
  assert.equal(page.art, 'yamuna');
  assert.notEqual(storyText(page.text, 'hi'), storyText(page.text, 'en'));
  assert.match(storyText(page.text, 'gu'), /[\u0A80-\u0AFF]/);
  assert.match(storyText(page.text, 'kn'), /[\u0C80-\u0CFF]/);
  assert.equal(storyPageIndex(story, 'yamuna-crossing'), index);
  assert.equal(storyPageIndex(story, 'unknown'), 0);
  assert.equal(getKidsStory('missing'), undefined);
  assert.equal(storyText({ en: 'English fallback' }, 'kn'), 'English fallback');
});

test('every page and cover resolves to a bundled final illustration', () => {
  const component = readFileSync(fileURLToPath(new URL('../../components/KidsStoryArt.tsx', import.meta.url)), 'utf8');
  const assets = new Map([...component.matchAll(/(\w+): require\('(.+?)'\)/g)].map(match => [match[1], match[2]]));
  for (const story of kidsStories) for (const art of [story.coverArt, ...story.pages.map(page => page.art)]) {
    const asset = assets.get(art);
    assert.ok(asset, `Missing static Metro import: ${art}`);
    const path = fileURLToPath(new URL(asset, new URL('../../components/KidsStoryArt.tsx', import.meta.url)));
    assert.ok(existsSync(path), `Missing bundled illustration: ${art}`);
    const bytes = readFileSync(path);
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
  }
});
