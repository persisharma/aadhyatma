# PRD-04 — Reading Comfort Pack

| | |
|---|---|
| **Status** | Proposed |
| **Target release** | v1.7.0 |
| **Window** | Weeks 34–37 (17 Aug – 11 Sep 2026) |
| **T-shirt size** | M (~4 dev-weeks) |
| **Owner** | TBA |

---

**Bundle-only constraint:** preferences persist in `AsyncStorage`. Theme palette is compiled into the JS bundle. No remote config, no A/B testing service.

---

## 1. Problem

The reader is well-designed for default users but inflexible:

- **Type size is fixed.** A 65-year-old reciter can't bump it up; a small-screen user can't shrink.
- **No dark mode.** README §Roadmap lists it as deferred. Evening sadhana on a bright parchment is uncomfortable; some users report leaving the app at dusk because of it.
- **No sleep timer.** Audio (PRD-02) will make this acute — users want a "stop after this aarti" or "after 15 min" affordance.

These are all classic comfort features for a reading app; together they shore up retention from the part of the user base that values evening / pre-sleep use.

## 2. Goal

Ship a single Settings → Reading row that exposes font scale, theme mode, and sleep timer, with all reader screens responding correctly. Measured by:

- ≥ 25% of users adjust font scale within first month.
- ≥ 30% of users with > 1 audio session enable sleep timer.
- Zero color-contrast regressions in dark mode (WCAG AA on body text).
- No new theme-related crashes in Sentry.

## 3. Non-goals

- Per-section theme overrides.
- True OLED-black mode (the dark theme stays "deep ink on warm dark," not pure black — preserves the parchment soul).
- Auto-brightness based on time of day. Defer; let user opt in manually first.
- Font-family choice (only one Devanagari + one Latin face stays the law per `design.md`).

## 4. User stories

> As an elder reciter, I want to make verse text 25% larger so I can read it without glasses.

> As an evening reader, I want a dark theme that doesn't sear my eyes, while keeping the manuscript aesthetic.

> As an aarti listener at bedtime, I want the audio to auto-stop in 15 minutes so I don't have to fumble for my phone.

## 5. Scope

### In scope (v1.7.0)

1. **Font scale slider.** 4 stops: S / M / L / XL. M is today's size. Affects only verse + meaning + commentary text (not chrome). Persisted via `AsyncStorage`. Applied through a new `useReadingPreferences()` hook that wraps `useTheme()` to multiply font sizes by the chosen factor.
2. **Theme mode.** 3 options: Light / Dark / System. Default "System." Add a parallel `darkColors` palette in `mobile/src/theme/colors.ts` (deep walnut ground, warm-ivory ink, muted saffron — sketch in §6). Every screen must read from `colors` (already enforced by RULEBOOK §3); the audit verifies no leaked hex literals.
3. **Sleep timer.** Available from the audio player (PRD-02). 4 presets: 15 / 30 / 45 / 60 min, plus "End of section." Persists across foreground/background, stops audio + dims screen lock state on expiry.
4. **Settings entry.** New "Reading" section in More tab, above "Reminders" (PRD-01).
5. **Onboarding hint.** First time the user enters the reader after install, show a one-time gentle tip pill: "Tap & hold to adjust text size." (Removed in PRD-06 audit if it's not used.)

### Out of scope

- Reading mode that hides bookmarks button / pager dots (Q4 if power-user demand).
- Per-deity color theming (anti-RULEBOOK).
- Custom theme color editor.

## 6. UX notes — dark theme palette sketch

| Token | Light (today) | Dark (proposed) |
|---|---|---|
| `parchment` | `#F3E7C9` | `#1F1812` |
| `parchment-soft` | `#F8EFD6` | `#2A2118` |
| `parchment-deep` | `#E9D9B1` | `#1A140F` |
| `ink` | `#2F1E10` | `#EDDDB7` |
| `ink-soft` | `#5A3A1E` | `#C2A580` |
| `ink-muted` | `#8A6A47` | `#9C8866` |
| `saffron` | `#B8621B` | `#D88044` |
| `saffron-deep` | `#8A3E0B` | `#B85E20` |
| `gold` | `#A67C34` | `#C0974A` |
| `divider` | `rgba(138, 62, 11, 0.18)` | `rgba(237, 221, 183, 0.16)` |

Backgrounds in dark mode use the same faded-sketch images but with a different overlay gradient: `rgba(31,24,18,0.78)` → `rgba(31,24,18,0.55)` → `rgba(31,24,18,0.85)`. Sepia filter stays; brightness drops to `0.6`.

These are starting values. The design pass in week 34 sign-offs the final palette against the existing `design-preview.html`.

## 7. Technical sketch

- Extend `ThemeContext`: it already gives `colors`, `typography`, `spacing`, `radii`. Add `mode: 'light' | 'dark'` and `fontScale: 0.85 | 1 | 1.15 | 1.3`. Store both in `AsyncStorage` under `@vedansh/reading-prefs`.
- Audit: grep the codebase for hex literals (RULEBOOK §3 already prohibits them; PR diff hygiene §4.3 already checks). One-time sweep before dark mode ships — anything missed in past PRs gets fixed.
- Font scale applied in `mobile/src/theme/typography.ts`: each role returns `fontSize * scale` from the hook. No per-component multiplication.
- Sleep timer in `VerseAudioContext` (extends PRD-02 work): countdown driven by `setTimeout`; cleared on pause, on manual stop, on screen unmount.
- Background images keep their per-verse deterministic selection regardless of theme.

## 8. Success metrics

| Metric | Source | Target |
|---|---|---|
| Font scale change rate (first month) | Local event | ≥ 25% |
| Dark mode active sessions / total | Local event | ≥ 15% within 30 days |
| Sleep timer activation among audio users | Local event | ≥ 30% |
| Theme-related crash rate | Sentry | 0 |

## 9. Risks

| Risk | Mitigation |
|---|---|
| Dark mode regresses 18 reader screens silently | Ship behind a settings toggle defaulted to "Light." Promote to "System" default only after 1 release. |
| Font scale breaks line-height in long meanings | Line-height is multiplied off `typography.meaning.fontSize` already; verify in QA on each scale stop. |
| Background image sepia + dark overlay creates muddy artifacts | Per-section QA. If a specific image looks wrong, swap the dark overlay opacity locally. |

## 10. Definition of done

- Settings → Reading row works on iOS dark mode + light + system follow.
- Sleep timer stops audio reliably across 15/30/45/60 + "end of section."
- Font scale persists across cold-start.
- WCAG AA contrast verified for body text in dark theme.
- No new hex literals introduced in PR diffs (RULEBOOK §3.13).
- Tests pass.

## 11. Open questions

1. Should "System" default be on for new installs once dark mode is stable? Recommend yes, after one release of explicit-opt-in data.
2. Font scale slider or stepped buttons? Stepped is friendlier in this audience.
3. Should sleep timer also fade audio out over the last 10 seconds? Yes — it matches the parchment aesthetic.
