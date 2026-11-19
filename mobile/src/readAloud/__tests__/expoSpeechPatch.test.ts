import fs from 'node:fs';
import path from 'node:path';

/**
 * expo-speech answers voice probes queued before the TTS engine is ready inside
 * Android's onInit callback, which runs on the MAIN thread; getVoices() there is a
 * binder call into the engine (Android ANR audit,
 * docs/engineering/android-anr-audit-2026-11.md). patches/expo-speech+<version>.patch
 * moves that drain to the serial AsyncFunction queue. patch-package only WARNS when
 * the installed version no longer matches the patch, so pin both here.
 */
const root = path.resolve(__dirname, '../../..');
const installed = JSON.parse(
  fs.readFileSync(path.join(root, 'node_modules/expo-speech/package.json'), 'utf8')
).version as string;

test('the expo-speech patch matches the installed version', () => {
  expect(fs.existsSync(path.join(root, `patches/expo-speech+${installed}.patch`))).toBe(true);
});

test('the installed SpeechModule drains queued TTS work off the main thread', () => {
  const source = fs.readFileSync(
    path.join(
      root,
      'node_modules/expo-speech/android/src/main/java/expo/modules/speech/SpeechModule.kt'
    ),
    'utf8'
  );
  // onInit only schedules; the ready flag and the queued getVoices()/speakOut()
  // run on the AsyncFunction queue.
  expect(source).toMatch(/queue\?\.launch \{ onTextToSpeechReady\(\) \}/);
  expect(source).toMatch(/private fun onTextToSpeechReady\(\)/);
  expect(source).not.toMatch(/for \(promise in delayedGetVoices\) \{\s*promise\.resolve\(getVoices\(\)\)/);
  // Activity destroy (main thread) must not construct an engine just to shut it down.
  expect(source).toMatch(/_textToSpeech\?\.shutdown\(\)/);
});
