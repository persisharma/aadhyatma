---
title: vedansh.app — marketing website setup (Netlify) and build runbook
type: runbook
sources: [mobile/app.json, mobile/store.config.json, mobile/src/theme/colors.ts, marketing/linkedin/README.md, .github/workflows/ci.yml, persisharma/get-vedansh, DNS for vedansh.app]
last_verified_date: 2026-09-22
confidence: high
status: current
---

## Summary

Prep work for standing up a **new marketing website for Vedansh at `vedansh.app`** on Netlify,
replacing the current GitHub Pages page at `persisharma.github.io/get-vedansh`. This runbook
records what exists today (app facts, brand tokens, asset gaps, domain state), the exact Netlify
and DNS steps, and the decisions still open before we build. Nothing has been created yet — no
`website/` folder, no Netlify site, no DNS change.

The pattern is copied from a working sibling setup: the CreditScore repo's `website/` folder →
Netlify static site → `incardible.in`. Its `netlify.toml` is the template referenced below.

## 1. What exists today

### The app (the thing we're marketing)

| Fact | Value | Source |
|---|---|---|
| Name / slug | Vedansh / `vedansh` | `mobile/app.json` |
| Version | 1.4.7 (iOS build 52, Android versionCode 9) | `mobile/app.json` |
| Bundle / package | `com.prashantsharma.vedansh` | `mobile/app.json` |
| App Store | `https://apps.apple.com/app/vedansh/id6766086529` | live `get-vedansh` page |
| Play Store | `https://play.google.com/store/apps/details?id=com.prashantsharma.vedansh` | live `get-vedansh` page |
| Store subtitle | "Bhagavad Gita, Panchang & japa" | `mobile/store.config.json` |
| Categories | Lifestyle, Reference | `mobile/store.config.json` |
| Positioning | Bilingual Hindu devotion companion — sacred library, daily Panchang/Muhurat, sadhana + Sankalp, japam alarms, bhajan player, Theerth map. Free, ad-free, no account, fully offline. | `mobile/store.config.json` description |

The store description in `mobile/store.config.json` is the best existing long-form copy — the
site's feature sections should be derived from it, not written from scratch.

### The current website

- Repo: `persisharma/get-vedansh` (public) — `index.html` (8.2 KB) + `privacy/`, `README.md`. Last push 2026-07-08.
- Served by GitHub Pages at `https://persisharma.github.io/get-vedansh` → a one-screen page: `<h1>Vedansh`, both store badges, `/privacy/`.
- **No `/terms`** (404).
- Fonts: Cormorant Garamond + EB Garamond via Google Fonts.
- **App Store listing points at it** — `mobile/store.config.json` sets all three URLs to it:
  `privacyPolicyUrl`, `marketingUrl`, `supportUrl` = `https://persisharma.github.io/get-vedansh[/privacy]`.
  These must be updated after `vedansh.app` goes live (§5).

### The domain

- `vedansh.app` is registered and **parked**: A records `15.197.148.33` / `3.33.130.190` (GoDaddy parking), `www` resolves to the same.
- Nameservers: `ns13.domaincontrol.com`, `ns14.domaincontrol.com` → **DNS is at GoDaddy**.
- `.app` is on the HSTS preload list — **HTTPS is mandatory**, a plain-HTTP site will not load in any modern browser. Netlify's automatic Let's Encrypt cert satisfies this; just don't skip provisioning it.

### Brand tokens (from the app, so the site matches it)

From `mobile/src/theme/colors.ts` (warm manuscript palette — the app's design rule is
**warm only, never green/red in chrome**):

| Token | Hex | Role |
|---|---|---|
| `parchment` | `#F3E7C9` | page background |
| `parchmentSoft` / `parchmentDeep` | `#F8EFD6` / `#E9D9B1` | surface variants |
| `ink` | `#1A0E03` | primary text (≈15.4:1 on parchment) |
| `inkSoft` / `inkMuted` | `#5A3A1E` / `#6E5230` | secondary / caption text |
| `saffron` | `#B8621B` | primary accent, CTAs |
| `saffronDeep` | `#8A3E0B` | accent hover / deep text accent |
| `gold` | `#A67C34` | ornament, dividers |
| notification color | `#B8621B` | matches `app.json` |

Fonts in the app: Cormorant Garamond (display/verse), Noto Serif Devanagari / Gujarati / Kannada
(Indic), Inter (UI). The existing site already loads Cormorant Garamond + EB Garamond — keep that
lineage.

### Assets — what we have and what's missing

- **Have**: `images/` in the repo root — light pencil-sketch deity illustrations (Hanuman ×4, Ram-Hanuman, Shiva). `mobile/assets/icon.png`, `adaptive-icon.png`, `splash-icon.png`, `favicon.png`.
- **Missing**: app screenshots for the site. None are committed (`marketing/linkedin/shots/` is gitignored).
- **How to get them**: `marketing/linkedin/capture.sh` already boots the app in Expo Go on a booted iOS sim, sets a marketing status bar (9:41, full battery), and runs Maestro flows that write PNGs. Add a `flow-website.yaml` capturing Home / Panchang-Muhurat / Gita reader / Japam / Theerth, then commit the chosen PNGs under the new site folder (they must be committed — the site needs them at build time, unlike the reel pipeline's regenerable output).
- Needed for social/OG: a 1200×630 OG image. Does not exist yet.

### Repo facts that affect the setup

- Repo `persisharma/aadhyatma`, public, default branch `main`.
- **No `website/` folder, no `netlify.toml`, no Netlify state anywhere in the repo.**
- `.github/workflows/ci.yml` is path-filtered to `mobile/**`, so a new `website/**` folder will not trigger CI. If we want the site linted/checked, that needs its own workflow.
- Netlify CLI is **not installed** on this machine (`netlify`/`ntl` not on PATH).

## 2. Netlify setup — the checklist

### Prereqs

1. Netlify account with access to the `persisharma` GitHub repos (the existing `incardible.in` site lives in the same Netlify account model: site linked to a folder, `publish = "."`).
2. Decide §6.1 (where the site source lives) **before** creating the Netlify site — it determines the base directory.
3. Optional but recommended: `npm i -g netlify-cli` for `netlify deploy --build` previews and `netlify link`.

### Create the site (git-backed, recommended)

1. Netlify → **Add new site → Import an existing project → GitHub →** `persisharma/aadhyatma`.
2. Build settings for a no-build static site:
   - **Base directory**: `website` (the new folder)
   - **Build command**: *(empty)*
   - **Publish directory**: `website`
   - Branch to deploy: `main`
3. Netlify → **Build & deploy → Build settings → Ignore builds**: set the ignore command to skip deploys when nothing under the site folder changed, otherwise every mobile commit redeploys the site:
   ```
   git diff --quiet HEAD^ HEAD -- website/
   ```
4. Commit `website/netlify.toml` (template in §3) so headers/redirects are versioned, not UI-only.
5. Rename the site to something recognisable (e.g. `vedansh-app`) so the `*.netlify.app` fallback URL is meaningful.

### Attach the domain

Netlify → **Domain management → Add a domain** → `vedansh.app`. Then pick one DNS path:

**Option A — keep DNS at GoDaddy (least disruption, recommended if GoDaddy holds other records):**
at GoDaddy DNS for `vedansh.app`, replace the parking records with:

| Type | Name | Value |
|---|---|---|
| A | `@` | `75.2.60.5` (Netlify's apex load balancer — verified in use by the sibling site) |
| CNAME | `www` | `<site-name>.netlify.app` |

Delete the two parking A records (`15.197.148.33`, `3.33.130.190`) and any parking CNAME on `www`.

**Option B — move DNS to Netlify** (`dns1..4.p0x.nsone.net`, exact set shown in the Netlify UI):
change nameservers at GoDaddy. Gives apex ALIAS + automatic cert renewal without record juggling,
but Netlify then owns **all** records for the domain — re-create any existing MX/TXT (email,
verification) there first.

Then in Netlify:
- Set the **primary domain** (pick `vedansh.app` apex, redirect `www` → apex, or the reverse — be consistent with what we put in canonical tags and the store listing).
- **HTTPS → Verify DNS configuration → Provision certificate** (Let's Encrypt). Mandatory for `.app`.
- Enable **Force HTTPS**.

### Verify

```bash
dig +short vedansh.app                  # expect 75.2.60.5 (Option A)
dig +short www.vedansh.app              # expect <site>.netlify.app
curl -sI https://vedansh.app | head -20 # expect 200, Server: Netlify, HSTS header
curl -sI http://vedansh.app | head -3   # expect 301 → https
curl -sI https://vedansh.app/privacy    # expect 200 (or 301 → /privacy/)
```

## 3. `netlify.toml` template

Modelled on the working `incardible.in` config, with the SPA catch-all removed — it's a
multi-page static site, and a `/* → /index.html 200` rule would swallow real 404s and break
`/privacy` and `/terms`.

```toml
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/images/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## 4. Site content plan (derived from what exists)

Minimum viable set of pages:

- `/` — hero (name + the store subtitle line), the app's own screenshots, feature sections lifted from the store description (Sacred Library, Bilingual Reading, Daily Panchang & Muhurat, Vrat/Festivals/Kathas, Daily Sadhana & Sankalp, Japam, Listen, Theerth, Private by Design), both store badges, footer.
- `/privacy` — port the existing `get-vedansh/privacy` content, re-verify it against the app's current permissions: location (optional, on-device only — the `app.json` string says "Location never leaves your device"), notifications, audio background mode, exact alarms. No account, no ads, no tracking, offline.
- `/terms` — **does not exist yet**, needs writing.
- `/support` — App Store requires a working `supportUrl`; today it points at the marketing page. A simple contact/FAQ page is enough (needs a support email address — not yet chosen).

Also: `favicon` from `mobile/assets/favicon.png`, `robots.txt`, `sitemap.xml`, OG image, and
`<link rel="canonical">` matching the primary-domain choice.

## 5. Post-launch follow-through (easy to forget)

1. **Update `mobile/store.config.json`** — `privacyPolicyUrl` → `https://vedansh.app/privacy`, `marketingUrl` → `https://vedansh.app`, `supportUrl` → `https://vedansh.app/support`. Ships with the next store submission; App Store Connect metadata can also be edited without a new build.
2. **Redirect the old site** — add a meta-refresh/JS redirect (GitHub Pages can't do 301s) in `persisharma/get-vedansh/index.html` → `https://vedansh.app`, and keep `/privacy` redirecting too, since older store listings and any shared links still point there. Don't delete the repo.
3. **Play Store listing** — update the website/privacy URLs in the Play Console entry as well.
4. Update `README.md` / `wiki/overview.md` to mention the new `website/` folder, and this runbook's `last_verified_date`.

## 6. Open decisions (settle these before building)

1. **Where the source lives** — `website/` inside `persisharma/aadhyatma` (one repo, Netlify base directory + ignore-command, matches the CreditScore pattern) **vs** a separate repo (cleaner CI, but a second place to maintain). The existing `get-vedansh` repo is a third option, though its name is off-brand for a site at `vedansh.app`.
2. **Stack** — hand-written static HTML/CSS (what the sibling site does; zero build, instant deploys) **vs** a generator like Astro (components + real pages, needs a build command). Given the site is ~4 pages, static is the lower-risk default; a generator earns its keep only if we plan a blog/content section.
3. **Primary domain** — apex `vedansh.app` or `www.vedansh.app`.
4. **DNS** — Option A (records at GoDaddy) or Option B (Netlify DNS). Needs a check for existing MX/TXT records on the domain before choosing B.
5. **Deploy trigger** — Netlify git integration (recommended: every merge to `main` deploys, with deploy previews on PRs) **vs** manual CLI deploys. Note the sibling site drifted from its repo precisely because it was hand-deployed — the live `incardible.in` page is not what's in git.
6. **Support email** — needed for `/support` and the store listing.
7. **Screenshot set** — which five or six screens sell the app best, and whether to frame them in device bezels.

## Gotchas

- `.app` TLD is HSTS-preloaded: no HTTPS means no site at all, not a warning. Provision the cert before announcing.
- Don't copy the sibling site's `/* → /index.html 200` redirect; it breaks multi-page routing.
- Without a Netlify ignore command, every `mobile/**` commit triggers a website deploy.
- `.github/workflows/ci.yml` won't see `website/**` — no automatic check on site changes unless we add one.
- The app's design rule is warm palette only, never green/red in chrome (`mobile/src/theme/colors.ts`). The site should hold that line to look like the app.
- `marketing/linkedin/shots/` is gitignored; screenshots chosen for the site must be committed somewhere that isn't ignored.
