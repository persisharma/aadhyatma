---
title: Jest suite hygiene — order dependence and the shared time budget
type: concept
sources:
  - mobile/jest.config.js
  - mobile/src/components/__tests__/PitruPakshaDayChip.test.tsx
  - mobile/src/screens/__tests__/NamkaranExperience.test.tsx
  - mobile/src/utils/shareVerse.tsx
last_verified_date: 2026-08-26
confidence: high
status: current
---

## Summary

`npm run test:readers` runs ~163 suites with `--runInBand`, in one process, in an
order Jest chooses (file size on a cold cache, previous timings on a warm one). Two
failure modes follow from that and have now bitten three times: a suite that only
passes in a particular position, and a change that slows every suite enough to tip
borderline ones past the default 5 s per-test timeout.

Both present as "CI failed in a file my diff does not touch."

## Details

### Order dependence

A suite is order-dependent when it relies on something that is only true early in
the run. The recurring shape here is **a component that resolves state in a passive
effect via its own `setTimeout(0)`, and a test that awaits a single macrotask**:

```tsx
await act(async () => {
  tree = TestRenderer.create(<Chip />);
  await new Promise((r) => setTimeout(r, 0));   // ← races the effect's own timer
});
```

Whether the component's timer is scheduled *before* the awaited one depends on when
React flushes passive effects, which shifts with process state. `PitruPakshaDayChip`
passed for as long as it happened to run first; adding test files elsewhere in the
repo pushed it ~100 suites later and it failed.

**The fix is to flush until the thing you are asserting on exists**, bounded so a
real regression still fails fast:

```tsx
for (let i = 0; i < 20 && tree.toJSON() === null; i += 1) {
  await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
}
```

Never skip, disable or quarantine the suite instead — make it deterministic.

### The shared time budget

Every suite pays for the module graph it imports. A widely-mounted provider is the
dangerous place to add an import: `ShareProvider` wraps the whole app, so a static
`@/panchang/usePanchang` import in `shareVerse.tsx` put the festival engine and
`astronomy-engine` into all ~24 reader suites at ~10 % each. Nothing failed *there* —
it failed in whichever timing-sensitive suite was already closest to its 5 s limit.

Defer heavy, rarely-needed modules behind a `require` inside a component that only
renders when the feature is used. Metro keeps it in the bundle graph; only execution
moves. See [[sharing]] for the worked example.

## Dependencies

[[sharing]] — the deferred-require pattern and the measurement behind it.
[[e2e-verification]] — the Maestro side of the test policy.

## Gotchas

- **Reproduce ordering, not just the test.** A failing suite usually passes in
  isolation. `npx jest --clearCache && npx jest --runInBand --ci` approximates CI's
  cold-cache order; a warm local cache orders by previous timings and can hide it.
- **Always check the base branch before claiming a failure is yours or isn't.**
  Run the same suite on `main` on the same machine. In Aug 2026
  `NamkaranExperience` timed out at ~5.4 s on a cold cache **on both `main` and the
  branch** — a slow container, not a regression — while `PitruPakshaDayChip` failed
  only on the branch and was genuinely caused by it. Same symptom, opposite verdict.
- **`jest.useRealTimers()` in `beforeEach` does not cover this.** Each test file gets
  its own environment, so fake timers do not actually leak across files; the guard in
  `PitruPakshaDayChip.test.tsx` predates this understanding and the real cause was
  the macrotask race above.
- **Unmount test trees in `afterEach`.** A live tree whose component registers a
  midnight/foreground listener (e.g. `useTodayKey`) keeps Jest from exiting —
  "Jest did not exit one second after the test run has completed."
- **Pin the date when a test's output depends on it.** `shareVerseTarget.test.tsx`
  mocks `useTodayKey` to a fixed Wednesday so vaar-derived hashtags do not change
  with the run date. A real Tuesday run caught this by adding `#Mangalwar`.
