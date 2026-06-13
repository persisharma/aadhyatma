/**
 * Configure the global audio session once, so recitations keep playing in the
 * silent-switch position and in the background. Idempotent across callers.
 */
import { setAudioModeAsync } from 'expo-audio';

let configured = false;

export async function ensureBackgroundAudioMode(): Promise<void> {
  if (configured) return;
  configured = true;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'mixWithOthers',
      interruptionModeAndroid: 'duckOthers',
    });
  } catch {
    configured = false;
  }
}
