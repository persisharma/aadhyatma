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
 *          -map_metadata -1 -fflags +bitexact -flags +bitexact \
 *          mobile/assets/japam-alarm-sounds/<mantra_id>.wav
 *      The `-map_metadata -1 -fflags/-flags +bitexact` flags are NOT optional:
 *      without them ffmpeg writes a `LIST`/`INFO` metadata chunk (encoder tag,
 *      title, etc.) between the `fmt ` and `data` chunks. iOS's notification /
 *      AlarmKit sound loader uses a minimal WAV parser that expects `data`
 *      immediately after `fmt ` and does NOT skip an intervening chunk, so the
 *      clip fails to load and the alarm silently falls back to the default
 *      tone. The canonical bundled layout is exactly `RIFF/WAVE/fmt /data`
 *      (verify: the file must contain no `LIST` chunk). This was the real
 *      July 2026 "alarm only rings Om Namah Shivaya" bug — the other clips
 *      were registered but carried an ffmpeg LIST chunk and never played.
 *   2. Drop it next to this file as `<mantra_id>.wav`. The filename MUST be a
 *      valid Android resource name — lowercase a-z, 0-9 and underscore only,
 *      starting with a letter — because `expo-notifications` copies it into
 *      `res/raw/` verbatim and REJECTS hyphens at prebuild (Android build
 *      failure). So underscore the mantra id: `om-namah-shivaya` (the
 *      `JapamMantra.id` in `mobile/src/data/japam/japam.json`) → the file
 *      `om_namah_shivaya.wav`. The Android receiver looks it up by the same
 *      `mantraId.replace('-','_')` transform.
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

// Keys are `JapamMantra.id` (hyphenated); values are the bundled filenames,
// which MUST use underscores — see the naming note in the workflow above.
const japamAlarmSounds: Record<string, string> = {
  'om-namah-shivaya': 'om_namah_shivaya.wav',
  // 28 s excerpts cut from the bundled recordings in assets/audio-library/
  // (loudness-normalised, faded, mono 16 kHz PCM — see workflow above).
  'hare-krishna-mahamantra': 'hare_krishna_mahamantra.wav',
  'gayatri-mantra': 'gayatri_mantra.wav',
  // No recording shipped yet — alarm falls back to the system default chime.
  // 'om-namo-bhagavate-vasudevaya': 'om_namo_bhagavate_vasudevaya.wav',
};

export function getJapamAlarmSoundName(mantraId: string): string | null {
  return japamAlarmSounds[mantraId] ?? null;
}

export function getAllJapamAlarmSoundNames(): readonly string[] {
  return Object.values(japamAlarmSounds);
}
