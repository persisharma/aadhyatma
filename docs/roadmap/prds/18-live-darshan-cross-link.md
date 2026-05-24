# PRD-18 — Live Darshan + Scripture Cross-Link

| | |
|---|---|
| **Status** | Proposed |
| **Target release** | v1.9.0 (3 partner temples) → v1.9.1 (10 temples + recorded aartis archive) |
| **Window** | Weeks 1–12 of Q4 2027 (partnerships work begins Q3 in parallel) |
| **T-shirt size** | XL (~10 dev-weeks + a full quarter of partnership outreach) |
| **Owner** | TBA + partnerships lead |
| **Depends on** | PRD-11 (backend), PRD-12 (panchang for aarti timings) |

**Constraint break:** streaming requires a third-party CDN. We **do not run the streaming infrastructure** — we embed partner-temple streams (YouTube Live, JioCinema, or temple-trust-provided RTMP→HLS). Our backend stores the stream registry; the video itself never touches us.

---

## 1. Problem

Sri Mandir's strongest emotional moment is **live darshan** — watch the morning aarti at Tirupati, the evening aarti at Mahakaleshwar, the abhishek at Vaishno Devi, on your phone, while you're at your office desk. Sri Mandir reports hundreds of thousands of concurrent viewers at major aartis. The user *feels they attended*.

Vedansh has no equivalent. We have the *textual depth* (Shiv Tandav Stotram, Hanuman Chalisa, Mahalakshmi Ashtakam) but no *witnessed ritual*. The complementarity is the moat: Sri Mandir does darshan; Aadhyatma does the textual cross-link — **read the stotram while watching the abhishek.**

## 2. Goal

Ship live darshan streams from 3 partner temples in v1.9.0, with scripture cross-link (the relevant chalisa / stotram surfaces alongside the stream, syncing where possible). Extend to 10 temples in v1.9.1. Measured by:

- ≥ 20% of WAU watch at least one live darshan within 4 weeks of launch.
- ≥ 12 min median session length when watching a live stream.
- ≥ 35% of darshan viewers tap "Read the related stotram" cross-link.
- 3 signed temple partnerships by v1.9.0; 10 by v1.9.1.
- ≥ 99.5% stream uptime during scheduled aartis.

## 3. Non-goals

- **Hosting our own streaming infrastructure.** Out by cost + scale.
- **Recording / saving streams locally** (most temple agreements forbid).
- **Pay-per-darshan / VIP darshan.** Out by strategy in v1 — too transactional for our reading brand.
- **Live commentary / chat overlay.** No social layer on darshan.
- **AR darshan / virtual 3D temple in v1.** AR experiments deferred — high build cost, unclear demand.
- **Stream creation tools for users / pujaris.** UGC streaming is out.

## 4. User stories

> As a Mahakaleshwar devotee in Bangalore, I want to watch the Bhasma Aarti live at 4am IST, with the Shiv Tandav Stotram opened alongside so I can recite in time.

> As a Tirupati devotee, I want a notification 10 minutes before the daily Suprabhata Seva and a one-tap path into the stream.

> As a user without high bandwidth, I want a lower-bitrate option that doesn't buffer.

> As a working professional, I want to "catch up" — see the recorded aarti from this morning if I missed the live time slot.

> As a privacy-conscious user, I want to watch darshan without creating a profile or being tracked across the app.

## 5. Scope

### In scope — v1.9.0 (3 temples)

1. **Darshan tab / surface.**
   - New entry in Home: "Mandir Darshan" tile next to existing category tiles. (Or a separate tab depending on info-architecture review — recommend tile.)
   - Lists 3 partner temples with current status: 🟢 LIVE / 🟠 next aarti at HH:MM / ⚫ closed.
   - Tap → temple detail screen.

2. **Temple detail screen.**
   - Stream player (full-width, 16:9, with letterbox parchment frame).
   - Below: scheduled aartis for today (from panchang + temple manifest).
   - "Read this aarti's stotram" CTA — opens the bundled section at the relevant verse.

3. **Partner temple set — v1.9.0 (target):**
   - **Tirupati Tirumala (TTD)** — Suprabhata Seva, daily darshan.
   - **Mahakaleshwar (Ujjain)** — Bhasma Aarti.
   - **Vaishno Devi (Katra)** — morning aarti.
   - All three are already streamed publicly; the partnership is about *attribution + scheduling data + permission to embed* — not infrastructure.

4. **Stream backend.**
   - Single endpoint: `GET /v1/darshan/temples` returns `[{ templeId, name, location, currentStreamUrl, nextAarti: {start, name}, schedule: [...] }]`.
   - Stream URL is HLS (`.m3u8`); player is `expo-video`.
   - When no live stream available, returns the most recent archive URL.

5. **Schedule + notifications.**
   - Per-temple aarti schedule bundled (refreshable via App Store release; live overrides via backend if a temple notifies us of changes).
   - Opt-in per-temple notifications: 10 min before scheduled aarti. Extends PRD-01.

6. **Scripture cross-link.**
   - Each aarti has a `linkedSectionId` and `linkedVerseId` (e.g. Mahakaleshwar Bhasma Aarti → `shiva-strotam` start). Bundled in the temple manifest.
   - Cross-link CTA visible on temple detail; tap routes through `entryRoutes.ts`.
   - **Stretch — sync mode:** the live stream timecode is mapped to a chapter-level (not verse-level) progression in the linked stotram, advancing the reader as the aarti progresses. Stretch because sync requires per-temple timing manifests we may not own. Manual fallback always available.

### In scope — v1.9.1 (rollout)

7. **Add 7 more temples** (target list, subject to partnerships):
   - Siddhi Vinayak (Mumbai), Kashi Vishwanath (Varanasi), Somnath, Iskcon (Mayapur), Golden Temple (cultural — separate decision), Sai Baba Shirdi, Khatu Shyam.

8. **Recorded aarti archive.**
   - Last 7 days of each temple's morning + evening aarti, available on-demand.
   - Stored as URLs in our backend; videos live on partner CDN / YouTube unlisted.

### Out of scope

- Hosting streams ourselves.
- VIP / paid darshan.
- AR / VR.
- User-uploaded darshan.
- Chat / comments.

## 6. UX notes

- Stream player frame uses parchment styling — feels native to Vedansh, not a YouTube embed.
- Visible attribution: "Stream by Temple Trust · Tirumala Tirupati Devasthanams" — never hidden.
- Live indicator: subtle saffron dot, "LIVE" badge.
- Schedule list shows the next 3 events with a "remind me" button per event.
- Cross-link to stotram is contextual — appears only when the active stream's aarti has a linked section.
- Picture-in-picture (iOS / Android) supported so users can watch while reading another section.
- Bandwidth conscious: HLS supports multi-bitrate; user can lower in player settings.

## 7. Technical sketch

- **Backend.**
  - New tables: `temples`, `temple_streams`, `temple_aarti_schedule`, `temple_aarti_archive`.
  - Single endpoint serves the manifest; refreshes from a Postgres source-of-truth.
  - Editor UI (admin only) for adding temples / updating schedules — initially a simple internal admin form.
  - Latency-sensitive `currentStreamUrl` field; backend pings each partner stream every 60s to verify HLS availability; serves the last-known-good URL with a `liveAt` timestamp.

- **Mobile.**
  - New `mobile/src/features/darshan/`:
    - `DarshanListScreen.tsx`, `TempleDetailScreen.tsx`.
    - `useTempleManifest.ts` (TanStack Query against the manifest endpoint, 15-min cache).
    - `StreamPlayer.tsx` wraps `expo-video` with HLS support.
  - PIP via `expo-video`'s built-in.

- **Notifications.**
  - Extend PRD-01: opt-in per temple. On boot, schedule the next 7 days' aartis as local notifications based on bundled schedule + backend overrides.

- **Sync mode (stretch).**
  - Per-temple `streamTimecodeToVerse` map. Temple admin pushes "aarti started" event → backend timestamps → reader cross-link advances chapter pointer in step.
  - For v1.9.0, ship without sync mode unless a partner provides reliable timing — manual cross-link is fine.

- **Tests.**
  - `mobile/src/features/darshan/__tests__/DarshanListScreen.test.tsx`.
  - `mobile/src/features/darshan/__tests__/TempleDetailScreen.test.tsx` — live state, schedule rendering, cross-link routing.
  - `mobile/src/features/darshan/__tests__/StreamPlayer.test.tsx` — HLS errors handled, PIP toggles.
  - Backend contract tests: manifest endpoint shape, partner outage → archive fallback.

## 8. Partnerships workstream (longest pole)

- Begin **Q3 2027** (parallel to PRD-15 development).
- For each partner temple:
  1. Outreach via trust office; introduce Vedansh.
  2. Sign a 1-page agreement: attribution, no recording, no monetization without partner consent, 30-day termination notice.
  3. Get the HLS / YouTube embed URL + scheduled aarti times.
  4. Collect deity / linked-section metadata.
- Risks: temple trusts move slowly. Mitigation: start with TTD (mature digital ops), Mahakaleshwar (already YouTube-live), Vaishno Devi (digital-darshan precedent).
- **Critical:** confirm we have legal permission to embed within our app — most public YouTube Live streams are OK, but trusts may have stricter terms.

## 9. Compliance & legal

- **Streaming embeds**: each partner's terms of service / explicit consent.
- **No recording**: explicitly forbidden in code (no save / share-as-video).
- **Attribution**: each stream credits the trust visibly + in About page.
- **Bandwidth disclosure**: in app description, "live video uses your data."
- **Children-friendly content**: temple streams are inherently safe; nonetheless, age-gate not required.
- **Geo restrictions**: some partner streams are geo-restricted (India only). Our manifest carries an `availableRegions` field; we hide unavailable streams gracefully outside region.

## 10. Backend cost

- Manifest endpoint: trivial (kilobytes).
- Stream pinging: 10 temples × every 60s = trivial.
- No video transit through our infra → no CDN cost.
- Estimated: +$50/month.

## 11. Success metrics & instrumentation

| Metric | Source | Target |
|---|---|---|
| Darshan WAU rate | Local + backend | ≥ 20% |
| Median darshan session length | Local | ≥ 12 min |
| Cross-link tap-through (darshan → stotram) | Local | ≥ 35% |
| Stream uptime during scheduled aartis | Backend pings | ≥ 99.5% |
| Notification → open rate (aarti reminder) | Local | ≥ 40% |
| Net new installs attributed to darshan content | Backend (deep-link) | ≥ 15% net new |

## 12. Risks

| Risk | Mitigation |
|---|---|
| Partner stream goes down mid-aarti | Pinging detects + UI shows "stream paused" gracefully; archive fallback. |
| Temple revokes embed rights | 30-day termination clause; replace with archive only; communicate to users transparently. |
| App Store / Play Store policy on third-party video embeds | All partners are reputable temple trusts; clear attribution; precedent (Sri Mandir does the same). |
| User expects to "do online puja / send offerings" via darshan | Out of scope; gentle copy clarifies. Donations (PRD-19) is a separate surface. |
| Stream sync mode misaligns and creates a worse experience than no sync | Ship without sync in v1.9.0; sync as opt-in in v1.9.1 with manual verify per temple. |
| Bandwidth cost to user surprises low-data users | Player default to 360p; bandwidth warning on first play. |
| Geo restrictions surprise NRI users | `availableRegions` field; transparent "available in India only" copy. |
| Heavy concurrent load on a viral festival night | We don't host the stream — partner's problem; we communicate fallback ("if stream lags, try the temple's website"). |

## 13. Definition of done

- 3 signed partnerships before v1.9.0 ship.
- Stream player works on iOS + Android with PIP.
- Live indicator + schedule + cross-link all wired.
- Notification path validated for at least 2 aarti cycles in TestFlight.
- Manifest endpoint robust to partner outage (archive fallback).
- Legal sign-off on each partnership; visible attribution; About page updated.
- TestFlight 14-day soak through at least one major festival (Diwali, Kartik Purnima) with concurrent viewer load test.

## 14. Open questions

1. Should we eventually run our own stream infra for control? Recommend no — capex too high; partner reliability is the right ceiling.
2. Recorded archive rights vary by partner — bundle a single source-of-truth or per-partner? Per-partner; flexible. Some partners may forbid archive — surface as "live only."
3. Should darshan have its own bottom tab or nest under Home? Recommend Home tile in v1.9.0; promote to bottom tab in v1.9.1 if engagement validates.
4. Cross-link verse-level sync timing: invest in v1.9.0 or v1.9.1? Recommend v1.9.1 — needs partner timing reliability data first.
5. Picture-in-picture interplay with TTS read-aloud (PRD-17)? Defer; one stream at a time.
