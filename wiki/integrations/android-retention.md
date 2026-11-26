---
title: Android first action and seven-day return
type: integration
sources: [mobile/src/retention/, mobile/src/contexts/NotificationPreferencesContext.tsx, services/retention/]
last_verified_date: 2026-11-26
confidence: high
status: current
---

## What the report counts

The unit is a new Android app-data installation that reaches app initialization in the foreground. Existing installations with Vedansh's pre-existing open metadata are excluded. Reinstalling or clearing app storage can start another cohort. The version and build are taken from the native binary on first open and stay fixed across updates.

Each install queues a first open, at most one first completed action on calendar days 0–6, and at most one foreground return on calendar day 7. All dates use India Standard Time. Foreground includes a cold open and a return from the background. The first session ends on process exit or after 30 minutes in the background. A brief switch to an Android permission or widget screen keeps the same session. Origin and return dates use the phone clock. A return on day 8 does not qualify.

| Measured first action | Completion |
| --- | --- |
| Kundali | The user submits valid birth details and the saved chart becomes available. |
| Today's Panchang | Today's calendar with computed data is focused and visible for three foreground seconds outside first-run setup and tour. |
| Gita or another supported reader | A verse page stays in a focused reader for three foreground seconds. |
| Japa | The user counts a bead by tapping. |
| Bookmark, sharing, routine | The app reports a saved bookmark, a handoff to Android sharing, or a completed routine. The receiving app controls final delivery. |

Other features are outside this action vocabulary. An install without a measured action still contributes to the denominator. First actions in a later session have their own rows. The report leaves D7 outcomes empty until the whole seventh day has elapsed. Offline delivery can revise a mature cohort. An offline device that never reconnects cannot contribute its queued events.

## Service and report

The first-party Worker accepts POST /events and stores allowlisted fields in D1. The three events use independent random IDs to deduplicate retries. Rows contain the first-open day, release, build, event type, coarse action and first-session flag. The collector stores no name, birth inputs, scripture title, location, advertising identifier, stable installation identifier or IP address. The service is independent of Meta install attribution. The first-open denominator starts when collection is enabled and cannot reconstruct past releases.

From `services/retention`, run `wrangler d1 execute DB --local --file schema.sql` followed by `wrangler dev --local` to run a local collector. For production, provision a Vedansh-owned D1 database, replace the local database ID in the Worker configuration, apply the schema with `--remote`, and deploy the Worker. The scheduled cleanup retains the last 45 cohort days plus the current day. Check the live privacy notice and Play Data Safety disclosures against these fields before enabling the endpoint in a release. The public client endpoint accepts untrusted traffic, so apply edge rate limiting and keep D1 read access private.

Set `EXPO_PUBLIC_RETENTION_URL` to that Worker's HTTPS /events endpoint when packaging the Android release and applicable OTA bundles. An unset endpoint disables this measurement. Local Android debug builds can use adb reverse with http://127.0.0.1:PORT/events. The native app and collector can be released independently. Confirm first-open receipt on a fresh install and the absence of a new cohort after an upgrade.

Run `wrangler d1 execute DB --remote --file report.sql` for the cohort counts and percentages. Sum returns and divide by the sum of installations when combining mature rows across dates. Keep immature rows out of both sums. For first-session activation, sum installations on first-session action rows and divide by all installations in the period. The reports describe observed behaviour. They cannot attribute an uninstall to a feature or an advertising campaign.

## Verification

Run `node --experimental-strip-types --test services/retention/retention.test.mjs` from the repository root with Node 22.13 or newer. The tests exercise the mobile queue, collector and SQL report against SQLite, including retries, exact-day returns, upgrades and users who complete no measured action.

See [[integrations/meta-app-events]] for the separate install-attribution integration.
