/**
 * Per-mantra short alarm sounds.
 *
 * Notification-sound constraints (enforced by iOS, mirrored on Android):
 *   - format: `.wav`, `.caf`, or `.aiff` (mp3 / m4a do NOT work for a notif
 *     sound)
 *   - duration: ≤ 30 seconds
 *   - shipped in the app bundle (cannot be downloaded later)
 *
 * Workflow for adding a new mantra alarm sound:
 *   1. Trim/loop the source mantra audio to ≤ 30 s (sox / ffmpeg / Logic).
 *      Mono or stereo, 44.1 kHz, 16-bit PCM works on both platforms:
 *        ffmpeg -i <input>.mp3 -ar 44100 -ac 2 -acodec pcm_s16le \
 *          mobile/assets/japam-alarm-sounds/<mantra-id>.wav
 *   2. Drop it next to this file as `<mantra-id>.wav` (id must match
 *      `JapamMantra.id` in `mobile/src/data/japam/japam.json`).
 *   3. Register it in `japamAlarmSounds` below.
 *   4. Add the same relative path to `app.json` →
 *      `expo.plugins[expo-notifications].sounds[]`. Without that step the
 *      file is not bundled into iOS/Android and the alarm falls back to the
 *      system default chime.
 *
 * `getJapamAlarmSoundName` returns the bare filename — that's what
 * `expo-notifications` expects in `NotificationContentInput.sound` and in
 * the Android channel config. Returns `null` if no alarm clip exists for
 * the mantra; callers fall back to `default`.
 */

const japamAlarmSounds: Record<string, string> = {
  'om-namah-shivaya': 'om-namah-shivaya.wav',
  // 'hare-krishna-mahamantra': 'hare-krishna-mahamantra.wav',
  // 'gayatri-mantra': 'gayatri-mantra.wav',
  // 'om-namo-bhagavate-vasudevaya': 'om-namo-bhagavate-vasudevaya.wav',
};

export function getJapamAlarmSoundName(mantraId: string): string | null {
  return japamAlarmSounds[mantraId] ?? null;
}

export function getAllJapamAlarmSoundNames(): readonly string[] {
  return Object.values(japamAlarmSounds);
}
