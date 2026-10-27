import type { Lang } from '@/data/gita/language';

export type ComicLanguage = Lang;
export type ComicCopy = { narration: string; speaker: string | null; dialogue: string | null; note?: string };
export type ComicPanel = Record<Lang, ComicCopy> & {
  id: string; sourcePanel: string; source: string;
  art: string; sha256: string;
  dimensions: { width: number; height: number };
  frame: { x: number; y: number; width: number; height: number };
  zone: [number, number, number, number, number];
  mode: 'dialogue' | 'caption' | 'silent';
  mask?: [number, number][];
};
export type ComicEpisode = Record<Lang, { title: string; framing: string }> & { id: string; panels: ComicPanel[] };
export type ComicReadingPage = { id: string; number: number; title: Record<Lang, string>; rows: string[][]; sourceSargas: number[] };
export type ComicBook = { title: Record<Lang, string>; episodes: ComicEpisode[]; pages: ComicReadingPage[]; panelCount: number };
export const comicLanguage = (lang: Lang): ComicLanguage => lang;
export function getComicBook(id: string): ComicBook | undefined {
  if (id === 'balakanda-v1') return require('./balakanda.json') as ComicBook;
  if (id === 'ayodhyakanda-v1') return require('./ayodhyakanda.json') as ComicBook;
  return undefined;
}

import type { RemoteAssetManifest } from '@/data/assetManifest';
import balakandaManifest from '@/data/comicAssetManifest.json';
import ayodhyakandaManifest from '@/data/ayodhyaComicAssetManifest.json';
const comicManifests: Record<string, RemoteAssetManifest> = {
  'balakanda-v1': balakandaManifest,
  'ayodhyakanda-v1': ayodhyakandaManifest,
};
/** The CDN manifest for a comic's art sheets (each edition under its own R2 prefix). */
export function getComicManifest(comicId: string): RemoteAssetManifest {
  return comicManifests[comicId] ?? balakandaManifest;
}
export function comicPages(book: ComicBook) {
  const panels = new Map(book.episodes.flatMap(episode => episode.panels.map(panel => [panel.id, { panel, episode }] as const)));
  return book.pages.map(page => {
    const rows = page.rows.map(row => row.map(id => {
      const entry = panels.get(id);
      if (!entry) throw new Error(`Unknown comic scene: ${id}`);
      return entry.panel;
    }));
    const first = panels.get(page.rows[0][0])!;
    return { ...page, rows, panel: first.panel, episode: first.episode };
  });
}
export function comicPageIndex(book: ComicBook, episodeId?: string, panelId?: string): number {
  const episode = book.episodes.find(e => e.id === episodeId);
  const target = panelId ?? episode?.panels[0]?.id;
  return Math.max(0, book.pages.findIndex(page => page.rows.some(row => row.includes(target ?? ''))));
}
