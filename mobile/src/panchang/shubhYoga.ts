/**
 * शुभ योग — the additive half of the muhurat vocabulary (PRD-27).
 * See docs/roadmap/prds/27-shubh-yoga.md and RULEBOOK §24.
 *
 * PURE: windows derive from a `PanchangData` the caller already computed plus
 * the next civil day's sunrise — no I/O, no wall-clock reads, no React. The one
 * astronomy import is `getSiderealPlanetLongitude` (itself pure, the same
 * boundary as kundali.ts and eventMuhurat.ts) for रवि योग's Sun nakshatra.
 *
 * ANNOTATE-ONLY (RULEBOOK §24): this module is a vocabulary, never a grade.
 * `eventMuhurat.ts` must not import it (source-guard test) — a yoga can never
 * re-rank, re-tier, exclude or offset anything the finder produces. Doshas and
 * yogas coexist on one day and no caller may net them into a verdict.
 *
 * ⚠ CONTENT GATE (RULEBOOK §24): the tables below are DRAFT, pinned row-for-row
 * against docs/roadmap/conventions/shubh-yoga-v1.md. `SHUBH_YOGA_SOURCE.verified`
 * stays the literal `false` until the two-source §10 review lands; a store build
 * exposing the chips is release-blocked on it.
 */
import type { PanchangData } from './types';
import { angaAt } from './eventMuhurat';
import { getSiderealPlanetLongitude, NAKSHATRA_SPAN } from './kundali';

export type ShubhYogaKey =
  | 'amrita-siddhi'
  | 'sarvartha-siddhi'
  | 'tripushkar'
  | 'dwipushkar'
  | 'ravi';

/**
 * Fixed display order — traditional prominence for a stable list, never a
 * score. Renderers must not reorder, count, or grade between yogas.
 */
export const SHUBH_YOGA_ORDER: readonly ShubhYogaKey[] = [
  'amrita-siddhi',
  'sarvartha-siddhi',
  'tripushkar',
  'dwipushkar',
  'ravi',
];

/**
 * Names always render in full, ending … योग — never bare, and never as a value
 * of the नित्य योग field (the 27-cycle Sun+Moon yoga is an unrelated system;
 * the collision rule lives in RULEBOOK §24 and the convention doc).
 */
export const SHUBH_YOGA_LABELS: Readonly<Record<ShubhYogaKey, { hi: string; en: string }>> = {
  'amrita-siddhi': { hi: 'अमृत सिद्धि योग', en: 'Amrita Siddhi Yoga' },
  'sarvartha-siddhi': { hi: 'सर्वार्थ सिद्धि योग', en: 'Sarvartha Siddhi Yoga' },
  tripushkar: { hi: 'त्रिपुष्कर योग', en: 'Tripushkar Yoga' },
  dwipushkar: { hi: 'द्विपुष्कर योग', en: 'Dwipushkar Yoga' },
  ravi: { hi: 'रवि योग', en: 'Ravi Yoga' },
};

/**
 * §10 provenance for the whole table family (one flag — the tables ship and
 * flip together, unlike the per-occasion EVENT_RULES). Pinned `false` by test.
 */
export const SHUBH_YOGA_SOURCE = {
  convention: 'vedansh-shubh-yoga-v1',
  verified: false,
  referenceUrls: [
    'https://www.drikpanchang.com/yoga/sarvarthasiddhi-yoga-date-time.html',
    'https://www.drikpanchang.com/yoga/amritsiddhi-yoga-date-time.html',
    'https://www.drikpanchang.com/yoga/ravi-yoga-date-time.html',
    'https://www.drikpanchang.com/yoga/tripushkar-yoga-date-time.html',
  ],
  notes:
    'DRAFT 2026-08-31 — rows pinned from search-index snippets of published tables (direct ' +
    'content egress blocked; dated attempts recorded in shubh-yoga-v1.md). Recension variance ' +
    'recorded there: the Sarvartha Sunday Ashwini/Ashlesha and Thu/Fri short rows, and the ' +
    'Tripushkar U./P. Phalguni discord. Two-source §10 review outstanding and release-gating.',
} as const;

// ── The tables (0-based indexes; convention doc is the row-for-row contract) ──

/** सर्वार्थ सिद्धि: favourable nakshatras per vāra (0 = Sunday). */
export const SARVARTHA_SIDDHI_BY_VARA: readonly (readonly number[])[] = [
  [0, 7, 11, 12, 18, 20, 25], // रविवार — Ashwini · Pushya · U.Phalguni · Hasta · Mula · U.Ashadha · U.Bhadrapada
  [3, 4, 7, 16, 21], // सोमवार — Rohini · Mrigashira · Pushya · Anuradha · Shravana
  [0, 2, 8, 25], // मंगलवार — Ashwini · Krittika · Ashlesha · U.Bhadrapada
  [2, 3, 4, 12, 16], // बुधवार — Krittika · Rohini · Mrigashira · Hasta · Anuradha
  [0, 6, 7, 16, 26], // गुरुवार — Ashwini · Punarvasu · Pushya · Anuradha · Revati
  [0, 6, 16, 21, 26], // शुक्रवार — Ashwini · Punarvasu · Anuradha · Shravana · Revati
  [3, 14, 21], // शनिवार — Rohini · Swati · Shravana
];

/** अमृत सिद्धि: the one nakshatra per vāra. Every pair is also a सर्वार्थ row (test-pinned). */
export const AMRITA_SIDDHI_BY_VARA: readonly number[] = [12, 4, 0, 16, 7, 26, 3];

/** रवि योग: inclusive Sun→Moon nakshatra counts that form the yoga. */
export const RAVI_YOGA_COUNTS: ReadonlySet<number> = new Set([4, 6, 9, 10, 13, 20]);

/** पुष्कर vāras: रवि · मंगल · शनि. */
export const PUSHKAR_VARAS: ReadonlySet<number> = new Set([0, 2, 6]);
/** द्विपुष्कर nakshatras — the 2+2-pada rashi-spanning three. */
export const DWIPUSHKAR_NAKSHATRAS: ReadonlySet<number> = new Set([4, 13, 22]);
/** त्रिपुष्कर nakshatras — the 3+1/1+3-pada rashi-spanning six. */
export const TRIPUSHKAR_NAKSHATRAS: ReadonlySet<number> = new Set([2, 6, 11, 15, 20, 24]);

/** भद्रा tithis (द्वितीया/सप्तमी/द्वादशी, both pakshas) — the पुष्कर tithi factor. */
export function isPushkarTithi(tithiIndex: number): boolean {
  return tithiIndex % 5 === 1;
}

export type ShubhYogaWindow = {
  key: ShubhYogaKey;
  nameHi: string;
  nameEn: string;
  start: Date;
  end: Date;
  /**
   * True when the window opens at the day's sunrise — surfaces following the
   * end-only anga convention may drop the start clock only then; a mid-day
   * onset always shows its start (convention doc, "Window convention").
   */
  fromSunrise: boolean;
};

/** Inclusive Sun→Moon count in the 27-cycle (both ends counted). */
export function sunToMoonCount(sunNakshatraIndex: number, moonNakshatraIndex: number): number {
  return ((moonNakshatraIndex - sunNakshatraIndex + 27) % 27) + 1;
}

function sunNakshatraAt(at: Date): number {
  return Math.floor(getSiderealPlanetLongitude('sun', at) / NAKSHATRA_SPAN) % 27;
}

/**
 * The day's शुभ योग windows over [sunrise, nextSunrise) — the vedic vāra-day,
 * so a window never crosses the next sunrise (the vāra factor changes there).
 *
 * The day is cut at every solved anga end inside it (tithi, nakshatra, and both
 * kshaya ends — the shipped kshaya-aware `angaAt` reads each segment, never
 * `index + 1` across a kshaya). Each segment is evaluated at its START instant
 * (रवि योग's Sun nakshatra too — the recorded v1 variant); adjacent matching
 * segments merge into one window per yoga. Output is ordered by
 * SHUBH_YOGA_ORDER, then start time.
 */
export function computeShubhYogas(p: PanchangData, nextSunrise: Date): ShubhYogaWindow[] {
  const startMs = p.sunrise.getTime();
  const endMs = nextSunrise.getTime();
  if (!(endMs > startMs)) return [];

  const cuts = new Set<number>();
  const addCut = (d: Date | null | undefined) => {
    if (!d) return;
    const t = d.getTime();
    if (t > startMs && t < endMs) cuts.add(t);
  };
  addCut(p.tithi.endTime);
  addCut(p.kshayaTithi?.endTime);
  addCut(p.nakshatra.endTime);
  addCut(p.kshayaNakshatra?.endTime);
  const edges = [startMs, ...[...cuts].sort((a, b) => a - b), endMs];

  const vara = p.vara.index;
  const open = new Map<ShubhYogaKey, ShubhYogaWindow>();
  const done: ShubhYogaWindow[] = [];

  for (let i = 0; i < edges.length - 1; i += 1) {
    const segStart = new Date(edges[i]);
    const segEnd = new Date(edges[i + 1]);
    const tithiIndex = angaAt(p.tithi, p.kshayaTithi, segStart, 30);
    const nakshatraIndex = angaAt(p.nakshatra, p.kshayaNakshatra, segStart, 27);

    const present = new Set<ShubhYogaKey>();
    if (SARVARTHA_SIDDHI_BY_VARA[vara].includes(nakshatraIndex)) present.add('sarvartha-siddhi');
    if (AMRITA_SIDDHI_BY_VARA[vara] === nakshatraIndex) present.add('amrita-siddhi');
    if (RAVI_YOGA_COUNTS.has(sunToMoonCount(sunNakshatraAt(segStart), nakshatraIndex))) {
      present.add('ravi');
    }
    if (isPushkarTithi(tithiIndex) && PUSHKAR_VARAS.has(vara)) {
      if (DWIPUSHKAR_NAKSHATRAS.has(nakshatraIndex)) present.add('dwipushkar');
      if (TRIPUSHKAR_NAKSHATRAS.has(nakshatraIndex)) present.add('tripushkar');
    }

    for (const key of SHUBH_YOGA_ORDER) {
      const running = open.get(key);
      if (present.has(key)) {
        if (running) {
          running.end = segEnd; // contiguous — extend
        } else {
          open.set(key, {
            key,
            nameHi: SHUBH_YOGA_LABELS[key].hi,
            nameEn: SHUBH_YOGA_LABELS[key].en,
            start: segStart,
            end: segEnd,
            fromSunrise: edges[i] === startMs,
          });
        }
      } else if (running) {
        done.push(running);
        open.delete(key);
      }
    }
  }
  done.push(...open.values());

  const orderOf = (k: ShubhYogaKey) => SHUBH_YOGA_ORDER.indexOf(k);
  return done.sort(
    (a, b) => orderOf(a.key) - orderOf(b.key) || a.start.getTime() - b.start.getTime()
  );
}
