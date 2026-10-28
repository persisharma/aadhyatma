# Validation, 28 October 2026

- Full `npm test` on the merged code: **3824 tests passed**, no failures. Includes TypeScript, widgets37, Jest2899 (303 suites), engine621, data218 and ask49.
- Final focused reminder/card/list/detail checks before synchronization:52 passed.
- Changed-source ESLint: zero errors,52 existing deferred-import warnings in PanchangScreen.
- `git diff --check`: clean.
- Synchronized main `176a201c`; the only textual conflict was the append-only wiki log, resolved by preserving both histories. Vrat implementation files merged cleanly.
- Native Hindi Standard: first setup,2-day/08:00 Save, next bell with no setup, two favourites, per-Vrat gear showing reused preference. List and detail actions added Ahoi and Masik Kalashtami, yielding four favourites.
- Native English system XXXL: setup/Close/Save reachable; cancelling leaves unsaved; Save adds favourite; next bell skips setup.
- Controlled storage inspection proved Vrat preferences persisted separately and Daily Bhakti remained disabled at05:45. Original timing/favourite values and Hindi/Standard/normal text were restored after QA.
- OS permission policy covered in unit tests; no native permission-dialog or actual notification delivery assertion. Android/physical device, screen reader and smallest-phone checks pending.

Native captures predate main synchronization. The scoped Vrat source merged without conflicts; automated checks were rerun on the combined tree. This is not release acceptance or an OTA/CDN publication.
