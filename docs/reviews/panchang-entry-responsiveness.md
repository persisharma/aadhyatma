# Panchang entry freeze investigation

Base: f5c82346dac5c7a6cd623a3f06aa68ede2027594.

The report is all tabs/actions stopping after entering Panchang, not only the
Share disabled state. The occasion matcher inspected all 197 profiles over three
neighboring days. Its Varalakshmi match resolved all annual anchor dates before
the outer generator could yield. A timer or an outer 4ms scheduler cannot
interrupt that nested synchronous scan. A separate selected-day timer also
called the synchronous day-input solver.

Cold Node/V8 probe, Jaipur, Purnimant, 8 November 2026: original single
Varalakshmi step 621ms / total profile CPU 679ms. A second cold run measured
561ms / total619ms. After correction, largest step32ms (cold Diwali primitive),
total50ms. These are desktop observations, not Android/iOS frame-time proof.

## Changes

Solar day matching uses exactly two civil-midnight longitudes. Relative matching
rejects the wrong weekday without astronomy and checks at most seven forward
anchors, with a yield between each. Occasion matching propagates those yields
through the shared scheduler; selection uses the cancellable async day store.
No timing recipe, published year table, artwork, IDs, persisted schema or release
configuration changes.

## Acceptance

- Three deterministic bounds regressions cover zero work on a non-Friday, seven
  yielded candidate anchors and two solar-boundary reads.
- Date parity covers both calendar systems, all solar and relative entries in the
  reviewed 2024–2031 tables, including adjacent negative dates.
- Focused hook/routing tests exercise the real matcher, shared input pipeline,
  hydration/retry and cancelled/stale publication.
- Full-suite, final-head CI and native evidence recorded in the PR.
- PENDING: release-mode low-end Android cold/repeated entry, immediate Home/Back
  taps, scrolling, slow/offline artwork, memory/frame-time/logcat and iOS hangs.
  No device tools are installed on this Linux executor; no native pass claimed.

Share's existing explicit occasion-loading/error gate is distinct from this CPU
freeze and is not removed: exporting incomplete timing data silently is not a
fix for blocked navigation. Screen artwork delivery is the preceding PR639.
