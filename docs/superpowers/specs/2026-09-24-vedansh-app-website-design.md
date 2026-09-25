# vedansh.app — marketing website

**Date:** 2026-09-24
**Status:** Approved (design)
**Branch:** `feat/vedansh-app-website`
**Ships as:** new `website/` folder + a small `mobile/` copy fix; no native change, no OTA

## Problem

Vedansh's marketing presence is a single 8.2 KB page on GitHub Pages at
`persisharma.github.io/get-vedansh` — an `<h1>`, two store badges, and a `/privacy` page. There is
no `/terms` (404) and no support page, yet `mobile/store.config.json` points **all three** App
Store URLs (`marketingUrl`, `supportUrl`, `privacyPolicyUrl`) at it.

The domain `vedansh.app` is now registered and parked at GoDaddy. Nothing serves it.

Separately, and discovered while gathering this: the app's own support address is wrong.
`mobile/src/data/help/content.ts:1` sets `SUPPORT_EMAIL = 'incardible.app@gmail.com'` — a
different project's mailbox — and the address is also hardcoded in the Hindi (`:20`) and English
(`:35`) legal copy, and printed on the live privacy page. Shipped in 1.4.7.

## Goal

A four-page static site at `https://vedansh.app`, visually continuous with the app, that:

- sells the app off the copy that already exists in `mobile/store.config.json`,
- satisfies the store's privacy/support/marketing URL requirements from our own domain,
- corrects the support address everywhere it appears, in the app and on the web.

## Non-goals

- No blog, CMS, changelog, or generator. Hand-written static HTML/CSS.
- No analytics, no cookies, no third-party scripts beyond Google Fonts.
- No app functionality change. The only `mobile/` edits are the support address and store URLs.
- No web version of the app. Screenshots only.
- No email hosting on the domain (no MX); support is a Gmail mailbox.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| Source location | `website/` in `persisharma/aadhyatma` | One repo; brand tokens and screenshots live beside the app that produces them. Mirrors the CreditScore → incardible.in setup. |
| Stack | Hand-written HTML/CSS + minimal JS | Four pages. No build step, no dependencies, nothing to keep upgraded. |
| Primary domain | apex `vedansh.app`, `www` → 301 | Shorter in store listings; matches the app name. |
| DNS | Stays at GoDaddy | Zero MX/TXT records to migrate; `A @ → 75.2.60.5` + `CNAME www`. Same wiring as incardible.in. |
| Deploys | Netlify CLI, manual `netlify deploy --prod` | Explicitly requested: same as incardible.in. Trade-off accepted (that site's live page drifted from git). |
| Support address | `vedansh.app.support@gmail.com` | New mailbox; no email hosting needed. |
| Pages | `/`, `/privacy`, `/terms`, `/support` | Everything the store listing needs, from our own domain. |
| In-app email fix | Same PR as the website | One change, one review. |
| Design | Parchment manuscript, as the app | Continuity ad → store → app; honours the warm-only palette rule. |

## Design language

Tokens are lifted from `mobile/src/theme/colors.ts` into CSS custom properties on `:root`. No
inline per-page overrides — incardible.in's page rebrands itself with an inline `:root` block on
top of stale CSS variables, and that is the drift this avoids.

| CSS var | Value | From | Role |
|---|---|---|---|
| `--parchment` | `#F3E7C9` | `parchment` | page ground |
| `--parchment-soft` | `#F8EFD6` | `parchmentSoft` | raised surfaces |
| `--parchment-deep` | `#E9D9B1` | `parchmentDeep` | section banding |
| `--ink` | `#1A0E03` | `ink` | body text (≈15.4:1 on parchment) |
| `--ink-soft` | `#5A3A1E` | `inkSoft` | subheads |
| `--ink-muted` | `#6E5230` | `inkMuted` | captions (≈5.9:1) |
| `--saffron` | `#B8621B` | `saffron` | CTAs, links, accents |
| `--saffron-deep` | `#8A3E0B` | `saffronDeep` | CTA hover, accent text |
| `--gold` | `#A67C34` | `gold` | rules, ornament |

Type: **Cormorant Garamond** for display (continues both the app's verse type and the old site's),
**Inter** for UI and body. Indic display text in headers uses the system Devanagari stack rather
than shipping a Noto Serif Devanagari webfont — one Hindi line does not justify the payload.

The app's palette rule holds on the site: **warm only, never green/red in chrome.**

## Structure

```
website/
├── netlify.toml          # security headers + image caching; NO SPA catch-all
├── index.html            # landing
├── privacy/index.html
├── terms/index.html
├── support/index.html
├── styles.css            # tokens on :root, shared by all four pages
├── script.js             # nav toggle + scroll reveal, nothing else
├── robots.txt
├── sitemap.xml
└── images/
    ├── icon.png          # from mobile/assets/icon.png
    ├── favicon.png       # from mobile/assets/favicon.png
    ├── og.png            # 1200×630, built for this
    ├── shots/*.png       # Maestro captures (committed)
    └── art/*.png         # downsized sketch illustrations from repo images/
```

`.netlify/` goes in `.gitignore` (the CLI writes a `state.json` with the site id into it).

`netlify.toml` copies incardible's security headers and immutable `/images/*` caching but **drops
its `/* → /index.html 200` rule** — that catch-all is for a SPA and would swallow real 404s and
shadow `/privacy`, `/terms`, `/support`.

## Landing page sections

1. **Nav** — icon + "Vedansh", anchors to the feature sections, "Get the app" CTA. Collapses to a toggle under 720px.
2. **Hero** — `<h1>Vedansh`, the store subtitle "Bhagavad Gita, Panchang & japa", a one-line
   positioning sentence, both store badges, one device screenshot. Sanskrit gloss ("a portion of
   the Vedas") as a quiet line, as the store description opens.
3. **Trust strip** — Free · Ad-free · No account · Works offline. Four flat items, no icons-for-the-sake-of-icons.
4. **Four feature sections**, alternating image side, in this order:
   - **Reader** — 18 chapters / 701 shlokas, Hindi + English + IAST, one verse per page, adjustable size.
   - **Panchang & Daily Muhurat** — tithi/nakshatra/yoga/karana, sunrise for your city, Choghadiya + Rahu Kaal + Abhijit, Purnimant/Amanta, Vikram Samvat.
   - **Sadhana** — daily routine by deity, 4-to-41-day Sankalp, 108-bead japam counter, mantra alarms.
   - **Theerth & Listen** — dham map by state/category/yatra, bhajan/aarti player with background audio.
5. **Private by design** — no account, no ads, no tracking, fully offline; location optional and never leaves the device.
6. **Download** — both store badges again, app icon.
7. **Footer** — Privacy · Terms · Support, store links, and the public-domain attribution the store description carries.

Copy is derived from `mobile/store.config.json`'s description, not written fresh, so the site, the
App Store and Play (`mobile/play-listing/metadata/android/{en-IN,hi-IN}`) all say the same thing.

## The other pages

- **`/privacy`** — ported from the current Pages site, then re-verified against what the app actually
  requests: location (optional, on-device, "never leaves your device" per `app.json`), notifications,
  `UIBackgroundModes: audio`, `SCHEDULE_EXACT_ALARM`, `RECEIVE_BOOT_COMPLETED`. No account, no ads,
  no tracking, no analytics. Correct support address.
- **`/terms`** — new. Drafted from the in-app legal copy in `mobile/src/data/help/content.ts`
  (fair-use non-commercial study, no warranty, no scholarly or sectarian authority claim, texts from
  public-domain classics) so the app and the site cannot contradict each other.
- **`/support`** — the address plus a short FAQ: works offline, why location is optional, japam
  alarms not firing (exact-alarm permission), reading languages, how to report a text error
  (mirrors the app's "report a discrepancy" mailto).

## Screenshots

New `mobile/.maestro/flow-website.yaml`, run through the existing
`marketing/linkedin/capture.sh` — it already boots Expo Go against production Metro (`--no-dev`, so
no LogBox overlay) and sets a marketing status bar (9:41, charged, full bars).

Captures the four clusters above. Chosen PNGs are **committed** to `website/images/shots/`; note
that `marketing/linkedin/shots/` is gitignored, so captures must be copied out of it.

Per `.maestro` authoring rules, the flow selects on stable **English accessibility labels**, not
visible text — iOS default Hindi renders Devanagari, which Maestro's iOS tree cannot read.

## Mobile-side changes (same PR)

1. `mobile/src/data/help/content.ts` — `SUPPORT_EMAIL` → `vedansh.app.support@gmail.com`, and the
   two inline mentions at `:20` (Hindi) and `:35` (English).
   Consumers: `MoreScreen.tsx:207,210` and `buildDiscrepancyMailto` (`:59`). No test and no Maestro
   flow asserts the address, and no visible label changes, so no new e2e is owed under RULEBOOK §0.
2. `mobile/store.config.json` — `marketingUrl` → `https://vedansh.app`,
   `privacyPolicyUrl` → `https://vedansh.app/privacy`, `supportUrl` → `https://vedansh.app/support`.

## Deploy

Netlify site created from the repo with base and publish directory `website`, no build command.
`netlify link` writes `website/.netlify/state.json` (gitignored). Ship with
`netlify deploy --prod` from `website/`.

GoDaddy DNS for `vedansh.app`: delete domain forwarding, delete the two parking A records
(`15.197.148.33`, `3.33.130.190`), add `A @ → 75.2.60.5`, repoint `CNAME www → <site>.netlify.app`,
TTL 600, nameservers untouched. Then provision the Let's Encrypt certificate and force HTTPS —
`.app` is HSTS-preloaded, so the site cannot load over plain HTTP at all.

Adding `vedansh.app` to the **incardible** Netlify site by mistake is the one action that would
disturb that site; a new site is created for this.

## Verification

Static site, no test framework — so the gate is explicit and checkable:

- **Local**: serve `website/` and confirm all four pages render; nav, anchors and every footer link
  resolve; no console errors; no 404s on assets.
- **Responsive**: phone width (375px) and desktop — the four feature sections stack cleanly, no
  horizontal scroll, the nav collapses.
- **Contrast**: body text on parchment and caption text on parchment both clear WCAG AA, matching
  the ratios pinned in `mobile/src/theme/__tests__/colors.contrast.test.ts`.
- **Post-deploy**: `dig +short vedansh.app` → `75.2.60.5`; `dig +short www.vedansh.app CNAME` →
  the Netlify host; `curl -sI` → 200 on all four pages, 301 on `http://`, HSTS header present, and
  a **real 404** on a junk path (proves the SPA catch-all is absent).
- **Unaffected**: `curl -sI https://incardible.in` still 200.

## Follow-ups (not in this PR)

- Create the `vedansh.app.support@gmail.com` mailbox (needed before `/support` is truthful).
- Update the Play Console listing's website and privacy URLs.
- Add a redirect on `persisharma/get-vedansh` → `https://vedansh.app` (GitHub Pages cannot 301;
  meta-refresh + canonical). Keep the repo — old store listings and shared links point there.
- App Store Connect metadata URLs can be updated without a new build; `store.config.json` carries
  them for the next submission.
