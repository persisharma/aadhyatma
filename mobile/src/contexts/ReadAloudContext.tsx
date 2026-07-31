import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { useGitaLanguage } from '@/data/gita/language';
import { ensureBackgroundAudioMode } from '@/audio/audioSession';
import { claimPlayback, registerStopper } from '@/audio/playbackArbiter';
import type { SpeechTarget } from '@/readAloud/prefs';
import {
  resolveVoice,
  speakOptionsFor,
  speechLangFor,
  voicesForTarget,
  type ProbedVoice,
  type VoiceAvailability,
} from '@/readAloud/voices';
import type { ReadAloudChunk } from '@/readAloud/verseScript';
import { useReadAloudPrefs } from './ReadAloudPrefsContext';

/**
 * The read-aloud speaking controller.
 *
 * Deliberately NOT part of `AudioPlayerContext`: TTS has no duration, no seek, no
 * loop and no artwork, so unioning the two would push dead branches through
 * MiniPlayer and NowPlaying. Mutual exclusion is handled by `playbackArbiter`
 * instead, which keeps both contexts' public shapes unchanged.
 *
 * The hook is LENIENT (a default value, not a throw) because every reader consumes
 * it. A strict hook would force a provider into all 20 reader test suites for no
 * behavioural gain; the default reports `available: false`, so the control renders
 * nothing. `readerReadAloud.test.tsx` is the net that proves the real provider is wired.
 */

/** How long to wait for `onStart` before deciding the engine is lying about a voice. */
const START_WATCHDOG_MS = 3000;
/** Android's TTS engine can take seconds to bind on first use. */
const PROBE_TIMEOUT_MS = 4000;

export type ReadAloudStatus = 'idle' | 'speaking' | 'paused';

/**
 * What a reader hands the controller so it can drive the page. The reader owns the
 * FlatList, so it owns scrolling; the controller only asks.
 */
export type ReadAloudSession = {
  sourceId: string;
  totalPages: number;
  /** Chunks for a page in verse-space. `null` means "not a verse page" (a chapter sentinel). */
  chunksFor: (pageIndex: number) => ReadAloudChunk[] | null;
  scrollToPage: (pageIndex: number) => void;
};

type ReadAloudContextValue = {
  /** A usable voice exists for the current reading language. */
  available: boolean;
  availability: VoiceAvailability;
  status: ReadAloudStatus;
  /** `sourceId` of the reader currently speaking, so other readers stay idle. */
  activeSourceId: string | null;
  /** Page currently being spoken, in verse-space. */
  activePage: number | null;
  /** The voice locale the current reading language speaks in (gu/kn → 'hi'). */
  target: SpeechTarget;
  /** Installed voices for `target`, best-first — the settings sheet's candidates. */
  candidateVoices: ProbedVoice[];
  start: (session: ReadAloudSession, pageIndex: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  /** Speaks one line so the user can judge a voice in the settings sheet. */
  speakPreview: (text: string) => void;
  /** Re-probe after the user installs voice data. */
  refreshVoices: () => void;
};

const DISABLED_DEFAULT: ReadAloudContextValue = {
  available: false,
  availability: 'unknown',
  status: 'idle',
  activeSourceId: null,
  activePage: null,
  target: 'hi',
  candidateVoices: [],
  start: () => {},
  pause: () => {},
  resume: () => {},
  stop: () => {},
  speakPreview: () => {},
  refreshVoices: () => {},
};

const ReadAloudContext = createContext<ReadAloudContextValue>(DISABLED_DEFAULT);

const nativePlatform = (): 'ios' | 'android' => (Platform.OS === 'android' ? 'android' : 'ios');

export function ReadAloudProvider({ children }: { children: React.ReactNode }) {
  const { lang } = useGitaLanguage();
  const { prefs } = useReadAloudPrefs();

  const [status, setStatus] = useState<ReadAloudStatus>('idle');
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<number | null>(null);
  const [voices, setVoices] = useState<ProbedVoice[] | null>(null);
  const [probeFailed, setProbeFailed] = useState(false);

  const target = speechLangFor(lang);

  // Live prefs for the speak loop, so a rate change mid-session does not have to
  // re-create the loop's callbacks.
  const prefsRef = useRef(prefs);
  useEffect(() => {
    prefsRef.current = prefs;
  }, [prefs]);

  // A monotonic token invalidates every in-flight callback from a previous session.
  // Without it, a chapter transition (navigation.replace 400ms after the sentinel)
  // can let the outgoing screen's `onDone` start a second session.
  const tokenRef = useRef(0);
  const sessionRef = useRef<ReadAloudSession | null>(null);
  const chunksRef = useRef<ReadAloudChunk[]>([]);
  const chunkIndexRef = useRef(0);
  const pageRef = useRef(0);
  const pausedRef = useRef(false);
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    ensureBackgroundAudioMode();
  }, []);

  const clearWatchdog = useCallback(() => {
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  }, []);

  /** Ends the session and silences the engine. Safe to call from anywhere. */
  const stop = useCallback(() => {
    tokenRef.current += 1;
    clearWatchdog();
    pausedRef.current = false;
    sessionRef.current = null;
    chunksRef.current = [];
    chunkIndexRef.current = 0;
    Speech.stop().catch(() => undefined);
    setStatus('idle');
    setActiveSourceId(null);
    setActivePage(null);
  }, [clearWatchdog]);

  // ---- voice probe -------------------------------------------------------------

  // Guards every post-probe setState, so a provider unmounted mid-probe (or a test
  // that finishes first) never updates a dead component.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const probeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const probe = useCallback(() => {
    if (probeTimerRef.current) clearTimeout(probeTimerRef.current);

    // Android's TTS engine can take seconds to bind, and `getVoices` waits on that
    // binding — so the probe is raced against a timeout rather than awaited.
    const timeout = new Promise<ProbedVoice[] | null>((resolve) => {
      probeTimerRef.current = setTimeout(() => {
        probeTimerRef.current = null;
        resolve(null);
      }, PROBE_TIMEOUT_MS);
    });

    Promise.race([
      Speech.getAvailableVoicesAsync().then((list) =>
        list.map((v) => ({
          identifier: v.identifier,
          name: v.name,
          quality: String(v.quality),
          language: v.language,
        }))
      ),
      timeout,
    ])
      .then((list) => {
        // The loser of the race is now irrelevant — drop its pending timer so it
        // neither leaks nor fires a setState after the fact.
        if (probeTimerRef.current) {
          clearTimeout(probeTimerRef.current);
          probeTimerRef.current = null;
        }
        if (!mountedRef.current) return;
        // A timeout leaves availability 'unknown', so the control stays pressable
        // and the next press retries rather than claiming "no voice".
        if (list !== null) setVoices(list);
        setProbeFailed(false);
      })
      .catch(() => {
        if (probeTimerRef.current) {
          clearTimeout(probeTimerRef.current);
          probeTimerRef.current = null;
        }
        if (mountedRef.current) setProbeFailed(true);
      });
  }, []);

  useEffect(() => {
    probe();
    return () => {
      if (probeTimerRef.current) {
        clearTimeout(probeTimerRef.current);
        probeTimerRef.current = null;
      }
    };
  }, [probe]);

  const availability = useMemo<VoiceAvailability>(() => {
    if (probeFailed) return 'unavailable';
    if (voices === null) return 'unknown';
    return resolveVoice(target, voices) ? 'ready' : 'unavailable';
  }, [voices, target, probeFailed]);

  // The user may leave to install voice data; re-probe when they come back.
  useEffect(() => {
    if (availability !== 'unavailable') return undefined;
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') probe();
    });
    return () => sub.remove();
  }, [availability, probe]);

  // Speech has no lock-screen surface, and auto-advancing pages the user cannot see
  // is worse than silence — so background means stop, not pause.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') stop();
    });
    return () => sub.remove();
  }, [stop]);

  // Let recorded audio / japam silence read-aloud when they start.
  useEffect(() => registerStopper('tts', stop), [stop]);

  // ---- the chunk loop ---------------------------------------------------------

  const currentVoice = useMemo(
    () => (voices ? resolveVoice(target, voices, prefs.voiceByTarget[target]) : null),
    [voices, target, prefs.voiceByTarget]
  );
  const voiceRef = useRef(currentVoice);
  useEffect(() => {
    voiceRef.current = currentVoice;
  }, [currentVoice]);

  const speakChunkRef = useRef<(token: number, index: number) => void>(() => {});
  const advancePageRef = useRef<(token: number, from: number) => void>(() => {});

  const speakChunk = useCallback(
    (token: number, index: number) => {
      if (token !== tokenRef.current) return;
      const chunks = chunksRef.current;
      if (index >= chunks.length) {
        advancePageRef.current(token, pageRef.current);
        return;
      }

      chunkIndexRef.current = index;

      // Both platforms fall back to the device default voice for an unavailable
      // language WITHOUT firing onError, so silence is the only symptom. If onStart
      // never arrives, treat the engine as lying and surface the unavailable state.
      clearWatchdog();
      watchdogRef.current = setTimeout(() => {
        watchdogRef.current = null;
        if (token !== tokenRef.current) return;
        setProbeFailed(true);
        stop();
      }, START_WATCHDOG_MS);

      Speech.speak(chunks[index].text, {
        ...speakOptionsFor(target, voiceRef.current, prefsRef.current.rate, nativePlatform()),
        onStart: () => clearWatchdog(),
        onDone: () => {
          if (token !== tokenRef.current) return;
          // pause() stops the engine, which can surface as onDone on some engines —
          // never advance while paused.
          if (pausedRef.current) return;
          speakChunkRef.current(token, index + 1);
        },
        onError: () => {
          if (token !== tokenRef.current) return;
          clearWatchdog();
          stop();
        },
      });
    },
    [clearWatchdog, stop, target]
  );
  speakChunkRef.current = speakChunk;

  /**
   * Finds the next page worth speaking. A `null` from `chunksFor` is a chapter
   * sentinel — v1 stops there rather than reading across the boundary, because the
   * reader is about to `navigation.replace()`. An empty array is a page with no text
   * (e.g. a stotram intro), which is skipped rather than stalled on.
   */
  const advancePage = useCallback(
    (token: number, from: number) => {
      if (token !== tokenRef.current) return;
      const session = sessionRef.current;
      if (!session) return;

      for (let page = from + 1; page < session.totalPages; page += 1) {
        const chunks = session.chunksFor(page);
        if (chunks === null) break; // chapter boundary
        if (chunks.length === 0) continue; // nothing to say here
        pageRef.current = page;
        chunksRef.current = chunks;
        setActivePage(page);
        session.scrollToPage(page);
        speakChunkRef.current(token, 0);
        return;
      }
      stop();
    },
    [stop]
  );
  advancePageRef.current = advancePage;

  // ---- public API -------------------------------------------------------------

  const start = useCallback(
    (session: ReadAloudSession, pageIndex: number) => {
      const chunks = session.chunksFor(pageIndex);
      if (chunks === null) return;

      claimPlayback('tts');
      // Bump the token first so any in-flight callback from a prior session dies.
      tokenRef.current += 1;
      const token = tokenRef.current;
      clearWatchdog();
      pausedRef.current = false;
      sessionRef.current = session;
      pageRef.current = pageIndex;
      chunksRef.current = chunks;
      chunkIndexRef.current = 0;
      setActiveSourceId(session.sourceId);
      setActivePage(pageIndex);
      setStatus('speaking');

      Speech.stop()
        .catch(() => undefined)
        .finally(() => {
          if (token !== tokenRef.current) return;
          // An empty starting page should move on, not stall.
          if (chunks.length === 0) advancePageRef.current(token, pageIndex);
          else speakChunkRef.current(token, 0);
        });
    },
    [clearWatchdog]
  );

  /**
   * Android's native module has no `pause`/`resume` at all, so pause is built from
   * the chunk loop on BOTH platforms: stop the engine, remember the chunk, re-speak
   * it on resume. Granularity is one verse line — which is also where a reciter
   * would resume. Using iOS's real `pauseSpeaking` would give word-level resume on
   * one platform only and desynchronise this bookkeeping.
   */
  const pause = useCallback(() => {
    if (!sessionRef.current) return;
    pausedRef.current = true;
    clearWatchdog();
    Speech.stop().catch(() => undefined);
    setStatus('paused');
  }, [clearWatchdog]);

  const resume = useCallback(() => {
    if (!sessionRef.current || !pausedRef.current) return;
    pausedRef.current = false;
    setStatus('speaking');
    tokenRef.current += 1;
    speakChunkRef.current(tokenRef.current, chunkIndexRef.current);
  }, []);

  const speakPreview = useCallback(
    (text: string) => {
      claimPlayback('tts');
      tokenRef.current += 1;
      clearWatchdog();
      pausedRef.current = false;
      sessionRef.current = null;
      chunksRef.current = [];
      setStatus('idle');
      setActiveSourceId(null);
      setActivePage(null);
      Speech.stop()
        .catch(() => undefined)
        .finally(() => {
          Speech.speak(
            text,
            speakOptionsFor(target, voiceRef.current, prefsRef.current.rate, nativePlatform())
          );
        });
    },
    [clearWatchdog, target]
  );

  const refreshVoices = useCallback(() => {
    setProbeFailed(false);
    probe();
  }, [probe]);

  // Stop speaking when the provider unmounts (app exit).
  useEffect(() => () => stop(), [stop]);

  const value = useMemo<ReadAloudContextValue>(
    () => ({
      available: availability === 'ready' || availability === 'unknown',
      availability,
      status,
      activeSourceId,
      activePage,
      target,
      candidateVoices: voices ? voicesForTarget(target, voices) : [],
      start,
      pause,
      resume,
      stop,
      speakPreview,
      refreshVoices,
    }),
    [
      availability,
      status,
      activeSourceId,
      activePage,
      target,
      voices,
      start,
      pause,
      resume,
      stop,
      speakPreview,
      refreshVoices,
    ]
  );

  return <ReadAloudContext.Provider value={value}>{children}</ReadAloudContext.Provider>;
}

export function useReadAloud(): ReadAloudContextValue {
  return useContext(ReadAloudContext);
}

export { START_WATCHDOG_MS, PROBE_TIMEOUT_MS };
