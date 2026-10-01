import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { kidsStories, getKidsStory, storyPageIndex, storyText } from '../kidsStories';

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
  assert.equal(index, 7);
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

test('every illustrated page resolves to an offline asset or the existing prototype artwork', () => {
  const placeholders = JSON.parse(readFileSync(fileURLToPath(new URL('../kidsStories/placeholder-art.json', import.meta.url)), 'utf8'));
  assert.ok(existsSync(fileURLToPath(new URL('../../../assets/kids-stories/kj-08.webp', import.meta.url))));
  for (const story of kidsStories) for (const page of story.pages) {
    assert.ok(page.art === 'yamuna' || placeholders[page.art], `Missing illustration: ${page.id}`);
  }
});
