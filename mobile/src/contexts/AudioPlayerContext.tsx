import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer, type AudioPlayer, type AudioStatus } from 'expo-audio';
import { ensureBackgroundAudioMode } from '@/audio/audioSession';
import { claimPlayback, registerStopper } from '@/audio/playbackArbiter';
import { AUDIO_TRACKS, type AudioTrack } from '@/data/audio/tracks';
import { audioRemoteRequest, hasRealAudio } from '@assets/audio-library';
import { cachedAssetUri, cachedFileUri } from '@/utils/assetCache';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';

// Only tracks with a real recording participate in playback / skip.
const PLAYABLE_TRACKS = AUDIO_TRACKS.filter((t) => hasRealAudio(t.id));

/**
 * App-wide media player. Unlike `JapamAudioPlayer` (component-scoped, pauses on
 * unmount), this owns ONE `AudioPlayer` for the whole app session via the
 * imperative `createAudioPlayer`, so playback continues across navigation and a
 * mini-player can reflect it from anywhere.
 *
 * The full now-playing surface is an overlay (not a navigation screen): tapping
 * the mini-player flips `nowPlayingOpen`, so it works above any tab/stack
 * without per-stack route plumbing.
 */
const MIN_RATE = 0.5;
const MAX_RATE = 1.5;
const SKIP_SECONDS = 15;
// How close to the reported duration counts as "the track ended". The status
// tick is 500 ms and the final position often lands a hair short of duration,
// so an exact compare would miss the ending on some platforms.
const END_EPSILON_SEC = 0.35;
// A tapped track that has not reported loaded this long after the tap is
// treated as failed (offline, or the CDN is down): the spinner gives way to a
// message and a retry. A source that loads later still starts, and clears it.
const LOAD_STALL_MS = 15000;
const PREFS_KEY = '@vedansh/audio-prefs';

/** Why the current track is not playing, for the strip/now-playing to explain. */
export type PlaybackNotice = 'noAudio' | 'loadFailed';

type AudioPlayerContextValue = {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  isLoaded: boolean;
  /** True while a tapped track is buffering before it can play. */
  isBuffering: boolean;
  /** Set when the track has no audio yet, or never finished loading (see `retryPlayback`). */
  playbackNotice: PlaybackNotice | null;
  /** Track duration in seconds (falls back to the catalog's nominal length). */
  durationSec: number;
  rate: number;
  isLooping: boolean;
  nowPlayingOpen: boolean;
  /** Load (if needed) and play a track, surfacing the mini-player. */
  playTrack: (track: AudioTrack) => void;
  /** Warm a track's on-device cache ahead of a tap, so playback starts instantly. */
  prefetchTrack: (track: AudioTrack) => void;
  togglePlay: () => void;
  seekTo: (seconds: number) => void;
  skipBy: (seconds: number) => void;
  skipToNext: () => void;
  skipToPrevious: () => void;
  setRate: (rate: number) => void;
  toggleLoop: () => void;
  stop: () => void;
  openNowPlaying: () => void;
  closeNowPlaying: () => void;
  /** Reload the current track after a `loadFailed` notice. */
  retryPlayback: () => void;
};

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);
// Position ticks at 2 Hz while playing. It lives in its own context so that only
// the surfaces that draw progress re-render on each tick; everything else reads
// the stable value above.
const AudioPositionContext = createContext(0);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  // One player for the whole session, created on FIRST USE, never at launch.
  // On Android the native constructor builds ExoPlayer on the main thread (the
  // JS thread blocks on it) and immediately emits a status event from main —
  // the `JSTypeConverter` frame in Play's launch ANR clusters
  // (docs/engineering/android-anr-audit-2026-11.md §6). Most sessions never
  // play recorded audio, so they never pay for it.
  const [player, setPlayer] = useState<AudioPlayer | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);
  const loopRef = useRef(false);
  const statusRef = useRef<AudioStatus | null>(null);
  const statusSubRef = useRef<{ remove: () => void } | null>(null);
  const ensurePlayer = useCallback((): AudioPlayer => {
    if (playerRef.current) return playerRef.current;
    void ensureBackgroundAudioMode();
    const created = createAudioPlayer(null, { updateInterval: 500 });
    // Mirror native playback state into React. Subscribed HERE, synchronously,
    // not in an effect: the caller replaces the source immediately, and a
    // cached file can report loaded before an effect would have subscribed —
    // a lost `isLoaded` leaves the loaded-gate armed and the track never starts.
    statusSubRef.current = created.addListener('playbackStatusUpdate', (s) => {
      statusRef.current = s;
      setStatus(s);
    });
    // The saved repeat preference applies to the first player the session makes.
    created.loop = loopRef.current;
    playerRef.current = created;
    setPlayer(created);
    return created;
  }, []);
  const [status, setStatus] = useState<AudioStatus | null>(null);
  const { lang } = useGitaLanguage();
  const langRef = useRef(lang);
  langRef.current = lang;
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [rate, setRateState] = useState(1.0);
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false);
  // True between a new-track tap and the moment it actually starts (buffering),
  // so the play controls can show a spinner instead of looking stuck.
  const [isBuffering, setIsBuffering] = useState(false);
  const [isLoopPref, setIsLoopPref] = useState(false);
  const [playbackNotice, setPlaybackNotice] = useState<PlaybackNotice | null>(null);
  const noticeRef = useRef<PlaybackNotice | null>(null);
  const showNotice = useCallback((next: PlaybackNotice | null) => {
    noticeRef.current = next;
    setPlaybackNotice(next);
  }, []);
  const stallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearStallTimer = useCallback(() => {
    if (stallTimerRef.current) {
      clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }
  }, []);

  // Speed and repeat survive a relaunch. Read once; a change the user makes
  // before the read lands wins.
  const prefsTouchedRef = useRef(false);
  const persistPrefs = useCallback(() => {
    prefsTouchedRef.current = true;
    AsyncStorage.setItem(PREFS_KEY, JSON.stringify({ rate: rateRef.current, loop: loopRef.current })).catch(
      () => undefined
    );
  }, []);
  useEffect(() => {
    let live = true;
    AsyncStorage.getItem(PREFS_KEY)
      .then((raw) => {
        if (!live || prefsTouchedRef.current || !raw) return;
        const saved = JSON.parse(raw) as { rate?: unknown; loop?: unknown };
        if (typeof saved.rate === 'number' && Number.isFinite(saved.rate)) {
          const restored = Math.min(MAX_RATE, Math.max(MIN_RATE, saved.rate));
          rateRef.current = restored;
          setRateState(restored);
        }
        if (typeof saved.loop === 'boolean') {
          loopRef.current = saved.loop;
          setIsLoopPref(saved.loop);
          if (playerRef.current) playerRef.current.loop = saved.loop;
        }
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);

  // Keep the live rate available to playTrack without re-creating the callback.
  const rateRef = useRef(rate);
  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  // Set when a freshly-replaced source should start playing. `play()` is a
  // no-op before the player has loaded (see JapamAudioPlayer), so a new track's
  // playback is armed here and fired by the loaded-gate effect below — without
  // this, longer files that load slowly stay paused.
  const wantPlayRef = useRef(false);

  // Start a newly-loaded track once the source is ready. Guarded by a ref so it
  // fires exactly once per playTrack and never fights a user pause.
  useEffect(() => {
    if (wantPlayRef.current && status?.isLoaded) {
      wantPlayRef.current = false;
      clearStallTimer();
      if (noticeRef.current === 'loadFailed') showNotice(null); // it loaded after all
      setIsBuffering(false);
      player?.play();
    }
  }, [status, player, clearStallTimer, showNotice]);

  // Tear down the player when the app tree unmounts (app exit).
  useEffect(() => {
    return () => {
      clearStallTimer();
      statusSubRef.current?.remove();
      statusSubRef.current = null;
      try {
        playerRef.current?.remove();
      } catch {
        /* already released */
      }
      playerRef.current = null;
    };
  }, [clearStallTimer]);

  /** A finished track sits at its end: playing from there is silent, so start over. */
  const restartIfFinished = useCallback((target: AudioPlayer) => {
    const s = statusRef.current;
    const duration = s?.duration ?? 0;
    if (duration > 0 && !s?.playing && (s?.currentTime ?? 0) >= duration - END_EPSILON_SEC) {
      target.seekTo(0).catch(() => undefined);
    }
  }, []);

  const playTrack = useCallback(
    (track: AudioTrack) => {
      // Silence read-aloud / japam first — on iOS the session mixes rather than
      // interrupts, so two sources would otherwise play over each other.
      claimPlayback('recorded');
      setNowPlayingOpen(false);
      // Re-tapping the current track just resumes (a failed load retries instead).
      if (track.id === currentTrack?.id && noticeRef.current == null) {
        const current = ensurePlayer();
        restartIfFinished(current);
        current.play();
        return;
      }
      clearStallTimer();
      showNotice(null);
      const request = audioRemoteRequest(track.id);
      if (request == null) {
        // No audio for this track yet — say so instead of doing nothing.
        wantPlayRef.current = false;
        setIsBuffering(false);
        setCurrentTrack(track);
        showNotice('noAudio');
        return;
      }
      const player = ensurePlayer();
      // Stop the outgoing track at once so it doesn't keep playing through the
      // new one's download (which can take a beat on first use).
      try {
        player.pause();
      } catch {
        /* player released */
      }
      // Show the track immediately. The spinner stays until the loaded-gate
      // effect fires play (the brief initial buffer).
      setCurrentTrack(track);
      setIsBuffering(true);
      try {
        player.setActiveForLockScreen(true, {
          title: contentByLang(langRef.current, track.titleHi, track.titleEn),
          artist: track.artistEn ?? 'Vedansh',
        });
      } catch {
        /* lock-screen controls unavailable on this platform */
      }
      // Start at once — no waiting on a full download. If the file is already
      // cached, play the local copy (instant, offline); otherwise hand the
      // player the CDN url so it STREAMS while buffering (like any music app),
      // and download the file in the background so the next play is local.
      const local = cachedFileUri(request);
      if (!local) void cachedAssetUri(request).catch(() => undefined);
      player.replace({ uri: local ?? request.remoteUrl });
      player.shouldCorrectPitch = true;
      player.setPlaybackRate(rateRef.current, 'high');
      // Defer play() to the loaded-gate effect — the source buffers first.
      wantPlayRef.current = true;
      // Offline or a failing CDN never reports loaded: give up waiting visibly.
      stallTimerRef.current = setTimeout(() => {
        stallTimerRef.current = null;
        if (!wantPlayRef.current) return;
        setIsBuffering(false);
        showNotice('loadFailed');
      }, LOAD_STALL_MS);
    },
    [ensurePlayer, currentTrack?.id, restartIfFinished, clearStallTimer, showNotice]
  );

  const retryPlayback = useCallback(() => {
    if (currentTrack) playTrack(currentTrack);
  }, [currentTrack, playTrack]);

  // Warm a track's on-device cache before the user taps it (e.g. on press-in),
  // so a later play is local + offline. Fire-and-forget; `cachedAssetUri` dedups
  // a concurrent play's background download, so no work is duplicated.
  const prefetchTrack = useCallback((track: AudioTrack) => {
    const request = audioRemoteRequest(track.id);
    if (request == null) return;
    void cachedAssetUri(request).catch(() => undefined);
  }, []);

  // Reads the status through a ref so this callback (and the context value)
  // keep their identity across the 2 Hz status ticks.
  const togglePlay = useCallback(() => {
    if (statusRef.current?.playing) {
      playerRef.current?.pause();
      return;
    }
    const target = ensurePlayer();
    restartIfFinished(target);
    target.play();
  }, [ensurePlayer, restartIfFinished]);

  const seekTo = useCallback((seconds: number) => {
    playerRef.current?.seekTo(Math.max(0, seconds)).catch(() => undefined);
  }, []);

  const skipBy = useCallback((seconds: number) => {
    const next = (statusRef.current?.currentTime ?? 0) + seconds;
    playerRef.current?.seekTo(Math.max(0, next)).catch(() => undefined);
  }, []);

  /**
   * The track `offset` positions from the current one within the playable set.
   * `wrap` (the manual ◀◀/▶▶ buttons) rolls round the ends; without it the
   * ends return `null`, which is what stops end-of-track auto-advance from
   * looping the whole library forever.
   */
  const trackAtOffset = useCallback(
    (offset: number, wrap: boolean) => {
      const list = PLAYABLE_TRACKS;
      if (list.length === 0) return null;
      if (!currentTrack) return list[0];
      const i = list.findIndex((t) => t.id === currentTrack.id);
      // If the current track isn't in the playable set, start from the first.
      const base = i === -1 ? 0 : i;
      const next = base + offset;
      if (!wrap) return list[next] ?? null;
      return list[(next + list.length) % list.length];
    },
    [currentTrack]
  );

  const skipToNext = useCallback(() => {
    const t = trackAtOffset(1, true);
    if (t) playTrack(t);
  }, [playTrack, trackAtOffset]);
  const skipToPrevious = useCallback(() => {
    const t = trackAtOffset(-1, true);
    if (t) playTrack(t);
  }, [playTrack, trackAtOffset]);

  // Latches for one full playback of the current source, so the auto-advance
  // below fires exactly once per ending.
  const finishedRef = useRef(false);

  /**
   * End-of-track auto-advance: when a track plays out, roll straight on to the
   * next one — unless repeat is on, in which case the player's native `loop`
   * restarts the same track and we stay put.
   *
   * `didJustFinish` is the primary signal, but it isn't emitted uniformly
   * across platforms (see the note in `JapamAudioPlayer`), so a position that
   * has reached the duration with playback stopped counts as an ending too.
   * `finishedRef` keeps the two paths from double-firing, and re-arms as soon
   * as playback moves off the end (a resume, a seek back, or a new source).
   */
  useEffect(() => {
    if (!currentTrack || !status?.isLoaded) return;
    // A freshly-replaced source hasn't started yet — ignore the trailing
    // status of the track we just left.
    if (wantPlayRef.current) return;

    const duration = status.duration ?? 0;
    const atEnd = duration > 0 && (status.currentTime ?? 0) >= duration - END_EPSILON_SEC;
    const finished = status.didJustFinish === true || (atEnd && !status.playing);

    if (!finished) {
      if (!atEnd) finishedRef.current = false;
      return;
    }
    if (finishedRef.current) return;
    finishedRef.current = true;

    // Repeat-one: the native loop flag already restarts this track.
    if (player?.loop) return;

    // No wrap — at the end of the library playback simply stops, rather than
    // cycling the catalog indefinitely in the background.
    const next = trackAtOffset(1, false);
    if (next) playTrack(next);
  }, [status, currentTrack, player, playTrack, trackAtOffset]);

  const setRate = useCallback(
    (next: number) => {
      const clamped = Math.min(MAX_RATE, Math.max(MIN_RATE, +next.toFixed(2)));
      setRateState(clamped);
      rateRef.current = clamped;
      persistPrefs();
      // No player yet: playTrack applies the rate (rateRef) when one is made.
      const player = playerRef.current;
      if (!player) return;
      player.shouldCorrectPitch = true;
      player.setPlaybackRate(clamped, 'high');
    },
    [persistPrefs]
  );

  const toggleLoop = useCallback(() => {
    const player = ensurePlayer();
    const next = !player.loop;
    player.loop = next;
    loopRef.current = next;
    setIsLoopPref(next);
    persistPrefs();
    // Nudge a status refresh so consumers re-render with the new loop flag.
    setStatus((s) => (s ? { ...s, loop: next } : s));
  }, [ensurePlayer, persistPrefs]);

  const stop = useCallback(() => {
    // Disarm a pending play so a still-buffering source can't start after Stop —
    // or after read-aloud / japam has claimed the session (the 'recorded' stopper).
    wantPlayRef.current = false;
    clearStallTimer();
    showNotice(null);
    setIsBuffering(false);
    // Never creates a player: the arbiter calls this whenever read-aloud or
    // japam starts, including in sessions that never played recorded audio.
    const player = playerRef.current;
    try {
      player?.pause();
      player?.seekTo(0).catch(() => undefined);
      player?.clearLockScreenControls();
    } catch {
      /* player released */
    }
    setCurrentTrack(null);
    setNowPlayingOpen(false);
  }, [clearStallTimer, showNotice]);

  const openNowPlaying = useCallback(() => setNowPlayingOpen(true), []);
  const closeNowPlaying = useCallback(() => setNowPlayingOpen(false), []);

  // Let another source (read-aloud, japam) silence this player when it starts.
  useEffect(() => registerStopper('recorded', stop), [stop]);

  const value = useMemo<AudioPlayerContextValue>(
    () => ({
      currentTrack,
      isPlaying: status?.playing ?? false,
      isLoaded: status?.isLoaded ?? false,
      isBuffering,
      playbackNotice,
      durationSec: status?.duration || currentTrack?.durationSec || 0,
      rate,
      isLooping: status?.loop ?? isLoopPref,
      nowPlayingOpen,
      playTrack,
      prefetchTrack,
      togglePlay,
      seekTo,
      skipBy,
      skipToNext,
      skipToPrevious,
      setRate,
      toggleLoop,
      stop,
      openNowPlaying,
      closeNowPlaying,
      retryPlayback,
    }),
    [
      currentTrack,
      status?.playing,
      status?.isLoaded,
      isBuffering,
      playbackNotice,
      status?.duration,
      status?.loop,
      isLoopPref,
      rate,
      nowPlayingOpen,
      playTrack,
      prefetchTrack,
      togglePlay,
      seekTo,
      skipBy,
      skipToNext,
      skipToPrevious,
      setRate,
      toggleLoop,
      stop,
      openNowPlaying,
      closeNowPlaying,
      retryPlayback,
    ]
  );

  return (
    <AudioPlayerContext.Provider value={value}>
      <AudioPositionContext.Provider value={status?.currentTime ?? 0}>{children}</AudioPositionContext.Provider>
    </AudioPlayerContext.Provider>
  );
}

/** Current position in seconds. Re-renders its caller on every tick: use it only where progress is drawn. */
export function useAudioPosition(): number {
  return useContext(AudioPositionContext);
}

export function useAudioPlayerContext(): AudioPlayerContextValue {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) {
    throw new Error(
      'useAudioPlayerContext must be used inside <AudioPlayerProvider>. Check App.tsx wiring.'
    );
  }
  return ctx;
}

export { MIN_RATE, MAX_RATE, SKIP_SECONDS };
