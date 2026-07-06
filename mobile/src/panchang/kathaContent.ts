import type { KathaContentEntry } from './types';
import { KATHA_CONTENT } from './kathaContent/index';

export { KATHA_CONTENT };

export const KATHA_CONTENT_BY_ID: ReadonlyMap<string, KathaContentEntry> = new Map(
  KATHA_CONTENT.map((item) => [item.id, item] as const)
);

export function getKathaContent(id: string): KathaContentEntry | null {
  return KATHA_CONTENT_BY_ID.get(id) ?? null;
}

(function assertKathaContentInvariants() {
  const seen = new Set<string>();
  for (const item of KATHA_CONTENT) {
    if (seen.has(item.id)) {
      throw new Error(`kathaContent: duplicate id '${item.id}'`);
    }
    seen.add(item.id);
    if (!item.titleHi.trim() || !item.titleEn.trim()) {
      throw new Error(`kathaContent: ${item.id} has empty title`);
    }
    if (item.contentStatus !== 'original-content-ready') {
      throw new Error(`kathaContent: ${item.id} must be original-content-ready`);
    }
    if (item.languageAvailability !== 'bilingual') {
      throw new Error(`kathaContent: ${item.id} must be bilingual`);
    }
    if (!item.sections.length) {
      throw new Error(`kathaContent: ${item.id} has no sections`);
    }
    for (const part of item.sections) {
      if (!part.id.trim() || !part.titleHi.trim() || !part.titleEn.trim()) {
        throw new Error(`kathaContent: ${item.id}/${part.id} has empty section metadata`);
      }
      if (!part.bodyHi.length || !part.bodyEn.length) {
        throw new Error(`kathaContent: ${item.id}/${part.id} has empty body`);
      }
      if (!part.bodyHi.every((line) => line.trim()) || !part.bodyEn.every((line) => line.trim())) {
        throw new Error(`kathaContent: ${item.id}/${part.id} has blank body paragraph`);
      }
    }
  }
})();
