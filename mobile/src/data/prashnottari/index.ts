/**
 * The question book registry (PRD-46). Screens read only VERIFIED packs;
 * drafts stay dark until an editor flips `status` (the gita-saar / pitru
 * verified-only boundary). `ALL_PRASHNA_PACKS` exists for the content gate and
 * review tooling, never for a screen.
 */
import { BALAKANDA_PACKS } from './packs/balakanda';
import { GITA_PARIKSHA_L1_BANK } from './packs/gitaParikshaL1';
import { STORY_PACKS } from './packs/stories';
import { drawPaper, paperSeed, type PresentedPrashna } from './paper';
import type { GitaParikshaLevel, PrashnaPack } from './types';

export const ALL_PRASHNA_PACKS: readonly PrashnaPack[] = [GITA_PARIKSHA_L1_BANK, ...BALAKANDA_PACKS, ...STORY_PACKS];

export const GITA_PARIKSHA_LEVELS: readonly GitaParikshaLevel[] = [
  {
    level: 1,
    title: { hi: 'प्रवेश परीक्षा', en: 'Entrance exam' },
    syllabusChapters: [12, 15],
    syllabusStatus: 'placeholder',
    paperSize: 25,
    durationMin: 30,
    bankPackId: 'gita-pariksha-l1',
  },
];

const isVerified = (pack: PrashnaPack) => pack.status === 'verified';

export function getPrashnaPack(id: string): PrashnaPack | undefined {
  const pack = ALL_PRASHNA_PACKS.find((p) => p.id === id);
  return pack && isVerified(pack) ? pack : undefined;
}

/** Verified practice packs, in shelf order. */
export function getAbhyasPacks(): PrashnaPack[] {
  return ALL_PRASHNA_PACKS.filter((p) => p.kind === 'abhyas' && isVerified(p));
}

export function getPackForComicEpisode(episodeId: string): PrashnaPack | undefined {
  return getAbhyasPacks().find((p) => p.tracks.kind === 'comic' && p.tracks.episodeIds.includes(episodeId));
}

export function getPackForStory(storyId: string): PrashnaPack | undefined {
  return getAbhyasPacks().find((p) => p.tracks.kind === 'story' && p.tracks.storyId === storyId);
}

export function getParikshaLevel(level: number): GitaParikshaLevel | undefined {
  return GITA_PARIKSHA_LEVELS.find((l) => l.level === level);
}

/**
 * A level's paper for a given attempt (1-based). `undefined` while the bank is
 * a draft — a draft bank never reaches a child. `allowDraft` is for the
 * content gate and review tooling only.
 */
export function drawParikshaPaper(
  level: number,
  attempt: number,
  options: { allowDraft?: boolean } = {},
): PresentedPrashna[] | undefined {
  const rung = getParikshaLevel(level);
  if (!rung) return undefined;
  const bank = ALL_PRASHNA_PACKS.find((p) => p.id === rung.bankPackId);
  if (!bank || (!isVerified(bank) && !options.allowDraft)) return undefined;
  return drawPaper(bank.questions, rung.paperSize, paperSeed(level, attempt));
}

export type { PresentedPrashna } from './paper';
export { GRADE_LABELS, SECTION_LABELS, gradePaper, presentPrashna } from './paper';
export type {
  Bilingual,
  GitaParikshaLevel,
  ParikshaGrade,
  Prashna,
  PrashnaBand,
  PrashnaContentStatus,
  PrashnaPack,
  PrashnaRef,
  PrashnaSection,
} from './types';
