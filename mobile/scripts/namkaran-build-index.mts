/**
 * Regenerates the Namkaran per-charana count index from the 27 nakshatra shards.
 *
 *   npx tsx scripts/namkaran-build-index.mts
 *
 * Why an index exists at all: the rashi detail screen shows a name count for each
 * of a rashi's nine charanas. Those nine charanas span up to three nakshatras, so
 * without an index the screen would pull three full shards (~84 KB at the agreed
 * corpus depth) to render nine numbers. The index is a few hundred bytes.
 *
 * `namkaranCorpus.test.ts` re-derives the same tally from the shards and asserts
 * the committed file matches, so a stale index fails the suite rather than
 * silently under-reporting counts (RULEBOOK §18.4: generated indexes must be
 * reproducible).
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join('src', 'data', 'namkaran');
const INDEX_FILE = join(DIR, 'counts.json');

type NameRecord = { id: string; charanas: number[] };
type Shard = { nakshatraIndex: number; nakshatra: string; names: NameRecord[] };

export function shardFileNames(): string[] {
  return readdirSync(DIR)
    .filter((file) => file.startsWith('names.') && file.endsWith('.json'))
    .sort();
}

/** charana index -> distinct name count, non-zero entries only. */
export function buildCharanaCounts(): Record<string, number> {
  // De-duplicate by id: a name whose charanas span two nakshatras is stored in
  // both shards, and must be counted once per charana, not once per shard.
  const seen = new Map<number, Set<string>>();
  for (const file of shardFileNames()) {
    const shard = JSON.parse(readFileSync(join(DIR, file), 'utf8')) as Shard;
    for (const name of shard.names) {
      for (const charanaIndex of name.charanas) {
        const bucket = seen.get(charanaIndex) ?? new Set<string>();
        bucket.add(name.id);
        seen.set(charanaIndex, bucket);
      }
    }
  }
  return Object.fromEntries(
    [...seen.entries()]
      .sort(([a], [b]) => a - b)
      .map(([charanaIndex, ids]) => [String(charanaIndex), ids.size])
  );
}

/**
 * Every content JSON must declare provenance with at least two referenceUrls
 * (`contentCorrectness.test.ts` §14). For a generated file that means pointing at
 * what produced it and the contract it answers to, not at editorial sources —
 * this file attests nothing about the names, it only counts them.
 */
const SOURCE = {
  verified: false,
  referenceUrls: [
    'repo://mobile/scripts/namkaran-build-index.mts',
    'repo://RULEBOOK.md#18-namkaran-convention-corpus-and-newborn-privacy-contract-prd-17',
  ],
  notes:
    'Generated from the 27 nakshatra shards — do not hand-edit. Regenerate with '
    + '`npx tsx scripts/namkaran-build-index.mts`.',
};

export function serializeIndex(charana: Record<string, number>): string {
  const source = JSON.stringify(SOURCE, null, 2).split('\n').join('\n  ');
  const entries = Object.entries(charana).map(([key, value]) => `    ${JSON.stringify(key)}: ${value}`);
  return `{\n  "source": ${source},\n  "version": 1,\n  "charana": {\n${entries.join(',\n')}\n  }\n}\n`;
}

const isEntrypoint = process.argv[1]?.endsWith('namkaran-build-index.mts');
if (isEntrypoint) {
  const charana = buildCharanaCounts();
  writeFileSync(INDEX_FILE, serializeIndex(charana));
  const total = Object.values(charana).reduce((sum, value) => sum + value, 0);
  console.log(`wrote ${INDEX_FILE}: ${Object.keys(charana).length} charanas, ${total} name placements`);
}
