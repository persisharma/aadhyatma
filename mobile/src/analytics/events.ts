/**
 * Analytics event model — PURE. No React, no storage, no `Date.now()` of its
 * own (callers pass `at`), so every branch is directly testable.
 *
 * Vedansh has no analytics backend and no network egress: content is bundled
 * and the app is offline-first. So this layer is deliberately a SEAM, not a
 * client. It records events into a bounded on-device log and hands them to
 * whatever sink is registered (none, by default). When a real destination is
 * chosen, it registers as a sink and nothing else changes.
 *
 * The split mirrors `birthProfiles.ts` ⇄ `birthProfileStore.ts`: this file is
 * the pure model, `analyticsStore.ts` owns AsyncStorage, the write queue and
 * the sink list.
 */

/**
 * How the user arrived at the view being logged. The whole point of the field
 * (handover §5): in a month it answers whether the व्रत and ज्योतिष tabs earn
 * their slots, or whether segment swipes do all the work — in which case a slot
 * is reclaimed and भजन gets its tab back.
 *
 *  - `tab`            — a bottom-nav tab tap.
 *  - `segment_swipe`  — the segment control, from inside the shared screen.
 *  - `notification`   — a local notification tap.
 *  - `deeplink`       — an external / in-app link that is not a notification.
 */
export type EntryPoint = 'tab' | 'segment_swipe' | 'notification' | 'deeplink';

export const ENTRY_POINTS: readonly EntryPoint[] = [
  'tab',
  'segment_swipe',
  'notification',
  'deeplink',
];

/**
 * The shared screen's three sections. This is the SAME vocabulary as the
 * `section` route param and `PanchangSection` in `navigation/types.ts` — one
 * set of names for the route, the segment control, the tab bar and this log.
 * Do not introduce a second spelling here; a mismatch between the route param
 * and the analytics field is exactly the drift that makes the log unreadable
 * later.
 */
export type AnalyticsSection = 'panchang' | 'vrat' | 'jyotish';

/** The one event this module ships. Kept as a union so adding a second is additive. */
export type AnalyticsEvent = {
  name: 'shared_screen_view';
  /** Epoch ms, supplied by the caller. */
  at: number;
  entry_point: EntryPoint;
  section: AnalyticsSection;
};

/**
 * Ring-buffer ceiling. The log exists to be read back off a device during
 * development, not to be a complete history, so it is bounded: an unbounded
 * append-only log in AsyncStorage grows until a serialize call starts costing
 * real launch time. 500 shared-screen views is weeks of ordinary use.
 */
export const MAX_EVENTS = 500;

export function sharedScreenView(
  section: AnalyticsSection,
  entryPoint: EntryPoint,
  at: number
): AnalyticsEvent {
  return { name: 'shared_screen_view', at, entry_point: entryPoint, section };
}

/**
 * Append with the ring-buffer bound applied. Returns a NEW array; the oldest
 * events fall off the front once the log is full.
 */
export function appendEvent(
  log: readonly AnalyticsEvent[],
  event: AnalyticsEvent
): readonly AnalyticsEvent[] {
  const next = [...log, event];
  return next.length <= MAX_EVENTS ? next : next.slice(next.length - MAX_EVENTS);
}

export function serializeLog(log: readonly AnalyticsEvent[]): string {
  return JSON.stringify({ version: 1, events: log });
}

function isEntryPoint(value: unknown): value is EntryPoint {
  return typeof value === 'string' && (ENTRY_POINTS as readonly string[]).includes(value);
}

function isSection(value: unknown): value is AnalyticsSection {
  return value === 'panchang' || value === 'vrat' || value === 'jyotish';
}

function parseEvent(raw: unknown): AnalyticsEvent | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (r.name !== 'shared_screen_view') return null;
  if (typeof r.at !== 'number' || !Number.isFinite(r.at)) return null;
  if (!isEntryPoint(r.entry_point)) return null;
  if (!isSection(r.section)) return null;
  return { name: 'shared_screen_view', at: r.at, entry_point: r.entry_point, section: r.section };
}

/**
 * Parse a stored log, DROPPING any row that no longer matches the model rather
 * than failing the whole read. A diagnostic log is not user data: one unreadable
 * row from an older build must not cost the rows around it, and must never
 * surface as an error state — nothing in the app reads this to render.
 */
export function parseStoredLog(raw: string | null): readonly AnalyticsEvent[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (typeof parsed !== 'object' || parsed === null) return [];
  const events = (parsed as Record<string, unknown>).events;
  if (!Array.isArray(events)) return [];
  const out: AnalyticsEvent[] = [];
  for (const row of events) {
    const event = parseEvent(row);
    if (event) out.push(event);
  }
  // A stored log longer than the current ceiling (an older, larger MAX_EVENTS)
  // is trimmed on read, so the bound holds from the first append onwards.
  return out.length <= MAX_EVENTS ? out : out.slice(out.length - MAX_EVENTS);
}

/**
 * Count views per `entry_point` for one section, or across all of them. This is
 * the question the field was added to answer, so it lives with the model rather
 * than being re-derived by whoever reads the log.
 */
export function countByEntryPoint(
  log: readonly AnalyticsEvent[],
  section?: AnalyticsSection
): Record<EntryPoint, number> {
  const counts: Record<EntryPoint, number> = {
    tab: 0,
    segment_swipe: 0,
    notification: 0,
    deeplink: 0,
  };
  for (const event of log) {
    if (section != null && event.section !== section) continue;
    counts[event.entry_point] += 1;
  }
  return counts;
}
