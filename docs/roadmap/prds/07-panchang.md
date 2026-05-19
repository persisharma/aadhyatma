# PRD-07 — Panchang (Today strip + Calendar view)

| | |
|---|---|
| **Status** | Proposed |
| **Target release** | v1.8.0 |
| **Window** | Q4 2026, weeks 40–43 (~4 dev-weeks) |
| **T-shirt size** | L |
| **Owner** | TBA |

---

**Bundle-only constraint:** all panchang values (tithi, nakshatra, vāra, yoga, karana) are computed on-device from a bundled astronomy library. Festival/vrat rules are bundled JSON. No network at any point. Same constraint that's held through Q3.

**Single canonical school:** Drik Panchang (sūrya-siddhānta with modern astronomical corrections — the school used by most North Indian almanacs and online panchang services). Documented as a Settings disclosure so users from other traditions know what they're looking at.

---

## 1. Problem

Today, Vedansh is **timeless**. Every verse, chalisa, and aarti is read the same way regardless of which day it is. But Hindu religious practice is profoundly **time-aware** — the appropriate prayer, fast, or ritual depends on tithi (lunar day), nakshatra (lunar mansion), and vāra (weekday). A user asking "what should I read this Thursday?" or "is today an ekadashi?" has no answer inside the app today.

Three concrete gaps this creates:

1. **No daily anchor.** The Daily Bhakti tab surfaces a random verse from the pool. There's no acknowledgement that this is **Friday in Shukla Paksha Ashtami**, a day with its own religious significance.
2. **Festival blindness.** Hanuman Jayanti, Maha Shivratri, Janmashtami all fall on shifting lunar dates each year. The user has to consult an external panchang site to know when they are — and once they do, they're not in Vedansh anymore.
3. **No planning surface.** A user wanting to schedule a personal vrat or auspicious event has no way to ask "when's the next ekadashi?" or "which Mondays in November fall in Krishna Paksha?"

Filling these gaps makes Vedansh a **daily** companion, not just a reference library.

## 2. Goal

Ship two surfaces backed by one panchang engine:

- **Today strip** on the Bhakti tab — current tithi + nakshatra + vāra + paksha + Brahma Muhurta window. Always visible above the daily verse.
- **Calendar screen** — month-grid view with festival/vrat/ekadashi markers, tappable for full per-day panchang detail.

Measured by:

- ≥ 60% of WAU view the Today strip at least once per week (i.e. open the Bhakti tab and see it).
- ≥ 25% of WAU open the Calendar screen at least once per month.
- Panchang values match the public Drik Panchang website (drikpanchang.com) for **Ujjain, India** on any reference day within ±5 minutes for tithi-end-time.
- Zero panchang-related crashes in production.
- Bundle size growth ≤ +400 KB (astronomy lib + name tables + festival rules).

## 3. Non-goals

- **Multi-school panchang.** No toggle for Surya-Siddhānta vs. Vakya vs. Tamil traditions. We pick Drik and document it. Q5+ if requested.
- **Location-aware panchang.** v1 ships with **Ujjain** as the canonical reference location (23.16°N, 75.78°E — the traditional panchang reference). Users in other parts of India will see tithi boundaries off by minutes, not days — acceptable. Diaspora users (US, UK, Australia) will see larger drift; flagged in Settings.
- **Muhurat advisory beyond Brahma Muhurta.** No "auspicious time to start a business," no Rahu Kaal warnings, no Choghadiya tables. Brahma Muhurta is the one universally recognized devotional window; that's all v1 surfaces.
- **Personal milestone reminders.** ("Your birthday in tithi-terms is…") Q5 if used.
- **Network fetch of panchang.** Bundle-only.
- **Astrology / horoscope.** Distinct domain. Not in scope, ever.
- **Encyclopedic content on the 27 nakshatras / 11 karanas.** That's level "C" panchang. Per the chosen scope (level B), we surface the names and values; we don't ship reference essays on each. The vrat-katha library (PRD-08) covers the "learn deeper" intent.

## 4. User stories

> As a daily practitioner, when I open Vedansh on a Friday morning, I want to see at the top: "Friday · Shukla Paksha · Ashtami · Rohini Nakshatra · Brahma Muhurta 5:14–6:48." It frames my reading in the right calendar context.

> As a Hanuman devotee, I want to know when the next Tuesday in Shukla Paksha falls so I can plan to recite Hanuman Chalisa on a particularly auspicious day.

> As someone observing Ekadashi vrats, I want to look at next month and see which two days are Ekadashi without doing the math myself.

> As a user planning Karwa Chauth, I want to tap October's calendar and immediately see "Kartik Krishna Chaturthi — Karwa Chauth" marked on the right date, with a tap-through to the vrat-katha once that ships in PRD-08.

> As a user from a non-Drik tradition, I want to know what panchang school the app uses so I can decide whether to trust the dates.

## 5. Scope

### In scope (v1.8.0)

1. **Panchang engine.** Pure on-device calculation of the five elements (tithi, vāra, nakshatra, yoga, karana) for any Gregorian date. Uses bundled astronomy library (see §7). Calibrated against Drik Panchang for Ujjain.
2. **Today strip.** Renders at top of the Bhakti tab. Shows:
   - Gregorian date (15 May 2026) + Vikram Samvat year (विक्रम संवत् 2083)
   - Vāra (शुक्रवार · Friday)
   - Paksha + tithi (शुक्ल पक्ष · अष्टमी)
   - Nakshatra (रोहिणी नक्षत्र)
   - Brahma Muhurta window (5:14 – 6:48 AM)
   - Tap-through to Calendar screen
3. **Calendar screen.** Month-grid view (7 × 5/6) with:
   - Today highlighted
   - Per-cell markers: dot for Ekadashi, star for major festival, half-moon for Purnima/Amavasya
   - Tap any day → bottom sheet with full panchang detail for that day + linked vrat/festival if applicable
   - Forward/back month navigation
   - "Today" reset button when navigated away
4. **Festival/vrat marker rules.** Bundled JSON encoding ~30 major festival rules as `{ festivalId, lunarMonth, paksha, tithi, linkSectionId? }`. The engine computes the Gregorian date dynamically — no annual JSON refresh needed.
5. **Linked-content tap-through.** Tap a marked festival → opens the linked section (e.g. Hanuman Jayanti marker → opens Hanuman Chalisa reader). For vrats that don't have content yet (most), the tap shows the panchang detail bottom-sheet only; PRD-08 fills this in.
6. **Bilingual labels.** Tithi names, nakshatra names, vāra, paksha, yoga, karana all ship in both Hindi and English via the existing `useGitaLanguage` hook.
7. **Settings disclosure.** New "Panchang school: Drik · दृक्" line in More tab, with one-line explainer: "Tithi boundaries computed for Ujjain, India. Values may vary by minutes for other locations."

### Out of scope

- All items in §3.
- Adding a new bottom tab. The Bhakti tab reshapes to host Today strip + daily verse; Calendar is a push-screen.
- Pre-computed multi-year panchang JSON. The engine computes on demand — fast enough.
- Editing the panchang school per-user.
- Tithi-tied reading-recommendation engine ("It's Tuesday, you should read Hanuman Chalisa today"). Tempting; out of scope. The Today strip surfaces the context; the user decides what to read.

## 6. UX notes

### Today strip (top of Bhakti tab)

```
┌────────────────────────────────────────┐
│ शुक्रवार · Friday                       │
│ 15 May 2026 · विक्रम संवत् 2083         │
│                                        │
│ शुक्ल पक्ष · अष्टमी                     │
│ रोहिणी नक्षत्र                          │
│                                        │
│ ब्रह्म मुहूर्त: 5:14 – 6:48 पूर्वाह्न    │
│                                                  ›│
└────────────────────────────────────────┘
```

- Parchment-soft background, divider border, saffron-deep tithi name, ink-soft body.
- The right chevron `›` indicates the whole strip is tappable → opens Calendar.
- Devanagari-first; English subtitle in italic Cormorant per the existing pattern.
- Strip height ~140 pt — sits above the existing daily-verse card without crowding.

### Calendar screen

```
┌────────────────────────────────────────┐
│ ‹  मई 2026 · May 2026  ›   [आज / Today] │
│                                        │
│  रवि सोम मंगल बुध गुरु शुक्र शनि         │
│   --   --   --  •1   2   3   4         │
│   5    6    7   8★  9   10  •11        │
│  12   ●13  14  15†  16  17  18         │
│   ┊                                    │
│                                        │
│ Today: 15 May · शुक्ल पक्ष · अष्टमी    │
│ रोहिणी नक्षत्र · No festival today      │
└────────────────────────────────────────┘

Markers:
  •  Ekadashi
  ●  Purnima / Amavasya
  ★  Major festival (e.g. Buddha Purnima)
  †  Today
```

- Tap any cell → bottom sheet rises from below with full panchang detail for that day:
  - Tithi + paksha + tithi-end-time
  - Nakshatra + nakshatra-end-time
  - Yoga + karana
  - Sunrise / sunset (computed by the same engine)
  - If festival/vrat: name + tap-through to linked section (when content exists, PRD-08)
- Past dates render in slightly muted ink to signal "already happened."
- Cells for days outside the current month (the leading/trailing greys in a typical month grid) are dimmed but tappable.

### Settings entry

```
PANCHANG (पंचांग)
─────────────────────────────────
School:    Drik · दृक्
Reference: Ujjain, India

Tithi boundaries follow the Drik
panchang tradition, the standard
used by most North Indian almanacs.
Values may vary by minutes for
users outside India.
```

Static text, no toggle. Lives below Reminders in More tab.

## 7. Technical sketch

### Astronomy engine choice

Two viable libraries surveyed:

- **`astronomy-engine`** (MIT, ~250 KB minified). Pure JS, no deps, computes sun and moon positions to arc-second accuracy. We layer tithi/nakshatra/karana/yoga math on top (~200 lines).
- **`mhah-panchang`** (MIT, ~80 KB). Pre-built panchang library, computes the five elements directly. Less control, but faster integration.

**Recommendation:** Start with `mhah-panchang` for the v1 ship, verify it matches Drik for 30 reference dates against Ujjain, fall back to `astronomy-engine` + custom math if accuracy fails. A 1-week spike in week 40 decides which.

### Module layout

```
mobile/src/panchang/
├── engine.ts          # Computes panchang for a given Date + lat/lon
├── names.ts           # Hi/En name tables: tithi[30], nakshatra[27], etc.
├── festivals.ts       # Rule table — see below
├── festivalEngine.ts  # Resolves festival rules → Gregorian dates for a year
└── __tests__/
    ├── engine.test.ts          # Drik reference assertions
    └── festivals.test.ts        # Known-year festival date verification
```

### Festival rule shape

```ts
type FestivalRule = {
  festivalId: string;
  nameHi: string;
  nameEn: string;
  lunarMonth: 1 | 2 | ... | 12;   // Chaitra=1 ... Phalgun=12 (Amanta system)
  paksha: 'shukla' | 'krishna';
  tithi: number;                  // 1..15
  linkSectionId?: string;         // hanuman-chalisa, shiv-chalisa, ...
  marker: 'star' | 'dot' | 'halfmoon';
};
```

Roughly 30 entries: 9 major festivals + 24 ekadashis (2 per month) + 12 purnimas + 12 amavasyas, with computed dates resolved by the engine each year.

### Today-strip integration

The existing `DailyBhaktiScreen.tsx` reshapes:

```tsx
<ScrollView>
  <PanchangTodayStrip onPress={() => navigation.navigate('Calendar')} />
  <Ornament />
  <DailyVerseCard verse={verse} onRefresh={refresh} />
</ScrollView>
```

### Calendar screen

New `mobile/src/screens/PanchangCalendarScreen.tsx` registered in a new `BhaktiStackNavigator.tsx` (the Bhakti tab becomes a stack rather than a single screen — minor navigation refactor). Calendar fetches a month's worth of panchang values eagerly (~30–31 days × <5 ms each = <150 ms total); month-grid renders from that.

### Tests

- `panchang/__tests__/engine.test.ts` — 30 reference days from Drik Panchang's published archive for Ujjain. Each assertion checks tithi, nakshatra, paksha within tolerance.
- `panchang/__tests__/festivals.test.ts` — known-year festival dates: Hanuman Jayanti 2026, Diwali 2026, Maha Shivratri 2027, etc. — verified against drikpanchang.com.
- Both run under `tsx` (no React Native deps), like the existing scheduler and search-index tests.

### Bundle-size budget

- `mhah-panchang`: ~80 KB
- Name tables (Hi + En for tithi/nakshatra/yoga/karana/vāra/paksha): ~12 KB
- Festival rules JSON: ~5 KB
- New screen + components: ~20 KB

Total: ~120 KB. Well under the ≤400 KB target.

## 8. Success metrics & instrumentation

| Metric | Source | Target |
|---|---|---|
| WAU view Today strip ≥ 1×/week | Local diagnostics ledger (PRD-06) | ≥ 60% |
| WAU open Calendar ≥ 1×/month | Local diagnostics ledger | ≥ 25% |
| Festival tap-through rate | Local diagnostics ledger | ≥ 40% of festival-day Calendar opens |
| Drik-reference parity (Ujjain) | Engine test against 30 reference days | tithi-end-time within ±5 min |
| Panchang-related crash rate | Local crash log + App Store Connect | 0 |

## 9. Risks

| Risk | Mitigation |
|---|---|
| Drik-reference parity fails for some dates | 1-week spike in week 40 validates library against Drik before scope commits. If failure rate > 10%, swap to `astronomy-engine` + hand-rolled math. |
| Tithi convention drift (sunrise-to-sunrise vs. midnight-to-midnight) | Documented in code: we use **sunrise-to-sunrise tithi convention**, matching Drik. Engine tests pin this. |
| Adhik maas (extra lunar month) breaks festival rules | Festival engine handles it: rules are tied to lunar months, so an adhik maas naturally pushes downstream festivals to the *nija* (regular) month per Drik tradition. Verified in tests against 2023 (the last adhik maas year). |
| User in diaspora sees wrong tithi for their location | Settings disclosure says "Reference: Ujjain." We accept this drift in v1. Q5: per-location toggle if requested. |
| Festival rules disagree by sect (Smarta vs. Vaishnava Janmashtami, etc.) | Pick Smarta convention (more common). Document in festival JSON. Single edge case per festival. |
| Bundle size grows past +400 KB | Trim astronomy library to needed ephemeris data only. `mhah-panchang` is already lean. |
| Calendar perf on low-end Android | Eager-compute the month in a `useMemo`; pre-build name lookups. <150 ms for a month is well within budget. |

## 10. Definition of done

- Today strip live in production at the top of the Bhakti tab.
- Calendar screen reachable from the Today strip header.
- Tithi/nakshatra/vāra/paksha values match Drik Panchang for Ujjain on 30 reference dates within ±5 min.
- Festival markers correctly placed for Hanuman Jayanti 2026, Diwali 2026, Maha Shivratri 2027, and 8 more festivals across 12 months.
- Festival tap-through opens the linked section reader (for the festivals that have linked sections in `entryRoutes.ts`).
- Bilingual labels working — Hindi strip on Hi mode, English on En mode, via `useGitaLanguage`.
- Settings → Panchang disclosure shipped.
- All new tests pass under `tsx`.
- TypeScript clean, lint at baseline (0 errors).
- Bundle size delta logged in PR description; under 400 KB.

## 11. Open questions

1. **Vikram Samvat vs. Shaka Samvat year display.** North India uses Vikram Samvat predominantly; the Government of India calendar uses Shaka. Recommend Vikram Samvat (more recognizable to the audience).
2. **Lunar month system — Amanta or Purnimanta.** North India predominantly uses Purnimanta (month ends at full moon); Maharashtra/South India uses Amanta (month ends at new moon). Recommend Amanta (matches Drik default and is simpler to compute). Note in Settings.
3. **Should the calendar show secular dates (Independence Day, Republic Day) or stay purely religious?** Recommend purely religious; secular dates are visible in the user's iOS Calendar.
4. **Should Today strip show on Home tab as well, or stay Bhakti-only?** Recommend Bhakti-only — Home is the library, not the daily surface. Keep concerns separate.
5. **Calendar week starts on Sunday or Monday?** North Indian tradition: Sunday-first. Recommend Sunday-first; matches the existing iOS Calendar default for India region.

## 12. Sequencing within Q4

| Week | Work |
|---|---|
| 40 | **Library spike.** Build a 30-date reference set from drikpanchang.com (Ujjain). Run `mhah-panchang` against it. Decision: ship with mhah or switch to astronomy-engine. |
| 40–41 | **Engine + names + festival rules.** Pure modules, fully tested under tsx. No UI. |
| 42 | **Today strip.** Integrate into DailyBhaktiScreen; rename to Today tab. |
| 42–43 | **Calendar screen.** Month grid + bottom-sheet detail + festival tap-through. |
| 43 | **QA + Drik parity verification + Settings disclosure.** |

PRD-08 (vrats) begins in week 44, taking over the festival tap-through targets that PRD-07 leaves as panchang-only.

---

**Bottom line:** PRD-07 turns Vedansh from a timeless library into a daily companion. It's the keystone of Q4 — every subsequent PRD (vrats, temples, Today home) routes off the panchang engine that this PRD builds.
