# PRD-09 — Temple Stories (Tirtha catalog)

| | |
|---|---|
| **Status** | Proposed |
| **Target release** | v1.10.0 (foundation + 27 temples) → v1.10.1 (51 Shakti Peeths) → v1.10.2 (108 Divya Desams) |
| **Window** | Q4 weeks 49–52 (v1.10.0) — then content-only releases through Q5 |
| **T-shirt size** | XL (engineering ~3 wk; editorial ~8+ wk across releases) |
| **Owner** | TBA |

---

**Bundle-only constraint:** every katha, every metadata field, every map asset bundled in the app binary. Text content compresses well; the map is a single parchment-styled SVG.

**Depends on PRD-07 + PRD-08.** Reuses PRD-08's long-form story reader shape and PRD-07's calendar tap-through routing.

**"Complete each circuit" rule (user-locked):** when a circuit ships, it ships in full. No "5 of 51 Shakti Peeths." This forces a staged release plan instead of a partial-content shortcut.

---

## 1. Problem

Every chalisa, every aarti, every verse in Vedansh points back to a **place** — a temple, a tirtha, a pilgrimage circuit. The app today carries the texts but not the soil they grew from. A user reciting Maha Mrityunjay Mantra never sees that it's anchored to **twelve specific Jyotirlinga shrines**, each with its own founding katha. A user reading Sundarkand never connects to the actual hill near Rishikesh where the events are traditionally located.

PRD-07 answered *"what day is it?"* PRD-08 answered *"what should I do today?"* PRD-09 answers **"where does this come from?"** — completing the four-part frame of text, time, ritual, and place.

## 2. Goal

Ship a tirtha catalog organized by canonical pilgrimage circuits, each ending up **complete** (every Jyotirlinga, every Shakti Peeth, every Pancha Bhuta) before users see a category as "live." Reachable from:

- New **तीर्थ · Pilgrimage** category tile on Home (alongside Granth / Stotram / Chalisa / Japam / Aarti / Vrat).
- PRD-07 Calendar — festival-day taps surface relevant temple circuits (Mahashivratri → 12 Jyotirlingas; Navratri → Shakti Peeths).
- Daily Bhakti rotation — temple-of-the-day card appears ~1 day in 7.
- A new **interactive India map** on the catalog screen showing every temple by circuit.
- Search (via the standard RULEBOOK §8 path).

Measured by:

- ≥ 25% of WAU open ≥ 1 temple reader per month (v1.10.0).
- ≥ 30% of v1.10.1 users browse the Shakti Peeths list within 30 days of release.
- Calendar → temple-circuit screen tap-through on Mahashivratri ≥ 40% of festival-day Calendar opens.
- Map → temple-reader conversion ≥ 30% of map opens.
- Bundle delta ≤ +600 KB v1.10.0; total across all three releases ≤ +1.6 MB.

## 3. The catalog — what completes which circuit

The "complete each" rule drives the structure. Each release ships a closed canonical set:

### v1.10.0 (Q4 weeks 49–52) — Foundation + Northern + South canonical-fives

| Circuit | Count | Members |
|---|---|---|
| **Char Dham** | 4 | Badrinath (Uttarakhand), Dwarka (Gujarat), Jagannath Puri (Odisha), Rameshwaram (Tamil Nadu) |
| **Dvadasha Jyotirlinga** | 12 | Somnath, Mallikarjuna, Mahakaleshwar, Omkareshwar, Kedarnath, Bhimashankar, Kashi Vishwanath, Trimbakeshwar, Vaidyanath, Nageshwar, Rameshwaram, Grishneshwar |
| **Uttarakhand Chhota Char Dham** | 4 | Yamunotri, Gangotri, Kedarnath¹, Badrinath¹ |
| **Pancha Bhuta Sthalams** (South canonical) | 5 | Chidambaram (sky), Thiruvanaikaval (water), Thiruvannamalai (fire), Kanchipuram Ekambareswarar (earth), Kalahasti (air) |
| **Arupadai Veedu — Six Abodes of Murugan** (South canonical) | 6 | Palani, Tiruchendur, Swamimalai, Tiruparankundram, Pazhamudircholai, Tiruttani |

¹ Kedarnath and Badrinath overlap circuits; the data carries `circuit: ['jyotirlinga', 'uttarakhand-char-dham']` etc. so they appear in both lists from a single entry. Rameshwaram overlaps Char Dham + Jyotirlinga.

**Unique entries after de-duplication: ~27.**

### v1.10.1 (target Q5 week 53–60) — Shakti tradition (complete)

| Circuit | Count | Notes |
|---|---|---|
| **51 Shakti Peeths** | 51 | All 51 of Sati's body-part shrines per Devi Bhagavata Purana. The 18 Maha Shakti Peeths get a visual highlight badge but are not a separate ship. |

**Unique entries: ~50** after light overlap with Char Dham (e.g. Dwarka has a Shakti Peeth connection in some traditions; treated as the same temple with dual badges).

### v1.10.2 (target Q5+) — Vaishnava South (complete)

| Circuit | Count | Notes |
|---|---|---|
| **108 Divya Desams** | 108 | The 108 Vishnu temples praised by the Alvars. Canonical set, fixed. Includes Srirangam, Tirumala (Tirupati), Padmanabhaswamy, Guruvayur, Sabarimala-adjacent shrines, etc. |

**Unique entries: ~108.**

### What's never coming

These are *not* on any future PRD-09 roadmap and should be documented as out of scope:

- 51 Shakti Peeths' regional variants and disputed locations (we ship the most-cited location for each).
- Foreign temples (Pashupatinath/Nepal, Munneswaram/Sri Lanka, Angkor Wat/Cambodia — distinct cultural surfaces).
- Sect-specific micro-traditions (Vaishnava sub-sampradayas with their own canonical lists beyond Divya Desams).
- Modern temples without Puranic founding stories (BAPS Akshardham, ISKCON branches, Birla Mandirs — religiously valid, but the editorial model in PRD-09 is Puranic-source-driven).

## 4. Non-goals (across all three releases)

- **Travel & logistics content.** No "how to get to Kedarnath" walkthroughs, no helicopter booking, no accommodation listings, no Tripadvisor-style ratings. **There are entire apps for that.**
- **Live darshan streams.** Network-dependent; out by bundle-only.
- **Photographs of temples.** RULEBOOK §3 forbids photos. Sketches only.
- **Interactive routing / GPS.** The map is a static parchment SVG, never live.
- **Donations / online puja booking.** Distinct domain.
- **User check-ins / visit tracking.** Sounds nice, turns into a social feature, out.
- **Audio narration of kathas.** Same rationale as PRD-02: bundled audio is heavy. If we revisit network, temple kathas are third-priority after chalisa recitation and vrat kathas.

## 5. User stories

> As a Shiva devotee, I want to tap "Jyotirlinga" on the temple list and see all twelve as a complete set — not "5 of 12 — more coming."

> As a Devi devotee, after v1.10.1 ships, I want to see all 51 Shakti Peeths together, grouped by region or by body-part association.

> As someone planning a pilgrimage, I want to open the India map, tap "Char Dham," and see the four temples plotted geographically so I can grasp the circuit's shape.

> As a daily user, when I open the Bhakti tab today and see a temple-of-the-day card instead of the usual verse, I want it to feel like a natural variation, not a distraction.

> As a user from Tamil Nadu, I want Vedansh to acknowledge the Pancha Bhuta Sthalams and Arupadai Veedu — not treat pilgrimage as exclusively a North Indian story.

> As a Mahashivratri observer, when I tap the Calendar marker that morning, I want a choice between "read the vrat katha" and "see all twelve Jyotirlingas."

## 6. Scope

### v1.10.0 — engineering foundation + 27 temples (Q4)

1. **Tirtha catalog data shape.** Per-temple JSON (see §8).
2. **TempleReaderScreen.** Long-form story reader, same shape as VratReaderScreen (PRD-08). Sections: कथा / Katha, विशेषता / Significance, अवस्थिति / Location, पाठ / Related Reading. Source attribution at the bottom.
3. **TempleListScreen.** Three view modes:
   - **By Circuit** (default) — sectioned list, each circuit a horizontal-scroll strip.
   - **By Deity** — Shiva temples together, Devi temples together, etc.
   - **By State** — geographic grouping for trip planning.
4. **Tirtha Map.** New screen reachable from the catalog header — parchment-styled SVG of India with each temple plotted as a saffron-deep marker. Markers color-coded by circuit. Tap a marker → opens the temple reader. Tap a regional pinch (e.g. Tamil Nadu cluster) → opens a filtered list. **Static; no GPS, no zoom-pan beyond fixed zoom levels.** See §7.
5. **`tirtha` content category.** New value in `ContentCategory` enum + `categories.ts` + Home grid tile. Per RULEBOOK §1, this follows the standard new-category contract.
6. **Calendar integration (PRD-07).**
   - Mahashivratri marker tap → bottom-sheet picker: `[Read vrat katha] [See all 12 Jyotirlingas]`. User picks; we route accordingly.
   - Navratri Day 1 marker → same pattern: `[Read vrat katha] [See all 51 Shakti Peeths]` (post-v1.10.1).
   - Other festival markers route to vrat-katha by default; temple-circuit surfaces as a "Related" footer link inside the vrat reader.
7. **Daily Bhakti rotation — Temple of the Day.**
   - 1 in 7 days, the daily-verse card swaps to a **temple-katha card**.
   - Visual treatment: same parchment card, pill changes from "Bhagavad Gītā · 2.47" to "तीर्थ · केदारनाथ"; body shows first 2–3 paragraphs of the katha; tap → opens TempleReaderScreen.
   - Deterministic selection: `(hash(YYYY-MM-DD) % 7 === 0) ? templeForDay(date) : verseForDay(date)` so the same date always picks the same surface across reschedule (matches PRD-01 §7 seed convention).
   - User can refresh past the temple card to get a verse instead — no force-show.
8. **Search integration.** New branch in `searchIndex.ts:buildVerseEntries()` per RULEBOOK §8. Indexes temple name + first 3 katha paragraphs + state. ~15 lines.
9. **Settings disclosure.** "Tirtha catalog: complete circuits only" line in More tab. Users see what's complete vs. what's planned.

### v1.10.1 — Shakti Peeth complete set (Q5)

Engineering: **zero new code.** Data-only release.

- 51 Shakti Peeth entries added to `tirtha.json`.
- Shakti Peeth tile on the catalog screen flips from "Coming in v1.10.1" placeholder to active.
- Calendar integration for Navratri Day 1 flips on.
- Bundle adds ~350 KB JSON.

### v1.10.2 — 108 Divya Desams (Q5+)

Engineering: **zero new code.** Data-only release.

- 108 Divya Desam entries added.
- Optional: a new "By Sampradaya" view mode on TempleListScreen (Shaiva / Vaishnava / Shakta) — small UI addition if desired; defaults to off.
- Bundle adds ~700 KB JSON. Pushes total catalog past 1 MB; staged compression check at PR-time.

## 7. Tirtha Map — design and constraints

**Goal:** show every temple in the catalog on a single India outline. Visual anchor for the geographic dimension that text catalogs can't convey.

**What it is:**
- One static SVG: simplified India outline (state borders, no roads, no cities) in parchment-ink stroke on cream background. Matches RULEBOOK §3 design language.
- ~30 saffron markers in v1.10.0; ~80 in v1.10.1; ~190 in v1.10.2.
- Each marker is the same small dot glyph; color encodes circuit (Char Dham = saffron-deep, Jyotirlinga = gold, Shakti Peeth = gold-tint, Pancha Bhuta = saffron, Arupadai Veedu = saffron-tint, Divya Desam = ink-soft).
- Tap a marker → temple reader.
- Pinch-zoom **disabled.** Two fixed zoom levels: India-wide (default) and regional-cluster (tap a state cluster → zoom to that state). No free pan-zoom — we are not Google Maps.
- Legend at the bottom: small color-circle + circuit name in Hindi + English.

**What it is NOT:**
- Not a Google Maps embed.
- Not a live GPS surface.
- Not interactive beyond marker-tap and cluster-zoom.
- Not animated. Renders once and stays still.

**Marker density problem at scale:** at 190 temples (v1.10.2), the India outline will be dense. Mitigation:
- Tamil Nadu has the most temples (Pancha Bhuta + Arupadai Veedu + ~60 of the Divya Desams). At regional-zoom, markers fan out; at India-wide, the cluster glyphs into a single saffron blob with a "Tamil Nadu: 73 temples" label.
- "By Deity" or "By Circuit" filters in the map header reduce visible density on demand.

**Implementation cost:** ~150 KB for the India SVG outline + state borders; ~30 KB for the markers + zoom logic; ~50 lines of TS. Bundle delta budgeted in §11.

## 8. Per-temple data shape

```ts
type Temple = {
  id: string;                            // 'kedarnath'
  nameHi: string;                         // 'केदारनाथ'
  nameEn: string;                         // 'Kedarnath'
  deity: Deity;                           // 'shiva'
  circuits: TempleCircuit[];              // ['jyotirlinga', 'uttarakhand-char-dham']
  location: {
    stateHi: string;                      // 'उत्तराखंड'
    stateEn: string;                      // 'Uttarakhand'
    nearestCityHi?: string;
    nearestCityEn?: string;
    /** Approximate lat/lon — used only for map placement; never for nav. */
    coords: { lat: number; lon: number };
  };
  /** Founding / mythological story. The heart of the entry. */
  katha: {
    sourceHi: string;                     // 'स्कंद पुराण, केदारखंड'
    sourceEn: string;                     // 'Skanda Purana, Kedar Khand'
    paragraphsHi: string[];               // 8–15 paragraphs
    paragraphsEn: string[];
  };
  /** One-paragraph religious significance. NOT a guidebook. */
  significance: {
    paragraphHi: string;
    paragraphEn: string;
    /** One-line. 'Open April–November (closed in winter).' */
    bestTimeHi: string;
    bestTimeEn: string;
  };
  /** Chalisas / aartis / mantras associated with this temple's deity. */
  linkedSections: string[];
  /** For Shakti Peeths: which body-part of Sati. Optional. */
  shaktiPeethBodyPart?: string;
};

type TempleCircuit =
  | 'char-dham'
  | 'jyotirlinga'
  | 'uttarakhand-char-dham'
  | 'shakti-peeth'
  | 'pancha-bhuta'
  | 'arupadai-veedu'
  | 'divya-desam';
```

**Per-entry size estimate:** ~6–8 KB (katha is the bulk). Across releases:

- v1.10.0: 27 entries × 7 KB ≈ 190 KB
- v1.10.1: +51 entries × 7 KB ≈ +360 KB
- v1.10.2: +108 entries × 6 KB ≈ +650 KB

## 9. Technical sketch

### Module layout

```
mobile/src/data/tirtha/
├── index.ts                  # Loader, invariant checks, circuit-membership helpers
├── tirtha.json               # All entries inline
└── __tests__/
    └── tirtha.test.ts         # Per-entry shape + complete-circuit assertions
```

### Reader screen

`mobile/src/screens/TempleReaderScreen.tsx` — long-form scroll. Reuses everything from VratReaderScreen (PRD-08): `BackgroundLayer`, `LanguageToggle`, `BookmarkButton`, `ShareButton`, typography tokens.

### List screen

`mobile/src/screens/TempleListScreen.tsx` — three view modes via a top toggle. Reuses `LibraryCard` for temple cards.

### Map screen

`mobile/src/screens/TempleMapScreen.tsx` — renders the bundled India SVG via `react-native-svg` (already a transitive dep). State-cluster zoom is two snap points, not a pan-zoom gesture.

### Routing

`mobile/src/navigation/entryRoutes.ts` gets a `templeIds` set + a routing branch:

```ts
if (templeIds.has(sourceId)) {
  nav.navigate('TempleReader', { templeId: sourceId });
  return true;
}
```

PRD-07 Calendar bottom-sheet picker dispatches to either VratReader or a new `TempleCircuitScreen` (a filtered TempleListScreen scoped to one circuit).

### Tests

- `mobile/src/data/tirtha/__tests__/tirtha.test.ts` — every temple has non-empty katha (≥6 paragraphs Hi+En), valid `circuits` array, valid `deity`, plausible coords. **Complete-circuit assertion:** for each shipped circuit, the count matches the canonical number (Jyotirlinga = exactly 12, Char Dham = exactly 4, Pancha Bhuta = exactly 5, etc.). v1.10.1's assertion expects Shakti Peeth count = 51 once that release ships.
- `mobile/src/data/__tests__/searchIndex.test.ts` extended — RULEBOOK §8 coverage assertion includes the `tirtha` category.
- `mobile/src/screens/__tests__/TempleReaderScreen.test.tsx` — smoke test per RULEBOOK §4.10.
- `mobile/src/screens/__tests__/TempleMapScreen.test.tsx` — mounts the map with the fixture, asserts marker count equals temple count and tap routes correctly.

### Daily Bhakti rotation integration

`mobile/src/data/dailyRotation.ts` (new, or extend `versePool.ts`) supports a mixed surface:

```ts
type DailySurface =
  | { kind: 'verse'; verse: UniformVerse }
  | { kind: 'temple'; temple: Temple };

export function dailySurfaceForDate(date: Date): DailySurface {
  const dayHash = hashDateKey(toDateKey(date));
  if (dayHash % 7 === 0) {
    // 1 in 7 — temple of the day
    const idx = (dayHash >>> 3) % templeCount();
    return { kind: 'temple', temple: getTemple(idx) };
  }
  return { kind: 'verse', verse: pickVerseForDateKey(toDateKey(date), getVersePool())! };
}
```

`DailyBhaktiScreen.tsx` renders either card shape based on `kind`. Card layout shares the same outer container (parchment, divider, ornament) so the rhythm doesn't break.

## 10. Editorial track (the dominant cost)

This is where PRD-09 differs most from PRD-08. Editorial volume:

| Release | Temples | Editorial weeks | Source |
|---|---|---|---|
| v1.10.0 | 27 | ~4 weeks | Skanda Purana (most), Shiva Purana (Jyotirlinga kathas), Padma Purana (some Char Dham) |
| v1.10.1 | 51 | ~6 weeks | Devi Bhagavata Purana, Kalika Purana |
| v1.10.2 | 108 | ~10 weeks | Nalayira Divya Prabandham (Alvars' compositions); not strictly Puranic |

**Total editorial cost across releases: ~20 weeks.** Engineering is ~3 weeks one-time.

The "complete each" rule means content readiness drives ship dates. If we ship Shakti Peeth with 45 of 51, we've violated the rule. Editorial discipline:

- Lock the v1.10.1 scope upfront: all 51 Shakti Peeths must be drafted and reviewed before the release goes out, even if it pushes ship by a month.
- Native-speaker review at the same bar as PRD-08.
- Source citation on every katha, visible in the reader.
- Style guide carries forward from PRD-08; same editorial owner.

**Recommended pacing:** v1.10.0 in Q4. v1.10.1 in Q5 (Jan–Mar 2027). v1.10.2 spans Q5+Q6, ships when ready. **Communicate "v1.10.x is a series, not a milestone."**

## 11. Bundle budget

| Release | Net add | Cumulative |
|---|---|---|
| v1.10.0 | ~480 KB (190 KB JSON + 180 KB map + 30 KB code + 80 KB Daily-rotation hook) | ~480 KB |
| v1.10.1 | ~360 KB (data only) | ~840 KB |
| v1.10.2 | ~650 KB (data only) | ~1.49 MB |

Total at full coverage stays under +1.6 MB. Compressed-blob option (gzip the JSON, decompress on load) shaves ~40% if needed — defer to v1.10.2 when total catalog gets large.

## 12. Success metrics

| Metric | Release | Target |
|---|---|---|
| WAU open ≥ 1 temple reader/month | v1.10.0 | ≥ 25% |
| List → reader conversion | v1.10.0 | ≥ 35% |
| Map → reader conversion | v1.10.0 | ≥ 30% of map opens |
| Mahashivratri Calendar tap-through → temple-circuit | v1.10.0 | ≥ 40% |
| Daily Bhakti temple-of-day → temple reader | v1.10.0 | ≥ 50% (it's already the visible surface) |
| Shakti Peeth catalog browse | v1.10.1 (30 days post-ship) | ≥ 30% of WAU |
| Divya Desam catalog browse | v1.10.2 (30 days post-ship) | ≥ 20% of WAU |
| Content errors flagged | continuous | ≤ 3 / release |
| Bundle delta | per release | within table above |

## 13. Risks

| Risk | Mitigation |
|---|---|
| 51 Shakti Peeths editorial overruns Q5 | Lock the 51 list at v1.10.0 ship; don't add scope. If editorial slips, slip the release — don't ship partial. |
| Map gets visually noisy at 190 temples | Cluster glyphs into state-level numbers when zoomed out. Filter-by-circuit affordance in the map header. |
| 108 Divya Desam translations need a Tamil-Vaishnava-literate editor | Source separately from PRD-08's Hindi-belt editorial pool. May need a different translator. Acknowledge this is a real Q5+ undertaking. |
| Sect disputes (e.g. some traditions place Vaidyanath Jyotirlinga in Deoghar; others in Parli) | Editorial pick: most-cited Skanda Purana version. Document the call inline. Single edge case per temple. |
| Foreign Shakti Peeths (e.g. Sharada Peeth in PoK, Hingula in Pakistan) — politically loaded | Ship them with current administrative location noted ("Pakistan-administered Kashmir"). Don't editorialize. |
| Bundle balloons past 1.6 MB ceiling | v1.10.2's 700 KB JSON can be gzipped and decompressed on first load. Adds one round of complexity; deferred to v1.10.2 specifically. |
| Calendar tap-through pattern (vrat ↔ tirtha) confuses users | Bottom-sheet picker on Mahashivratri/Navratri is explicit. Default route on other festivals is vrat-only; tirtha surfaces as "Related" link inside the vrat. |
| User reports "my regional Shakti Peeth is missing from the 51" | The 51 is canonical per Devi Bhagavata. Settings disclosure documents the source. Q6+ for any expanded list. |
| Daily-rotation temple-of-day surprises users used to a verse | Visual treatment is the same parchment card; pill is the differentiator. Refresh ("next") button always available — never force-show. |

## 14. Definition of done

### Per release

- All temples in shipped circuits are complete (count matches canonical).
- Every katha has Hi + En + source attribution.
- Editorial sign-off: source-attribution audit + native-speaker review pass.
- Reader, list, map screens load every entry without crash.
- PRD-07 Calendar integration verified for Mahashivratri and (post-v1.10.1) Navratri Day 1.
- Daily Bhakti temple-of-day fires on the deterministic schedule.
- TypeScript clean, lint at baseline.
- Bundle delta within budget; size check committed to CI per RULEBOOK §8 (extending).
- New tests pass; complete-circuit assertion enforces the no-half-categories rule structurally.
- App Store note explains the staged release plan.

### Cross-release

- Settings → Tirtha catalog disclosure lists what's complete and what's planned.
- Help modal updated to point users at the catalog disclosure when they ask "why is X temple missing?"
- The map renders all currently-shipped temples; "more coming" markers don't exist (incomplete circuits aren't shown at all).

## 15. Open questions

1. **Map's regional-zoom snap points.** Two zooms (India-wide and state-cluster) are minimum. Should we also offer "circuit zoom" — tap "Jyotirlinga" badge in legend → animate to a multi-state view spanning all 12? Recommend yes if it costs <100 lines; otherwise skip.
2. **108 Divya Desams editor.** Tamil-Vaishnava-literate translator may be a separate hire. Acknowledged. Recommend defer commitment to v1.10.2 planning — but flag now so we're not blindsided.
3. **Daily Bhakti rotation ratio.** 1-in-7 is the start. If temple-of-day metrics show low engagement, drop to 1-in-14. If high, push to 1-in-5. Tunable via a single constant. Recommend ship at 1-in-7 and revisit at v1.11.
4. **"By Sampradaya" mode for v1.10.2.** Splitting catalog by Shaiva / Vaishnava / Shakta becomes more useful once we have 100+ Vaishnava entries from Divya Desams. Recommend add then, not now.
5. **Sabarimala access controls.** Sabarimala (Ayyappa) has historically restricted entry. Editorial decision: ship the katha and significance neutrally; don't editorialize on the controversy. The story is from Bhutanatha Upakhyanam, not modern policy.
6. **Pilgrimage tile placement on Home grid.** Currently the grid is 6 categories + Deity (7 tiles). Adding Vrat (PRD-08) + Tirtha makes 9. The grid shifts from 2-col-3-row to 2-col-5-row. Acceptable; no design crisis. Recommend ship as 2-col grid extending vertically.

## 16. Sequencing within Q4

**v1.10.0 weeks 49–52 (Q4):**

| Week | Engineering | Editorial |
|---|---|---|
| 49 | Data shape, JSON loader, complete-circuit assertion tests | 4 Char Dham kathas + 6 Jyotirlinga kathas |
| 50 | TempleReaderScreen, TempleListScreen, routing | Remaining 6 Jyotirlinga + 4 Uttarakhand Char Dham (2 overlap) |
| 51 | TempleMapScreen + India SVG asset; PRD-07 Calendar integration | 5 Pancha Bhuta + 6 Arupadai Veedu kathas |
| 52 | Daily Bhakti rotation; search-index branch; QA | Native-speaker review pass; source-attribution audit |

**v1.10.1 weeks 53–58 (Q5):** Content-only. ~6 editorial weeks for all 51 Shakti Peeths. Engineering touch only if regression surfaces.

**v1.10.2 (Q5+):** Content-only. 10–12 editorial weeks for 108 Divya Desams. Defer until v1.10.1 ships and Tamil-Vaishnava editor is secured.

## 17. How this completes the Q4 frame

```
                       PRD-07 (Panchang)
                  ┌──── resolves dates for ────┐
                  ↓                            ↓
            PRD-08 (Vrats)                PRD-09 (Tirtha)
                  ↓                            ↓
        "what should I do today?"    "where does this come from?"
                  ↓                            ↓
                  └────── linked sections ─────┘
                                ↓
                       existing chalisas / aartis
                                ↓
                          PRD-10 (Today home)
                          surfaces everything
```

PRD-10 closes the loop: the **"आज / Today"** home tab surfaces the panchang at top, today's vrat in the middle, and a contextual temple/circuit at the bottom (e.g. "Today is the second Monday of Shravan — eight more Mondays to honor Shiva at his Jyotirlingas this season").

---

**Bottom line:** PRD-09 is **the most editorial-heavy PRD in the roadmap.** Engineering is bounded (~3 weeks); the long pole is writing ~186 kathas across three releases, each with source attribution and bilingual review. The "complete each" rule structurally prevents partial ships — which is the right discipline for content that defines a religious surface, but it means **release dates follow editorial readiness, not engineering readiness.** Plan accordingly.
