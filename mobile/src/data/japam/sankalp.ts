/**
 * Japa sankalp (जप संकल्प) — a one-time, per-mantra vow to complete a number of
 * japa, expressed in malas or as a japa count (design.md §35.2).
 *
 * Progress accumulates across days through `JapamCounterContext.increment`, the
 * single owner of every counted bead (tap, Infinity loop, audio repetition). It
 * is independent of the mala display counter: Reset Beads / Clear All correct
 * that counter but never take back japa already offered toward the vow.
 *
 * Pure and dependency-free so it stays cheap on the launch graph; it is NOT
 * re-exported from `data/japam/index.ts`.
 */

/** Beads on one mala. Mirrors `JAPAM_BEADS_PER_ROUND` without importing the catalogue. */
export const SANKALP_MALA_BEADS = 108;

export type JapaSankalpUnit = 'mala' | 'japa';

export type JapaSankalp = {
  /** How the user expressed the target. */
  unit: JapaSankalpUnit;
  /** Target in `unit` (malas, or individual japa). */
  amount: number;
  /** Japa counted toward this vow since it was taken; never exceeds the target. */
  done: number;
  startedAt: number;
  updatedAt: number;
  /** Set when `done` reaches the target (पूर्णाहुति). Further japa no longer adds. */
  completedAt?: number;
};

/** Upper bounds keep the stored numbers and the progress copy sane. */
export const SANKALP_MAX: Readonly<Record<JapaSankalpUnit, number>> = {
  mala: 10_000,
  japa: 10_000 * SANKALP_MALA_BEADS,
};

/** Suggested targets shown as chips in the sheet. */
export const SANKALP_PRESETS: Readonly<Record<JapaSankalpUnit, readonly number[]>> = {
  mala: [1, 11, 21, 51, 108],
  japa: [108, 1_008, 11_000, 1_25_000],
};

/** −/+ step for the amount stepper: one mala, or one mala's worth of japa. */
export const SANKALP_STEP: Readonly<Record<JapaSankalpUnit, number>> = {
  mala: 1,
  japa: SANKALP_MALA_BEADS,
};

/** A whole number within 1…SANKALP_MAX[unit], or null when the input is unusable. */
export function normalizeSankalpAmount(unit: JapaSankalpUnit, value: number): number | null {
  if (!Number.isFinite(value)) return null;
  const n = Math.floor(value);
  if (n < 1 || n > SANKALP_MAX[unit]) return null;
  return n;
}

/** Parses typed digits (ASCII or Devanagari/Gujarati/Kannada, with grouping commas). */
export function parseSankalpInput(text: string): number | null {
  const ascii = text.replace(/[०-९૦-૯೦-೯]/g, (d) => {
    const code = d.charCodeAt(0);
    const zero = code >= 0x0ce6 ? 0x0ce6 : code >= 0x0ae6 ? 0x0ae6 : 0x0966;
    return String(code - zero);
  });
  const digits = ascii.replace(/[\s,]/g, '');
  if (!/^\d{1,9}$/.test(digits)) return null;
  return Number(digits);
}

/** Target in japa (beads). */
export function sankalpTarget(s: Pick<JapaSankalp, 'unit' | 'amount'>): number {
  return s.unit === 'mala' ? s.amount * SANKALP_MALA_BEADS : s.amount;
}

/**
 * Take a sankalp, or change the target of the one in progress. An active vow keeps
 * its progress and start date; none or a completed one starts afresh. A new target
 * at or below the japa already offered completes the vow at once.
 */
export function takeJapaSankalp(
  existing: JapaSankalp | null | undefined,
  unit: JapaSankalpUnit,
  amount: number,
  now: number
): JapaSankalp | null {
  const n = normalizeSankalpAmount(unit, amount);
  if (n === null) return null;
  if (!existing || existing.completedAt !== undefined) {
    return { unit, amount: n, done: 0, startedAt: now, updatedAt: now };
  }
  const target = sankalpTarget({ unit, amount: n });
  const done = Math.min(existing.done, target);
  const next: JapaSankalp = { unit, amount: n, done, startedAt: existing.startedAt, updatedAt: now };
  if (done >= target) next.completedAt = now;
  return next;
}

/** Adds counted japa to an active vow; a completed vow is returned unchanged. */
export function addSankalpJapa(s: JapaSankalp, beads: number, now: number): JapaSankalp {
  if (s.completedAt !== undefined || !(beads > 0)) return s;
  const target = sankalpTarget(s);
  const done = Math.min(target, s.done + Math.floor(beads));
  const next: JapaSankalp = { ...s, done, updatedAt: now };
  if (done >= target) next.completedAt = now;
  return next;
}

export type SankalpProgress = {
  target: number;
  done: number;
  /** 0…1 */
  fraction: number;
  /** Whole malas offered (for a mala-unit vow's headline). */
  malasDone: number;
  complete: boolean;
};

export function sankalpProgress(s: JapaSankalp): SankalpProgress {
  const target = sankalpTarget(s);
  const done = Math.min(Math.max(0, s.done), target);
  return {
    target,
    done,
    fraction: target > 0 ? done / target : 0,
    malasDone: Math.floor(done / SANKALP_MALA_BEADS),
    complete: s.completedAt !== undefined,
  };
}

/** Splits a japa count into whole malas plus the japa left over. */
export function malaBreakdown(beads: number): { malas: number; rest: number } {
  const n = Math.max(0, Math.floor(beads));
  return { malas: Math.floor(n / SANKALP_MALA_BEADS), rest: n % SANKALP_MALA_BEADS };
}

/** Indian digit grouping with ASCII numerals: 125000 → "1,25,000". */
export function formatIndianNumber(value: number): string {
  const n = Math.max(0, Math.floor(value));
  const s = String(n);
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  const head = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${head},${last3}`;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function parseOne(v: unknown): JapaSankalp | null {
  if (!isRecord(v)) return null;
  const unit = v.unit;
  if (unit !== 'mala' && unit !== 'japa') return null;
  const amount = typeof v.amount === 'number' ? normalizeSankalpAmount(unit, v.amount) : null;
  if (amount === null || amount !== v.amount) return null;
  const { done, startedAt, updatedAt, completedAt } = v;
  if (typeof done !== 'number' || !Number.isFinite(done) || done < 0) return null;
  if (typeof startedAt !== 'number' || !Number.isFinite(startedAt)) return null;
  if (typeof updatedAt !== 'number' || !Number.isFinite(updatedAt)) return null;
  if (completedAt !== undefined && (typeof completedAt !== 'number' || !Number.isFinite(completedAt))) return null;
  const target = sankalpTarget({ unit, amount });
  const s: JapaSankalp = { unit, amount, done: Math.min(Math.floor(done), target), startedAt, updatedAt };
  if (typeof completedAt === 'number') s.completedAt = completedAt;
  else if (s.done >= target) s.completedAt = updatedAt;
  return s;
}

/** Validates the persisted map; malformed records are dropped, never thrown on. */
export function parseJapaSankalps(raw: unknown): Record<string, JapaSankalp> {
  if (!isRecord(raw)) return {};
  const out: Record<string, JapaSankalp> = {};
  for (const [id, value] of Object.entries(raw)) {
    const s = parseOne(value);
    if (s) out[id] = s;
  }
  return out;
}
