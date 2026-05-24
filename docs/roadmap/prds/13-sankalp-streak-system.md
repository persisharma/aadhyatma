# PRD-13 — Sankalp + Streak System (Pledge-Driven Retention)

| | |
|---|---|
| **Status** | Proposed |
| **Target release** | v1.6.0 (sankalp creation + streak surface) → v1.6.1 (sharing + certificates) |
| **Window** | Weeks 3–9 of Q1 2027 |
| **T-shirt size** | M (~5 dev-weeks) |
| **Owner** | TBA |
| **Depends on** | PRD-01 (notifications), existing `UserActivityContext` |

**Bundle-only constraint preserved.** Streak data, sankalp definitions, and milestone art are local. **Optional cloud backup** rides on PRD-11's backend if/when the user opts in to a profile.

---

## 1. Problem

Duolingo, Calm, Headspace, Strava all proved streaks are the single most powerful daily-return mechanic. Today Vedansh has a `currentStreak` field in the Sadhak Profile, but it is anonymous, ungamified, no celebration, no commitment, no recovery — a passive counter the user discovers, not a system they engage with.

Spiritual practice in Indian tradition has a stronger, more authentic framing than streaks: **sankalp** — a pledge taken before a practice begins ("I will read Hanuman Chalisa 108 times by Hanuman Jayanti"). Sankalp is culturally native, communal in feeling, less gamified-shallow than "🔥 7-day streak."

We have the data (`UserActivityContext`, `JapamCounter`), the notification scaffold (PRD-01), and the deity / festival anchors (PRD-12). What we lack is the contract: ask the user what they're committing to, then help them complete it.

## 2. Goal

Ship a sankalp creation + tracking flow that converts "occasional reader" into "daily practitioner committed to a defined pledge." Measured by:

- ≥ 35% of WAU create at least one sankalp within 4 weeks of launch.
- ≥ 60% completion rate on completed-by-date sankalps (excluding abandoned).
- D30 return rate for users with an active sankalp: +20pp vs. non-sankalp users.
- Median user has ≥ 1 active sankalp at any given time after week 6.
- Streak break recovery: ≥ 25% of users who break a streak resume within 7 days.

## 3. Non-goals

- **Public leaderboards.** Anti-spiritual framing; community comparisons cheapen the practice. Family circles (PRD-15) are private opt-in only.
- **Punitive UI.** No skull / sad-face on a broken streak. Recovery is welcomed, not shamed.
- **Paid sankalp templates.** Free.
- **Real-money commitment** ("stake $5, lose it if you break").
- **Sankalp marketplace.** Out by strategy.
- **Live coaches / WhatsApp DMs.** Out by strategy.

## 4. User stories

> As a Hanuman bhakt, I want to pledge "108 paths of Hanuman Chalisa before Hanuman Jayanti" and see my progress every day, with a gentle morning reminder.

> As a daily reader, I want a sankalp like "21 days of Sundarkand" that locks me into a rhythm, with a completion celebration.

> As a beginner, I want pre-baked sankalp templates ("Ekadashi vrat: Vishnu Sahasranama on Ekadashi days for 6 months") so I don't have to invent goals.

> As someone who broke their streak yesterday, I want a kind nudge to come back today — never "you failed."

> As a user planning a sankalp around a festival, I want the sankalp end-date auto-suggested from the panchang ("ends on Hanuman Jayanti — 47 days from today").

## 5. Scope

### In scope — v1.6.0 (sankalp + streak)

1. **Sankalp creation flow.**
   - Entry: "Take a Sankalp" CTA on Profile, on every section's chapter listing, and at the end of every reader session.
   - Step 1: choose action (`recite chalisa`, `complete sundarkand sarga`, `count 108 japa`, `complete chapter of gita`, `read aarti`).
   - Step 2: choose section (auto-filled if entered from a section's listing).
   - Step 3: choose target — count (e.g. 108 paths) OR end-date (e.g. by Hanuman Jayanti, surfaced via PRD-12). The picker shows linked festivals.
   - Step 4: choose reminder time (default: 6:30am IST or user's PRD-01 default).
   - Confirm: "अहं संकल्पम् करोमि…" / "I pledge to…" with the sankalp text rendered in both languages.

2. **Sankalp tracking.**
   - New `SankalpContext` in `mobile/src/contexts/SankalpContext.tsx`.
   - Schema:
     ```ts
     type Sankalp = {
       id: string;
       createdAt: Date;
       action: 'recite' | 'count' | 'complete-chapter' | 'complete-section';
       sectionId: string;
       targetType: 'count' | 'date';
       targetCount?: number;
       targetDate?: Date;
       progress: number;
       reminderTime: { hh: number; mm: number };
       status: 'active' | 'completed' | 'broken' | 'abandoned';
       completedAt?: Date;
       milestones: number[]; // e.g. [27, 54, 81, 108]
     };
     ```
   - Persistence: `AsyncStorage` under `vedansh:sankalps`. Optionally synced to backend if profile exists.

3. **Streak as a derived signal, not a primary.**
   - Existing `currentStreak` stays.
   - New on Profile: "Sadhana ki Maala" — a 30-day calendar grid showing days active (saffron), inactive (parchment), today (ring). Replaces the bare streak number as the hero visual.
   - Streak break: no negative framing. The grid just shows the gap. A gentle bottom-sheet on next open: "Aaiye, phir se shuru karte hain. / Welcome back — start where you left off."

4. **Sankalp surface on Home.**
   - Active sankalps appear as cards under the Home greeting:
     - "108 Hanuman Chalisa · 27 / 108 · 81 din baki"
     - Progress ring, target snippet, tap → reader for the linked section.

5. **Notifications integration.**
   - Each sankalp generates a daily reminder at the user's chosen time. Extends PRD-01.
   - Milestone notification fires at 25% / 50% / 75% / 100% with a celebration screen.

6. **Sankalp completion celebration.**
   - Full-screen modal with a Sanskrit pranam shloka, a rendered "Sankalp Purna" card, action: "Take next sankalp" or "Save certificate."

### In scope — v1.6.1 (sharing + certificates)

7. **Shareable sankalp certificate.**
   - PNG render of "Sankalp Purna — 108 Hanuman Chalisa" with date, user's chosen sadhak name, parchment art.
   - Share to WhatsApp via existing share rail (PRD-05).

8. **Pre-baked templates.**
   - A library of ~15 common sankalps: Mangalwar Hanuman Chalisa, Pradosh Shiv Stotram, Ekadashi Vishnu Sahasranama, 21-day Sundarkand, etc.

### Out of scope

- Sankalp staking / money commitment.
- Public sankalp directory.
- Sankalp templates created by community (UGC) — moderation cost too high in v1.
- Multi-user shared sankalp (PRD-15 covers that).

## 6. UX notes

- **Tone is reverent, not gamified.** No fire emoji, no "🔥 streak." Devanagari "साधना" font + diya icon for active days. Saffron, not neon.
- **Sankalp text** in confirmation is always bilingual stacked (similar to existing Resume sheet pattern).
- **Recovery flow** is the most important UX — must feel welcoming. Copy reviewed by content lead + a Sanskrit-literate scholar.
- **Streak grid** uses parchment palette; deity-specific accent color per sankalp.
- **Reminder notifications** vary copy by day-of-sankalp to avoid fatigue ("Day 12 of 108: 96 more chalisas to go" → "Day 67 of 108: bahut acche, sirf 41 din").
- **Confirmation copy** explicitly says: "Yeh sankalp aap aur Ishvar ke beech hai." / "This pledge is between you and the Divine." Frames it as commitment, not a feature.

## 7. Technical sketch

- New `SankalpContext`: provider, hook, persistence.
- `UserActivityContext` continues to log reading events; `SankalpContext` subscribes to ledger events and increments matching sankalps automatically (e.g. completed Hanuman Chalisa reader session = +1 on every active "recite hanuman chalisa" sankalp).
- **Increment matching rules** (codified in `mobile/src/contexts/sankalpRules.ts`):
  | Sankalp action | Triggers on |
  |---|---|
  | `recite` chalisa | Reader session reaches last verse |
  | `recite` aarti | Reader session reaches last verse |
  | `count` japa | `JapamCounterContext` increments by 108 (one mala) |
  | `complete-chapter` | Reader session reaches last verse of a chapter |
  | `complete-section` | All chapters of section complete within sankalp window |

- **Idempotency.** A reader session credits a sankalp at most once per day (prevents same-day re-paath spam).
- **Notification scheduling.**
  - On sankalp create / update / delete, rebuild the notification schedule for the next 30 days.
  - On milestone hit, schedule a one-shot celebration notif within 1 minute.
- **Tests:**
  - `mobile/src/contexts/__tests__/SankalpContext.test.tsx` — create, increment, complete, abandon flows.
  - `mobile/src/contexts/__tests__/sankalpRules.test.ts` — every action type maps to the right trigger.
  - `mobile/src/screens/__tests__/SankalpCreationScreen.test.tsx` — flow renders, end-date suggestions from PRD-12 surface correctly.
  - `mobile/src/screens/__tests__/SankalpCompletionScreen.test.tsx` — celebration renders, share button works.

## 8. Account / profile interplay

This PRD introduces the **optional profile**.

- Default state: anonymous, all sankalps local to device.
- A new "Save sankalp across devices" CTA appears on the sankalp confirmation screen. Tap → creates a profile (name + email, OTP via SendGrid).
- Profile state synced to backend (introduced in PRD-11). Login flow ships *with* PRD-11 but is *demanded* by PRD-13.
- **Uninstall + reinstall recovers sankalps** for users with a profile.

## 9. Binary-size budget

| Asset | Size |
|---|---|
| Sankalp template manifest | ~12 KB |
| Certificate PNG templates (parchment art × deities) | ~600 KB |
| Milestone art | ~250 KB |
| **Total** | **~0.9 MB** |

## 10. Success metrics & instrumentation

| Metric | Source | Target |
|---|---|---|
| Sankalp-creation rate / WAU | Local + backend | ≥ 35% |
| Active sankalps per user (median) | Local + backend | ≥ 1 |
| Sankalp completion rate | Local + backend | ≥ 60% (of non-abandoned) |
| Sankalp-driven daily reminder open rate | Local notif callback | ≥ 35% |
| D30 retention lift (sankalp vs. non-sankalp) | Local + backend | +20pp |
| Streak-break recovery rate (7 days) | Local | ≥ 25% |
| Sankalp shared as certificate | Local share event | ≥ 15% of completions |

## 11. Risks

| Risk | Mitigation |
|---|---|
| Notification fatigue (sankalp + festival from PRD-12 + daily verse from PRD-01) | Unified daily-bhakti notification — one notification per day that bundles all three contexts; user controls cadence. |
| Sankalp feels gamified / cheapened | Reverent copy, Sanskrit-literate review, no fire emoji, no leaderboards. |
| Increment matching false positives (user opens reader but doesn't actually read) | Require ≥ 70% of verses paged through within a session before crediting; matches existing `UserActivityContext` rules. |
| Sankalp abandonment shame | Abandon flow is "Pause for now" not "Quit." Re-engageable later. |
| Account creation friction | Stays optional — sankalp works fully without an account; account adds backup only. |
| Time-zone bugs around streak day boundaries | Use device local time; day boundary at 4am local (matches Hindu *brahma muhurta* convention). |

## 12. Definition of done

- Sankalp creation flow live; can create from Home + Profile + section listing + reader-end.
- Streak grid replaces the bare number on Profile.
- Notifications fire reliably across timezones on test devices.
- Completion celebration + certificate share work end-to-end.
- Sankalp templates ship with at least 15 entries, each lang-paired.
- Profile creation works; sankalps sync to backend; uninstall-reinstall recovery proven.
- All tests green; RULEBOOK §4.10 smoke covers SankalpCreation + Completion screens.
- TestFlight 14-day soak: at least 50 created sankalps, at least 5 completions, no notification-fatigue complaints in feedback channel.

## 13. Open questions

1. Day-boundary at midnight vs. 4am (brahma muhurta)? Recommend 4am — matches devotional convention; user can verify.
2. Should we offer recurring sankalps ("every Tuesday for 1 year") as a single object, or as auto-recreated nightly sankalps? Recommend single recurring object with per-day check-in.
3. Certificate share template: deity-specific art vs. universal parchment? Recommend deity-specific (uses existing background art).
4. Do we let the user *edit* a sankalp's target mid-flight (extend from 21 to 42 days)? Recommend yes, but logged with an "extended" badge on the certificate.
5. Family / friend sankalp interplay with PRD-15 — keep separate or unify? Keep separate in v1, unify in PRD-15 design.
