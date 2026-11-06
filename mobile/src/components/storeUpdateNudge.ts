import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Updates from 'expo-updates';
import { isOlderStoreVersion, STORE_UPDATE_KEY, storeUpdateDue } from '@/data/storeUpdate';

/** The appVersion policy makes the native runtime the installed store version.
 * Never read expoConfig.version: an OTA can replace that manifest value.
 * Unknown runtimes, Expo Go, development and web stay silent; no new native dependency.
 */
export async function loadStoreUpdateDue(): Promise<boolean> {
  if (__DEV__ || !Updates.isEnabled || (Platform.OS !== 'ios' && Platform.OS !== 'android') ||
      !isOlderStoreVersion(Updates.runtimeVersion)) return false;
  try {
    return storeUpdateDue(Updates.runtimeVersion, await AsyncStorage.getItem(STORE_UPDATE_KEY));
  } catch {
    return false;
  }
}

/** Shown time gives Later, Back, store handoff and process termination the same rest. */
export async function recordStoreUpdateShown(): Promise<boolean> {
  try {
    await AsyncStorage.setItem(STORE_UPDATE_KEY, JSON.stringify(Date.now()));
    return true;
  } catch {
    return false;
  }
}
