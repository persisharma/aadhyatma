# Bālakāṇḍa comic — in-app (WebView over CDN) design

**Date:** 2026-10-12
**Branch:** persisharma/workspace-changes-review (new work branch to be cut)
**Status:** awaiting user approval

## Goal

Surface the existing `docs/content-parity/ramayan-comic/balakanda-v1` comic inside the Vedansh
app's Kids section so it is viewable on device, without rebuilding the comic natively and
without an App Store build (reachable via OTA).

## Non-goals

- No native re-authoring of the comic into the `kidsStories` page/art data model.
- No new reader UX — we reuse the already-reviewed web reader (`reader.js`/`reader.css`) verbatim.
- No English/Gujarati/Kannada translation work (comic is Hindi-only today; see Caveats).
- No bundling of the 92 MB of page images into the app binary.

## Approach (chosen with user)

Host the existing self-contained web reader on the R2 CDN and open it in an in-app
`WebView`, reached from a card in the Kids library. `react-native-webview@13.15.0` is already a
shipped native dependency (used by `DockedYouTubePlayer`), so this ships via `eas update` (OTA)
with no native change.

### Components

1. **CDN hosting** — upload the reader bundle to
   `https://cdn.vedansh.app/comics/balakanda-v1/`:
   - `index.html`, `reader.js`, `reader.css`, `book.json`
   - the **29** page PNGs referenced by `book.json` (`episodes[].asset`, ~92 MB total).
     The unreferenced `-vN` variants in `assets/` are NOT uploaded.
   - Upload via `wrangler ... --remote` to bucket `vedansh` with immutable cache-control
     (per the R2 CDN convention). The reader's relative `fetch('book.json')` and
     `<img src="assets/…">` resolve against the CDN base URL, reproducing the reviewed comic.

2. **`comics` registry** (`mobile/src/data/comics.ts`) — a tiny typed module:
   `{ id, title: {hi…}, cover?, url }`. One entry: `balakanda-v1`. Keeps the screen and
   the Kids card data-driven and unit-testable, and leaves room for future comics.

3. **`ComicReaderScreen`** (`mobile/src/screens/ComicReaderScreen.tsx`) — `ReaderHeader`
   (back + comic title) above a full-screen `WebView` with
   `source={{ uri: comic.url }}`. Loading spinner while `onLoadStart`→`onLoadEnd`; an
   explicit error state on `onError`/`onHttpError` (no silent failure). Follows the existing
   WebView usage pattern.

4. **Navigation wiring**
   - `types.ts`: add `ComicReader: { comicId: string }` to `HomeStackParamList`.
   - `routeGraph.ts`: `"KidsStoryLibrary": ["KidsStoryDeity", "ComicReader"]`.
   - `HomeStackNavigator.tsx`: register the `ComicReader` screen.

5. **Kids library card** (`KidsStoryLibraryScreen.tsx`) — one `DeityCard` (or shared card)
   below the deity list, `testID="kids-story-comic-balakanda"`, title "रामायण कॉमिक · बालकाण्ड",
   `onPress` → `navigation.navigate('ComicReader', { comicId: 'balakanda-v1' })`.

### Data flow

Kids library card → `ComicReader` route (comicId) → look up `comics.ts` → `WebView` loads
`cdn.vedansh.app/comics/balakanda-v1/index.html` → reader fetches `book.json` + lazy-loads
page PNGs from the same CDN base.

### Error handling

- WebView `onError`/`onHttpError` → inline retry message (localized), not a blank screen.
- Offline / CDN miss → same error state; images are lazy so partial load degrades gracefully.

## Testing (coverage ≥95% maintained)

- `ComicReaderScreen.test.tsx`: renders `ReaderHeader` with the comic title; `WebView`
  receives the correct `uri` from `comics.ts`; error state renders on `onError`.
  (`react-native-webview` is mocked — mock already exists in `__mocks__/`.)
- `comics.test.ts`: registry shape + `balakanda-v1` url is the CDN https URL.
- Kids library: tapping `kids-story-comic-balakanda` navigates to `ComicReader` with the id.

## Docs sync

- `design.md`: add a numbered section for the in-app comic reader surface (per design-doc-sync rule).
- No RULEBOOK content-contract change (not a new verse content section; it's a hosted reader).

## Delivery

`eas update` from this repo. `app.json` is at version **1.5.2** with
`runtimeVersion: { policy: "appVersion" }` → the update targets runtime **1.5.2**. Since 1.5.2
is not yet in the stores, only a preview/dev build on 1.5.2 receives it — "not live to anyone
yet", exactly as requested. Confirm a 1.5.2 build is installed on the target device before push.

## Caveats (accepted by user)

- **Hindi-only.** `book.json` + the reader render Hindi narration/dialogue only; `en/gu/kn`
  are "pending". The card and comic will be Hindi text while the rest of Kids is 4-language.
- **Draft status.** `book.json` status is `local-authoring-draft`; no independent editorial or
  on-device Standard/Large review yet. Acceptable because delivery is scoped to the unreleased
  1.5.2 runtime (not public).
