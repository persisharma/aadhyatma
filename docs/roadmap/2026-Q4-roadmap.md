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

The operating constraint is **amended once, narrowly** (product decision 3 Sep 2026): **no Vedansh
server.** No backend of ours, no CDN, no analytics SaaS, no account with us, no content fetched, and
every feature works fully offline. What the amendment permits is exactly one thing: PRD-42 may
upload the user's *own* backup file to the user's *own* Google Drive, opt-in, into an app-private
folder, and read it back on another device. The previous wording ("no cloud sync") is retired
because it would have forbidden that; live two-way sync between devices remains out.

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
| 26 | कण्ठस्थ · memorization | Candidate section + prototype; PRD file written 3 Sep, **deferred** (§8), not built. |
| 27 / 29 | शुभ योग / कुल परम्परा | **Shipped** (Aug 2026). |
| 28 | पर्व-अर्क · festival arcs | Candidate section + prototype; PRD file written 3 Sep, **deferred** (§8), not built. Diwali is inside Q4; its pradosh day-rule fix stays on the Q4 debt line. |
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
deadline. → **PRD-28** (written up; deferred, §8)

### 2.4 Thirty readers, and no way to check you know a verse

Round 2's PRD-26, unchanged: the app supports reading forever and never the thing a devotee is
actually working toward — कण्ठस्थ, having it by heart. Every prerequisite ships (per-verse
read-aloud, progress, routine completion, the akshara matcher); the mechanic does not. Zero content,
zero convention, pure TypeScript, OTA. It remains the highest return-per-effort item on any slate the
app has produced, and it is the one Q4 feature aimed at children and their parents. → **PRD-26** (written up; deferred, §8)

### 2.5 Evening and pre-dawn use on a bright parchment

The two moments the app is most used — the 5 a.m. paath and the sandhya aarti — are the two darkest
rooms of the day. PRD-04 proposed dark mode and a sleep timer in May; only the reading-size slice
shipped. `ThemeMode` still allows `'dark'` with no palette behind it; the japam loop, the bhajan
player and read-aloud all run until stopped or the battery dies. The enrichment backlog has held
these at the top of "quick wins" since June with the note "has design decisions". Those decisions
are made in the PRD below. → **PRD-04 Phase 2** (written up; deferred, §8)

---

## 3. The slate

**Two PRDs. Product decision, 3 Sep 2026: the quarter is limited to the two items that fix what the
app *loses* or *gets wrong* for a user who already relies on it — portability of their data, and
correctness of their place.** The other three findings in §2 (festival arcs, memorization, dark
theme + sleep timer) are written up as build-ready PRDs and **deferred** (§8) so they can be picked
up without re-planning.

| ID | Title | Solves | Size | Ships as |
|---|---|---|---|---|
| [**PRD-42**](./prds/42-sanchay-backup-restore.md) | **संचय · Backup & Restore** — one exporter over a registry of every user-state key, one importer with a preview, verified round-trip; **plus opt-in automatic backup to the user's own Google Drive** (app-private folder, one file per device, restore through the same preview) and explicit OS device-backup rules; absorbs PRD-29's export, supersedes PRD-06's backup third | §2.1 — a phone change no longer erases years of practice, people and the family record, and the user no longer has to remember to export | L | **Store** (needs `expo-document-picker`, `expo-auth-session` + `expo-web-browser`, `expo-secure-store`) — 1.6.0, live before Dhanteras; Drive sync may flip on by OTA once Google's OAuth client is approved |
| [**PRD-43**](./prds/43-pravasi-world-locations.md) | **प्रवासी · Vedansh beyond India** — Phase 0 an honest outside-India state instead of a silent snap; Phase 1 a bundled world-city tier with IANA time zones and zone-aware civil days; Phase 2 birth abroad for Kundali / Guna Milan / Namkaran and widget zone | §2.2 — correctness for every user outside India | L (all three phases now fit the quarter) | P0 OTA (wk 40) · P1 OTA (Nov) · P2 store 1.6.1 (Dec) |

**Stretch, riding a store release if it is cut anyway:** PRD-41 Phase 4 (voice input for जिज्ञासा —
native STT) on 1.6.0 if its Phase 0 spike clears by 14 Oct. Not on the critical path.

### 3.1 Why only these two

Both are **correctness and trust** items rather than depth items. Every other PRD the app has shipped
assumes the user's data will still be there tomorrow and that the numbers on the Today strip are for
where they stand; today neither holds for a meaningful share of loyal users. A narrow quarter also buys
what the last two quarters did not have: capacity to retire the owed Maestro device runs and the
`verified:false` conventions (§8, debt) rather than adding to them, and room to take PRD-43 all the
way to Phase 2 instead of stopping at world cities.

### 3.2 What the slate does to the moat

An account-less app's only switching cost is holding what the user cannot get elsewhere. PRD-42 makes
that holding *portable*, which is the honest version of a moat. PRD-43 widens who the moat applies to
— the diaspora household with no temple down the road announcing the tithi is the user who needs an
almanac most and is served worst today.

---

## 4. Sequencing

### 4.1 Timeline

```
           Oct 2026                      Nov 2026                      Dec 2026
Week       40  41  42  43  44  45  46  47  48  49  50  51  52  53
           ────────────────────────────────────────────────────────
PRD-43 P0  ████                                                   honest outside-India state (OTA, wk 40)
PRD-42         ████████████████████                               registry → exporter (OTA) → importer → 1.6.0 to stores by ~21 Oct, live before Dhanteras (7 Nov)
PRD-43 P1                  ████████████████                       world tier + zone-aware civil days (OTA, mid-Nov; cache v4 bump)
PRD-43 P2                                  ████████████████       birth abroad + widget zone → 1.6.1 to stores by ~11 Dec
Debt       ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒     owed device runs; shubh-yoga & EVENT_RULES §10 sign-offs; Diwali pradosh day rule
           ────────────────────────────────────────────────────────
Festivals   Navratri 11–21 · KC 29 ·  Dhanteras 7 · Diwali 9 · Chhath 15 · DevUthani 20 ·   Gita Jayanti 20
Store                                 1.6.0 ▲                                     1.6.1 ▲
```

### 4.2 Store releases

**1.6.0 (submit by ~21 Oct, live before Dhanteras).** Everything that needs a native build for
PRD-42, batched once:

1. `expo-document-picker` — PRD-42's file importer.
2. `expo-auth-session` + `expo-web-browser` + `expo-secure-store` — PRD-42's Drive sign-in and
   token storage. The Drive REST client itself is JS, so the *switch* can ship dark in 1.6.0 and be
   enabled by OTA the day Google approves the OAuth client (PRD-42 §10).
3. A config plugin for Android `fullBackupContent` / `dataExtractionRules` (PRD-42 §3.8).
4. Optional: native STT for PRD-41 Phase 4, if its spike clears in time.

Per the repo gotcha, the bump drags `APP_TOUR_VERSION` → `1.6.0` and a `whatsNew['1.6.0']` entry
(backup & restore; world locations P1 if landed by then, else it goes in the next OTA's copy).

**1.6.1 (submit by ~11 Dec).** PRD-43 Phase 2's widget-extension change (the snapshot follows the
chosen city's zone) plus the roster's optional `timeZone` field. If P2 slips, 1.6.1 is not cut and P2
moves to Q1 2027 unchanged.

OTA drops before, between and after continue at the *live store runtime*, never blindly at
`app.json`'s version.

### 4.3 Sequencing rationale

- **PRD-43 Phase 0 first (week 40)** because it is a one-screen honesty fix for a silent wrong
  answer — the cheapest correctness win available, and it produces the counter that measures P1.
- **PRD-42 owns the 1.6.0 date.** The old phone must be able to export *before* Diwali; the exporter
  and envelope go OTA as soon as they pass the round-trip gate, and the importer rides the binary.
- **PRD-43 Phase 1 after 1.6.0 is submitted**, because its `PANCHANG_DAY_CACHE_VERSION` bump should
  not land in the same window as a store review, and because the festive/vrat reminder switch to
  location-aware dates for world cities is best exercised on the December observances rather than
  Diwali week.
- **PRD-43 Phase 2 in December** now that capacity allows it; it needs P1's `City.timeZone` in place
  and is the one roster schema change this quarter (coordinated with the reserved PRD-44 per PRD-29 §5).

---

## 5. Success metrics (bundle-only, local counters + App Store Connect)

| Metric | Baseline | Q4 target | How measured |
|---|---|---|---|
| Export events (PRD-42) | n/a | ≥ 15 % of devices with ≥ 30 activity days export within 30 days of 1.6.0 | Local counter in `backup-meta`; the one-time DISCOVER card's dismissal is the denominator proxy |
| Drive sync enabled (PRD-42 §3.7) | n/a | ≥ 25 % of devices with ≥ 30 activity days within 30 days of the switch going live | Local flag in `backup-meta.drive.enabled` |
| Drive upload success rate (PRD-42 §3.7) | n/a | ≥ 95 % of attempted uploads succeed within 24 h | Local success/failure counters |
| Import events on a fresh install (PRD-42) | n/a (impossible today) | ≥ 60 % of devices that export within 14 days also import somewhere | Local counters on both sides carrying the envelope id; verifiable only through a user's diagnostics share, so the honest field metric is the two raw counts plus review sentiment |
| Restore round-trip fidelity (PRD-42) | n/a | 100 % of registry sections byte-equivalent after uninstall → reinstall → import on iOS and Android seeded devices | Release gate, not a field metric |
| Outside-India devices no longer served a silent Indian snap (PRD-43 P0) | unknown (silent today) | 100 % see the honest state | Local counter keyed on the P0 state |
| World-city adoption (PRD-43 P1) | 0 | ≥ 80 % of devices that hit the P0 state resolve a world city within 7 days of P1 | Local counter |
| Charts for people born abroad (PRD-43 P2) | 0 | ≥ 1 non-IST birth profile on ≥ 30 % of world-city devices | Local counter |
| D30 return | ring-buffer baseline at quarter start | +2 pts vs pre-quarter cohort | Existing launch-date ring buffer |
| Crash-free sessions | ≥ 99.5 % | hold across two store releases | App Store Connect / Play Console |
| Owed device runs | 6 flows authored, device run owed | 0 owed | `wiki/runbooks/e2e-verification.md` catalog |

Both PRDs register their जिज्ञासा intents on ship (RULEBOOK §25), so "बैकअप कैसे लें" and "लंदन का
पंचांग" are askable on day one; the breadth KPI from PRD-41 continues to be tracked.

---

## 6. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| **1.6.0 misses Dhanteras** (store review, a rejected build) | Medium | Submit by 21 Oct; the exporter and envelope are OTA *without* the importer, so the old phone can still export before Diwali and import lands a week later. |
| **A restore corrupts state** (a key written back in a shape a newer parser rejects) | Medium | Every key imports through its owner's existing versioned parser, never raw; unknown/failed sections are reported and skipped; the preview lists exactly what will be written; a seeded-device round-trip is the merge gate. |
| **Google's OAuth consent-screen verification gates the Drive switch** (weeks; needs a public privacy policy naming the scope) | Medium | Start the Google Cloud project + consent screen in week 41; the switch ships dark in 1.6.0 and flips on by OTA; the file path is never blocked by it. |
| **Drive sync read as "the app has a cloud now"** — stance drift, or users expecting live multi-device sync | Medium | Constraint reworded to "no Vedansh server" in §0; copy says बैकअप everywhere; restore is always an explicit preview; PRD-42 §9 non-goals pin it. |
| **Birth details and family names uploaded by default** | Low | Off by default, opt-in with sign-in, app-private `appDataFolder`, deleted on disconnect; sensitive-data caption on the switch. |
| **A wrong time zone on one world-city row** (worse than no row) | Low–Medium | IANA ids only, `Intl` does DST; per-row tests pin `Intl` acceptance and a longitude band; the P0 honest state stays as the fallback; sources recorded in the data file header. |
| **`PANCHANG_DAY_CACHE_VERSION` bump lands under a store review** | Low | P1 is sequenced after the 1.6.0 submission and before the 1.6.1 one. |
| **Reminder families switching to location-aware dates for world cities changes Indian behaviour** | Low | Gated on `City.timeZone` being present — every Indian row has none; test-pinned. |
| **P2 roster schema change collides with the reserved PRD-44 सङ्कल्प** | Low | P2 adds one optional field (`timeZone`); PRD-44 reads gotra from the कुल परम्परा record per PRD-29 §5 and does not need the roster. |
| **Hermes `Intl` zone coverage on an Android OEM build** | Low | The widget writer already depends on it in production; a launch-time probe falls back to the P0 state if a zone is unsupported. |
| **Two people share one backup file** (a couple) | Low | Merge default with `union-by-id`; the birth-profile cap of 8 is enforced with an overflow message. |
| **Owed device runs keep accumulating** | Medium | The narrower slate exists partly to retire them; the debt line in §4.1 is a standing weekly slot, Android first. |

---

## 7. Open decisions — needed in the first two weeks

1. **PRD-42 import semantics — merge or replace?** Recommend **merge by default, replace on explicit
   choice**: bookmarks/follows/people union; counters take the larger value; routines/records by id,
   incoming wins. Detail in PRD-42 §6.
2. **PRD-42 destinations — files + Google Drive (decided 3 Sep).** Open sub-decisions: Drive sync
   **off by default** (recommended); hidden `appDataFolder` rather than a visible folder (recommended);
   upload on background with a 6-hour floor plus a manual "sync now" (recommended); **iCloud Drive as
   an automatic destination stays out of v1** (needs a native module Expo lacks; the Files path
   already reaches it manually). No QR, no peer-to-peer.
3. **PRD-43 world-city list source** — a curated ~300-city list (top diaspora metros + national
   capitals, hand-authored Devanagari) or GeoNames ≥ 100k? Recommend curated for P1; the long tail
   waits for evidence from the P0 counter.
4. **PRD-43 `SNAP_MAX_KM`** — 120 km recommended; needs the sweep test showing no Indian
   pincode/city pair exceeds it inside coverage.
5. **Does 1.6.1 happen?** Only if PRD-43 P2 is green by ~11 Dec; otherwise P2 moves to Q1 2027 and
   no December binary is cut.
6. **Does 1.6.0 carry STT for PRD-41 Phase 4?** Only if its spike is done by 14 Oct.
7. **सङ्कल्प re-numbering** — confirm **PRD-44** so round-1 cross-references can be fixed now.

---

## 8. Deferred and excluded (so the slate is auditable)

**Written up, build-ready, and deferred by the 3 Sep 2026 product decision** — each file carries a
`Deferred` status line and needs no re-planning to pick up:

| PRD | Title | Why it was a candidate | Cost of deferring |
|---|---|---|---|
| [PRD-28](./prds/28-parv-arc-festival-arcs.md) | पर्व-अर्क · festival arcs | §2.3 — the densest festival quarter of the year, with a Diwali deadline | Navratri/Diwali 2026 pass without an arc strip; **the Diwali pradosh day-rule fix it owned moves to the debt line** so the 9 vs 8 Nov discrepancy is still settled this quarter |
| [PRD-26](./prds/26-kanthastha-memorization.md) | कण्ठस्थ · अभ्यास mode | §2.4 — zero-content, highest return per effort | None that compounds; its future `@vedansh:memorize:v1` key will be forced into PRD-42's registry by the coverage test when it lands |
| [PRD-04 P2](./prds/04-reading-comfort-phase2-dark-sleep.md) | Dark theme + sleep timer | §2.5 — evening and pre-dawn use | The enrichment loop's top quick win stays queued another quarter; its design decisions are now written down, so a later build is a build, not a debate |

**Sequenced later, with the reason:**

| Idea | Why not Q4 |
|---|---|
| **सङ्कल्प composer** (round 1's #1) | Needs a place/time that is correct for everyone — PRD-43 first — and the saṃvatsara/ṛtu convention sign-off open since August. Reserved as **PRD-44**, Q1 2027. |
| **PRD-21 नवग्रह उपाय**, **PRD-22 हवन** | Per PRD-41 §10: depth for the found user; content review is the cost. Q1 2027. |
| **PRD-25 सन्ध्या वन्दन** | Narrower audience; same content discipline as the vidhis. Reserved. |
| **More reading scripts** — Telugu, Bengali, Odia, Malayalam (1:1 with Devanagari via the gu/kn pipeline; Marathi needs only a label) | Genuine reach feature, cheaper than the 2027 doc assumes (it conflated *translation* with *script*). Reserve as **PRD-45**; Tamil excluded on principle (lossy consonant set). |
| **Audio follow-along (PRD-13)**, more recitations | Gated on real recordings landing; content/licensing, not engineering. |
| **Namkaran release** | Blocked on human review of the 108-cell table and the 12+12 corpus — editorial work tracked in PRD-17. |
| **Apple Watch / Wear OS japam counter** | Real demand, but a new native surface with its own release train; a 2027 bet. |
| **Device-calendar export**, **puja-thali sounds**, **darshan log**, **daan ledger** | Round 2 §3.3 reasons unchanged. |
| **Anything network-backed** | Bundle-only stands. The 2027 doc owns the backend decision. |

**Carry-over debt this quarter must retire, now that the slate leaves room:** owed Maestro device runs
(kul-parampara, multi-profile, shubh-yoga, muhurat P3/P4, namkaran Android); `SHUBH_YOGA_SOURCE.verified`
and the `EVENT_RULES` goldens; the remaining Class B day rules — **the Diwali/Dhanteras pradosh rule
is due before 7 Nov** regardless of PRD-28's deferral, because the engine currently names 9 Nov where
published almanacs name 8 Nov (RULEBOOK §23; regenerate the precomputed table, bump `CACHE_VERSION`).

---

## 9. Definition of done — quarterly

1. 1.6.0 live on both stores by 7 Nov with backup **and** restore; an uninstall → reinstall → import
   round-trip verified on iOS and Android with a seeded device; every persisted user key is in the
   registry or explicitly excluded, enforced by test. **Google Drive backup sync** live (by 1.6.0 or
   by OTA once the OAuth client is approved) with a cross-platform device-A → device-B restore
   verified; Android backup rules declared.
2. No device outside India is silently served an Indian location (P0); world cities resolve with the
   correct civil day and time zone, and festive/vrat reminders follow them (P1); a birth abroad
   produces a Kundali and the widget follows the chosen zone (P2, or explicitly moved to Q1 2027).
3. The Diwali/Dhanteras pradosh day rule settled and shipped before Dhanteras.
4. Zero owed Maestro device runs at quarter end.
5. Both PRDs shipped with unit + Maestro coverage, `design.md`/`RULEBOOK.md` sections in the same
   PR, intents registered (RULEBOOK §25), lint at 0 errors.
6. Retrospective in week 53 with the §5 table filled in.
