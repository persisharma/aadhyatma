import type { UpvasInfoEntry } from '../types';

/** Identity helper so entry modules get literal-type checking + a uniform shape. */
export function upvasEntry(entry: UpvasInfoEntry): UpvasInfoEntry {
  return entry;
}
