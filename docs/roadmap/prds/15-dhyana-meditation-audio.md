# PRD-15 — Dhyāna (ध्यान) — Guided Meditation Audio

| | |
|---|---|
| **Status** | Proposed |
| **Target release** | v1.6.0 (guided dhyāna pilot) → v1.6.1 (routine + sankalp integration); Q3 stretch / early Q4 |
| **T-shirt size** | M — code is S (reuses the audio stack); content commissioning is the cost |
| **Owner** | TBA |
| **Origin** | Competitive analysis vs. Miracle of Mind (`docs/competitive-analysis-miracle-of-mind.md`) — adopt the *validated mechanic* (one short daily audio practice), not the competitor's secular framing |

**Bundle-only constraint:** the dhyāna recordings ship inside the app binary under `mobile/assets/audio/dhyana/*.m4a`. No streaming, no CDN, no first-play download, no account. Airplane mode is never a failure mode.

---

## 1. Problem

Vedansh covers paath (reading), japa (counting), and shravan (listening) — but not **dhyāna**, the fourth pillar of daily sādhanā. Miracle of Mind's traction (1M downloads in 15 hours on a *single 7-minute practice*) proves two things directly relevant to us:

1. The daily-spiritual-habit slot is won by a **short, fixed, audio-first practice** — not by a large menu.
2. A meaningful share of *our own* target users currently opens a different app every morning for exactly this. Every one of those sessions is a habit anchor we hand to a competitor.

Dhyāna is not a foreign import for a bhakti app. It is prescribed in the Gītā we already ship (अध्याय 6, ध्यानयोग), and mantra-anchored meditation (OM / So'ham / Gāyatrī) is the traditional form. We can offer meditation **in our own voice** — as sādhanā, not as mental-wellness content.

**What we deliberately do not adopt from Miracle of Mind:** AI chatbot, login/cloud accounts, coins-and-shields economy, mood tracking. See the competitive analysis §6 — those either break the bundle-only architecture or clash with the devotional framing.

## 2. Goal

Ship one signature **guided dhyāna** — a fixed ~8-minute OM/breath-anchored meditation guided in Hindi and English — plus a minimal **unguided timer with start/end bell**, integrated into the existing routine/streak system. Success:

- A user can complete a full guided dhyāna offline, in airplane mode, with the screen locked.
- Dhyāna sessions count toward daily routine completion exactly like reading/japa (derived, not self-reported).
- ≥ 25% of weekly-active users try dhyāna in the first 4 weeks after release; ≥ 50% of starters complete a session.

## 3. Non-goals

- **No meditation library.** One guided practice, deliberately. Miracle of Mind's core lesson is that a single go-to practice beats thirty options ("no choice paralysis"). Variations are Phase 3 *at most*.
- **No AI guidance, no personalization engine, no mood tracking.** Out by architecture (bundle-only) and by positioning.
- **No secular-mindfulness copy.** The label is ध्यान / Dhyāna, the framing is sādhanā. App Store metadata may *additionally* carry "meditation" keywords, but in-app language stays devotional.
- **No background soundscapes / music mixer in v1.** One voice track with its own gentle bed, mastered in.
- **No new content category in v1.** Dhyāna enters through the Audio tab and the routine system, not as an 8th category. (Adding a category touches `categories.ts` enumerations and triggers the design-doc sync rule across design.md §18/§41/§42 and RULEBOOK §1 — defer until dhyāna earns a category.)
- **No video, no course/curriculum.**

## 4. User stories

> As a daily sādhak, I want a short guided dhyāna after my morning paath, so my whole practice lives in one app.

> As someone who currently uses a meditation app in the morning, I want the same 7–10 minute anchor practice — but in a devotional register, offline, with no login.

> As a japa practitioner, I want an unguided timer with a bell, so I can sit in silence for a chosen duration after my mālā.

> As a routine user, I want dhyāna to count toward my daily नित्य साधना completion and streak like everything else.

## 5. Scope

### In scope — v1.6.0 (pilot)

1. **One guided dhyāna recording** — ~8 min, OM/breath-anchored, traditional structure (sthiti → prāṇa awareness → mantra anchor → stillness → samāpti), commissioned in **Hindi and English** (two masters of the same session; user's reading language picks the default, switchable).
2. **Dhyāna screen** — reached from the Audio tab (and deep-linkable via `entryRoutes.ts`): a single, calm screen with begin button, duration, language toggle, and a short "what is dhyāna" note citing Gītā 6 (bundled text, links into the Gita reader we already ship).
3. **Unguided timer mode** — pick 5 / 11 / 21 min (or custom), start bell → silence → end bell. Bell assets are seconds long (~100 KB); trivially bundle-only.
4. **Playback via the existing audio stack** — `AudioPlayerContext` / the Japam-audio asset pattern (`require()` + `expo-asset`). Screen-lock playback uses the same iOS `playback` session category as existing audio.
5. **Session ledger** — completed sessions (guided or timer ≥ 5 min, played to ≥ 90%) recorded in the same local activity ledger that feeds the Sadhak profile (lifetime/daily totals, streak).

### In scope — v1.6.1 (habit integration)

6. **Routine unit type `dhyana`** — "Add to Routine" from the Dhyāna screen; completion **derived from an actual completed session** that day, consistent with reading/japa derivation (manual check-off fallback preserved).
7. **Sadhana program** — one new prebuilt sankalp: **"21 Days of Dhyāna"** (`sadhana/programs.ts` pattern), using the existing program engine; completing it triggers the existing pushpa-varsha celebration.
8. **Reminder** — per-item local notification ("ध्यान का समय") through the existing reminders system; quiet-hours respected.

### Out of scope

- Multiple guided tracks / durations of the guided session (Phase 3 candidates: an 11-min variant, jyoti-trātaka guidance).
- Gujarati/Kannada voice tracks in v1 (text on the Dhyāna screen transliterates like everything else; audio languages follow the native-translation decision, see competitive analysis §6).
- Apple Health "Mindful Minutes" export (nice Phase-3 candidate; needs a privacy-stance decision first).
- Any streaming, download-on-demand, accounts, or server code.

## 6. UX notes

- Parchment system throughout; the Dhyāna screen is the *quietest* screen in the app — generous whitespace, one primary action, no stats above the fold.
- During playback: dimmed minimal UI (elapsed/remaining, pause, end). No scrubbing timeline in v1 — a dhyāna session is not a podcast; pause/resume and end only.
- End of session: a soft completion moment (bell fade, "🙏 साधना पूर्ण"), session added to today's totals; if it completed a routine item, the existing routine-completion feedback fires — **no coins, no confetti economy**.
- Interruption (call / route change): pause and hold position; resuming after > 10 min offers restart.
- Attribution line for the voice artist in "About this recording" (same convention as PRD-02 §6).

## 7. Technical sketch

- **Assets:** `mobile/assets/audio/dhyana/guided-hi.m4a`, `guided-en.m4a`, `bell-start.m4a`, `bell-end.m4a`. AAC mono 64 kbps (PRD-02 §9 encoding standard): ~8 min ≈ 3.8 MB per language → **≈ 8 MB total**, well inside the quarter's audio budget and far below the Gītā-audio red line.
- **State:** a thin `DhyanaSessionContext` (parallel to `JapamCounterContext`) or — preferably — a mode of the existing `AudioPlayerContext` if it cleanly supports "no-scrub, completion-tracked" playback; decide at implementation. Timer mode is a foreground timer + scheduled end-bell, no audio between bells.
- **Completion derivation:** reuse the activity-ledger write path the Japam counter and readers use; routine derivation reads it the same way reading/japa units do (`wiki/subsystems/routine.md` documents the derivation contract).
- **Tests** (house pattern):
  - session-completion invariants (≥ 90% played → recorded; pause/resume doesn't double-count; timer < 5 min doesn't count),
  - routine-derivation test for the new `dhyana` unit type,
  - program-engine test for the 21-day sankalp,
  - RULEBOOK §4.10 smoke test for the new screen.
- **Docs:** design.md gains a Dhyāna screen section (continue § numbering); RULEBOOK integration-contract rows updated for the new unit type and program — per `.claude/rules/design-doc-sync.md`. Wiki ingest after ship.

## 8. Content & licensing track (runs in parallel — this is the long pole)

- **Script the session once**, bilingually: a pandit/teacher-reviewed guided dhyāna script (OM/breath anchor, Gītā-consistent language). Doctrinal review is the gate — this is voice-of-the-app content, not licensed third-party content.
- Commission recordings **work-for-hire with in-binary redistribution rights** (same licensing posture as PRD-02 §8 — bundling has stricter requirements than streaming; Legal sign-off gates ship).
- One studio day covers both languages + bells. Female or male voice: decide with the same "single voice vs. section-appropriate" question already open in PRD-02 §13.
- **Why we don't just reuse a stock meditation track:** voice is the product here (Miracle of Mind is literally Sadhguru's voice); a generic track undercuts the devotional register and creates licensing risk.

### Placeholder assets (available now)

`mobile/assets/audio/dhyana/` carries generated **placeholder** assets so implementation isn't blocked on the studio: `bell-start.m4a` / `bell-end.m4a` (synthesized bells, near-shippable), `guided-hi.m4a` / `guided-en.m4a` (full 8:06 sessions with a synthetic espeak-ng voice — development only), plus the **timestamped bilingual scripts** (`SCRIPT-hi.md`, `SCRIPT-en.md`, drafted, pending teacher review) that the studio records from, a regeneration pipeline (`mobile/scripts/gen-dhyana-placeholder-audio.py`, `verify-dhyana-audio.py`), and a Suno-based upgrade path (`SUNO.md`). None of it is bundled into the binary until `require()`d.

## 9. Binary-size budget

| Release | Added audio | Budget | Notes |
|---|---|---|---|
| v1.6.0 | 2 guided masters + 2 bells | **+9 MB ceiling** | CI bundle-size check, same mechanism as PRD-02 §9 |
| v1.6.1 | none (code/data only) | +0 MB | routine/sankalp integration |
| Phase 3 (if data justifies) | 11-min variant ×2 languages | +10 MB, separate decision | |

## 10. Success metrics (bundle-only, local counters + App Store Connect)

| Metric | Target | Measured |
|---|---|---|
| WAU trying dhyāna within 4 weeks | ≥ 25% | local counter |
| Session completion rate (starters → ≥ 90% played) | ≥ 50% | local counter |
| Dhyāna users adding it to a routine (v1.6.1) | ≥ 30% | local counter |
| D7 return uplift for users with ≥ 3 dhyāna sessions vs. matched non-users | +8 pp | local diagnostics, TestFlight cohort |
| Crash-free dhyāna sessions | ≥ 99.5% | App Store Connect + local crash log (PRD-06) |

## 11. Risks

| Risk | Mitigation |
|---|---|
| "Meditation app" positioning creep dilutes the devotional brand | In-app language is ध्यान/sādhanā only; secular keywords confined to ASO metadata. One practice, not a library. |
| Script/doctrinal criticism (guided meditation is voice-of-the-app) | Teacher review before recording; cite Gītā 6 framing in-app; keep the script mantra-anchored and tradition-plain. |
| Content commissioning slips and blocks the release | Timer mode (bells only) has zero content dependency — it can ship first inside v1.6.0 if the guided recording slips; guided track then lands in a point release. |
| Users expect a library and churn after one track | Set expectation in-copy ("one practice, practiced daily"); measure completion + repeat rate before ever adding variants. |
| Session counting gamed via pause-scrubbing | ≥ 90%-played rule + no scrub bar in v1. |
| Overlap/confusion with Japam audio sessions | Distinct ledger event type; Sadhak profile shows dhyāna minutes as its own line. |

## 12. Definition of done

- v1.6.0: guided dhyāna (hi + en) and timer mode play end-to-end on iPhone (last 3 iOS versions), screen locked, **airplane-mode test passes**; sessions appear in Sadhak profile totals; CI bundle-size check passes; tests green; TestFlight 7-day soak with no audio-related crashes.
- v1.6.1: `dhyana` routine unit derives completion from real sessions; "21 Days of Dhyāna" sankalp completes end-to-end; reminders fire respecting quiet hours.
- design.md + RULEBOOK sections updated in the same PR series (design-doc sync rule); wiki ingested post-ship.

## 13. Open questions

1. **Guided session length** — 7, 8, or 11 min? Default proposal: ~8 min (fits the morning-slot benchmark MoM validated; 11 has nicer symbolism but higher abandonment risk). Decide at script review.
2. **Voice** — single voice for both languages or per-language artists? (Couples to PRD-02 §13's open voice question — ideally the same commissioning batch.)
3. **Placement** — Audio tab entry only, or also a Home-screen card? Default: Audio tab + routine surface in v1; Home placement only if trial rate misses target.
4. **`AudioPlayerContext` reuse vs. new context** — resolve during implementation spike; prefer reuse if completion tracking fits without contaminating the music-player UX.
5. **Apple Health mindful-minutes export** — Phase 3; requires an explicit privacy-stance decision (it's local HealthKit, no server, but it *is* a data hand-off).
