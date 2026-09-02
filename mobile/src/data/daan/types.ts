/**
 * दान-पुण्य content shapes (PRD-26, RULEBOOK §24). Same registry discipline as
 * bhog (§21) and vastu (§22): bilingual Hi/En parallel fields, a review-only
 * `source` block that is never rendered, and draft entries invisible behind
 * verified-only accessors. The educate-first IA contract (PRD-26 §2.7) is a
 * *surface* rule, but two shapes here encode its data half: occasion rows never
 * carry a give link (the directory is a separate registry reached only through
 * a journey), and ledger entries never total.
 */

export type DaanContentStatus = 'draft' | 'verified';

export type DaanSource = {
  /** ≥2 independent references; shipped in-repo verified content counts as one
   * (named by path), an external published domain as another. Review-only. */
  referenceUrls: string[];
  /** Dated adjudication note (what was checked, where sources agree). */
  verificationNote: string;
  variantNote?: string;
};

/** The verse/teaching spine (PRD-26 §10): Veda → Upanishad → Gita → Itihasa. */
export type DaanPrincipleEntry = {
  id: string;
  titleHi: string;
  titleEn: string;
  /** Devanagari verse lines; absent for teaching-summary rows. */
  verseLines?: readonly string[];
  iastLines?: readonly string[];
  citeHi: string;
  citeEn: string;
  meaningHi: string;
  meaningEn: string;
  /** Deep link into the bundled Gita reader (the one already-shipped layer). */
  gitaRef?: { chapter: number; verseIndex: number };
  status: DaanContentStatus;
  source: DaanSource;
};

export type DaanItem = {
  id: string;
  nameHi: string;
  nameEn: string;
  reasonHi: string;
  reasonEn: string;
};

/**
 * One daan-significant day (or day family). `ruleIds` are exact observance/
 * festival solver ids; `ruleIdSuffixes` match families (e.g. '-ekadashi').
 * Exact ids always win over suffix families (PRD-26 §10.1). A day with no
 * attested daan tradition has NO row — hosts render nothing (never a
 * placeholder).
 */
export type DaanOccasionEntry = {
  id: string;
  ruleIds: readonly string[];
  ruleIdSuffixes?: readonly string[];
  titleHi: string;
  titleEn: string;
  whyHi: string;
  whyEn: string;
  items: readonly DaanItem[];
  /** Shipped katha-library id (cross-link — never duplicated). */
  kathaId?: string;
  /** One of the five teaching-kathas in this registry (kathas.ts). */
  daanKathaId?: string;
  status: DaanContentStatus;
  source: DaanSource;
};

/** Weekly vaar-daan row (shared vocabulary with PRD-21's graha practice). */
export type DaanVaarEntry = {
  /** JS getDay(): 0 = Sunday … 6 = Saturday. */
  weekday: number;
  vaarHi: string;
  vaarEn: string;
  grahaHi: string;
  grahaEn: string;
  itemsHi: string;
  itemsEn: string;
};

export type DaanKathaSection = {
  id: string;
  paragraphsHi: readonly string[];
  paragraphsEn: readonly string[];
};

/** A teaching-katha (PRD-26 §10.2 Bucket B) — rendered by DaanKathaScreen. */
export type DaanKathaEntry = {
  id: string;
  titleHi: string;
  titleEn: string;
  subtitleHi: string;
  subtitleEn: string;
  sections: readonly DaanKathaSection[];
  teachingHi: string;
  teachingEn: string;
  /** Canonical source line, rendered (e.g. "श्रीमद्भागवत 9.21"). */
  canonHi: string;
  canonEn: string;
  status: DaanContentStatus;
  source: DaanSource;
};

export type DaanCategory =
  | 'anna'
  | 'vastra'
  | 'vidya'
  | 'gau-seva'
  | 'deep'
  | 'dravya'
  | 'rakt'
  | 'shram'
  | 'anya';

export type DaanOrgKind = 'anna-kshetra' | 'ngo' | 'temple-trust' | 'seva-portal';

/**
 * One giving-directory row (PRD-26 §5 P2, §6.2). officialUrl/donateUrl come
 * from the organization's own domain only. Registration *kinds* are stated;
 * numbers are never transcribed unless read from an official source — receipts
 * always come from the organization, never the app. No UPI VPAs (open decision
 * #4 resolved: web-only hand-off at launch).
 */
export type DaanOrgEntry = {
  id: string;
  nameHi: string;
  nameEn: string;
  kind: DaanOrgKind;
  categories: readonly DaanCategory[];
  aboutHi: string;
  aboutEn: string;
  registrationHi: string;
  registrationEn: string;
  officialUrl: string;
  donateUrl: string;
  /** Rendered on the row — trust is the feature (PRD-26 §6.2). */
  verifiedOn: string; // ISO date
  /** True when the hand-off is not a money donation (e.g. blood-donor registration). */
  nonMonetaryHi?: string;
  nonMonetaryEn?: string;
  daanKathaId?: string;
  status: DaanContentStatus;
  source: DaanSource;
};
