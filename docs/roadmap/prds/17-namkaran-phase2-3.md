# PRD-17.2/3 — Namkaran — Phase 2 (संस्कार विधि · Spotlight · deity-link) & Phase 3 (naming-day reminder · Home presence)

| | |
|---|---|
| **Status** | Proposed — detail PRD for the two final phases; vidhi content-gated; prototype attached |
| **Parent** | [PRD-17](./17-namkaran.md) §9 Phases 2–3 · [TRD-17](../trds/17-namkaran.trd.md) (as-built Phase 1) · [`namkaran-namakshar-v1.md`](../conventions/namkaran-namakshar-v1.md) |
| **Prototype** | [`docs/namkaran-phase2-3-prototype.html`](../../namkaran-phase2-3-prototype.html) — 6 frames: result screen with vidhi door + deity row + reminder action, vidhi prep, vidhi conduct card, Home DISCOVER Spotlight, lock-screen reminder, naming-day Today-strip chip |
| **T-shirt size** | **M** — engine work is nil; the cost is one sourced vidhi (content), one tiny notification family, and copy in hi/en with gu/kn derived by transliteration |
| **Completes the feature** | **Yes.** Phases 2 and 3 are the final phases of PRD-17. No further phases exist or are implied; anything not in this document is a non-goal or a recorded open question, not a "later". |

> **Product stance (unchanged from PRD-17):** the app supplies the syllable, the meanings, the
> muhurat — and now the rite's procedure and a quiet reminder — and gets out of the way. Nothing in
> these phases names the child, ranks names, or makes a claim about the child. And nothing in these
> phases weakens the Phase-1 newborn-privacy posture: **newborn birth details remain the most
> sensitive data this app holds**, and every new surface below is designed never to carry them.

---

## 1. Prerequisites — the three open Phase-1 gates (not re-scoped here)

Phase 1 engineering shipped (#261–#263) but **no store release may expose any Namkaran surface** —
Phase 1, 2, or 3 — until the parent PRD's open gates close. This PRD lists them as blocking
prerequisites; it does not re-scope, soften, or restate them:

1. **Convention sign-off (PRD-17 §11.1)** — a domain reviewer closes all 108 syllables, the four
   open rows (convention §2), and the attribute table with two concordant sources each.
   `NAMAKSHAR_SOURCE.verified` stays `false` (test-pinned) until then.
2. **Shipping name corpus (PRD-17 §11.2)** — the repo's `mobile/src/data/namkaran/` shards are a
   development sample; `NAMKARAN_CORPUS.releaseEligible` stays `false` (test-pinned) until the
   attested 12 + 12-per-charana corpus lands.
3. **Android Maestro (PRD-17 §11.9)** — `.maestro/namkaran-smoke.yaml` passed on iOS
   (2026-08-13); the independent Android run is still owed (RULEBOOK §8).

Phases 2–3 may be **built and merged** behind these gates (exactly as Phase 1 was), but the gates
release-block the whole feature together.

## 2. Goals and non-goals

**Goals**

- **G1 (P2)** Ship the **नामकरण संस्कार vidhi** — the rite's preparation checklist and guided
  conduct steps — as a first-class entry in the PRD-19 vidhi registry, and open the vidhi door the
  TRD already planned on the Namkaran result screen.
- **G2 (P2)** Make the feature discoverable from Home via one **DISCOVER Spotlight card**, under
  the existing rotation rules, with copy that can never leak a saved result.
- **G3 (P2)** Connect the nakshatra's **presiding देवता** to the shipped Deity Index where an
  honest identity exists, so the result screen leads into content the app already ships.
- **G4 (P3)** A **one-shot naming-day reminder**, explicitly opted into from the result screen,
  firing on the chosen muhurat day morning, carrying **no name and no birth data** in its payload
  or visible copy.
- **G5 (P3)** A **naming-day presence on Home** — a Today-strip chip on the day itself, following
  the Pitru Smaran private-chip precedent — generic, private-by-default.

**Non-goals**

- No numerology, ranking, or claims about the child (parent §7 stands in full).
- No recorded audio in the vidhi (text + shipped TTS/read-aloud only — audio would force a store
  release per TRD §13 and is a separate size decision, per PRD-19 §7).
- No second calculation basis. The parent's Phase-3 line "namkaran-day nakshatra as an explicit
  second basis" is resolved by parent §7's own non-goal: the custom is **explained in the vidhi
  copy**, not built as a second engine path. Recorded as open question 3, not as scope.
- No 17th Home grid tile. The launcher grid stays closed (parent §3.1); Phase 3's "Home tile" is
  delivered as the naming-day Today-strip chip (§6.2), which fulfils the intent without a grid
  re-flow.
- No new native dependency, no remote anything, no account, no cloud sync.

## 3. Phase 2a — the नामकरण संस्कार vidhi (content-gated)

### 3.1 It is a vidhi registry entry, not a `sanskar` text module

The parent PRD (§6) predates PRD-19 shipping; it imagined "one `sanskar` content module". That is
now the wrong home twice over: the `sanskar` category in `categories.ts` is **संस्कार · Good
Habits** — a habits shelf, not lifecycle rites — and PRD-19 has since shipped a purpose-built
guided-procedure registry (`mobile/src/data/vidhi/`, six entries, 96 steps) with exactly the
prep/conduct split this rite needs. The नामकरण संस्कार therefore ships as **`VidhiEntry`
`namkaran-sanskar`** in that registry, reusing the shipped catalog, detail (तैयारी checklist),
and conduct (swipe-paged cards, keep-awake, resume) screens unchanged.

### 3.2 Shape (structure is spec; step text is not authored here)

- **तैयारी** — samagri checklist (occurrence-scoped via the existing `checklistStore`), sourced
  with the procedure. Shareable as plain text like every vidhi checklist — a samagri list carries
  nothing personal.
- **Conduct steps** in the three shipped phases (आरम्भ · मुख्य · समापन): purification/kalash/deepa,
  Ganesh smaran, the sankalp (instruction-only unless its exact wording verifies — the
  Satyanarayan precedent), the naming moment itself (the father speaking the name in the child's
  right ear; the नामाक्षर tradition explained here in copy, including the गुप्त-नाम custom and the
  ceremony-day-nakshatra variant, per parent §7), blessings, and aarti.
- **Mantra hand-offs to shipped texts by section id** (`VidhiRef`), never re-typed (RULEBOOK
  §11.11): Ganesha vandana → `ganesh-stotram` and the deepa shloka → `sandhya-deepam` are already
  shipped, verified hand-off targets from the Phase-2B vidhi pass; further inline mantras appear
  **only** as `VidhiMantra` records transcribed verbatim with per-mantra citations (§11.3).
- Private `source` block (`canonicalEdition`, `canonicalEditionUrls`, `canonicalEditionStatus`,
  `referenceUrls`) — mandatory in data and tests, never rendered.

### 3.3 The content gate — be honest about it

This entry is gated **exactly like PRD-19 Phase 3's shraddha vidhi**: RULEBOOK §3.4/§11 two-source
verification (DrikPanchang plus one independent published karmakand reference; Gita Press canonical
edition recorded honestly as read or pending) **cannot be performed in this environment** —
DrikPanchang/archive.org egress was unreachable on 2026-08-12 and 2026-08-14, and §11.3 forbids
authoring liturgy or claiming unopened sources. Therefore:

- The vidhi entry, the result-screen door (§3.5), and their tests land in **one PR authored in an
  egress-capable environment**, with `canonicalEditionStatus` recording the dated checks.
- Until then, nothing ships: **no placeholder entry, no disabled door, no "coming soon"**.
- Like every vidhi and like the namakshar convention, the entry's tradition/source metadata stays
  **DRAFT until content sign-off** and is never rendered in customer UI.
- All liturgical copy in the attached prototype is marked **ILLUSTRATIVE SAMPLE** and must not be
  transcribed into the app.

### 3.4 Data-model delta — a vidhi without a festival

`vidhiContent.test.ts` asserts `festivalIds.length >= 1`; a lifecycle rite has no
`ObservanceRule`. Delta: `VidhiEntry` gains `occasion?: 'festival' | 'sanskar'` (default
`'festival'`), and the test requires `festivalIds.length >= 1 || occasion === 'sanskar'`.
`getVidhiForFestival` is unaffected (empty `festivalIds` simply never matches); the day-panel
pill never appears for this entry — its doors are the Namkaran result screen, the vidhi catalog
row, and the automatic search section row (`searchIndex` picks it up with zero index changes,
pinned by the existing count assertion). No Add-to-Routine button: there is no recurrence.

> **Reconcile with PRD-19 Phase 3:** [19-shraddha-vidhi-phase3.md](./19-shraddha-vidhi-phase3.md)
> independently proposes `anchor?: 'festival' | 'personal-tithi'` on `VidhiEntry` for the shraddha
> vidhi. `occasion` (what kind of rite) and `anchor` (where its date comes from) are different
> dimensions, but whichever PRD lands second must fold both into one reviewed `VidhiEntry` change
> and one updated `vidhiContent.test.ts` invariant — two uncoordinated relaxations of the
> `festivalIds.length >= 1` assertion are not acceptable.

### 3.5 The vidhi door on `NamkaranResultScreen`

Per TRD §7.2.6, a second `ListCard` door lands directly below the shipped नामकरण मुहूर्त door
(parent §5.6 order), on **both exact and range results** — the rite does not depend on which
syllable won: thumb glyph `॥`, title **नामकरण संस्कार विधि**, subtitle "संस्कार की तैयारी और
चरण-दर-चरण विधि देखें।" / "Prepare and perform the naming rite, step by step." It navigates to
`VidhiDetail { vidhiId: 'namkaran-sanskar' }` — the vidhi routes are already registered on the
Panchang stack (shared `VidhiStackParamList`), so the push stays in place and back returns to the
result. Nothing from the result (syllable, basis, shortlist) is passed as a param: the vidhi is
generic content, and its checklist/progress store must stay free of child data by construction.

## 4. Phase 2b — Home DISCOVER Spotlight

One `FeatureSpotlight` registered in `HomeScreen`'s `spotlights` array — the shipped shell, the
shipped rotation (all cards render; order shuffled once per app open via `shuffleBySeed`; no
weighting, no pinning, no new rules):

- key `namkaran`, `hasNew: true` (standard versioned NEW badge), glyph `ना` in the saffron icon
  tile (Devanagari, no emoji).
- Copy is **static and generic — the card never reads Namkaran storage** (no saved syllable, no
  shortlist count, no birth details, not even "resume where you left off"): titleHi **नामकरण**,
  titleEn **Namkaran**, descHi "जन्म नक्षत्र से नामाक्षर और अर्थ-सहित नाम पाएँ।", descEn
  "Find the traditional naming syllable and names with meanings.", ctaHi "देखें", ctaEn "Open".
  hi/en authored; gu/kn derive by transliteration through the existing language path. English
  accessibility label stays static for Maestro.
- `onPress` → `rootNav.navigate('PanchangTab', panchangTabTarget('Namkaran'))` — the cross-tab
  helper the tour and Pitru card already use; lands on the entry screen (path A/B choice), never
  on a saved result.
- Copy obeys RULEBOOK §3: no on-device/offline/version/implementation language.

## 5. Phase 2c — deity-link: nakshatra devata → Deity Index

The result screen's nakshatra-context row names the presiding देवता as text (convention §3). Where
that devata **is** a deity the app ships content for, the row gains a tappable deity link into the
shipped Deity Index (design.md §42) — the same "earns its place in a devotional reader" move as
the Phase-1 `NameRecord.deityId` links.

- **Curated map, identity-only:** `NAKSHATRA_DEITY_LINKS: Partial<Record<number, Deity>>` beside
  the attribute table in `namkaranConvention.ts`. Verified against `deities.ts` (21 entries), the
  honest v1 rows are: **Shravana (22) → `vishnu`** (direct — the devata *is* Vishnu) and
  **Ardra (6) → `shiva`** (the devata is Rudra; the Rudra ≡ Shiva identification is traditional
  but is a content claim, so this row carries the same §11.1 reviewer sign-off as the convention —
  open question 1). No other nakshatra devata (Agni, Yama, Brahma, Indra, Varuna, …) has a deity
  entry, and **where no entry exists the link simply does not render** — the row stays plain text.
  No stretched mappings (Savita ↛ `savitr`: that registry entry is Gayatri-focused; Chandra/Soma
  has no entry), and adding registry deities to force links is out of scope.
- Rendering: the देवता value becomes a 44 pt row with a chevron and the deity's glyph; tap →
  the Deity Index detail via the existing reader dispatcher. Word + tint, never colour alone.
- A `tsx` test asserts every map key ∈ [0,26], every value resolves through `getDeityMeta`, and
  the map stays a subset (no entry for a devata the reviewer has not approved).

## 6. Phase 3 — naming-day reminder + Home presence

### 6.1 One-shot naming-day reminder (opt-in, generic, self-cancelling)

**Entry:** a quiet action on the result screen (below the doors) — **"नामकरण दिवस की याद दिलाएँ" ·
"Remind me on the naming day"** → opens the chosen date via the shipped `CalendarDatePicker`
(the user picks the day their family chose, typically from the नामकरण मुहूर्त door's results;
we do not auto-pick a "best" day). Saving requests the shared OS grant when needed and persists
only after success — the Pitru Smaran precedent; a refusal leaves the action honestly off.

**A new notification family** — pure planner + glue + headless scheduler, the shape all
seven existing families use:

| Property | Value |
|---|---|
| Identifier prefix | `namkaran-reminder` (own prefix; cancel-then-reschedule can never touch another family) |
| Planner | `namkaranReminderPure.ts` — pure, `now` parameterised, `tsx --test` |
| Slots | **Exactly one pending notification, ever**: day-of at **07:00 local** (before the 07:30 festive slot; alongside the vrat day-of default). No advance notice, no recurrence. `NAMKARAN_REMINDER_CAP = 1` |
| iOS budget | +1 against the shared 64-slot pool the wiki documents as already over-subscribed in the worst case — the audit note in `notifications.md` gets this family appended in the same PR |
| Copy | **Generic, fixed, baked at schedule time in the reading language.** Title **नामकरण** · body "आज नामकरण संस्कार का चुना हुआ दिन है। तैयारी और विधि देखें।" / "Today is the chosen naming day. Open the preparation and vidhi." **No child name, no shortlisted name, no syllable, no nakshatra, no birth field — ever** (§7). No implementation language (RULEBOOK §3) |
| Payload | `{ type: 'namkaran-reminder', dateKey }` — nothing else |
| Deep link | `PanchangTab → NamkaranResult`, re-derived from the stored basis (below); if the record no longer resolves, land on `Namkaran` entry instead of a broken screen (the retired-occasion guard pattern) |
| Android channel | reuses the existing default reminder channel — a one-shot rite notice does not warrant its own mute surface (channel attrs are pinned at creation; deciding later costs a `-v2` dance) |

**Storage:** `@vedansh:namkaran-reminder:v1` →
`{ version, dateKey, basis: { kind: 'manual', nakshatraIndex, pada } | { kind: 'session' }, conventionVersion }`.
A `manual` basis (a table cell, not a birth fact) may be embedded; a birth basis is **never
copied** — `kind: 'session'` defers to the opt-in session record, so the reminder can only outlive
what the user chose to keep. **One record at a time**; setting a new one replaces the old with a
visible notice.

**Cancel / re-plan invariants (test-pinned):**
1. Clearing the remembered birth details (or toggling remember off) cancels a `session`-basis
   reminder and deletes its record in the same invalidating mutation queue — a reminder must not
   survive the data it points at.
2. A past `dateKey` prunes on load and on foreground (the muhurat-follow precedent) — the chip
   (§6.2) and the pending slot disappear together.
3. Changing the date = cancel + schedule, never a second slot.
4. OS permission later revoked → the scheduler reconciles to zero pending and the surface shows
   the honest off state.

### 6.2 Home presence on the naming day — a chip, not a tile

On the naming day itself (`dateKey === today`), the **Today strip** gains a chip — the Pitru
Smaran private-chip precedent (`PitruSmaranDayChip`: device-matched, muted-gold, generic):
**`॥ नामकरण`** with the generic subtitle "आज का दिन" — **generic on-device copy only** (decision:
yes, generic — the strip is visible to anyone glancing at the phone, so it follows the same rule
as the lock screen; the name, syllable, and shortlist never appear). Tap → the same deep-link
target as §6.1. The chip renders only while the reminder record exists and matches today; it is
derived state over that one record — no new storage, no panchang solve, and it must not join the
strip's solve path (the strip already reserves row height; the chip mounts into the existing chip
row like the muhurat ★ chip). It never appears in the launcher grid, widgets, or share surfaces.

## 7. Privacy — the strongest section in the app

Everything from parent §8.3 stands. These phases add three surfaces that render **outside the
Namkaran flow** (lock screen, Home, notifications), so the invariant list grows. **The following
may NEVER appear on the lock screen / notification (title, body, payload, channel name), on any
Home surface (Spotlight card, Today-strip chip, widgets), or on any share surface:**

1. The child's name, any shortlisted name, or the shortlist count.
2. The nāmākṣara syllable, charana, nakshatra, pada, or rashi of a saved result.
3. Birth date, birth time, or any derived charana-plus-date pair.
4. The fact that birth details are remembered (an existence leak is a leak).
5. The naming `dateKey` in visible copy (the reminder fires *on* the day and says "today"; it
   never prints the date, and the chip appears only on the day itself).

Additional invariants: the Spotlight card is static (verifiably: its module reads no Namkaran
storage key); the vidhi's checklist/progress records key on `vidhiId` + date only; the reminder
record contains no birth field (schema-tested); the notification payload allow-list is
`{ type, dateKey }` and a test fails on any additional key; local diagnostic counters for the new
surfaces (spotlight taps, vidhi-door opens, reminder opt-ins/cancels, chip taps) carry counts
only — per parent §1, no name, syllable, or birth field in any counter.

## 8. Delivery, OTA analysis, and docs

- **All of Phase 2 and Phase 3 is pure JS + bundled JSON.** The vidhi is text-only (no audio),
  the Spotlight and deity-link are components + data, and the reminder family uses
  `expo-notifications`, already a native dependency. **Both phases are OTA-capable** per TRD §13
  (publish at the live store runtime). If audio ever joins the vidhi it becomes a store release
  and drags `APP_TOUR_VERSION` + a `whatsNew` entry — out of scope here.
- No panchang-engine change → **no `PANCHANG_DAY_CACHE_VERSION` bump**; no new caches; corpus
  byte budgets (§8.4) untouched.
- The corpus stays out of the startup graph: the Spotlight card and the chip import **nothing**
  from `data/namkaran/` (the ESLint `no-restricted-imports` fence already bars it; Home is on the
  barred list).
- Docs in the same PR series (`.claude/rules/design-doc-sync.md`): design.md §61 gains the vidhi
  door, deity row, reminder action, Spotlight entry, and chip; RULEBOOK §18 gains the reminder
  record + payload contract; the vidhi lands under RULEBOOK §18's content rows and PRD-19's
  registry count (6 → 7, search sections `library.length + VIDHI_ENTRIES.length` updates itself).

## 9. Test plan

| Layer | What | Runner |
|---|---|---|
| Vidhi content | registry integrity for `namkaran-sanskar`: `occasion: 'sanskar'` with empty `festivalIds` accepted, refs resolve to shipped texts, ≥ 2 source URLs, samagri non-empty, no rendered provenance | `tsx` → `test:data` (`vidhiContent.test.ts`) |
| Deity map | keys ∈ [0,26]; values resolve in `deities.ts`; only reviewer-approved rows present | `tsx` |
| Reminder planner | one-slot plan; 07:00 local; generic copy in all four languages; payload allow-list; past-date → empty plan; replace semantics; `now` parameterised | `tsx` (`namkaranReminderPure.test.ts`) |
| Reminder glue | opt-in requests grant, persists only on success; session-clear cancels in the invalidating queue; prune on load/foreground; deep-link routing incl. the missing-record fallback | Jest (`.jest.test` — `expo-notifications` imports) |
| Screens | vidhi door on exact **and** range results; door absent when the registry lacks the entry (pre-gate builds); deity row renders only for mapped nakshatras; reminder action states; chip renders only on `dateKey === today` and shows generic copy | Jest |
| Spotlight | card registered, static copy, no Namkaran storage import (source guard), navigation target | Jest (`FeatureCard`/Home tests) |
| Privacy | §7 invariants: payload schema, record schema, static-copy guards, no counter carries a name/syllable/birth field | `tsx` + Jest |
| Journey | extend `.maestro/namkaran-smoke.yaml`: result → vidhi door → prep → conduct first card → back; result → deity row (Shravana fixture) → Deity Index; Home → DISCOVER → Namkaran entry. Reminder toggles stay unit-tested (Maestro cannot drive permission dialogs or notification taps). **Run and report independently on iOS and Android — the outstanding Android debt (§1.3) is paid at latest here and blocks release either way** | Maestro |

Standing rules apply: notification suites under `tsx --test` unless they import
`expo-notifications`; Jest trees rendering lists unmount in `afterEach`; `npm run lint` 0 errors;
typecheck clean.

## 10. Edge cases

| Case | Handling |
|---|---|
| Naming day passes with no ceremony recorded | Prune reminder + chip silently; the result screen offers the reminder action again |
| Birth details cleared while a `session` reminder pends | Cancel + delete in the same mutation queue (§6.1.1) |
| Reminder set from a range (unknown-time) result | Allowed — the date is the family's choice, not a syllable claim; deep link returns to the range result |
| Convention version bump between schedule and fire | Payload carries no convention data; the result screen re-derives and shows its own version-change notice |
| OS notification permission denied at opt-in | Action stays off with the shared permission banner; nothing persists as on |
| Vidhi entry absent (content gate not yet cleared) | The door does not render at all — no placeholder (§3.3) |
| Spotlight tapped with a saved session present | Still lands on the entry screen; the entry screen's own state handles resume — the card must not deep-link into a result |
| Two children / a second naming | One reminder record at a time; setting a new date shows the replace notice (§6.1) |

## 11. Open questions

1. **Rudra ≡ Shiva map row (§5)** — needs the §11.1 domain reviewer's explicit approval; ship
   Phase 2c with Shravana → Vishnu alone if it is still open.
2. **Evening-before notice** — should the reminder add an 18:00 eve slot like vrat/Pitru
   families? Recommendation: no — one slot keeps the shared-budget cost honest and the samagri
   checklist is reachable all week from the door; revisit only on user evidence.
3. **Ceremony-day nakshatra as a second basis** (parent §9 Phase-3 line vs parent §7 non-goal) —
   recommendation: keep it copy-only inside the vidhi's naming step. The feature is complete
   without it; building it would need its own convention ruling first.
4. **Vidhi audio** — a store-release-sized decision deferred to PRD-19's recorded-audio track;
   explicitly not part of completing PRD-17.
