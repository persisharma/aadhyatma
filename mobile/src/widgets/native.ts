import { NativeModules, Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { decodeWidgetPayload, WIDGET_PAYLOAD_KEY, type WidgetPayloadV1 } from './contract';
import { widgetCatalogEntry, type WidgetContent } from './catalog';

type WidgetNativeModule = {
  writePayload(payload: string): Promise<void>;
  readPayload?(): Promise<string | null>;
  requestPinWidget?(content: WidgetContent): Promise<boolean>;
  isPinWidgetSupported?(): Promise<boolean>;
};

function nativeModule(): WidgetNativeModule | null {
  if (Platform.OS === 'ios') return requireOptionalNativeModule<WidgetNativeModule>('VedanshWidgetIos');
  return (NativeModules as Record<string, WidgetNativeModule | undefined>).VedanshWidget ?? null;
}

export async function readWidgetPayload() {
  const mod = nativeModule();
  if (!mod?.readPayload) return { kind: 'missing' as const };
  try { return decodeWidgetPayload(await mod.readPayload()); } catch { return { kind: 'corrupt' as const }; }
}

export async function writeWidgetPayload(payload: WidgetPayloadV1): Promise<'native' | 'unavailable'> {
  if (decodeWidgetPayload(payload).kind !== 'ready') throw new Error('Refusing to persist an invalid widget payload');
  const mod = nativeModule();
  if (!mod) return 'unavailable';
  await mod.writePayload(JSON.stringify(payload));
  return 'native';
}

export async function isWidgetPinSupported(): Promise<boolean> {
  const mod = nativeModule();
  return Platform.OS === 'android' && !!mod?.isPinWidgetSupported && mod.isPinWidgetSupported();
}

/** Asks the launcher to pin one specific widget; Android-only, and false when it declines. */
export async function requestPinWidget(content: WidgetContent): Promise<boolean> {
  const mod = nativeModule();
  if (Platform.OS !== 'android' || !mod?.requestPinWidget) return false;
  if (!widgetCatalogEntry(content).androidProvider) return false;
  return mod.requestPinWidget(content);
}

export { WIDGET_PAYLOAD_KEY };
