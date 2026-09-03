# PRD-04 · Phase 2 — रात्रि पाठ · Dark theme & sleep timer

> *The two moments this app is used most — the 5 a.m. paath and the sandhya aarti — are the two darkest rooms of the day, on the brightest parchment in the category.*

| | |
|---|---|
| **Status** | **Deferred** (product decision 2026-09-03: the Q4 2026 slate is PRD-42 + PRD-43 only) — design decisions settled below, build-ready; Q1 2027 candidate. Completes [PRD-04](./04-reading-comfort.md) (reading size shipped as M/L in June; dark mode and sleep timer did not) |
| **Parent** | [PRD-04 §5 items 2–3, §6](./04-reading-comfort.md) · [2026-Q4-roadmap.md §2.5](../2026-Q4-roadmap.md) · enrichment backlog items 2–3 ("has design decisions") |
| **T-shirt size** | S–M — one palette + contrast gate, a stateful `ThemeProvider`, one appearance sheet, one pure timer + one control mounted in three players |
| **Delivery** | **OTA** for the palette, the Light/Dark toggle and the sleep timer. The **"System"** option requires `app.json` `userInterfaceStyle: 'automatic'` — a native config change that rides the 1.6.0 store release (PRD-42). Until then the sheet offers Light / Dark only |
| **Feasibility** | ✅ `ThemeMode = 'light' \| 'dark'` already exists in `ThemeContext.tsx`; every colour in `src/` goes through tokens and the three silent-failure lint rules (no raw hex, no literal font family, no sub-10 size) already hold at 0 errors; `colors.contrast.test.ts` exists to extend; the playback arbiter already owns all three sound sources |

**Bundle-only:** two palettes compiled into the JS bundle, one persisted pref. No remote config.

---

## 1. Problem

PRD-04 §1 (May): *"Evening sadhana on a bright parchment is uncomfortable; some users report leaving
the app at dusk because of it."* Four months on, the app is used for pre-dawn Gita, evening aarti,
Shivaratri night jagran and bedtime chalisa — and still has one palette, hard-coded light
(`userInterfaceStyle: "light"`). Separately, three sound sources (bhajan library, japam loop,
read-aloud) run until stopped: a user who falls asleep to a chalisa wakes to a flat battery, and a
japam loop in a shared room has no "stop after 20 minutes". The enrichment loop has carried both at
the top of its quick-wins list since June, blocked on the design decisions below, which this PRD
makes.

## 2. Goal

A user can choose **Light / Dark / System** appearance from More, with the dark theme keeping the
manuscript soul (deep ink on warm dark, never OLED black) and every screen passing the same contrast
gate the light palette does; and can set a **sleep timer** (15 / 30 / 45 / 60 min · इस पाठ के अंत तक)
from any of the three players that stops whatever is playing and nothing else.

Success (roadmap §5): ≥ 20 % of devices on dark within 30 days of the OTA; ≥ 25 % of audio users
touch the timer. Local prefs/counters.

## 3. What ships

### 3.1 The palette — `theme/colors.ts` `darkColors` (slice 1, additive, no screen change)

Adopt PRD-04 §6's sketch as the starting palette: **walnut ground, warm-ivory ink, muted saffron**,
tinted chips rebuilt on the dark ground. Every token in `colors` has a dark twin — the type is
`Record<keyof typeof colors, string>` so a missing twin is a typecheck error. `colors.contrast.test.ts`
is extended to run **every existing pair assertion against both palettes** (ink on parchment, signal
colours on card surfaces, chip text on chip backgrounds — §12's "actual rendered surface" rule),
so the dark palette cannot ship a pair under 4.5:1.

**Backgrounds.** The 30+ WebP plates keep their sepia; the overlay gradient swaps to the dark stops
PRD-04 §6 specified (`rgba(31,24,18,0.78) → 0.55 → 0.85`) and image brightness drops to 0.6 via the
existing `BackgroundLayer`. Per-plate QA is a checklist item (a muddy plate gets a local overlay
override, never a palette change).

**What stays light on purpose:** share cards, story canvas and the Jyotish/Namkaran/Guna Milan share
cards (they are artefacts sent to other people and their contrast is pinned against the light palette
in `jyotishShareCardFit.test.tsx`); widgets (native, out of scope); the splash.

### 3.2 The provider — `ThemeProvider` becomes stateful (slice 2)

- `ThemeMode` gains `'system'`; persisted at `@vedansh/theme-mode` (registered in PRD-42 as
  `incoming-wins`). Resolution: `'system'` → `Appearance.getColorScheme()` **only when the native flag
  is `'automatic'`** (read from `expo-constants`' manifest at runtime; otherwise the option is hidden
  and a stored `'system'` resolves to light). `useTheme()` returns `{ colors, mode, resolved }`;
  `StatusBar` style follows `resolved`.
- Default stays **light for one release** (PRD-04 §7's risk mitigation); the enrichment scope's
  "light stays the default" constraint holds. Promote the default to `'system'` in 1.7.0 if adoption
  and crash-free hold.
- **Appearance sheet** — `More → पाठ का रूप · Appearance` (a row beside Reading Size, sharing the
  `ReadingSizePickerSheet` anatomy): three radios with the reader's own `READING_SIZE_SAMPLE` rendered
  live in each mode. Tour target added (RULEBOOK §6.1) since it sits in the App group.

### 3.3 The sleep timer — `audio/sleepTimer.ts` (pure) + `useSleepTimer` + one control

- Pure: `{ deadline: epochMs | null, preset }`, `remaining(now)`, presets `15 · 30 · 45 · 60` minutes
  and **`end-of-section`** (the current track / the current chapter's last verse for read-aloud / the
  current mala for japam). `now` is a parameter; no `Date.now()` inside.
- Hook: a **single app-wide timer** in a small context beside `AudioPlayerContext`; on expiry it calls
  a new `playbackArbiter.stopAll()` (the arbiter already holds every source's stopper — this is the
  one-line addition that makes the timer source-agnostic), clears itself, and fires a light haptic.
  Persisted as an absolute instant (`@vedansh/sleep-timer`, excluded from backup) so a background /
  foreground round trip keeps it honest; on iOS the JS timer runs while background audio plays
  (`UIBackgroundModes: audio`), on Android under the existing media foreground service.
- Control: a **☾ moon pill** (stroked-View glyph, no emoji) with the remaining minutes as its label,
  mounted in `NowPlayingScreen`, `JapamAudioPlayer`'s tempo block and the `ReadAloudSettingsSheet` /
  `ReadAloudButton` long-press. One sheet, five presets, "बंद करें". Setting a timer from any player
  is the same timer.
- **End-of-section** semantics per source: recorded → track end; read-aloud → the chapter sentinel
  the controller already stops at (so the timer only arms the stop, the controller does the rest);
  japam → the current 108 completes.

### 3.4 Ask intents (RULEBOOK §25)

`appearance.set` ("dark mode", "रात का रूप") → the appearance sheet; `audio.sleep` ("20 मिनट बाद बंद",
"sleep timer") → arms the timer if something is playing, else opens Now Playing.

## 4. Where it lands (one list)

More → Appearance sheet (+ tour target) · every screen via tokens · `BackgroundLayer` overlay · status
bar · ☾ pill in Now Playing / Japam / Read Aloud · sleep-timer sheet · two जिज्ञासा intents ·
`whatsNew['1.6.0']` (System option) with the OTA-shipped Light/Dark called out in the app's next
What's New.

## 5. Design decisions — made here (the ones the backlog was waiting on)

1. **Palette direction:** PRD-04 §6 as written — deep ink on warm dark. Not OLED black; not a
   desaturated grey. The parchment *texture* survives via the sepia plates under a darker overlay.
2. **Default:** light for one release; System becomes default in 1.7.0 by explicit decision then.
3. **OS-scheme coupling:** only through the native `automatic` flag; never infer dark from the clock
   (an "auto at sunset" mode was considered — the app knows sunset better than most — and rejected
   for v1 as a surprise-in-the-middle-of-a-paath risk).
4. **Font-scale interplay (backlog's open item):** untouched — the theme changes colour only; §43's
   M/L presets and OS `allowFontScaling` behave identically in both modes.
5. **Sleep timer placement:** inside each player's own surface, not in More — it is a playback
   control. One timer, three doors.
6. **Timer scope:** stops sound only. It does not dim, lock, or navigate.

## 6. Open decisions

1. Exact dark token values — start from PRD-04 §6's table, tune against the plates; the contrast test
   is the arbiter.
2. Whether the japam loop's `end-of-section` is one mala (recommended) or the configured target rounds.
3. Should a timer expiry on read-aloud also mark the chapter as read? **No** — progress rules are
   the reader's; the timer only stops sound.

## 7. Non-goals

- No third "sepia/night" palette; no per-screen overrides; no scheduled/sunset auto-switch in v1.
- No changes to share-card or widget rendering.
- No brightness control, no screen-dim on timer expiry.

## 8. Risks

| Risk | Mitigation |
|---|---|
| Dark regresses contrast on a tint pill or a secondary label | Every existing pair assertion runs on both palettes; new pairs added for chip/tint surfaces |
| A background plate looks muddy under the dark overlay | Per-plate QA checklist in the PR; local overlay override per plate id via `backgrounds.ts` |
| Light-only assumptions hidden in a component (a hard-coded `'#fff'` slipped past lint via a `shadowColor` exception or a Skia/SVG fill) | `react-native-svg` fills audited by grep; the lint rule already covers `shadowColor`; `DeityIcon` palette (`deityGlyphs/palette.ts`) is *baked illustration colour* and stays as-is by design |
| The `'system'` pref stored before 1.6.0 lands | Resolves to light until the native flag exists; sheet hides the option; pinned by test |
| Timer fires while the app is suspended without audio (Android battery optimisation) | Persisted deadline; on foreground, an expired deadline stops immediately; documented as best-effort like reminder suppression |

## 9. Tests & release gates (RULEBOOK §0/§0.1)

- **Unit:** `colors.contrast.test.ts` over both palettes (+ the new pairs), `ThemeContext` persistence
  + system-resolution gating, `BackgroundLayer` overlay-by-mode, `sleepTimer.test.ts` (pure),
  `useSleepTimer` + `playbackArbiter.stopAll` integration across all three sources, ☾ pill states,
  appearance sheet radios, PRD-42 registry entry for `theme-mode`.
- **E2E:** `appearance-smoke.yaml` — More → Appearance → Dark → assert the selected state label and a
  Home canary still renders (Maestro cannot read colours; a screenshot step is recorded for the manual
  plate QA); `audio-smoke` extended: Now Playing → ☾ → 15 min → pill shows remaining.
- **Docs in the same PR:** `design.md` §2 (colour tokens gain the dark column + the warm-only rule's
  scope for dark), §6 (background overlay by mode), §12 (contrast rule now "in both palettes"), §34/§35/
  §56.5 (☾ control), §37 (More rows), §43 pointer, new **§76 Appearance & Sleep Timer**; `RULEBOOK.md`
  §3 (token rule applies to both palettes; share cards stay light); `.claude/rules` unchanged.

## 10. Why now

It is the cheapest item on the slate, it has been "next" for four months, and the quarter's other work
(PRD-26's reader overlay, PRD-28's strips and chips) should be built on top of the dark palette rather
than retrofitted under it — which is why it runs first (roadmap §4.3).
