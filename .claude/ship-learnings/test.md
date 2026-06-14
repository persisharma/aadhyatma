# /ship Learnings — test phase

Learnings are auto-captured after each /ship run. Read before starting the phase.

### Clean test pass on first run validates TDD approach

**Seen:** 1x — 2026-05-24
**Category:** process-success
**Example:** Sanskar smoke test passed on first Phase 4A run. Test pattern copied from BajrangBaan worked perfectly.
**Resolution pattern:** For new reader screens, copy existing smoke test pattern. Only change: module import, route params, assertion text.

### A shared widget added to multiple components needs a test PER component — one integration test silently leaves siblings at 0%

**Seen:** 1x — 2026-05-29
**Category:** coverage-gap
**Example:** The NEW badge was added to BOTH LibraryCard and CategoryCard. I wrote a LibraryCard+provider integration test, ran per-file coverage, and CategoryCard showed 0% (no test rendered it) — its badge branch + " New." label were entirely unverified, despite the aggregate being >80%. Added a pure-props CategoryCard test → 100%.
**Resolution pattern:** When one feature touches N components, write a focused render test for EACH. Always check PER-FILE coverage (`--collectCoverageFrom` the changed files), not just the aggregate — the aggregate hides a 0% sibling.

### Run the real jest suite in Phase 4A before trusting tsc-only "GREEN" — and the regression diff confirmed zero new failures

**Seen:** 1x — 2026-05-29
**Category:** process-success
**Example:** Phase 2 used `tsc --noEmit` as the GREEN proxy (jest gate-blocked). Phase 4A jest run: 27/27 pass across 7 suites, baseline was 3 → zero regressions. The async-provider tests (act + microtask flush ×5) and stateful AsyncStorage mock worked first try.
**Resolution pattern:** Keep deferring jest to 4A when the gate blocks it, but treat 4A's run as authoritative; write the `.ship-4a-regression-check.json` verdict from the real diff, not the tsc proxy.

