import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, type FlatList } from 'react-native';
import * as Speech from 'expo-speech';
import { useGitaLanguage } from '@/data/gita/language';
import { useReadAloud, type ReadAloudSession } from '@/contexts/ReadAloudContext';
import { useReadAloudPrefs } from '@/contexts/ReadAloudPrefsContext';
import { buildVerseScript } from '@/readAloud/verseScript';
import { toReadableVerse } from '@/readAloud/verseAdapter';

/**
 * Wires a reader's paged FlatList to the read-aloud controller.
 *
 * Reader screens are near-identical copies of one paging pattern, so this hook exists
 * to keep the wiring out of them: they pass the state they already have and render the
 * returned control in `ReaderHeader`'s `right` slot. RULEBOOK §3 — never call
 * `Speech.speak` from a screen.
 */

/** Utterances never exceed this, well under Android's ~4000-char `speak()` throw. */
const MAX_UTTERANCE_CHARS = 1000;
/** A flick across several pages should start one session, not one per page. */
const SWIPE_DEBOUNCE_MS = 250;
/**
 * `onScrollToIndexFailed` is a no-op in every reader, so a failed auto-advance would
 * leave the controller speaking a page the user cannot see. If `currentIndex` has not
 * caught up by now, end the session instead.
 */
const SCROLL_SETTLE_MS = 600;

export type ReadAloudControl = {
  /**
   * Whether to render the control at all. False without a provider (the lenient
   * default) and false under a screen reader — TalkBack/VoiceOver already read each
   * page's `accessibilityLabel`, and two voices at once is a defect, not a feature.
   * Note this stays TRUE when no voice is installed: the control renders muted so
   * the user can find out why, rather than silently vanishing.
   */
  visible: boolean;
  /** True when the probe found no usable voice; the control shows a muted state. */
  unavailable: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  /** Play / pause / resume, depending on current state. */
  toggle: () => void;
  stop: () => void;
};

export function useReaderReadAloud<T>(args: {
  sourceId: string;
  /** FlatList data, sentinels included. */
  data: readonly T[];
  /** List-index offset for a prepended prev-chapter card: the reader's own `offset`. */
  offset: number;
  /** Number of real verses (list length minus any transition cards). */
  verseCount: number;
  /** Current page in verse-space. */
  currentIndex: number;
  listRef: React.RefObject<FlatList<T> | null>;
}): ReadAloudControl {
  const { sourceId, data, offset, verseCount, currentIndex, listRef } = args;
  const { lang } = useGitaLanguage();
  const { prefs } = useReadAloudPrefs();
  const readAloud = useReadAloud();

  const maxChars = useMemo(
    () => Math.min(Speech.maxSpeechInputLength || MAX_UTTERANCE_CHARS, MAX_UTTERANCE_CHARS),
    []
  );

  // Everything the session closure reads is mirrored, so the session object stays
  // stable while the reader re-renders on every page change.
  const dataRef = useRef(data);
  dataRef.current = data;
  const offsetRef = useRef(offset);
  offsetRef.current = offset;
  const verseCountRef = useRef(verseCount);
  verseCountRef.current = verseCount;
  const langRef = useRef(lang);
  langRef.current = lang;
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

  /** Page the controller asked for, cleared once `currentIndex` arrives there. */
  const pendingAutoPageRef = useRef<number | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swipeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A screen reader is already speaking the page; suppress our control entirely.
  const [screenReaderOn, setScreenReaderOn] = useState(false);
  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isScreenReaderEnabled()
      .then((on) => {
        if (!cancelled) setScreenReaderOn(on);
      })
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', (on) =>
      setScreenReaderOn(Boolean(on))
    );
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  const isActive = readAloud.activeSourceId === sourceId;
  const isSpeaking = isActive && readAloud.status === 'speaking';
  const isPaused = isActive && readAloud.status === 'paused';

  const clearTimers = useCallback(() => {
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
    if (swipeTimerRef.current) {
      clearTimeout(swipeTimerRef.current);
      swipeTimerRef.current = null;
    }
  }, []);

  const stopRef = useRef(readAloud.stop);
  stopRef.current = readAloud.stop;

  const session = useMemo<ReadAloudSession>(
    () => ({
      sourceId,
      totalPages: verseCountRef.current,
      chunksFor: (pageIndex: number) => {
        const item = dataRef.current[pageIndex + offsetRef.current];
        const readable = toReadableVerse(item);
        // `null` here is the chapter-transition sentinel — the controller stops
        // rather than reading across a chapter boundary.
        if (!readable) return null;
        return buildVerseScript(readable, langRef.current, {
          readMeaning: prefsRef.current.readMeaning,
          readCommentary: prefsRef.current.readCommentary,
          maxChars,
        });
      },
      scrollToPage: (pageIndex: number) => {
        pendingAutoPageRef.current = pageIndex;
        listRef.current?.scrollToIndex({
          index: pageIndex + offsetRef.current,
          animated: true,
        });
        if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
        settleTimerRef.current = setTimeout(() => {
          settleTimerRef.current = null;
          // The scroll never landed (onScrollToIndexFailed is a no-op everywhere).
          if (pendingAutoPageRef.current === pageIndex) {
            pendingAutoPageRef.current = null;
            stopRef.current();
          }
        }, SCROLL_SETTLE_MS);
      },
    }),
    [sourceId, maxChars, listRef]
  );

  // `totalPages` is read once when the session is built, so refresh it if the reader's
  // verse count changes (a chaptered reader replacing its chapter in place).
  session.totalPages = verseCount;

  // A manual swipe RE-TARGETS the session rather than stopping it: the user wants to
  // hear the page they just moved to. The pending-page latch is what distinguishes a
  // user swipe from the controller's own auto-advance, whose scroll also fires
  // onViewableItemsChanged/handleScroll and would otherwise look identical.
  useEffect(() => {
    if (!isSpeaking) return undefined;

    if (pendingAutoPageRef.current !== null) {
      if (pendingAutoPageRef.current === currentIndex) {
        pendingAutoPageRef.current = null;
        if (settleTimerRef.current) {
          clearTimeout(settleTimerRef.current);
          settleTimerRef.current = null;
        }
      }
      return undefined;
    }

    if (readAloud.activePage === currentIndex) return undefined;

    if (swipeTimerRef.current) clearTimeout(swipeTimerRef.current);
    swipeTimerRef.current = setTimeout(() => {
      swipeTimerRef.current = null;
      readAloud.start(session, currentIndex);
    }, SWIPE_DEBOUNCE_MS);

    return () => {
      if (swipeTimerRef.current) {
        clearTimeout(swipeTimerRef.current);
        swipeTimerRef.current = null;
      }
    };
  }, [currentIndex, isSpeaking, readAloud, session]);

  // Leaving the reader, or switching which text it shows, ends the session.
  useEffect(() => {
    return () => {
      clearTimers();
      if (readAloud.activeSourceId === sourceId) stopRef.current();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceId]);

  const toggle = useCallback(() => {
    if (isSpeaking) {
      readAloud.pause();
      return;
    }
    if (isPaused) {
      readAloud.resume();
      return;
    }
    clearTimers();
    pendingAutoPageRef.current = null;
    readAloud.start(session, currentIndex);
  }, [isSpeaking, isPaused, readAloud, session, currentIndex, clearTimers]);

  const stop = useCallback(() => {
    clearTimers();
    readAloud.stop();
  }, [readAloud, clearTimers]);

  const hasVoiceState = readAloud.available || readAloud.availability === 'unavailable';

  return {
    visible: hasVoiceState && !screenReaderOn,
    unavailable: readAloud.availability === 'unavailable',
    isSpeaking,
    isPaused,
    toggle,
    stop,
  };
}

export { MAX_UTTERANCE_CHARS, SWIPE_DEBOUNCE_MS, SCROLL_SETTLE_MS };
