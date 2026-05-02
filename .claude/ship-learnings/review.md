# /ship Learnings — review phase

Learnings are auto-captured after each /ship run. Read before starting the phase.

### Absolute-positioned badge + flex-inline chevron on the same card: check y-axis overlap, not just x-axis

**Seen:** 1x — 2026-04-25
**Category:** layout
**Example:** LibraryCard renders the `›` chevron inline on active cards and a SOON/PREVIEW badge `position: absolute; top: 12; right: 12`. For active+preview cards, both rendered at the top-right corner. They don't physically overlap (badge y=12–28, chevron y=~44 vertically centered), but they look busy and redundant — the badge itself is the tap affordance signal. Fix: suppress the chevron when isPreview is true. Avoid cramming two affordance signals on one card.
**Resolution pattern:** When adding an absolutely-positioned badge, audit every conditional branch that already renders something in that corner. Prefer mutual exclusion over visual coexistence.

### IIFE module-load invariants should check the actual failure mode, not a guard that can never fire

**Seen:** 1x — 2026-04-25
**Category:** invariant-design
**Example:** `imageForGitaVerse` returns a string literal — guard `if (!imageForGitaVerse(...))` is dead code today. The real risk is that when the function evolves to a real lookup (`Record<GitaImageKey, ...>`), it may return undefined. Kept the guard for pattern-consistency with `verseImages.ts` (Hanuman) but added invariants that actually fire on realistic misconfiguration: `labelEn.trim()` emptiness (would silently collapse pill→verse spacing), `lines.length < 2` (would break shloka rendering), chapter mismatch (would break counter math).
**Resolution pattern:** Think about what would actually break at runtime, and assert THAT — not whatever the Hanuman precedent asserts. Copy the pattern; adapt the invariant.

### Spacing contracts that span two components: collapse to one or assert the invariant that holds them together

**Seen:** 1x — 2026-04-25
**Category:** visual-rhythm
**Example:** `pill.marginBottom=6` + `chapterEn.marginBottom=18` = 24px combined. If `labelEn` is ever empty and the chapterEn component unmounts, pill→verse gap collapses to 6px — a silent visual regression. Added a module-load assertion that `labelEn.trim() !== ''` so the preview can't ship with an empty value. Alternative: merge the two margins into one or inline the chapter-en label into the pill row so there's a single spacing contract.
**Resolution pattern:** When two separate components carry shared spacing, either: (a) assert the condition that keeps both mounted, (b) collapse into one component, or (c) duplicate the margin so either can stand alone.
