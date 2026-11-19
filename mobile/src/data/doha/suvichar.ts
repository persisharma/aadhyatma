import { dohaIds, getDoha, type DohaId } from './index';
import { hasAllowedDohaThemes } from './curation';
import type { SuvicharDeity } from '../suvichar';
import type { SuvicharSource, SuvicharThought } from '../suvicharContent';

export type SuvicharDohaThought = SuvicharThought & { deities: readonly SuvicharDeity[] };
const poets: Record<DohaId, { hi: string; en: string }> = {
  'kabir-bhakti-dohe': { hi: 'कबीर', en: 'Kabir' },
  'rahim-bhakti-dohe': { hi: 'रहीम', en: 'Rahim' },
};
// An empty list is universal. Named devotional references retain their subject;
// family/shrine artwork must never turn a Ram doha into another deity's quote.
const deityScope: Readonly<Record<string, readonly SuvicharDeity[]>> = {
  'kabir-doha-sumiran': [],
  'kabir-doha-santosh': [],
  'kabir-doha-man': [],
  'kabir-doha-daya': [],
  'rahim-doha-ahankar': ['rama', 'ram-lalla', 'ram-darbar', 'krishna', 'radha-krishna', 'vishnu', 'tirupati-balaji', 'khatu-shyam', 'sanwariya-seth', 'jagannath'],
  'rahim-doha-daan': [],
  'rahim-doha-santosh': [],
  'rahim-doha-sharan': ['rama', 'ram-lalla', 'ram-darbar'],
};

// This module belongs to the Suvichar content graph, never the launch registry.
// Project the canonical reader payloads; do not copy or paraphrase the dohas.
const thoughts: SuvicharDohaThought[] = [];
const sources: SuvicharSource[] = [];
for (const id of dohaIds) {
  const poet = poets[id];
  for (const verse of getDoha(id).verses) {
    const deities = deityScope[verse.id];
    // New content needs explicit editorial artwork eligibility before exposure.
    if (!deities || !hasAllowedDohaThemes(verse.themes)) continue;
    const sourceId = `doha:${id}:${verse.id}`;
    thoughts.push({
      id: `DH-${verse.id}`, family: 'doha', categoryHi: `${poet.hi} · भक्तिमय और सुविचार दोहे`,
      hi: verse.lines.join('\n'), en: verse.linesEn.join('\n'), sourceId, deities,
    });
    sources.push({
      id: sourceId, referenceHi: `${poet.hi} · ${verse.labelHi}`, referenceEn: `${poet.en} · ${verse.labelEn}`,
      modeHi: 'मूल दोहा', modeEn: 'Romanized doha',
      url: verse.source.referenceUrls[0] ?? '', contextHi: verse.themeReasonHi,
    });
  }
}
export const suvicharDohaThoughts: readonly SuvicharDohaThought[] = thoughts;
export const suvicharDohaSources: readonly SuvicharSource[] = sources;
// Parshuram keeps only its own reviewed collection; deity-agnostic dohas stay out.
const ownCollectionOnly: readonly SuvicharDeity[] = ['parshuram'];
export function suvicharDohasFor(deity: SuvicharDeity): readonly SuvicharDohaThought[] {
  const general = !ownCollectionOnly.includes(deity);
  return thoughts.filter(thought => thought.deities.includes(deity) || (general && !thought.deities.length));
}
