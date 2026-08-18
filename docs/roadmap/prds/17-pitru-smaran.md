# PRD-17 — पितृ स्मरण · Tithi-Based Family Remembrance

| | |
|---|---|
| **Status** | Implemented and native-verified (iOS, 2026-08-13) |
| **T-shirt size** | M (engine reuse is total; the work is 3 screens + a data model + reminder glue) |
| **Prototype** | [`docs/pitru-smaran-prototype.html`](../../pitru-smaran-prototype.html) — More-hub entry, list, add flow (date-known and tithi-known), person detail, Pitru Paksha overview, Panchang day chip; every interaction annotated |
| **Feasibility** | ✅ Confirmed against current main — annual projection is the exact `lunarMonth + paksha + tithi` rule solve the festival engine already runs for every festival row (`mobile/src/panchang/festivals.ts`), including kshaya/vriddhi and adhik-maas handling and purnimant normalization. Gregorian→tithi derivation is one `computePanchangForDate` call. **Pure JS — core is OTA-shippable.** |

> **Design intent (validated in the prototype):** a quiet, private surface under the **More hub** (the app's personal area: Wishlist · Profile · Reminders). Muted gold-and-ink visual tone — no saffron celebration accents, no streaks, no badges, no confetti anywhere in the flow. The word used everywhere is **स्मरण** (remembrance), never "reminder marketing" language.

---

**Bundle-only & private by construction:** entries (relation, optional name, tithi) live only in AsyncStorage (`@vedansh/pitru-smaran`). Dates are computed on-device by the existing panchang engine. Nothing syncs, nothing is shared, nothing appears on any share card. This is data no family wants in a cloud — its privacy *is* the feature.

## 1. Problem

Shraddha, barsi and punyatithi are observed by **tithi**, not Gregorian date — माघ कृष्ण अष्टमी, not "February 3rd." No mainstream calendar can hold this: Google Calendar repeats Gregorian dates; panchang apps compute festival tithis but have no notion of *your family's* tithis. So every year, someone in the family keeps a paper notebook, or phones the family purohit, or — increasingly — misses the day and carries the guilt. During Pitru Paksha the question compounds: "किस दिन किसका श्राद्ध?" requires mapping each ancestor's tithi into the fortnight.

Vedansh already ships the only hard part: a DrikPanchang-validated engine that solves `month + paksha + tithi → date` for any year, with kshaya/vriddhi and adhik-maas handled and tested.

## 2. Goal

Let a family record each departed member once — by tithi if they know it, by Gregorian date if they don't — and never again wonder when the shraddha falls. The app answers three questions permanently: **"इस वर्ष कब?"**, **"पितृ पक्ष में किस दिन?"**, and **"उस दिन क्या करें?"** (linked paath). Success = entries created per active device and day-of engagement on computed shraddha dates (both per-device local counters, per the Q3 measurement stance).

## 3. Where it lands in the app (surfaces)

Validated in the prototype; five surfaces:

### 3.1 Entry — a "पितृ स्मरण" row in the More hub
More is the app's private/personal area (Wishlist · Sadhak Profile · Reminders · Widgets); this row joins it with the standard NEW badge for one release. Tap → `PitruSmaranList` (new routes in `MoreStackParamList`, same pattern as Reminders).

### 3.2 List — one row per person, on the ObservanceList row pattern
Reuses the §33 ObservanceList row (leading glyph · name + caption · right-aligned next date + relative label, sorted soonest-first): a `॥` lead instead of the follow star, relation as the name (चुनी हुई सूची: पिता, माता, दादा, दादी, नाना, नानी, अन्य…; optional personal name), the tithi in words as the caption ("माघ कृष्ण अष्टमी"), and the solved next date + `Nd` label at right. During Bhadrapada, a Pitru Paksha banner surfaces above the list. Empty state explains the feature in two reverent lines.

### 3.3 Add/edit — two ways in, one confirmation
- **तिथि ज्ञात है** — pick month, paksha, tithi from the engine's own enumerations (the names users already see on the Panchang tab).
- **केवल तारीख़ ज्ञात है** — enter the Gregorian death date; the app computes the tithi via `computePanchangForDate` (sunrise-anga convention, same as the engine's festival matching) and **shows it back in words for confirmation** — the user always approves the tithi, never trusts a silent conversion.
- Unknown tithi entirely → the entry can be saved as **सर्वपितृ अमावस्या** (the traditional fallback day for forgotten tithis).
- A new saved entry enables its day-before/day-of reminder by default after obtaining the shared OS notification grant. If the grant is refused or blocked, the entry still saves but its switch remains honestly off.

### 3.4 Person detail — the ObservanceDetail hero pattern
Opens with the §33 ObservanceDetail hero (name 24 pt centred, caption line, the saffron-tint **"अगला · date · in N days"** pill), followed by next year's date and the Pitru Paksha shraddha day (the person's tithi mapped into Bhadrapada Krishna paksha — the traditional rule, independent of death month), a per-person **स्मरण reminder** toggle (new saves default on; day-before + day-of), and linked observance content: **गीता पाठ** deep links to Gita adhyaya 15 / adhyaya 2 (both already shipped — `linkSectionId` pattern), plus the श्राद्ध विधि cross-link if PRD-19 ships its shraddha vidhi. Delete is one tap + confirm, and wipes cleanly. The Pitru Paksha overview screen lists the fortnight as §33.6 "Upcoming" rows (marker dot · short date · name), family-matched days on the saffron dot.

### 3.5 Panchang day integration — the private chip
On a saved observance date, the Panchang day panel shows a small **॥ स्मरण** chip alongside the day's observance pills — visible only on this device, rendered in the muted gold tone, never in the festive style. Tapping opens the person detail.

### 3.6 व्रत-पर्व catalog — the year-round touchpoint (beyond More)
The catalog view (§33) already pins a personal-ledger row: **My Vrat** (gold-tint fill, 1.5 px gold border). पितृ स्मरण adds the structural sibling directly beneath it, in the identical pinned-row treatment: `॥` glyph, title + NEW badge, subtitle carrying the live count and soonest next date ("3 स्मरण · अगला: 21 सित"). Tap → the remembrance list (same screen as the More entry). With zero entries it remains as a standing invitation ("अपने पितरों की तिथियाँ जोड़ें"); it cannot be dismissed. My Vrat is the personal *vrat* ledger; this is the personal *shraddha* ledger — they belong side by side in the one view devotees open to plan observances.

### 3.7 Home Today strip — the seasonal touchpoint
Two moments, one shipped mechanism (§18/§32 — the strip renders each day's observance pill + windows line):
- During **Pitru Paksha**, the paksha's observance pill ("पितृ पक्ष — अष्टमी श्राद्ध") appears automatically once this PRD adds the missing Pitru Paksha rules (see the §4 gap row) — no Home-specific code beyond the rules themselves.
- On a **family date** (a saved person's annual tithi, or their Pitru Paksha day), the muted **॥ स्मरण** chip joins the strip → person detail. Device-only, quiet: no NEW badges or counters on Home.

### 3.8 Home DISCOVER — the standing zero-state hook
The contextual Today chip cannot explain a feature before any person is saved. Home therefore also carries a permanent launch-release **पितृ स्मरण** DISCOVER card (`॥` glyph, annual-answer explanation, **स्मरण जोड़ें / Set up**) that opens the same remembrance list. It renders even with zero entries; this is the established Home awareness mechanism, while the muted Panchang row remains the planning ledger.

### Notifications — two tiers with different defaults

Reuses the established scheduler shape (pure planner + headless component + shared iOS pending budget, like `VratReminderScheduler` / `FestiveReminderScheduler`). Two tiers, deliberately different:

1. **Pitru Paksha season reminder — festive family, default-ON.** The paksha is a public calendar season, not personal data, so it joins the default-on festive reminders (#241 pattern, with its own toggle in the Reminders hub like every festival). Two fires per year, gated on the new paksha rules (§4 gap row):
   - **Eve of paksha start** (day before Bhadrapada Purnima): "कल से पितृ पक्ष — अपने पितरों का स्मरण करें". Tap → the Pitru Paksha overview when entries exist, else the remembrance list's invitation state.
   - **Eve of Sarvapitri Amavasya**: "कल सर्वपितृ अमावस्या — पितृ पक्ष का अंतिम दिन". Tap → overview.
   Copy follows the festive family's reading-invitation shape (a गीता पाठ link), stays fixed and reverent, and **never names a family member** — the season fire is identical on every device.
2. **Per-person shraddha reminders — default ON when a person is deliberately saved.** Saving the entry is the explicit intent boundary: the app requests the shared OS grant if needed and enables that person's day-before + day-of pair. A refusal/hard denial saves the entry with the reminder off rather than lying about delivery. The detail switch can disable/re-enable each person independently. Fixed copy: "कल <relation> की पुण्यतिथि है · श्राद्ध तिथि: <tithi>".

Both tiers appear under the existing Reminders hub (More → स्मरण) with independent toggles, and both draw from the shared iOS pending budget.

## 4. What it computes (all from existing engine)

| Output | Source |
|---|---|
| Gregorian date → tithi (entry flow) | `computePanchangForDate(deathDate)` — sunrise anga, engine convention |
| Annual observance date per entry | The festival engine's `lunarMonth + paksha + tithi → date` solve — the same rule row shape as Janmashtami (`festivals.ts`), incl. kshaya/vriddhi and purnimant normalization |
| Adhik-maas years | Barsi observed in the **nija** (regular) month — engine already disambiguates; pinned by a fixture test |
| Pitru Paksha day | Person's tithi mapped into Bhadrapada Krishna paksha; Sarvapitri Amavasya as the unknown-tithi fallback |
| **Pitru Paksha itself (gap — new rules this PRD must add)** | The app today has **no computed Pitru Paksha**: `festivals.ts` carries only a `hidden()` catalog placeholder `shraddha-dates` (`recurrence: 'catalog'` → `festivalEngine` returns no dates), and nothing named Sarvapitri Amavasya or Mahalaya exists. Adjacent single-day rules bracket the fortnight (Anant Chaturdashi = the day before it begins; Jivitputrika and Indira Ekadashi fall inside it; the monthly Amavasya Vrat coincides with Sarvapitri Amavasya but isn't named so). PRD-17 adds: a **named Sarvapitri Amavasya** observance, the **Pitru Paksha range** (Bhadrapada Purnima → Ashwin Amavasya, purnimant), and the per-tithi shraddha-day table. `ruleType: 'range'` already exists in the types union but is unimplemented in the engine — implementing it here also unlocks the Chaturmasa / Purushottam Maas placeholders (and the unmerged Event Muhurat Finder branch computes Chaturmas independently; converge on one range mechanism at merge). |
| Countdown / "this year has passed → show next year" | Plain date math over the solved dates |

New pure module `mobile/src/panchang/pitruSmaran.ts` + `tsx --test` fixtures (including a kshaya-tithi year and an adhik-maas year — the two cases #192's kshaya work makes testable).

## 5. Tone & sensitivity (product stance, locked)

1. **No gamification of grief.** No streaks, no celebration animation, no NEW-badge styling inside the feature, no "you remembered!" copy. The routine-completion celebration mechanism is explicitly NOT wired here.
2. **Reverent defaults.** Notifications opt-in; the Panchang chip is quiet; the list is ordered by next date, not by recency of grief.
3. **Private by construction.** No share cards, no export in v1; entries never leave AsyncStorage. The backup/export path is the existing PRD-06 device-controlled JSON export, where these entries ride along like bookmarks.
4. **Traditional but not prescriptive.** The app states the tithi and links the paath; it never instructs ritual obligations ("आपको करना चाहिए…"). Guidance language mirrors the Guna Milan disclaimer stance.

## 6. What it does NOT do (non-goals)

- **No gotra/pinda/genealogy record-keeping** — this is remembrance, not a family-tree app.
- **No tarpan/shraddha liturgical content authored in this PRD** — v1 links existing Gita chapters; the shraddha vidhi itself is PRD-19 content (cross-linked when both ship).
- **No shared/family sync** — single-device by design; PRD-06 export is the transfer path.
- **No Gregorian-anniversary mode** — the entire point is tithi; a Gregorian repeat belongs in the OS calendar.
- **No monetization hooks, ever** (pandit booking, shraddha services — the incumbents' pattern).

## 7. Phasing

1. **Phase 1 (shipped in branch):** data model + `pitruSmaran.ts` solve + fixtures; More row; list/add/detail screens; Panchang day chip; Gita paath links.
2. **Phase 2 (shipped in branch):** default-on-at-save personal reminders, default-on season reminders, Pitru Paksha overview, standing Vrat-catalog ledger, permanent Home DISCOVER hook, public/private Home Today chips, and mapped-family day matching.
3. **Phase 3 (with PRD-19):** shraddha/tarpan vidhi cross-link. — **detailed in [19-shraddha-vidhi-phase3.md](./19-shraddha-vidhi-phase3.md); ON HOLD (product decision, 2026-08-18)**

## 8. Why it fits the moat

This is the feature *most* protected by the app's stance: the data is unshareable by nature, the computation is the engine's core strength, and no ad-funded competitor can touch the tone. It also deepens the Panchang tab from "what day is it?" to "what does this day mean *to my family*" — the strongest retention emotion available to this product.

## 9. Design compliance (design.md is authoritative)

- **Colour** — muted registers only: `parchment*`, `ink*`, `gold`, `divider`; saffron reserved for interactive affordances (buttons, chevrons), never for celebratory accents. No new tokens.
- **Type** — Noto Serif Devanagari primary; Cormorant Garamond for Latin secondary; ≥10 pt floor everywhere (§3.0).
- **Components** — `ReaderHeader variant="index"`, `TextField variant="form"`, the shared month/paksha/tithi pickers from the vrat/panchang surfaces; the **§33 ObservanceList row** for the person list, the **§33 ObservanceDetail hero** for the person detail, and the **§33.6 Upcoming row** for the Pitru Paksha fortnight; no hand-rolled inputs or cards (RULEBOOK §3).
- **Iconography** — `॥` and दीया glyph territory; **no emoji** (§5).
- **A11y** — chips carry text labels, not colour-only meaning; delete confirm is a full sheet, not a swipe-only gesture (§12).
- **Bilingual, Hindi-led** — Devanagari primary with the standard language system (hi/en/gu/kn) (§1).
