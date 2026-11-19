import { OBSERVANCE_RULES } from './festivals';
import { observanceIllustrations, type ObservancePortrait } from './observancePortraits';
import type { OccasionTiming } from './occasionTimings';
import heroManifest from '@/data/festivalHeroManifest.json';
import { remoteAssetRequest, assetBaseUrl } from '@/data/assetManifest';

export type FestivalHeroSubject = keyof typeof heroManifest.assets;
/** Scene identities precede deity portraits. Never use a diya for Govardhan. */
export function occasionHeroSubject(item: Pick<OccasionTiming, 'ruleId' | 'id'>): FestivalHeroSubject | null {
  if (item.ruleId === 'holi') return item.id.endsWith('-holika') ? 'holika' : null;
  if (item.id.endsWith('-vijaya')) return 'shastra';
  if (['navratri-start', 'chaitra-navratri-start', 'magha-gupt-navratri', 'ashadha-gupt-navratri'].includes(item.ruleId)) return 'navratri';
  if (['chhath-puja', 'chaiti-chhath'].includes(item.ruleId)) return 'chhath';
  const identities: Record<string, FestivalHeroSubject> = {
    'govardhan-puja': 'govardhan', dhanteras: 'dhanteras',
    'raksha-bandhan': 'raksha-bandhan', 'bhai-dooj': 'bhai-dooj', 'tulasi-vivah': 'tulsi-vivah',
    'makar-sankranti': 'sankranti',
  };
  return identities[item.ruleId] ?? null;
}
export function occasionHeroRequest(subject: FestivalHeroSubject) {
  // A preparation manifest is not proof of publication. Enable only after the
  // publisher has downloaded and hash-checked every public object.
  return heroManifest.publication === 'verified' ? remoteAssetRequest(heroManifest, subject, assetBaseUrl()) : null;
}
export function occasionIdentityPaintings(ruleId: string): readonly ObservancePortrait[] {
  const rule = OBSERVANCE_RULES.find(r => r.id === ruleId);
  if (!rule) return [];
  return observanceIllustrations(rule);
}
