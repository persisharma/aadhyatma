import fs from 'node:fs';
import path from 'node:path';
import { BRAND_LAUNCH_REVEAL_ENABLED } from '../BrandLaunchGate';

// The particle reveal mounted a WebView (Chromium init on the Android main thread)
// on every cold start; it stays off until ANR evidence says otherwise
// (docs/engineering/android-anr-review-2026-11.md).
test('the cold-start particle reveal is disabled', () => {
  expect(BRAND_LAUNCH_REVEAL_ENABLED).toBe(false);
});

test('App routes every launch through the gate bypass while the reveal is off', () => {
  const app = fs.readFileSync(path.resolve(__dirname, '../../../App.tsx'), 'utf8');
  expect(app).toMatch(/<BrandLaunchGate targeted=\{targeted \|\| !BRAND_LAUNCH_REVEAL_ENABLED\}/);
});
