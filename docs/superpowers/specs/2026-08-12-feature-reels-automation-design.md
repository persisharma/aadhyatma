# Feature Reels — Automated capture + voiceover pipeline

- **Date:** 2026-08-12
- **Status:** Approved design — ready for implementation plan
- **Owner:** persisharma
- **Topic slug:** `feature-reels`

## 1. Problem & goal

We want a short, on-brand vertical **reel per app feature** (Instagram Reels / YouTube
Shorts), each one a **live screen recording of the app in motion** with a **storytelling
voiceover** and burned-in captions. It must be reproducible: **one command → one MP4**, per
feature, per language.

Today the repo has `marketing/linkedin/`, which makes a *slideshow of static screenshots*
(Maestro `takeScreenshot` → branded HTML slide → headless-Chrome PNG → ffmpeg `xfade`). Reels
are a step up: **motion capture of the real app** + **narration**. We reuse that kit's brand
palette, card HTML, boot sequence, and env conventions; we replace static screenshots with a
continuous simulator video and add a TTS narration track.

### Success criteria
- `npx tsx marketing/reels/make-reel.ts <slug> --lang hi|en` produces a 1080×1920 MP4 with:
  live app footage, a branded intro card, line-synced captions, a narration track, a CTA card,
  and (if provided) a ducked music bed.
- All **19 features** have an authored storytelling script in **both hi and en**.
- The pipeline runs **free/offline by default** (macOS `say`), and upgrades to **OpenAI TTS**
  automatically when `OPENAI_API_KEY` is set — no code change.
- **Hero-3** reels (Gita reader, Daily Muhurat, Japam counter) render end-to-end as proof
  before the remaining 16 are batched.

### Non-goals (out of scope for v1)
- Word-by-word caption karaoke (needs a forced aligner / whisper). v1 is **line-synced**
  (one caption per beat). Noted as a later enhancement.
- Android capture. iOS Simulator only for v1 (the mature Maestro path).
- Shipping any copyrighted music. Music is a **drop-folder**, silent by default.
- Auto-uploading to social platforms. Output is an MP4 on disk.

## 2. Feature inventory (19 reels)

**Reader & content:** 1) Bhagavad Gita reader (flagship), 2) Library (chalisas, Sundarkand,
stotrams, aartis, sanskar), 3) Read-aloud/TTS, 4) Multi-language (hi/en/gu/kn), 5) Full-text
search, 6) Verse sharing.

**Daily practice:** 7) Daily Bhakti, 8) Japam counter, 9) Japam Alarms, 10) Daily Routine
(नित्य साधना).

**Panchang / Jyotish:** 11) Panchang (calendar/festivals/vrat), 12) Daily Muhurat, 13) Event
Muhurat Finder (shipped via #253/#254), 14) Kundali, 15) Daily Rashifal, 16) Guna Milan.

**Ambient / retention:** 17) Bhajan audio library, 18) Home & Lock-screen widgets,
19) Daily notifications.

**Hero-3 (build + verify first):** Gita reader, Daily Muhurat, Japam counter.

## 3. Architecture

### 3.1 Chosen sync model — beat-based, narration-first
Each reel is an ordered list of **beats**. A beat = one on-screen action + one narration line
+ one caption. The pipeline **synthesizes narration first**, measures each line's exact
duration, then **generates the Maestro flow with a wait injected per beat** so each screen
dwells at least as long as its narration. Result: one continuous recording, deterministic
alignment, zero hand-editing. (Rejected: record-freeform-then-time-stretch — fragile, visible
speed changes; manual-alignment — not automatable.)

### 3.2 Data model (`marketing/reels/reels/<slug>.reel.ts`)
```ts
type Lang = 'hi' | 'en';
type Localized = Record<Lang, string>;

interface Beat {
  maestro: MaestroStep[] | 'hold'; // actions during this beat, or hold current screen
  narration: Localized;            // the spoken line
  caption?: Localized;             // on-screen text (defaults to narration)
  minHoldMs?: number;              // dwell floor when the line is short (e.g. animations)
}

interface Reel {
  slug: string;                    // 'gita-reader'
  deepLink?: string;               // optional: jump straight to the screen
  readingLang?: Lang;              // app content reading-language to set (see §3.6)
  hook: Localized;                 // first-3-seconds hook (shown on/after intro card)
  beats: Beat[];
  cta: Localized;                  // closing call-to-action
}
```

### 3.3 Pipeline stages (Node/TS ESM under `marketing/reels/`)
1. **`narrate.ts`** — per beat, synth VO into a clip. **OpenAI TTS** (`tts-1-hd`, a warm voice
   per language) when `OPENAI_API_KEY` is present; **macOS `say`** fallback otherwise (Hindi
   voice `Lekha`/`Kanya` if installed, else default). Probe each clip's duration with `ffprobe`.
   Cache clips by hash(text+lang+engine+voice) so re-runs are fast.
2. **`flow.ts`** — generate `flows/<slug>.<lang>.yaml`: the shared boot preamble (launch Expo
   Go → open Vedansh → wait for bundle → set reading language), then per beat run its steps +
   `wait = max(narrationDurationMs, minHoldMs)`. Bracket with a first/last **marker step** so
   `capture.ts` can trim the boot/teardown tails cleanly.
3. **`capture.ts`** — override the sim status bar (9:41, full battery — reused from
   `capture.sh`), start `xcrun simctl io booted recordVideo --codec=h264 raw.mov` in the
   background, run `maestro test --config mobile/.maestro/config.yaml flows/<slug>.<lang>.yaml`,
   then SIGINT the recorder. Produces `raw.mov` + a beat-offset timeline (from the durations
   `flow.ts` used).
4. **`assemble.ts`** — one ffmpeg pass:
   - scale + pad `raw.mov` to exactly 1080×1920,
   - trim to the marker window,
   - build the VO track: concat beat clips with silence padding so each clip starts at its
     beat offset; total VO length == trimmed video length,
   - burn captions from a generated `.ass` file (one cue per beat, styled from brand tokens,
     lower-third, inside the safe area),
   - prepend the 1.5s **intro card** and append the **CTA card** (PNGs, see §3.4),
   - mix an optional **music bed** from `music/` ducked under the VO (`sidechaincompress`),
   - export `out/<slug>.<lang>.mp4` (`yuv420p`, `+faststart`, 30fps).
5. **`make-reel.ts`** — CLI orchestrator. `make-reel.ts <slug> --lang hi|en [--tts openai|say]
   [--music <file>] [--keep-intermediates]`; `--all` batches every reel. Calls
   `preflight.ts` first.
6. **`preflight.ts`** — verify `ffmpeg`/`ffprobe`/`maestro`/`xcrun`/Chrome are on PATH and a sim
   is booted; print actionable errors. Honors `FFMPEG_BIN`/`MAESTRO_BIN`/`CHROME_BIN` overrides
   (same as the LinkedIn kit).

### 3.4 Branded cards (reuse the LinkedIn kit)
Intro/outro cards are PNGs rendered from HTML via headless Chrome — **lifting the `C` brand
palette, font links, `pageShell`, `coverSlide`, and `outroSlide` from
`marketing/linkedin/make-reel.js`** so reels match the existing brand exactly (saffron/cream,
ॐ वेदांश़ ॐ wordmark, Cormorant Garamond + Noto Serif Devanagari). The CTA card reuses the smart
link `https://persisharma.github.io/get-vedansh/` and the "Free · iPhone & Android · works
offline" line. Shared card code is extracted into `marketing/reels/cards/` so both kits can
converge later, but v1 simply copies to avoid coupling.

### 3.5 Storytelling arc & authoring rules (updated 2026-08-23)
Every script follows: **Hook** (a felt need in the first 3s) → **Turn** (enter Vedansh) →
**Reveal** (the feature shown live) → **Payoff** (the spiritual/emotional benefit) → **CTA**.

House rules (apply to EVERY reel):
1. **Storytelling, not feature-telling.** Warm, devotional, second-person narration — a felt
   need gently met. Never "the app does X / has feature Y." The app is the quiet thread.
2. **Hindi-first for a Hindi audience.** The `hi` copy is primary and polished; `en` is a
   faithful parallel. Reels render `--lang hi` by default.
3. **No marketing/utility claims** — never say "free / नि:शुल्क / offline / बिना इंटरनेट /
   works offline", price, or cross-platform tags in narration, captions, or cards.
4. **Length ~20–30s (tight).** Aim 3–4 beats + short hook/CTA cards; ≤ ~35s hard ceiling.
   XTTS/Eleven Hindi pacing runs long, so keep lines crisp (≤ ~5-word captions).
5. **Coverage: 2–3 reels per feature is fine — but only the best.** Multiple *angles/hooks*
   per topic (e.g. a Vrat "kathas" reel and a Vrat "reminders" reel) beat one bloated reel.
   Quality over count; cut any beat that doesn't earn its seconds. (This supersedes the strict
   one-reel-per-feature line in §2.)
6. **Felt-need/utility hooks welcome** where they're the strongest pull — e.g. "अपना व्रत
   चुनिए, चुनी हुई तिथि पर याद अपने आप" (choose your vrat, get reminded on your date).
7. **Voice = the brand voice** (`viraj`). ElevenLabs (paid) for published/commercial cuts;
   local XTTS-v2 clone (`--tts xtts`, from `refs/viraj.wav`) for free previews — note its
   **non-commercial** license, so don't publish the XTTS cut commercially.

Authored in both hi + en with parallel meaning (not literal translation).

### 3.6 Language / accessibility constraint (documented decision)
Maestro matches the **English accessibility tree**; Devanagari labels are unreliable
(confirmed by the LinkedIn flows and the `expo-go-interactive-sim-review` note — grid tiles
expose English a11y labels, so `tapOn: <hindi text>` fails).

**Decision:**
- **`en` reels:** app reading-language = English; Maestro navigates by English text (as the
  LinkedIn flows already do). Simplest, most reliable.
- **`hi` reels:** narration + captions are Hindi. For **content that renders in Devanagari
  regardless of UI language** (Gita shlokas, chalisa text) the screen already looks authentic.
  For navigation, the flow **drives by `testID`/coordinates** where a Hindi a11y label would
  break `tapOn`, and only switches the *content* reading-language to Hindi on
  content screens. Beats that can't be driven language-independently fall back to English UI
  with the Hindi VO over them (acceptable — the VO and captions carry the language).
- This is the **main authoring risk per flow**; each hero flow validates its own selectors.

## 4. File layout
```
marketing/reels/
├── make-reel.ts        # CLI orchestrator (preflight → narrate → flow → capture → assemble)
├── preflight.ts        # dependency + booted-sim checks
├── narrate.ts          # TTS (OpenAI primary, say fallback) + ffprobe durations + cache
├── flow.ts             # generate <slug>.<lang>.yaml with per-beat waits + trim markers
├── capture.ts          # status bar + simctl recordVideo + maestro test + stop
├── assemble.ts         # ffmpeg: scale/pad/trim, VO mux, captions, cards, music duck
├── timeline.ts         # PURE: beat offsets, VO silence-padding, .ass cue timing (unit-tested)
├── ass.ts              # PURE: build the styled .ass caption file (unit-tested)
├── types.ts            # Beat / Reel / Lang / Localized
├── cards/              # intro.html.ts, cta.html.ts (brand tokens from mobile/src/theme)
├── reels/              # one <slug>.reel.ts per feature (the storytelling scripts)
├── flows/              # GENERATED Maestro yaml (gitignored)
├── voice/              # GENERATED + cached TTS clips (gitignored)
├── music/              # DROP-FOLDER for optional music beds (gitignored)
├── out/                # rendered MP4s (gitignored)
├── __tests__/          # timeline.test.ts, ass.test.ts, narrate.test.ts (I/O mocked)
└── README.md           # usage + how to author a new reel
```
`.gitignore` additions: `marketing/reels/{flows,voice,music,out}/` and `*.mov` (mirrors the
existing "keep the tooling, ignore the artifacts" convention).

## 5. Testing & verification
- **Unit (`tsx --test` / `node:test`** — the reels code lives outside `mobile/` so it does not
  use mobile's Jest project, matching how the repo runs its engine/data suites**):** pure logic
  only, all external I/O mocked
  - `timeline.ts`: cumulative beat offsets; VO padding sums to video length; empty/one-beat edge
    cases; `minHoldMs` floor applied.
  - `ass.ts`: cue start/end times match the timeline; escaping; safe-area margins.
  - `narrate.ts`: engine selection (key present → openai, absent → say); cache hit skips synth;
    ffprobe parse. (child_process + fetch mocked.)
- **End-to-end proof:** render the **hero-3** MP4s on a booted sim and eyeball them
  (correct footage, VO aligned, captions readable, cards on-brand, 1080×1920). This is the
  "verify before done" gate before batching the other 16.
- Coverage target follows the repo's ≥95% rule for the pure modules; the I/O glue
  (`capture.ts`) is validated by the e2e proof, not unit-mocked to death.

## 6. Deliverables & build order
1. Spec (this doc) committed.
2. Pipeline skeleton: `types.ts`, `timeline.ts`, `ass.ts` + their unit tests (TDD).
3. `preflight.ts`, `narrate.ts`, `flow.ts`, `capture.ts`, `assemble.ts`, `make-reel.ts`.
4. `cards/` intro + CTA (ported from the LinkedIn kit).
5. Hero-3 `reels/*.reel.ts` scripts (hi+en) + flows; render + verify the 3 MP4s.
6. Remaining 16 `reels/*.reel.ts` scripts (hi+en).
7. `README.md` + `.gitignore` updates.

## 7. Worked example scripts (hero-3)

### 7.1 Gita reader (`gita-reader`)
| Beat | Screen / action | EN narration | HI narration |
|---|---|---|---|
| Hook | intro card | "Ever wanted to read the Bhagavad Gita — but never knew where to begin?" | "भगवद्गीता पढ़ना तो चाहते हैं — पर शुरुआत कहाँ से करें?" |
| Turn | Home → tap Bhagavad Gita | "Vedansh opens it, one shloka at a time." | "वेदांश़ इसे खोलता है — एक श्लोक, एक बार में।" |
| Reveal 1 | chapter opens, swipe a verse | "Sanskrit, transliteration and meaning — together on one calm page." | "संस्कृत, उच्चारण और अर्थ — एक ही शांत पृष्ठ पर।" |
| Reveal 2 | tap read-aloud | "Tap once and it reads aloud to you." | "एक स्पर्श करें और यह आपको पढ़कर सुनाता है।" |
| Payoff | swipe, chapter auto-advances | "No signal needed — the whole Gita travels with you, fully offline." | "इंटरनेट की ज़रूरत नहीं — पूरी गीता आपके साथ, बिना नेट।" |
| CTA | CTA card | "Begin chapter one today. Vedansh — free." | "आज पहला अध्याय शुरू करें। वेदांश़ — नि:शुल्क।" |

### 7.2 Daily Muhurat (`daily-muhurat`)
| Beat | Screen / action | EN narration | HI narration |
|---|---|---|---|
| Hook | intro card | "Starting something important today? Choose the right moment." | "आज कोई शुभ कार्य? तो सही समय भी चुनिए।" |
| Turn | tap Panchang tab | "Vedansh shows the day's muhurat — at a glance." | "वेदांश़ दिखाता है आज का मुहूर्त — एक नज़र में।" |
| Reveal 1 | Daily Muhurat card | "Choghadiya, Abhijit, and the hours to avoid." | "चौघड़िया, अभिजित, और बचने योग्य समय।" |
| Reveal 2 | open muhurat detail | "Auspicious windows, laid out for the whole day." | "पूरे दिन के शुभ मुहूर्त, क्रम से।" |
| Payoff | scroll detail | "Calculated for your city — and it works without internet." | "आपके शहर के अनुसार — और बिना इंटरनेट के भी।" |
| CTA | CTA card | "Time your day with Vedansh — free." | "अपना दिन शुभ बनाइए, वेदांश़ के साथ — नि:शुल्क।" |

### 7.3 Japam counter (`japam-counter`)
| Beat | Screen / action | EN narration | HI narration |
|---|---|---|---|
| Hook | intro card | "Lost count of your japa — again?" | "जप की गिनती फिर से भूल गए?" |
| Turn | open a mantra → japam | "Let Vedansh keep the count for you." | "अब गिनती वेदांश़ पर छोड़ दीजिए।" |
| Reveal 1 | tap to increment several times | "Every tap, counted." | "हर स्पर्श, गिना हुआ।" |
| Reveal 2 | a mala completes (108) | "Every mala, remembered." | "हर माला, याद रखी हुई।" |
| Payoff | hold on the count | "So your mind can rest on the mantra — not the number." | "ताकि मन मंत्र पर टिके — गिनती पर नहीं।" |
| CTA | CTA card | "Start your japa with Vedansh — free, offline." | "अपना जप शुरू करें, वेदांश़ के साथ — नि:शुल्क, बिना नेट।" |

The remaining 16 scripts follow the same table shape and arc; they are authored in step 6.

## 8. Risks & gotchas
- **Reading-language ⇄ a11y** (§3.6) — the main per-flow authoring risk; hero flows validate
  selectors before batching.
- **Capture against production Metro** (`--no-dev --minify`) so no LogBox dev toast appears —
  reuse `capture.sh`'s Metro handling.
- **Expo Go lacks custom native modules** — read-aloud/widgets/alarms may not fully exercise in
  Expo Go; those reels may need a **dev build** on the sim (flag per reel; noted in the plan).
- **Sim recording resolution ≠ 1080×1920** — always scale+pad in `assemble.ts`; never assume.
- **Back-to-back Maestro runs flake** — batch mode reboots/relaunches Expo Go between reels
  (per the `maestro-e2e-workflow` note). The XCUITest driver also dies (`Connection refused` on
  its port) after ~8 flows in a session → `simctl shutdown && boot` to get a fresh driver.
- **Secrets** — `OPENAI_API_KEY` is read from env only; never logged, echoed, or committed.

### 8.1 Implemented refinements (as-built, supersede the §3.3 sketch)
- **Per-beat capture, not one `raw.mov`** — each beat is recorded as its OWN clip and `assemble`
  time-scales each to exactly its caption window, then concats. Uniform-scaling a single
  continuous capture drifts captions off their screens whenever beats carry uneven navigation
  weight (a 1-tap beat vs. an 8-tap "go to My Vrat" beat). Beat i+1 resumes where beat i left off
  (`launchApp: {stopApp:false}`); only beat 0 asserts Home.
- **simctl records VARIABLE frame-rate** — a static dwell records ~no frames, so a per-beat clip's
  dwell *tail* has none. In `assemble`, apply `fps=30` FIRST (VFR→CFR, clones the held frame across
  the dwell) so the clip's full duration survives; trim via the `trim` filter, never an `-ss` INPUT
  seek (it corrupts frame timing on these sparse clips). `tpad`+`-t` then pin each seg to its slot.
- **Dwell-hold must not dismiss bottom sheets** — the dwell is a tiny hold-swipe; the default at
  `(50%,8%)` is the dimmed backdrop above a bottom sheet and dismisses it. Beats that end on a
  sheet set `holdSwipe` to hold *inside* the sheet, dragging **up** (never the down/handle gesture).
- **Home-ready anchor is language-stable** — wait on `CATEGORIES` (English on Home in both langs),
  not the localized "Good Habits" heading (which vanishes after the Hindi language switch).
- **Cold open, no intro card** — the reel opens on live app footage in frame 0 with the hook as an
  overlay; a warm-frame (chroma) trim drops the launch/springboard prefix, guarded post-render.

## 9. Doc-sync note
This is **marketing tooling**, not a user-facing app surface, so the `design-doc-sync`
(design.md / RULEBOOK.md) rule does **not** apply. The wiki may later gain a one-line pointer to
`marketing/reels/` under a "Marketing" heading, but that is optional.
