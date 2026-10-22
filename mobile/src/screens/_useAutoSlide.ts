import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, AppState } from 'react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useGitaLanguage } from '@/data/gita/language';
import {
  makePageScrollCell,
  type PageScroll,
  type PageScrollRegistry,
} from '@/components/AutoSlideScrollView';
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
 * A page taller than the screen is scrolled to its bottom first: the visible part
 * holds for its share of the page's time, then the page scrolls down by
 * `SCROLL_STEP` of a screen and holds for the newly revealed share, until the
 * bottom — and only then turns. This needs the pager to render
 * `CellRendererComponent={autoSlide.Cell}` and the page to use
 * `AutoSlideScrollView`; without them a page simply holds for its whole time.
 * Touching the page pauses; letting go resumes from wherever it was left.
 *
 * The pager stays the source of truth for position: this hook only asks it to move
 * (`goToPage`) and follows `currentIndex` wherever it lands, exactly like read-aloud.
 */

export type AutoSlideControl = {
  /** False for a single page, and under a screen reader (moving focus is a defect). */
  visible: boolean;
  playing: boolean;
  speed: AutoSlideSpeed;
  /** Time to the next scroll or page turn; null while the user is holding the page. */
  countdownMs: number | null;
  /** Changes whenever a new countdown starts. */
  countdownKey: number;
  toggle: () => void;
  stop: () => void;
  cycleSpeed: () => void;
  /** The pager's `CellRendererComponent` — lets pages report their scroll view. */
  Cell: ReturnType<typeof makePageScrollCell>;
};

/** Each scroll moves this share of a screen, keeping the rest on screen for context. */
const SCROLL_STEP = 0.7;
/** No hold, however small the revealed strip, is shorter than this. */
const MIN_HOLD_MS = 1500;
/** After the user lets go of a page, wait at least this long before moving on. */
const RESUME_MS = 2000;

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
  /** List index of page 0 — a reader's `offset` for its prepended prev-chapter card. */
  listOffset?: number;
}): AutoSlideControl {
  const { sourceId, pageCount, currentIndex, pageChars, continuesPastEnd } = args;
  const { speed, handoff } = useAutoSlideStore();
  const [owner] = useState(() => nextOwner++);
  const [playing, setPlaying] = useState(false);
  // Bumped on every timed turn, so a scroll that never lands is retried rather than
  // leaving the slideshow "playing" with no timer armed.
  const [turnCount, setTurnCount] = useState(0);
  const [countdown, setCountdown] = useState<{ ms: number | null; key: number }>({ ms: null, key: 0 });

  // Mounted pages' scroll views, keyed by list index (see AutoSlideScrollView).
  const pagesRef = useRef(new Map<number, PageScroll>());
  const holdRef = useRef<(index: number, held: boolean) => void>(() => undefined);
  const [registry] = useState<PageScrollRegistry>(() => ({
    register: (index, page) => {
      pagesRef.current.set(index, page);
      return () => {
        if (pagesRef.current.get(index) === page) pagesRef.current.delete(index);
      };
    },
    hold: (index, held) => holdRef.current(index, held),
  }));
  const [Cell] = useState(() => makePageScrollCell(registry));

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
    const listIndex = currentIndex + (argsRef.current.listOffset ?? 0);
    const pageOf = () => pagesRef.current.get(listIndex);
    let timer: ReturnType<typeof setTimeout> | null = null;
    let held = false;
    let target = 0;

    const schedule = (fn: () => void, ms: number) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(fn, ms);
      setCountdown((c) => ({ ms, key: c.key + 1 }));
    };
    // The page's time is shared out by height: holding for `px` of a `content`-tall
    // page takes that fraction of it. An unmeasured page holds for all of it.
    const holdFor = (px: number) => {
      const content = pageOf()?.content ?? 0;
      if (content <= 0) return pageDurationMs;
      return Math.max(MIN_HOLD_MS, (pageDurationMs * Math.min(px, content)) / content);
    };

    const turnPage = () => {
      const { pageCount: count, goToPage, continuesPastEnd: more } = argsRef.current;
      const next = currentIndex + 1;
      if (next < count) {
        goToPage(next);
        setTurnCount((t) => t + 1);
        return;
      }
      setPlaying(false);
      if (more) {
        armAutoSlideHandoff(argsRef.current.sourceId, owner);
        goToPage(next);
      }
    };
    // Scroll on by a step, or turn once the bottom is on screen.
    const step = () => {
      const page = pageOf();
      const bottom = page ? page.content - page.viewport : 0;
      if (!page || page.viewport <= 0 || target >= bottom - 2) {
        turnPage();
        return;
      }
      const next = Math.min(target + page.viewport * SCROLL_STEP, bottom);
      const revealed = next - target;
      target = next;
      page.scrollTo(next);
      schedule(step, holdFor(revealed));
    };

    holdRef.current = (index, isHeld) => {
      if (index !== listIndex) return;
      if (isHeld) {
        held = true;
        if (timer) clearTimeout(timer);
        timer = null;
        setCountdown((c) => ({ ms: null, key: c.key + 1 }));
      } else if (held) {
        held = false;
        // Carry on from wherever the user left the page, after a moment to read it.
        const page = pageOf();
        const resumeMs = Math.max(RESUME_MS, holdFor((page?.viewport ?? 0) * SCROLL_STEP));
        schedule(() => {
          target = pageOf()?.y ?? target;
          step();
        }, resumeMs);
      }
    };

    const first = pageOf();
    target = first?.y ?? 0;
    schedule(step, first && first.viewport > 0 ? holdFor(first.viewport) : pageDurationMs);
    return () => {
      if (timer) clearTimeout(timer);
      holdRef.current = () => undefined;
    };
  }, [playing, currentIndex, pageDurationMs, turnCount, owner]);

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
    countdownMs: countdown.ms,
    countdownKey: countdown.key,
    toggle,
    stop,
    cycleSpeed,
    Cell,
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
    listOffset: offset,
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
