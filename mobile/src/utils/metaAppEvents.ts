import { AppState, Platform } from 'react-native';
import Constants from 'expo-constants';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { createMetaActivationController } from './metaActivationController';

type ActivationModule = { activate: () => Promise<boolean> };
let started = false;

/** Called after navigation is ready. No screen, scripture, location, name,
 * birth details or practice progress are collected by this integration. */
export function startMetaAppEvents(): void {
  if (started || (Platform.OS !== 'ios' && Platform.OS !== 'android')) return;
  if (Constants.expoConfig?.extra?.metaTrackingEnabled !== true) return;
  const native = requireOptionalNativeModule<ActivationModule>('VedanshMetaAppEvents');
  // Expo Go and older store builds lack the new module. A future JS bundle
  // reaching either must remain usable; it cannot add this native SDK.
  if (!native) return;
  started = true;
  const controller = createMetaActivationController({
    platform: Platform.OS,
    currentState: () => AppState.currentState,
    getPermission: async () => {
      const tracking = await import('expo-tracking-transparency');
      return tracking.getTrackingPermissionsAsync();
    },
    requestPermission: async () => {
      const tracking = await import('expo-tracking-transparency');
      return tracking.requestTrackingPermissionsAsync();
    },
    activate: () => native.activate(),
  });
  AppState.addEventListener('change', controller.onStateChange);
  void controller.start();
}
