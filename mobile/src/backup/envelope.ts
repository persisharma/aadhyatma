/**
 * The backup file format (PRD-06 Track C) — pure, RN-free, so the tsx suite
 * can pin it and the screen can trust it.
 *
 *   { format: 'vedansh-backup', version: 1, exportedAt, appVersion,
 *     entries: { '<key>': { json: <parsed value> } | { raw: '<string>' } } }
 *
 * Values are stored PARSED when the stored string is JSON (every store in the
 * app writes JSON today) so the file is legible to a human opening it in a
 * mail client years later — PRD-06 §Track C.7 "plaintext JSON so a savvy user
 * can inspect it". A value that is not JSON travels as `raw` and round-trips
 * byte-for-byte. Restore writes `JSON.stringify(json)` or `raw` back, and only
 * for keys the registry owns.
 */
import { BACKUP_GROUP_ORDER, BACKUP_KEYS, isBackupKey, type BackupGroupId } from './registry';

export const BACKUP_FORMAT = 'vedansh-backup' as const;
export const BACKUP_VERSION = 1 as const;

export type BackupValue = { json: unknown } | { raw: string };

export type BackupEnvelope = {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  /** ISO 8601. */
  exportedAt: string;
  appVersion: string;
  entries: Record<string, BackupValue>;
};

/** `vedansh-backup-2026-09-25.json` — legible in a Files app or an inbox years later. */
export function backupFilename(now: Date): string {
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, '0');
  const d = `${now.getDate()}`.padStart(2, '0');
  return `vedansh-backup-${y}-${m}-${d}.json`;
}

export function encodeStoredValue(raw: string): BackupValue {
  try {
    return { json: JSON.parse(raw) };
  } catch {
    return { raw };
  }
}

export function decodeStoredValue(value: BackupValue): string {
  return 'raw' in value ? value.raw : JSON.stringify(value.json);
}

/**
 * Build the envelope from `(key, storedString | null)` pairs — the shape
 * `AsyncStorage.multiGet` returns. Keys not in the registry are dropped even
 * if a caller hands them in; null (unset) keys are omitted, never written as
 * empty.
 */
export function buildBackupEnvelope(
  pairs: readonly (readonly [string, string | null])[],
  meta: { now: Date; appVersion: string }
): BackupEnvelope {
  const entries: Record<string, BackupValue> = {};
  for (const entry of BACKUP_KEYS) {
    const pair = pairs.find(([key]) => key === entry.key);
    const raw = pair?.[1];
    if (raw === null || raw === undefined) continue;
    entries[entry.key] = encodeStoredValue(raw);
  }
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: meta.now.toISOString(),
    appVersion: meta.appVersion,
    entries,
  };
}

export type ParseFailure =
  /** Not JSON at all, or JSON without the envelope shape. */
  | 'corrupt'
  /** Valid JSON but not a Vedansh backup (any other file). */
  | 'not-a-backup'
  /** A कुल परम्परा hand-on file — a different, narrower format. */
  | 'kul-parampara-file'
  /** Written by a newer app than the one reading it. */
  | 'newer-version'
  /** A well-formed backup that carries none of the registry's keys. */
  | 'empty';

export type ParseResult =
  | { ok: true; envelope: BackupEnvelope }
  | { ok: false; reason: ParseFailure };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isBackupValue(value: unknown): value is BackupValue {
  if (!isRecord(value)) return false;
  if ('raw' in value) return typeof value.raw === 'string';
  return 'json' in value;
}

/**
 * Validate a file's text into an envelope. Unknown keys are dropped here, not
 * later, so `envelope.entries` is always safe to write verbatim.
 */
export function parseBackupText(text: string): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'corrupt' };
  }
  if (!isRecord(parsed)) return { ok: false, reason: 'corrupt' };
  if (parsed.format === 'vedansh-kul-parampara') return { ok: false, reason: 'kul-parampara-file' };
  if (parsed.format !== BACKUP_FORMAT) return { ok: false, reason: 'not-a-backup' };
  if (typeof parsed.version !== 'number') return { ok: false, reason: 'corrupt' };
  if (parsed.version > BACKUP_VERSION) return { ok: false, reason: 'newer-version' };
  if (!isRecord(parsed.entries)) return { ok: false, reason: 'corrupt' };

  const entries: Record<string, BackupValue> = {};
  for (const [key, value] of Object.entries(parsed.entries)) {
    if (!isBackupKey(key)) continue;
    if (!isBackupValue(value)) continue;
    entries[key] = value;
  }
  if (Object.keys(entries).length === 0) return { ok: false, reason: 'empty' };

  return {
    ok: true,
    envelope: {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : '',
      appVersion: typeof parsed.appVersion === 'string' ? parsed.appVersion : 'unknown',
      entries,
    },
  };
}

/**
 * The `[key, string]` pairs a restore writes — the shape `AsyncStorage.multiSet`
 * takes. Registry-only by construction (see `parseBackupText`).
 *
 * Restore REPLACES each store the file carries and leaves every store the file
 * lacks untouched. A field-level merge (PRD-06 §Track C.5) is deferred: the
 * two real journeys — a fresh install and a new phone — have nothing to merge
 * with, and a wrong merge of a ledger or a family record is worse than a
 * confirmed replace. The screen states this before the write.
 */
export function planRestoreWrites(envelope: BackupEnvelope): [string, string][] {
  return Object.entries(envelope.entries)
    .filter(([key]) => isBackupKey(key))
    .map(([key, value]) => [key, decodeStoredValue(value)]);
}

/**
 * How many "things" a stored value holds, for the summary card. A heuristic,
 * deliberately shape-agnostic so a new store needs no registration here:
 * arrays count their length; an object with one well-known collection field
 * counts that; any other object counts its keys (a per-source progress map);
 * a scalar counts as one saved setting.
 */
const COLLECTION_FIELDS = ['entries', 'people', 'items', 'homes', 'alarms', 'routines', 'bookmarks', 'records', 'follows', 'knownIds'];

export function countItems(value: BackupValue): number {
  if ('raw' in value) return 1;
  const json = value.json;
  if (Array.isArray(json)) return json.length;
  if (isRecord(json)) {
    for (const field of COLLECTION_FIELDS) {
      const inner = json[field];
      if (Array.isArray(inner)) return inner.length;
      if (isRecord(inner)) return Object.keys(inner).length;
    }
    const keys = Object.keys(json).filter((k) => k !== 'version' && k !== 'v');
    return keys.length === 0 ? 1 : keys.length;
  }
  return 1;
}

export type BackupGroupSummary = {
  group: BackupGroupId;
  /** Registry stores present in the envelope. */
  stores: number;
  /** Sum of `countItems` over those stores. */
  items: number;
};

/** One row per group, in display order; groups with nothing saved are still listed (count 0). */
export function summarizeEnvelope(envelope: BackupEnvelope): BackupGroupSummary[] {
  return BACKUP_GROUP_ORDER.map((group) => {
    let stores = 0;
    let items = 0;
    for (const entry of BACKUP_KEYS) {
      if (entry.group !== group) continue;
      const value = envelope.entries[entry.key];
      if (!value) continue;
      stores += 1;
      items += countItems(value);
    }
    return { group, stores, items };
  });
}
