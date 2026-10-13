import type { Lang } from '@/data/gita/language';

export type ComicLanguage = 'hi' | 'en';
export type ComicCopy = { narration: string; speaker: string | null; dialogue: string | null };
export type ComicPanel = {
  id: string;
  source: string;
  hi: ComicCopy;
  en: ComicCopy;
  art: string;
  sha256: string;
  dimensions: { width: number; height: number };
  frame: { x: number; y: number; width: number; height: number };
  speakerAnchor?: { x: number; review: string };
  overlaySpeech?: boolean;
};
export type ComicEpisode = {
  id: string;
  hi: { title: string; framing: string };
  en: { title: string; framing: string };
  panels: ComicPanel[];
};
export type ComicBook = { episodes: ComicEpisode[]; panelCount: number };

// gu/kn have no reviewed translation. Show explicitly labelled English fallback,
// never relabel Hindi transliteration as a translated narrative.
export const comicLanguage = (lang: Lang): ComicLanguage => lang === 'hi' ? 'hi' : 'en';
export function getComicBook(id: string): ComicBook | undefined {
  if (id === 'balakanda-v1') return require('./balakanda.json') as ComicBook;
  return undefined;
}
export function comicPages(book: ComicBook) {
  return book.episodes.flatMap(episode => episode.panels.map((panel, episodeIndex) => ({ panel, episode, episodeIndex })));
}
export function comicPageIndex(book: ComicBook, episodeId?: string, panelId?: string): number {
  const pages = comicPages(book);
  const index = panelId
    ? pages.findIndex(page => page.panel.id === panelId)
    : pages.findIndex(page => page.episode.id === episodeId);
  return Math.max(0, index);
}
