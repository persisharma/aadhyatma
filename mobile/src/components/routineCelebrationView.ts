/**
 * Pure view-model for the app-wide routine-completion pushpa-varsha. Keeping the
 * "celebrate this completion?" decision out of the overlay component makes the
 * once-per-completed-set gate unit-testable without a provider tree.
 */
import type { BannerStatus } from './routineBannerView';

/**
 * A stable, order-independent signature of today's scheduled routine-item keys.
 * Two completions of the same set share a signature; adding (or removing) an
 * item changes it. This is what distinguishes "re-render while still complete"
 * (same set → don't replay) from "a new section was added and re-completed"
 * (grown set → replay).
 */
export function completionSignature(keys: string[]): string {
  return [...keys].sort().join('|');
}

/**
 * Edge-triggered gate for the pushpa-varsha. Fires only when the persisted
 * celebration record has hydrated (`ready`) AND the routine is complete AND
 * this exact completed set hasn't been celebrated yet today:
 * - first completion today (celebratedSig === null) → fire;
 * - re-render / reopen while still complete (same sig) → no fire;
 * - a new section added then re-completed (grown sig) → fire again;
 * - uncheck then recheck the same set (identical sig) → no fire.
 *
 * `ready` guards the launch race: while RoutineContext is still loading,
 * `celebratedSig` is null even though today's completion may already have been
 * celebrated. Firing on that transient null replays the shower on every launch
 * of an already-complete day. Holding until hydration finishes closes it.
 */
export function shouldCelebrateCompletion(
  status: BannerStatus,
  currentSig: string,
  celebratedSig: string | null,
  ready: boolean
): boolean {
  return ready && status === 'complete' && currentSig !== celebratedSig;
}
