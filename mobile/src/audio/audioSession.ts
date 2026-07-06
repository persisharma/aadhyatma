import { setAudioModeAsync } from 'expo-audio';

/**
 * Shared one-time audio-session setup. Both the japam looping player and the
 * global media player (AudioPlayerContext) call this so playback survives
 * silent mode and screen-lock, and mixes politely with other audio.
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
      interruptionMode: 'mixWithOthers',
      interruptionModeAndroid: 'duckOthers',
    });
  } catch {
    audioModeConfigured = false;
  }
}
