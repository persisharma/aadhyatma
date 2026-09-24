# Explicit job-switch answer — 24 September 2026

The previous current-phase card often said “mixed” and repeated generic guidance. An explicit job-switch question now starts with a qualified decision, then shows the chart signals in favour and the reasons to pause. Each displayed reason points to a `PhaseSignal` and names its natal, running-period or current-transit reference. The next step uses an actual offer as the decision checkpoint. Technical basis and the selected-question text export remain available.

For the synthetic Aarav fixture on 24 September 2026, the answer is **“Search now; hold off on resigning.”** In favour: Mars rules the career house and is placed in the house linked to contacts and gains. Reasons to pause: Saturn's current transit does not add easy support to the work houses it touches; the running Jupiter period activates daily work but does not establish ease or difficulty. The app does not claim that this combination predicts an offer. After the January 2028 dasha boundary the same chart returns **“No clear timing answer for a switch yet”** because no running period directly activates the checked job houses. A separate synthetic Isha fixture on 30 October 2026 returns **“Yes, pursue a job change now”** from Venus Antardasha support and a relevant supportive Saturn transit; the next step still asks for written role, pay and start-date terms.

Ask recognizes explicit switch wording in English, Hindi and Hinglish, uses the same decision, and opens `job-switch` selected on Prashna. Broad job questions retain the general career phase. The selected-question export includes the decision, both sides and signal IDs.

## Native visual check

Dedicated iPhone 17 iOS 26.4 QA simulator `913FA15C-3750-4E34-97BA-A39A33410600`, synthetic Aarav only, Standard **Large** content size. English and Hindi Maestro flows completed. The [English answer](screenshots/en/screenshots/01-answer.png), [English evidence](screenshots/en/screenshots/02-in-favour.png), [Hindi answer](screenshots/hi/screenshots/01-answer.png) and [Hindi evidence](screenshots/hi/screenshots/02-in-favour.png) show wrapped labels, date range and reasons. The [English next step](screenshots/en/screenshots/03-reasons-to-pause.png) and [Hindi next step](screenshots/hi/screenshots/03-reasons-to-pause.png) remain inside their cards. No horizontal clipping was observed. Long evidence cards scroll vertically; viewport screenshots are not full-card images.

The flows are in [`flows/`](flows/). The Hindi run used the dedicated simulator's language preference set to `hi`; it was restored to `en` after capture. No real user profile or other simulator was changed. A React Native development warning tray was dismissed before final captures; it is not part of production UI.

## Verification and limits

- TypeScript typecheck passed. Ask: 48/48 tests; phase and selected-export engine: 15/15; Prashna and report screens: 12/12; launch graph: 2/2. Lint exited with 0 errors and 290 repository warnings. Both native language flows passed.
- The job-switch decision is an editorial mapping of the existing five phase tones. It adds no astronomical or classical rule. The source register remains [`prashna-phase-v1.md`](../../roadmap/conventions/prashna-phase-v1.md) with `PHASE_SOURCE.verified=false` and its excluded methods unchanged.
- The 2026-09-21 public/synthetic comparison remains a reasoning comparison, not evidence of predictive accuracy. This change was checked against the Aarav, Kabir, public sample A and Isha fixtures; it has no outcome validation or independent astrologer sign-off.
