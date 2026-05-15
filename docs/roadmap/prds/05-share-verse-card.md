# PRD-05 — Share Verse as Parchment Card

| | |
|---|---|
| **Status** | Proposed |
| **Target release** | v1.7.1 |
| **Window** | Weeks 36–37 (31 Aug – 11 Sep 2026) |
| **T-shirt size** | S (~2 dev-weeks) |
| **Owner** | TBA |

---

## 1. Problem

When a user reads a verse that resonates, the next move is to share it — on WhatsApp, Instagram story, or family group chat. Today there's no surface for this. The conversion from "I love this verse" to "I told someone about Vedansh" is lost. This is the single cheapest growth surface in the app (no ad spend; no server cost; one tap).

## 2. Goal

Ship a Share affordance on every reader page that produces a styled, parchment-themed verse card (PNG, ~1080 × 1350 portrait) with attribution back to the app. Measured by:

- ≥ 8% of reader sessions trigger Share.
- ≥ 50% of triggered shares complete the OS share sheet.
- Share-driven installs detectable via App Store referral as a meaningful tail (no fixed target; baseline this quarter).

## 3. Non-goals

- Custom card backgrounds chosen by user. v1 = one card design.
- Card-by-card analytics on which verses are shared most (PRD-06 captures this passively).
- Watermark removal or "premium" share. Free, always.

## 4. User stories

> As a user moved by BG 2.47, I want to tap Share and post the verse to my family WhatsApp group with the verse visibly attributed to Vedansh.

> As an Instagram story user, I want the resulting image to fit a portrait story canvas (1080 × 1920 is ideal; 1080 × 1350 acceptable).

## 5. Scope

### In scope (v1.7.1)

1. **Share button.** A small saffron share-icon button on every reader page, top-right (next to bookmark). Visible on all `*ReaderScreen` and `JapamCounterScreen` (japam mantra cards share differently — see §6).
2. **Card layout.** Single design:
   - Parchment background (faded sketch + overlay, matching the reader).
   - Verse in Devanagari, centered, large.
   - Meaning (Hi or En based on toggle) below, smaller, italicized in Cormorant.
   - Section name + verse label at top (`Bhagavad Gītā · 2.47`).
   - "॥" ornament divider.
   - Footer: small `vedansh.app` watermark + the section's deity glyph.
3. **Render to image.** Off-screen `react-native-view-shot` capture of a hidden component sized 1080 × 1350. Output PNG.
4. **Share sheet.** Native OS share sheet via `expo-sharing` with the image + a short copy ("From Vedansh — {section}, verse {n}").
5. **Hindi-first toggle on the card.** Whatever the user's `useGitaLanguage` is set to is what the meaning shows. Devanagari verse always renders.

### Out of scope

- Animated / video cards.
- "Share to Instagram Story" deep-link via the IG SDK.
- Custom-text overlays.
- Sharing entire chapters as a multi-page PDF.

## 6. UX notes

- The capture renders off-screen (positioned `absolute` with `opacity: 0` or `top: -10000`) so the user doesn't see a flash.
- On japam pages, the card shows mantra + count (e.g. "108 × Om Namah Shivaya") rather than a single verse — japam is a counting experience, not a textual one.
- Provide a quick haptic feedback (`expo-haptics` already in deps) on capture.
- Failure mode: if `view-shot` fails on a device, fall back to sharing the verse text as plain text via `expo-sharing` — never present a broken state.
- Watermark `vedansh.app` is in `Cormorant Garamond 400 italic` at 60% opacity, bottom-center. Never obscures verse text.

## 7. Technical sketch

- New deps: `react-native-view-shot`, `expo-sharing` (likely already transitively present).
- New component: `mobile/src/components/ShareCard.tsx` — pure presentational, accepts the same `verse` shape consumed by `*VersePage.tsx`. Render off-screen.
- New utility: `mobile/src/utils/shareVerse.ts` — `(verseRef, lang) => Promise<void>`. Composes the card → captures → invokes OS share sheet.
- Telemetry hooks (via PRD-06): `share_initiated`, `share_completed`, `share_failed`.
- No new screens.

## 8. Success metrics

| Metric | Source | Target |
|---|---|---|
| Share-initiation rate | Local event | ≥ 8% of reader sessions |
| Share-completion rate | OS share-sheet result | ≥ 50% |
| Capture failure rate | Sentry | < 1% |

## 9. Risks

| Risk | Mitigation |
|---|---|
| Font rendering inconsistency between on-screen and view-shot output | QA on 5 device combinations; fall back to text share on capture failure. |
| Devanagari ligatures look different in the captured PNG | Pre-load fonts via `expo-font.useFonts` before capture; wait one frame. |
| Privacy: accidentally including user bookmarks / profile in the screenshot | The off-screen component is fully isolated; never reads from `BookmarksContext` etc. |

## 10. Definition of done

- Share button visible on all reader pages and Japam screen.
- Tapping Share produces a clean PNG in < 1.5 s p95.
- OS share sheet appears with PNG attached + caption.
- Card renders correctly in Hi and En toggle states.
- Captured image opens cleanly in WhatsApp, Instagram, Photos.
- Tests: snapshot test of `ShareCard.tsx` for a sample verse from each section type (chalisa, granth, stotram, aarti, japam).

## 11. Open questions

1. Should the watermark be removable in the future for a "supporter" tier? Out of scope; flag for IAP brief.
2. Card aspect ratio — 1080 × 1350 (Instagram feed) or 1080 × 1920 (Story)? Recommend 1080 × 1350 (works for both feed and as a tall story when centered).
3. Include a QR code linking back to the verse in the app? Adds clutter — skip in v1; revisit if shared images go viral and we want attribution to convert.
