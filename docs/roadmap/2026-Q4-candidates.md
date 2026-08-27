# Vedansh — Q4 2026 Candidates: the household-practice gap & the next five features

| | |
|---|---|
| **Status** | Proposed for planning review — five candidate PRDs (PRD-20 … PRD-24), numbers reserved |
| **Dated** | 2026-08-22 (against `main` @ `67e22a2`, app 1.4.6) |
| **Method** | Audit what a Hindu household actually *does* — daily, weekly, monthly, and at life events — against what the binary ships today. Everything already shipped or already owned by a PRD (01–19) is excluded by construction; §3 lists those exclusions so the "unique" claim is auditable. |
| **Inherited constraint** | Bundle-only. No backend, no CDN, no streaming, no analytics SaaS, no cloud sync. Every candidate below is on-device or it is not in this document. |

---

## 1. What the audit found

Vedansh is, today, an unusually complete **reading and calendar** app. It is a *reciter's* app and a *panchang* app. Nineteen PRDs deep, it has 30+ reader screens, a full sidereal Jyotish engine (lagna, 9 grahas, Vimshottari dasha, nakshatra/pada), a festival/vrat solver, a 13-occasion muhurat finder, six guided pujas, Namkaran, Guna Milan, Pitru Smaran, a 73-temple pilgrimage map, and seven notification families.

The gap is not more text. **The gap is the part of household practice that happens with your hands, in your kitchen, and in your rooms** — and the part a family actually calls a pandit for.

Three structural asymmetries fell out of the audit:

1. **The app says *when*, never *how*.** `EVENT_RULES` dates thirteen occasions — griha pravesh, mundan, annaprashan, karnavedha, upanayana, vidyarambh, bhumi pujan, vahan, vyapar, sampatti, swarna, yatra, namkaran. Exactly **one** of them (namkaran, via PRD-17.2) has a procedure attached. The other twelve give you a date and then leave the room.
2. **Every rite in the app begins one step too late.** Puja Vidhi, vrat, japa, tarpan, sadhana — all of them open at the *action*. In practice each opens with a **सङ्कल्प**, the formula that names the exact cosmic and personal coordinates of what you are about to do. The app computes almost every coordinate that formula needs, and composes none of them.
3. **The observance layer covers *whether you eat*, never *what you eat*.** `upvasContent` gives fast type, window, parana instant, strictness. Nothing anywhere in the binary names a permitted food, a forbidden food, or a naivedya — and "what do I cook, what can I eat" is the single most-asked question in the house on any vrat or festival morning.

Plus two whole practice domains at **zero** coverage: **graha practice** (the app's Kundali stops at reflection and hands you one generic stotram link) and **vastu / direction** (the only `disha` in the codebase is travel disha-shool inside the muhurat engine).

### 1.1 Coverage map

| What a household actually does | Shipped today | Gap |
|---|---|---|
| **Daily** — prabhat/ratri shloka, bhojan mantra, sandhya deepam, tulsi jal | `data/sanskar/` (8 entries), Daily Routine | — |
| Japa mala, chalisa/aarti paath, verse reading | Japam counter + alarms, 30+ readers, read-aloud TTS | — |
| Tithi · Rahu Kaal · Choghadiya · Abhijit check | Panchang tab, Daily Muhurat, Home Today strip, widgets | — |
| Rashifal | Deterministic daily Rashifal from saved Kundali | — |
| **Sankalp before any of the above** | *nothing* — "sankalp" in-app means a multi-day Sadhana vow | **PRD-20** |
| Graha of the day / what practice belongs to it | Vaar deity suggestion (routine); one static Navagraha reader link | **PRD-21** |
| Ghar-ka-mandir upkeep, murti placement & don'ts | *nothing* | **PRD-24** |
| **Weekly** — vaar vrat (Somvar/Mangalvar/Shanivar) | Vrat & Parv catalog + follow/remind | — |
| Vaar-wise daan (til on Shani, chana on Guru …) | *nothing* | **PRD-21** |
| **Monthly** — Ekadashi, Pradosh, Sankashti, Purnima, Amavasya | Observance engine + katha + upvas vidhi + parana time | — |
| What to eat on the vrat · what to cook for parana | Fast *type* only ("grains abstained — fruit fare") | **PRD-23** |
| Pitru tithi remembrance | PRD-17 Pitru Smaran (native-verified) | — |
| **Festival** — dates, katha, guided puja | Festival solver, katha library, 6 Vidhis, festive toran | — |
| Naivedya / bhog per deity, and what must **not** be offered | *nothing* | **PRD-23** |
| Havan / yagna at any major rite | *nothing* — no havan content, no ahuti mechanic | **PRD-22** |
| **Life events** — muhurat for 13 occasions | PRD-16 finder (Phases 1–4 built) | — |
| The *procedure* for 12 of those 13 occasions | Namkaran only (PRD-17.2) | **PRD-22** |
| Baby name syllable · marriage compatibility | Namkaran, Guna Milan | — |
| Shraddha / tarpan | PRD-19 Phase 3 (proposed) | — |
| Pilgrimage discovery | Theerth map, 73 temples, significance + origin story | — |
| **Moving house / renovating / placing a murti** | *nothing* | **PRD-24** |

---

## 2. The five

Ordered by my recommended build sequence, which is **feasibility-first**: the two computational features lead, the three content-bearing ones follow.

Feasibility is graded against the constraint that has actually stalled shipped work in this repo — **content egress**. PRD-09/P4, PRD-16's rule tables, PRD-17's corpus, and PRD-16/P3's lagna tables all ship at `status: 'draft'`, user-invisible, because the authoring environment cannot reach DrikPanchang or archive.org (403 CONNECT, recorded in `upvasContent/_helpers.ts`). A feature whose value is *computed* clears that gate; a feature whose value is *transcribed* does not. Two of the five are computational on purpose.

---

### PRD-20 — सङ्कल्प · the pandit's opening line, composed for you

> *The one thing every rite in this app is missing, and the one the engine can already almost write.*

**The practice.** No traditional karma begins without a sankalp: the officiant fixes the act in time and person by reciting kalpa → manvantara → yuga → dvīpa → varṣa → place → **saṃvatsara → ayana → ṛtu → māsa → pakṣa → tithi → vāra → nakṣatra** → **gotra → name** → the karma undertaken. It is why you hire a pandit for a ten-minute puja: not the puja, the sankalp. Households either skip it, mumble a half-remembered version, or read a generic one off YouTube with the wrong tithi in it.

**Why it is the strongest candidate.** Of those fourteen slots, the binary already computes **nine** exactly, for any date and any location, offline: `PanchangData` gives vāra, tithi + pakṣa, nakṣatra, lunar māsa (with adhik), Vikram Samvat; `PanchangLocationContext` gives the place; the saved birth profile gives the name. Four small pure derivations are missing (**saṃvatsara** name from the 60-year cycle, **ayana**, **ṛtu**, Śaka Samvat) and one profile field (**gotra**). That is the whole engineering cost. Nothing here is transcribed prose — a sankalp is a *deterministic formula over a date*, which is exactly what this codebase is good at and exactly what dodges the egress gate.

**What ships.**
- `panchang/sankalp.ts` — pure: `composeSankalp(panchang, place, person, karma) → { devanagari, iast, slots[] }`. Slot-level output so the UI can show the working, per the house stance of never handing over an opaque verdict.
- Four pure derivations on top of `PanchangData`: `samvatsaraName()`, `ayana()`, `ritu()`, `shakaSamvat()`.
- `gotra` + optional `kul`/`pravara` on the existing birth profile (`@vedansh:kundali-birth-profile:v1`, bumped), with the traditional **काश्यप** fallback when a family does not know its gotra, and a first-class skip — the formula must degrade gracefully, not block.
- **आज का सङ्कल्प** surface: full-screen reverent card, Devanagari + IAST, read-aloud (`expo-speech` already ships), slot list, share card on the existing 4:5 family.
- Karma-aware entry points, each passing its own `karma` clause: Vidhi conduct **step 0** (all six Vidhis), Observance Detail on a vrat day, Japam session start (with the japa target as the karma), Pitru Smaran tarpan, Sadhana Program day 1.

**Feasibility.** ✅ High, and **OTA-shippable** — pure JS, no native dependency, no new asset.

**The one real decision.** The 60-saṃvatsara cycle has competing reckonings (Bārhaspatya vs. the southern/luni-solar mapping) that disagree by years, and North vs. South India name the current year differently. This needs `conventions/sankalp-v1.md` pinning the reckoning, the ṛtu boundary basis (solar vs. lunar-month pairs), and the fixed kalpa/manvantara/yuga preamble — same shape as the four convention docs already in `docs/roadmap/conventions/`. **This is a sign-off, not a research project**, because it is a choice between two known systems rather than a corpus to source.

**Stance guards.** The app composes a formula; it does not officiate. No claim of ritual sufficiency, no "your puja is now valid", and gotra is offered, never demanded.

---

### PRD-21 — नवग्रह नित्य उपाय · graha practice from your own chart

> *Turns the Kundali from a one-time novelty read into the reason someone opens the app on a Saturday.*

**The practice.** "Which graha is heavy for me right now, and what do I do about it" is the second-most-common reason an Indian family consults a pandit — and the answer is always a *practice*: this mantra, this many times, on this vaar, with this daan, plus this stotram. Saturday til-and-oil for Śani, Thursday chana-and-turmeric for Guru, Hanuman for Maṅgala.

**The gap, precisely.** §51 of `design.md` is explicit that Kundali is a *reflection* surface: three insight cards, one `JyotishPracticeCard` pointing at Navagraha Stotram / Surya Ashtakam / Shani Ashtakam, and a hard rule of no luck score and no remedy upsell. Meanwhile `kundali.ts` already computes all nine graha positions with house and retrogradation, whole-sign houses, and the running Vimshottari mahādaśā/antardaśā. **The chart is fully computed and the practice layer over it is one static link.**

**What ships.**
- `panchang/grahaPractice.ts` — pure. For the saved chart at a given date: the running mahādaśā/antardaśā lords (already available via `getCurrentDasha`), plus new pure gochar helpers — **Śani transit relative to natal Moon** (12th/1st/2nd → Sade Sati phase; 4th/8th → Kaṇṭaka/Aṣṭama), **Guru transit** relative to natal Moon. All of it is `getSiderealPlanetLongitude('saturn' | 'jupiter', date)` against a stored Moon rashi — the ephemeris is already in the binary.
- A **9-row practice table**: per graha → bīja mantra, japa-saṅkhyā, vāra, daan items, and the *already-shipped* section id to open (Navagraha Stotram, Shani Ashtakam, Surya Ashtakam, Hanuman Chalisa, …). This is the sourced part and it is nine rows — `conventions/graha-practice-v1.md`, verification-gated like every other convention table here. Note the japa counts are a distinct traditional table (Sun 7000 … Śani 23000); they are **not** derivable from `DASHA_YEARS`, so they must be pinned, not computed.
- **Surfaces:** a practice section on the Kundali overview that replaces the static card with the graha that is actually running; a **vaar-aware daily line** ("आज शनिवार — शनि") that works with *no* saved chart, so the feature is useful to a guest; and the payoff — **one tap sends the japa into the Japam counter pre-set to its saṅkhyā**, and Add-to-Routine / a japam alarm on that vaar.

**Feasibility.** ✅ Engine high and OTA-shippable; content is 9 rows, the smallest table any Jyotish feature here has needed.

**Stance guards — this one needs them most.** Framed as **नित्य उपाय / traditional practice**, never remediation-for-fear. No affliction severity score, no "dosha detected" alarm, no gemstones, no paid remedy, no fear copy — the §51 prohibitions carry over verbatim and get pinned in a test. Sade Sati is stated as *a named transit period with a traditional practice attached*, in the same register the app already uses for dasha ("organises reflection around time; does not guarantee an event"). Get this register wrong and the feature is off-brand; get it right and it is the app's best retention surface.

---

### PRD-22 — हवन · संस्कार विधि · the *how* for the rites the app already dates

> *Closes the app's largest asymmetry: thirteen occasions dated, one of them explained.*

**The gap.** `EVENT_RULES` dates griha pravesh, bhumi pujan, mundan, annaprashan, karnavedha, upanayana, vidyarambh, vahan, vyapar, sampatti, swarna, yatra, namkaran. Only namkaran gets a procedure (PRD-17.2). And **no rite in the app has a havan**, though a havan sits at the centre of most of them — griha pravesh, satyanarayan, navratri, navagraha śānti, gayatri havan. Six Vidhis shipped; not one lights a fire.

**The new capability (this is the point).** A havan is not another checklist — it is a **counted** rite: agni sthāpana → ājya/samagri āhuti with `…स्वाहा` per offering → **11 / 21 / 108 āhuti** of the chosen mantra → pūrṇāhuti. So the mechanic is a **tap-per-āhuti counter fused to a mantra loop**, which is the Japam counter's mechanic transplanted into Vidhi conduct mode. That fusion is genuinely new to the codebase and it is the reusable asset: once it exists, every sanskar vidhi and any future navagraha havan gets it free.

**What ships.**
- **Phase A — the havan engine.** `data/vidhi/` gains a `havan` step kind carrying `{ mantra, ahutiCount, dravya }`; conduct mode gains the āhuti counter (haptics via `expo-haptics`, screen held awake via `expo-keep-awake` — both already ship); the counter persists mid-rite so a phone lock does not lose your count at āhuti 74 of 108.
- **Phase B — vidhi breadth.** The rites the finder already dates, in household-frequency order: **griha pravesh** (the highest-demand one in the whole app — the finder's most-used occasion has no procedure), **mundan**, **annaprashan**, **vidyarambh**, **upanayana**, **bhumi pujan**, **vahan pujan**. Each registers against its `EVENT_RULES` id, so the muhurat result gains a *"and here is how"* door and the asymmetry closes at the exact point the user feels it.
- **Phase C — Gayatri / Navagraha havan** as a standalone, which is where PRD-21 and this one meet.

**Feasibility.** 🟡 Split. Phase A is **code-only, small, OTA-shippable**. Phases B–C are **content-gated** — svāhā mantras and step sequences need verbatim verification against a Gita Press reference, so they will land `status: 'draft'` and stay user-invisible until egress exists, exactly as PRD-09/P4 and PRD-19 did. Sequence it that way deliberately: **ship Phase A's mechanic against the six existing Vidhis' recitation steps and Gayatri japa, and let content unblock behind it** rather than waiting.

**Relationship to PRD-17.2.** That PRD opens the sanskar-vidhi door for namkaran alone. This one generalises it — the registry, the havan/āhuti engine, and the remaining twelve occasions. Build PRD-17.2's namkaran vidhi as the first consumer of *this* engine, not as a one-off, or the second vidhi pays for the first one's shortcuts.

---

### PRD-23 — भोग · नैवेद्य · व्रत भोजन · what to offer, what to eat, what never to offer

> *The highest daily-utility feature in this document, for the household member the app currently serves least.*

**The gap.** `upvasContent` answers *whether and when* you eat — `fastType: 'phalahar'`, "grains are abstained", parana bound to Dwādaśī. It never names a food. And nothing in the binary names a **naivedya**. So on the morning of every vrat and every festival, the person actually running the house — usually not the person reading the Gita on the sofa — asks a question the app cannot answer: *what do I cook.*

**What ships.** A sibling registry to `upvasContent`, deliberately inheriting its `status: 'draft' | 'verified'` gate and its `source.referenceUrls` + `verificationNote` shape:

- **व्रत भोजन** per observance — permitted (sendhā namak, kuṭṭū, siṅghāṛā, rājgirā, sābudānā, makhānā, phal, dahi), abstained (anna/rice on Ekādaśī, common salt in strict Navratri practice, onion-garlic), and the family-tradition variance the upvas entries already handle so well.
- **नैवेद्य** per deity and per festival — modak and dūrvā for Gaṇeśa, mākhan-miśrī and pañcāmṛta for Kṛṣṇa, boondi and guḍ-chanā for Hanumān, halwā-chanā-pūrī for Kanyā Pūjan, bel-patra and milk for Śiva.
- **The half nobody publishes cleanly: निषेध — what must *not* be offered.** No tulsī to Gaṇeśa, no dūrvā outside Gaṇeśa puja, no ketakī to Śiva, tulsī not plucked on Ekādaśī. This is the material families genuinely do not know and search for at 6 a.m., and it is the section that makes this feature trusted rather than decorative.
- **Parana meal** guidance, which the engine already times to the minute and says nothing about.
- **Surfaces:** a section on Observance Detail beside upvas vidhi; a slot in Vidhi **तैयारी** next to the samagri checklist; a shareable/checkable **shopping list** — because samagri and groceries are one trip, and the vidhi checklist store (`vidhi/checklistStore.ts`) already exists to hold it.

**Feasibility.** 🟡 Code is trivial (one registry, one screen section, one list surface — the upvas pattern, copied). **Content is the whole cost and it is egress-gated.** Ship the registry + surfaces + tests with entries at `draft`, and it flips to visible the moment verification is possible — the exact pattern PRD-09/P4 established.

**Implemented 2026-08-25.** Content egress was available: ten profiles were checked against two or more independent published sources, variant conflicts were recorded rather than flattened, and all ten cleared the verified-only gate. Observance Detail, Vidhi preparation, the occurrence-scoped grocery checklist/share path, tests, and the full source dossier are specified in [`prds/23-bhog-naivedya-vrat-food.md`](./prds/23-bhog-naivedya-vrat-food.md). The original blanket Tulsi-plucking and durva prohibitions were not shipped because the source pass did not establish them as universal rules.

**Stance guard.** Traditional practice as observed, with family-variance stated plainly. No dietary or health claims, no "sattvic detox" wellness register, and an explicit note that fasting leniency for children, the elderly, the unwell, and the pregnant is itself traditional — the upvas entries already say this and the tone should match exactly.

---

### PRD-24 — वास्तु दिशा · disha chakra, ghar-ka-mandir & murti placement

> *A whole domain at zero coverage, consulted at every move, renovation, and Diwali cleaning.*

**The gap.** The only `disha` in the codebase is travel disha-shool inside the muhurat engine. Nothing addresses the questions asked constantly in Indian homes: **which direction should the mandir face; can the puja room share a wall with the bathroom; which way should my head point when I sleep; where does the tulsī go; is it allowed to keep two Gaṇeśa idols / a Śivaliṅga / a Naṭarāja at home.** These are asked at every move-in, every rental, every rearrangement — and the muhurat finder already dates the griha pravesh they cluster around.

**What ships.**
- **दिशा चक्र** — a live compass: 8 dik (पूर्व · आग्नेय · दक्षिण · नैऋत्य · पश्चिम · वायव्य · उत्तर · ईशान) plus the open Brahmasthān, drawn in `react-native-svg` (the India-map work already proves this capability), reading the magnetometer with a **true-north correction** and an honest accuracy state.
- **Room-by-room guidance** keyed to the direction you are actually pointing at — puja room (ईशान, deity facing west so the worshipper faces east), kitchen (आग्नेय), main door, sleeping head-direction, tulsī, toilet — each as *classical convention with its reason*, not a verdict on your house.
- **घर का मंदिर** — the daily-upkeep set the app has never covered: what belongs in a home shrine and what does not, murti condition and count conventions, where ancestor photographs go (and why not in the mandir), diyā and water discipline.
- Entry from the More hub, plus a contextual door from a **griha pravesh** muhurat result — the moment the question is live.

**Feasibility.** 🟡 The heaviest of the five, and the only one that **cannot ship OTA**. It needs `expo-sensors` (magnetometer) — a **new native dependency, therefore a store release**, which per the repo's own gotcha drags `APP_TOUR_VERSION` and a `whatsNew` entry with it. Two real engineering risks, both to be resolved in a Phase 0 spike rather than assumed:
1. **True north.** Magnetic declination across India is small but not zero and varies by region. Options: a bundled coarse declination grid, a per-city value alongside the existing bundled city list, or a stated magnetic-north reading. Pick one in the PRD; do not leave it implicit, because a compass that is silently 2° off in a feature about direction is worse than no compass.
2. **Indoor accuracy.** Magnetometers are unreliable near rebar, wiring, and appliances — precisely where this feature is used. It needs a calibration prompt, a visible accuracy state, a "hold flat, away from metal" instruction, and a manual-direction override for when the sensor cannot be trusted. **The honest degraded state is part of the feature, not an afterthought.**

**Stance guard.** Vastu is presented as classical convention with its traditional reasoning — never as a defect report on someone's home. No fear copy, no "vastu dosha detected", no remedy products. Most people cannot move their kitchen; the register is *understanding*, with the traditional accommodation where one exists.

---

## 3. Deliberately excluded (so "unique" is checkable)

**Shipped or PRD-owned — not re-proposed:** daily/festival notifications (01), verse audio + follow-along (02, 13), search (03), font scale + dark mode + sleep timer (04, backlog), share cards (05), Daily Routine + reminders (07, 07-P3), Theerth map (07, 08), vrat catalog + upvas vidhi (09, 09-P4), Today's Practice (10), Sadhana Programs (11), offline meaning companion (12), Daily Muhurat + its notifications (14, 14-P2), widgets (15), event muhurat finder incl. lagna/tarabala (16, 16-P3/P4), Guna Milan (16), Namkaran + its vidhi (17, 17-P2/P3), Pitru Smaran (17), Puja Vidhi (19), shraddha/tarpan (19-P3).

**Considered this round and *not* picked, with the reason:**

| Idea | Why not now |
|---|---|
| **Temple darshan & aarti timings, yatra planner** | Real demand against 73 shipped temples, but timings drift constantly and a bundle-only app cannot refresh them. Stale aarti times are worse than none. Revisit only with a per-release refresh discipline and a visible "as of" date. |
| **नित्य कर्म / सन्ध्या वन्दन** full procedure (ācamana → prāṇāyāma → mārjana → arghya → Gāyatrī japa → upasthāna) | High authenticity value and the `sanskar/` fragments already gesture at it, but the audience is narrower (initiated households) than the five above. Strong PRD-25. |
| **अन्त्येष्टि / 13-day rites** | Genuine, underserved need and nobody does it with dignity. Deferred on tone risk and its dependency on PRD-19/P3 shraddha landing first; it deserves its own careful PRD, not a slot in a batch of five. |
| **Festival greeting cards** | High WhatsApp virality, near-zero devotional utility. That is a growth feature, not a pandit feature — and this request asked for the latter. |
| **Rudrākṣa / ratna / numerology** | Commercially adjacent and squarely against the app's no-upsell, no-luck-score stance. |
| **Panchak / Gaṇḍa-mūla as standalone day warnings** | `eventMuhurat.ts` already evaluates both as muhurat doshas; surfacing them as standalone daily alarms would be fear copy, which §51 rules out. |

---

## 4. Sequencing

```
PRD-20  Sankalp              ██████                  OTA · convention sign-off only
PRD-21  Graha practice       ████████                OTA · 9-row table
PRD-22  Havan · Sanskar vidhi    ████░░░░░░░░        Phase A OTA · B/C content-gated
PRD-23  Bhog · Naivedya · Vrat food  ██░░░░░░░░░░    code trivial · content-gated
PRD-24  Vastu disha          ░░░░████████████        store release · Phase 0 spike first
                             └ ██ = buildable now   ░░ = gated
```

**Recommended order and why.** **PRD-20 then PRD-21** — both are computational, both ship OTA, both convert engine work that is already paid for into daily-use surfaces, and neither waits on anything but a convention sign-off. Take **PRD-22 Phase A** next because it is code-only and it unblocks two other features' content whenever egress arrives. Land **PRD-23**'s registry and surfaces alongside, entries at `draft`, so the content flip is a data change and not a project. Start **PRD-24** with its Phase 0 sensor spike, independently, since it is the only one needing a store release and its risk is native rather than editorial.

**Cross-cutting note.** PRD-20 and PRD-21 both extend the saved birth profile (gotra; natal Moon for gochar). Design that schema change **once**, in PRD-20, and have PRD-21 consume it — two separate migrations of `@vedansh:kundali-birth-profile:v1` is the avoidable mistake here.

**Every candidate inherits the repo's merge gates**, per `RULEBOOK.md` §0/§0.1: unit **and** Maestro e2e with the change; `design.md` gets its new § in the same PR (PRD-20 → a new §; PRD-21 → extends §51; PRD-22 → extends §62; PRD-23 → extends §65; PRD-24 → a new §); `RULEBOOK.md` gains a content contract for each content-bearing family (§21+, following §20's shape); `npm run lint` at 0 errors.

---

## 5. Open decisions — needed before PRD-20 can start

1. **Saṃvatsara reckoning** — Bārhaspatya or the southern luni-solar mapping? They disagree by years and North/South India name the current year differently. Blocks `conventions/sankalp-v1.md`, which blocks the highest-value candidate here. This is the one answer worth getting this week.
2. **Ṛtu boundary basis** — solar (sankranti-based) or lunar-month pairs? Affects one slot of every sankalp the app ever composes.
3. **Gotra** — does an unknown gotra fall back to **काश्यप** silently, prompt, or omit the clause? Product tone call, not a technical one.
4. **PRD-24 true north** — bundled declination grid, per-city value, or state magnetic north honestly? Determines whether Phase 0 is a week or a fortnight.
5. **Content egress** — the standing blocker. Four shipped features already sit at `status: 'draft'`, and PRD-22 Phase B/C and PRD-23 will join them. Worth deciding whether to solve the egress path itself, because it is now the rate limiter on roughly half the roadmap rather than an inconvenience.
