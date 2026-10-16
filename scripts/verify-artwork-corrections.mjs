#!/usr/bin/env node
/**
 * The five reviewed 14 Oct refinements now ship from R2. Check that each
 * approved file is the publishing source for its slot and that the app
 * manifest points at its hash, so a regenerated manifest can't silently
 * restore the old art.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(path.join(root, file));
const approval = JSON.parse(read('docs/evaluations/artwork-corrections-2026-10-14/approved.json'));
const backgrounds = JSON.parse(read('mobile/src/data/backgroundAssetManifest.json')).assets;
const illustrations = JSON.parse(read('mobile/src/data/readerIllustrationManifest.json')).assets;
const slots = {
  'theerth-karni-mata-background.webp': ['mobile/assets/backgrounds/theerth-karni-mata.webp', backgrounds['backgrounds--theerth-karni-mata']],
  'hanuman-sita-background.webp': ['mobile/assets/chalisa/Hanuman_sita.webp', backgrounds['chalisa--Hanuman_sita']],
  'ram-hanuman-background.webp': ['mobile/assets/chalisa/Ram_hanuman.webp', backgrounds['chalisa--Ram_hanuman']],
  'rama-darbar-background.webp': ['mobile/assets/backgrounds/deity-rama-darbar.webp', backgrounds['backgrounds--deity-rama-darbar']],
  'theerth-karni-mata-banner.webp': ['mobile/assets/reader-illustrations/theerth-karni-mata.webp', illustrations['theerth-karni-mata']],
};
if (Object.keys(slots).sort().join() !== Object.keys(approval.assets).sort().join()) throw new Error('Expected the five reviewed refinements');
for (const [name, [source, entry]] of Object.entries(slots)) {
  const digest = createHash('sha256').update(read(source)).digest('hex');
  if (digest !== approval.assets[name].sha256) throw new Error(`Source is not the approved refinement: ${source}`);
  if (entry?.hash !== digest.slice(0, 16)) throw new Error(`Manifest does not point at the approved refinement: ${name}`);
}
console.log('Verified five reviewed refinements as R2 sources and manifest entries');
