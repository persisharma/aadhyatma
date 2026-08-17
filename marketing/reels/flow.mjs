// flow.mjs — generate Maestro flows from a reel + its computed timeline.
//
// Two flows per render:
//   prep  — NOT recorded: launch the app, set the reading language, land on Home.
//   beats — recorded: perform each beat's action, then dwell for exactly its computed length
//           (via zero-distance long "swipes" — Maestro's reliable sleep) so the VO placed at
//           the same offsets in post lines up with the on-screen content.

import fs from 'node:fs';
import path from 'node:path';

// Target app: a native build (recommended — no Metro/onboarding quirks) or Expo Go.
export const APP_ID = process.env.REEL_APP_ID || 'host.exp.Exponent';
export const IS_NATIVE = APP_ID !== 'host.exp.Exponent';

// A dwell is emitted as one or more near-zero-distance swipes on the (non-scrolling) title band.
// Maestro has no `sleep`; a slow swipe that barely moves holds the screen without side effects.
function sleepSteps(ms, indent = '') {
  const CHUNK = 2500;
  const out = [];
  let left = Math.max(0, Math.round(ms));
  while (left > 0) {
    const d = Math.min(CHUNK, left);
    out.push(
      `${indent}- swipe:\n` +
        `${indent}    start: 50%, 8%\n` +
        `${indent}    end: 50%, 9%\n` +
        `${indent}    duration: ${d}`,
    );
    left -= d;
  }
  return out.join('\n');
}

function actionStep(a) {
  if (a.tap) return `- tapOn:\n    text: "${a.tap}"`;
  if (a.swipe) return `- swipe:\n    direction: ${a.swipe}`;
  if (a.wait) return `- waitForAnimationToEnd`;
  throw new Error(`unknown action ${JSON.stringify(a)}`);
}

export function generatePrepFlow(reel, lang) {
  // Native build: already onboarded + English — just launch and land on Home.
  if (IS_NATIVE) {
    return `# GENERATED — prep flow (not recorded): native cold-launch → Home for ${reel.slug} (${lang})
appId: ${APP_ID}
---
- launchApp
- extendedWaitUntil:
    visible: "Good Habits.*"
    timeout: 40000
- waitForAnimationToEnd
- tapOn:
    text: "(?i)skip.*"
    optional: true
- waitForAnimationToEnd
`;
  }
  // Expo Go: language + first-run suppression are handled by seed.mjs before this runs, so prep
  // just cold-launches the app (which reads the seed) via the Expo Go recents entry.
  return `# GENERATED — prep flow (not recorded): Expo Go cold-launch → Home for ${reel.slug} (${lang})
appId: ${APP_ID}
---
- launchApp
- tapOn: "Vedansh"
- extendedWaitUntil:
    visible: "Good Habits.*"
    timeout: 60000
- waitForAnimationToEnd
- tapOn:
    text: "(?i)skip.*"
    optional: true
- waitForAnimationToEnd
`;
}

export function generateBeatsFlow(reel, lang, timeline) {
  const parts = [
    `# GENERATED — beats flow (recorded) for ${reel.slug} (${lang})`,
    `appId: ${APP_ID}`,
    '---',
    '- waitForAnimationToEnd',
  ];
  reel.beats.forEach((beat, i) => {
    parts.push(`# ── beat ${i} ──`);
    // Scroll a target into view first (e.g. a category tile below the fold) so the tap lands.
    if (beat.scrollTo) {
      parts.push(
        `- scrollUntilVisible:\n` +
          `    element:\n      text: "${beat.scrollTo}.*"\n` +
          `    direction: DOWN\n    centerElement: true\n    timeout: 12000`,
      );
    }
    for (const a of beat.action || []) parts.push(actionStep(a));
    if (beat.anchor) {
      parts.push(`- extendedWaitUntil:\n    visible: "${beat.anchor}.*"\n    timeout: 10000`);
    }
    parts.push('- waitForAnimationToEnd');
    parts.push(sleepSteps(timeline.beats[i].dwell));
  });
  return parts.join('\n') + '\n';
}

/** Write both flows to disk; returns { prep, beats } paths. */
export function writeFlows(reel, lang, timeline, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const prep = path.join(outDir, `${reel.slug}.${lang}.prep.yaml`);
  const beats = path.join(outDir, `${reel.slug}.${lang}.beats.yaml`);
  fs.writeFileSync(prep, generatePrepFlow(reel, lang));
  fs.writeFileSync(beats, generateBeatsFlow(reel, lang, timeline));
  return { prep, beats };
}
