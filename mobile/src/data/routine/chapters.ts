/**
 * Chapter registry for the add-to-routine chapter picker. Maps a chaptered
 * source id to its chapters (number + bilingual title). Non-chaptered sources
 * (chalisas, aartis, japam, sanskar) return an empty list — they add whole.
 */
import { gitaChaptersManifest } from '@/data/gita';
import { sundarkandChaptersManifest } from '@/data/sundarkand';
import { shivaStrotamChaptersManifest } from '@/data/shiva-strotam';
import { durgaStotramChaptersManifest } from '@/data/durga-stotram';
import { saraswatiStotramChaptersManifest } from '@/data/saraswati-stotram';
import { ganeshStotramChaptersManifest } from '@/data/ganesh-stotram';
import { vishnuSahasranamaChaptersManifest } from '@/data/vishnu-sahasranama';
import { hanumanAshtakChaptersManifest } from '@/data/hanuman-ashtak';
import { krishnaStotramChaptersManifest } from '@/data/krishna-stotram';
import { bajrangBaanChaptersManifest } from '@/data/bajrang-baan';
import { ramStutiChaptersManifest } from '@/data/ram-stuti';
import { ramrakshaStotramChaptersManifest } from '@/data/ramraksha-stotram';
import { adityaHridayamChaptersManifest } from '@/data/aditya-hridayam';
import { ramcharitmanasChaptersManifest } from '@/data/ramcharitmanas';

export type ChapterInfo = { chapter: number; titleHi: string; titleEn: string };

type Manifest = readonly { chapter: number; titleHi: string; titleEn: string }[];

const REGISTRY: Record<string, Manifest> = {
  'bhagavad-gita': gitaChaptersManifest,
  sundarkand: sundarkandChaptersManifest,
  'shiva-strotam': shivaStrotamChaptersManifest,
  'durga-stotram': durgaStotramChaptersManifest,
  'saraswati-stotram': saraswatiStotramChaptersManifest,
  'ganesh-stotram': ganeshStotramChaptersManifest,
  'vishnu-sahasranama': vishnuSahasranamaChaptersManifest,
  'hanuman-ashtak': hanumanAshtakChaptersManifest,
  'krishna-stotram': krishnaStotramChaptersManifest,
  'bajrang-baan': bajrangBaanChaptersManifest,
  'ram-stuti': ramStutiChaptersManifest,
  'ramraksha-stotram': ramrakshaStotramChaptersManifest,
  'aditya-hridayam': adityaHridayamChaptersManifest,
  ramcharitmanas: ramcharitmanasChaptersManifest,
};

/** Chapters for a source, or [] if the source has no chapter structure. */
export function chaptersForSource(sourceId: string): ChapterInfo[] {
  const m = REGISTRY[sourceId];
  if (!m) return [];
  return m.map((c) => ({ chapter: c.chapter, titleHi: c.titleHi, titleEn: c.titleEn }));
}

export function isChapteredSource(sourceId: string): boolean {
  return sourceId in REGISTRY;
}
