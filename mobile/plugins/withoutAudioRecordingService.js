/**
 * Expo config plugin: strip expo-audio's AudioRecordingService from the
 * merged AndroidManifest.
 *
 * expo-audio's library manifest always declares
 *   <service .service.AudioRecordingService foregroundServiceType="microphone" />
 * even when the app never records. Play's static analysis then reports it as
 * a restricted foreground service type reachable from a BOOT_COMPLETED
 * receiver (we have two: JapamBootReceiver and expo-notifications'). Vedansh
 * has no recorder, so the service is dead weight — remove it outright.
 *
 * AudioControlsService (mediaPlayback) is NOT removed: lock-screen controls
 * (`setActiveForLockScreen` in AudioPlayerContext) need it.
 *
 * If recording is ever added, delete this plugin from app.json first.
 */

const { withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');

const SERVICE_NAME = 'expo.modules.audio.service.AudioRecordingService';

function removeRecordingService(manifest) {
  AndroidConfig.Manifest.ensureToolsAvailable(manifest);
  const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
  application.service = (application.service || []).filter(
    (s) => !(s.$ && s.$['android:name'] === SERVICE_NAME)
  );
  application.service.push({
    $: { 'android:name': SERVICE_NAME, 'tools:node': 'remove' },
  });
  return manifest;
}

const withoutAudioRecordingService = (config) =>
  withAndroidManifest(config, (cfg) => {
    cfg.modResults = removeRecordingService(cfg.modResults);
    return cfg;
  });

module.exports = withoutAudioRecordingService;
