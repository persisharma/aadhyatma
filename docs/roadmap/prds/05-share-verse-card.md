# PRD-05 — Share Verse on WhatsApp (image + app link)

| | |
|---|---|
| **Status** | Proposed |
| **Target release** | v1.7.1 |
| **Window** | Weeks 36–37 (31 Aug – 11 Sep 2026) |
| **T-shirt size** | S (~2 dev-weeks) |
| **Owner** | TBA |

---

**Bundle-only constraint:** card rendering happens on-device via `react-native-view-shot`; sharing uses the OS share sheet (`expo-sharing`). No server-side image rendering, no Open Graph endpoint, no analytics SDK. The PNG never touches our infrastructure — it goes directly from the device to whatever app the user picks (WhatsApp first, but the sheet supports any target).

**Primary target: WhatsApp.** This is the dominant family/community channel for the Hindu devotional audience in India. The card design and copy are tuned to render well in a WhatsApp chat preview and to convert a recipient into an installer via an App Store / Play Store link.

---

## 1. Problem

When a user reads a verse that resonates, the next move is to share it on WhatsApp — to a family group, a guru group, an old friend on a festival morning. Today there's no surface for this. We watch a high-intent moment ("I love this verse") evaporate because the user has to screenshot, crop, paste — and even then the recipient has no way to find Vedansh.

This is the single cheapest growth surface in the app: no ad spend, no server cost, one tap, distribution piggy-backs on a network the user already trusts.

## 2. Goal

Ship a Share affordance on every reader page that produces a styled, parchment-themed verse card (PNG) **paired with an app link**, optimized for WhatsApp. Measured by:

- ≥ 8% of reader sessions trigger Share.
- ≥ 50% of triggered shares complete the OS share sheet (user actually picks a target).
- ≥ 60% of completed shares target WhatsApp (validated via OS share-sheet result on iOS where available, else inferred from TestFlight user surveys).
- ≥ 30% of WhatsApp shares result in at least one tap on the embedded link by the recipient (proxied via App Store / Play Store referral data; we can't measure recipient behavior directly because that would require analytics infrastructure we're not building).
- Share-driven installs visible in App Store Connect as a meaningful tail.

## 3. Non-goals

- Animated / video cards.
- "Share to WhatsApp Status" via WhatsApp's deep-link APIs (separate flow with image + caption is sufficient for v1; revisit if Status becomes a measured request).
- Custom-text overlays / annotation by user.
- Sharing entire chapters as a multi-page PDF.
- Server-side OG cards or branded landing pages. The link goes directly to the App Store / Play Store product page; that page is the landing.
- Watermark removal or "premium" share. Free, always.
- Card-by-card analytics on which verses are shared most (out by bundle-only constraint anyway).

## 4. User stories

> As a Hanuman devotee on a Tuesday morning, I want to tap Share on a Hanuman Chalisa chaupai and have WhatsApp open with the image **and** a short caption that includes a link to install Vedansh — so my family group sees both the verse and a way to get the app.

> As a recipient in that family group, I tap the link and land directly on the App Store / Play Store page for Vedansh.

> As a user moved by BG 2.47, I want the image alone to look like Vedansh — even if the caption gets edited or trimmed by WhatsApp, the parchment card itself carries the brand.

## 5. Scope

### In scope (v1.7.1)

1. **Share button.** A small saffron share-icon button on every reader page, top-right (next to bookmark). Visible on all `*ReaderScreen` and `JapamCounterScreen` (japam variant — see §6).
2. **Card layout (PNG, 1080 × 1350 portrait).**
   - Parchment background (faded sketch + overlay, matching the reader).
   - Verse in Devanagari, centered, large.
   - Meaning (Hi or En based on toggle) below, smaller, italicized in Cormorant.
   - Section name + verse label at top (`Bhagavad Gītā · 2.47`).
   - "॥" ornament divider.
   - Footer band:
     - Left: small Vedansh wordmark + a single Devanagari glyph (ॐ / section deity).
     - Right: `Vedansh — vedansh.app` (or whatever final domain).
   - The card visually carries the brand even if the caption is trimmed.
3. **Share caption template (per language).**
   - Hindi (default):
     ```
     {sectionNameHi} · {verseLabelHi}
     "{firstLineHi}"

     Vedansh ऐप पर पढ़ें: {appStoreLinkSmart}
     ```
   - English:
     ```
     {sectionNameEn} · {verseLabelEn}
     "{firstLineEn}"

     Read on Vedansh: {appStoreLinkSmart}
     ```
   - `appStoreLinkSmart` is a single URL that resolves correctly per recipient:
     - iOS users: App Store product page.
     - Android users: Play Store product page (once Android launches).
     - Web fallback: a tiny static landing page that detects platform and redirects. **Bundle-only note:** the static landing page is not part of "the app" and does not violate the constraint — it's a marketing artifact, not a runtime dependency. If we want zero web infrastructure, we ship two raw store URLs and let WhatsApp render both; recommend the single smart URL for cleaner UX, but it's a separable decision (see §11).
4. **Render to image.** Off-screen `react-native-view-shot` capture of a hidden component sized 1080 × 1350. Output PNG.
5. **Share sheet invocation.** Native OS share sheet via `expo-sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share verse' })`. The sheet shows WhatsApp prominently if installed. We do not invoke a WhatsApp-specific deep-link in v1 because the OS share sheet handles attaching the image + caption to WhatsApp's compose screen reliably across iOS and Android.
6. **Caption auto-attached.** When the share sheet supports a `message` field, we populate it with the §5.3 template. WhatsApp on iOS pulls this into the caption automatically; on Android the behavior is the same via `Intent.ACTION_SEND`.
7. **Hindi-first toggle on the card.** Whatever the user's `useGitaLanguage` is set to is what the meaning + caption use. Devanagari verse always renders.
8. **Embedded screenshot-of-app affordance** (optional path). For users who'd rather share "what the app looks like" than a stand-alone verse card, a long-press on the Share button offers a second mode: capture the actual reader screen (not the off-screen card) and share that. Same caption + link. This is a single switch, not a separate button.

### Out of scope

- Animated cards, video cards, WhatsApp Status–specific flows.
- IG SDK / IG Story deep links.
- Recipient-side analytics. We can't measure who tapped the link without analytics infra; we lean on App Store Connect's referrer data only.
- Branded landing page beyond a minimal platform-redirect. Anything richer (e.g. opening the verse in a web reader) is Q4+.

## 6. UX notes

- Capture renders off-screen (positioned `absolute` with `opacity: 0` or `top: -10000`) so the user doesn't see a flash.
- On japam pages, the card shows mantra + count (e.g. "108 × ॐ नमः शिवाय") rather than a single verse — japam is a counting experience.
- Quick haptic feedback (`expo-haptics` already in deps) on capture.
- Failure mode: if `view-shot` fails on a device, fall back to a **text-only share** that still includes the verse text + caption + link. The user never sees a broken state. Logged to local crash log.
- Wordmark + URL in card footer use `Cormorant Garamond 500` (not italic; italic at this size on WhatsApp's image preview compresses to unreadable). Footer band has slight saffron tint to separate visually from verse text.
- Link in caption is the **last** line so it isn't truncated by WhatsApp's collapsed-caption UI.

## 7. WhatsApp-specific considerations

- **WhatsApp compresses images.** 1080 × 1350 survives the compression with no visible artifacts; we test on iOS WhatsApp and Android WhatsApp.
- **Caption length.** WhatsApp shows the first ~3 lines before "Read more"; we put the section name + first verse line in the top 3 lines and the link in line 4 onward. The link is always tappable even when caption is collapsed.
- **Preview / OG card.** When a recipient taps the link in chat, WhatsApp will fetch OG metadata from the store URL — both App Store and Play Store serve usable OG tags. No additional work needed.
- **No WhatsApp Business API**, no auto-send, no contact picking. All sharing flows through the OS share sheet with the user in control.

## 8. Technical sketch

- New deps: `react-native-view-shot`, `expo-sharing` (likely already transitively present).
- New component: `mobile/src/components/ShareCard.tsx` — pure presentational, accepts the same `verse` shape consumed by `*VersePage.tsx`. Render off-screen.
- New util: `mobile/src/utils/shareVerse.ts` — `(verseRef, lang, mode: 'card' | 'screenshot') => Promise<void>`. Composes the card → captures PNG → builds caption with the smart-link → invokes OS share sheet.
- New config: `mobile/src/data/shareLinks.ts` — single source of truth for the App Store / Play Store URLs and the smart redirector URL. Centralised so a future change is one edit.
- Telemetry hooks (via PRD-06's local diagnostics ledger): `share_initiated`, `share_completed`, `share_failed`, plus `share_mode` ∈ `{card, screenshot}` and `share_lang` ∈ `{hi, en}`. No network.
- No new screens.

## 9. Success metrics

| Metric | Source | Target |
|---|---|---|
| Share-initiation rate | Local diagnostics ledger | ≥ 8% of reader sessions |
| Share-completion rate | OS share-sheet result callback | ≥ 50% |
| WhatsApp completion share | OS share-sheet result + TestFlight survey | ≥ 60% of completions |
| Capture failure rate | Local crash log (PRD-06) | < 1% |
| Store-referral installs (post-launch trend) | App Store Connect Sources tab | rising for 4 consecutive weeks after v1.7.1 |

## 10. Risks

| Risk | Mitigation |
|---|---|
| Font rendering inconsistency between on-screen and view-shot output | QA on 5 device combinations; fall back to text + link share on capture failure. |
| Devanagari ligatures look different in the captured PNG | Pre-load fonts via `expo-font.useFonts` before capture; wait one frame. |
| Privacy: accidentally including user bookmarks / profile in the screenshot | The off-screen "card" component is fully isolated; never reads from `BookmarksContext` etc. The optional "screenshot of app" mode captures only the reader screen, which has no PII. |
| Caption gets edited by user and the link is removed | Acceptable — the card still carries the wordmark. Document in PR description that brand survives caption tampering. |
| WhatsApp on a future OS version changes how it accepts share intents | Annual QA pass. Fall back to image-only share if caption attach breaks. |
| Smart-redirect link requires a tiny web endpoint that isn't part of the app | Optional. v1 can ship with two store URLs in the caption (one iOS, one Android). The single smart link is a UX nicety; flag in §11. |

## 11. Open questions

1. **Smart link or two store links?** Bundle-only is fine with two raw URLs; a single smart URL gives a cleaner WhatsApp preview. If we add the smart redirect, it lives outside the app (marketing domain) and is therefore *not* a runtime backend — it does not violate bundle-only. Recommend the smart link; cost is a static HTML page.
2. Card aspect ratio — 1080 × 1350 (Instagram feed; works fine in WhatsApp) or 1080 × 1920 (story-tall)? Recommend 1080 × 1350.
3. Should the watermark be removable in the future for a "supporter" tier? Out of scope; flag for IAP brief.
4. Include a QR code in the card itself (in addition to the link in caption)? Adds clutter; skip in v1, revisit if WhatsApp's caption-strip behavior becomes a real problem.
5. Should the optional "screenshot of app" mode be discoverable (a UI toggle) or hidden (long-press only)? Recommend long-press only — keeps the primary action one tap.

## 12. Definition of done

- Share button visible on all reader pages and Japam screen.
- Tapping Share produces a clean PNG (1080 × 1350) in < 1.5 s p95.
- OS share sheet appears with PNG attached + caption (verse + link) populated.
- In QA on iOS and Android, picking WhatsApp delivers the image with the caption attached, link tappable.
- Card renders correctly in Hi and En toggle states.
- Long-press on Share offers the "screenshot of app" mode.
- Tests: snapshot test of `ShareCard.tsx` for a sample verse from each section type (chalisa, granth, stotram, aarti, japam).
- App Store Connect Sources page shows the new referral path is live (WhatsApp shows up as a source within 2 weeks of launch).
