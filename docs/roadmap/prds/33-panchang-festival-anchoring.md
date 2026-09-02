# PRD-33 — Panchang + Festival-Anchored Content

| | |
|---|---|
| **Status** | Proposed |
| **Target release** | v1.6.0 (panchang strip) → v1.6.1 (festival deep-link to content) |
| **Window** | Weeks 1–6 of Q1 2027 |
| **T-shirt size** | M (~5 dev-weeks; ephemeris-data vendor selection parallel) |
| **Owner** | TBA |
| **Depends on** | PRD-01 (notifications shipped) |

**Bundle-only constraint preserved.** A 5-year ephemeris table for tithi/nakshatra/yoga/karana + a festival manifest are bundled JSON. Refreshed each App Store release. No runtime API.

---

## 1. Problem

Sri Mandir's #1 daily-open trigger is the panchang strip — today's tithi, nakshatra, festivals, vrat days. It's the *utility* hook that gets users to open the app even on a non-reading day. Vedansh has zero calendar context today: opening the app on Hanuman Jayanti or Pradosh shows the same Home screen as a Tuesday afternoon in March. The user has no signal that *today is the day to read this section.*

Beyond the missed trigger, our content has natural calendar anchors we don't surface:
- Hanuman Chalisa / Bajrang Baan → Tuesday + Saturday + Hanuman Jayanti
- Shiva Stotram / Shiv Chalisa → Monday + Pradosh + Mahashivratri
- Sundarkand → Tuesday + Saturday (traditional)
- Durga Stotram / Durga Chalisa → Navratri
- Ganesh Stotram / Ganesh Chalisa → Wednesday + Ganesh Chaturthi + every Chaturthi
- Vishnu Sahasranama → Ekadashi
- Krishna Stotram → Janmashtami, Friday

The opportunity is to bind panchang directly into our reader — not just display the calendar, but *route the day* into the most relevant scripture.

## 2. Goal

Surface today's panchang on the Daily Bhakti tab and the Home header, with one-tap navigation to the section most relevant to today (vrat / tithi / nakshatra / festival). Measured by:

- ≥ 50% of users see the panchang surface in their first session per day.
- ≥ 25% tap-through from the panchang surface into a section.
- Daily-open rate (notification + organic): ×2 within 8 weeks of launch.
- ≥ 80% accuracy on tithi/festival dates vs. Drik Panchang (gold standard) across all major Indian regions.

## 3. Non-goals

- **Personal kundli / horoscope.** Out by strategy.
- **Muhurat calculator** (auspicious times for marriage etc.) in v1. Powerful add-on; defer to v2.
- **Sunrise/sunset by GPS in v1.** Approx by city; precise GPS-based panchang adds complexity and battery; defer.
- **Regional variants** (Telugu / Tamil panchanga conventions) in v1.6. North-Indian (Vikram Samvat / Purnimanta) only in v1; Amavasyanta (South Indian) added in v1.6.2.
- **Streaming panchang from a server.** Out by constraint.
- **Subscription-only premium panchang.** Free utility.

## 4. User stories

> As a Tuesday-morning Hanuman bhakt, I want the app to greet me with "Today is Tuesday — read Hanuman Chalisa" and let me tap straight into it.

> As a Pradosh observer, I want a reminder the evening before that tomorrow is Pradosh, and a one-tap path to Shiva Stotram.

> As a festival-minded user, I want to see Janmashtami / Navratri / Mahashivratri counting down on the Home page weeks before, with the relevant scripture pre-staged.

> As a user in Mumbai, I want tithi sunrise-aligned to Indian Standard Time, not UTC.

> As a non-Hindu-calendar-literate user (NRI / younger Indian), I want the panchang explained simply on tap — what tithi means, why this day matters — without me having to Google it.

## 5. Scope

### In scope — v1.6.0 (panchang strip)

1. **Panchang strip on Daily Bhakti screen.** A horizontally laid-out card:
   ```
   मंगलवार · 26 May 2026
   तिथि: तृतीया · नक्षत्र: मघा · योग: सिद्धि · विक्रम संवत 2083
   ```
   Tappable to expand into a panchang detail screen.

2. **Panchang detail screen.** Shows tithi (with paksha), nakshatra, yoga, karana, sunrise/sunset (per chosen city), Hindu month, samvatsara. Each term tappable → a glossary modal explaining it in lang-matched plain Hindi/English.

3. **Bundled ephemeris data.**
   - 5-year coverage (2026 → 2030), pre-computed.
   - Storage shape: `mobile/src/data/panchang/ephemeris-{YYYY}.json` per year, ~200KB each.
   - Generated at build-time from `swisseph` (Swiss Ephemeris) library; not bundled in runtime.
   - **Pre-computed for 12 reference cities** (Delhi, Mumbai, Kolkata, Chennai, Bengaluru, Hyderabad, Pune, Ahmedabad, Jaipur, Lucknow, Patna, Varanasi) + 3 NRI clusters (NY, LA, London). User picks city in settings; default = Delhi.

4. **Bundled festival manifest.**
   - `mobile/src/data/panchang/festivals.json` — every festival across 5 years with `(date, name, nameHi, type: 'tithi-festival' | 'vrat' | 'jayanti' | 'observance', linkedSections: string[], significance: string)`.
   - ~140 entries / year (covers all major + medium-tier festivals + monthly vrats: Ekadashi×24, Pradosh×24, Sankashti×12, Amavasya×12, Purnima×12, Chaturthi×12).

5. **Home header banner (festival-aware).**
   - When today is a high-priority festival, the Home header shows a single line: "आज हनुमान जयंती है · Open Hanuman Chalisa →" (tap = navigate).
   - When today is a vrat day with linked content (Tuesday/Saturday for Hanuman, Monday for Shiva, Ekadashi for Vishnu), the same single-line nudge, lower-intensity styling.
   - Never shown on ordinary days.

6. **Notifications integration (extends PRD-01).**
   - User opt-in for "festival reminders" (separate toggle from daily verse).
   - Notification fires the evening before a vrat / morning of a festival, lang-matched, deep-links into the linked section.

### In scope — v1.6.1 (deeper content binding)

7. **"Today's bhakti" curation.** Daily Bhakti tab no longer pulls a random verse from `versePool.ts` on festival/vrat days — it pulls from the festival's linked sections deterministically. Random pool stays for ordinary days.

8. **Section-page badge.** When a section's day of significance is today, its Home card shows a small "आज · today" badge.

### Out of scope

- Muhurat calculator.
- Personal kundli.
- Real-time GPS panchang.
- Amavasyanta (South Indian) calendar — v1.6.2.
- Past panchang (only today + future).
- Astrological matching.

## 6. UX notes

- Panchang strip is calm, not alarmist. Saffron underline on the tithi name; ink on the rest.
- Glossary modal uses the existing modal pattern from the reader; lang-aware copy.
- Festival nudge on Home is one line, dismissible per-day. Never blocks content.
- Festival notification body is reverent: "कल प्रदोष व्रत है। सायं शिव चालीसा पढ़ें।" Not marketing-style.
- City picker lives in Settings, not in the panchang strip — choosing a city is a one-time act.
- Sunrise/sunset displayed as "5:42 am — 6:48 pm (Delhi)" with city visible so the user knows what they're seeing.
- Color-language: never red for "inauspicious" tithis; we don't editorialize. The data is data.

## 7. Technical sketch

- **Build pipeline.**
  - New script `scripts/build-panchang.ts` runs `swisseph` to generate per-year ephemeris JSON. Run quarterly + before releases. Output committed to repo (versioned, auditable).
  - Festival manifest is hand-curated (see §8); the script does NOT auto-generate festivals (rules vary).
- **Runtime.**
  - New module `mobile/src/data/panchang/`:
    - `getPanchang(date, city)` returns `{ tithi, nakshatra, yoga, karana, paksha, hinduMonth, samvatsara, sunrise, sunset }`.
    - `getFestivalsForDate(date)` returns matching festival entries.
    - `getTodaysFocus(date)` returns the section to surface (festival > vrat > weekday-deity > null).
  - Loaded once at boot; in-memory map; trivial.
- **Home / Daily Bhakti screens.**
  - New `<PanchangStrip>` component, mounts on Daily Bhakti.
  - New `<FestivalBanner>` component on Home, conditional on `getTodaysFocus`.
- **Notifications.**
  - Extend PRD-01's scheduler: on app boot, schedule festival notifications for the next 30 days (per user's opt-in).
- **Tests:**
  - `mobile/src/data/__tests__/panchang.ephemeris.test.ts` — spot-check 20 dates against Drik Panchang gold values; pass within tolerance.
  - `mobile/src/data/__tests__/panchang.festivals.test.ts` — every festival has at least one `linkedSection`; every `linkedSection` exists in `library`.
  - `mobile/src/components/__tests__/PanchangStrip.test.tsx` — renders in both languages.
  - `mobile/src/components/__tests__/FestivalBanner.test.tsx` — shows on festival days, hidden otherwise.

## 8. Content & data track

- **Ephemeris.** Swiss Ephemeris (LGPL) is the canonical source. Build-time only, not bundled at runtime — only the precomputed daily values are bundled. License is clear.
- **Festival manifest.** Hand-curated by content lead + scholar reviewer. Source-of-truth is Drik Panchang for North Indian (Vikram Samvat / Purnimanta). Cross-checked against Bhaktivedanta Calendar for major festivals.
- **Glossary.** Per-term lang-matched explanation (~80 entries). Content lead drafts; scholar reviews. Stored as `panchang/glossary.json`.
- **Annual refresh.** Each App Store release before Dec rolls the ephemeris forward; festival manifest hand-reviewed for the new year.

## 9. Binary-size budget

| Asset | Size |
|---|---|
| Ephemeris (5 years × 12 cities) | ~1.2 MB |
| Festival manifest (5 years) | ~80 KB |
| Glossary | ~30 KB |
| **Total** | **~1.4 MB** |

Comfortably within budget.

## 10. Success metrics & instrumentation

| Metric | Source | Target |
|---|---|---|
| Panchang surface impression rate / DAU | Local counter | ≥ 50% |
| Panchang → section tap-through | Local counter | ≥ 25% |
| Festival-banner tap-through | Local counter | ≥ 40% |
| Festival notification open rate | Local notif callback | ≥ 30% |
| Tithi accuracy vs. Drik Panchang | Audit | ≥ 99% |
| Festival-date accuracy vs. Drik Panchang | Audit | 100% |

## 11. Risks

| Risk | Mitigation |
|---|---|
| Regional festival-date disagreement (Mathura vs. ISKCON Janmashtami) | Document our convention in glossary; choose North-India Vikram Samvat / Purnimanta as primary; surface "regional variant" link for major festivals. |
| Sunrise/sunset error for non-listed cities | Default to nearest listed city; clear "(Delhi)" label so user knows. |
| Bundling Swiss Ephemeris at runtime would inflate size 30+ MB | Build-time only — precomputed daily values shipped. CI gate forbids runtime import of `swisseph`. |
| Festival-banner fatigue if shown for every vrat | Tier system: high-priority festival (Jayanti / Navratri / Shivratri) = banner; vrat (Ekadashi / Pradosh / Sankashti) = subtler styling; weekday-deity = no banner, only Daily Bhakti curation. |
| User in different timezone sees "today" mismatching | Use device local time; document explicitly. |
| Vrat reminder fires after the vrat day starts (timezone edge) | Schedule from the *user's local sunrise*; not midnight UTC. |

## 12. Definition of done

- Panchang strip renders accurately on Daily Bhakti for any date 2026–2030 across 15 cities.
- Festival banner appears on every festival day; tap routes to the right reader.
- Festival notifications fire reliably on a test device across timezones.
- Ephemeris accuracy audit passes ≥ 99% on a 100-date random sample vs. Drik Panchang.
- All festival → section links resolve to a real `library` entry (test).
- Glossary terms covered in both languages.
- TestFlight 14-day soak with at least 3 major festival days in window; manual QA confirms banners + notifications fire.

## 13. Open questions

1. Vendor-buy vs. build the panchang? Recommend build (Swiss Ephemeris) — control + no per-API cost. Decision: build.
2. Do we let users pin a "default deity" so the festival banner can prioritize their lineage? Defer to v1.6.2.
3. Should Daily Bhakti's verse swap be hard-deterministic (always Hanuman on Tuesdays) or "weighted toward, but not exclusive"? Recommend hard-deterministic on festival days, weighted on weekdays.
4. Sunrise / sunset to 1-minute precision OK, or do we need seconds? 1 minute is enough.
5. Do we expose "next festival" countdown? Recommend yes — small line under panchang strip: "Janmashtami in 12 days."
