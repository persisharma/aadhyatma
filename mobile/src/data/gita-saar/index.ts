/**
 * गीता सार — typed loader for the themed Gita compilations (RULEBOOK §29).
 *
 * Shape follows the chaptered-text pattern (`gita/index.ts`): an eager, tiny
 * manifest (one row per theme) and a lazy `getGitaSaarChapter(n)` that builds
 * the theme's pages on first open. A "chapter" here is a theme; a "verse" is
 * one Gita shloka in that theme's reading order, carrying the corpus Sanskrit
 * + transliteration (pulled from `getGitaChapter` — never re-typed) and the
 * theme's own saar lines as its meaning.
 *
 * LAUNCH-GRAPH RULE (launchGraph.test.ts): `entryRoutes.ts` and `texts.ts`
 * read this manifest at module scope, so the theme registry — and, through
 * it, the Gita corpus — must sit behind a `require()` thunk. The manifest is
 * hand-mirrored here and pinned to the registry by `gitaSaarContent.test.ts`
 * (verseCount == flattened refs), the same way the chaptered totals are pinned.
 */
import { getGitaChapter } from '@/data/gita';
import type { GitaSaarRef, GitaSaarTheme } from './types';

export type {
  GitaSaarContentStatus,
  GitaSaarGroup,
  GitaSaarRef,
  GitaSaarSource,
  GitaSaarTheme,
  GitaSaarVerseEntry,
} from './types';

export type GitaSaarChapterSummary = {
  chapter: number;
  /** The theme id (`GitaSaarTheme.id`) this chapter number maps to. */
  id: string;
  titleHi: string;
  titleEn: string;
  verseCount: number;
};

/** One page of the saar reader — a Gita verse read inside a theme. */
export type GitaSaarVerse = {
  /** `saar-<theme>-<gitaChapter>-<gitaVerse>` — stable across reorders inside a theme. */
  id: string;
  /** The theme's chapter number (position in the manifest). */
  chapter: number;
  /** 1-based position inside the theme — the reader's page number. */
  number: number;
  /** Where this shloka lives in the Gita, as printed. */
  gitaChapter: number;
  gitaVerse: number;
  /** Corpus text, read from `data/gita/` at open time. */
  sanskrit: string[];
  transliteration: string[];
  /** The saar — the theme's plain-language sense of the verse. */
  meaningHi: string;
  meaningEn: string;
  themeHi: string;
  themeEn: string;
  /** The group (section of the reading order) this verse sits in. */
  groupIndex: number;
  groupTitleHi: string;
  groupTitleEn: string;
  groupIntroHi: string;
  groupIntroEn: string;
  /** True on a group's first verse — the page shows the group intro. */
  isGroupStart: boolean;
};

export type GitaSaarChapter = {
  chapter: number;
  id: string;
  titleHi: string;
  titleEn: string;
  ledeHi: string;
  ledeEn: string;
  closingHi: string;
  closingEn: string;
  verseCount: number;
  verses: GitaSaarVerse[];
};

export const gitaSaarTitleHi = 'गीता सार';
export const gitaSaarTitleEn = 'Gita Saar';

/**
 * Eager manifest — the ONLY thing the launch path may read. Mirrors
 * `themes/index.ts` row for row; `gitaSaarContent.test.ts` fails if a theme's
 * id, titles or flattened verse count drift from what is listed here.
 */
export const gitaSaarChaptersManifest: readonly GitaSaarChapterSummary[] = [
  { chapter: 1, id: 'true-prema', titleHi: 'सच्चा प्रेम', titleEn: 'True Prema', verseCount: 19 },
];

export const gitaSaarTotal = gitaSaarChaptersManifest.reduce((sum, c) => sum + c.verseCount, 0);

function loadThemes(): readonly GitaSaarTheme[] {
  return (require('./themes') as typeof import('./themes')).GITA_SAAR_THEMES;
}

/** Verified themes only — a draft theme is invisible on every surface. */
export function getGitaSaarThemes(): readonly GitaSaarTheme[] {
  return loadThemes().filter((t) => t.status === 'verified');
}

export function getGitaSaarTheme(id: string): GitaSaarTheme | null {
  return getGitaSaarThemes().find((t) => t.id === id) ?? null;
}

/**
 * Resolve a saar ref against the bundled corpus. Throws when the ref names a
 * verse the corpus does not carry, or whose printed number disagrees — a
 * typo in a theme file must fail loudly at first open (and in the content
 * test), never render the wrong shloka.
 */
export function resolveGitaSaarRef(ref: GitaSaarRef) {
  const chapter = getGitaChapter(ref.chapter);
  const verse = chapter.verses[ref.verse - 1];
  if (!verse || verse.number !== ref.verse) {
    throw new Error(`gita-saar: ref ${ref.chapter}.${ref.verse} does not resolve in the bundled Gita`);
  }
  return verse;
}

const chapterCache = new Map<number, GitaSaarChapter>();

export function getGitaSaarChapter(chapter: number): GitaSaarChapter {
  const cached = chapterCache.get(chapter);
  if (cached) return cached;
  const summary = gitaSaarChaptersManifest[chapter - 1];
  if (!summary || summary.chapter !== chapter) {
    throw new Error(`gita-saar: chapter ${chapter} is out of range`);
  }
  const theme = getGitaSaarTheme(summary.id);
  if (!theme) {
    throw new Error(`gita-saar: theme '${summary.id}' is not in the verified registry`);
  }
  const verses: GitaSaarVerse[] = [];
  theme.groups.forEach((group, groupIndex) => {
    group.verses.forEach((entry, i) => {
      const corpus = resolveGitaSaarRef(entry.ref);
      verses.push({
        id: `saar-${theme.id}-${entry.ref.chapter}-${entry.ref.verse}`,
        chapter,
        number: verses.length + 1,
        gitaChapter: entry.ref.chapter,
        gitaVerse: entry.ref.verse,
        sanskrit: [...corpus.sanskrit],
        transliteration: [...corpus.transliteration],
        meaningHi: entry.saarHi,
        meaningEn: entry.saarEn,
        themeHi: entry.themeHi,
        themeEn: entry.themeEn,
        groupIndex,
        groupTitleHi: group.titleHi,
        groupTitleEn: group.titleEn,
        groupIntroHi: group.introHi,
        groupIntroEn: group.introEn,
        isGroupStart: i === 0,
      });
    });
  });
  if (verses.length !== summary.verseCount) {
    throw new Error(
      `gita-saar: manifest says ${summary.verseCount} verses for '${theme.id}', registry has ${verses.length}`
    );
  }
  const built: GitaSaarChapter = {
    chapter,
    id: theme.id,
    titleHi: theme.titleHi,
    titleEn: theme.titleEn,
    ledeHi: theme.ledeHi,
    ledeEn: theme.ledeEn,
    closingHi: theme.closingHi,
    closingEn: theme.closingEn,
    verseCount: verses.length,
    verses,
  };
  chapterCache.set(chapter, built);
  return built;
}
