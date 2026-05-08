import { chalisaImages } from '@assets/chalisa';
import { gitaImages } from '@assets/gita';
import { shivaStrotamImages } from '@assets/shiva-strotam';
import type { Deity } from './texts';

const ALL_LISTING_IMAGES: number[] = [
  chalisaImages.ram_hanuman,
  chalisaImages.hanuman_sita,
  chalisaImages.hanuman_sea,
  chalisaImages.hanuman_lankadahan,
  gitaImages.krishna_arjuna_vishvarupa,
  shivaStrotamImages.shiva,
];

const HANUMAN_IMAGES: number[] = [
  chalisaImages.hanuman_sea,
  chalisaImages.hanuman_sita,
  chalisaImages.hanuman_lankadahan,
  chalisaImages.ram_hanuman,
];

const DEITY_IMAGE_MAP: Partial<Record<Deity, number | number[]>> = {
  rama: chalisaImages.ram_hanuman,
  krishna: gitaImages.krishna_arjuna_vishvarupa,
  shiva: shivaStrotamImages.shiva,
  hanuman: HANUMAN_IMAGES,
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getDeityBackground(deityId: Deity): number | null {
  const entry = DEITY_IMAGE_MAP[deityId];
  if (!entry) return null;
  if (Array.isArray(entry)) return pickRandom(entry);
  return entry;
}

export function getRandomListingBackground(): number {
  return pickRandom(ALL_LISTING_IMAGES);
}
