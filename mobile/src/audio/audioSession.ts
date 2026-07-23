import { Platform } from 'react-native';
import { setAudioModeAsync } from 'expo-audio';

/**
 * Shared one-time audio-session setup. Both the japam looping player and the
 * global media player (AudioPlayerContext) call this so playback survives
 * silent mode and screen-lock, and plays nicely with other audio.
 *
 * The interruption mode MUST be branched per platform here, not via the two
 * fields: expo-audio resolves `interruptionMode ?? interruptionModeAndroid`,
 * so setting `interruptionMode` for iOS silently overrides the Android value.
 * That shipped Android `mixWithOthers`, under which expo-audio never requests
 * audio focus — and Android 12+ force-mutes players of an app that doesn't
 * hold focus whenever another app does (enforced ever more aggressively on
 * newer Android/OEM builds: silent playback on Android 16 devices while older
 * ones played fine). Android therefore needs `duckOthers`, which acquires
 * focus (GAIN_TRANSIENT_MAY_DUCK) before playing.
 *
 * Idempotent: configures the native session once per app run; a failure leaves
 * the gate open so the next caller retries.
 */
let audioModeConfigured = false;

export async function ensureBackgroundAudioMode(): Promise<void> {
  if (audioModeConfigured) return;
  audioModeConfigured = true;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: Platform.OS === 'android' ? 'duckOthers' : 'mixWithOthers',
    });
  } catch {
    audioModeConfigured = false;
  }
}
