import fs from 'node:fs';
import path from 'node:path';

/**
 * AppWidgetManager.getInstance() returns null on devices without home-screen
 * widget support (no FEATURE_APP_WIDGETS). VedanshWidgetModule is a legacy
 * @ReactMethod module, where a throw is not a promise rejection, so every entry
 * the Daily Bhakti widget offer and the Widget Gallery call must answer
 * "unsupported" instead of dereferencing null (Android null-access audit, Nov 2026).
 */
const androidDir = path.resolve(__dirname, '../../../plugins/home-widgets/android');
const read = (file: string) => fs.readFileSync(path.join(androidDir, file), 'utf8');

function method(source: string, name: string): string {
  const start = source.indexOf(`fun ${name}(`);
  expect(start).toBeGreaterThan(-1);
  const next = source.indexOf('@ReactMethod', start);
  return source.slice(start, next === -1 ? undefined : next);
}

test('pin support and pin requests treat a missing AppWidgetManager as unsupported', () => {
  const module = read('VedanshWidgetModule.kt');
  for (const name of ['isPinWidgetSupported', 'requestPinWidget']) {
    const body = method(module, name);
    expect(body).toMatch(/val manager: AppWidgetManager\? = AppWidgetManager\.getInstance\(context\)/);
    expect(body).toMatch(/catch \(_: Exception\) \{ promise\.resolve\(false\) \}/);
  }
  expect(method(module, 'isPinWidgetSupported')).toMatch(/manager\?\.isRequestPinAppWidgetSupported == true/);
  expect(method(module, 'requestPinWidget')).toMatch(/manager == null \|\|/);
});

test('every legacy widget @ReactMethod settles its promise on a throw', () => {
  const module = read('VedanshWidgetModule.kt');
  for (const name of ['writePayload', 'readPayload', 'isPinWidgetSupported', 'requestPinWidget']) {
    expect(method(module, name)).toMatch(/try \{[\s\S]*\} catch \(/);
  }
});

test('updateAll returns quietly when the device has no widget host', () => {
  expect(read('VedanshWidgetProvider.kt')).toMatch(
    /fun updateAll\(context: Context\) \{[\s\S]*?AppWidgetManager\.getInstance\(context\) \?: return/
  );
});
