# Vedansh website prototype

Option 2 (Your Daily Sanctuary), adapted to the primary objective: app installation. A self-contained React/Vite website, not a screenshot mock. No code or assets are imported from the mobile app at runtime.

## Run and build

```sh
npm ci
npm run dev -- --host 0.0.0.0 --port 4173 --strictPort
npm run build
npm test
```

The build generates a portable static site in `dist/client/`: pre-rendered English `/` and Hindi `/hi/`, hashed JavaScript/CSS, local images, robots.txt, sitemap.xml and llms.txt. It also preserves the starter's optional Sites worker/package output under `dist/server/` and `dist/.openai/`. Any ordinary static host can serve the public website. The insights dashboard additionally requires the first-party analytics endpoints described below; a static-only upload does not collect stats.

## Scope and conversion

- 42 offerings in eight categories, grounded in the current website checkout plus the separately verified current main-branch app navigation and content registry. Search works in English and Hindi; category filters and the mobile menu are interactive.
- The hybrid combines the approved sanctuary/navigation shell with the supplied Claude prototype’s screenshot-led discovery and interactive mala. Source screenshots are copied locally; Claude’s original files remain unchanged.
- The large mala has a 108-bead visualization, selectable mantras, visible progress and an 11-chant web limit. Its state is shared with the compact counter.
- Three selected Gita verses (2.47, 2.48, 2.50), one opening Hanuman Chalisa doha and an 11-count japa session. No complete scripture library is shipped to the browser.
- Clear app-only handoff for calculations, personal records, reminders and complete reading. No mock birth chart or fabricated live Panchang.
- Hero, header, sidebar, preview gates and the final invitation promote installation. Desktop download dialog includes the existing official QR code. The phone's sticky download link uses the current platform-aware `vedansh.app/get/` route and passes campaign parameters supported by that route.
- Direct store links use the app's verified IDs. No app installation is performed by the prototype itself.
- Public copy is compact: one hero description, shorter section copy and eight expandable offering groups. All 42 names/descriptions remain in pre-rendered HTML, and search automatically expands matching groups.
- Preview state stays in memory. Forms do not collect birth details or other personal information. First-party interaction analytics are now implemented; there is no third-party analytics SDK or payments integration. A store click is not a confirmed install.

## Where to make changes

- `src/App.jsx`: navigation, responsive shell, reading previews and install interactions; reusable modal, language, store-link and compact japa components.
- `src/FeatureExplorer.jsx`: accessible, keyboard-operable visual explorer using real app screens.
- `src/MalaPreview.jsx`: shared-state interactive mala, mantra selection, and limited-preview gate.
- `src/styles.css`: warm manuscript tokens, responsive layouts and focus styles.
- `src/catalog.js`: bilingual offering descriptions, contextual feature details, store IDs, FAQ copy.
- `src/preview-content.json`: deliberately bounded text samples copied verbatim from app JSON.
- `src/seo.js`: metadata, canonical URLs, language alternates and JSON-LD.
- `scripts/prerender.mjs`: portable HTML generation and crawler files.
- `public/assets/`: retained first-party app/site artwork, screenshots, icon and QR.
- `evidence/selected-option-2.png`: approved visual direction. Browser captures and the QA report document the implementation.

## SEO and generative-engine discoverability

Both languages ship meaningful HTML before JavaScript runs: all offering names/descriptions, installation links, semantic headings and FAQ answers. This makes the content accessible to readers and crawlers that do not execute JavaScript. Canonicals, reciprocal hreflang, title/description, Open Graph, Twitter cards, iOS Smart App Banner and JSON-LD are included. Structured data describes Organization, SoftwareApplication, WebSite, WebPage, ItemList and the visible FAQs; it contains no invented ratings or testimonials.

`llms.txt` is a supplementary factual directory, not a special ranking mechanism. No ranking, rich result, AI citation or increase in installs is claimed. The implementation follows [Google's JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) and [AI search guidance](https://developers.google.com/search/docs/appearance/ai-features).

The prototype deliberately ships **noindex** metadata and `Disallow: /`. A public build is explicit:

```sh
VEDANSH_PUBLIC_LAUNCH=true npm run build
```

This changes the generated robots metadata and robots.txt. It does not publish anything. Dev preview always stays noindex.

## Moving into the real website

1. Keep the existing `website/` production folder and domain untouched while this is reviewed. This prototype is in `prototypes/vedansh-web-preview/`.
2. Integrate the static output or configure the eventual host to build this project and publish `dist/client`. Preserve the real site's `/get/`, privacy, terms, support, hit-count functions, existing redirects and relevant multilingual legal pages. Merge existing sitemap entries rather than dropping them. Keep real 404s; this website does not need a wildcard SPA rewrite.
3. Canonical/hreflang and social metadata are prepared for `vedansh.app`, not a preview domain. Keep preview deployments noindex; enable the public build only for an approved launch on the intended domain. Serve `/hi/` as its generated document.
4. Review catalog completeness against the app version being marketed. The website checkout is on the older feat/vedansh-app-website branch. Current origin/main was separately inspected at 6b0014cb (22 October 2026, 14:17 IST), confirming Gita Saar, Garud Puran, illustrated children’s stories and the Bālakāṇḍa comic. Those are included without unverified numerical story counts. Audio is presented as the app's listening section; its current source catalog contains placeholder recordings, so no fake playable clip is offered on the web.
5. Retain the current QR and smart-download route. If download routing changes, regenerate the QR from the approved destination and verify both stores on actual devices. Confirm asset reuse/licensing against the release inventory.
6. Connect approved install attribution, set host cache/security headers, and verify Search Console, both language URLs, redirects and mobile store handoff after deployment. Validate structured data against the deployed page. Test on actual iPhone and Android browsers; local responsive browser checks do not prove native store opening or install conversion.

The page is ready to move forward as a website codebase. It has not been deployed or merged into the existing live site.

## Reference and asset provenance

Selected Option 2 is retained in `evidence/selected-option-2.png`. The second supplied reference is `.context/prototypes/website-v2/index.html`, inspected through the user-provided HTTP preview. App screens were copied from its `shots/` folder. The dedicated Krishna–Arjuna hero was generated with the built-in image tool using Option 2 and the existing devotional illustration as references, then exported as WebP; its original raster is retained under `evidence/`. The mala’s functional bead visualization follows the supplied reference’s interactive pattern with warm palette colors and the requested preview limit. No new live Panchang approximation or sample compatibility score has been imported.


## Website insights

Open `/stats/` on the running preview. `npm run dev` and `npm run preview` both expose the collector and report API. The dashboard saves and shows **actual local preview activity**, including browser QA traffic; no sample statistics are seeded. It is not connected to the live website.

- Rankings: button clicks, exposed visits, unique exposed-and-clicked visits and click rate. An exposure requires at least 50% visible for one continuous second in a visible tab; hidden, disabled, inert and obstructed controls are excluded. Sections use heading or button exposure.
- Journey: offering/preview opens, install prompts, direct App Store/Play Store clicks, smart-download link clicks, their originating placement, and the last four clicks before download. Per-visit sequence numbers preserve action order across asynchronous batches.
- Segments: last 24 hours / 7 / 30 days, mobile / tablet / desktop, English / Hindi. Placement identifiers remain stable across translations. Every event carries design version `compact-v3`; bump `VERSION` for a materially different placement experiment. The current dashboard deliberately reports only the current version.
- Export all placement aggregates as CSV. Only the top ten are shown initially; expand for the complete list. Low exposure counts are marked below 30 visits; that label is not a statistical significance test. Treat local QA counts as a verification tool, not evidence of real user preference.
- Privacy: random per-tab visit token in sessionStorage, reused on reload while active within 30 minutes; no account IDs, cookies, input values, search queries, full URLs, IP addresses, user-agent strings or referrers in stored events. Fetch suppresses the referrer. Browser Do Not Track / Global Privacy Control disables collection. Visit counts are tab sessions, not unique people. Store clicks do not prove installation; QR scans and app installations need separate attribution.
- Reliability: batched same-origin requests, keepalive flush when leaving, event-ID deduplication, payload/field limits, serial atomic local writes. Blockers, offline exits and browser restrictions can lose events; the installation journey never waits for analytics.
- Local storage: ignored `.local/analytics.json`, capped at 100,000 events. Events older than 30 days are excluded from reports and pruned on the next write. Local reads are loopback-only unless `ANALYTICS_ADMIN_TOKEN` is supplied as a Bearer token. A static-only or starter Sites deployment does **not** supply this backend.

### Cloudflare Pages integration prepared, not deployed

The existing production `website/functions/api/hits.js` already uses a D1 `DB` binding. The prototype supplies additive, separate `/api/events` and `/api/stats` adapters in its root `functions/`; the existing visit counters are untouched. Implementation follows [Pages function routing](https://developers.cloudflare.com/pages/functions/routing/) and [D1 prepared/batched queries](https://developers.cloudflare.com/d1/worker-api/d1-database/).

During an explicitly requested hosting integration:

1. Build from this project root and publish `dist/client`, retaining the root `functions/` and shared `analytics/core.mjs` for the Pages bundler. Merge existing production routes/functions before publishing.
2. Apply `deploy/cloudflare/schema.sql` to the intended D1 database and bind it as `DB`. The schema creates `website_events` and an index; it does not change `hits`.
3. Set a random secret `ANALYTICS_ADMIN_TOKEN` of at least 32 characters in the hosting environment. `/api/stats` refuses access without it. The dashboard prompts for the token and keeps it in memory only. The dashboard HTML itself contains no private data and stays noindex; API responses are no-store/noindex.
4. Configure edge rate limiting for the public collection endpoint and scheduled deletion for strict retention during periods with no website traffic. The adapter prunes old events on writes and bounds reads to the newest 100,000 events, showing a truncation notice if reached. For larger traffic, replace raw-event rollups with database aggregates.
5. Verify the deployed endpoints, owner access and real phone handoffs. Update the website privacy notice to describe first-party interaction analytics before launch. This local task has not created a database, configured a secret, changed the live privacy page, or deployed anything.

The production adapters have local contract tests. Real Cloudflare binding, database migration and deployed browser operation remain integration checks.
