import { createContext, useContext } from 'react';
import type { RatingAskTrigger } from '@/data/ratingPrompt';

/**
 * The light half of the rating prompt: just the "a good moment happened" hook.
 *
 * Kept in its own module, deliberately free of React Native, expo or storage
 * imports, so the surfaces that REPORT a moment (celebration overlay, japam
 * counter, share flow) can import it without dragging in
 * `RatingPromptContext` → `NotificationPreferencesContext` → `expo-notifications`.
 * Those surfaces have unit tests of their own that mount them standalone; the
 * heavy chain would break every one of them for the sake of a one-line call.
 *
 * `RatingPromptProvider` supplies the value; everywhere else reads it.
 */
export type RequestRatingAsk = (trigger: RatingAskTrigger) => void;

export const RatingAskContext = createContext<RequestRatingAsk | null>(null);

const NOOP_REQUEST_ASK: RequestRatingAsk = () => undefined;

/**
 * Never throws outside the provider: a rating nudge is never a reason for a
 * reader or counter to fail to mount, and the moment simply goes unreported.
 */
export function useRatingAsk(): RequestRatingAsk {
  return useContext(RatingAskContext) ?? NOOP_REQUEST_ASK;
}
