/**
 * मेरा घर record shapes + pure parse/serialize (PRD-24 Phase 2 §C2).
 *
 * One private roster per device under `@vedansh:vastu-homes:v1` — a NON-cache
 * key (user data, never swept by derivedCacheReset), capped at 12 homes (a
 * shortlist, not a database). Validators are injected so this half stays pure:
 * a retired room id is DROPPED, never a crash; an unknown template falls back
 * to `custom` (the placements survive); an unknown payload version is treated
 * as absent and the payload left in place for a newer build.
 */
import { DISHA_ORDER, type DishaDirection } from '@/panchang/eventMuhurat';
import type { VastuZone } from '@/data/vastu/types';
import type { HomeKind } from '@/data/vastu/types';

export const VASTU_HOMES_STORAGE_KEY = '@vedansh:vastu-homes:v1';
export const HOME_ROSTER_CAP = 12;

export type HomePlacementVia = 'compass' | 'manual' | 'plan' | 'plan-ai-confirmed';

export type HomePlacement = {
  roomId: string;
  /** 1-based; bedroom 2 is `{ roomId: 'kids-bed', ordinal: 2 }`. */
  ordinal: number;
  /** Null until captured — an unmeasured chip. */
  zone: VastuZone | null;
  /** How the zone was captured — the provenance the assessment shows. */
  via: HomePlacementVia | null;
  recordedAt: string | null;
  /** Grid-placement drop point inside the cell (fractions 0–1) — the user's
   * sketch, re-rendered on the mandala; NEVER read by the engine. */
  at?: { fx: number; fy: number };
};

export type HomeRole = 'living' | 'considering';

export type HomeRecord = {
  id: string;
  version: 1;
  /** "हमारा घर", "Prestige 3BHK, 7th floor" — the user's own words. */
  label: string;
  kind: HomeKind;
  template: string;
  role: HomeRole;
  facing: DishaDirection | null;
  rooms: readonly HomePlacement[];
  createdAt: string;
  updatedAt: string;
};

export type HomeRoster = {
  version: 1;
  homes: readonly HomeRecord[];
  livingId: string | null;
};

export const EMPTY_HOME_ROSTER: HomeRoster = { version: 1, homes: [], livingId: null };

export type HomeRecordValidators = {
  isRoomKnown: (roomId: string) => boolean;
  isTemplateKnown: (templateId: string) => boolean;
};

const isDik = (value: unknown): value is DishaDirection =>
  typeof value === 'string' && (DISHA_ORDER as readonly string[]).includes(value);

const isZone = (value: unknown): value is VastuZone => value === 'center' || isDik(value);

const isVia = (value: unknown): value is HomePlacementVia =>
  value === 'compass' || value === 'manual' || value === 'plan' || value === 'plan-ai-confirmed';

const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

function parsePlacement(raw: unknown, validators: HomeRecordValidators): HomePlacement | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const p = raw as Record<string, unknown>;
  const roomId = asString(p.roomId);
  // A retired registry id is dropped, never a crash (PRD-24 Phase 2 §C2).
  if (!roomId || !validators.isRoomKnown(roomId)) return null;
  const ordinal =
    typeof p.ordinal === 'number' && Number.isInteger(p.ordinal) && p.ordinal >= 1 ? p.ordinal : 1;
  const zone = isZone(p.zone) ? p.zone : null;
  const via = zone !== null && isVia(p.via) ? p.via : null;
  const atRaw = p.at as Record<string, unknown> | undefined;
  const at =
    atRaw && typeof atRaw.fx === 'number' && typeof atRaw.fy === 'number' && Number.isFinite(atRaw.fx) && Number.isFinite(atRaw.fy)
      ? { fx: clamp01(atRaw.fx), fy: clamp01(atRaw.fy) }
      : undefined;
  return {
    roomId,
    ordinal,
    zone,
    via: zone === null ? null : via ?? 'manual',
    recordedAt: zone === null ? null : asString(p.recordedAt) || null,
    ...(at ? { at } : {}),
  };
}

function parseHome(raw: unknown, validators: HomeRecordValidators): HomeRecord | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const h = raw as Record<string, unknown>;
  const id = asString(h.id);
  if (!id) return null;
  const template = asString(h.template);
  const kind: HomeKind = h.kind === 'villa' || h.kind === 'plot' ? h.kind : 'flat';
  const rooms = Array.isArray(h.rooms)
    ? h.rooms.map((r) => parsePlacement(r, validators)).filter((p): p is HomePlacement => p !== null)
    : [];
  return {
    id,
    version: 1,
    label: asString(h.label),
    kind,
    // An unknown template keeps the home alive as `custom` — placements survive.
    template: validators.isTemplateKnown(template) ? template : 'custom',
    role: h.role === 'living' ? 'living' : 'considering',
    facing: isDik(h.facing) ? h.facing : null,
    rooms,
    createdAt: asString(h.createdAt),
    updatedAt: asString(h.updatedAt),
  };
}

/**
 * Parse the stored payload. `null`, malformed JSON, or an unknown version all
 * yield the empty roster — an unknown version leaves the payload IN PLACE
 * (this build simply does not read it; a newer build still can).
 */
export function parseHomeRoster(raw: string | null, validators: HomeRecordValidators): HomeRoster {
  if (!raw) return EMPTY_HOME_ROSTER;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return EMPTY_HOME_ROSTER;
  }
  if (typeof parsed !== 'object' || parsed === null) return EMPTY_HOME_ROSTER;
  const payload = parsed as Record<string, unknown>;
  if (payload.version !== 1) return EMPTY_HOME_ROSTER;
  const homes = (Array.isArray(payload.homes) ? payload.homes : [])
    .map((h) => parseHome(h, validators))
    .filter((h): h is HomeRecord => h !== null)
    .slice(0, HOME_ROSTER_CAP);
  const livingId = asString(payload.livingId) || null;
  return {
    version: 1,
    homes,
    livingId: livingId && homes.some((h) => h.id === livingId) ? livingId : null,
  };
}

export function serializeHomeRoster(roster: HomeRoster): string {
  return JSON.stringify(roster);
}

/** Upsert one home into the roster, newest first, enforcing the cap and the
 * single-living invariant (`role: 'living'` claims `livingId`). */
export function upsertHome(roster: HomeRoster, home: HomeRecord): HomeRoster {
  const rest = roster.homes.filter((h) => h.id !== home.id);
  const homes = [home, ...rest].slice(0, HOME_ROSTER_CAP);
  const livingId =
    home.role === 'living'
      ? home.id
      : roster.livingId === home.id
        ? null
        : roster.livingId;
  return { version: 1, homes, livingId: livingId && homes.some((h) => h.id === livingId) ? livingId : null };
}

export function removeHome(roster: HomeRoster, homeId: string): HomeRoster {
  const homes = roster.homes.filter((h) => h.id !== homeId);
  return {
    version: 1,
    homes,
    livingId: roster.livingId === homeId ? null : roster.livingId,
  };
}
