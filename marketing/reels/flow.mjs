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

// "Home is ready" anchor. Must be language-stable: the "Good Habits" heading is localized (so it
// vanishes after the Hindi language switch), but the "CATEGORIES" section header stays English on
// Home in both languages — so it reliably signals Home has rendered in either language.
const HOME_READY = '(?i)categories';

// A dwell is emitted as one or more near-zero-distance swipes on the (non-scrolling) title band.
// Maestro has no `sleep`; a slow swipe that barely moves holds the screen without side effects.
// Default hold is a 1%-down drag at the top title band — safe on full screens. Screens that show a
// BOTTOM SHEET must override `holdSwipe` (see below): the top band is the sheet's dimmed backdrop,
// and any drag there dismisses the sheet — so we hold *inside* the sheet, dragging UP (never the
// down/handle gesture that closes it), on a neutral text row.
const DEFAULT_HOLD = { start: '50%, 8%', end: '50%, 9%' };
function sleepSteps(ms, indent = '', hold = DEFAULT_HOLD) {
  const CHUNK = 2500;
  const out = [];
  let left = Math.max(0, Math.round(ms));
  while (left > 0) {
    const d = Math.min(CHUNK, left);
    out.push(
      `${indent}- swipe:\n` +
        `${indent}    start: ${hold.start}\n` +
        `${indent}    end: ${hold.end}\n` +
        `${indent}    duration: ${d}`,
    );
    left -= d;
  }
  return out.join('\n');
}

function actionStep(a) {
  if (a.tap) return `- tapOn:\n    text: "${a.tap}"`;
  if (a.tapId) return `- tapOn:\n    id: "${a.tapId}"`;
  if (a.tapOptional) return `- tapOn:\n    text: "${a.tapOptional}"\n    optional: true`;
  // Coordinate tap ("x%,y%") — for Devanagari rows/cards whose a11y text isn't matchable and for
  // the ‹ back chevron. Fragile by nature; use only when text/id selectors don't exist.
  if (a.tapPoint) return `- tapOn:\n    point: "${a.tapPoint}"`;
  if (a.swipe) return `- swipe:\n    direction: ${a.swipe}`;
  // centerElement + a lowered visibility threshold make below-the-fold taps land — the Home
  // category grid is virtualized, so a tile can be in the hierarchy (found) yet off-screen (tap
  // no-ops) unless we actually scroll it into view.
  if (a.scrollTo) return `- scrollUntilVisible:\n    element:\n      text: "${a.scrollTo}"\n    direction: DOWN\n    centerElement: true\n    visibilityPercentage: 40\n    timeout: 12000`;
  if (a.wait) return `- waitForAnimationToEnd`;
  throw new Error(`unknown action ${JSON.stringify(a)}`);
}

const HI_ANCHORS = {
  Morning: 'प्रभाती.*',
};

function anchorPattern(anchor, lang) {
  return lang === 'hi' && HI_ANCHORS[anchor] ? HI_ANCHORS[anchor] : `${anchor}.*`;
}

export function generatePrepFlow(reel, lang) {
  // Native build: already onboarded; Hindi renders switch the reading language before capture.
  if (IS_NATIVE) {
    const languageSwitch = lang === 'hi' ? `- tapOn: { id: "tab-more" }
- waitForAnimationToEnd
- tapOn: "Language,.*"
- waitForAnimationToEnd
- extendedWaitUntil:
    visible: "Hindi"
    timeout: 15000
- tapOn: "Hindi"
- waitForAnimationToEnd
- tapOn: { id: "tab-home" }
- waitForAnimationToEnd
- extendedWaitUntil:
    visible: "${HOME_READY}"
    timeout: 40000
` : '';
    return `# GENERATED — prep flow (not recorded): native cold-launch → Home for ${reel.slug} (${lang})
appId: ${APP_ID}
---
- launchApp
- waitForAnimationToEnd
- tapOn:
    text: "Got it"
    optional: true
- waitForAnimationToEnd
- tapOn:
    text: "(?i)skip.*"
    optional: true
- waitForAnimationToEnd
- extendedWaitUntil:
    visible: "${HOME_READY}"
    timeout: 40000
- waitForAnimationToEnd
${languageSwitch}`;
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

/** The recorded steps for a single beat: (scroll →) action(s) → anchor wait → settle → dwell. */
function beatSteps(reel, lang, timeline, i) {
  const beat = reel.beats[i];
  const parts = [`# ── beat ${i} ──`];
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
    parts.push(`- extendedWaitUntil:\n    visible: "${anchorPattern(beat.anchor, lang)}"\n    timeout: 10000`);
  }
  parts.push('- waitForAnimationToEnd');
  parts.push(sleepSteps(timeline.beats[i].dwell, '', beat.holdSwipe));
  return parts;
}

/**
 * One RECORDED flow per beat, so assemble can time-scale each beat's clip independently to its
 * caption window. Uniform-scaling a single continuous capture drifts captions off their screens
 * whenever beats carry uneven navigation weight (a 2-tap beat vs. an 8-tap "go to My Vrat" beat);
 * per-beat clips remove that drift. Each flow foregrounds the app WITHOUT a cold restart
 * (stopApp:false) so it RESUMES exactly where the previous beat left off — only beat 0 asserts Home,
 * since prep leaves it there; later beats resume mid-navigation and must not re-assert Home.
 */
export function generateBeatFlow(reel, lang, timeline, i) {
  const parts = [
    `# GENERATED — beat ${i} flow (recorded) for ${reel.slug} (${lang})`,
    `appId: ${APP_ID}`,
    '---',
    ...(IS_NATIVE ? ['- launchApp:\n    stopApp: false'] : []),
    ...(i === 0 && IS_NATIVE
      ? [`- extendedWaitUntil:\n    visible: "${HOME_READY}"\n    timeout: 40000`]
      : []),
    '- waitForAnimationToEnd',
    ...beatSteps(reel, lang, timeline, i),
  ];
  return parts.join('\n') + '\n';
}

/**
 * Write the prep flow + one recorded flow per beat.
 * @returns { prep, beats: string[] } — `beats[i]` is beat i's flow path (capture records each).
 */
export function writeFlows(reel, lang, timeline, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const prep = path.join(outDir, `${reel.slug}.${lang}.prep.yaml`);
  fs.writeFileSync(prep, generatePrepFlow(reel, lang));
  const beats = reel.beats.map((_, i) => {
    const p = path.join(outDir, `${reel.slug}.${lang}.beat${i}.yaml`);
    fs.writeFileSync(p, generateBeatFlow(reel, lang, timeline, i));
    return p;
  });
  return { prep, beats };
}
