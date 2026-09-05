# PRD-26 — दान-पुण्य · Daan Punya — the giving layer: educate, record, hand off

| | |
|---|---|
| **Status** | Built (2026-09-01) — all phases in one build per product direction; full gates green (169 Jest suites / 1333 tests + engine/data tsx suites, lint 0 errors, tsc clean). OTA-safe JS, but the first release carrying the directory must ride a **store release** (§6.1). Maestro flow authored (`daan-punya-smoke.yaml`); device run pending a simulator environment. |
| **Origin** | `docs/roadmap/2026-Q3-roadmap.md` line "In-app purchases / donations (TBD, separate brief)" — this is that brief. Also closes the Q4-candidates coverage-map row "Vaar-wise daan (til on Shani, chana on Guru …) — *nothing*" jointly with PRD-21. |
| **Design** | `design.md` §72 (shipped with the build) |
| **Contract** | `RULEBOOK.md` §27 (shipped with the build) |
| **Convention** | `docs/roadmap/conventions/daan-punya-v1.md` (to be authored — see §10) |
| **Prototype** | `docs/daan-punya-prototype.html` — interactive; demonstrates the §2.7 educate-first journey, the ledger, the terminal hand-off, and the touchpoint doors |
| **Release** | Phase 1 **OTA-shippable** (pure JS + AsyncStorage). Phase 2 content-gated + store-policy-gated (see §7). |
| **Number note** | PRD-25 stays soft-reserved for सन्ध्या वन्दन. Numbering settled 2026-09-03 after two mainline waves: this built feature keeps **26**; round-2's शुभ योग/कुल परम्परा shipped on main as **27/29**, पर्व-अर्क stays **28**, कण्ठस्थ renumbered **26 → 42** (its only true collision); **31–40** are the 2027 feature bets, **41** is जिज्ञासा. Note PRD-40 (dakshina donation rail, 2027 bet) overlaps this feature's directory layer — reconcile before building it. |

---

## 1. Problem and outcome

Daan is the third leg of the practice tripod the shastra keeps returning to — **japa, vrat, daan** — and Vedansh already ships the first two legs end-to-end: a japam counter with alarms and pre-set saṅkhyās, and a vrat catalog with follow/remind, upvas vidhi, and parana times. Daan has *no surface at all*, yet the app's own shipped content talks about it constantly:

- The **Gita reader** carries the canonical teaching bundled and deep-linkable today: 17.20–22 (दातव्यमिति यद्दानं … देशे काले च पात्रे — sāttvika/rājasika/tāmasika daan), 18.5 (यज्ञदानतपःकर्म न त्याज्यम्).
- The **katha library** is saturated with daan as the moral engine of the story: Akshaya Tritiya (जल-दान and अन्न-दान that becomes अक्षय), Akshaya Navami (daan under the āmla tree), Amavasya vrat katha (til-jal tarpaṇa + अन्न-वस्त्र दान to the poor), Apara Ekadashi (पुण्य-दान), Aja Ekadashi (Harishchandra giving away his kingdom).
- The **sanskar section** ships गौ सेवा (`gau-seva.json`) — a daan-adjacent seva practice — already verified and live.
- **Vidhi conduct** already contains daan *steps* with no follow-through: Karwa Chauth's `karwa-dana` step and its "दान के लिए वस्त्र/दक्षिणा" samagri row; the shraddha-tarpan vidhi explicitly hands piṇḍa-dāna and bhojan off to family tradition.
- The **panchang engine** computes every day the tradition marks for giving — Makar Sankranti, Akshaya Tritiya, amavasyas, ekadashis, Pitru Paksha, Somvati Amavasya — and says nothing about the daan those days call for.

So the household reality the app leaves unserved: a family *does* give — anna-daan at the temple, til on Shanivar, a goshala contribution on Gopashtami, vastra-daan at Sankranti, shraddha-day bhojan — but nothing helps them know **what the tradition asks on which day**, nothing lets them **record** it the way the japam counter records japa, and nothing bridges the intent ("I should give today") to an **act** (a trusted place to give, or a note that they gave locally).

**Outcome:** a दान-पुण्य surface with three layers —

1. **Educate (दान ज्ञान)** — what the shastra says, what kind of daan belongs to which day/vaar/occasion, all cross-linked into content the app already ships.
2. **Record (दान-पुण्य खाता)** — a private, on-device ledger of one's giving, tithi-stamped by the panchang engine, in the same self-attested register as routine done-marks and the japam counter.
3. **Hand off (दान द्वार)** — a verified giving directory (NGOs, anna-kshetras, goshalas, temple trusts) with an *external* hand-off to the recipient's own official donation channel — the app never touches money — plus first-class manual entry for the giving that happens entirely offline (the temple hundi, the person at the gate).

## 2. Product principles (stance guards — this feature fails without them)

1. **The app never touches money. Ever.** No payment collection, no wallet, no processing, no commission, no "suggested amounts", no donation targets, no progress bars toward a goal. The hand-off is a door out of the app to the recipient's own official channel; recording is self-attested. This is simultaneously the dharmic stance, the bundle-only stance (no backend), and the store-policy stance (§7).
2. **Punya is not a number.** No punya points, no scores, no streaks-of-giving, no leaderboards, no gamification of dharma. The ledger is a **smaran** — a remembrance register, the same register Pitru Smaran uses — not a scoreboard. The §51 prohibitions (no luck score, no fear copy, no remedy upsell) carry over verbatim and get pinned in a copy-guard test: no "daan removes dosha", no "your punya balance", no guilt copy ("you haven't given this month").
3. **गुप्त दान is a first-class mode, not an afterthought.** The tradition's highest giving is unannounced. Every ledger field beyond the date is optional — amount, recipient, category can all be left blank, and a "गुप्त" entry records only *that* one gave, not what or to whom. Amounts, when entered, are private, on-device, never rendered on any share surface, and excluded from the share card by construction.
4. **Educate with the reason, never with a verdict.** Same register as vastu (PRD-24): the classical convention and its stated reason ("til on Shanivar because…"), never "you must" and never fear. The app informs the sankalp; the giver decides.
5. **Directory rows are verified like temple rows, or they don't ship — and the verification stays behind the curtain.** The giving directory follows the theerth/§10-family discipline: ≥2 independent published sources, dated verification notes, draft-invisible until verified, re-verified within 18 months. A misdirected donation is worse than a missing feature, so the verification bar here is the *highest* in the app (§6.2). But the bar is *editorial*, not decoration: the user sees a name, one line of what the place does, and the official link — never registration/80G text, never a "✓ verified" badge. The app explains **daan**; it does not advocate for organizations (§5.2).
6. **Bundle-only, as always.** No backend, no analytics, no cloud sync. The ledger lives in AsyncStorage; the directory is a bundled registry; reminders reuse the existing local-notification planners; export goes out via the OS share sheet (the PRD-06 backup pattern).
7. **Educate first — the donate door is the *last* act, never the pitch.** This is an IA contract, not a tone preference, and it is testable:
   - The daan home opens on **महत्व** — why the tradition gives, in the shastra's own words — never on a give CTA. No donate/give affordance exists above the educate content on any screen, ever.
   - The giving directory is **not** a tab, not a home-screen button, and not reachable in one tap from anywhere. Every path to the hand-off passes *through* an educate or occasion context first (§4a journey), and within that journey the give action is the final element, after the why, the shastra, the katha, and the what.
   - The ledger's "record" action always appears **before** the "give elsewhere" door wherever both exist — recording what one already gives is the primary behaviour; sending money out through the app's directory is the terminal, optional one.
   - Pinned in tests: a surface-contract test asserts the daan home renders zero `Linking`-bearing affordances, and the journey screens assert the hand-off button is unreachable until the educate steps have been rendered (not "skippable in one scroll-tap").

## 3. What the binary already gives us (why this is cheap)

| Need | Already shipped | Reuse |
|---|---|---|
| "Which tithi/vaar is today, what occasion is it" | Panchang engine, observance solver, vaar helpers (`routine/vaar`) | Tithi-stamp every ledger entry; auto-suggest the occasion |
| Self-attested daily record with local persistence | Routine done-marks (`@vedansh/routine-done`), JapamCounterContext | Same AsyncStorage + context pattern for the ledger |
| Verified place registry with groups + detail screens | Theerth (71 temples, group tags, significance) | Same registry shape for the giving directory |
| Scripture on daan, bilingual, deep-linkable | Gita ch. 17/18 JSON + `entryRoutes.ts` deep links | "पढ़ें: गीता 17.20" doors from every educate card |
| Daan-themed narrative content | Katha library (Akshaya Tritiya/Navami, amavasya, ekadashis) | Cross-links both ways (katha ↔ daan day) |
| Seva practice content | `sanskar/gau-seva.json` | Gau-seva ↔ goshala directory rows |
| Daan steps inside rites | Vidhi steps (karwa-dana, dakshina samagri), shraddha hand-off | "record this daan" door at those exact steps |
| Reminder plumbing | 7 local notification families + shared iOS budget | Opt-in daan-day reminders as a planner over followed occasions |
| Share cards | `shareVerse.tsx` 4:5 family | Optional "आज का दान संकल्प" share card (educate content only — never ledger data) |
| Sankalp before the act | PRD-20 (proposed) `composeSankalp` | Daan is one more `karma` clause when PRD-20 lands |
| Vaar-wise graha daan table | PRD-21 (proposed) 9-row practice table | One table, two consumers — build it once in whichever ships first |

## 4. The journey, then the touchpoint map

### 4a. The journey (the §2.7 contract, drawn once)

Every giving-adjacent surface in the app follows one canonical ordering. Contextual doors may enter the journey at its head, never past it:

```
महत्व (why the tradition gives — occasion/vaar aware)
  → शास्त्र (the verse itself: Devanagari + IAST + meaning, deep-linked where bundled)
    → कथा (the shipped story that carries the teaching, where one exists)
      → क्या दें (the traditional items for this day, with the one-line reason each)
        → संकल्प भाव (the giver's intent line; composed via PRD-20 when it lands)
          → [record in खाता]  ·  [दान द्वार — external, Phase 2, terminal]
```

The two bracketed actions render only at the journey's end. "Record" leads; the hand-off door trails it, marked as external. A user who arrives already knowing why (the U6 gate-and-hundi case) reaches the ledger directly from the More row — the ledger is never gated — but the *directory* is only ever reached through this journey.

### 4b. End-to-end use cases (the touchpoint map)

**U1 — Sankranti morning.** Makar Sankranti appears on the Home Today strip and Panchang tab (already shipped). Observance detail gains a quiet **आज के दान का महत्व** door — not a give button. It opens the §4a journey: why Sankranti is a daan day (Uttarayana, the til tradition and its reason) → the shastra card → the katha cross-link → the item list (til-gud, khichdi, vastra, each with its one-line why) → and only then the two terminal actions. The user who follows it to the goshala row lands on the trust's official donation page in the browser, gives there, returns; the app offers to record it. Entry auto-stamped माघ कृष्ण … / मकर संक्रान्ति. The user who stops at understanding has *also* been fully served — the journey is complete without the last step.

**U2 — Shanivar til-daan (weekly habit).** The vaar line ("आज शनिवार — शनि: til, oil") surfaces on the daan home — with a saved Kundali it aligns with PRD-21's running-daśā practice; with no chart it still works from vaar alone. "Add to Routine" creates a weekly Saturday routine item (existing `AddToRoutineButton` + routine units). Each week the user marks it done in the routine (existing flow) — and marking a daan-kind routine unit done offers the one-tap ledger entry.

**U3 — Shraddha-day anna-daan.** A Pitru Smaran tithi fires (already shipped, notification family exists). The shraddha-tarpan vidhi's existing "पिण्डदान, होम, भोजन… अपनी पारिवारिक परम्परा" hand-off gains a quiet door: anna-daan entries near the family's chosen city in the directory (anna-kshetras), plus manual record for bhojan done at home. The ledger entry carries the ancestor's occasion privately (the PRD-17 newborn/Pitru privacy stance: never on any share surface).

**U4 — Ekadashi / Akshaya Tritiya.** Observance detail on a daan-significant day cross-links the already-shipped katha ("पढ़ें: अक्षय तृतीया की कथा — इस दिन का दान अक्षय क्यों") and the educate card for that day's traditional items (jal-ghaṭa, anna, chhata/pankha on Akshaya Tritiya). One tap → record, or → directory.

**U5 — Vidhi conduct.** Karwa Chauth's `karwa-dana` step and any future vidhi step of kind `daan`/dakshina renders an unobtrusive "record this daan" affordance at that step (conduct mode stays swipe-only per PRD-19; the affordance is on the step card, not a new gesture).

**U6 — The gate, the hundi, the neighbour.** Most Indian giving is cash, in person, unplanned. Manual entry is therefore the *primary* entry path, not the fallback: open ledger → नया दान → date defaults to today (tithi auto), pick category chips (अन्न, वस्त्र, विद्या, गौ-सेवा, दीप, द्रव्य, रक्त-दान, श्रम/सेवा), everything else optional → save. Under 10 seconds.

**U7 — Year in giving / tax season.** Ledger → export: a device-only file (CSV + human-readable summary) via the OS share sheet — the PRD-06 backup pattern. Useful both as a Chaitra-to-Chaitra samvat reflection and as the giver's own record at tax time. The app does not carry anyone's registration ids or issue anything resembling a receipt — an 80G claim rests on the receipt the organization itself gives, which is exactly the boundary §2.1 draws.

**U8 — Sankalp before giving (PRD-20 synergy).** When PRD-20 lands, the daan surfaces pass `karma: 'daan'` clauses into `composeSankalp` — the formula that makes a daan *sāṅkalpika*. Until then, the educate layer carries the short traditional daan-sankalp line as static bilingual content.

## 5. Phased scope

### Phase 1 — ज्ञान + खाता (educate + ledger) — pure JS, OTA-shippable

- **`mobile/src/data/daan/`** — the educate registry (bilingual, RULEBOOK content shape):
  - `types.ts`, `index.ts` (verified-only accessors, §20/§21 draft-invisibility pattern).
  - `principles.ts` — the shastra layer: sāttvika daan (Gita 17.20 with deep link), the classical daan kinds (anna, vidya, go, bhū, kanyā… stated as the traditional enumeration, with anna-daan's primacy), gupt daan, patra-viveka (देश-काल-पात्र). Every row: convention + reason + `sourceRefs` (existing shipped content ids) + review-only `source` block.
  - `occasions.ts` — daan-by-occasion keyed to **existing** festival/observance rule ids (makar-sankranti, akshaya-tritiya, amavasya family, ekadashi family, pitru-paksha, gopashtami…): items, the one-line why, katha cross-link where one ships.
  - `vaar.ts` — the 7-row vaar-daan table (til/oil on Shani, chana/haldi on Guru, …). **Shared with PRD-21** — one module, whichever PRD builds first owns the file; pinned in `conventions/daan-punya-v1.md` jointly with `graha-practice-v1.md`.
- **`DaanPunyaContext`** — the ledger. AsyncStorage `@vedansh/daan-ledger:v1`. Entry: `{ id, isoDate, tithiStamp (auto from panchang), occasionRuleId?, category, items?, amount?, recipientId? | recipientNote?, note?, gupt?: boolean }`. All fields beyond date+category optional; `gupt` entries render as "गुप्त दान" with everything else hidden even locally-rendered lists showing only the date. Reducer + migration versioning per `sourceIdMigration.ts` discipline.
- **Screens (More stack, साधना group):** `DaanPunyaScreen` (educate home: आज का दान — today's occasion/vaar line; principle cards; occasion browser), `DaanLedgerScreen` (timeline grouped by month with tithi lines; export door), `DaanEntryScreen` (the 10-second form — `TextField variant="form"`, category chips in the muhurat-chip idiom, `ReaderHeader` index variant).
- **Contextual doors (Phase 1 set):** observance detail on daan-significant days; katha ↔ daan cross-links; Karwa Chauth `karwa-dana` step; Pitru Smaran detail. Each door pushes in place on its own stack (the PRD-19/24 multi-stack registration pattern).
- **Explicitly in Phase 1:** manual entry (U6), export (U7), routine integration for the vaar habit (U2's Add-to-Routine — routine `daan` unit kind).

### 5.1 The प्रयोजन (cause) axis — added 2026-09-03

The directory's organising axis is the **cause**, not the dravya. `data/daan/causes.ts` ships nine, each with a "whom this serves" line: **अन्न-जल सेवा** (food & water) · **गौ-सेवा** (gaushala) · **बाल-सेवा** (children) · **वृद्ध-सेवा** (elder care) · **विद्या-दान** (education) · **आरोग्य-सेवा** (health & blood) · **वस्त्र-सेवा** (clothing) · **जीव-सेवा** (animals & birds) · **आपदा-राहत** (disaster relief).

- **Two axes, never conflated** (RULEBOOK §27.12): the ledger's `DaanCategory` records *what was given*; `DaanCause` names *whom it serves*. The ledger schema is untouched — no storage migration.
- **No empty shelf**: cause chips are derived from the rows present, so a cause with no verified org renders neither chip nor group. Three rows were added to give the new causes real backing — **HelpAge India** (वृद्ध), **CRY** (बाल · विद्या), **Blue Cross of India** (जीव) — each verified against its official site plus Wikipedia; the directory is now **nine rows**.
- **गौ-सेवा ships on TTD's Gosamrakshana trust** (a government devasthanam — the strongest provenance in the set). A dedicated independent gaushala row is still wanted: every candidate found publishes its own 80G number with no independent corroboration, which fails §6.2, so none was added rather than lowering the bar.
- **Occasion → प्रयोजन** (the "link by purpose as per occasion" half): 19 of 20 occasion rows now carry `causes` — Sankranti → अन्न · वस्त्र · गौ, Guru Purnima/Gita Jayanti → विद्या, Navratri kanya-bhoj → अन्न · बाल, Bachh Baras → गौ, and so on. The journey's terminal step names them (`daan-journey-causes`) and its door opens the द्वार **pre-filtered** to them. कार्तिक दीप carries none — deep-daan has no beneficiary org — and passes no filter rather than an invented one.
- **App-wide purpose bridge, honest subset only**: a cause may claim a `purposeId` from the shipped text-intent taxonomy (`data/purposes.ts`) only where that taxonomy already names the seva — **विद्या→`knowledge`**, **आरोग्य→`health`**. `PurposeList` then renders a quiet educate door to the daan home. `wealth`/`prosperity` are **deliberately unbridged**: a give-door on a prosperity intent is exactly the fruit-promise §2.2 bans. Pinned in tests, both the mapping and the door's target. All daan screens are consequently registered on the Home stack too.

### 5.2 Explain the daan, not the organization — added 2026-09-05

A giving directory drifts, by gravity, into a fundraising portal: descriptions grow into profiles, profiles grow scale figures, and the app quietly becomes an advocate for nine organizations it cannot audit. The correction is structural, not editorial restraint.

**The mahatva belongs to the CAUSE, not the row.** Each of the nine प्रयोजन in `causes.ts` carries `mahatvaHi/mahatvaEn` — why *this kind of giving* is held dear — and the द्वार renders it **above** the places that serve it, in the grouped and the filtered state alike. अन्न carries Bhīṣma's anna-daan teaching from the Anuśāsana-parva; गौ, the Kāmadhenu/Govinda framing and the gau-gras practice from the app's own shipped gau-seva vidhi; बाल, Navratri's kanya-pujan; विद्या, Guru Purnima and Vasant Panchami; वस्त्र, the ritu reasoning behind Sankranti and amavasya cloth-daan. वृद्ध, आरोग्य, जीव and आपदा are written as plain tradition-register prose — what the giving actually relieves — and carry **no citation at all**, because none was found that they could honestly carry. A mahatva that cites must be sourced to §6.2's bar; one that does not must not pretend (`citeHi`/`citeEn`/`source` travel as three-or-none, pinned by test).

**A directory row is a place, not a profile.** Name, ONE line of what they do, and `officialUrl` — the page on their own domain where the giving happens. `DaanOrgEntry` cannot hold account numbers, UPI ids, registration/80G text, or scale figures; the `about` line is length-capped and digit-guarded so it cannot grow back into a pitch. The detail screen is correspondingly bare: name → the one line → the related teaching-katha → record-then-link.

**Verification goes behind the curtain.** §6.2's bar does not relax — it stops being *rendered*. The old detail screen showed registration kinds, the official domain and a "✓ verified against two independent sources · date" line. That reads as the app vouching for an organization, which it has no standing to do; and it made the paperwork, rather than the daan, the last thing the user read before leaving. `verifiedOn` and `source` remain in the data, driving `isOrgRowStale` and the review, and are never shown.

The net effect on the screen the user actually reads: the teaching is the larger half, the places are a short list underneath, and the outbound link is the smallest element on the page — which is what §2.7 was always for.

### Phase 2 — दान द्वार (giving directory + hand-off) — content-gated and policy-gated

- **`mobile/src/data/daan/directory.ts`** — bundled registry, deliberately THIN (see §5.2): `{ id, nameHi/En, kind: 'anna-kshetra' | 'ngo' | 'temple-trust' | 'seva-portal', causes, aboutHi/En (ONE line), officialUrl, verifiedOn, nonMonetary?, daanKathaId?, status, source }`. Launch set small and unimpeachable — the bar is §6.2, not reach. **Shipped: nine** (see §5.1). What the shape deliberately *cannot* hold: account numbers, UPI ids, registration/80G text, or scale figures the app would be asserting on an organization's behalf; a test greps `types.ts` for those field names so re-adding one fails the suite.
- **Hand-off UX:** directory row → detail (name, its one line, the related teaching-katha) → the action row with **record leading** and `आधिकारिक वेबसाइट` trailing → interstitial naming the host and stating plainly *the app is not part of this transaction and cannot confirm it* → `Linking.openURL(officialUrl)`. One outbound link per row, on the organization's own domain, pointing at the page where the giving actually happens. On return, a gentle one-time "क्या आप इसे खाते में दर्ज करना चाहेंगे?" — decline is silent and un-nagging.
- **Theerth tie-in:** temple detail rows for temples whose trusts run verified anna-kshetras/goshalas gain a giving line (registry cross-ref by temple id, the backgrounds-override pattern).
- **Opt-in daan-day reminders:** a planner over followed daan occasions, inside the existing vrat/festive notification families and the shared iOS pending budget — no new family unless the notifications wiki page's budget math demands one.

### Phase 3 — later, explicitly not now

Sankalp integration (waits on PRD-20), graha-daan chart alignment (waits on PRD-21), samvat "year in giving" reflection view, home-widget daan line, vidhi `daan` step kind generalization (waits on PRD-22's step-kind work). Nothing in Phase 1–2 data shapes assumes these; nothing blocks them.

## 6. The two hard gates

### 6.1 Store policy (the risk that kills lesser versions of this feature)

Apple 3.2.1(vi)/3.2.2 and Play's payments policy both scrutinize apps that *facilitate* donations. The design is built to stay on the safe side of the line both stores actually enforce:

- The app **never collects** funds, never processes, never takes a percentage, never runs a fundraising campaign, and never represents itself as the recipient.
- The hand-off is to the recipient's **own official channel in an external context** (Safari/Chrome/UPI app) — the same posture as linking to a temple trust's website, which theerth-class apps do routinely.
- No IAP is involved anywhere, so IAP-circumvention rules don't attach.
- **Gate:** before Phase 2 ships, the release checklist includes a written store-guideline self-review appended to this PRD, and Phase 2 rides a **store release** (not OTA) so review sees it explicitly. If review pushes back, Phase 2 degrades gracefully to directory-without-links (names + registration ids, no `openURL`), and Phase 1 is untouched — the phasing exists precisely so the ledger and educate layers never hostage to this gate.

### 6.2 Directory verification (the trust bar)

- Every row: ≥2 independent published sources recorded in the **review-only** `source` block with dated verification notes. Government/temple-trust provenance ranks first, then math/mission, then apolitical seva bodies.
- `officialUrl` is accepted from the organization's **own** domain (or a government domain) only — never from aggregator listings. A row with no verifiable official giving page ships without a link (information only) rather than with a best guess.
- **The verification is never rendered.** `verifiedOn` and `source` are editorial: they drive the staleness drop and the review, and the user sees neither. Showing a "verified" badge would make the app a guarantor of an organization it cannot audit — precisely the posture §2.1 refuses.
- Registry invariant tests pin: bilingual completeness, https-only single official URL, no UPI, ≥2 source domains, the banned field names on `DaanOrgEntry`, the one-line `about` cap, draft invisibility, and the copy guard (no fear/guilt vocabulary anywhere in `data/daan/`).
- Rows are re-verified on a dated cadence; a stale row (>18 months) drops to `draft` at the accessor rather than shipping stale channels.
- **Egress note (the honest one):** this verification needs the authoring environment to reach registry sources. The same 403-CONNECT egress wall that parked PRD-09/P4 and PRD-16 content applies — which is exactly why Phase 2 is sequenced behind the fully-computational Phase 1, per the Q4-candidates feasibility doctrine.

## 7. Non-goals

No payment collection or processing; no commission or monetization of giving in any form; no punya quantification, scores, streaks or leaderboards; no donation goals/targets/progress bars; no crowdfunding or campaigns; no user-generated directory entries; no recipient ratings or rankings; no cloud sync of the ledger (device backup/export only); no guilt or fear copy anywhere; no notification that asks for money (reminders name the *occasion and tradition*, never an amount or a recipient).

## 8. Surfaces (summary)

- **More hub** — साधना group row "दान-पुण्य / Daan Punya", `testID="more-daan-punya"`.
- **DaanPunyaScreen** — the educate home, in §4a order: आज का दान महत्व line (occasion + vaar aware), shastra principle cards (Gita deep links; RV 10.117 / TU 1.11.3 verse cards), katha cross-links, occasion browser, and a single quiet खाता door at the end. **No directory door and no give affordance on this screen** — the directory is reached only from inside an occasion journey (§2.7).
- **DaanLedgerScreen / DaanEntryScreen** — timeline + the 10-second form; export via share sheet.
- **DaanDirectoryScreen / detail** (Phase 2) — grouped by प्रयोजन, each cause's **mahatva above its places** (§5.2), thin rows, external hand-off with the honest interstitial.
- **Contextual doors** — observance detail (daan days), katha cross-links, Karwa Chauth daan step, Pitru Smaran, theerth temple detail (Phase 2), routine daan unit.

## 9. Acceptance and release gates

1. **Unit:** ledger reducer + AsyncStorage versioning/migration; tithi-stamping against the panchang engine (fixed dates × fixed cities); educate/occasion/vaar registry invariants (bilingual fields, ≥2 source domains, existing-rule-id referential integrity — every `occasionRuleId` must exist in the festival/observance rule tables); copy guard (no fear/guilt/score vocabulary); gupt-entry rendering (amount/recipient provably absent from every render path and from the share pipeline).
2. **Phase 2 adds:** directory invariants (§6.2 list); hand-off interstitial shown before any `openURL`; return-flow prompt fires at most once per hand-off; the **§2.7 surface-contract test** — the daan home renders zero external-linking affordances, and journey screens render the hand-off action only after every educate step has rendered.
3. **Screen (Jest):** DaanPunya renders occasion line for a daan-significant fixture date; entry form saves with only date+category; ledger groups by month with tithi lines. (VirtualizedList teardown discipline per the repo gotcha.)
4. **Maestro:** More → दान-पुण्य → नया दान → category chip → save → visible in ledger; observance-day door assertion. Every change ships with e2e per the [[e2e-verification]] policy.
5. `npm run lint` 0 errors; `tsc` clean; **design.md §72 + RULEBOOK §27 land in the same PR as the build** (design-doc-sync rule); categories/enumeration mirrors refreshed if any registry list is doc-mirrored.
6. Phase 1 may ship OTA at the live store runtime; **Phase 2 must ride a store release** (§6.1) even though it contains no native module — the gate is review visibility, not the binary.

## 10. Educate content corpus — verified source spine

The educate layer is what makes this feature *not* a donate button. Its content is source-backed, layered by canon, and rendered in the reader's own discipline (Devanagari + IAST + hi/en meaning; review-only `source` block never rendered; RULEBOOK §11 verification before `verified`). The spine, checked against published translations on 2026-08-30 (shlokam.org, wisdomlib.org, sacred-texts.com, sri-aurobindo.co.in — recorded per-row in the registry's source blocks):

| Layer | Source | What it gives the feature | Bundled today? |
|---|---|---|---|
| **Veda** | Ṛgveda 10.117 (the दान-सूक्त), esp. 10.117.6 *mogham annaṁ vindate apracetāḥ* — food gained and not shared is gained in vain | The oldest statement of why giving is dharma, not charity-as-favour; the anchor verse of the महत्व home card | No — 1–2 verses enter `data/daan/principles.ts` |
| **Upanishad** | Taittirīya Up. 1.11.3 — *śraddhayā deyam, aśraddhayā adeyam, śriyā deyam, hriyā deyam, bhiyā deyam, saṁvidā deyam* | *How* to give: with faith, according to means, with humility, with awe, with understanding — the giver's-bhaav card, and the register for the whole feature's copy | No — enters `principles.ts` |
| **Gita** | 17.20–22 (sāttvika/rājasika/tāmasika daan; *deśe kāle ca pātre*), 18.5 (*yajña-dāna-tapaḥ … na tyājyam*) | The three-guna teaching and patra-viveka; the only layer that is **already in the binary, deep-linkable today** | **Yes** — `gita/chapter-17.json`, `chapter-18.json` |
| **Itihasa** | Mahābhārata Anuśāsana Parva (दानधर्म पर्व) — Bhīṣma to Yudhiṣṭhira on anna-daan's supremacy (*all beings are born of anna and sustained by anna*) | Why अन्न-दान leads every occasion list and why anna-kshetras lead the directory | No — summarised teaching row with citation, not verse transcription |
| **Purana / katha** | Akshaya Tritiya katha (daan on this tithi is akṣaya), Akshaya Navami katha (daan under the āmla), Amavasya katha (til-jal tarpaṇa + anna-vastra daan), Apara/Aja Ekadashi (punya-daan, Harishchandra) | The narrative layer — **already shipped in the katha library**; the journey's कथा step links, never duplicates | **Yes** — `kathaContent/entries/` |
| **Smriti / occasion tables** | Vaar-daan and tithi-daan conventions (til on Shani, Sankranti til-gud, Akshaya Tritiya jala-ghaṭa/anna) | `occasions.ts` + `vaar.ts` rows | No — the §10-family two-source gate applies row by row; contested regional rows state the variance or stay `draft` |

Authoring rule: new verse content is limited to the Veda/Upanishad rows above (short, universally attested, translation-checkable); everything else either links to bundled content or ships as a *teaching summary with citation*. The corpus is deliberately small — the educate layer's authority comes from precision, not volume.

### 10.1 Day coverage matrix (`occasions.ts` — which days get the daan treatment)

Coverage discipline first: **a day gets a daan row only where an attested daan tradition exists — otherwise no row, and the host screen simply shows no daan section** (the PRD-09 "absent, never placeholder" rule). Every `occasionRuleId` below is a real id in the shipped observance/festival solver (verified against `precomputedObservances.ts` / `festivals.ts`, 2026-08-30).

**Tier 1 — the great daan days** (full journey, rich महत्व):

| Rule id(s) | Day | Traditional daan (each row carries its reason) |
|---|---|---|
| `makar-sankranti` | मकर संक्रान्ति | til-gud, khichdi/anna, vastra-kambal, gau-grass |
| the other 11 `*-sankranti` ids | every solar ingress | one shared snāna-dāna row; `karka-sankranti` (dakshinayana) gets its own |
| `akshaya-tritiya` | अक्षय तृतीया | jala-ghaṭa, pankha/chhata, anna, jau-chana — the akṣaya teaching |
| `shraddha-dates` | पितृ पक्ष fortnight | anna-daan, til, vastra, bhojan — ties into Pitru Smaran |
| `akshaya-navami` | अक्षय नवमी | anna/bhojan under the āmla — katha shipped |
| `guru-purnima` | गुरु पूर्णिमा | vidya-daan, guru-dakshina |
| `vasant-panchami` | वसंत पंचमी | vidya-daan (Saraswati) — books, fees, teaching |
| `ganga-dussehra`, `ganga-saptami` | गंगा दिवस | jala-daan — water, pyau, sherbet |
| `govardhan-puja` | गोवर्धन / अन्नकूट | anna-daan, gau-seva |
| `bachh-baras` | गोवत्स द्वादशी | gau-seva, gau-grass — links shipped `gau-seva` sanskar |
| `dhanteras`, `diwali` | दीप पर्व | deep-daan, yam-deep; anna to the lamp-lighter |
| `karthigai-vrat` + Kartik `purnima-vrat` | कार्तिक पूर्णिमा / देव दीपावली | deep-daan, anna |
| `chhath-puja` | छठ | thekua/anna sharing at the ghat |
| `navratri-start` | नवरात्रि | kanya-bhoj on ashtami–navami (puri-chana-halwa), bhandara — *added by the 2026 year audit* |
| `sharad-purnima`, `kojagara-puja` | शरद पूर्णिमा / कोजागरा | moonlit-kheer prasada shared next morning — *added by the 2026 year audit* |
| `gita-jayanti` | गीता जयंती (मोक्षदा एकादशी) | gita-daan — gifting the Gita; exact id wins over the `-ekadashi` family — *added by the 2026 year audit* |

**Tier 2 — the recurring tithi cadence** (one row per family, surfacing every occurrence):

| Rule id(s) | Cadence | Daan row |
|---|---|---|
| `amavasya-vrat` | every amavasya | til-jal + anna-vastra (pitru-tṛpti); the row itself notes the somvati elevation when the tithi falls on Monday |
| `purnima-vrat`, `shree-satyanarayan-vrat` | every purnima | anna/kheer, prasad sharing |
| all named `*-ekadashi` ids (the `EkadashiKathaRuleIds` family) | every ekadashi | anna to the needy at parana; `shattila-ekadashi` gets its own row — the six-fold til day, til-daan explicit |
| `masik-shivaratri`, `pradosh-vrat-*`, `sankashti-chaturthi-vrat`, … | — | **no row** — no broadly attested daan tradition; the section stays absent |

**Tier 3 — weekly** (`vaar.ts`, 7 rows): the vaar-daan table (til/tel on Shani … chana-haldi on Guru), keyed to `navagraha-weekday-fasts` / `deity-weekday-fasts`, shared with PRD-21.

**Tier 4 — personal days** (journeys without occasion rows): Pitru Smaran shraddha/barsi tithis (anna-daan door, PRD-17 privacy stance) and the user's janma-tithi (a quiet traditional birthday-daan line on the Kundali profile day). Grahan (eclipse) daan is a **known omission** — the engine computes no eclipses today; noted for a future engine PRD, not faked from a table.

Net: ~50 solver rule ids covered by 20 occasion rows (the ekadashi and sankranti families collapse into shared rows with named exceptions).

**Year-level audit (2026, purnimant, run against the live engine on 2026-09-01):** the solver resolves 258 observance instances over 92 distinct rule ids on 191 calendar days; **67 distinct days carry a covered daan occasion**, and all 365 carry the vaar-daan line. Every remaining uncovered rule id was individually reviewed: the high-frequency ones (pradosh ×25, sankashti/vinayaka ×25, masik kalashtami/shivaratri/durgashtami/janmashtami ×~50, dwadashi ×24, skanda sashti ×12) have no broadly attested daan tradition — excluded by the §10.1 no-row discipline — and the one-off festivals (holi, ram-navami, janmashtami, teej, karwa-chauth, bhai-dooj, rakhi, …) are vrat/utsav days, not daan days; karwa-chauth's karwa-dana lives inside its shipped vidhi. The audit surfaced three genuine gaps, verified and added the same day: navratri kanya-bhoj, sharad-purnima kheer-prasada, and gita-jayanti gita-daan.

### 10.2 Story content plan (the कथा step)

**Bucket A — cross-link only, zero new writing, OTA-free.** Already shipped in `kathaContent/entries/` and carrying the daan teaching natively: `akshaya-tritiya-vrat` (Dharmadas — small daan, akṣaya fruit; the akshaya-patra), `akshaya-navami` (daan under the āmla), `amavasya-vrat` (til-jal tarpaṇa + anna-vastra; the saubhagya-daan episode), `apara-ekadashi` (Dhaumya's punya-daan), `aja-ekadashi` (Harishchandra gives kingdom, self), `amalaki-ekadashi` (sahasra-godaan equivalence), `shattila-ekadashi` (the six uses of til), `guru-purnima` (dakshina), `govardhan-puja` (annakut), `ganga-dussehra`. The journey's कथा step links these; it never duplicates them.

**Bucket B — new katha entries to author** (each: `kind: 'teaching-katha'`, RULEBOOK §11 two-source gate, ships `draft`-invisible until verified — the PRD-22 Phase-B egress caveat applies):

| New entry | Source | The teaching it carries | Surfaces on |
|---|---|---|---|
| दानवीर कर्ण (kavach-kundal) | Mahābhārata | giving what costs you; gupt-daan register | द्रव्य/gupt-daan card; रविवार (Sūryaputra) |
| राजा रन्तिदेव | Bhāgavata 9.21 | the apex anna-daan story — 48 days hungry, gives the last water away | anna-daan card; anna-kshetra directory detail |
| राजा शिबि | Mahābhārata (Vana) | śaraṇa and deha-daan — protection as giving | श्रम/सेवा card |
| बलि–वामन | Bhāgavata 8 | daan and ahaṅkāra — the gift that measured three worlds | govardhan/bali-pratipada; "daan and ego" teaching |
| सुदामा का पोहा | Bhāgavata 10 | bhaav over mātrā — why the ledger records no totals | the ledger empty-state; गुप्त दान teaching |

**Bucket C — principle/teaching rows** (not kathas; `principles.ts`, ~8–10 rows): the §10 verse spine (RV 10.117, TU 1.11.3), Gita 17.20–22 contextual note, the Anuśāsana anna-daan summary, the classical daan enumerations (deśa-kāla-pātra; the traditional daśa-dāna list stated as tradition, not prescription), and gupt-daan.

Sequencing note: Bucket A ships with Phase 1 (it is pure cross-linking). Buckets B/C verse rows are content-gated like every sourced corpus in this repo — authored now, `draft` until the verification environment can reach sources, exactly the PRD-09/P4 pattern.

## 11. Open decisions (for `conventions/daan-punya-v1.md`)

1. **Category taxonomy** — pin the ledger category chips (proposed: अन्न, वस्त्र, विद्या, गौ-सेवा, दीप, द्रव्य, रक्त-दान, श्रम/सेवा, अन्य) and their occasion mappings; regional variance stated in-row where sources split.
2. **Vaar-daan table ownership** — one shared module with PRD-21; pin the item list per vaar with sources (the two PRDs must not ship divergent tables).
3. **Directory launch set + inclusion policy** — the written bar for who gets a row (national reach vs. per-city; whether temple hundis are represented as information-only rows), and the re-verification cadence.
4. **UPI on iOS** — ship `upi://` behind `canOpenURL` capability detection or hold iOS to web-only hand-off at launch. (Recommendation: web-only on iOS at launch; revisit with device data.)
5. **Amount currency/format** — INR-only free-text vs. structured; recommendation: optional structured INR, never displayed outside the ledger and export.

---

*Postmortem: to be appended after ship, per roadmap convention.*

## Verification records

- **2026-09-01 — Full build (all phases in one go, per product direction).** Content: verse spine
  (RV 10.117.6, TU 1.11.3 checked against two published translations each; Gita 17.20 copied
  verbatim from the app's own bundle; Anuśāsana summary), 17 occasion rows (every exact ruleId
  verified live against `OBSERVANCE_RULES` — 112 rules, 24 ekadashis, 12 sankrantis), the 7-row
  vaar table (two concordant Hindi references), five teaching-kathas authored bilingually
  (canonical episodes checked against Ganguli/vedabase/wisdomlib), and six directory rows with
  official domains verified against ≥2 independent sources each (no registration numbers
  transcribed, no UPI). Implementation: `data/daan/*`, `DaanLedgerContext`, seven screens,
  `DaanStackParamList` on the More + Panchang stacks, the More-hub row and the Observance-Detail
  last-section door, provider in App.tsx. Gates: `npm test` exit 0 (169 Jest suites / 1333 tests
  + engine 77 + widgets/data tsx suites), `npm run lint` 0 errors, `tsc` clean; design.md §72 +
  RULEBOOK §27 + wiki page in the same commit series. The §2.7 surface contract, the journey's
  terminal gating, the gupt two-sided guarantee, exact-beats-suffix matching, directory staleness,
  and the copy guard are all pinned in tests. One pre-existing suite
  (`vidhiBackNavigation.test.ts`) pinned the literal source shape of `MoreStackParamList` and was
  loosened to admit the daan param list — its actual contract (GitaReader stays on More) unchanged.
  Deliberately deferred: opt-in daan-day reminders (followed daan occasions already notify via the
  shipped vrat/festive families; a dedicated planner waits on iOS pending-budget math), the Karwa
  Chauth vidhi-step record affordance and Routine daan-unit one-tap entry (small follow-ups), and
  the §6.1 written store-review which belongs to the release PR that first ships the directory.
