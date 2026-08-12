/**
 * पूजा विधि — guided step-by-step puja flows (PRD-19, RULEBOOK §18).
 *
 * A vidhi is a *procedure*, not a text: its unit is a step, and every step that
 * carries liturgical text carries it as a TRANSCRIBED mantra (RULEBOOK §11.3 —
 * never composed) with a per-mantra citation. Texts the app already ships
 * (kathas, aartis) are referenced by id, never re-typed (§11.11).
 */

export type VidhiPhase = 'prep' | 'main' | 'closing';

/**
 * Transcribed liturgical text for one step. `devanagari`/`iast` may be
 * multi-line (joined with '\n'); the conduct screen renders them line-split
 * inside the gold mantra box.
 *
 * `sourceUrl` cites where THIS mantra's exact text was verified. It exists for
 * content review only and must never be rendered in the app UI (pinned by
 * VidhiScreens.test.tsx).
 */
export type VidhiMantra = {
  devanagari: string;
  iast: string;
  sourceUrl: string;
};

/** A hand-off into a text the app already ships — single source of truth. */
export type VidhiRef =
  | { kind: 'katha'; id: string } // KathaContentEntry id (KATHA_CONTENT_BY_ID)
  | { kind: 'section'; id: string }; // LibraryEntry id in texts.ts

export type VidhiStep = {
  id: string;
  phase: VidhiPhase;
  titleHi: string;
  titleEn: string;
  /** Authored fresh (RULEBOOK §9): what to do + why, 1–2 lines, both languages. */
  instructionHi: string;
  instructionEn: string;
  /** Present only when the exact text was verified verbatim (RULEBOOK §11.3). */
  mantra?: VidhiMantra;
  /** Present when the step IS a shipped text (katha, aarti) — hand-off card. */
  ref?: VidhiRef;
};

export type VidhiSamagriItem = {
  itemHi: string;
  itemEn: string;
  qty?: string;
  optional?: boolean;
};

/**
 * Source block for personal/content review — the same shape as the Valmiki
 * Ramayana content's committed `source` block (RULEBOOK §11.2). NONE of these
 * fields are ever rendered in the app UI.
 */
export type VidhiSource = {
  canonicalEdition: string;
  canonicalEditionUrls: string[];
  /** What was checked and when — or what is still outstanding and why. */
  canonicalEditionStatus: string;
  referenceUrls: string[];
  retrievedOn: string;
  notes?: string;
};

export type VidhiEntry = {
  id: string;
  titleHi: string;
  titleEn: string;
  /** Observance rule ids (festivals.ts) whose day panel offers this vidhi. */
  festivalIds: string[];
  /** Deity tags from the shared Deity union (texts.ts / deities.ts). */
  deities: string[];
  /** Declared tradition line shown under the title — never an anonymous procedure. */
  conventionLineHi: string;
  conventionLineEn: string;
  durationHintMin: number;
  samagri: VidhiSamagriItem[];
  steps: VidhiStep[];
  source: VidhiSource;
};
