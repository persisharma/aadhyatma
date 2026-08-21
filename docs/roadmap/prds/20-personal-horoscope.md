# PRD-20 — Deep Personal Horoscope (गोचर · व्यक्तिगत दैनिक मार्गदर्शन · पूर्ण कुंडली विवेचन)

| | |
|---|---|
| **Status** | Phase 1 (engine) implemented; UI phases land incrementally per this document |
| **T-shirt size** | L — six engine/UI phases, but each is small and every calculation reuses the shipped PRD-C primitives |
| **Prototype** | [`docs/personal-horoscope-prototype.html`](../../personal-horoscope-prototype.html) — personalized landing, Rashifal personal layer + privacy boundary, Gochar (transit table, weekly outlook, Sade Sati, ingresses), Dasha reading, and the compiled report with its warned share |
| **Feasibility** | No new dependency. Everything derives from `kundali.ts`'s existing sidereal primitives (`getSiderealPlanetLongitude`, whole-sign houses, Vimshottari) at the shared 06:00 IST day anchor. Fully offline and deterministic. |

> **Product stance:** the personal-astrologer experience of consumer astrology apps, minus their business model. Everything is computed on-device from the saved Kundali, framed as traditional guidance/reflection (RULEBOOK §14.3) — never predictions, fear copy, luck scores, remedial claims, or upsells. No network, AI, or randomness in current scope.

## 1. Problem and goal

The shipped Jyotish area computes a full kundali (nine grahas, Lagna, whole-sign houses, nakshatra/pada, 120-year Vimshottari) but interprets almost none of it: Daily Rashifal reads only the Moon sign, the chart tabs are reference material, and nothing connects transits, dasha periods, or the janma nakshatra to the user's day. Users who want a "what does MY chart say today/this period" reading leave for apps whose engines are weaker but whose interpretation surface is richer — and whose framing is predictive and fear-driven.

Goal: make the saved chart feel personally read, at AstroTalk-level breadth, within this app's offline/deterministic/guidance rules.

## 2. Phases

| Phase | Surface | Contents |
|---|---|---|
| 1 | Engine (`panchang/gochar.ts`) | `computeGocharSnapshot` (9 transits vs Moon AND Lagna), `computeSadeSati` (phase + dhaiya + boundary via ingress bisection), `findNextIngress`/`computeUpcomingIngresses`, `computeTaraBala` (classical 9-cycle), `computePersonalGuidance` (strict superset of `computeRashifal`) |
| 2 | Jyotish landing + Rashifal | Saved profiles get full-chart daily guidance in the existing three rows (dual house context, dasha-lord note, tara bala); Rashifal screen layers personal extras only on the janma rashi behind an explicit chip |
| 3 | Gochar screen | 9-graha transit table + a11y summary, Sade Sati card, upcoming ingress windows, active house themes; guest state; no share card |
| 4 | Dasha reading | 9 per-lord structural blocks composed with natal placement + Antardasha overlay, above the existing Dasha timeline |
| 5 | Weekly outlook | 7 anchored days × chandra bala + tara bala → three quiet tones, inside the Gochar screen |
| 6 | Compiled Kundali report | `KundaliReportModel` (versioned serializable JSON) + `KundaliReportScreen`: chart summary, Lagna/Moon/nakshatra readings, six life-area sections, classical observations, full Vimshottari narrative, disclaimers; per-section share with the Kundali birth-details warning |
| 7 (gated) | Practice map | Per-graha practice routing over existing library ids — blocked on explicit product/content review |

## 3. Conventions (engine)

- **Day anchor**: every daily quantity is evaluated at 06:00 IST via the shared `indiaDayAnchor` — identical convention to `computeRashifal`, one answer per civil day.
- **Gochar support** is read from the Moon sign (janma rashi) with the shipped `TRANSIT_SUPPORT_HOUSES` tables; Lagna houses are shown as secondary context, never a second verdict.
- **Sade Sati**: Saturn transiting houses 12/1/2 from the janma rashi → rising/peak/setting; 4th/8th are the secondary dhaiya observations (`ardhashtama`/`ashtama`), reported as observations, never as a phase. Phase boundaries come from `findNextIngress` (one-day walk + bisection to <1 h).
- **Tara bala**: classical 9-cycle from the janma nakshatra; tones are `favourable | steady | reflective` — never a score, never good/bad.
- **Superset lock**: `computePersonalGuidance` must remain byte-identical to `computeRashifal` on every shared field for the chart's janma rashi (pinned by test), so the contractual landing rows render unchanged for existing users.

## 4. Safety decisions (recorded)

- **Guidance framing everywhere** — the engine-test banned-vocabulary scan is the enforcement for all authored template copy (§14.3).
- **Mangal Dosha** — the report ships the deterministic engine function and tests, **display-gated off** behind `includeMangalDosha` pending explicit product/content review. If enabled: prevalence-normalizing copy is mandatory, framing is "traditional observation + what tradition suggests", and it must never surface in or link from Guna Milan (RULEBOOK §15.3).
- **Kaal Sarp — excluded by decision**, not omission: the most fear-loaded classical label with the weakest shastric pedigree. Revisiting it is a separate product/content decision; a test asserts it appears nowhere in emitted report models.
- **No Gochar share card in v1** — the surface inherently exposes janma rashi and Sade Sati state; any later card must carry the Kundali-style "includes personal birth-derived details" warning. Report sections share only through the warned Kundali path, never the Rashifal (no-birth-details) path.
- **Full-text handoff (user-mediated AI bridge)** — the report offers `पूर्ण पाठ साझा करें`: the pure `kundaliHandoff.ts` renders birth details, the complete graha table, the Vimshottari date table, every section, and the `KundaliReportModel` JSON as one text document, shared only through the OS share sheet after a warning naming every birth detail. This is the deliberate bridge to §5: the USER hands the grounding object to ChatGPT/any LLM; the app makes no network call, so §14.3's AI ban stays intact.
- **Practice links** stay within the shipped 3-id allow-list (`navagraha-stotram`, `surya-ashtakam`, `shani-ashtakam`) through `buildEntryStartTarget()` until the Phase-7 review approves the per-graha map.

## 5. Future phase (NOT in scope): AI integration

Designed for, deliberately not built. The Phase-6 `KundaliReportModel` is a versioned, fully serializable JSON document — it is the grounding context a future LLM feature would consume, so the deterministic engine stays the single source of astrological truth and an LLM would only rewrite/converse over engine output.

Enabling it is an explicit product decision, recorded here so it cannot arrive by drift:

- **Offline-first departure**: network egress, backend-proxied API key (never in the bundle), availability/latency states in a fully-offline area.
- **Privacy**: birth data leaving the device requires opt-in consent, data minimization (derived chart facts, not raw birth details or name), a retention/erasure story, and store privacy-label updates.
- **RULEBOOK §14.3 rewrite**: the AI ban would be replaced with guardrails — LLM output post-filtered by the same banned-vocabulary scan, guidance framing enforced in the system prompt, remedies selectable only from the allow-list, output visibly labeled AI-generated, and deterministic surfaces never silently swapped for AI output.

## 6. Verification

Per phase: `npm run typecheck`, `npm run test:engine` (determinism, source purity, superset lock, 27×27 tara grid, pinned 2025 Saturn ingress window, banned-vocabulary scans; later: 9×9 dasha combos, report serde round-trip, all-12-lagna fixtures, no-Kaal-Sarp assertion), targeted Jest for changed UI, and Maestro smokes (`gochar-smoke.yaml`, `kundali-report-smoke.yaml`) with `kundali-smoke.yaml` kept green. design.md and RULEBOOK §14 sync in the same PR (design-doc-sync rule).
