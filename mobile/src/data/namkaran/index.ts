import type { NameRecord, NamkaranCorpusManifest } from './types';

export const NAMKARAN_CORPUS: NamkaranCorpusManifest = {
  verified: false,
  releaseEligible: false,
  notes: 'Development shard only. The full attested 6+6-per-charana corpus gate remains open.',
};

let recordsPromise: Promise<readonly NameRecord[]> | null = null;

/** Called only inside the already-lazy Panchang stack. Keep the JSON out of
 * Home, global search, and the top-level text registry. */
export async function loadNamkaranNames(): Promise<readonly NameRecord[]> {
  recordsPromise ??= Promise.resolve().then(() => (
    require('./names.01.json') as { names: NameRecord[] }
  ).names);
  return recordsPromise;
}

export async function loadNamesForCharana(charanaIndex: number): Promise<readonly NameRecord[]> {
  const records = await loadNamkaranNames();
  return records.filter((record) => record.charanas.includes(charanaIndex));
}

export async function loadNamesForNakshatra(nakshatraIndex: number): Promise<readonly NameRecord[]> {
  const records = await loadNamkaranNames();
  const start = nakshatraIndex * 4;
  return records.filter((record) => record.charanas.some((value) => value >= start && value < start + 4));
}

export async function loadNamesByIds(ids: readonly string[]): Promise<readonly NameRecord[]> {
  const records = await loadNamkaranNames();
  const wanted = new Set(ids);
  return records.filter((record) => wanted.has(record.id));
}
