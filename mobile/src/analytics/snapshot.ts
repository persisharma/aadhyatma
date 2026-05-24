import type { ActivityTotals } from '@/contexts/UserActivityContext';

export type EngagementTier = 'curious' | 'regular' | 'devoted' | 'master';
export type SadhakPersona = 'new' | 'reader' | 'japaka' | 'mixed';

export type SnapshotInput = {
  // identity / cohort
  installDate: string; // YYYY-MM-DD
  installAppVersion: string;
  appVersion: string;
  platform: 'ios' | 'android' | 'web' | 'windows' | 'macos';
  lang: 'hi' | 'en';
  todayDate: string; // YYYY-MM-DD — injected so tests are deterministic

  // habit
  currentStreak: number;
  longestStreak: number;
  activeDaysLifetime: number;
  activeDaysLast7: number;
  activeDaysLast30: number;
  lastActiveDate: string | null; // YYYY-MM-DD or null if never active

  // depth (lifetime + today)
  lifetime: ActivityTotals;
  today: ActivityTotals;

  // bookmarks
  bookmarkCount: number;
  bookmarksPerSource: Record<string, number>;

  // sources started — distinct sourceIds with any ReadingProgress entry
  sourcesStarted: number;

  // settings
  reminderEnabled: boolean;
  reminderHour: number | null;
  theme: 'light' | 'dark';
};

// Flattened keys are unbounded by sourceId/mantraId, so we accept a slightly
// looser shape than the strict snapshot fields above.
export type SadhakSnapshot = {
  install_date: string;
  install_app_version: string;
  days_since_install: number;
  app_version: string;
  platform: SnapshotInput['platform'];
  lang: 'hi' | 'en';

  current_streak: number;
  longest_streak: number;
  active_days_lifetime: number;
  active_days_last_7: number;
  active_days_last_30: number;
  days_since_last_open: number | null;

  lifetime_reads: number;
  lifetime_beads: number;
  lifetime_rounds: number;
  sources_started: number;
  bookmark_count: number;
  favorite_mantra: string | null;
  primary_source: string | null;

  today_reads: number;
  today_beads: number;
  today_rounds: number;

  reminder_enabled: boolean;
  reminder_hour: number | null;
  theme: 'light' | 'dark';

  sadhana_score: number;
  engagement_tier: EngagementTier;
  primary_persona: SadhakPersona;

  last_active_date: string | null;
} & Record<string, string | number | boolean | null>;

function daysBetweenIso(fromIso: string, toIso: string): number {
  // Both are YYYY-MM-DD in local time semantics; treat as UTC midnight for
  // a stable integer day delta.
  const a = Date.parse(`${fromIso}T00:00:00Z`);
  const b = Date.parse(`${toIso}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

function snakeKey(prefix: string, raw: string): string {
  return `${prefix}${raw.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}`;
}

function pickFavoriteMantra(
  perMantra: Record<string, { beads: number; rounds: number }>
): string | null {
  let bestId: string | null = null;
  let bestScore = -1;
  for (const [id, jr] of Object.entries(perMantra)) {
    const score = jr.rounds * 108 + jr.beads;
    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  }
  return bestScore > 0 ? bestId : null;
}

function pickPrimarySource(perSource: Record<string, number>): string | null {
  let bestId: string | null = null;
  let bestN = 0;
  for (const [id, n] of Object.entries(perSource)) {
    if (n > bestN) {
      bestN = n;
      bestId = id;
    }
  }
  return bestId;
}

function deriveTier(input: SnapshotInput): EngagementTier {
  const { activeDaysLifetime, currentStreak } = input;
  if (activeDaysLifetime >= 90 && currentStreak >= 30) return 'master';
  if (activeDaysLifetime >= 30 || currentStreak >= 14) return 'devoted';
  if (activeDaysLifetime >= 7 || currentStreak >= 3) return 'regular';
  return 'curious';
}

function derivePersona(input: SnapshotInput): SadhakPersona {
  const { lifetime, activeDaysLifetime } = input;
  if (activeDaysLifetime === 0) return 'new';
  const readWeight = lifetime.totalReads;
  const japaWeight = lifetime.totalRounds * 108 + lifetime.totalBeads;
  const total = readWeight + japaWeight;
  if (total === 0) return 'new';
  const japaRatio = japaWeight / total;
  if (japaRatio >= 0.7) return 'japaka';
  if (japaRatio <= 0.3) return 'reader';
  return 'mixed';
}

export function buildSadhakSnapshot(input: SnapshotInput): SadhakSnapshot {
  const { lifetime, today } = input;

  const sadhanaScore =
    lifetime.totalReads +
    lifetime.totalRounds * 108 +
    lifetime.totalBeads +
    input.bookmarkCount * 5;

  const base: SadhakSnapshot = {
    install_date: input.installDate,
    install_app_version: input.installAppVersion,
    days_since_install: daysBetweenIso(input.installDate, input.todayDate),
    app_version: input.appVersion,
    platform: input.platform,
    lang: input.lang,

    current_streak: input.currentStreak,
    longest_streak: input.longestStreak,
    active_days_lifetime: input.activeDaysLifetime,
    active_days_last_7: input.activeDaysLast7,
    active_days_last_30: input.activeDaysLast30,
    days_since_last_open: input.lastActiveDate
      ? daysBetweenIso(input.lastActiveDate, input.todayDate)
      : null,

    lifetime_reads: lifetime.totalReads,
    lifetime_beads: lifetime.totalBeads,
    lifetime_rounds: lifetime.totalRounds,
    sources_started: input.sourcesStarted,
    bookmark_count: input.bookmarkCount,
    favorite_mantra: pickFavoriteMantra(lifetime.perMantra),
    primary_source: pickPrimarySource(lifetime.perSource),

    today_reads: today.totalReads,
    today_beads: today.totalBeads,
    today_rounds: today.totalRounds,

    reminder_enabled: input.reminderEnabled,
    reminder_hour: input.reminderHour,
    theme: input.theme,

    sadhana_score: sadhanaScore,
    engagement_tier: deriveTier(input),
    primary_persona: derivePersona(input),

    last_active_date: input.lastActiveDate,
  };

  // Flatten per-source / per-mantra / per-bookmark distributions into
  // prefixed, snake-cased keys so PostHog can chart them as numeric
  // user-properties without nested-object gymnastics.
  for (const [src, n] of Object.entries(lifetime.perSource)) {
    base[snakeKey('reads_', src)] = n;
  }
  for (const [mid, jr] of Object.entries(lifetime.perMantra)) {
    base[snakeKey('japa_', `${mid}_beads`)] = jr.beads;
    base[snakeKey('japa_', `${mid}_rounds`)] = jr.rounds;
  }
  for (const [src, n] of Object.entries(input.bookmarksPerSource)) {
    base[snakeKey('bookmarks_', src)] = n;
  }
  for (const [src, n] of Object.entries(today.perSource)) {
    base[snakeKey('today_reads_', src)] = n;
  }

  return base;
}
