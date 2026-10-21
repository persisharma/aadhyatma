# Gita Saar correction review — 21 October 2026

## Latest correction — current implementation

The inserted reader banner has been removed; the existing devotional background remains. Theme rows use bundled StoryIcon illustrations instead of outline icons. The index cover and existing language toggle/controls remain.

- TypeScript: passed.
- Focused regression tests: 29 passed across 3 suites, including four-language icon mapping and the background-only reader policy.
- Native iOS: 27-step existing-profile smoke passed, covering index, English first Saar, scrolling and Gita 6.32 handoff. The listing and opening reader screenshots were visually inspected.
- [Current illustrated icons](background-only/gita-saar-theme-icons.png) · [Current reader](background-only/gita-saar-en-opening.png) · [Complete Saar](background-only/gita-saar-en-complete-saar.png) · [Run log](background-only/run.log).

The remaining sections document the previous iteration. Its full 3,512-test run and Large/regional captures were not repeated after this correction. Android, physical-device and exhaustive page coverage remain unverified.

## Previous iteration — review input

PR #502 has no issue comments, reviews, or inline review comments at inspection time.
Its CI failed two tests: reader banner placement and the artwork delivery contract.
The user also reported clipped titles/content and requested theme icons instead of numerals.

## Fixes

- Give the index title a 64 dp line box plus 8 dp top/bottom padding below the banner.
- Use the existing iOS Fabric-safe `ProseParagraph` for index titles/metadata and all reader headings/labels/handoff text, retaining the source strings and allowing wrapping.
- Replace 01/02/03 with topic-specific Phosphor icons for all 16 stable theme IDs. Keep order, counts, resume positions, and the existing toggle and reader controls.
- Restore `ReadingBanner` and the approved remote illustration alias. Preserve the full 2:1 painting with explicit frame dimensions. Show full-width parchment while artwork loads; remove direct artwork `require()` calls.
- Let the verse-reference/actions row wrap on narrow screens.

## What was verified

| Layer | Evidence | Result |
| --- | --- | --- |
| Full automated run | `cd mobile && npm test`; counts in verification.json | TypeScript and 3,512 tests passed |
| Original CI failures | `readerArtworkPlacement.test.tsx`, `artworkDelivery.jest.test.ts` | Passed in the full run |
| Four-language listing regression | Icons cover all 16 themes; no text line limits; padded title; final theme navigation | Passed |
| Native Hindi Standard | Index title, complete icon listing, first theme opening and complete Saar | Inspected; screenshots below |
| Native English Standard | Complete first Saar; multiline theme-10 title; handoff to Gita 6.32 | Inspected |
| Native Large | First theme in English, Gujarati, Kannada; regional index titles | Inspected; full-Gita button remains reachable |

### Screenshots

- [Hindi title and full banner](index-hi-title.png)
- [First theme icons](index-hi-icons.png), [middle rows](index-hi-middle.png), [last rows](index-hi-end.png)
- [Hindi opening](reader-hi-opening.png), [complete Saar](reader-hi-complete-saar.png)
- [English complete Saar](reader-en-complete-saar.png), [long reader title](reader-en-long-title.png), [full-Gita handoff](full-gita-handoff.png)
- [English Large](reader-en-large-complete.png)
- [Gujarati Large title](index-gu-large-title.png), [complete Saar](reader-gu-large-complete.png)
- [Kannada Large index](index-kn-large-icons.png), [complete Saar](reader-kn-large-complete.png)

## Scope limits

This is a representative iOS visual review, not an exhaustive review of all 170 reading pages.
Android, physical devices, OS accessibility text enlargement beyond the app's Large preset,
and every possible page/language combination were not visually checked.
Some captures include the computer-use pointer overlay. Screenshots of a scrolled viewport may show partial preceding/following content at its edges; the saved complete-Saar states establish the paragraph ending and handoff are reachable.

## Maestro result

**Passed, exit 0** on the existing isolated iOS simulator profile. The 27-step flow launches the app, opens Sacred Books → Gita Saar, captures the Hindi title, switches to English, physically swipes the first theme clear of the tab bar, opens True Prema, scrolls to the complete Saar/handoff, and asserts Chapter 6 / verse 32 of 47 after the handoff. Fresh-install setup is not covered by this successful run.

Earlier attempts exposed a development LogBox overlay over setup, an unresponsive Metro (`No script URL provided` during relaunch), and an iOS accessibility false positive for a theme row under the tab bar. Restarting Metro and explicitly swiping that row into the viewport resolved the run. These failed attempts are not counted as passing evidence.

- [Native run log](maestro/run.log)
- [Title](maestro/gita-saar-hi-title.png) · [Icon listing](maestro/gita-saar-theme-icons.png)
- [Reader opening](maestro/gita-saar-en-opening.png) · [Complete Saar](maestro/gita-saar-en-complete-saar.png) · [Gita handoff](maestro/gita-saar-full-gita-handoff.png)

The final full automated run was repeated after merging current main at code revision `685821ac`: TypeScript plus 3,512 tests passed (37 widget, 2,625 Jest across 272 suites, 617 engine, 184 data, 49 Ask tests).
