/**
 * Template invariants (PRD-24 Phase 2 §E1): seeds are lists not rules, every
 * seed id exists in the registry (any status), resolution is verified-only
 * (draft rows silently absent), counts are sane, custom starts empty.
 */
import {
  HOME_TEMPLATES,
  getHomeTemplate,
  isKnownTemplateId,
  resolveTemplateSeeds,
} from '../homeTemplates';
import { VASTU_ROOM_ENTRIES, getVastuRoomEntries } from '../roomGuidance';

const ALL_IDS = new Set(VASTU_ROOM_ENTRIES.map((e) => e.id));
const VERIFIED_IDS = new Set(getVastuRoomEntries().map((e) => e.id));

describe('template shape', () => {
  test('template ids are unique and known', () => {
    const ids = HOME_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(isKnownTemplateId(id)).toBe(true);
    expect(isKnownTemplateId('flat-9bhk')).toBe(false);
  });

  test('every seed resolves to a registry row (any status) with count ≥ 1', () => {
    for (const template of HOME_TEMPLATES) {
      for (const seed of template.seeds) {
        expect(ALL_IDS.has(seed.roomId)).toBe(true);
        expect(seed.count).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test('custom starts empty; every flat template seeds the household base', () => {
    expect(getHomeTemplate('custom')!.seeds).toHaveLength(0);
    for (const n of [1, 2, 3, 4, 5]) {
      const seeds = getHomeTemplate(`flat-${n}bhk`)!.seeds;
      for (const id of ['main-door', 'kitchen', 'puja-room', 'toilet']) {
        expect(seeds.some((s) => s.roomId === id)).toBe(true);
      }
    }
  });
});

describe('verified-only resolution (the content gate)', () => {
  test('resolution never yields a draft or centre row', () => {
    for (const template of HOME_TEMPLATES) {
      for (const { entry } of resolveTemplateSeeds(template.id)) {
        expect(VERIFIED_IDS.has(entry.id)).toBe(true);
        expect(entry.isCenter).not.toBe(true);
      }
    }
  });

  test('draft seeds are silently absent today and appear on flip without a code change', () => {
    const resolved = resolveTemplateSeeds('flat-3bhk').map((r) => `${r.entry.id}-${r.ordinal}`);
    // master-bed / kids-bed / living-room / dining / balcony / store-room are §B2 drafts.
    expect(resolved).toEqual(
      expect.arrayContaining(['main-door-1', 'kitchen-1', 'puja-room-1', 'tulsi-1', 'toilet-1', 'toilet-2', 'toilet-3'])
    );
    expect(resolved.some((id) => id.startsWith('master-bed'))).toBe(false);
  });

  test('ordinals expand counts (3bhk seeds toilet ×3 → ordinals 1..3)', () => {
    const toilets = resolveTemplateSeeds('flat-3bhk').filter((r) => r.entry.id === 'toilet');
    expect(toilets.map((t) => t.ordinal)).toEqual([1, 2, 3]);
  });

  test('unknown template resolves to nothing', () => {
    expect(resolveTemplateSeeds('flat-9bhk')).toEqual([]);
  });
});
