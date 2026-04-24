import type { ChalisaImageKey } from '@assets/chalisa';
import { hanumanChalisaVerses } from './hanumanChalisa';

const overrides: Record<string, ChalisaImageKey> = {
  'chaupai-09': 'hanuman_sita',
  'chaupai-10': 'hanuman_lankadahan',
  'chaupai-17': 'hanuman_lankadahan',
  'chaupai-18': 'hanuman_sea',
  'chaupai-19': 'hanuman_sea',
  'chaupai-31': 'hanuman_sita',
};

const DEFAULT_IMAGE: ChalisaImageKey = 'ram_hanuman';

export function imageKeyForVerse(verseId: string): ChalisaImageKey {
  return overrides[verseId] ?? DEFAULT_IMAGE;
}

// Sanity: every verse in the canon resolves to a known image key.
// Throws at module load if a verse is missing — blocks shipping a gap.
(function assertCoverage() {
  for (const verse of hanumanChalisaVerses) {
    const key = imageKeyForVerse(verse.id);
    if (!key) {
      throw new Error(`verseImages: no image key resolved for verse "${verse.id}"`);
    }
  }
})();
