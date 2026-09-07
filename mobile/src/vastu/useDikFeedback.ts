/**
 * Felt & announced sector change (PRD-24 Phase 2 §A4/US-04): one haptic tick
 * and one VoiceOver announcement when the faced dik changes — throttled so a
 * sweep across the dial can never become a rattle (≤1 haptic per 400 ms) or a
 * metronome (≤1 announcement per 1.5 s). Fully silent when `active` is false
 * (manual mode, Hold) — a frozen dial saying nothing is the contract.
 */
import { useEffect, useRef } from 'react';
import { AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';

import type { Lang } from '@/data/gita/language';
import { DISHA_LABELS, type DishaDirection } from '@/panchang/eventMuhurat';
import { contentByLang } from '@/utils/localize';

export const HAPTIC_MIN_GAP_MS = 400;
export const ANNOUNCE_MIN_GAP_MS = 1500;

export function useDikFeedback(facingDik: DishaDirection | null, active: boolean, lang: Lang): void {
  const lastDik = useRef<DishaDirection | null>(null);
  const lastHapticAt = useRef(0);
  const lastAnnounceAt = useRef(0);

  useEffect(() => {
    if (!active) {
      // Re-arming from silence must not fire for the dik we froze on.
      lastDik.current = facingDik;
      return;
    }
    if (facingDik == null || facingDik === lastDik.current) return;
    if (lastDik.current == null) {
      // First acquisition is the dial settling, not the user turning.
      lastDik.current = facingDik;
      return;
    }
    lastDik.current = facingDik;

    const now = Date.now();
    if (now - lastHapticAt.current >= HAPTIC_MIN_GAP_MS) {
      lastHapticAt.current = now;
      Haptics.selectionAsync().catch(() => undefined);
    }
    if (now - lastAnnounceAt.current >= ANNOUNCE_MIN_GAP_MS) {
      lastAnnounceAt.current = now;
      AccessibilityInfo.announceForAccessibility(
        contentByLang(lang, DISHA_LABELS[facingDik].hi, DISHA_LABELS[facingDik].en)
      );
    }
  }, [facingDik, active, lang]);
}
