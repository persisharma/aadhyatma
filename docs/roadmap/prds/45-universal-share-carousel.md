# PRD-45 — साझा करें, हर जगह · Universal Share + Multi-page (Carousel) Cards

| | |
|---|---|
| **Status** | **Built on `claude/multi-page-card-sharing-nk3nn1`** — Phases 0–3 as amended in §9. Phase 2 needs a store build (native module + Info.plist key); everything else ships OTA and degrades cleanly on an older binary. |
| **T-shirt size** | Phase 0: S · Phase 1: M · Phase 2: M (store build) · Phase 3: S each. |
| **Parent** | PRD-05 share-verse (design.md §39). Extends `ShareProvider` / `useShare()`; does not replace the Jyotish (§51/§58/§61) or Muhurat (§60) capture paths. |
| **Prototype** | [`docs/share-carousel-prototype.html`](../../share-carousel-prototype.html) — reader → sheet → pages strip → preview → single-page OS share / carousel save-to-Photos → saved state. The paginator in it is the algorithm proposed in §5, running live on the bundled Chhath katha. The prototype predates §9: its Photos-permission and saved screens were replaced by the hand-off view before the OS sheet. |
| **Feasibility** | Phase 0–1 and 3: pure JS/TS on the existing `react-native-view-shot` + `expo-sharing` stack — **OTA-shippable**. Phase 2 needs `react-native-share` (multi-file share sheet) and the add-only `NSPhotoLibraryAddUsageDescription` — **store build**. (`expo-media-library` was planned and dropped — §9.) |

> **Design intent.** Two complaints, one root cause. (1) The ↗ share button exists on the 20 verse readers, Daily Bhakti and Japam, and on nothing else — kathas, Theerth, Daan/Pitru teaching, Vidhi mantras and Ask answers cannot leave the app as a card. (2) When the text is longer than one card, there is no way to make a series. Both come from `ShareableVerse` being verse-shaped: a fixed 540×675 card with a verse block and an optional meaning. This PRD generalises the *content* (`ShareableContent`), keeps the *card chrome* (§39 header · ornament · branding footer), and adds a paginator so long prose becomes N cards with a page index — then gives Instagram what it can actually take.

---

## 0. The honest constraint (read first)

**Instagram accepts one image per share intent.** *[strong inference — from platform behaviour; not re-verified on a device this session.]* The share extension takes a single image into Feed or Story. There is no intent that creates a carousel, on iOS or Android, from any app. A "Share carousel to Instagram" row that hands over N files would post page 1 and silently drop the rest — the same class of failure §39 recorded for the pre-filled caption.

Therefore the carousel feature is defined as: **render every page → save all of them to the Photos library (album "Vedansh") → copy the caption → tell the reader to pick "Select multiple" in Instagram.** The hand-off is manual by necessity and the UI must say so on screen, or the button reads as doing nothing.

Second constraint: `expo-media-library` is not in `mobile/package.json`; `expo-sharing` (present) shares one file at a time; RN `Share.share` on iOS takes one `url`. So multi-file output of any kind — to Instagram *or* WhatsApp — is a native dependency and a store build. Everything else in this PRD is OTA.

## 1. Problem

| Surface | Content today | Share today |
|---|---|---|
| Vrat Katha reader (85 kathas, `panchang/kathaContent/entries`) | sections → 3–4 paragraphs each | none |
| Daan katha · Pitru katha (10 + 10) | sections + one-line `teachingHi/En` | none |
| Pitru परिचय lessons | paragraphs | none |
| Daan / Pitru principles | shloka · IAST · meaning | none — despite matching `ShareableVerse` field for field |
| Vidhi conduct step `mantra` | Devanagari · IAST | none (samagri list is text-shared only) |
| Theerth detail · Deity essay | significance · origin story · sections | none |
| Observance detail · Ask answers | short structured facts / short answer | none |
| Pitru Smaran records | — | none, **by design** (§63) — stays that way |

And on the 22 surfaces that do share: the card fits a verse, so a reader who wants to send a whole katha section takes screenshots.

## 2. Goal

1. Every surface that shows a *content unit* (verse, mantra, principle, katha section, essay) carries the same ↗ button and the same target sheet.
2. When the unit does not fit one card, the sheet shows the pages, lets the reader trim them, and offers the carousel path that actually works.
3. The single-verse flow stays **byte-identical** to §39 today — no strip, no extra rows, no new chip when there is one page. This is the acceptance test that the change is additive.

## 3. UX (what the prototype shows)

### 3.1 Button
`ShareButton` unchanged (§39: 34×34 circle, `↗`). Placement rule: **on the content unit, not the screen.** Katha / essay readers: header row beside Bookmark, as every reader. Vidhi conduct: in the mantra card's label row — the unit shared is the mantra, not the step. Labels: `Share katha` / `Share mantra` / `Share teaching` (stable English a11y labels, localized visible text via `pick`).

### 3.2 Target sheet (`ShareTargetSheet`) — additive changes only when `pages.length > 1`
Structure (top to bottom), new items **bold**:

1. Title — `कथा साझा करें` / `Share this katha` (kind-aware; verse keeps `श्लोक साझा करें`).
2. **Sub-line** — "Too long for one card — split into a series".
3. **Pages strip** — eyebrow `PAGES · 7`; on katha surfaces a two-way segment **This part | Whole katha** (re-paginates); a horizontal row of 72×90 thumbnails (real card composition at 0.133 scale), each with a page number and a tick. **Tap = highlight** (the page the single-page rows will export); **tap the highlighted one = toggle include**. At least one page stays selected. Meta line: `3 selected · page 1 highlighted` and **Preview ›**.
4. **Truncation notice** (only when the whole-katha scope exceeds `MAX_PAGES`): "The whole katha does not fit in 10 pages — pick one part." Scope defaults back to the section.
5. Row **Share** — unchanged; gains a trailing `page N` chip when multi-page; exports the highlighted page.
6. Row **Instagram post** — unchanged + `page N` chip.
7. Row **Instagram story / reel** — unchanged + `page N` chip.
8. **Row Instagram carousel** — `▤` glyph, "Save 7 pages to Photos, then 'Select multiple' in Instagram", trailing hot chip `7 pages`. Phase 1 ships this row **disabled** with sub-label "Coming in the next app update" so the affordance is discoverable before the store build lands; Phase 2 enables it.
9. Copy note + hashtag preview + Cancel — unchanged.

### 3.3 Preview screen (new, modal over the sheet)
Header: `‹` · `Page 3 / 7` · include toggle `✓/○`. Body: the card at export composition scaled to width, `‹ ›` paging, status line "In the series / Left out", primary button "Continue with this page highlighted". Reading a thumbnail is not a decision; this is where the reader decides.

### 3.4 Single-page export when multi-page
Share / Post / Story export only the highlighted page, at 1080×1350 or 1080×1920 exactly as §39. Caption gains ` · page 3/7` after the header so a lone page still says where it came from.

### 3.5 Carousel export (Phase 2)
1. First use → OS permission prompt, **add-only** (`NSPhotoLibraryAddUsageDescription`: "Saves the pages of this katha as images so you can post them together. Vedansh never reads your photos."). Android 10+ needs no runtime permission to write the app's own images via MediaStore *[strong inference]*; API < 29 needs `WRITE_EXTERNAL_STORAGE`.
2. Denied → toast "No Photos access — allow it in Settings, or share one page"; sheet stays open.
3. Granted → **exporting** screen: "Rendering page 3 of 7…" with a progress bar. Pages are captured **sequentially** through the one off-screen mount (`setPending` → `waitForLayout` → `captureRef` → `MediaLibrary.saveToLibraryAsync`/`createAssetAsync` + `addAssetsToAlbumAsync('Vedansh')` → next). Never N mounts at once — a 1080×1350 bitmap is ~5.8 MB and §39.3 already names memory as a suspect.
4. **Saved** screen: album card (stacked thumbnails · "7 pages saved to Photos" · "Album 'Vedansh' · caption + hashtags copied"), heading "Now build the carousel in Instagram", the three steps (New post → Select multiple from album Vedansh → paste caption), primary **Open Instagram** (the existing https profile URL from `shareLinks.ts` — no new URL scheme, no `LSApplicationQueriesSchemes` change), secondary **Later**. Footnote: pages stay in Photos, so they can also go out together on WhatsApp.

### 3.6 Card (`ProseShareCard`, new; `ShareCard` untouched)
Same 540×675 chrome as §39: header band (13 `cardLatin` 2.4 tracking, or the Devanagari face for `hi`), `॥` ornament, branding footer, source sketch behind (`getReaderBackground` for sources that have one; `getTheerthBackground` for temples; gradient fallback). Body: optional **title** on page 1 only (22/30 Devanagari · 24/30 Cormorant, `ink`), then paragraphs at **18/30 Devanagari · 19/29 Cormorant**, left-aligned, `ink`, 12 gap. A paragraph continued from the previous page opens with `…`. When `total > 1`: bottom-right **page index** (dots + `3/7`, 12 Inter, `saffron-deep`); bottom-left **continuation cue** `आगे पढ़ें →` / `continues →`, last page `॥ समाप्त ॥`. When `total === 1` neither renders. Font sizes are fixed (§39's rule: never `adjustsFontSizeToFit` with a fixed `lineHeight`); fit is guaranteed by the paginator, verified by tests.

## 4. Data model

```ts
// utils/shareVerse.tsx
export type ShareableProse = {
  kind: 'prose';
  sourceId: string;            // background plate + hashtags (registry id, katha id, temple id)
  stanza?: number;
  sectionNameHi: string; sectionNameEn: string;   // header band left part (e.g. 'व्रत कथा')
  labelHi: string; labelEn: string;               // header band right part (e.g. 'छठ पूजा कथा · खंड १/४')
  titleHi?: string; titleEn?: string;             // page-1 title
  parasHi: string[]; parasEn: string[];
  scopes?: { id: string; nameHi: string; nameEn: string; parasHi: string[]; parasEn: string[] }[]; // optional alternative scopes (e.g. whole katha)
};
export type ShareableContent = ({ kind?: 'verse' } & ShareableVerse) | ShareableProse;
share(content: ShareableContent, lang: Lang, opts?: ShareOptions): void;   // existing callers unchanged
```

`gu`/`kn` follow the existing rule: paragraphs are `contentByLang`-rescripted from `parasHi`; the paginator uses the `hi` metrics × 0.9 chars-per-line until measured (transliterated Devanagari runs longer).

## 5. Paginator (`utils/shareCardPages.ts`, pure, tested)

Geometry is known, so the budget is arithmetic (the `fitMeaningType` precedent, §39):

| Constant | Value | Source |
|---|---|---|
| Body box | 484 × 470 dp | 540×675 − 28/28/22 padding − header 31 − ornament 36 − footer 88 |
| Lines/page | 15 (`hi`, 30 lh) · 16 (`en`, 29 lh) | `floor(470 / lineHeight)` |
| Chars/line | 44 (`hi`, 18 pt Noto Serif Devanagari) · 54 (`en`, 19 pt Cormorant) | conservative estimate; tune from `shareCardFit`-style render tests |
| Title cost | `wrapLines(title, titleCpl) × (30/lh) + 0.4` lines, page 1 only | |
| Paragraph gap | 0.5 line | 12 dp / 30 |
| `MAX_PAGES` | 10 | Instagram allows 20; nobody reads 20 parchment pages. Over the cap → `truncated: true`, sheet demands a narrower scope |
| Widow rule | last page < 3 lines → move the previous page's last sentence forward | |

Algorithm: split paragraphs into sentences at `। ॥ . ? !` (fragments under 6 chars merge back); greedy-pack sentences into pages against the line budget using a word-wrap line estimator; a sentence that would overflow starts the next page and is marked `cont` (renders the leading `…`); apply the widow rule. Deterministic: same text + language → same pages, so a re-share reproduces the series. Output: `{ pages: { title?: string; chunks: { text: string; cont: boolean }[]; lines: number }[]; truncated: boolean }`.

Tests: `utils/__tests__/shareCardPages.test.ts` (budget math, sentence split incl. Devanagari dandas, cap, widow rule, determinism, every bundled katha section paginates without truncation at section scope) and `components/__tests__/proseShareCardFit.test.tsx` (each page's rendered `Text` count × lineHeight ≤ body box; no auto-fit props; upright Indic).

## 6. Phases

**Phase 0 — button on verse-shaped content · S · OTA.** `ShareButton` + `useShare()` on Daan/Pitru principles (`DaanPrincipleEntry`, `PitruPrincipleEntry` → `ShareableVerse`: verseLines/iastLines/meaning/cite) and on the Vidhi conduct step mantra (`VidhiMantra.devanagari/iast`). Zero new UI. Fix design.md §39's stale "all 15 reader screens" (22 callers) in the same PR.

**Phase 1 — prose card + paginator + single-page export · M · OTA.** `ShareableProse`, `ProseShareCard`, `shareCardPages.ts`, the pages strip / preview / `page N` chips in `ShareTargetSheet`, the disabled carousel row. Buttons on Vrat Katha reader, Daan katha, Pitru katha, Pitru परिचय, Theerth detail, Deity essay. Caption ` · page N/M`. Hashtags: prose sources map to the registry (`library` for texts; katha → its observance's deity via `deityEn`; temple → presiding deity) so §39.2's five slots keep working.

**Phase 2 — carousel = save to Photos · M · store build.** `expo-media-library`, permission strings, sequential capture loop, album "Vedansh", exporting + saved screens, Open Instagram. Enable the row. Store-gate the row on `MediaLibrary` being linked (the §-Vastu pattern: Phase 1 OTA renders disabled until the native module reports present).

**Phase 3 — new card kinds · S each · OTA.** Festival greeting card from Observance detail (name · date · a line from the katha); Ask answer card; Bhog list card. Each is a new `kind`, not a new sheet.

## 7. Verification (RULEBOOK gates)

- Jest: the four suites above + `shareVerseTarget.test.tsx` extended for `page N` capture, multi-page caption, and that a one-page verse produces no strip and no carousel row (snapshot of the sheet's row labels equals today's).
- Maestro: `share-katha-smoke.yaml` — Katha library → a katha → `Share katha` → asserts `Pages`, the four rows, `Preview ›`; `share-target-smoke.yaml` unchanged and still green (regression for §2 goal 3).
- Device check before Phase 2 ships: sequential export of 10 pages on a 3 GB Android without a `captureRef` failure; Photos album appears; Instagram "Select multiple" lists the pages in order (they are saved oldest-first so the album order matches page order — verify).
- design.md: §39 gains §39.4 Prose card, §39.5 Pages strip + preview, §39.6 Carousel export; §33 (Vrat Katha reader) and the Theerth/Daan/Pitru sections gain a one-line "carries `ShareButton`". RULEBOOK §1 checklist row "share": every content section must name its `ShareableContent` mapping.

## 8. Risks

- **Memory** during sequential capture on low-end Android — mitigated by one mount at a time and freeing each temp file after the save; still device-test.
- **Chars-per-line drift** on gu/kn and on paragraphs heavy in conjuncts — tune the constants from render tests; never fall back to platform auto-fit.
- **Photos permission denial** — inline recovery path (Settings) and the single-page fallback; never a dead end.
- **Instagram behaviour change** — if Instagram ever accepts multi-image intents, the saved-state screen becomes optional; the paginator and Photos save stay useful (WhatsApp albums).
- **Scope creep into the Jyotish/Muhurat capture paths** — out of scope; they keep their own sheets.

## 9. As built (Sept 2026) — what changed from the plan above

The code is canonical; design.md §39.4–§39.6 and RULEBOOK §3 carry the spec. Deviations from §§3–6, and why:

1. **No `expo-media-library`; the OS share sheet saves instead.** On Android 13+ its save path requires the `READ_MEDIA_IMAGES` grant, which Google Play has required a core-use justification for since May 2025 — a review risk for a devotional reader. `react-native-share`'s `open({ urls })` hands every page to one OS sheet: WhatsApp receives an album (the question raised in review), iOS offers its built-in "Save N Images" (add-only permission), and Instagram appears if it accepts multiple images. The carousel row therefore pauses on a **hand-off view** with the Select-multiple steps *before* the OS sheet, not after a Photos save. `utils/multiShare.ts` probes `TurboModuleRegistry.get('RNShare')` and lazily requires the package, so an OTA on an older binary shows both all-pages rows disabled ("Needs the latest app update").
2. **Latent iOS crash fixed on the way.** `app.json` had no `NSPhotoLibraryAddUsageDescription`, yet the single-card share already exposed "Save Image" in the iOS sheet. The key is now present; it ships with the Phase 2 store build.
3. **Pitru surfaces excluded.** design.md §74 locks "no share surface" for the पितृ पक्ष परिचय layer (and §63 for Pitru Smaran); §1's table listed them — they stay unshared, as does the personal-tithi Vidhi. **Deity essays** are one-line browse copy, not worth a card; skipped.
4. **Paginator constants are measured, not estimated.** 500 bundled katha paragraphs per language were laid out in Chromium at 484 dp with the app's TTFs; the per-language glyph advance is the smallest that never under-counts a paragraph, + 0.02 (hi 0.41 · gu 0.43 · kn 0.56 · en 0.44). The §5 table's 44/54 chars-per-line guesses over-counted by ~38 %.
5. **Over-cap scopes are not refused.** A scope longer than 10 pages still opens; the first 10 are pre-selected with a note, and the all-pages rows disable only if the reader selects more than 10.
6. **Phase 3 without new card kinds.** The festival day (Observance detail) and the Ask answer reuse the prose card — every line is verified content the screen already renders; no authored greeting copy. A Bhog-only card was not built: the offerings ride inside the festival-day card.
7. **Where the buttons are:** Vrat Katha reader (toggle row, left) · Theerth detail (top bar right) · Daan katha (header right) · Daan principle cards + journey शास्त्र card · Vidhi conduct mantra label row · Observance detail (top bar right) · Search's Ask answer card.

**Not verified in this environment (needs a device before the store release):** capture of a 10-page series on a low-memory Android; `react-native-share` multi-file on both platforms (it autolinks; no config plugin is used); whether Instagram's share target accepts the multi-image set on current Instagram builds; the Maestro flow `share-katha-smoke.yaml` (no simulator here).
