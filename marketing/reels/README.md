# Feature reel pipeline (Vedansh)

Turn a **live iOS-simulator screen recording** of a feature into an on-brand **9:16 reel** with a
**storytelling voiceover** and burned-in captions. One command → one MP4, per feature, per language.

```
narration (say / OpenAI TTS) → timeline → Maestro drives the sim → screen recording
   → ffmpeg: scale/pad + intro & CTA cards + captions + VO (+ music) → 1080×1920 mp4
```

This is the motion-video sibling of `marketing/linkedin/` (which makes screenshot slideshows). It
reuses that kit's brand palette, card design, and boot sequence.

## Layout
```
marketing/reels/
├── make-reel.mjs     # CLI orchestrator (preflight → narrate → timeline → cards → flows → capture → assemble)
├── preflight.mjs     # checks ffmpeg / ffprobe / maestro / xcrun / Chrome / a booted sim
├── narrate.mjs       # text → audio + duration (OpenAI TTS if OPENAI_API_KEY, else macOS `say`); cached
├── timeline.mjs      # PURE timing math (unit-tested)
├── ass.mjs           # PURE .ass caption builder (unit-tested)
├── cards.mjs         # branded intro + CTA PNGs via headless Chrome
├── flow.mjs          # generate the prep + beats Maestro flows
├── capture.mjs       # boot the app + record the beats flow → raw .mov
├── assemble.mjs      # ffmpeg composition → final mp4
├── reels/            # one <slug>.reel.mjs per feature (the storytelling scripts)
├── __tests__/        # node:test unit tests for the pure modules
├── flows/  voice/  out/  music/   # GENERATED / cached / drop-folder — all git-ignored
└── README.md
```

## Prerequisites
- A **booted iOS simulator**. Two ways to run the app in it:
  - **Native build (recommended)** — a real Vedansh build (`com.prashantsharma.vedansh`) installed on
    the sim. No Metro, no first-run onboarding/tour, and Maestro gestures behave correctly. Pass its
    bundle id via `REEL_APP_ID`.
  - **Expo Go** — needs `mobile/` deps installed (`cd mobile && npm install`) so the pipeline can
    start production Metro; the pipeline seeds AsyncStorage to skip the first-run tour/onboarding and
    set the language (the onboarding sheet is an un-tappable RN Modal).
- On PATH: `ffmpeg`, `ffprobe`, `node` (≥18), `maestro`; and **Google Chrome** installed.
  - Override binaries with `FFMPEG_BIN`, `FFPROBE_BIN`, `MAESTRO_BIN`, `CHROME_BIN`.
- Only **one** simulator should be booted (Maestro/simctl target the single booted device).
- Optional premium narration: set `OPENAI_API_KEY` (uses `tts-1-hd`). Without it, macOS `say` is used
  (`Aman` for en, `Lekha` for hi — override with `REEL_VOICE_EN` / `REEL_VOICE_HI`).

## Usage
```bash
cd marketing/reels
# Native build (recommended):
REEL_APP_ID=com.prashantsharma.vedansh node make-reel.mjs sanskar --lang en   # → out/vedansh-sanskar-en.mp4

# Expo Go (default appId host.exp.Exponent):
node make-reel.mjs sanskar --lang en

# Common flags:
node make-reel.mjs sanskar --lang hi                 # Hindi VO + captions
node make-reel.mjs sanskar --lang en --tts openai    # premium narration (needs OPENAI_API_KEY)
node make-reel.mjs sanskar --lang en --music music/soft-bansuri.mp3
node make-reel.mjs sanskar --lang en --reuse-capture # skip the sim, reuse last raw.mov (fast re-assembly)
```
Run the unit tests: `node --test`.

## Authoring a new reel
Add `reels/<slug>.reel.mjs` exporting a default object:
```js
export default {
  slug: 'my-feature',
  readingLang: 'en',                     // app content language during capture
  hook: { en: '…', hi: '…' },            // spoken over the intro card
  beats: [
    { action: [{ tap: 'Button.*' }, { wait: true }], anchor: 'NextScreenLabel',
      narration: { en: '…', hi: '…' }, caption: { en: '…', hi: '…' }, minHoldMs: 3000 },
    { action: [{ swipe: 'LEFT' }, { wait: true }], narration: { en: '…', hi: '…' } },
    { action: [], narration: { en: '…', hi: '…' } },   // [] = hold on the current screen
  ],
  cta: { en: '…', hi: '…' },             // spoken over the CTA card
};
```
Action vocabulary: `{ tap: '<regex>' }`, `{ swipe: 'LEFT|RIGHT|UP|DOWN' }`, `{ wait: true }`.
`anchor` is an English on-screen label the flow waits for before the dwell.

## Notes / gotchas
- **Implemented as zero-dep Node `.mjs`**, not TS/tsx (matches `marketing/linkedin/` and avoids a
  tsx dependency). The design spec at `docs/superpowers/specs/2026-08-12-feature-reels-automation-design.md`
  describes the intended architecture.
- **Maestro drives the English accessibility tree** — flows navigate by English labels. A `--lang hi`
  reel narrates in Hindi over the same English-driven navigation; Devanagari shlokas render either way.
  A fully-Hindi UI capture would need testID/coordinate-based flows (see spec §3.6).
- **Captions are line-synced** (one caption per beat), not word-by-word.
- **Sync — trim + scale-to-fit** — Maestro's per-command overhead makes the raw capture much longer
  than the planned app segment. `assemble.mjs` auto-detects the first scene change (end of the
  Maestro-startup dead prefix), trims it, then time-scales the footage to the planned duration so the
  beats line up with the VO. Speeding up the mostly-static reading screens is visually invisible.
  Override the trim with `REEL_LEAD_TRIM_MS`; tune pacing via the `TIMING` constants in `timeline.mjs`.
- **Screenshot only settled screens** — for verification, wait for a screen's anchor (or use a beat's
  dwell) before capturing; screenshotting mid-transition/hydration shows stale frames.
- **Music** ships silent by default; drop a track in `music/` and pass `--music`. Nothing copyrighted
  is committed.
- CTA smart link: `https://persisharma.github.io/get-vedansh/` (iPhone + Android).
```
