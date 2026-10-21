# Gita Saar correction review — 21 October 2026

## Review input

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
| Full automated run | `cd mobile && npm test`; counts in verification.json | TypeScript and 3,497 tests passed |
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

Maestro result is recorded separately in verification.json once the run completes.
