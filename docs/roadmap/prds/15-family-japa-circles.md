# PRD-15 — Family / Group Japa Circles (Shared Sankalp)

| | |
|---|---|
| **Status** | Proposed |
| **Target release** | v1.8.0 (circle creation + shared japa pool) → v1.8.1 (chalisa/aarti sankalp pool) |
| **Window** | Weeks 1–10 of Q3 2027 |
| **T-shirt size** | L (~9 dev-weeks; backend extension + abuse / privacy review) |
| **Owner** | TBA |
| **Depends on** | PRD-13 (profile + individual sankalp), PRD-11 (backend stood up) |

**Constraint break:** uses the Gurudev backend for shared-state storage. Real-time updates via long-polling (no websockets in v1).

---

## 1. Problem

Spiritual practice in India is *social*: group paath, satsang, family aarti, women's mandali. Today, WhatsApp groups manually count "I did 11 chalisas today, kitne tum?" — a clunky, error-prone ritual that no app has digitized authentically. The few attempts (general fitness streak-share apps with a Hindu skin) feel gamified and miss the point.

The opportunity: a *private, opt-in* group where each member's japa / paath contributes to a shared sankalp. "Family Hanuman Mandali — 10,000 chalisas before Hanuman Jayanti, together." Real-time live counter, mutual encouragement, collective completion celebration. **First-mover advantage** — nobody has shipped this.

Beyond the engagement value, group circles are a **viral acquisition vector**: every circle invite is a WhatsApp link, every new member is an organic install.

## 2. Goal

Ship private circle creation + shared sankalp tracking. Measured by:

- ≥ 15% of profile users create or join at least one circle within 8 weeks.
- ≥ 4 members per active circle (median).
- Circles drive ≥ 25% of net new installs by week 12 (via invite links).
- ≥ 65% completion rate on shared sankalps (vs. 60% individual — slight uplift from social commitment).
- WAU of circle members: +30pp vs. non-circle users.
- Zero high-severity moderation incidents (abuse / spam in the limited group features).

## 3. Non-goals

- **Public groups / open circles.** All circles are invite-only. No discoverability.
- **Free-form chat in circles.** A messaging surface invites moderation cost, abuse, and competition with WhatsApp where the conversation already lives. We carry the *sankalp*, not the *chatter*.
- **Voice / video group calls.** Out by scope.
- **Public leaderboards across circles.** No competitive framing.
- **Paid private mandalis** (coaches running paid groups). Out by strategy in v1.
- **Cross-circle stats** (which circle did the most in your city). Anti-spiritual.

## 4. User stories

> As a family of five spread across cities, I want to create a "Sharma Family Hanuman Mandali," invite my parents and siblings via WhatsApp, and collectively pledge 5,000 chalisas before Hanuman Jayanti.

> As a member of a women's bhakti group, I want to count my japa privately on my phone and have it auto-contribute to our shared 1 lakh Ram-naam sankalp.

> As a circle creator, I want to see each member's contribution (with their consent) but never expose it outside the circle.

> As a member, I want a *celebration* moment when our circle hits the sankalp target — a single shared screen we can screenshot and post to our WhatsApp.

> As a privacy-conscious user, I want to leave a circle at any time and have my contribution stay (it's seva, not retracted) but my name removed.

## 5. Scope

### In scope — v1.8.0 (japa circles)

1. **Circle creation.**
   - Entry: from Sankalp creation flow (PRD-13), a "Saath mein / With family" toggle. Or from Profile → "Mandali / Circles."
   - Fields: circle name (e.g. "Sharma Parivaar"), deity (auto-suggests sankalp), sankalp target (count or date-based), reminder time.
   - Backend creates a `CircleId`, returns an invite URL (`https://vedansh.app/circle/abc123`).

2. **Invite link.**
   - Tap-to-share via WhatsApp / iMessage / SMS. Deep-link opens the app at circle preview.
   - Preview shows circle name, sankalp target, current progress, member count (not names). "Mandali mein shamil hon? / Join this mandali?"
   - On join, user's existing profile auto-attaches; if no profile, account creation prompt (re-uses PRD-13 + PRD-11 flow).

3. **Shared sankalp pool.**
   - Each member's matching practice (japa mala completed, chalisa recited, etc.) auto-increments the circle pool.
   - Circle's `progress = sum(member.progress)`.
   - Members never need to "submit" — automatic from `SankalpContext` events.
   - Backend uses idempotent event publishing; offline-recorded events sync when the device reconnects.

4. **Live circle screen.**
   - Members list (display name only — never email/phone).
   - Per-member contribution count (opt-in display; default OFF — show only if member toggled "Show my count to circle").
   - Total progress ring + target.
   - "Aaj ka yogdaan / Today's contribution" summary.
   - Long-poll refresh: every 20 sec while screen is visible; on-demand pull-to-refresh.

5. **Real-time-ish updates.**
   - No websockets in v1. Long-poll endpoint: client opens `GET /v1/circles/:id/poll?since=...`, server holds for up to 30s for an event, returns. Re-poll.
   - Push notification fires when circle hits 25 / 50 / 75 / 100% milestones (extends PRD-01).
   - Push notification fires when a member you've nominated as "Circle Lead" makes a milestone contribution (opt-in, throttled).

6. **Circle completion celebration.**
   - Full-screen modal with deity art + member-list-collage. Share button generates a PNG of the celebration card.

7. **Privacy controls.**
   - "Show my count in circle" toggle — default OFF for new joiners; the circle sees only the *total*.
   - "Leave circle" — contribution counts stay; name removed.
   - "Delete circle" (creator only) — soft-delete; members retain their individual sankalp progress.
   - Per-circle mute (notifications).

8. **Limits.**
   - Max 50 members / circle.
   - Max 5 circles / user.
   - Circle name profanity filter (English + Devanagari + romanized Hindi); auto-flagged for review.

### In scope — v1.8.1 (chalisa / aarti pool)

9. Beyond japa, circles accept any of the sankalp action types from PRD-13 (`recite`, `complete-chapter`, etc.). Shared sankalp can target "108 chalisas combined" or "Sundarkand × 21 paaths combined."

### Out of scope

- Chat / messaging in circles.
- Voice / video.
- Public / discoverable circles.
- Paid premium circles.
- Cross-circle leaderboards.
- Profile photos (privacy + moderation cost).

## 6. UX notes

- Circle name + member display-name only. No avatars, no photos.
- Member display-name is the `sadhakName` already collected in PRD-13.
- Live counter animates upward smoothly when an event arrives — feels alive.
- The "contribute" action is never explicit — japa beads count or paath complete inherently contribute. **Zero ceremony to participate.** This is the magic.
- Notifications throttled aggressively: at most 1 per circle per 24h beyond milestones.
- Tone is collective, not competitive. "Hum saath mein / Together we" framing. Never "you contributed more than X."
- Per-member counts visible only if that member opted in. Otherwise the circle sees aggregate only — sacred privacy.

## 7. Technical architecture

```
[mobile app A]                          [mobile app B]
  │ japa increment                        │ chalisa complete
  ▼                                       ▼
  POST /v1/circles/:id/contribute     POST /v1/circles/:id/contribute
  { event_id, action, count, ts }     { event_id, action, count, ts }
                  │
                  ▼
            [Vedansh API]
                  │
                  ▼
          [Postgres: circles, members, events]
                  │
   ┌──────────────┴────────────────┐
   ▼                               ▼
 GET /v1/circles/:id/poll       Push (FCM/APNs) on milestone
   (long-poll 30s)
```

- **Backend extends PRD-11.** Same service, new endpoints.
- **Postgres schema:**
  ```
  circles(id, name, deity, sankalp_target_type, sankalp_target_count, sankalp_target_date, created_by, created_at, status)
  circle_members(circle_id, profile_id, joined_at, display_name, show_count, role: 'creator' | 'member', left_at?)
  circle_events(id, circle_id, profile_id, action, count, idempotency_key, created_at)
  ```
- **Idempotency.** Each device generates a UUIDv7 per event; backend dedupes on `idempotency_key`.
- **Offline handling.** `SankalpContext` queues circle-contribute events when offline; flushes on reconnect.
- **Push.** Re-uses APNs / FCM tokens collected by PRD-01. Backend-initiated push for milestones only.
- **Mobile.**
  - New `mobile/src/features/circles/`:
    - `CircleListScreen.tsx`, `CircleCreateScreen.tsx`, `CircleDetailScreen.tsx`, `CircleJoinScreen.tsx`.
    - `useCircleLive.ts` long-poll hook.
    - `circleApi.ts`.
- **Tests:**
  - `mobile/src/features/circles/__tests__/CircleJoinScreen.test.tsx`.
  - `mobile/src/features/circles/__tests__/CircleDetailScreen.test.tsx` — renders members, hides counts when private.
  - `mobile/src/features/circles/__tests__/useCircleLive.test.ts` — long-poll behavior, retry, reconnect.
  - Backend: contract tests for idempotency, milestone-fire, leave-keeps-contribution, completion-celebration.

## 8. Safety, abuse, moderation

- **No free-form messaging** — kills the abuse surface upfront.
- **Profanity filter on circle name + display-name** — auto-flag + manual review queue. Bilingual + romanized Hindi.
- **Invite-link rotation** — creator can regenerate; old link goes dead.
- **Report a circle** — any member can flag. Three independent flags → automatic suspension, manual review within 24h.
- **Display-name conflict** — multiple "Mom" in the same circle is allowed; we don't disambiguate.
- **GDPR / DPDP compliance** — leaving a circle removes name but retains aggregate count (anonymized contribution). "Delete account" (from PRD-13) cascades to circles: name removed from member list, contributions remain anonymized.

## 9. Cost & infra

- Long-poll: ~30s hold per request × 4 polls / hour active × 30k circle members active = trivial at our scale (Postgres LISTEN/NOTIFY backed).
- Push notifications: free (APNs / FCM).
- Storage: linear with events; ~12 bytes per event; trivial.
- Estimated incremental backend cost over PRD-11: < $500/month at 250k MAU.

## 10. Success metrics & instrumentation

| Metric | Source | Target |
|---|---|---|
| Circles created / week | Backend | (steady state) ≥ 500 / week post week 8 |
| Active circles (≥ 1 event in 14 days) | Backend | ≥ 80% of created |
| Median circle size | Backend | ≥ 4 members |
| Invite-link install conversion | Backend (UTM-style param) | ≥ 25% of net new installs by week 12 |
| Circle sankalp completion rate | Backend | ≥ 65% |
| Privacy-toggle "show my count" rate | Backend | ≥ 50% (signal of trust) |
| Moderation incidents per 1000 circles / month | Manual review queue | ≤ 1 |
| Push-notification opt-in for circle milestones | Local | ≥ 70% of circle members |

## 11. Risks

| Risk | Mitigation |
|---|---|
| Group dynamics turn competitive / shame-inducing | "Show my count" default OFF; aggregate-only view; no leaderboard; copy review by scholar. |
| Abuse via circle name / display name | Profanity filter (bilingual); user-report path; suspension policy. |
| Privacy leak (member's email visible to circle creator) | Schema design — circle members table doesn't expose email; backend never returns it. |
| Invite-link sharing in public WhatsApp groups by accident | Optional "approve new members" toggle for creator (v1.8.1). |
| Backend load spike on a viral festival circle (10k joins in an hour) | Postgres can handle it; rate-limit creation to 1/min/user; pre-warm endpoints before Hanuman Jayanti / Janmashtami. |
| User leaves circle but their contributions still feel "theirs" — emotional regret | Confirmation dialog: "Aap chale jaayenge par aapka yogdaan hum mein rahega." / "You leave but your contribution stays in the circle." |
| Multi-account abuse to inflate circle counts | Rate-limit per-device events; require profile (email-verified) for circle creation; max 5 circles/user. |
| Circle creator deletes circle and 49 other members lose progress visibility | Soft-delete with 7-day grace; members retain individual sankalp progress regardless. |

## 12. Definition of done

- Circle create / invite / join / leave / delete flows live.
- Long-poll updates working on test devices with airplane-mode toggle.
- Push milestone notifications fire reliably on iOS + Android.
- Privacy toggles respected end-to-end (backend never returns hidden counts).
- Profanity filter + report path operational; moderation queue tooling internal.
- All tests green; backend contract tests gate deploys.
- TestFlight beta with 30 real circles run for 14 days; zero data leaks; ≥ 65% completion on the test set.
- DPDP / GDPR data-deletion path validated end-to-end (account delete → circle membership scrubbed).

## 13. Open questions

1. Should circles get a "scheduled group recitation" feature (everyone reads Sundarkand at 7am Saturday)? Defer to v2; data first.
2. Do we allow display-name change in-circle? Recommend yes, with audit log.
3. Should circles persist past completion (a "Hanuman Mandali 2027" archive) or auto-close? Recommend persist + flag completed.
4. Invite-link expiry? Recommend 30 days default, regenerable.
5. Do we offer pre-baked circle templates ("Family Mandali — 11,000 chalisas")? Recommend yes — onboarding friction killer.
