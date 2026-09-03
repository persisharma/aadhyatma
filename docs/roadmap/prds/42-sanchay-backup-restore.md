# PRD-42 — संचय · Backup & Restore (device-to-device, user-controlled)

> *Everything a person builds in this app — the streak, the sankalp on day 38, eight people's birth details, a grandparent's tithi, the family's kuldevta — lives on one phone and dies with it. The app that keeps the family record has no way to hand it to the next phone.*

| | |
|---|---|
| **Status** | Proposed — Q4 2026 slate (one of two), owns the quarter's committed store release (1.6.0, live before Dhanteras) |
| **Parent** | [2026-Q4-roadmap.md §2.1 / §3](../2026-Q4-roadmap.md) · supersedes the backup third of [PRD-06](./06-foundation-hardening.md) · absorbs [PRD-29 §3.7](./29-kul-parampara.md)'s one-way export |
| **T-shirt size** | M — one registry, one envelope, one exporter, one importer with a preview, two screens, one onboarding door |
| **Delivery** | **Store release** — the importer needs `expo-document-picker` (absent today). The registry, envelope and exporter are pure JS over `expo-file-system` + `expo-sharing` (both already ship) and can go OTA ahead of the binary. |
| **Feasibility** | ✅ Confirmed against `main`: ~40 user-state keys enumerated in source; `derivedCacheReset.test.ts` already maintains the exact user-vs-cache key partition this feature needs; every store has a versioned parser (`parsePrefs`, `parseStoredBirthProfile`, `PitruSmaranContext`'s versioned payload…) to import through. |
| **Prototype** | none yet — two screens in the shipped `SettingsRow` / information-panel language; a frame set is owed before build |

**Bundle-only, and *more* private than the alternative:** the backup is a file the user creates, sees the contents of, and moves themselves — Files, iCloud Drive, Google Drive, AirDrop, WhatsApp-to-self, a cable. Vedansh never sees it, never uploads it, has no account to attach it to. Nothing here changes the "nothing leaves the device unless you share it" stance; it makes the stance survivable.

---

## 1. Problem

In May 2026 the app persisted three things worth keeping (bookmarks, progress, activity). PRD-06 §1.3
called the lack of backup a gap and proposed export/import; it was never built. Since then the app has
become a **record-keeper**, and the record has grown roughly tenfold:

| What is lost on uninstall / phone change | Key(s) | Years to rebuild? |
|---|---|---|
| Lifetime japam totals, the streak the Profile renders as a mala | `user-activity`, `japam-counter` | yes — cannot be re-derived |
| Routines + reminder times; sadhana enrolments with per-day completion | `routines`, `routine-done`, `sadhana`, `sadhana-reminders` | a 41-day vow on day 38 restarts at 0 |
| Japam alarms | `japam-alarms` | minutes, but users forget which |
| Vrat and muhurat follows, reminder prefs | `vrat-follows`, `muhurat-follows`, `notif-prefs`, `vrat-reminder-default` | an hour of re-finding |
| Reading progress + bookmarks | `reading-progress`, `bookmarks` | the Gita position, Valmiki's kāṇḍa |
| Up to **8 people's birth details** | `kundali-profiles:v1` | re-collecting relatives' birth times |
| Pitru Smaran ledger, janma-tithi opt-ins | `pitru-smaran`, `janma-tithi:v1` | **ancestor tithis — often known to one person** |
| कुल परम्परा record | `kul-parampara:v1` | the one record PRD-29 said must be able to leave the device |
| Guna Milan drafts, Namkaran shortlists, vidhi + kitchen checklists | `guna-milan-draft`, `namkaran-shortlist`, `vidhi-checklist` | small, but mid-rite |
| Language, reading size, read-aloud voices, panchang city + calendar system | `language`, `font-scale`, `read-aloud`, `panchang-location`, `panchang-calendar-system` | five minutes of setup the user should not repeat |

PRD-29 shipped a one-way export of one record as a stopgap, and wrote down why: *"a lineage record
that cannot leave the device fails at the one job it has."* That sentence is now true of the whole
app. The two PRDs sequenced after this one (PRD-26 mastery, PRD-28 arc choices) add more state that
takes months to earn.

**Why now, specifically.** Diwali falls in week 6 of Q4 and is the largest phone-upgrade window of
the Indian year. Every year without this feature, the app's most loyal users — the ones with two
years of streak — are the ones who lose the most on the day they are happiest.

## 2. Goal

A user can, in under a minute each way: **create one file** that contains everything the app holds
for them, move it however they like, and **restore it on any install** — seeing exactly what will be
written before it is written — with every value landing through the parser its owner already trusts.

Success = an uninstall → reinstall → import round-trip on iOS and Android leaves the Profile, routines,
follows, people, ledger and record byte-equivalent to the source device (merge-policy differences
aside), verified by a seeded-device test that is the merge gate. Field measurement: local export and
import counters carrying an envelope id, so a diagnostics share can show the pair (§8).

## 3. What ships

### 3.1 The key registry — `mobile/src/backup/registry.ts` (pure)

One entry per persisted user-state key:

```ts
type BackupSection = {
  key: string;                 // '@vedansh/routines'
  id: string;                  // 'routines' — stable section name in the envelope
  group: 'practice' | 'library' | 'people' | 'family' | 'panchang' | 'prefs' | 'reminders';
  labelHi: string; labelEn: string;   // shown on the preview screen
  policy: MergePolicy;         // §6
  read(): Promise<unknown>;    // owner's read, returns the parsed (validated) value or null
  write(v: unknown, mode: 'merge' | 'replace'): Promise<void>;  // through the OWNER's parser + store
  sensitive?: boolean;         // birth details, family names → preview warning
};
```

`write` is never a raw `AsyncStorage.setItem` of foreign JSON: each section delegates to the owner
module's existing parse-and-persist path (`PitruSmaranContext`'s versioned parse, `birthProfileStore`'s
write queue, `parsePrefs`…), so a malformed or newer-shaped payload is rejected by the same code that
protects the app on launch. Sections the owner cannot import yet may register `write: null` — they are
**exported and listed as "not restorable in this version"** rather than silently dropped.

**Coverage test — the load-bearing part.** `backup/__tests__/registry.coverage.test.ts` sweeps every
`@vedansh` key literal in `src/` and requires each to be in exactly one of three sets: the registry,
`DERIVED_CACHE_KEY_PREFIXES` (calendar output — never backed up), or an explicit `EXCLUDED_KEYS` list
with a one-line reason each (`notif-meta` mirrors what is scheduled on *this* OS; `widget:last-plan-key`
is a dedupe; `tour-completed-v*` / `whats-new-seen-v*` / `onboarding-setup-v*` / `rating-prompt` are
this-install UX state; `search-recent` is disposable; `derived-cache-build` is the fingerprint). A new
persisted key without a registry entry fails CI — the same discipline `derivedCacheReset.test.ts`
already enforces for the cache partition, and the reason no future PRD (the deferred PRD-26/28
included) can ship unbackupable state.

### 3.2 The envelope — `mobile/src/backup/envelope.ts` (pure)

```ts
{
  format: 'vedansh-backup', version: 1,
  exportedAt: ISO, appVersion: '1.6.0', runtimeVersion, platform: 'ios' | 'android',
  envelopeId: string,            // random; the same id is logged on export and on import
  sections: { [id]: { v: number /* owner's schema version */, data: unknown } }
}
```

Values are the owners' persisted shapes verbatim (already versioned), plus a denormalised
`_display` block per section (names beside ids) so the file is legible to a human in a Files app
years later — the PRD-29 envelope's rule, kept. **PRD-29's `vedansh-kul-parampara` format becomes
section `kul-parampara` of this envelope**; the importer also accepts a bare PRD-29 file and treats
it as a one-section backup, so no file already exported is orphaned.

Size: a maximal device (8 people, 30 pitru entries, 10 routines, a year of activity) is well under
1 MB of JSON. No compression, no encryption in v1 (§7 №3).

### 3.3 Export — `backup/exporter.ts` + the संचय screen

`More → संचय · Backup & Restore` (`BackupScreen`, in the App group beside Reminders). Two cards:

- **बैकअप बनाएँ** — a summary of what will be included (section groups with counts: "3 routines · 2
  people · 4 pitru tithis · 118 days of practice"), a **sensitive-data line** when birth details or
  family names are present (the PRD-29 §3.7 rule), then one action → writes
  `vedansh-backup-YYYY-MM-DD.json` to the cache directory and opens the OS share sheet
  (`expo-sharing`, `application/json`). The cache file is deleted after the sheet closes. A
  **"last backup: <date>"** line persists (`@vedansh:backup-meta:v1`, itself excluded from backup).
- **बैकअप से पुनर्स्थापित करें** → §3.4.

### 3.4 Import — `backup/importer.ts` + `RestorePreviewScreen`

`expo-document-picker` (JSON / any file) → read → `parseEnvelope` (format, version ≤ current,
per-section `v` ≤ owner's current; a **newer** envelope is refused with copy naming the version and
asking the user to update the app first) → **preview screen**:

- One row per section present in the file: label, count in the file, count on this device, the
  policy verb (*जोड़ेंगे / बदलेंगे / छोड़ेंगे*), and a per-section toggle (default on). Sensitive
  sections carry their warning line.
- A **mode switch** — **मिलाएँ (merge, default)** vs **बदलें (replace)** — with one-sentence copy for
  each (§6). Replace is what a "new phone, start from the backup" user wants; merge is the safe default
  for everyone else.
- One action: **पुनर्स्थापित करें** → sections apply in a fixed order (prefs → people → practice →
  family → reminders), each through its owner's `write`; failures are collected, never fatal to the
  rest. A **result screen** lists what landed and what did not, with the reason.
- After a successful import: every headless scheduler re-arms (they already key on their prefs), the
  widget coordinator re-plans, and the derived caches are left alone (they are recomputable and the
  city may differ). Notification permission on the new device is requested only when a restored pref
  says "on" — through the shared `permissionState` path, honestly reporting a denial by flipping the
  flag as the provider does today.

### 3.5 The onboarding door

`OnboardingSetupSheet` (first run) gains a quiet third row under language and size: **"पहले से बैकअप
है? पुनर्स्थापित करें"** → the same picker/preview flow. This is the only place import is offered
proactively; there is no nag. A single **DISCOVER card** appears once when a device holds
significant state (≥ 30 activity days or ≥ 1 person / pitru entry) and has never exported, and
dismisses forever on tap or swipe.

### 3.6 Ask intents (RULEBOOK §25)

`backup.make` ("बैकअप कैसे लें", "data kaise save karein"), `backup.restore` ("पुराने फोन का डेटा",
"restore"). Both resolve to the संचय screen; no computed answer.

## 4. Where it lands (surfaces, in one list)

More hub row (App group) · `BackupScreen` · `RestorePreviewScreen` + result state · onboarding
sheet row · one-time DISCOVER card · two जिज्ञासा intents · `whatsNew['1.6.0']` entry.

## 5. Data model

- `@vedansh:backup-meta:v1` — `{ version: 1, lastExportAt?, lastExportEnvelopeId?, lastImportAt?,
  lastImportEnvelopeId?, discoverDismissed?: true }`. Excluded from backup and from the derived-cache
  sweep (enumerated in `derivedCacheReset.test.ts`).
- No other new persisted state. The registry is code.

## 6. Merge semantics — decided here

| Policy | Applies to | Merge (`मिलाएँ`) | Replace (`बदलें`) |
|---|---|---|---|
| `union-by-id` | bookmarks, routines (+ their reminder), sadhana enrolments, japam alarms, vrat/muhurat follows, birth profiles (cap 8 — overflow reported, not silently dropped), pitru entries, namkaran shortlist, vidhi/kitchen checklists | keep both; same id → **incoming wins** | incoming set only |
| `union-by-day-max` | `user-activity` (per-day totals), `reading-progress` (per-key, latest `updatedAt` wins) | per day/key, the larger / later value | incoming only |
| `incoming-wins` | language, font-scale, read-aloud prefs, notif-prefs, vrat-reminder-default, panchang location + calendar system, kul-parampara record (single record), janma-tithi opt-ins, guna-milan draft | incoming value | same |
| `keep-local` | anything the owner marks `write: null` this version | untouched, reported | untouched, reported |

Two invariants pinned by tests: **import is idempotent** (importing the same file twice equals once)
and **export ∘ import on an empty device reproduces the export** section-for-section under either mode.

## 7. Open decisions

1. **Merge vs replace default** — recommend merge (safe), replace offered on the preview (§3.4).
   Roadmap §7 №1.
2. **Destinations** — files + share sheet only. No QR, no peer-to-peer, no cloud target. Roadmap §7 №2.
3. **Encryption** — none in v1. The file holds birth details and family names, which the preview says
   plainly; the user chooses where it goes. A passphrase option is a v2 candidate if asked for; adding
   it now doubles the failure modes of the one feature that must not fail.
4. **Scheduled reminder to back up** — no. One DISCOVER card once; the "last backup" line does the rest.
5. **Should `japam-counter` (the live mala position) be included?** — yes, as `incoming-wins`; it is
   small and a mid-mala position is exactly what a phone change interrupts.

## 8. Metrics (local, bundle-only)

Export count and import count with envelope ids in `backup-meta`; the diagnostics share includes both
so a user reporting "restore didn't take" hands over the pair. Quarter target (roadmap §5): ≥ 60 % of
devices that export within 14 days also import somewhere — measured as the ratio of import events
whose envelope id matches an export event *somewhere*, which only the user's own report can show, so
the honest field metric is the two raw counts plus App Store review sentiment.

## 9. Non-goals

- No cloud, account, sync, or automatic backup — the OS's file providers are the cloud.
- No cross-app import (other apps' data), no CSV.
- No restore of derived caches, OS notification bookkeeping, or this-install UX flags (§3.1 exclusions).
- No partial "share my routine with a friend" — that is a different feature with a different privacy
  shape; the envelope's per-section toggles are not a sharing UX.

## 10. Risks

| Risk | Mitigation |
|---|---|
| A section writes back a shape the owner's newer parser rejects (silent data loss) | Owner-parser-only writes; per-section `v` gate; result screen names every skipped section; round-trip test seeded with fixtures from **each** store's test suite |
| Store review slips past Dhanteras | Exporter + envelope OTA first — the old phone can always export; only import waits on the binary |
| A user restores an old backup over a newer device by mistake | Merge default; replace needs an explicit second tap with "this replaces N routines / M people" copy |
| Notification permission differs on the new device | Prefs restore honestly; the provider's existing "hard denial flips the flag" logic runs unchanged |
| Two phones share one backup (a couple) | `union-by-id` makes merge a reasonable outcome; birth-profile cap 8 is enforced with an overflow message |
| The picker's file type filtering differs across OEM Android file managers | Accept `*/*` and validate by content, not by extension |

## 11. Tests & release gates (RULEBOOK §0/§0.1)

- **Unit:** `registry.coverage.test.ts` (the sweep), `envelope.test.ts` (parse/refuse/version), per-policy
  merge tests, idempotence + round-trip over seeded fixtures, PRD-29 legacy-file acceptance, result
  reporting on a failing section; Jest suites for both screens (preview counts, sensitive line, mode
  switch copy) and the onboarding row.
- **E2E:** `backup-smoke.yaml` — More → संचय → export summary → share sheet visible (Maestro cannot
  complete a share) → restore door present. The document picker is system UI Maestro cannot drive, so
  import is covered by the round-trip unit test — the same rationale recorded for notification taps
  in [[e2e-verification]]. A manual **device round-trip on iOS and Android** is the release gate and
  is recorded in this PRD's verification section when done.
- **Docs in the same PR:** `design.md` new **§72 संचय** (screens, preview row anatomy, copy rules,
  sensitive-line rule) + §37 More-hub rows + §47 onboarding sheet row; `RULEBOOK.md` new **§26 —
  the backup registry contract**: *a new persisted user-state key ships with a registry section (or an
  explicit exclusion with reason), a coverage-test pass, and a round-trip fixture.*
- `whatsNew['1.6.0']` + `APP_TOUR_VERSION` bump; `npm run lint` at 0.

## 12. Why it fits

PRD-29 §10 said the record is valuable because it can be handed on, not because it is trapped. This
PRD applies that sentence to the whole app. It is also the precondition for everything deferred behind
it: PRD-26 and PRD-28 both add state that takes months to earn, and the registry's coverage test is
what guarantees neither can ship without a way home.
