import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { createHash } from 'node:crypto';
import reviewedFrames from '../../components/kidsStoryArtFrames.json';
import { kidsStories, getKidsStory, storyDeities, storiesForDeity, plannedStories, storyPageIndex, storyText, navadurgaReadings } from '../kidsStories';

test('deity shelves contain only published stories, with future titles kept separate', () => {
  assert.deepEqual(storyDeities.map(deity => deity.id), ['krishna', 'ganesha', 'hanuman', 'durga']);
  for (const story of kidsStories) {
    assert.ok(storyDeities.some(deity => deity.id === story.deityId), `${story.id}: unknown deity`);
  }
  assert.deepEqual(storiesForDeity('krishna').map(story => story.id), ['krishna-janma', 'putana', 'kaliya-nag']);
  assert.deepEqual(storiesForDeity('ganesha').map(story => story.id), ['ganesha-birth']);
  assert.deepEqual(storiesForDeity('hanuman').map(story => story.id), ['hanuman-sun']);
  assert.equal(plannedStories.some(story => story.id === 'kaliya-nag'), false);
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

test('the four new stories carry complete sourced arcs, regional text and distinct matching artwork', () => {
  const expected = { putana: 10, 'kaliya-nag': 8, 'ganesha-birth': 11, 'hanuman-sun': 10 };
  const componentUrl = new URL('../../components/KidsStoryArt.tsx', import.meta.url);
  const component = readFileSync(componentUrl, 'utf8');
  const assets = new Map([...component.matchAll(/(\w+): '([a-z]{2}-\d+)'/g)].map(match => [match[1], `../../assets/kids-stories/${match[2]}.webp`]));
  const hashes = new Set<string>();
  for (const [id, pageCount] of Object.entries(expected)) {
    const story = getKidsStory(id)!;
    assert.ok(story, `Missing requested story: ${id}`);
    assert.equal(story.pages.length, pageCount);
    assert.ok(story.source?.baseText);
    assert.equal(story.source.retrievedOn, '2026-10-07');
    assert.ok(new Set(story.source.referenceUrls.map(url => new URL(url).hostname)).size >= 2,
      `${id}: corroborate the narrative against two publication sources`);
    assert.equal(new Set(story.pages.map(page => page.art)).size, pageCount);
    assert.notEqual(story.coverArt, story.pages.at(-1)!.art, `${id}: cover must not substitute for closing scene`);
    const prototype = readFileSync(new URL(`../../../../docs/kids-stories-${id}-prototype.html`, import.meta.url), 'utf8');
    const prototypeStory = prototype.match(/const story = (\{.*?\});/);
    const prototypeArtwork = prototype.match(/const artwork = (\{.*?\});/);
    assert.ok(prototypeStory);
    assert.ok(prototypeArtwork);
    assert.deepEqual(JSON.parse(prototypeStory[1]), story, `${id}: browser story must match native`);
    const browserAssets = JSON.parse(prototypeArtwork[1]) as Record<string, string>;
    for (const page of story.pages) {
      assert.match(page.source, /^(Bhagavata Purana|Shiva Purana|Valmiki Ramayana)/);
      for (const field of [page.title, page.text]) {
        assert.match(field.hi, /[\u0900-\u097F]/);
        assert.match(field.gu, /[\u0A80-\u0AFF]/);
        assert.match(field.kn, /[\u0C80-\u0CFF]/);
        assert.doesNotMatch(field.en, /[\u0900-\u097F\u0A80-\u0AFF\u0C80-\u0CFF]/);
      }
      const asset = assets.get(page.art);
      assert.ok(asset, `${id}/${page.id}: missing asset map`);
      const native = readFileSync(new URL(asset, componentUrl));
      assert.ok(browserAssets[page.art], `${id}/${page.id}: missing browser art map`);
      const browser = readFileSync(new URL(`../../../../docs/${browserAssets[page.art]}`, import.meta.url));
      assert.deepEqual(native, browser, `${id}/${page.id}: app/browser asset mismatch`);
      const hash = createHash('sha256').update(native).digest('hex');
      assert.equal(hashes.has(hash), false, `${id}/${page.id}: artwork reused from another scene`);
      hashes.add(hash);
    }
  }
  assert.equal(hashes.size, 39);
});

test('every page and cover resolves to a source illustration (uploaded to the CDN, cached on-device)', () => {
  const component = readFileSync(fileURLToPath(new URL('../../components/KidsStoryArt.tsx', import.meta.url)), 'utf8');
  const assets = new Map([...component.matchAll(/(\w+): '([a-z]{2}-\d+)'/g)].map(match => [match[1], `../../assets/kids-stories/${match[2]}.webp`]));
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

test('every source illustration has a bottom-band review tied to its actual image bytes', () => {
  const componentUrl = new URL('../../components/KidsStoryArt.tsx', import.meta.url);
  const component = readFileSync(componentUrl, 'utf8');
  const assets = new Map([...component.matchAll(/(\w+): '([a-z]{2}-\d+)'/g)].map(match => [match[1], `../../assets/kids-stories/${match[2]}.webp`]));
  assert.deepEqual(Object.keys(reviewedFrames).sort(), [...assets.keys()].sort(), 'Review every image, including covers');
  for (const [art, frame] of Object.entries(reviewedFrames)) {
    assert.ok(frame.retainedHeight > 0 && frame.retainedHeight <= 1, `${art}: invalid retained image height`);
    const bytes = readFileSync(new URL(assets.get(art)!, componentUrl));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), frame.sha256,
      `${art}: illustration changed; visually review and update its bottom-band frame before shipping`);
  }
});

test('Krishna Janma keeps distinct scene art and matching browser assets', () => {
  const story = getKidsStory('krishna-janma')!;
  assert.equal(story.pages.length, 16);
  assert.equal(new Set([story.coverArt, ...story.pages.map(page => page.art)]).size, 17);
  const expectedScenes = {
    wedding: 'wedding', prophecy: 'chariot', threat: 'threat', promise: 'sword',
    imprisoned: 'imprisoned', 'six-children': 'prison', balarama: 'balarama',
    midnight: 'midnight', darshan: 'vishnu', prayer: 'prayer', escape: 'escape',
    'yamuna-crossing': 'yamuna', gokul: 'gokul', return: 'return', devi: 'devi', safe: 'safe',
  };
  assert.deepEqual(Object.fromEntries(story.pages.map(page => [page.id, page.art])), expectedScenes);

  const repoRoot = new URL('../../../../', import.meta.url);
  const componentUrl = new URL('../../components/KidsStoryArt.tsx', import.meta.url);
  const component = readFileSync(componentUrl, 'utf8');
  const assets = new Map([...component.matchAll(/(\w+): '([a-z]{2}-\d+)'/g)].map(match => [match[1], `../../assets/kids-stories/${match[2]}.webp`]));
  const prototype = readFileSync(new URL('docs/kids-stories-prototype.html', repoRoot), 'utf8');
  const prototypeStory = prototype.match(/const story = (\{.*?\});/);
  const prototypeArtwork = prototype.match(/const artwork = (\{.*?\});/);
  assert.ok(prototypeStory);
  assert.ok(prototypeArtwork);
  assert.deepEqual(JSON.parse(prototypeStory[1]), story);
  const browserAssets = JSON.parse(prototypeArtwork[1]) as Record<string, string>;
  for (const art of [story.coverArt, ...story.pages.map(page => page.art)]) {
    assert.ok(assets.get(art));
    assert.ok(browserAssets[art], `Missing browser art: ${art}`);
    const nativeUrl = new URL(assets.get(art)!, componentUrl);
    const browserUrl = new URL(`docs/${browserAssets[art]}`, repoRoot);
    assert.deepEqual(readFileSync(nativeUrl), readFileSync(browserUrl), `App/browser mismatch: ${art}`);
  }
});

test('Navaratri resolves all nine days once, with honest introduction labels and the shared Katyayani story', () => {
  assert.deepEqual(navadurgaReadings.map(form => form.day), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.equal(new Set(navadurgaReadings.map(form => form.storyId)).size, 9);
  assert.equal(navadurgaReadings.find(form => form.id === 'katyayani')!.storyId, 'durga-mahishasura');
  for (const form of navadurgaReadings) assert.equal(getKidsStory(form.storyId)?.deityId, 'durga');
  assert.deepEqual(storiesForDeity('durga').filter(story => story.kind === 'introduction').map(story => story.id).sort(),
    ['durga-kalaratri', 'durga-kushmanda', 'durga-navaratri', 'durga-siddhidatri']);
  assert.notEqual(navadurgaReadings.find(form => form.id === 'kalaratri')!.storyId, 'durga-raktabeej');
});

test('Durga readings carry all four narratives, sourced page arcs, unique art and matching browser/CDN bytes', () => {
  const expected: Record<string, number> = {
    'durga-navaratri': 3, 'durga-shailaputri': 4, 'durga-brahmacharini': 7,
    'durga-chandraghanta': 5, 'durga-kushmanda': 3, 'durga-skandamata': 5,
    'durga-mahishasura': 12, 'durga-kalaratri': 2, 'durga-mahagauri': 7,
    'durga-siddhidatri': 3, 'durga-raktabeej': 7, 'durga-shumbha-nishumbha': 14,
    'durga-suratha-samadhi': 7, 'durga-shakambhari': 8,
  };
  assert.deepEqual(storiesForDeity('durga').map(story => story.id).sort(), Object.keys(expected).sort());
  const root = new URL('../../../../', import.meta.url);
  const component = readFileSync(new URL('mobile/src/components/KidsStoryArt.tsx', root), 'utf8');
  const stems = new Map([...component.matchAll(/(\w+): '([a-z]{2}-\d+)'/g)].map(match => [match[1], match[2]]));
  const manifest = JSON.parse(readFileSync(new URL('mobile/src/data/kidsStoryAssetManifest.json', root), 'utf8'));
  const hashes = new Set<string>();
  for (const story of storiesForDeity('durga')) {
    assert.equal(story.pages.length, expected[story.id]);
    assert.equal(story.source?.retrievedOn, '2026-10-09');
    assert.ok(story.source?.baseText && story.source.notes);
    assert.ok(new Set(story.source.referenceUrls.map(url => new URL(url).hostname)).size >= 2);
    const html = readFileSync(new URL(`docs/kids-stories-${story.id}-prototype.html`, root), 'utf8');
    assert.deepEqual(JSON.parse(html.match(/const story = (\{.*?\});/)![1]), story);
    const art = JSON.parse(html.match(/const artwork = (\{.*?\});/)![1]);
    for (const page of story.pages) {
      assert.ok(page.source.trim());
      for (const field of [page.title, page.text]) {
        assert.match(field.hi, /[\u0900-\u097F]/);
        assert.match(field.gu, /[\u0A80-\u0AFF]/);
        assert.match(field.kn, /[\u0C80-\u0CFF]/);
        assert.doesNotMatch(field.en, /[\u0900-\u097F\u0A80-\u0AFF\u0C80-\u0CFF]/);
      }
      const stem = stems.get(page.art);
      assert.ok(stem, `${story.id}/${page.id}: unmapped scene`);
      const native = readFileSync(new URL(`mobile/assets/kids-stories/${stem}.webp`, root));
      assert.deepEqual(native, readFileSync(new URL(`docs/${art[page.art]}`, root)));
      const hash = createHash('sha256').update(native).digest('hex');
      assert.equal(hashes.has(hash), false, `${story.id}/${page.id}: duplicate scene`);
      hashes.add(hash);
      assert.equal(manifest.prefix, 'kids-stories');
      assert.deepEqual(manifest.assets[stem], { hash: hash.slice(0, 16), ext: 'webp' });
    }
    assert.ok(story.pages.some(page => page.art === story.coverArt), `${story.id}: cover is a reviewed complete scene`);
  }
  assert.equal(hashes.size, 87);
});
