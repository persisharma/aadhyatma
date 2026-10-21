import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { test } from 'node:test';
import { VIDHI_ENTRIES, VIDHI_DRAFTS } from '../vidhi';
import { getVidhiStepVisual, getVidhiStepVisualSequence, getVidhiVisualInstructionParts, hasVidhiVisualClauseCaptions, VIDHI_STEP_VISUALS, VIDHI_STEP_VISUAL_SEQUENCES, VIDHI_VISUAL_KEYS } from '../vidhi/stepVisuals';
import { vidhiArtworkAsset, vidhiArtworkRequest } from '../vidhiArtworkAsset';
import manifest from '../vidhiArtworkManifest.json';
import sources from '../vidhiArtworkSources.json';

const readJson = (relative: string) => JSON.parse(readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8'));
const review = readJson('../../../../docs/content-parity/puja-visual-guide/step-review.json');
const sourceAssets: Record<string, { file: string; sha256: string }> = sources.assets;
const manifestAssets: Record<string, { hash: string; ext: string; width: number; height: number }> = manifest.assets;
const hash = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');

test('all 106 published steps use reviewed R2 images, including every supplementary image', () => {
  assert.equal(VIDHI_ENTRIES.reduce((sum, entry) => sum + entry.steps.length, 0), 106);
  assert.deepEqual(Object.keys(VIDHI_STEP_VISUALS).sort(), VIDHI_ENTRIES.map(entry => entry.id).sort());
  const used = new Set<string>();
  for (const entry of VIDHI_ENTRIES) {
    assert.deepEqual(Object.keys(VIDHI_STEP_VISUALS[entry.id]).sort(), entry.steps.map(step => step.id).sort(), entry.id);
    for (const step of entry.steps) {
      const primary = getVidhiStepVisual(entry.id, step.id);
      assert.ok(primary);
      const sequence = getVidhiStepVisualSequence(entry.id, step.id);
      assert.ok(sequence.length > 0);
      for (const key of [primary, ...sequence]) {
        used.add(key);
        assert.ok(VIDHI_VISUAL_KEYS.includes(key));
        assert.ok(manifestAssets[key], key);
        assert.ok(sourceAssets[key], key);
        const bytes = readFileSync(fileURLToPath(new URL(`../../../../${sourceAssets[key].file}`, import.meta.url)));
        assert.equal(hash(bytes), sourceAssets[key].sha256, key);
        assert.equal(manifestAssets[key].hash, sourceAssets[key].sha256.slice(0, 16), key);
        const request = vidhiArtworkRequest(vidhiArtworkAsset(key));
        assert.ok(request?.remoteUrl.endsWith(`/vidhi-steps/${manifestAssets[key].hash}.webp`), key);
      }
    }
  }
  assert.equal(manifest.prefix, 'vidhi-steps');
  assert.deepEqual(Object.keys(manifest.assets).sort(), [...used].sort(), 'Only used paintings are published');
  for (const [id, sequences] of Object.entries(VIDHI_STEP_VISUAL_SEQUENCES)) {
    for (const stepId of Object.keys(sequences)) assert.ok(VIDHI_ENTRIES.find(v => v.id === id)?.steps.find(s => s.id === stepId));
  }
  for (const draft of VIDHI_DRAFTS) assert.equal(VIDHI_STEP_VISUALS[draft.id], undefined);
  assert.equal(getVidhiStepVisual('unknown', 'sankalp'), null);
  assert.deepEqual(getVidhiStepVisualSequence('unknown', 'sankalp'), []);
});

test('a content, assignment or image change invalidates its exact step-by-step semantic review', () => {
  assert.equal(review.steps.length, 106);
  assert.equal(new Set(review.steps.map((r: { vidhiId: string; stepId: string }) => `${r.vidhiId}/${r.stepId}`)).size, 106);
  for (const entry of VIDHI_ENTRIES) for (const step of entry.steps) {
    const r = review.steps.find((candidate: { vidhiId: string; stepId: string }) => candidate.vidhiId === entry.id && candidate.stepId === step.id);
    assert.ok(r, `${entry.id}/${step.id}`);
    assert.equal(r.instructionSha256, hash(JSON.stringify([step.titleHi, step.titleEn, step.instructionHi, step.instructionEn])), step.id);
    assert.equal(r.visual, getVidhiStepVisual(entry.id, step.id));
    assert.deepEqual(r.visualSequence, getVidhiStepVisualSequence(entry.id, step.id));
    for (const key of r.visualSequence) assert.equal(r.artSha256[key], sourceAssets[key].sha256);
    assert.ok(r.depicts.trim() && r.coverageBoundary.trim());
    if (hasVidhiVisualClauseCaptions(entry.id, step.id)) {
      assert.equal(r.visualSequence.length, 2);
      const parts = getVidhiVisualInstructionParts(entry.id, step.id, step.instructionHi, step.instructionEn);
      assert.ok(parts, `${step.id}: missing bilingual clause boundary`);
      assert.equal(parts.map(part => part.hi).join(' '), step.instructionHi);
      assert.equal(parts.map(part => part.en).join(' '), step.instructionEn);
    }
  }
});

test('deity-specific flowers, offerings and distinct actions cannot regress to generic art', () => {
  assert.equal(getVidhiStepVisual('satyanarayan-puja', 'pushpa'), 'vishnu-flowers');
  assert.equal(getVidhiStepVisual('satyanarayan-puja', 'asana'), 'vishnu-asana-flowers');
  assert.equal(getVidhiStepVisual('satyanarayan-puja', 'snana'), 'satyanarayan-snana');
  assert.equal(getVidhiStepVisual('diwali-lakshmi-ganesh-puja', 'lakshmi-pushpa'), 'lakshmi-lotus');
  assert.equal(getVidhiStepVisual('diwali-lakshmi-ganesh-puja', 'lakshmi-naivedya'), 'diwali-naivedya');
  assert.deepEqual(getVidhiStepVisualSequence('diwali-lakshmi-ganesh-puja', 'ganesh-upachara'), ['ganesha-snana', 'ganesha-upachara']);
  assert.deepEqual(getVidhiStepVisualSequence('diwali-lakshmi-ganesh-puja', 'lakshmi-snana'), ['lakshmi-metal-snana', 'lakshmi-symbolic-snana']);
  assert.equal(getVidhiStepVisual('ganesh-chaturthi-sthapana', 'pushpa-durva'), 'ganesha-offering');
  assert.equal(getVidhiStepVisual('maha-shivaratri-puja', 'sankalp'), 'sankalp-white');
  assert.equal(getVidhiStepVisual('maha-shivaratri-puja', 'bilva-pushpa'), 'shiva-bilva-datura');
  assert.equal(getVidhiStepVisual('maha-shivaratri-puja', 'naivedya'), 'vrat-naivedya');
  for (const key of Object.values(VIDHI_STEP_VISUALS['maha-shivaratri-puja'])) {
    assert.ok(!['sankalp', 'flowers-akshat', 'water-offering', 'aarti', 'dhoop-deep', 'panchopachara', 'ganesha-offering'].includes(key), `Unsafe generic flower reuse: ${key}`);
  }
  assert.equal(getVidhiStepVisual('navratri-ghatasthapana', 'samagri-sajja'), 'navratri-samagri');
  assert.equal(getVidhiStepVisual('navratri-ghatasthapana', 'ghata-sthapana'), 'ghata-grain-bed');
  assert.deepEqual(getVidhiStepVisualSequence('navratri-ghatasthapana', 'dhanya-parata'), ['soil-layer', 'grain-bed-water']);
  assert.equal(getVidhiStepVisual('navratri-ghatasthapana', 'panchopachara'), 'panchopachara');
  assert.equal(getVidhiStepVisual('karwa-chauth-puja', 'thali-phera'), 'thali-phera');
  assert.equal(getVidhiStepVisual('karwa-chauth-puja', 'karwa-dana'), 'karwa-dana');
  assert.equal(getVidhiStepVisual('karwa-chauth-puja', 'chandra-arghya'), 'moon-arghya');
});

test('personal remembrance art remains flame-free without deity or ancestor portraits', () => {
  const safe = new Set(['remembrance-vessels', 'panchang', 'prayer', 'sesame-water', 'tarpana', 'scripture']);
  for (const stepId of Object.keys(VIDHI_STEP_VISUALS['shraddha-tarpan-vidhi'])) {
    for (const key of getVidhiStepVisualSequence('shraddha-tarpan-vidhi', stepId)) assert.ok(safe.has(key), key);
  }
  assert.equal(getVidhiStepVisual('shraddha-tarpan-vidhi', 'offer-water'), 'tarpana');
});
