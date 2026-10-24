# Vedansh 1.5.3 — submission draft

**Marketing version:** 1.5.3 (bumped in `mobile/app.json`; 1.5.2 stays for testing).
**Build numbers:** auto-incremented by EAS (`eas.json` production profile has `autoIncrement: true`) — do **not** hand-edit iOS `buildNumber` / Android `versionCode`.
**Runtime version:** follows `appVersion` policy → becomes `1.5.3` automatically (matches the store build; avoids OTA runtime mismatch).

## What's new since the last public release (1.5.0)

1.5.1 and 1.5.2 stayed in testing/TestFlight, so 1.5.3 is the first public release since 1.5.0. Headline user-facing additions:

- **Daily Bhakti** — a fresh devotional verse each day with meaning, on a painted card; reading-language toggle + shareable image.
- **In-app Bālakāṇḍa Ramayana comic** (Kids) — illustrated, bilingual HI/EN.
- **Start any stotram as a japa** — one bead per complete recitation; + Mahamrityunjaya Mantra.
- **Location search** — set the Panchang to any town or village in India (#469).
- **Illustrated Puja Vidhi** — step-by-step guides with samagri + bhog guidance (#507).
- **Hands-free auto-slide reading** (#522); **in-app star ratings** (#523).
- New aartis, Surya Chalisa, Garud Puran readings, more kids stories; painted artwork across navigation/readers; per-Granth read tracking; YouTube video fallback for texts with no recording.

## Listing copy

| Asset | Status |
|---|---|
| Apple release notes (EN/HI) | ✅ drafted — `listing/apple/{en-GB,hi}/whatsNew.txt` |
| Google Play release notes (EN/HI) | ✅ drafted (≤500 chars) — `listing/google-play/{en-GB,hi-IN}/releaseNotes.txt` |
| Apple promo text + long description | ✅ updated in `mobile/store.config.json` (auto-pushed by `eas metadata:push`) — adds Daily Bhakti, in-app comic, Puja Vidhi, stotram-as-japa, auto-slide |
| Apple title / subtitle / keywords | unchanged from 1.5.0 |
| Google Play long/short description | ⏳ **not machine-pushed** — Play listing is updated manually in Play Console; mirror the updated description from `store.config.json` if you want the new features reflected there |

## Screenshots & marketing creatives

- **Screenshots are NOT required to ship.** `release.sh` only uploads them when run with `--screenshots` AND a kit exists at `.context/appstore-1.5.3/frames` (none exists). Without that flag, the current App Store screenshot set carries over unchanged.
- **Recommended (optional):** refresh 1–2 screenshots to showcase **Daily Bhakti** (the headline new feature), via the marketing screenshot pipeline (`.context/linkedin-*` kit / Maestro capture).
- **Marketing creatives usable in the listings:**
  - Google Play **Feature Graphic** (1024×500) — a branded banner (Play requires one; can be refreshed).
  - Screenshot **frames** with captions (the kit format `release.sh --screenshots` uploads).
  - App preview **video** (optional, both stores).
  - If you create a few, drop Play feature graphic + framed screenshots and tell me where; I'll wire them into the kit / upload step.

## Test evidence

Post-1.5.1 features verified on iOS (Release build) and Android (Release APK) via the Maestro suite — **no feature regressions found**; red flows traced to stale test-assertions / test-infra, not app defects. Raw run logs: `.context/post151-ios/` (gitignored).

## To submit (when ready)

- **iOS:** `./release.sh` (preflight → tests → build → submit) then `--metadata` to push `store.config.json`. Screenshots optional via `--screenshots`.
- **Android:** EAS submit to the production track lands as `releaseStatus: "draft"` (see `eas.json`); set Play "What's new" from `listing/google-play/*/releaseNotes.txt`.
