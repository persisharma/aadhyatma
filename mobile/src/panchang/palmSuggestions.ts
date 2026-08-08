/**
 * Palm-line suggestion seam for the Hast Rekha camera guide.
 *
 * The camera flow (HastRekhaCameraScreen) calls the active provider with the
 * captured photo's local URI. A provider may pre-fill some or all of the four
 * line-form choices; the user always confirms every line before a reading is
 * produced — a suggestion is an assist, never a verdict (design.md §55).
 *
 * Contract for any future implementation (e.g. an on-device TFLite / MediaPipe
 * hand-landmark model):
 *  - MUST run entirely on this device. No network, ever — the photo is
 *    personal data and the Jyotish contract forbids remote analysis.
 *  - MUST NOT persist the photo or any derived image. Read the URI, return.
 *  - Return null (or omit fields) whenever unsure; the manual picker is the
 *    source of truth and the flow works fully with no suggestions at all.
 *
 * v1 ships the null provider: the camera guide is framing + confirmation only.
 */

import type { PalmProfile } from './hastRekha';

export type PalmSuggestions = Partial<PalmProfile>;

export type PalmSuggestionProvider = (
  photoUri: string
) => Promise<PalmSuggestions | null>;

export const noPalmSuggestions: PalmSuggestionProvider = async () => null;

/** The provider the camera flow uses. Swap here when a real model lands. */
export const palmSuggestionProvider: PalmSuggestionProvider = noPalmSuggestions;
