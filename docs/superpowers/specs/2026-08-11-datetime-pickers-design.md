# Date & Time Pickers for Kundali and Guna Milan

**Date:** 2026-08-11
**Status:** Approved (design)
**Branch:** `date-time-pickers-guna-milan`
**Ships as:** OTA update (pure-JS, no new native module)

## Problem

Birth **date** and **time** are entered as free-text fields today:

- **Kundali** (`KundaliScreen.tsx` → `BirthInput`): two `TextField`s — date `YYYY-MM-DD`, time `HH:mm` (24-hour).
- **Guna Milan** (`BirthDetailsForm.tsx`, rendered once per role — **groom** and **bride**): a date `TextField` (`YYYY-MM-DD`) and, when time is not "Unknown", a time `TextField` (`HH:mm`).

Manual typing is error-prone (format mistakes, invalid dates) and slow. Users expect a **calendar** to pick a date and a **reminder-style** control to pick a time.

## Goal

Replace the free-text date/time inputs at all three touch points (Kundali; Guna Milan groom; Guna Milan bride) with:

- a theme-matched **calendar date picker** (bottom sheet, month grid, fast year jump), and
- a **12-hour AM/PM time picker** built on the app's existing reminder `TimeStepper`.

Custom pure-JS controls (not the native OS picker), so the change ships over OTA, works offline, and matches the parchment design language — consistent with the repo already hand-rolling `TimeStepper` instead of using an OS picker.

## Non-goals

- No change to the birth-data model, validation, IST→UTC conversion, persistence, or any astronomy/engine code.
- No birthplace/timezone changes (Guna Milan still requests no location; Kundali still uses its own city picker).
- No 24-hour vs 12-hour change to *stored* values — storage stays 24-hour `HH:mm`.
- No native module, no EAS/native rebuild.

## Core invariant — the string contract is unchanged

The pickers are input controls only. They emit exactly the same values the text fields emit today:

| Field | Emitted value | Consumed unchanged by |
| --- | --- | --- |
| Date | `YYYY-MM-DD` (zero-padded) | `validateBirthProfile`, `validateGunaMilanPerson`, `birthProfileToInput`, `parseIstMoment` |
| Time (known) | `HH:mm` 24-hour | same as above |
| Time (Guna Milan "Unknown") | `null` | `validateGunaMilanPerson`, unknown-time range branch |

Because of this, `useKundali.ts`, `gunaMilanState.ts`, `gunaMilan.ts`, `kundali.ts`, and every engine/golden test are **not touched**. The AM/PM picker converts 12-hour display ↔ 24-hour `HH:mm` at its own boundary; nothing downstream ever sees 12-hour.

## Components (new, in `mobile/src/components/`)

### `CalendarDatePicker`

A bottom-sheet `Modal` following the existing Kundali `CityPicker` pattern (slide-up, `modalBackdrop`, `SafeAreaView` `edges={['bottom']}`, parchment sheet with `radii.lg` top corners).

- **Props:** `visible: boolean`, `value: string` (`YYYY-MM-DD` or `''`), `lang: Lang`, `minDate?: string`, `maxDate?: string`, `onSelect: (date: string) => void`, `onClose: () => void`.
- **Header:** `‹  September 1992  ›` — left/right arrows page one month. The **month-year label is itself a button**: tapping it swaps the day grid for a **scrollable year list** (birth years span decades; month-by-month paging is unusable). Picking a year returns to the day grid in that year.
- **Grid:** 7 columns Sun–Sat, leading blanks for the first weekday, one cell per day. Selected day = saffron pill (`saffronTint` bg / `saffronDeep` text). Days outside `[minDate, maxDate]` are visually muted and non-selectable.
- **Range default:** `minDate = '1900-01-01'`, `maxDate = today` (IST civil day). Birth dates of living people; future dates are meaningless for a birth chart.
- **Default landing when `value` is empty:** today's month (so "today" is one tap; the year-jump handles older births).
- **Footer:** Cancel + a primary Confirm (saffron pill, `onSelect` with the chosen `YYYY-MM-DD`). Tapping a day selects it; Confirm commits and closes.
- **Month names** localized via existing helpers; captions in the Latin face stay English (design.md §3.0).
- **a11y/testID:** each day is `accessibilityRole="button"` with an English label (`"14 August 1992"`); the sheet and the year list carry stable labels so Maestro can drive them.

### `ClockTimePicker`

An **inline** control (not a modal — the reminder `TimeStepper` sits inline today) that reuses `TimeStepper`'s stepper column visual and adds an AM/PM column.

- **Props:** `value: string` (`HH:mm` 24-hour), `onChange: (next: string) => void`, plus a11y label passthrough.
- **Display:** three columns — **HR** `1–12`, **MIN** `00–59`, **AM/PM** — each with the up/down chevron + hold-to-repeat behaviour already in `TimeStepper`. AM/PM toggles between the two states.
- **Conversion at the boundary:**
  - 24h → 12h: `hour === 0 → 12 AM`, `1–11 → AM`, `12 → 12 PM`, `13–23 → (h-12) PM`.
  - 12h → 24h: `12 AM → 0`, `1–11 AM → h`, `12 PM → 12`, `1–11 PM → h+12`. Emits zero-padded `HH:mm`.
- **Implementation choice:** extract the reusable stepper **Column** from `TimeStepper` (or import it) so HR/MIN/AMPM share one visual and `TimeStepper` itself keeps working unchanged for Japam/Reminders. Prefer reuse over duplication; do not fork the chevron/hold logic.
- **a11y/testID:** `"Birth time"` group label; stable enough for Maestro to step HR/MIN and toggle AM/PM.

## Screen changes

### `KundaliScreen.tsx` (`BirthInput`)

- The side-by-side date & time `TextField`s become two **Pressable "field" buttons** (styled like the existing `cityButton`: parchment, `radii.md`, min-height per §52) showing the current value formatted for reading (reuse `formatBirthDate` / `formatBirthTime`) or a muted placeholder ("Select date" / "Select time").
- Tapping **date** opens `CalendarDatePicker`. Tapping **time** reveals the inline `ClockTimePicker` in a full-width block directly **beneath** the date/time row (the steppers need more width than the 0.72-flex time cell), collapsing back to the field button when another field is focused. The field button always shows the current 12-hour value.
- **Keep the same `testID`s** on the pressables: `kundali-date-input`, `kundali-time-input`. Error text (`errors.date` / `errors.time`) renders exactly as today, with the same red border treatment on the field button.
- `EMPTY_PROFILE`, `draft` state, `handleGenerate`, validation — unchanged.

### `BirthDetailsForm.tsx` (Guna Milan, both roles)

- The date `TextField` → a date **field button** opening `CalendarDatePicker` (one picker instance per form; `role` distinguishes groom/bride in a11y labels).
- The **"Unknown" time checkbox stays exactly as-is.** When `value.time !== null`, the `HH:mm` `TextField` → `ClockTimePicker`. When `null`, the existing "every possibility across the IST day … noon is never assumed" note shows unchanged.
- "Use my details" autofill (`onUseSaved`) still writes the same `{name,date,time}` strings; the pickers reflect them on next open automatically — no extra wiring.
- Accessibility labels keep the `roleHi/roleEn` framing (`"Groom birth date"`, `"Bride birth time, IST"`).

## Verification

### Unit (jest)

- **New** `CalendarDatePicker.test.tsx`: renders the landing month; month arrows page; tapping the year label opens the year list and selecting a year returns to that year; a day inside range selects and Confirm emits the expected `YYYY-MM-DD`; a day past `maxDate` (future) is non-selectable; leap-day (`1992-02-29`) reachable.
- **New** `ClockTimePicker.test.tsx`: 12h↔24h round-trip for the four edge cases (`00:15 ↔ 12:15 AM`, `12:00 ↔ 12:00 PM`, `05:42 ↔ 5:42 AM`, `23:05 ↔ 11:05 PM`); AM/PM toggle flips the stored hour by 12; MIN/HR stepping emits zero-padded `HH:mm`.
- **Existing** `TimeStepper.test.tsx` stays green (component reused, not modified in a breaking way; if the Column is extracted, keep `TimeStepper`'s public props/behaviour identical).
- **Existing** `GunaMilanExperience.test.tsx` and any Kundali-screen RTL test that typed into the fields: update to drive the pickers (open → pick) and assert the same resulting `date`/`time` strings and the same downstream state (autofill, unknown-time range, error display).
- Note the Jest + Animated caveat if any picker uses the native driver (mock `react-native/src/private/animated/NativeAnimatedHelper` + fake timers) — see the `TimeStepper` test setup.

### e2e (Maestro) — must be run on a real iOS sim **and** Android emulator per repo policy

- `kundali-smoke.yaml`: the `inputText` steps into `kundali-date-input` / `kundali-time-input` become tap-field → (open calendar) jump to **1992** → tap **14 Aug** → Confirm, and tap-time → set **5 : 42 AM**. Same final values → all downstream assertions (Cancer/Karka Lagna, Dhanishta pada 4, Jupiter Mahadasha, share footer) unchanged.
- `guna-milan-smoke.yaml`: the autofill path is unaffected (strings copied in). The **manual edit** section (`"Bride birth date, YYYY-MM-DD"` → `eraseText`/`inputText` `1970-01-15`, then `"Bride birth time unknown"`) becomes: tap bride date field → pick **15 Jan 1970** via the calendar, then tap the unchanged **Unknown** checkbox. Same final range assertion (`9.5–19.5`, "Exact time needed", "Bharani"), share still excluded for the range.
- These device runs are the **user's verification step** (cannot be executed from this environment); flag pass/fail explicitly.

### Docs (same PR — design-doc-sync rule)

- **design.md §51** (Kundali, "Surface family"/input): describe the birth date/time as calendar + AM/PM pickers instead of `TextField` `form` fields; note they emit the same `YYYY-MM-DD` / `HH:mm` and keep the §52 min-height and the `kundali-date-input`/`kundali-time-input` testIDs.
- **design.md §58** (Guna Milan, "Input"): update "Fields use the §52 `TextField` `form` variant" to the calendar date picker + AM/PM `ClockTimePicker`, with the **Unknown** checkbox and `null`-time note preserved; the date/time are still IST `YYYY-MM-DD` / 24-hour `HH:mm`.
- Add a short subsection (under §52 or a new numbered § for shared controls) documenting `CalendarDatePicker` and `ClockTimePicker` as reusable theme components.
- **RULEBOOK.md:** no change — the integration contract (content shapes, string formats, enumerations) is unchanged.

## Files touched

**New:** `mobile/src/components/CalendarDatePicker.tsx`, `mobile/src/components/ClockTimePicker.tsx`, plus their `__tests__`.
**Modified:** `mobile/src/screens/KundaliScreen.tsx`, `mobile/src/components/BirthDetailsForm.tsx`, `mobile/src/components/TimeStepper.tsx` (only if extracting the shared Column — keep public API stable), `mobile/.maestro/kundali-smoke.yaml`, `mobile/.maestro/guna-milan-smoke.yaml`, affected jest tests, `design.md`.
**Untouched:** `useKundali.ts`, `gunaMilanState.ts`, `gunaMilan.ts`, `kundali.ts`, all engine/golden tests, `RULEBOOK.md`.

## Risks / edge cases

- **Leap day / month length:** the grid must compute days-in-month per year (Feb 29 only on leap years). Covered by a unit test.
- **Range boundaries:** `maxDate = today` uses the **IST** civil day (consistent with the rest of the Jyotish stack), not the device's local day.
- **Testable value formatting:** the field button shows a *human* format but the picker still emits the machine `YYYY-MM-DD` / `HH:mm`; keep the two clearly separated so Maestro/a11y target the emitted contract.
- **`TimeStepper` reuse:** if the Column is extracted, `TimeStepper`'s Japam/Reminder behaviour (taken-slot skipping, minuteStep) must be byte-for-byte preserved — its existing test is the guard.
