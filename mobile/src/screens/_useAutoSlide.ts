import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, AppState } from 'react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useGitaLanguage } from '@/data/gita/language';
import { buildVerseScript } from '@/readAloud/verseScript';
import { toReadableVerse } from '@/readAloud/verseAdapter';
import {
  AUTO_SLIDE_SPEEDS,
  armAutoSlideHandoff,
  autoSlideDurationMs,
  setAutoSlideSpeed,
  takeAutoSlideHandoff,
  useAutoSlideStore,
  type AutoSlideSpeed,
} from '@/utils/autoSlideStore';
import {
  MAX_UTTERANCE_CHARS,
  useReaderReadAloud,
  type ReadAloudControl,
  type ReaderPagerArgs,
} from './_useReaderReadAloud';

/**
 * Auto-slide (स्वतः): turns a paged reader's pages on a timer so the reader can be
 * followed hands-free. Each page holds for its own reading time (see
 * `autoSlideDurationMs`), a manual swipe restarts the countdown on the page swiped
 * to, and the screen is kept awake while it runs.
 *
 * The pager stays the source of truth for position: this hook only asks it to move
 * (`goToPage`) and follows `currentIndex` wherever it lands, exactly like read-aloud.
 */

export type AutoSlideControl = {
  /** False for a single page, and under a screen reader (moving focus is a defect). */
  visible: boolean;
  playing: boolean;
  speed: AutoSlideSpeed;
  /** How long the current page holds; the button's countdown runs over this. */
  pageDurationMs: number;
  /** Changes whenever the countdown restarts. */
  cycleKey: string;
  toggle: () => void;
  stop: () => void;
  cycleSpeed: () => void;
};

let nextOwner = 1;

export function useAutoSlide(args: {
  sourceId: string;
  /** Pages in page-space (verse-space for readers). */
  pageCount: number;
  currentIndex: number;
  /** Characters on page `index`, for pacing. */
  pageChars: (index: number) => number;
  /** Move the pager to `index` (page-space). `pageCount` itself is the trailing card. */
  goToPage: (index: number) => void;
  /**
   * True when a card follows the last page (a next-chapter transition, the Vidhi
   * completion page). The slideshow moves onto it and hands off to the next screen
   * instance, if one mounts with the same `sourceId`.
   */
  continuesPastEnd: boolean;
  /** Called just before playback starts — used to silence read-aloud. */
  onStart?: () => void;
}): AutoSlideControl {
  const { sourceId, pageCount, currentIndex, pageChars, continuesPastEnd } = args;
  const { speed, handoff } = useAutoSlideStore();
  const [owner] = useState(() => nextOwner++);
  const [playing, setPlaying] = useState(false);
  // Bumped on every timed turn, so a scroll that never lands is retried rather than
  // leaving the slideshow "playing" with no timer armed.
  const [turn, setTurn] = useState(0);

  const argsRef = useRef(args);
  argsRef.current = args;
  const playingRef = useRef(playing);
  playingRef.current = playing;

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

  const visible = pageCount + (continuesPastEnd ? 1 : 0) > 1 && !screenReaderOn;

  useEffect(() => {
    if (!visible) setPlaying(false);
  }, [visible]);

  const pageDurationMs = useMemo(
    () => autoSlideDurationMs(pageChars(currentIndex), speed),
    [pageChars, currentIndex, speed]
  );

  useEffect(() => {
    if (!playing) return undefined;
    const timer = setTimeout(() => {
      const { pageCount: count, goToPage, continuesPastEnd: more } = argsRef.current;
      const next = currentIndex + 1;
      if (next < count) {
        goToPage(next);
        setTurn((t) => t + 1);
        return;
      }
      setPlaying(false);
      if (more) {
        armAutoSlideHandoff(argsRef.current.sourceId, owner);
        goToPage(next);
      }
    }, pageDurationMs);
    return () => clearTimeout(timer);
  }, [playing, currentIndex, pageDurationMs, turn, owner]);

  // A chapter reader's replacement instance picks up where the previous one left off.
  useEffect(() => {
    if (!handoff || playing || !visible) return;
    if (takeAutoSlideHandoff(sourceId, owner)) {
      argsRef.current.onStart?.();
      setPlaying(true);
    }
  }, [handoff, playing, visible, sourceId, owner]);

  // A manual swipe onto the next-chapter card while playing also carries over.
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;
  useEffect(() => {
    return () => {
      const a = argsRef.current;
      if (playingRef.current && a.continuesPastEnd && currentIndexRef.current >= a.pageCount - 1) {
        armAutoSlideHandoff(a.sourceId, owner);
      }
    };
  }, [owner]);

  useEffect(() => {
    if (!playing) return undefined;
    const tag = `auto-slide-${owner}`;
    activateKeepAwakeAsync(tag).catch(() => undefined);
    return () => {
      deactivateKeepAwake(tag).catch(() => undefined);
    };
  }, [playing, owner]);

  useEffect(() => {
    if (!playing) return undefined;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') setPlaying(false);
    });
    return () => sub.remove();
  }, [playing]);

  const toggle = useCallback(() => {
    if (playingRef.current) {
      setPlaying(false);
      return;
    }
    const a = argsRef.current;
    // Pressing play on the final page starts the slideshow over from the top.
    if (a.currentIndex >= a.pageCount - (a.continuesPastEnd ? 0 : 1)) a.goToPage(0);
    a.onStart?.();
    setPlaying(true);
  }, []);

  const stop = useCallback(() => setPlaying(false), []);

  const cycleSpeed = useCallback(() => {
    const i = AUTO_SLIDE_SPEEDS.indexOf(speed);
    setAutoSlideSpeed(AUTO_SLIDE_SPEEDS[(i + 1) % AUTO_SLIDE_SPEEDS.length]);
  }, [speed]);

  return {
    visible,
    playing,
    speed,
    pageDurationMs,
    cycleKey: `${currentIndex}:${turn}:${pageDurationMs}`,
    toggle,
    stop,
    cycleSpeed,
  };
}

/**
 * Both hands-free controls for a paged reader, from the paging state it already
 * has. Read-aloud and auto-slide each turn the page, so only one runs at a time:
 * starting either stops the other.
 */
export function useReaderPlayback<T>(args: ReaderPagerArgs<T>): {
  readAloud: ReadAloudControl;
  autoSlide: AutoSlideControl;
} {
  const readAloud = useReaderReadAloud(args);
  const { sourceId, data, offset, verseCount, currentIndex, listRef } = args;
  const { lang } = useGitaLanguage();

  // Paced on what the page shows: verse lines, meaning and commentary in the
  // reading language — the same text read-aloud would speak with everything on.
  const pageChars = useCallback(
    (index: number) =>
      buildVerseScript(toReadableVerse(data[index + offset]), lang, {
        readMeaning: true,
        readCommentary: true,
        maxChars: MAX_UTTERANCE_CHARS,
      }).reduce((n, chunk) => n + chunk.text.length, 0),
    [data, offset, lang]
  );

  const goToPage = useCallback(
    (index: number) => {
      const target = index + offset;
      if (target < 0 || target >= data.length) return;
      listRef.current?.scrollToIndex({ index: target, animated: true });
    },
    [data.length, offset, listRef]
  );

  const readAloudRef = useRef(readAloud);
  readAloudRef.current = readAloud;
  const autoSlide = useAutoSlide({
    sourceId,
    pageCount: verseCount,
    currentIndex,
    pageChars,
    goToPage,
    continuesPastEnd: data.length > offset + verseCount,
    onStart: () => {
      const r = readAloudRef.current;
      if (r.isSpeaking || r.isPaused) r.stop();
    },
  });

  const stopSlideRef = useRef(autoSlide.stop);
  stopSlideRef.current = autoSlide.stop;
  useEffect(() => {
    if (readAloud.isSpeaking) stopSlideRef.current();
  }, [readAloud.isSpeaking]);

  return { readAloud, autoSlide };
}
