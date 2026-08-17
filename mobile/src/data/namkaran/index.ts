import type { NameRecord, NamkaranCharanaCounts, NamkaranCorpusManifest, NamkaranShard } from './types';

export const NAMKARAN_CORPUS: NamkaranCorpusManifest = {
  verified: false,
  releaseEligible: false,
  referenceUrls: [
    'repo://docs/roadmap/conventions/namkaran-namakshar-v1.md',
    'repo://docs/roadmap/prds/17-namkaran.md',
  ],
  notes:
    'Development fixtures for UI and privacy verification only. The references define the draft '
    + 'contract and do not attest the names or meanings. The 12+12-per-charana corpus gate '
    + '(PRD-17 §11.2) remains open.',
};

/**
 * One shard per nakshatra, resolved by a static require map.
 *
 * Metro cannot resolve a computed require path, so the 27 entries are listed
 * literally — which also makes the shard set auditable at a glance. A name whose
 * charanas span two nakshatras is stored in both shards and de-duplicated by id
 * on load, so callers never see it twice.
 *
 * Every require here originates inside the already-lazy Panchang stack. App,
 * Home, TabNavigator, the global text registry, and global search must never
 * import this module; ESLint pins those boundaries (RULEBOOK §18.6).
 */
const SHARD_LOADERS: readonly (() => NamkaranShard)[] = [
  () => require('./names.00-ashwini.json'),
  () => require('./names.01-bharani.json'),
  () => require('./names.02-krittika.json'),
  () => require('./names.03-rohini.json'),
  () => require('./names.04-mrigashira.json'),
  () => require('./names.05-ardra.json'),
  () => require('./names.06-punarvasu.json'),
  () => require('./names.07-pushya.json'),
  () => require('./names.08-ashlesha.json'),
  () => require('./names.09-magha.json'),
  () => require('./names.10-purva-phalguni.json'),
  () => require('./names.11-uttara-phalguni.json'),
  () => require('./names.12-hasta.json'),
  () => require('./names.13-chitra.json'),
  () => require('./names.14-swati.json'),
  () => require('./names.15-vishakha.json'),
  () => require('./names.16-anuradha.json'),
  () => require('./names.17-jyeshtha.json'),
  () => require('./names.18-moola.json'),
  () => require('./names.19-purvashadha.json'),
  () => require('./names.20-uttarashadha.json'),
  () => require('./names.21-shravana.json'),
  () => require('./names.22-dhanishta.json'),
  () => require('./names.23-shatabhisha.json'),
  () => require('./names.24-purva-bhadrapada.json'),
  () => require('./names.25-uttara-bhadrapada.json'),
  () => require('./names.26-revati.json'),
];

export const NAMKARAN_SHARD_COUNT = SHARD_LOADERS.length;

const shardCache = new Map<number, Promise<readonly NameRecord[]>>();

function assertNakshatraIndex(nakshatraIndex: number): void {
  if (!Number.isInteger(nakshatraIndex) || nakshatraIndex < 0 || nakshatraIndex > 26) {
    throw new Error(`Invalid nakshatra index: ${nakshatraIndex}`);
  }
}

/** Loads (and memoises) the one shard holding a nakshatra's four charanas. */
export async function loadNamesForNakshatra(nakshatraIndex: number): Promise<readonly NameRecord[]> {
  assertNakshatraIndex(nakshatraIndex);
  let cached = shardCache.get(nakshatraIndex);
  if (!cached) {
    cached = Promise.resolve().then(() => SHARD_LOADERS[nakshatraIndex]().names);
    shardCache.set(nakshatraIndex, cached);
  }
  return cached;
}

export async function loadNamesForCharana(charanaIndex: number): Promise<readonly NameRecord[]> {
  if (!Number.isInteger(charanaIndex) || charanaIndex < 0 || charanaIndex > 107) {
    throw new Error(`Invalid charana index: ${charanaIndex}`);
  }
  const records = await loadNamesForNakshatra(Math.floor(charanaIndex / 4));
  return records.filter((record) => record.charanas.includes(charanaIndex));
}

/**
 * Per-charana name counts for the rashi detail's nine count lines.
 *
 * A rashi's nine charanas span up to three nakshatras, so counting from shards
 * would pull three files to render nine numbers. Regenerate with
 * `npx tsx scripts/namkaran-build-index.mts` after changing any shard.
 */
export async function loadNamkaranCharanaCounts(): Promise<Readonly<Record<number, number>>> {
  const index = require('./counts.json') as NamkaranCharanaCounts;
  const counts: Record<number, number> = {};
  for (const [charanaIndex, total] of Object.entries(index.charana)) {
    counts[Number(charanaIndex)] = total;
  }
  return counts;
}
