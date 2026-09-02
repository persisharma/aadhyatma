// कुल परम्परा (PRD-29 Part B) — the pure model for the one private family
// record: kuldevta/kuldevi, family temple, gotra, the family's kept observance,
// and free-text notes.
//
// STANCE, STRUCTURAL (PRD-29 §6): every field is CHOSEN, never inferred. There
// is deliberately no gotra→kuldevta mapping, no caste/community classification,
// and no aggregate anywhere in this module — the absence is the guard. Ids are
// validated against their shipped registries on parse; an id a later release
// retired degrades to nothing (the free-text half survives), never a crash.
//
// RN-free and React-free (tested via `tsx --test`). AsyncStorage lives in
// `kulParamparaStore.ts`; the export envelope builder is here because it is
// pure over already-loaded state.

import { deities, getDeityMeta } from '@/data/deities';
import { getTempleById } from '@/data/theerth/temples';
import type { Deity } from '@/data/texts';
import { tithiRuleLabel, type SmaranEntry } from './pitruSmaran';
import { janmaTithiRuleFromBirthDate } from './janmaTithi';
import { getCityById } from './locations';
import type { PersonProfile } from './birthProfiles';

export const KUL_PARAMPARA_STORAGE_KEY = '@vedansh:kul-parampara:v1';
const PAYLOAD_VERSION = 1;

export type KuldevKind = 'kuldevta' | 'kuldevi';

export type KulRecord = {
  /** From the shipped deity registry, or the family's own name for them. */
  kuldev?: { kind: KuldevKind; deityId?: Deity; customName?: string };
  /** Linked into the Theerth registry where it exists; free text is first-class. */
  temple?: { templeId?: string; customName?: string };
  /** Free text — never validated against any list, never used to infer anything. */
  gotra?: string;
  /** A real vrat rule id so the observance dates itself, or the family's words. */
  kulVrat?: { ruleId?: string; customText?: string };
  /** What only a family knows. */
  notes?: string;
};

export const EMPTY_KUL_RECORD: KulRecord = {};

const DEITY_IDS = new Set<string>(deities.map((d) => d.id));

function cleanText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

/**
 * Normalize a candidate record: trim free text, drop ids not in their shipped
 * registry (`isRuleKnown` injected so this module stays out of the festival
 * catalog's import graph), drop empty sub-records.
 */
export function normalizeKulRecord(
  candidate: KulRecord,
  isRuleKnown: (ruleId: string) => boolean
): KulRecord {
  const record: KulRecord = {};

  if (candidate.kuldev && typeof candidate.kuldev === 'object') {
    const kind: KuldevKind = candidate.kuldev.kind === 'kuldevi' ? 'kuldevi' : 'kuldevta';
    const deityId =
      typeof candidate.kuldev.deityId === 'string' && DEITY_IDS.has(candidate.kuldev.deityId)
        ? candidate.kuldev.deityId
        : undefined;
    const customName = cleanText(candidate.kuldev.customName, 80);
    if (deityId) record.kuldev = { kind, deityId };
    else if (customName) record.kuldev = { kind, customName };
  }

  if (candidate.temple && typeof candidate.temple === 'object') {
    const templeId =
      typeof candidate.temple.templeId === 'string' && getTempleById(candidate.temple.templeId)
        ? candidate.temple.templeId
        : undefined;
    const customName = cleanText(candidate.temple.customName, 120);
    if (templeId) record.temple = { templeId };
    else if (customName) record.temple = { customName };
  }

  const gotra = cleanText(candidate.gotra, 60);
  if (gotra) record.gotra = gotra;

  if (candidate.kulVrat && typeof candidate.kulVrat === 'object') {
    const ruleId =
      typeof candidate.kulVrat.ruleId === 'string' && isRuleKnown(candidate.kulVrat.ruleId)
        ? candidate.kulVrat.ruleId
        : undefined;
    const customText = cleanText(candidate.kulVrat.customText, 120);
    if (ruleId) record.kulVrat = { ruleId };
    else if (customText) record.kulVrat = { customText };
  }

  const notes = cleanText(candidate.notes, 2000);
  if (notes) record.notes = notes;

  return record;
}

export function isEmptyKulRecord(record: KulRecord): boolean {
  return !record.kuldev && !record.temple && !record.gotra && !record.kulVrat && !record.notes;
}

export function parseKulRecord(
  raw: string | null,
  isRuleKnown: (ruleId: string) => boolean
): KulRecord {
  if (!raw) return EMPTY_KUL_RECORD;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return EMPTY_KUL_RECORD;
    const payload = parsed as { version?: unknown; record?: unknown };
    if (payload.version !== PAYLOAD_VERSION || !payload.record || typeof payload.record !== 'object') {
      return EMPTY_KUL_RECORD;
    }
    return normalizeKulRecord(payload.record as KulRecord, isRuleKnown);
  } catch {
    return EMPTY_KUL_RECORD;
  }
}

export function serializeKulRecord(record: KulRecord): string {
  return JSON.stringify({ version: PAYLOAD_VERSION, record });
}

/** Display name for the saved kuldev, in the record's own register. */
export function kuldevDisplayName(kuldev: NonNullable<KulRecord['kuldev']>, lang: 'hi' | 'en'): string {
  if (kuldev.deityId) {
    const meta = getDeityMeta(kuldev.deityId);
    return lang === 'hi' ? meta.nameHi : meta.nameEn;
  }
  return kuldev.customName ?? '';
}

// ---------------------------------------------------------------------------
// Export — आगे सौंपें (PRD-29 §3.7)
// ---------------------------------------------------------------------------

/**
 * The versioned, human-legible export envelope. Denormalized display strings
 * ride beside every id so the file is readable to a person and importable by
 * PRD-06's future one importer alike. Built PURELY over already-loaded state;
 * nothing here reads storage or solves dates.
 */
export type KulParamparaExport = {
  format: 'vedansh-kul-parampara';
  version: 1;
  exportedAt: string;
  appVersion: string;
  kul: {
    kuldev?: { kind: KuldevKind; deityId?: Deity; nameHi?: string; nameEn?: string };
    temple?: { templeId?: string; nameHi?: string; nameEn?: string; cityEn?: string };
    gotra?: string;
    kulVrat?: { ruleId?: string; nameHi?: string; nameEn?: string; customText?: string };
    notes?: string;
  };
  people: {
    name?: string;
    birthDate: string;
    birthTime: string;
    birthCityEn?: string;
    janmaTithiHi?: string;
    janmaTithiEn?: string;
  }[];
  pitru: {
    relationEn: string;
    name?: string;
    tithiHi: string;
    tithiEn: string;
  }[];
};

export function buildKulParamparaExport(input: {
  record: KulRecord;
  people: readonly PersonProfile[];
  smaranEntries: readonly SmaranEntry[];
  appVersion: string;
  now: Date;
  /** Injected so this module stays out of the festival catalog's import graph. */
  ruleNames: (ruleId: string) => { nameHi: string; nameEn: string } | null;
  relationLabelEn: (entry: SmaranEntry) => string;
}): KulParamparaExport {
  const { record, people, smaranEntries, appVersion, now, ruleNames, relationLabelEn } = input;

  const kul: KulParamparaExport['kul'] = {};
  if (record.kuldev) {
    kul.kuldev = {
      kind: record.kuldev.kind,
      ...(record.kuldev.deityId
        ? {
            deityId: record.kuldev.deityId,
            nameHi: kuldevDisplayName(record.kuldev, 'hi'),
            nameEn: kuldevDisplayName(record.kuldev, 'en'),
          }
        : { nameHi: record.kuldev.customName, nameEn: record.kuldev.customName }),
    };
  }
  if (record.temple) {
    const temple = record.temple.templeId ? getTempleById(record.temple.templeId) : undefined;
    kul.temple = temple
      ? { templeId: temple.id, nameHi: temple.nameHi, nameEn: temple.nameEn, cityEn: temple.cityEn }
      : { nameHi: record.temple.customName, nameEn: record.temple.customName };
  }
  if (record.gotra) kul.gotra = record.gotra;
  if (record.kulVrat) {
    const names = record.kulVrat.ruleId ? ruleNames(record.kulVrat.ruleId) : null;
    kul.kulVrat = names
      ? { ruleId: record.kulVrat.ruleId, nameHi: names.nameHi, nameEn: names.nameEn }
      : { customText: record.kulVrat.customText };
  }
  if (record.notes) kul.notes = record.notes;

  return {
    format: 'vedansh-kul-parampara',
    version: 1,
    exportedAt: now.toISOString(),
    appVersion,
    kul,
    people: people.map((person) => {
      const rule = janmaTithiRuleFromBirthDate(person.date);
      const city = getCityById(person.cityId);
      return {
        ...(person.name ? { name: person.name } : {}),
        birthDate: person.date,
        birthTime: person.time,
        ...(city ? { birthCityEn: city.nameEn } : {}),
        ...(rule
          ? { janmaTithiHi: tithiRuleLabel(rule, 'hi'), janmaTithiEn: tithiRuleLabel(rule, 'en') }
          : {}),
      };
    }),
    pitru: smaranEntries.map((entry) => ({
      relationEn: relationLabelEn(entry),
      ...(entry.name ? { name: entry.name } : {}),
      tithiHi: tithiRuleLabel(entry.tithiRule, 'hi'),
      tithiEn: tithiRuleLabel(entry.tithiRule, 'en'),
    })),
  };
}
