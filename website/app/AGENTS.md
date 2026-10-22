# Prototype Instructions

## Approved scope (22 October 2026)

- Visual target: Option 2, Your Daily Sanctuary; retained in evidence/selected-option-2.png.
- Primary goal: maximise app installations. Keep all app offerings discoverable, with deliberately limited web previews (three Gita verses, one opening Chalisa doha, 11-count japa).
- Mobile responsiveness and persistent, unobtrusive app-install access are required.
- Prepare SEO and generative-engine discoverability with pre-rendered English/Hindi content, metadata, structured data, accessible headings and factual FAQs. Prototype remains noindex until an explicitly requested launch.
- Prototype only; production website and mobile app remain separate.

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
- Keep the prototype transferable into a deployable website: self-contained assets, standard production output, deployment guidance and no hardcoded local URLs.

## Hybrid refinement approved by user

- Combine Option 2's sanctuary/navigation with the provided Claude reference at `.context/prototypes/website-v2/index.html` (HTTP preview supplied at port 8770).
- Retain screenshot-led exploration, richer typography and the interactive japa mala. Mala counts stop at 11 on the website; continue in app for the 108-bead practice.
- Read the current app catalog from origin/main (verified commit 6b0014cb, 22 October 2026), rather than assuming the old website branch contains all recent offerings. Include Gita Saar, Garud Puran, illustrated kids stories and Ramayana comic; avoid unsupported total-story counts.
- Preserve Claude's original files. Reuse supplied local app screenshots; this project remains self-contained.


## Compact copy and insights approved by user

- Reduce repeated text; keep the primary installation CTA prominent. Present the full offering catalogue through expandable groups, with details on intent and searchable, pre-rendered content.
- Collect first-party button/section exposures, clicks and download journeys so placement decisions use click rates as well as raw totals. Keep the stats dashboard separate from the visitor experience.
- Distinguish local preview traffic, download intent, store-link clicks and confirmed app installations. Never imply real-user results from QA traffic or true installs from outbound clicks.
- Preserve the live website and existing hit counters. Production analytics setup is prepared here but not published by this task.

## Final merge (22 October 2026) — Claude + Codex review

This folder (`prototypes/vedansh-web-final/`) is the chosen final prototype: Codex's React/Vite build as the base (agreed by both reviewers), with these additions from Claude's reference. `prototypes/vedansh-web-preview/` is left as Codex's working copy.

User decisions to keep:
- The children's section is called **Sanskar** (संस्कार) — nav/category and showcase.
- No "promise cards" section (no account / practice stays yours / free no ads as three cards).
- When Hindi is selected, app screenshots must be the **Hindi** app (`public/assets/hi/app-*.webp`).
- Live since 22 October 2026: this app is `website/app/`, built by `.github/scripts/build-dist.sh` into the site’s `/`, `/hi/` and `/stats/`; all other routes stay the static `website/` pages.

Added sections (`src/Showcase.jsx`, styles at the end of `src/styles.css`):
- **TodayCard** — sunrise, sunset, day choghadiya and Rahu Kaal for a chosen Indian city, computed client-side after mount (pre-rendered HTML unchanged). Tithi/nakshatra/full Panchang stay app-only.
- **SanskarShowcase** — real story covers (cover stems resolved via the app's `ART_STEMS` + manifest on main) and three Bālakāṇḍa comic pages.
- **TheerthShowcase** — four temples; text is the first sentence of each temple's `significanceEn/Hi` from `mobile/src/data/theerth/details/` on main.
- **ShareMaker** — three verses × 4:5 / 9:16 with the app's own deity backgrounds.
- Art is resized local WebP under `public/assets/{sanskar,theerth,share}/` (~0.5 MB total).

Build fix: `scripts/prerender.mjs` disables Vite's dependency optimizer for its SSR-only server; it otherwise threw "The build was canceled" on close and failed `npm run build` (exit 13).

## Insights — agreed by Claude and Codex (22 October 2026)

- One `/stats/` page. **All-time** panel (public) reads the existing site counter `/api/hits?all=1` (D1 `hits`: total, `page:`, `src:` for /get/, `site:` for landings). The counter is kept unchanged; `functions/api/hits.js` is copied verbatim from `website/` so a deploy can't drop it.
- **Last 30 days** (owner token in production): Codex's first-party events (`website_events`).
- **Campaign attribution**: the landing `utm_source` is captured once per visit (`campaign` field, slug only, default `direct`), carried on every event, and summarised in a Campaigns table — separate from the section-level `source`.
- Every on-site link to `/get/` carries `utm_source=website` (+ `utm_medium`), so `/get/` source rows stay meaningful.
- Local preview: `analytics/local.mjs` proxies `GET /api/hits?all=1` to the live site read-only (never POSTs) and labels it.
- **Privacy blocker before launch**: the live policy says the website stores "no identifier of any kind". Visit ids, device type, click paths and campaigns contradict that — update the policy (data collected, 30-day retention, DNT/GPC respected) before enabling the events collector in production.
