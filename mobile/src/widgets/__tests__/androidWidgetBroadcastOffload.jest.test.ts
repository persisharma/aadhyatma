import fs from 'node:fs';
import path from 'node:path';

/**
 * A home-widget AppWidgetProvider receives APPWIDGET_UPDATE (and our own
 * boundary wake-up) on the broadcast's main thread. render() loads
 * SharedPreferences, decodes the full multi-locale payload, builds RemoteViews
 * and makes updateAppWidget/AlarmManager binder calls — too much for the main
 * thread on a slow device, where it exceeds the broadcast timeout and ANRs
 * (Android vitals: "Broadcast of Intent APPWIDGET_UPDATE", main thread at
 * nativePollOnce). onReceive must hand the work to a background thread via
 * goAsync(), and must never call render() synchronously on the broadcast thread
 * (Android ANR hardening, Nov 2026).
 */
const androidDir = path.resolve(__dirname, '../../../plugins/home-widgets/android');
const provider = fs.readFileSync(path.join(androidDir, 'VedanshWidgetProvider.kt'), 'utf8');

function method(source: string, signature: string): string {
  const start = source.indexOf(signature);
  expect(start).toBeGreaterThan(-1);
  // Up to the next top-level `fun ` / `private fun ` after the opening.
  const rest = source.slice(start + signature.length);
  const next = rest.search(/\n    (?:override |private )?fun /);
  return source.slice(start, next === -1 ? undefined : start + signature.length + next);
}

test('onReceive offloads every broadcast to a background thread with goAsync()', () => {
  const body = method(provider, 'override fun onReceive(');
  expect(body).toMatch(/val pending = goAsync\(\)/);
  expect(body).toMatch(/WIDGET_EXECUTOR\.execute \{/);
  expect(body).toMatch(/pending\.finish\(\)/);
  // The actual rendering must run inside the executor, not synchronously.
  expect(body).toMatch(/dispatch\(context, intent\)/);
  expect(body).not.toMatch(/\brender\(/);
});

test('a single serial executor backs the widget broadcasts', () => {
  expect(provider).toMatch(/private val WIDGET_EXECUTOR = Executors\.newSingleThreadExecutor\(\)/);
});

test('dispatch renders boundary wake-ups and delegates the rest to super', () => {
  const body = method(provider, 'private fun dispatch(');
  expect(body).toMatch(/ACTION_BOUNDARY/);
  expect(body).toMatch(/super\.onReceive\(context, intent\)/);
  expect(body).toMatch(/AppWidgetManager\.getInstance\(context\) \?: return/);
});
