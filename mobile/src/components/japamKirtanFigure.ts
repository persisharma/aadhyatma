import type { Deity } from '@/data/texts';

/**
 * Who dances the kirtan in the Kirtan japa style, chosen from the mantra's
 * deity tags: Hanuman for Ram naam, a child bhakt for Krishna/Radha (and the
 * gentle Vishnu/Ganesha lines), a sadhu for everything else (Shiva, Gayatri,
 * Devi, the grahas). Pure and tiny so it stays off the launch graph's cost.
 */
export type KirtanFigure = 'hanuman' | 'child' | 'sadhu';

const HANUMAN: ReadonlySet<string> = new Set(['rama', 'hanuman', 'sita']);
const CHILD: ReadonlySet<string> = new Set(['krishna', 'radha', 'vishnu', 'ganesha']);

export function kirtanFigureFor(deities: readonly Deity[] | readonly string[]): KirtanFigure {
  for (const deity of deities) {
    if (HANUMAN.has(deity)) return 'hanuman';
    if (CHILD.has(deity)) return 'child';
  }
  return 'sadhu';
}

/**
 * Painted, layered figure art (design.md §42 pipeline) has not landed yet, so
 * the rig draws labelled placeholder shapes. Until it does, the Kirtan style is
 * offered only in development builds or a preview build made with
 * `EXPO_PUBLIC_KIRTAN_PREVIEW=1` — never to users with placeholder art.
 */
export const KIRTAN_ART_READY = false;

export function kirtanStyleAvailable(dev: boolean, previewFlag: string | undefined): boolean {
  return KIRTAN_ART_READY || dev || previewFlag === '1';
}

/** One manjira clash = one japa; the same ~880 ms pace as an Infinity loop. */
export const KIRTAN_BEAT_MS = 880;
