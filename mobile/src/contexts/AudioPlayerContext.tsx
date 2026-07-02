import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createAudioPlayer, type AudioStatus } from 'expo-audio';
import { ensureBackgroundAudioMode } from '@/audio/audioSession';
import { AUDIO_TRACKS, type AudioTrack } from '@/data/audio/tracks';
import { getAudioSource, hasRealAudio } from '@assets/audio-library';

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

type AudioPlayerContextValue = {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  isLoaded: boolean;
  /** Current position in seconds. */
  positionSec: number;
  /** Track duration in seconds (falls back to the catalog's nominal length). */
  durationSec: number;
  rate: number;
  isLooping: boolean;
  nowPlayingOpen: boolean;
  /** Load (if needed) and play a track, surfacing the mini-player. */
  playTrack: (track: AudioTrack) => void;
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
};

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  // One player for the whole session. Lazy init runs exactly once.
  const [player] = useState(() => createAudioPlayer(null, { updateInterval: 500 }));
  const [status, setStatus] = useState<AudioStatus | null>(null);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [rate, setRateState] = useState(1.0);
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false);

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

  useEffect(() => {
    ensureBackgroundAudioMode();
  }, []);

  // Mirror native playback state into React.
  useEffect(() => {
    const sub = player.addListener('playbackStatusUpdate', (s) => setStatus(s));
    return () => sub.remove();
  }, [player]);

  // Start a newly-loaded track once the source is ready. Guarded by a ref so it
  // fires exactly once per playTrack and never fights a user pause.
  useEffect(() => {
    if (wantPlayRef.current && status?.isLoaded) {
      wantPlayRef.current = false;
      player.play();
    }
  }, [status, player]);

  // Tear down the player when the app tree unmounts (app exit).
  useEffect(() => {
    return () => {
      try {
        player.remove();
      } catch {
        /* already released */
      }
    };
  }, [player]);

  const playTrack = useCallback(
    (track: AudioTrack) => {
      setNowPlayingOpen(false);
      // Re-tapping the current track just resumes.
      if (track.id === currentTrack?.id) {
        player.play();
        return;
      }
      const source = getAudioSource(track.id);
      if (source == null) {
        // No audio for this track yet — surface it without crashing.
        setCurrentTrack(track);
        return;
      }
      player.replace(source);
      player.shouldCorrectPitch = true;
      player.setPlaybackRate(rateRef.current, 'high');
      // Defer play() to the loaded-gate effect — the source isn't ready yet.
      wantPlayRef.current = true;
      setCurrentTrack(track);
      try {
        player.setActiveForLockScreen(true, {
          title: track.titleEn,
          artist: track.artistEn ?? 'Vedansh',
        });
      } catch {
        /* lock-screen controls unavailable on this platform */
      }
    },
    [player, currentTrack?.id]
  );

  const togglePlay = useCallback(() => {
    if (status?.playing) player.pause();
    else player.play();
  }, [player, status?.playing]);

  const seekTo = useCallback(
    (seconds: number) => {
      player.seekTo(Math.max(0, seconds)).catch(() => undefined);
    },
    [player]
  );

  const skipBy = useCallback(
    (seconds: number) => {
      const next = (status?.currentTime ?? 0) + seconds;
      player.seekTo(Math.max(0, next)).catch(() => undefined);
    },
    [player, status?.currentTime]
  );

  const trackIndex = useCallback(
    (offset: number) => {
      const list = PLAYABLE_TRACKS;
      if (list.length === 0) return null;
      if (!currentTrack) return list[0];
      const i = list.findIndex((t) => t.id === currentTrack.id);
      // If the current track isn't in the playable set, start from the first.
      const base = i === -1 ? 0 : i;
      const next = (base + offset + list.length) % list.length;
      return list[next];
    },
    [currentTrack]
  );

  const skipToNext = useCallback(() => {
    const t = trackIndex(1);
    if (t) playTrack(t);
  }, [playTrack, trackIndex]);
  const skipToPrevious = useCallback(() => {
    const t = trackIndex(-1);
    if (t) playTrack(t);
  }, [playTrack, trackIndex]);

  const setRate = useCallback(
    (next: number) => {
      const clamped = Math.min(MAX_RATE, Math.max(MIN_RATE, +next.toFixed(2)));
      setRateState(clamped);
      player.shouldCorrectPitch = true;
      player.setPlaybackRate(clamped, 'high');
    },
    [player]
  );

  const toggleLoop = useCallback(() => {
    player.loop = !player.loop;
    // Nudge a status refresh so consumers re-render with the new loop flag.
    setStatus((s) => (s ? { ...s, loop: player.loop } : s));
  }, [player]);

  const stop = useCallback(() => {
    try {
      player.pause();
      player.seekTo(0).catch(() => undefined);
      player.clearLockScreenControls();
    } catch {
      /* player released */
    }
    setCurrentTrack(null);
    setNowPlayingOpen(false);
  }, [player]);

  const openNowPlaying = useCallback(() => setNowPlayingOpen(true), []);
  const closeNowPlaying = useCallback(() => setNowPlayingOpen(false), []);

  const value = useMemo<AudioPlayerContextValue>(
    () => ({
      currentTrack,
      isPlaying: status?.playing ?? false,
      isLoaded: status?.isLoaded ?? false,
      positionSec: status?.currentTime ?? 0,
      durationSec: status?.duration || currentTrack?.durationSec || 0,
      rate,
      isLooping: status?.loop ?? false,
      nowPlayingOpen,
      playTrack,
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
    }),
    [
      currentTrack,
      status?.playing,
      status?.isLoaded,
      status?.currentTime,
      status?.duration,
      status?.loop,
      rate,
      nowPlayingOpen,
      playTrack,
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
    ]
  );

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
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
