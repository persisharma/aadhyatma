import { readFile, writeFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = new URL('./', import.meta.url);
const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const base = await readJson('../balakanda-v1/book.json');
const english = await readJson('english.json');
const revisions = await readJson('revisions.json');
const pacing = await readJson('pacing-notes.json');
const speakerAnchors = (await readJson('speaker-anchors.json')).panels;
assert.equal(english.episodes.length, base.episodes.length);
const fullFrame = { x: 0, y: 0, width: 1, height: 1, status: 'full-painted-bounds-reviewed' };
const episodes = base.episodes.map((episode, index) => {
  const [title, framing, translated] = english.episodes[index];
  assert.equal(translated.length, episode.panels.length, episode.id);
  const panels = episode.panels.flatMap((original, panelIndex) => {
    const [narration, speaker = null, dialogue = null] = translated[panelIndex];
    assert.equal(Boolean(dialogue), Boolean(original.dialogue), original.id);
    const change = revisions[original.id] || {};
    const panel = {
      id: original.id, source: original.source, sargas: original.sargas,
      hi: { narration: original.narration, speaker: original.speaker, dialogue: original.dialogue, ...change.hi },
      en: { narration, speaker, dialogue, ...change.en },
      asset: change.asset || `../balakanda-v1/${episode.asset}`,
      dimensions: change.asset ? { width: 1448, height: 1086 } : episode.dimensions,
      frame: change.frame || (change.asset ? fullFrame : original.frame),
      artAction: change.artAction || original.artAction,
      reviewNote: change.reason || 'Retains the original scene; English adaptation aligned with Hindi.'
    };
    const additions = (change.insertAfter || []).map(added => ({ ...added, sargas: [Number(added.source.split('.')[1])], dimensions: { width: 1448, height: 1086 }, frame: fullFrame, reviewNote: added.reason }));
    return [panel, ...additions];
  });
  return { id: episode.id, sargas: episode.sargas, hi: { title: episode.title, framing: episode.framing }, en: { title, framing }, panels };
});
const panels = episodes.flatMap(episode => episode.panels);
assert.deepEqual(Object.keys(speakerAnchors).sort(), panels.filter(panel => panel.hi.dialogue).map(panel => panel.id).sort(), 'Every dialogue needs exactly one reviewed speaker anchor');
for (const panel of panels.filter(panel => panel.hi.dialogue)) {
  const anchor = speakerAnchors[panel.id];
  assert.ok(Number.isFinite(anchor.x) && anchor.x > 0 && anchor.x < 1 && anchor.review, `${panel.id}/speaker anchor`);
  panel.speakerAnchor = anchor;
}
assert.equal(pacing.episodes.length, episodes.length);
const pacingReview = episodes.flatMap((episode, episodeIndex) => {
  assert.equal(pacing.episodes[episodeIndex].length, episode.panels.length, `${episode.id}/pacing`);
  return episode.panels.map((panel, panelIndex) => ({
    episode: episode.id, panel: panel.id, source: panel.source,
    previous: panels[panels.indexOf(panel) - 1]?.id || null,
    next: panels[panels.indexOf(panel) + 1]?.id || null,
    review: pacing.episodes[episodeIndex][panelIndex],
    languages: ['hi', 'en'],
    textSha256: createHash('sha256').update(JSON.stringify({ hi: panel.hi, en: panel.en })).digest('hex')
  }));
});
assert.equal(episodes.length, 29);
assert.equal(panels.length, 140);
assert.equal(new Set(panels.map(panel => panel.id)).size, panels.length);
assert.deepEqual([...new Set(panels.flatMap(panel => panel.sargas))].sort((first, second) => first - second), Array.from({ length: 77 }, (_, index) => index + 1));
const assets = {};
for (const panel of panels) {
  for (const language of ['hi', 'en']) {
    assert.ok(panel[language].narration || panel[language].dialogue, `${panel.id}/${language}`);
    assert.equal(Boolean(panel[language].dialogue), Boolean(panel[language].speaker), `${panel.id}/${language}/speaker`);
    if (language === 'en') assert.ok(!/[\u0900-\u097f]/u.test(JSON.stringify(panel.en)), `${panel.id}/English contains Devanagari`);
  }
  assert.equal(Boolean(panel.hi.dialogue), Boolean(panel.en.dialogue), panel.id);
  const frame = panel.frame;
  assert.ok(frame.x >= 0 && frame.y >= 0 && frame.width > 0 && frame.height > 0 && frame.x + frame.width <= 1.001 && frame.y + frame.height <= 1.001, panel.id);
  await access(new URL(panel.asset, root));
  if (!assets[panel.asset]) {
    const bytes = await readFile(new URL(panel.asset, root));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG', panel.asset);
    assert.equal(bytes.readUInt32BE(16), panel.dimensions.width, `${panel.asset}/width`);
    assert.equal(bytes.readUInt32BE(20), panel.dimensions.height, `${panel.asset}/height`);
    assets[panel.asset] = { sha256: createHash('sha256').update(bytes).digest('hex'), ...panel.dimensions, panels: [] };
  }
  assets[panel.asset].panels.push({ id: panel.id, frame: panel.frame });
}
const book = { id: 'valmiki-balakanda-comic-bilingual-v2', status: 'local-review-build', languages: ['hi', 'en'], pendingLanguages: ['gu', 'kn'], baseText: base.baseText, scope: base.scope, episodeCount: episodes.length, panelCount: panels.length, sourceCoverage: base.sourceCoverage, episodes };
await writeFile(new URL('book.json', root), JSON.stringify(book, null, 2) + '\n');
await writeFile(new URL('pacing-review.json', root), JSON.stringify({ reviewer: pacing.reviewer, pending: pacing.pending, panels: pacingReview }, null, 2) + '\n');
await writeFile(new URL('asset-manifest.json', root), JSON.stringify({ status: 'local-authoring-only; not a mobile/CDN manifest', assets }, null, 2) + '\n');
await writeFile(new URL('validation.json', root), JSON.stringify({ episodes: episodes.length, panels: panels.length, languages: book.languages, all77Sargas: true, uniqueIds: true, languageAndDialogueParity: true, validFramesAndAssetHashes: true, nativeAndIndependentEditorial: 'pending' }, null, 2) + '\n');
console.log(`${episodes.length} episodes / ${panels.length} panels / Hindi + English validated in ${fileURLToPath(root)}`);
