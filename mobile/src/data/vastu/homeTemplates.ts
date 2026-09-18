/**
 * Home-type templates (PRD-24 Phase 2 §E1) — pure seed lists, never rules.
 * A template names registry rows with a count; resolution drops draft/retired
 * rows silently (the verified-only accessor discipline extends to templates),
 * so the visible chip list grows by data-only OTA flips as §B2 rows verify.
 * Any chip can be removed or added on the setup screen; `custom` starts empty.
 */
import type { HomeKind, VastuRoomEntry } from './types';
import { getVastuRoomEntry } from './roomGuidance';

export type HomeTemplateSeed = { roomId: string; count: number };

export type HomeTemplate = {
  id: string;
  kind: HomeKind;
  labelHi: string;
  labelEn: string;
  seeds: readonly HomeTemplateSeed[];
};

const FLAT_BASE: readonly HomeTemplateSeed[] = [
  { roomId: 'main-door', count: 1 },
  { roomId: 'living-room', count: 1 },
  { roomId: 'kitchen', count: 1 },
  { roomId: 'dining', count: 1 },
  { roomId: 'puja-room', count: 1 },
  { roomId: 'tulsi', count: 1 },
];

const flat = (n: number): readonly HomeTemplateSeed[] => [
  ...FLAT_BASE,
  { roomId: 'master-bed', count: 1 },
  ...(n > 1 ? [{ roomId: 'kids-bed', count: n - 1 }] : []),
  { roomId: 'toilet', count: Math.ceil(n / 2) + 1 },
  { roomId: 'balcony', count: 1 },
  ...(n >= 3 ? [{ roomId: 'store-room', count: 1 }] : []),
  ...(n >= 4 ? [{ roomId: 'study', count: 1 }] : []),
];

export const HOME_TEMPLATES: readonly HomeTemplate[] = [
  { id: 'flat-1bhk', kind: 'flat', labelHi: '1 BHK', labelEn: '1 BHK', seeds: flat(1) },
  { id: 'flat-2bhk', kind: 'flat', labelHi: '2 BHK', labelEn: '2 BHK', seeds: flat(2) },
  { id: 'flat-3bhk', kind: 'flat', labelHi: '3 BHK', labelEn: '3 BHK', seeds: flat(3) },
  { id: 'flat-4bhk', kind: 'flat', labelHi: '4 BHK', labelEn: '4 BHK', seeds: flat(4) },
  { id: 'flat-5bhk', kind: 'flat', labelHi: '5 BHK', labelEn: '5 BHK', seeds: flat(5) },
  // Villa gains its plot/utility rows (§B2 `plot` bucket) when they verify —
  // until then it seeds the 3BHK household set.
  { id: 'villa', kind: 'villa', labelHi: 'विला', labelEn: 'Villa', seeds: flat(3) },
  { id: 'custom', kind: 'flat', labelHi: 'अपना', labelEn: 'Custom', seeds: [] },
];

export function getHomeTemplate(id: string): HomeTemplate | null {
  return HOME_TEMPLATES.find((t) => t.id === id) ?? null;
}

export function isKnownTemplateId(id: string): boolean {
  return HOME_TEMPLATES.some((t) => t.id === id);
}

/**
 * Resolve a template's seeds into the VERIFIED registry rows it may show,
 * expanded to one entry per ordinal (bedroom 2 = `{ entry, ordinal: 2 }`).
 * Draft or retired seeds are silently absent — the honest content-gated shape.
 */
export function resolveTemplateSeeds(
  templateId: string
): readonly { entry: VastuRoomEntry; ordinal: number }[] {
  const template = getHomeTemplate(templateId);
  if (!template) return [];
  const out: { entry: VastuRoomEntry; ordinal: number }[] = [];
  for (const seed of template.seeds) {
    const entry = getVastuRoomEntry(seed.roomId);
    if (!entry || entry.isCenter) continue;
    for (let ordinal = 1; ordinal <= seed.count; ordinal += 1) out.push({ entry, ordinal });
  }
  return out;
}
