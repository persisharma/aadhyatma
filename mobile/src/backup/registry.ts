/**
 * The backup key registry (PRD-06 Track C).
 *
 * Every AsyncStorage key that holds something the USER authored, chose, counted
 * or was reminded of — the data an uninstall or a new phone would otherwise
 * wipe. Export reads exactly these keys; restore writes exactly these keys and
 * refuses anything else in the file, so a hand-edited or foreign JSON can
 * never plant a key the app does not own.
 *
 * WHAT IS EXCLUDED, AND WHY — read this before adding a key:
 *
 * - The derived calendar caches (`@vedansh:panchang-days:`, `observances:`,
 *   `pitru-solves:`, `widget-plan:` — see `utils/derivedCacheReset.ts`). Pure
 *   functions of the engines; recomputed on the new device for free.
 * - `@vedansh/notif-meta`, `notif-permission-asked`,
 *   `@vedansh/japam-alarms/once-armed`, `@vedansh/widget:last-plan-key-v1` —
 *   bookkeeping that MIRRORS what is scheduled with / written to THIS device's
 *   OS. Carrying it to another phone desyncs the schedulers from reality; the
 *   schedulers rebuild it from the preferences that ARE carried.
 * - `@vedansh/install-id`, `push-token`, `push-token-sync` — identify this
 *   install to the notification plumbing; a restored copy would make two
 *   phones claim one identity.
 * - `@vedansh/tour-completed-v*`, `whats-new-seen-v*`, `onboarding-setup-v*`,
 *   `rating-prompt`, `derived-cache-build` — per-install lifecycle flags. A
 *   fresh install SHOULD see the setup sheet once.
 * - `@vedansh/backup-meta` — the "last backed up" stamp is about this device's
 *   file, not the data.
 *
 * Add a key here the moment a new store persists something a user typed or
 * chose (RULEBOOK §29). The registry test pins that every `@vedansh` key
 * declared in `src/` is either listed here or named in the exclusion list, so
 * a forgotten store fails CI instead of silently dropping out of backups.
 */

export type BackupGroupId = 'family' | 'practice' | 'follows' | 'preferences';

export type BackupKeyEntry = {
  key: string;
  group: BackupGroupId;
  /** Short human label for the summary card, Hindi and English. */
  labelHi: string;
  labelEn: string;
};

export const BACKUP_GROUP_ORDER: readonly BackupGroupId[] = ['family', 'practice', 'follows', 'preferences'];

export const BACKUP_GROUP_LABELS: Record<BackupGroupId, { hi: string; en: string }> = {
  family: { hi: 'परिवार व ज्योतिष', en: 'Family & Jyotish' },
  practice: { hi: 'साधना व पठन', en: 'Practice & reading' },
  follows: { hi: 'स्मरण व अलार्म', en: 'Reminders & alarms' },
  preferences: { hi: 'पसंद', en: 'Preferences' },
};

export const BACKUP_KEYS: readonly BackupKeyEntry[] = [
  // ── Family & Jyotish: every date the user typed ──
  { key: '@vedansh:kundali-profiles:v1', group: 'family', labelHi: 'जन्म विवरण', labelEn: 'Birth profiles' },
  { key: '@vedansh:kundali-birth-profile:v1', group: 'family', labelHi: 'जन्म विवरण (पुराना)', labelEn: 'Birth profile (legacy)' },
  { key: '@vedansh:janma-tithi:v1', group: 'family', labelHi: 'जन्म तिथि', labelEn: 'Janma tithi' },
  { key: '@vedansh/pitru-smaran', group: 'family', labelHi: 'पितृ स्मरण', labelEn: 'Pitru Smaran' },
  { key: '@vedansh:kul-parampara:v1', group: 'family', labelHi: 'कुल परम्परा', labelEn: 'Kul Parampara' },
  { key: '@vedansh:guna-milan-draft:v1', group: 'family', labelHi: 'गुण मिलान', labelEn: 'Guna Milan' },
  { key: '@vedansh:guna-milan-metrics:v1', group: 'family', labelHi: 'गुण मिलान (विवरण)', labelEn: 'Guna Milan (details)' },
  { key: '@vedansh:namkaran-session:v1', group: 'family', labelHi: 'नामकरण', labelEn: 'Namkaran' },
  { key: '@vedansh:namkaran-shortlist:v1', group: 'family', labelHi: 'नामकरण (चुने नाम)', labelEn: 'Namkaran shortlist' },
  { key: '@vedansh:vastu-homes:v1', group: 'family', labelHi: 'गृह वास्तु', labelEn: 'Ghar Vastu homes' },
  { key: '@vedansh/daan-ledger:v1', group: 'family', labelHi: 'दान लेखा', labelEn: 'Daan ledger' },

  // ── Practice & reading ──
  { key: '@vedansh/bookmarks', group: 'practice', labelHi: 'सहेजे श्लोक', labelEn: 'Saved verses' },
  { key: '@vedansh/reading-progress', group: 'practice', labelHi: 'पठन प्रगति', labelEn: 'Reading progress' },
  { key: '@vedansh/user-activity', group: 'practice', labelHi: 'साधक गतिविधि', labelEn: 'Sadhak activity' },
  { key: '@vedansh/japam-counter', group: 'practice', labelHi: 'जप गणना', labelEn: 'Japam counter' },
  { key: '@vedansh/routines', group: 'practice', labelHi: 'नित्य साधना', labelEn: 'Daily routines' },
  { key: '@vedansh/routine-done', group: 'practice', labelHi: 'साधना पूर्णता', labelEn: 'Routine completions' },
  { key: '@vedansh/routine-celebrated', group: 'practice', labelHi: 'साधना उत्सव', labelEn: 'Routine celebrations' },
  { key: '@vedansh/sadhana', group: 'practice', labelHi: 'संकल्प', labelEn: 'Sankalp programs' },
  { key: '@vedansh/sadhana-celebrated', group: 'practice', labelHi: 'संकल्प उत्सव', labelEn: 'Sankalp celebrations' },
  { key: '@vedansh/sadhana-day-celebrated', group: 'practice', labelHi: 'संकल्प दिवस', labelEn: 'Sankalp day marks' },
  { key: '@vedansh/vidhi-checklist', group: 'practice', labelHi: 'विधि सूची', labelEn: 'Vidhi checklists' },
  { key: '@vedansh/search-recent', group: 'practice', labelHi: 'हाल की खोज', labelEn: 'Recent searches' },
  { key: '@vedansh/new-content-state', group: 'practice', labelHi: 'देखी गई नई सामग्री', labelEn: 'Seen new content' },

  // ── Reminders & alarms ──
  { key: '@vedansh/vrat-follows', group: 'follows', labelHi: 'मेरे व्रत', labelEn: 'Followed vrats' },
  { key: '@vedansh/vrat-reminder-default', group: 'follows', labelHi: 'व्रत स्मरण सेटिंग', labelEn: 'Vrat reminder default' },
  { key: '@vedansh/muhurat-follows', group: 'follows', labelHi: 'मुहूर्त स्मरण', labelEn: 'Muhurat follows' },
  { key: '@vedansh/parv-arc', group: 'follows', labelHi: 'पर्व-अर्क', labelEn: 'Festival arcs' },
  { key: '@vedansh/japam-alarms', group: 'follows', labelHi: 'जप अलार्म', labelEn: 'Japam alarms' },
  { key: '@vedansh/sadhana-reminders', group: 'follows', labelHi: 'संकल्प स्मरण', labelEn: 'Sankalp reminders' },
  { key: '@vedansh/notif-prefs', group: 'follows', labelHi: 'दैनिक भक्ति स्मरण', labelEn: 'Daily verse reminders' },

  // ── Preferences ──
  { key: '@vedansh/language', group: 'preferences', labelHi: 'भाषा', labelEn: 'Language' },
  { key: '@vedansh/regionalLanguage', group: 'preferences', labelHi: 'क्षेत्रीय भाषा', labelEn: 'Regional language' },
  { key: '@vedansh/font-scale', group: 'preferences', labelHi: 'पाठ का आकार', labelEn: 'Reading size' },
  { key: '@vedansh/read-aloud', group: 'preferences', labelHi: 'पाठ सुनें', labelEn: 'Read aloud' },
  { key: '@vedansh:panchang-location', group: 'preferences', labelHi: 'पंचांग स्थान', labelEn: 'Panchang city' },
  { key: '@vedansh:panchang-calendar-system', group: 'preferences', labelHi: 'पंचांग पद्धति', labelEn: 'Calendar system' },
  // The lens pair must always travel together (derivedCacheReset.ts explains
  // why: the set alone is re-seeded from the city and hands back a calendar
  // the user turned off).
  { key: '@vedansh:panchang-lenses', group: 'preferences', labelHi: 'क्षेत्रीय पंचांग', labelEn: 'Regional calendars' },
  { key: '@vedansh:panchang-lenses-seeded', group: 'preferences', labelHi: 'क्षेत्रीय पंचांग (सेट)', labelEn: 'Regional calendars (seeded)' },
];

/**
 * Keys under the `@vedansh` namespace that are deliberately NOT backed up.
 * Exact keys or prefixes (a trailing `*`). The registry test walks `src/` for
 * every declared key and demands it appear in one list or the other.
 */
export const BACKUP_EXCLUDED_KEYS: readonly string[] = [
  '@vedansh/notif-meta',
  '@vedansh/notif-permission-asked',
  '@vedansh/japam-alarms/once-armed',
  '@vedansh/widget:last-plan-key-v1',
  '@vedansh/install-id',
  '@vedansh/push-token',
  '@vedansh/push-token-sync',
  '@vedansh/tour-completed-v*',
  '@vedansh/whats-new-seen-v*',
  '@vedansh/onboarding-setup-v*',
  '@vedansh/rating-prompt',
  '@vedansh/derived-cache-build',
  '@vedansh/backup-meta',
  '@vedansh:panchang-days:*',
  '@vedansh:muhurat-days:*',
  '@vedansh:observances:*',
  '@vedansh:pitru-solves:*',
  '@vedansh:widget-plan:*',
];

const KEY_SET = new Set(BACKUP_KEYS.map((entry) => entry.key));

export function isBackupKey(key: string): boolean {
  return KEY_SET.has(key);
}

export function backupEntryForKey(key: string): BackupKeyEntry | undefined {
  return BACKUP_KEYS.find((entry) => entry.key === key);
}

export function isExcludedKey(key: string): boolean {
  return BACKUP_EXCLUDED_KEYS.some((rule) =>
    rule.endsWith('*') ? key.startsWith(rule.slice(0, -1)) : key === rule
  );
}
