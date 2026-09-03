# Vedansh — Q4 2026 Roadmap

**Plan window:** 1 Oct 2026 – 31 Dec 2026 (13 weeks)
**Authored:** 3 Sep 2026, against `main` @ `9f5014b` (app 1.5.0 · iOS build 52 · Android versionCode 9)
**Owner:** Product (PM)
**Companion docs:** [Q4 candidates, round 1](./2026-Q4-candidates.md) · [round 2](./2026-Q4-candidates-round-2.md) · [PRD-41 जिज्ञासा](./prds/41-jijnasa-ask-vedansh.md) (built 2026-09-02) · [2027 feature bets](./2027-feature-bets.md)

---

## 0. How this document was produced

A full review of what the binary ships today (source, `design.md` §1–§71, `RULEBOOK.md` §0–§25, the
wiki's eleven subsystem pages, and every PRD 01–41), followed by one question asked of each domain:
**what does a person using this app still get stuck on, lose, or get wrong — and could the app have
prevented it?** Candidates were then filtered the way rounds 1 and 2 were: nothing shipped, nothing
already owned by a live PRD, nothing sitting in a rejected table, unless the reason for the rejection
no longer holds. §1 is the review; §2 is the gap audit; §3 is the slate; §4–§8 are sequencing,
metrics, risks, decisions and exclusions.

The operating constraint is unchanged: **bundle-only.** No backend, no CDN, no cloud sync, no
analytics SaaS. Every feature below is on-device or it is not in this document.

---

## 1. Feature review — what Vedansh is in September 2026

Twenty-five PRDs deep, the app is no longer a reader with a calendar attached. It is three products
sharing one bundle, held together by a strict design system and a 100 %-local architecture.

### 1.1 Inventory by domain

| Domain | What ships (1.5.0) | Health |
|---|---|---|
| **Reading & library** | 69 library entries across 11 categories (Gita, complete Vālmīki Rāmāyaṇa — 23,289 verses, Sundarkand, Ramcharitmanas selection, 7 chalisas, stotrams, 7 aartis, ashtakams, kavacham, suktam, sanskar, japam). Paged readers with chapter auto-advance, bookmarks, resume, deterministic backgrounds (typed WebP registry). Reading languages hi · en · gu · kn (gu/kn transliterated at runtime). Reading size M/L. Share cards (4:5, story canvas, hashtags). | ✅ Solid. Reader *body* still has no shared shell (guarded by `readerAutoAdvance.test.tsx`). 107 malformed-Devanagari instances quarantined in a shrink-only baseline. |
| **Practice & habit** | Daily Routine (नित्य साधना, daily/weekday, derived completion, per-routine reminders), 15 Sadhana Programs (41-day Hanuman, Gita-18, Navratri-9, Shravan Somvar…), Japam counter (108-bead, audio loop, haptics), Japam alarms (native AlarmKit/AlarmManager tier), Sadhak Profile (lifetime/monthly/daily, streak as mala), Today's Practice ledger. | ✅ Complete through PRD-07 P3 / PRD-10 / PRD-11. |
| **Audio** | Bhajan library (18 catalog tracks; 5 real recordings), MiniPlayer + Now Playing, japam loop, **Read Aloud** on-device TTS (Gita + chalisa readers; one voice per language or none), playback arbiter keeping the three sources exclusive. | 🟡 Recitation audio is still mostly prototype; follow-along (PRD-13) gated on it. No sleep timer. |
| **Panchang & observances** | Full Hindu-calendar engine (sunrise-anga, kshaya/vriddhi, adhik, amanta/purnimant, per-rule day selection incl. moonrise and midday vyapini), 162 rules / 72 vrat-upvas rules, katha library, verified upvas vidhi (8 entries) and **43 verified bhog/naivedya profiles** (72/72 coverage), My Vrat follow + reminders, Daily Muhurat (Choghadiya/Rahu Kaal/Abhijit), शुभ योग (5 yogas, annotate-only), location picker with 394 cities + 18,466 pincodes + GPS snap, persisted day store, launch prefetch. | ✅ Best-in-class for India. **India-only by design** (`locations.ts`: "India-only for v1"); widgets IST-anchored. Shubh-yoga tables `verified:false`. Pradosh/nishita day rules (Diwali, Dhanteras, Shivaratri) still Class B. |
| **Muhurat** | Event Muhurat Finder — 13 occasions, dosha stack (12 keys), per-window grading, lagna-grade splits, hora tie-break, दिशा शूल for यात्रा, abujh days, personalised Tarabala/Chandrabala strip, follow + dated reminders, share card, month overlay. | 🟡 Engine complete short of Vivah (permanently excluded). All `EVENT_RULES` still `source.verified:false` pending city/year goldens; lagna tables ship empty. |
| **Jyotish** | Kundali (Lahiri, whole-sign, Vimshottari; Swiss-Ephemeris 150-chart corpus), multi-person roster (cap 8), Daily Rashifal, **Gochar + Sade Sati + weekly outlook + compiled Kundali report** (PRD-20), Guna Milan (IST-only), Namkaran (scaffold; `releaseEligible:false`). | 🟡 Deep. Namkaran release-gated on human review of the 108-cell table + 12+12 names/charana. Guna Milan and Namkaran assume IST birth. |
| **Household rites** | Puja Vidhi — 7 guided vidhis / 106 steps (Satyanarayan, Diwali Lakshmi-Ganesh, Ganesh sthapana, Navratri ghatasthapana, Karwa Chauth, Maha Shivaratri, household tila-tarpana), occurrence-scoped samagri + kitchen checklists, conduct mode with keep-awake. | 🟡 Two sthapanas, **no visarjan of anything**; festivals modelled as days, never arcs. |
| **Family record** | Pitru Smaran (private ledger, annual tithi + Pitru Paksha mapping, reminders), **जन्म तिथि** of the living, **कुल परम्परा** record with a one-way JSON export (PRD-29). | ✅ Built Aug 2026. Export exists; **no import anywhere in the app**. |
| **Vastu** | दिशा चक्र live compass (true-north corrected, honest accuracy states), room-by-room guidance, ghar-ka-mandir. | ✅ Shipped 1.5.0 (store release; `expo-sensors`). |
| **Theerth** | 73 temples on a real India map, per-state catalog, significance + origin, deity backgrounds. | ✅ Static; darshan timings deliberately excluded. |
| **Discovery** | Browse by Purpose (14 intents), Deity index (21 hand-drawn glyphs), FOR TODAY row, Festive Toran (18 festivals), DISCOVER carousel, feature tour + What's New, **जिज्ञासा answer-first search** (13 intents, 199-question golden corpus at 100 %/0 wrong, आज का विधान briefing, answers that act). | ✅ PRD-41 Phases 0–3 built 2026-09-02; Phase 4 (voice) is a store release. |
| **Push surfaces** | Nine local notification families sharing one iOS 64-pending budget; Home/Lock-screen widgets (14-day IST snapshot) on both platforms. | 🟡 Families are collectively over-subscribed in the worst case — every new family must be opt-in and small. |
| **Platform & ops** | Expo 54 / RN 0.81 / New Architecture; OTA via `expo-updates` (`appVersion` runtime policy); iOS on App Store, Android on Play; CI runs typecheck + 1,200+ Jest + 300+ engine + 75 data tests; 67 Maestro flows; build-fingerprint derived-cache reset. | 🟡 Several Maestro flows are "authored, device run owed" (Android especially). **No backup/restore** (PRD-06 backup: `Proposed`, never built). No dark theme. |

### 1.2 What the roadmap docs already reserved, and where it stands

| Number | Title | State on 3 Sep 2026 |
|---|---|---|
| 20 | Deep Personal Horoscope (took the number the round-1 सङ्कल्प candidate expected) | Built (Gochar, Sade Sati, weekly outlook, report). Phase 7 practice map gated. |
| — | सङ्कल्प composer (round 1's strongest candidate) | **Unnumbered and unbuilt** — no `sankalp.ts`, no gotra on the roster. Gotra now lives on the कुल परम्परा record (PRD-29 §5). |
| 21 | नवग्रह नित्य उपाय | Deferred to Q1 2027 by PRD-41 §10; PRD-20 covers the transit half. |
| 22 | हवन · संस्कार विधि | Deferred by PRD-41 §10. |
| 23 / 24 | भोग · नैवेद्य / वास्तु दिशा | **Shipped** (Aug 2026). |
| 25 | सन्ध्या वन्दन | Reserved, no PRD. |
| 26 | कण्ठस्थ · memorization | Candidate section + prototype; **no PRD file, not built.** |
| 27 / 29 | शुभ योग / कुल परम्परा | **Shipped** (Aug 2026). |
| 28 | पर्व-अर्क · festival arcs | Candidate section + prototype; **no PRD file, not built.** Diwali is inside Q4. |
| 30 | Household roster | Retired by product decision. |
| 31–40 | 2027 bets | Strategic parent; several need a backend. |
| 41 | जिज्ञासा | Built (Phases 0–3). Phase 4 voice needs a store release. |

---

## 2. The gap audit — where users actually get hurt

Round 1 audited *what a household does*. Round 2 audited *what the engine cannot say*. This round
audits a third axis: **where the app fails a person who is already using it well** — the loyal user,
not the marginal one. Five findings, in order of how much a real person loses.

### 2.1 Everything you built in this app dies with the phone

The app now persists **~40 user-state keys**: bookmarks, reading progress, lifetime japam totals and
the streak the Profile's mala renders, routines and their reminder times, sadhana enrolments with
per-day completion, japam alarms, vrat and muhurat follows, notification preferences, reading
language and size, read-aloud voices, **up to eight people's birth details**, the Pitru Smaran
ledger, janma-tithi reminder opt-ins, the कुल परम्परा record, Guna Milan drafts, Namkaran shortlists,
vidhi and kitchen checklists. Every one lives in AsyncStorage on one device. **There is no way to
move any of it.** Uninstall, lose the phone, or upgrade it — and a 41-day sankalp on day 38, a
two-year streak, a grandparent's shraddha tithi and the family's kuldevta are gone.

PRD-06 named this in May and proposed user-driven export/import; it was never built (PRD-29 §3.7
re-verified this on 2026-08-31 and shipped its own one-way export as a stopgap). The data footprint
has since grown roughly tenfold, and PRD-26 and PRD-28 below both add years-to-rebuild state. Diwali
— the single largest phone-upgrade window in India — falls in week 6 of this quarter. → **PRD-42**

### 2.2 Outside India, the app is confidently wrong

`locations.ts` is explicit: India-only. A GPS fix anywhere else is **snapped to the nearest Indian
pincode or city**, silently — a family in Leicester or New Jersey gets Rajkot's or Gujarat's sunrise
under a label that looks right, so their Rahu Kaal, their Choghadiya, the udaya tithi that names
today's observance and every reminder built on it are wrong by hours or by a day. The Kundali birth
city is an Indian list; Guna Milan and Namkaran interpret birth time as IST; the widget snapshot is
IST-anchored. The engine itself already takes a `civilTimeZone` and the day store's scope key
deliberately forbids it (`civilTimeZone?: never`), so this is a *product* boundary, not an
astronomical one. The diaspora is a large, devoted share of this category's audience and the one
segment for whom "the panchang that works where I live" is unmet by most competitors too. → **PRD-43**

### 2.3 The app knows festival days and cannot conclude a festival

Round 2 §1.1 asymmetry 3, still open: two sthapana vidhis, no visarjan; Diwali modelled as four
unrelated rules; Navratri as a start date; Chhath as one day (it is four). The live question all
week — *what do we do today, what is left* — has no answer, and the visarjan date that depends on
the family's own choice cannot be a calendar entry. This quarter contains, per the app's own engine
(Ujjain, purnimant): Navratri 11–21 Oct, Karwa Chauth 29 Oct, Dhanteras 7 Nov → Diwali 9 Nov →
Govardhan 10 Nov → Bhai Dooj 11 Nov, Chhath 15 Nov, Dev Uthani Ekadashi 20 Nov → Tulsi Vivah 21 Nov,
Gita Jayanti 20 Dec. It is the densest festival quarter of the year and the one with a hard
deadline. → **PRD-28**

### 2.4 Thirty readers, and no way to check you know a verse

Round 2's PRD-26, unchanged: the app supports reading forever and never the thing a devotee is
actually working toward — कण्ठस्थ, having it by heart. Every prerequisite ships (per-verse
read-aloud, progress, routine completion, the akshara matcher); the mechanic does not. Zero content,
zero convention, pure TypeScript, OTA. It remains the highest return-per-effort item on any slate the
app has produced, and it is the one Q4 feature aimed at children and their parents. → **PRD-26**

### 2.5 Evening and pre-dawn use on a bright parchment

The two moments the app is most used — the 5 a.m. paath and the sandhya aarti — are the two darkest
rooms of the day. PRD-04 proposed dark mode and a sleep timer in May; only the reading-size slice
shipped. `ThemeMode` still allows `'dark'` with no palette behind it; the japam loop, the bhajan
player and read-aloud all run until stopped or the battery dies. The enrichment backlog has held
these at the top of "quick wins" since June with the note "has design decisions". Those decisions
are made in the PRD below. → **PRD-04 Phase 2**

---

## 3. The slate

Five PRDs. Two are new numbers (42, 43); two convert round-2 candidate sections into build-ready PRDs
(26, 28); one is the second phase of a Q3 PRD (04). Every one solves a problem a current user already
has, and every one is either OTA or rides the **one store release** this quarter (§4.2).

| ID | Title | Solves | Size | Ships as |
|---|---|---|---|---|
| [**PRD-42**](./prds/42-sanchay-backup-restore.md) | **संचय · Backup & Restore** — one exporter over a registry of every user-state key, one importer with a preview, verified round-trip; absorbs PRD-29's export | §2.1 — a phone change no longer erases years of practice | M | **Store** (needs `expo-document-picker`) — 1.6.0 |
| [**PRD-28**](./prds/28-parv-arc-festival-arcs.md) | **पर्व-अर्क · Festival arcs** — arc relation over existing rules; sthapana→visarjan solver with the family's chosen duration; arc strip on Observance Detail and the Today strip; Navratri, Diwali-5, Chhath-4, Dev Uthani→Tulsi Vivah as v1 consumers | §2.3 — "what do we do today, what is left" for the quarter's festivals | M | OTA, in two drops (Navratri by 9 Oct; Diwali by 1 Nov) |
| [**PRD-26**](./prds/26-kanthastha-memorization.md) | **कण्ठस्थ · अभ्यास mode** — progressive akshara-wise masking on the shipped readers, self-marked recall, spaced review, audio-cue recall via read-aloud, `RoutineItemKind: 'memorize'` | §2.4 — the practice the app has never supported, at zero content cost | M | OTA |
| [**PRD-04 P2**](./prds/04-reading-comfort-phase2-dark-sleep.md) | **रात्रि पाठ · Dark theme + sleep timer** — a warm-dark palette behind `ThemeMode`, in-app toggle (Light / Dark / System once the native flag flips), sleep timer across the three sound sources via the playback arbiter | §2.5 — evening and pre-dawn use | S–M | OTA (palette + timer); "System" option rides 1.6.0 |
| [**PRD-43**](./prds/43-pravasi-world-locations.md) | **प्रवासी · Vedansh beyond India** — Phase 0 stop lying (an honest outside-India state instead of a silent snap); Phase 1 a bundled world-city tier with IANA time zones and a `civilTimeZone` scope in the day store; Phase 2 (Q1 2027) birth abroad for Kundali / Guna Milan / Namkaran, widget zone | §2.2 — correctness for every user outside India | L (phased; P0–P1 this quarter) | P0 OTA; P1 OTA; P2 Q1 2027 |

**Stretch, riding the 1.6.0 store release if it is cut anyway:** PRD-41 Phase 4 (voice input for
जिज्ञासा — native STT) and the `userInterfaceStyle: 'automatic'` flip PRD-04 P2 needs for its
"System" option. Neither is on the critical path; both are cheap once a native build is happening.

### 3.1 Why these five and not the round-1 leftovers

PRD-41 §10 already sequenced सङ्कल्प, PRD-21 and PRD-22 — and सङ्कल्प's number was consumed by the
horoscope work, so it needs re-numbering before anything else. Those three deepen *practice* for the
user who has already found the feature. The five above are chosen on a different criterion: **each
one is a place where the app currently loses or misleads someone who is already loyal** (their data,
their location, their festival week, their memorised text, their eyes at 5 a.m.). Retention of the
found user beats depth for the unfound one this quarter; the found user is also the one who buys the
new phone at Diwali. सङ्कल्प is re-reserved as **PRD-44** (§8) for Q1 2027, when PRD-43's world
locations make its place/time slots correct for everyone.

### 3.2 What the slate does to the moat

An account-less app's only switching cost is holding what the user cannot get elsewhere. PRD-42 makes
that holding *portable*, which is the honest version of a moat — and it is the precondition for
PRD-26 and PRD-28 adding years-to-rebuild state without turning every phone upgrade into a betrayal.
PRD-43 widens who the moat applies to. PRD-28 and PRD-04 P2 make the festival weeks and the dark hours
— the peak usage moments — feel finished.

---

## 4. Sequencing

### 4.1 Timeline

```
           Oct 2026                      Nov 2026                      Dec 2026
Week       40  41  42  43  44  45  46  47  48  49  50  51  52  53
           ────────────────────────────────────────────────────────
PRD-28     ████████░░░░████                                   OTA drop 1 (Navratri strip, 9 Oct) · drop 2 (Diwali-5 + Chhath, 1 Nov)
PRD-04 P2  ████████████                                       palette + contrast gate → toggle → sleep timer (OTA by 25 Oct)
PRD-42         ████████████████                               registry → exporter → importer → 1.6.0 to stores by ~28 Oct (live before Dhanteras)
PRD-26                     ████████████████                   splitter spike → mask → mastery → routine kind (OTA, mid-Nov → early Dec)
PRD-43     ██░░                ████████████████████           P0 honest state (OTA, wk 40) · P1 world tier + tz scope (OTA, Dec)
Debt       ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒     owed Android/iOS Maestro device runs; shubh-yoga & EVENT_RULES §10 sign-offs
           ────────────────────────────────────────────────────────
Festivals   Navratri 11–21 · KC 29 ·  Dhanteras 7 · Diwali 9 · Chhath 15 · DevUthani 20 ·   Gita Jayanti 20
Store                                 1.6.0 ▲
```

### 4.2 The one store release — 1.6.0

Everything that needs a native build is batched into **one** App Store / Play submission, targeted
to be live before Dhanteras (7 Nov) so the *old* phone can export before the new one is unboxed:

1. `expo-document-picker` — PRD-42's importer (the only hard dependency).
2. `userInterfaceStyle: 'automatic'` — PRD-04 P2's "System" theme option (the in-app Light/Dark
   toggle itself is OTA).
3. Optional: `expo-speech-recognition` (or equivalent) — PRD-41 Phase 4 voice, if its Phase 0 spike
   clears in time. Not a blocker.

Per the repo gotcha, this bump drags `APP_TOUR_VERSION` → `1.6.0` and a `whatsNew['1.6.0']` entry
(backup/restore, dark theme, festival arcs, अभ्यास if landed). OTA drops before and after continue
at the live runtime, never blindly at `app.json`'s version.

### 4.3 Sequencing rationale

- **PRD-28 first** because it has the only calendar deadline on the slate. Drop 1 is deliberately
  thin (arc relation + strip for Navratri, no visarjan vidhi) so it can land by 9 Oct; the
  Diwali/Chhath consumers and the duration-choice solver follow in drop 2.
- **PRD-04 P2 in parallel** because its palette slice is additive and its contrast gate is the kind
  of work that must not collide with a UI-heavy PRD — running it before PRD-26 touches the readers
  is the cheap order.
- **PRD-42 owns the store release date.** It starts in week 41 so the 1.6.0 binary is in review
  by ~21 Oct with a week of slack for rejection.
- **PRD-26 after 1.6.0 is submitted** so its new `@vedansh:memorize:v1` key is registered in the
  backup registry from day one (the registry's coverage test will force it), and so the reader
  changes land on the dark palette rather than under it.
- **PRD-43 Phase 0 in week 40** because it is a one-screen honesty fix for a silent wrong answer —
  the cheapest correctness win on the slate. Phase 1 lands last because its `civilTimeZone` scope
  change bumps `PANCHANG_DAY_CACHE_VERSION` and should not race the festival-week OTA drops.

---

## 5. Success metrics (bundle-only, local counters + App Store Connect)

| Metric | Baseline | Q4 target | How measured |
|---|---|---|---|
| Restore completions on a fresh install (PRD-42) | n/a (impossible today) | ≥ 60 % of devices that run an export within 14 days also run an import somewhere | Local counters on both sides; the import side reports the export's device-agnostic envelope id, shareable via diagnostics |
| Arc-strip open rate on an arc day (PRD-28) | n/a | ≥ 40 % of app opens on Navratri/Diwali days reach the arc strip or its detail | Local counter |
| Visarjan/duration choices recorded (PRD-28) | n/a | ≥ 25 % of users who open the Ganesh/Navratri sthapana vidhi set a duration (measured next Ganesh Chaturthi; Navratri this quarter) | Local counter |
| अभ्यास sessions per weekly-active user (PRD-26) | 0 | ≥ 1.5 | Local counter |
| Verses reaching कण्ठस्थ per 30 days (PRD-26) | 0 | ≥ 3 per user who enabled अभ्यास | Local mastery store |
| Dark-theme adoption (PRD-04 P2) | 0 | ≥ 20 % of devices within 30 days of OTA | Local pref |
| Sleep-timer use among audio users (PRD-04 P2) | 0 | ≥ 25 % | Local counter |
| Outside-India devices no longer served an Indian snap (PRD-43) | unknown (silent) | 100 % see the honest state (P0); ≥ 80 % of those resolve a world city (P1) | Local counters keyed on the P0 state |
| D30 return | ring-buffer baseline at quarter start | +3 pts vs pre-quarter cohort | Existing launch-date ring buffer |
| Crash-free sessions | ≥ 99.5 % | hold | App Store Connect / Play Console |

Breadth of intent families reached (PRD-41's KPI) continues to be tracked; PRD-26 and PRD-28 each
register their intents on ship (RULEBOOK §25), so "कब है विसर्जन" and "आज अभ्यास में क्या बाकी है" are
askable on day one.

---

## 6. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| **1.6.0 misses Dhanteras** (store review, a rejected build) | Medium | Submit by 21 Oct; the exporter and the envelope are OTA-shippable *without* the importer, so at worst the old phone can still export before Diwali and import lands a week later. |
| **A restore corrupts state** (a key written back in a shape a newer parser rejects) | Medium | Every key in the registry is imported through its owner's existing versioned parser, never raw; unknown/failed keys are reported and skipped; the preview screen lists exactly what will be written; a full round-trip test over a seeded device is the merge gate. |
| **PRD-28 drop 1 slips past 11 Oct** | Medium | Drop 1 is scoped to *arc relation + strip*; if it misses Navratri it still serves Diwali (9 Nov), the larger target. Do not widen drop 1 to hit the date. |
| **Dark palette regresses contrast or a background overlay looks muddy on some plates** | Medium | Palette lands first as tokens + `colors.contrast.test.ts` extension with zero screen changes; per-plate QA of the 30+ background overlays; light stays default for one release. |
| **PRD-43 world tier ships a wrong time zone for a city** | Low–Medium | Time zones come from the IANA list bundled per city (no DST math of our own — `Intl` does it); a test pins every bundled city's zone against its coordinates via a longitude sanity band; the honest state stays available as a manual override. |
| **`PANCHANG_DAY_CACHE_VERSION` bump in PRD-43 P1 collides with festival-week OTAs** | Low | P1 is sequenced to December, after the last arc drop. |
| **iOS 64-pending notification budget** | Existing | PRD-28's visarjan reminder is opt-in, ≤ 4 slots; no other PRD adds a family. |
| **Akshara splitter is harder than the `SINGLE_AKSHARA` matcher suggests** | Low–Medium | Half-day spike is PRD-26's first task; `Intl.Segmenter` is banned (recorded ICU GB9c defect). |
| **Owed device runs accumulate** | High (already true) | Every PRD here ships its Maestro flow; the debt line in §4.1 is a standing weekly slot, Android first. |

---

## 7. Open decisions — needed in the first two weeks

1. **PRD-42 import semantics — merge or replace?** Recommend **merge by default, replace on explicit
   choice**: bookmarks/follows/people union; counters take the larger value; routines/records by id,
   incoming wins. Replace is offered on the preview screen for a "new phone, start from the backup"
   user. Detail in PRD-42 §6.
2. **PRD-42 destination — files only, or also QR/AirDrop-style device-to-device?** Recommend files
   only (share sheet out, document picker in); everything else is the OS's job. Keeps the feature
   bundle-only and platform-neutral.
3. **PRD-28 duration set and default** — offer 1½ / 3 / 5 / 7 / 10 for Ganesh, fixed 9/10 for
   Navratri; recommend **no default** (round 2 §5.4).
4. **PRD-04 P2 palette direction** — "deep ink on warm dark" as sketched in PRD-04 §6 (walnut ground,
   warm-ivory ink, muted saffron), not OLED black. Recommend adopting PRD-04's sketch as-is and
   spending the decision budget on the background-overlay treatment instead.
5. **PRD-43 world-city list source** — bundle a curated ~300-city list (top diaspora metros +
   national capitals) with IANA zones, or the full GeoNames cities ≥ 100k? Recommend the curated list
   for P1 (size, label quality, Devanagari names hand-authored like the pincode states) and hold the
   long tail for P2.
6. **Does the 1.6.0 build carry STT for PRD-41 Phase 4?** Depends only on whether its Phase 0 spike
   (which library, permission copy, offline behaviour on Android OEM engines) is done by 14 Oct.
7. **सङ्कल्प re-numbering** — confirm **PRD-44** so the round-1 cross-references can be fixed now
   rather than when it is picked up.

---

## 8. Deliberately not in this quarter (so the slate is auditable)

**Considered and sequenced later, with the reason:**

| Idea | Why not Q4 |
|---|---|
| **सङ्कल्प composer** (round 1's #1) | Needs a place/time that is correct for everyone — PRD-43 first. Also needs the saṃvatsara/ṛtu convention sign-off that has been open since August. Reserved as **PRD-44**, Q1 2027. |
| **PRD-21 नवग्रह उपाय**, **PRD-22 हवन** | Per PRD-41 §10: depth for the found user; the 9-row/havan content review is the cost. Q1 2027. |
| **PRD-25 सन्ध्या वन्दन** | Narrower audience; needs the same content discipline as the vidhis. Reserved. |
| **More reading scripts** — Telugu, Bengali, Odia, Malayalam (all 1:1 with Devanagari via the gu/kn transliteration pipeline; Marathi needs only a label since it *is* Devanagari) | A genuine reach feature and cheaper than the 2027 doc assumes (it conflated *translation* with *script*). Held because Q4 is spoken for and because the meaning text would still be transliterated Hindi, which the languages page records as a caveat. Reserve as **PRD-45**; Tamil is excluded on principle (lossy consonant set). |
| **Audio follow-along (PRD-13)**, more recitations | Gated on real recordings landing; a content/licensing question, not an engineering one. |
| **Namkaran release** | Blocked on human review of the 108-cell table and the 12+12 corpus — editorial work, tracked in PRD-17, not a roadmap slot. |
| **Apple Watch / Wear OS japam counter** | Real demand (hands-free mala) but a new native surface with its own release train; belongs in the 2027 bets, not a quarter that already carries one store release. |
| **Device-calendar export**, **puja-thali sounds**, **darshan log**, **daan ledger** | Round 2 §3.3 reasons unchanged. |
| **Anything network-backed** | Bundle-only stands. The 2027 doc owns the backend decision. |

**Carry-over debt this quarter must not ignore:** owed Maestro device runs (kul-parampara,
multi-profile, shubh-yoga, muhurat P3/P4, namkaran Android); `SHUBH_YOGA_SOURCE.verified` and the
`EVENT_RULES` goldens; the remaining Class B day rules (pradosh Diwali/Dhanteras, nishita
Shivaratri) — the Diwali one becomes user-visible the moment PRD-28 draws the five-day arc, so its
convention should be settled in PRD-28 drop 2.

---

## 9. Definition of done — quarterly

1. 1.6.0 live on both stores by 7 Nov with backup **and** restore; an uninstall → reinstall → import
   round-trip verified on iOS and Android with a seeded device.
2. Navratri, Diwali-5, Chhath-4 and Dev Uthani → Tulsi Vivah render as arcs on Observance Detail and
   the Today strip; a chosen duration produces a visarjan date and an opt-in reminder.
3. अभ्यास mode available on every reader; mastery persists and is in the backup registry; a routine
   can carry a `memorize` item.
4. Dark theme selectable in More, contrast test extended, light still default; sleep timer stops
   all three sound sources.
5. No device outside India is silently served an Indian location; world cities resolve with the
   correct civil day and time zone.
6. Every PRD shipped with unit + Maestro coverage, `design.md`/`RULEBOOK.md` sections in the same
   PR, intents registered (RULEBOOK §25), lint at 0 errors.
7. Retrospective in week 53 with this table filled in.
