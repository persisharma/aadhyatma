# TRD-14 — Daily Muhurat (Choghadiya · Rahu Kaal · Muhurat) — Technical Design

| | |
|---|---|
| **Companion PRD** | [PRD-14](../prds/14-daily-muhurat.md) |
| **Status** | Draft — design for the Phase-1 build |
| **Feasibility** | ✅ `PanchangData.sunrise/sunset` already computed, location-aware, DrikPanchang-validated |

> **Non-negotiables (from PRD-14 §8/§9):** surfaces = A glance card + C reverent detail + shareable card; naming = DrikPanchang; palette = warm auspicious/avoid (no green/red); **all visuals per `design.md`, tokens from `colors.ts`, no emoji.** This TRD must not introduce anything outside those choices.

## 0. Scope
Compute and surface today's (or the selected day's) Choghadiya (day + night), Rahu/Gulika/Yamaganda Kaal, and Abhijit Muhurat — on-device, from data the engine already returns. Ship the glance card, the detail screen, and the share card. No astrology, no notifications (Phase 2), no new dependency.

## 1. Ground truth (verified in source)

| Fact | Source | Consequence |
|---|---|---|
| `computePanchangForDate(localDate, { location })` returns `PanchangData` with **`sunrise: Date`, `sunset: Date`** | `src/panchang/engine.ts`, `types.ts:43-44` | The only inputs we need; already location-aware. |
| Sunrise/sunset validated against DrikPanchang fixtures (Ujjain) | `panchangVsDrikpanchang.e2e.test.ts`, `engine.test.ts` | We mirror that harness to validate muhurat windows. |
| Location + calendar system available as hooks | `PanchangLocationContext`, `usePanchangCalendarSystem`, `useTodayPanchang` | The card/screen read the user's chosen city. |
| Verse sharing renders an off-screen card → OS share sheet | `ShareCard.tsx`, `utils/shareVerse.tsx` (`react-native-view-shot` + `expo-sharing`) | Reused verbatim for the panchang share card — no new mechanism. |
| Panchang detail renders a two-tier anga grid then observance list | `PanchangScreen.tsx` (anga grid ~L452) | The glance card slots between them. |

## 2. Architecture

```
computePanchangForDate(day)            ── sunrise, sunset
computePanchangForDate(day+1)          ── nextSunrise (night choghadiya only)
        │
        ▼
  muhurat.ts  (PURE: sunrise, sunset, nextSunrise, weekday → MuhuratDay)
        │
        ├── useMuhurat(date)  (hook: engine + location + 1-min "now" tick)
        │        ├── glance card  → PanchangScreen (below anga grid)
        │        └── MuhuratDetail screen (reverent C) ── Share ──▶ MuhuratShareCard
        │                                                              │
        │                                              captureRef → expo-sharing (existing)
```

All astronomy stays in the engine; `muhurat.ts` is pure arithmetic + fixed tables → `tsx`-testable.

## 3. Data model

```ts
// src/panchang/muhurat.ts (types)
export type MuhuratQuality = 'auspicious' | 'avoid' | 'neutral';

export type ChoghadiyaPeriod = {
  nameHi: string;            // 'अमृत', 'चर', …
  key: 'udveg'|'char'|'labh'|'amrit'|'kaal'|'shubh'|'rog';
  quality: MuhuratQuality;
  start: Date;
  end: Date;
  phase: 'day' | 'night';
};

export type KaalWindow = { key: 'rahu'|'gulika'|'yamaganda'; nameHi: string; start: Date; end: Date };

export type MuhuratDay = {
  sunrise: Date; sunset: Date; nextSunrise: Date;
  dayChoghadiya: ChoghadiyaPeriod[];   // 8
  nightChoghadiya: ChoghadiyaPeriod[]; // 8
  rahu: KaalWindow; gulika: KaalWindow; yamaganda: KaalWindow;
  abhijit: { start: Date; end: Date }; // may be null on the rare day it collapses
};
```

## 4. Core algorithm (pure)

All windows derive from three timestamps + the weekday. Fixed tables (0=Sun … 6=Sat):

```ts
// Day choghadiya START sequence per weekday (each entry = order of the 7 names,
// repeating to 8 slots). Night sequence is the 5th-onward rotation. DrikPanchang order.
const CHOGHADIYA_NAMES = ['udveg','char','labh','amrit','kaal','shubh','rog'] as const;
const QUALITY = { amrit:'auspicious', shubh:'auspicious', labh:'auspicious', char:'auspicious',
                  rog:'avoid', kaal:'avoid', udveg:'avoid' } as const; // 'char' = good/movable
const DAY_START_INDEX   = [6,3,0,4,1,5,2];  // Sun..Sat → index into a fixed wheel
// Kaal = the k-th of 8 equal daytime parts (1-indexed), per weekday:
const RAHU      = [8,2,7,5,6,4,3];   // Sun..Sat
const GULIKA    = [7,6,5,4,3,2,1];
const YAMAGANDA = [5,4,3,2,1,7,6];

function splitEqual(from: Date, to: Date, n: number): [Date,Date][] { /* n equal spans */ }

export function computeMuhuratDay(sunrise: Date, sunset: Date, nextSunrise: Date, weekday: number): MuhuratDay {
  const day = splitEqual(sunrise, sunset, 8);
  const night = splitEqual(sunset, nextSunrise, 8);
  // choghadiya: walk CHOGHADIYA_NAMES from the weekday's start index, wrapping.
  // kaal: pick day[RAHU[weekday]-1] etc.
  // abhijit: the 8th of 15 equal day-muhurtas → [sunrise + 7*d/15, sunrise + 8*d/15].
}
```

- **Night choghadiya start** continues the wheel (offset +5 from the day start, DrikPanchang rule).
- **Abhijit** is the 8th of the 15 equal day-muhurtas (≈ solar-noon ±24 min); if a day's tithi makes it collapse it returns null (rare; card just omits it).
- **"Now"** = the period/window whose `[start,end)` contains `now`.

**No `Date.now()`/`new Date()` inside `muhurat.ts`** — callers pass timestamps, keeping it pure and testable (same discipline as the existing panchang pure code).

## 5. Accuracy & validation

- A **fixture test** (`muhurat.fixture.test.ts`, `tsx`) pins the computed Rahu/Gulika/Yamaganda/Abhijit + the 8 day-choghadiya boundaries for a set of DrikPanchang reference days (reuse the Ujjain fixtures already in `__tests__/fixtures/`), tolerance ±1 min to absorb sunrise rounding. This is the gate against convention drift (PRD §8.1).
- Pure unit tests for `splitEqual`, the weekday tables, and "now" classification (before sunrise, in-window, boundary, after sunset, night).

## 6. React integration

```ts
// src/panchang/useMuhurat.ts
export function useMuhurat(date: Date): MuhuratDay & { nowDay?: ChoghadiyaPeriod; nowKaal?: KaalWindow } {
  const [location] = usePanchangLocation();
  const [system]   = usePanchangCalendarSystem();
  const today   = computePanchangForDate(date, { location });
  const tomorrow= computePanchangForDate(addDays(date,1), { location });
  const md = useMemo(() => computeMuhuratDay(today.sunrise, today.sunset, tomorrow.sunrise, date.getDay()),
                     [today.sunrise, today.sunset, tomorrow.sunrise]);
  const nowTick = useMinuteTick();       // re-render each minute for the "now" read
  // derive nowDay/nowKaal by containing `new Date()` (only place time enters)
}
```

- **`useMinuteTick`** — a small `setInterval(60s)` hook (cleared on unmount) so the "अभी" read stays live without the 500 ms churn of the audio stream. Only the glance card + detail subscribe.
- Second `computePanchangForDate` (tomorrow) is memoised; engine calls are already used across the tab.

## 7. Surfaces

### 7.1 Glance card — `MuhuratGlanceCard` in `PanchangScreen`
Rendered right after the anga grid, before the observance list. Reads `selectedDate` (the calendar's current day). Uses `cardActiveFrom→cardActiveTo` gradient, `elevation.raised`, radius/padding **18** (design.md §4). "Now" dot + `शुभ`/avoid **text** tag (never colour-only, §12). Tap → `navigation.navigate('MuhuratDetail', { dateKey })`.

### 7.2 `MuhuratDetailScreen` — the reverent C card
New route `MuhuratDetail: { dateKey: string }` in `PanchangStackParamList`. Renders the gold-`॥`-framed grouped card (design.md §5 ornament) in **dark `ink`**; śubh rows carry a warm tint behind dark text. Top bar: back `‹` + a **साझा** glyph button.

### 7.3 Share card — reuse ShareCard
A `MuhuratShareCard` component (off-screen, `collapsable={false}`, `ref`) renders the same C layout + an `ॐ वेदांश़ · <city>` footer. The share handler calls the existing `captureRef` → `expo-sharing` path from `shareVerse.tsx` (generalised to accept a ref + filename). **No new dep, no new pipeline.**

## 8. Edge cases

| Case | Handling |
|---|---|
| Selected day ≠ today | "now" highlight suppressed unless the selected day is today; card shows the day's windows without an "अभी". |
| Location change | `useMuhurat` re-derives from the new observer (engine already handles it). |
| Abhijit collapses (rare tithi) | `abhijit` = null → card/detail omit the row. |
| Very high-latitude (no sunset) | Out of scope — India-only content; engine already throws, guarded upstream. `useMuhurat` catches → hides the card rather than crash. |
| Day boundary at midnight | Night choghadiya spans into next civil day; windows carry absolute `Date`s so "now" classification stays correct pre-/post-midnight. |

## 9. Performance
Two memoised engine calls per selected day; pure O(1) table math; one 60 s tick. Negligible — lighter than the calendar grid already rendered on the tab.

## 10. Testing

| Layer | Test | Runner |
|---|---|---|
| `computeMuhuratDay`, `splitEqual`, tables, "now" classify | boundaries, weekday coverage, night rotation | `tsx` → `test:data` |
| DrikPanchang fixture parity | Rahu/Gulika/Yamaganda/Abhijit + choghadiya bounds, ±1 min | `tsx` (fixtures reused) |
| `useMuhurat` | selected-day vs today; location change; null abhijit | Jest (mock engine/location) |
| Screen smoke | glance card + detail render without throwing | Jest (RULEBOOK §4.10) |
| Share | capture handler invoked with the card ref (mock `react-native-view-shot`) | Jest |

## 11. Module inventory

**New**
- `src/panchang/muhurat.ts` (+ `muhurat.test.ts`, `muhurat.fixture.test.ts`)
- `src/panchang/useMuhurat.ts`, `src/utils/useMinuteTick.ts`
- `src/components/MuhuratGlanceCard.tsx`, `src/components/MuhuratShareCard.tsx`
- `src/screens/MuhuratDetailScreen.tsx`

**Edited**
- `src/screens/PanchangScreen.tsx` (mount the glance card below the anga grid)
- `src/navigation/types.ts` (`MuhuratDetail` route in `PanchangStackParamList`) + Panchang stack registration
- `src/utils/shareVerse.tsx` (generalise capture-and-share to accept a ref + filename; verse path unchanged)
- `src/theme/colors.ts` (add the warm `avoid` terracotta token — the one new token, per design.md §13) + `design.md` update
- `package.json` (`test:data` gains the two muhurat tsx tests)

## 12. Design compliance
Enumerated in PRD-14 §9 and enforced here: tokens from `colors.ts` (no hard-coded hex); Noto Serif Devanagari / Cormorant / Inter only; **no emoji** (`॥`/`ॐ`/chevrons/glyph share icon); radius/padding 18, `elevation` tokens; quality never colour-only. The lone visual addition is the `avoid` terracotta token, added to `colors.ts` + documented in `design.md` **before** use.

## 13. Rollout
OTA-safe — pure JS + existing engine, no store-only assets. No feature flag needed; ship the card + detail together. Phase 2 (Rahu-Kaal/auspicious-window notifications) reuses `notifications/scheduler.ts` later.

## 14. Open technical questions
1. **Night-choghadiya start rotation** — confirm the +5 offset against DrikPanchang in the fixture (some almanacs differ); the fixture test decides.
2. **`char` quality** — treat as `auspicious` (DrikPanchang "good") vs a distinct `neutral`; default auspicious, revisit if the fixture/editorial disagrees.
3. **Share footer** — city + date only, or add a short blessing line; keep minimal for v1.
