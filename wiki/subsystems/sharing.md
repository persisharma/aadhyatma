---
title: Verse Sharing (share card, target picker, Instagram hashtags, story canvas)
type: subsystem
sources:
  - mobile/src/utils/shareVerse.tsx
  - mobile/src/components/ShareCard.tsx
  - mobile/src/components/ShareStoryCanvas.tsx
  - mobile/src/components/ShareTargetSheet.tsx
  - mobile/src/components/ShareButton.tsx
  - mobile/src/components/TimelyTagsResolver.tsx
  - mobile/src/data/shareLinks.ts
  - mobile/src/data/shareHashtags.ts
  - mobile/src/utils/shareStoryLayout.ts
  - mobile/src/utils/shareCardType.ts
last_verified_date: 2026-08-26
confidence: high
status: current
---

## Summary

Sends any verse out of the app as a branded parchment image. `ShareProvider`
(mounted once in `App.tsx`) owns an off-screen render + `captureRef` capture, a
three-destination picker, and a per-verse Instagram hashtag block. Reached from
~24 surfaces — every reader screen plus Daily Bhakti and the Japam counter — all
of which call the same `useShare().share(verse, lang)`.

Design spec is `design.md` §39 (§39.1 picker, §39.2 hashtags, §39.3 story canvas).

## Details

### The flow

1. `share(verse, lang)` with no `opts.target` opens `ShareTargetSheet` and returns.
   A caller that already knows the destination passes `opts.target` and skips it.
2. The chosen target mounts the card **off-screen** (absolute at −10000,−10000),
   waits one animation frame + 60 ms for layout/fonts, then `captureRef`s it.
3. Caption is built by `shareLinks.ts`; the Instagram targets also copy it to the
   clipboard, because **Instagram accepts no pre-filled caption from a share
   intent on either platform**.
4. Platform split for the plain target: iOS sends image + caption together via RN
   `Share.share({message, url})`; Android's RN Share drops file URIs, so the image
   goes through `expo-sharing`.

### Three destinations, two aspects

| Row | Component captured | Output |
|---|---|---|
| Share (other apps) | `ShareCard` | 1080×1350 |
| Instagram post | `ShareCard` | 1080×1350 (4:5) |
| Instagram story / reel | `ShareStoryCanvas` | 1080×1920 (9:16) |

The post/story split exists because a 4:5 image posted to a story or reel is
scaled up to fill and cropped top and bottom — taking the card's header band and
branding footer with it.

### Hashtags (`data/shareHashtags.ts`)

Pure, bundle-only, date-free. `MAX_HASHTAGS = 5` — that is what Instagram accepts,
and five is a different problem from thirty, so the ordering is a deliberate blend
rather than "most specific first":

1. occasion (today's festival, **only** when it is one of the text's deities)
2. the work's name (section when narrower than the text)
3. the same name in the reading language's script
4. two tags from the entry's **primary** deity
5. exactly one broad anchor (`#Bhakti`)

Vaar, chapter, second deity, category and remaining broad tags are still built in
priority order and fill any free slot. `limit` is **clamped** to `MAX_HASHTAGS` —
it can only shrink a block, never widen it past the platform cap.

Date-dependent tags come from a caller-supplied `TimelyContext`; absent one the
block is byte-identical to the date-free form.

## Dependencies

[[readers]] — every reader screen mounts the share button and the provider.
[[panchang]] — `TimelyTagsResolver` reads `useObservancesForDate` for festival tags.
[[languages]] — the tag block and caption follow the active reading language.
[[jest-suite-hygiene]] — why the panchang dependency is a deferred require.

## Gotchas

- **`ShareProvider` wraps the entire app, so anything it statically imports lands
  in every screen's import graph.** A static `@/panchang/usePanchang` import here
  pulled the festival engine, the precomputed observance tables and
  `astronomy-engine` into all ~24 reader suites — measured at ~10 % per suite on a
  cold cache (13.8 s → 15.2 s for one reader suite) and enough to turn CI red by
  tipping unrelated timing-sensitive suites past their 5 s timeouts. The resolver
  now lives in `TimelyTagsResolver.tsx`, loaded by a **deferred `require`** on
  first render and mounted only while the picker is open. Metro keeps it in the
  graph, so no bundle change and it still ships OTA — only execution moves.
  `React.lazy` + `import()` says the same thing but Jest cannot run a real dynamic
  import without `--experimental-vm-modules`.
- **Mounting the resolver only with the picker is also a runtime fix.**
  `useObservancesForDate` runs a whole-year observance solve on a cold cache; in
  the provider body every app start paid for it.
- **Timely tags must stay gated on deity relevance.** `DEITY_MATCH_TOKENS` matches
  the observance's `deityEn` against the deities the registry files the text under,
  so `#HanumanJayanti` attaches to a Hanuman Chalisa verse and nothing else.
  Ungated, this is the same irrelevance the module refuses when it declines
  `#viral` / `#trending` / `#explorepage`.
- **No `transform` on the view handed to `captureRef`.** The story canvas insets
  (120 top / 165 bottom / 0 horizontal) are chosen so a native 540×675 card fits
  the 540×960 band at exactly 1:1. `shareStoryLayout.test.ts` fails loudly if the
  shipped card ever stops fitting at scale 1. The horizontal inset is 0 on purpose:
  clearing the Reel action rail would force the card below its native width, i.e.
  a scale transform. The rail sits over the card's 28 dp padding, never its text.
- **The story canvas is centred in the SAFE box, not the canvas.** Canvas-centring
  drops the branding footer under the Reel caption strip.
- **A capture failure on an Instagram target shows an alert, not a text-only
  sheet.** Instagram takes an image or nothing, so a text-only share sheet simply
  would not list it — indistinguishable from the button doing nothing.
- **Clipboard is RN's deprecated `Clipboard`**, matching `NameDetailSheet`. That is
  deliberate: no new native dependency, so the whole feature ships over OTA.
- **A story crash reported from a device in Aug 2026 was never reproduced.** The
  nested scale transform was removed as the most likely cause, but that is
  unconfirmed — see design.md §39.3's dated note. Next suspects if it recurs:
  memory (a 540×960 dp view at density 3 is a ~19 MB bitmap before the scale to
  1080×1920, against ~13 MB for the post) and `captureRef` on a view positioned
  off-screen at −10000.
- **Adding a `ContentCategory` or `Deity` requires a tag entry** in
  `shareHashtags.ts` — `CATEGORY_TAGS` and `DEITY_TAGS` are exhaustive
  `Record<…>` maps, so an omission fails `tsc`. RULEBOOK records this.
