/**
 * दान-पुण्य खाता — pure ledger core (no React). PRD-26 stance guards encoded
 * where data lives:
 *  - A gupt entry stores ONLY {id, isoDate, tithi, gupt, createdAtMs} — note,
 *    amount and occasion are stripped before persistence, not merely hidden.
 *  - There is no totalling helper here and none may be added: the ledger is a
 *    smaran register, never a score (PRD-26 §2.2).
 *  - The CSV export is the single aggregation surface, and it leaves the app
 *    only through the OS share sheet (PRD-06 posture).
 */
import type { PanchangData } from '@/panchang/types';
import type { DaanCategory } from './types';

export const DAAN_LEDGER_STORAGE_KEY = '@vedansh/daan-ledger:v1';
export const DAAN_LEDGER_PAYLOAD_VERSION = 1;

export const DAAN_CATEGORIES: readonly DaanCategory[] = [
  'anna', 'vastra', 'vidya', 'gau-seva', 'deep', 'dravya', 'rakt', 'shram', 'anya',
];

export const DAAN_CATEGORY_LABELS: Readonly<Record<DaanCategory, { hi: string; en: string }>> = {
  anna: { hi: 'अन्न', en: 'Anna' },
  vastra: { hi: 'वस्त्र', en: 'Vastra' },
  vidya: { hi: 'विद्या', en: 'Vidya' },
  'gau-seva': { hi: 'गौ-सेवा', en: 'Gau-seva' },
  deep: { hi: 'दीप', en: 'Deep' },
  dravya: { hi: 'द्रव्य', en: 'Dravya' },
  rakt: { hi: 'रक्त-दान', en: 'Rakt-daan' },
  shram: { hi: 'श्रम / सेवा', en: 'Shram / seva' },
  anya: { hi: 'अन्य', en: 'Other' },
};

export type DaanLedgerEntry = {
  id: string;
  /** Civil date, YYYY-MM-DD (device-local day of the entry). */
  isoDate: string;
  /** Panchang stamp, e.g. "माघ कृष्ण द्वितीया, रविवार" — computed, not typed. */
  tithiHi: string;
  tithiEn: string;
  category: DaanCategory;
  gupt: boolean;
  /** Absent on gupt entries by construction. */
  occasionId?: string;
  note?: string;
  amountInr?: number;
  createdAtMs: number;
};

export type DaanLedgerPayload = { version: number; entries: DaanLedgerEntry[] };

export function makeTithiStamp(panchang: PanchangData): { hi: string; en: string } {
  const pakshaHi = panchang.tithi.paksha === 'shukla' ? 'शुक्ल' : 'कृष्ण';
  const pakshaEn = panchang.tithi.paksha === 'shukla' ? 'Shukla' : 'Krishna';
  return {
    hi: `${panchang.lunarMonth.nameHi} ${pakshaHi} ${panchang.tithi.nameHi}, ${panchang.vara.nameHi}`,
    en: `${panchang.lunarMonth.nameEn} ${pakshaEn} ${panchang.tithi.nameEn}, ${panchang.vara.nameEn}`,
  };
}

export function isDaanLedgerEntry(raw: unknown): raw is DaanLedgerEntry {
  if (!raw || typeof raw !== 'object') return false;
  const entry = raw as DaanLedgerEntry;
  if (typeof entry.id !== 'string' || entry.id.length === 0) return false;
  if (typeof entry.isoDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(entry.isoDate)) return false;
  if (typeof entry.tithiHi !== 'string' || typeof entry.tithiEn !== 'string') return false;
  if (!DAAN_CATEGORIES.includes(entry.category)) return false;
  if (typeof entry.gupt !== 'boolean') return false;
  if (typeof entry.createdAtMs !== 'number') return false;
  if (entry.note !== undefined && typeof entry.note !== 'string') return false;
  if (entry.amountInr !== undefined && (typeof entry.amountInr !== 'number' || !Number.isFinite(entry.amountInr) || entry.amountInr < 0)) return false;
  if (entry.occasionId !== undefined && typeof entry.occasionId !== 'string') return false;
  // The gupt guarantee is structural: such an entry carries no detail fields.
  if (entry.gupt && (entry.note !== undefined || entry.amountInr !== undefined || entry.occasionId !== undefined)) return false;
  return true;
}

/** Strips detail fields from gupt entries — the write-side half of the guarantee. */
export function sanitizeLedgerEntry(entry: DaanLedgerEntry): DaanLedgerEntry {
  if (!entry.gupt) return entry;
  return {
    id: entry.id,
    isoDate: entry.isoDate,
    tithiHi: entry.tithiHi,
    tithiEn: entry.tithiEn,
    category: entry.category,
    gupt: true,
    createdAtMs: entry.createdAtMs,
  };
}

export function parseLedgerPayload(raw: string): DaanLedgerEntry[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return [];
    const payload = parsed as DaanLedgerPayload;
    if (payload.version !== DAAN_LEDGER_PAYLOAD_VERSION || !Array.isArray(payload.entries)) return [];
    return payload.entries.filter(isDaanLedgerEntry);
  } catch {
    return []; // corrupted JSON — treat as empty, never throw during hydration
  }
}

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * The export the share sheet sends (U7): one row per entry, newest first.
 * Gupt entries export as their date + "gupt" only — the guarantee holds even
 * in the user's own export.
 */
export function buildLedgerCsv(entries: readonly DaanLedgerEntry[]): string {
  const header = 'date,tithi,category,note,amount_inr';
  const rows = [...entries]
    .sort((a, b) => (a.isoDate < b.isoDate ? 1 : a.isoDate > b.isoDate ? -1 : b.createdAtMs - a.createdAtMs))
    .map((entry) => {
      if (entry.gupt) return [entry.isoDate, csvCell(entry.tithiEn), 'gupt', '', ''].join(',');
      return [
        entry.isoDate,
        csvCell(entry.tithiEn),
        entry.category,
        csvCell(entry.note ?? ''),
        entry.amountInr !== undefined ? String(entry.amountInr) : '',
      ].join(',');
    });
  return [header, ...rows].join('\n');
}
