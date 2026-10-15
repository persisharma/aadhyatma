import type { ComicEpisode, ComicPanel } from './index';

/**
 * The one key scene per prasang for its listing card (design.md §76.1).
 * Chosen by the prasang's topic — the moment its title names — not by panel
 * order, so the shelf never shows an arbitrary first-panel crop. `focusX`
 * (0–1 across the panel) keeps the subject inside the 4:5 listing thumb.
 * Kept beside the generated book (not in balakanda.json) so
 * `sync-comic-book.mjs` stays the only writer of the reviewed edition.
 */
export const comicEpisodeCovers: Readonly<Record<string, { panelId: string; focusX?: number }>> = {
  'bk-01': { panelId: 'bk-01-03', focusX: 0.45 }, // Valmiki sees the krauncha pair
  'bk-02': { panelId: 'bk-02-02', focusX: 0.3 }, // Dasharatha in council
  'bk-03': { panelId: 'bk-03-01' }, // the king asks for a son
  'bk-04': { panelId: 'bk-04-03' }, // Vishnu's resolve
  'bk-05': { panelId: 'bk-05-01' }, // the four princes are born
  'bk-06': { panelId: 'bk-06-02' }, // Vishvamitra asks for Rama
  'bk-07': { panelId: 'bk-07-03' }, // the river crossing at dusk
  'bk-08': { panelId: 'bk-08-03', focusX: 0.4 }, // Rama faces Tataka
  'bk-09': { panelId: 'bk-09-01', focusX: 0.4 }, // the celestial weapons
  'bk-10': { panelId: 'bk-10-02', focusX: 0.35 }, // the arrow that guards the yajna
  'bk-11': { panelId: 'bk-11-01' }, // on the road to Mithila
  'bk-12': { panelId: 'bk-12-04' }, // six-faced Kartikeya
  'bk-13': { panelId: 'bk-13-04' }, // Kapila and Sagara's sons
  'bk-14': { panelId: 'bk-14-03', focusX: 0.4 }, // Shiva receives Ganga
  'bk-15': { panelId: 'bk-15-02', focusX: 0.45 }, // the churning
  'bk-16': { panelId: 'bk-16-03' }, // Diti and the Maruts
  'bk-17': { panelId: 'bk-17-04', focusX: 0.4 }, // Ahalya restored
  'bk-18': { panelId: 'bk-18-01', focusX: 0.45 }, // welcome at Mithila
  'bk-19': { panelId: 'bk-19-03', focusX: 0.6 }, // Shabala is taken
  'bk-20': { panelId: 'bk-20-05' }, // Trishanku between worlds
  'bk-21': { panelId: 'bk-21-04', focusX: 0.65 }, // Shunahshepa pleads
  'bk-22': { panelId: 'bk-22-04' }, // Vishvamitra's tapas
  'bk-23': { panelId: 'bk-23-05' }, // Rama breaks Shiva's bow
  'bk-24': { panelId: 'bk-24-01' }, // the invitation reaches Ayodhya
  'bk-25': { panelId: 'bk-25-02' }, // the four couples
  'bk-26': { panelId: 'bk-26-03', focusX: 0.45 }, // Rama and Sita's wedding
  'bk-27': { panelId: 'bk-27-03', focusX: 0.4 }, // Parashurama's challenge
  'bk-28': { panelId: 'bk-28-02', focusX: 0.6 }, // Rama strings Vishnu's bow
  'bk-29': { panelId: 'bk-29-04', focusX: 0.4 }, // home in Ayodhya
};

/** The episode's key scene; falls back to its first panel for an uncurated episode. */
export function episodeCover(episode: ComicEpisode): { panel: ComicPanel; focusX: number } {
  const cover = comicEpisodeCovers[episode.id];
  const panel = (cover && episode.panels.find(item => item.id === cover.panelId)) || episode.panels[0];
  return { panel, focusX: cover?.focusX ?? 0.5 };
}
