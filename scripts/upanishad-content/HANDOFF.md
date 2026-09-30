# Upanishad source review and release

The 108 Muktikā titles in `mobile/src/data/upanishad/registry.ts` are a catalogue,
not 108 verified texts. As of 2026-09-30, **zero texts are released**.
Open PR #398 has 30 candidate modules, but much of its Sanskrit was written
from memory and its source descriptions may name editions that were not opened.
Those modules are excluded from this branch and the mobile build. Treat the PR
as a research lead only; author text afresh from the historical scan and
independent sources.
The catalogue's order, Veda assignments and seven group assignments were
cross-checked against the [proofread Muktikā list](https://sanskritdocuments.org/doc_upanishhat/upanishad_list.html)
on 2026-09-30. That volunteer page explicitly restricts reposting its
transcription; it is a metadata cross-check here, not a text import.

Primary historical collection: [*Īśādyottaraśatopaniṣadaḥ* / Nirnaya Sagar
scan](https://archive.org/details/ishaetc108upanishadsnirnaysagar_202001/).
The Archive item lists a CC0 license and contains 573 PDF leaves. The scan itself
was opened on 2026-09-30; Īśā page 1 is PDF leaf 15, and its final two mantras
are on leaf 16. OCR is visibly corrupt even on those pages, so use the page
images, not the OCR, to establish the text. This is a source candidate for the
whole collection, not blanket proof that any of the 108 have been collated.
The Vedic Heritage Īśā page presents accented text in more than one block;
its mantra 16 formatting differs between blocks. Fix the chosen recension
before comparing or deriving `linesEn`, and record any substantive variant.

For each text:

1. Identify its exact PDF leaves and recension; transcribe every mantra from
   the image, with stable reference numbering. Check the complete text against
   two independent authoritative sources actually opened. Record variants and
   the reason for the chosen reading. The [Vedic Heritage Portal](https://vedicheritage.gov.in/hi/upanishads/ishavasyopanishad/)
   is an independent cross-check for the major Upanishads; it does not cover all
   108. Do not use Ishvar Vaani's proprietary content as a source.
2. Author Hindi and English meanings, then review each meaning against the
   Sanskrit and a published commentary. Gujarati/Kannada meanings need their
   own native-language review before being advertised as translations; a
   transliteration of Hindi is not a Gujarati/Kannada meaning.
3. Record the edition actually read in `source.baseText`, precise source URLs,
   `retrievedOn`, PDF leaves, recension/variant notes, named reviewer and date.
   Do not claim a Gita Press or other edition was checked unless its pages were
   opened. Add one entry to `release-reviewed.json` with `status: reviewed`,
   `slug`, `reviewer`, `reviewedOn`, `scanPages`, `referenceUrls` (two independent
   hosts), `completeTextCollated: true`, and `meaningsReviewed: true`.
4. Place the reviewed authoring module at the top level of this directory.
   `scripts/build-upanishad.mjs` refuses any top-level module lacking matching
   release evidence. From `mobile/`, run
   `npx tsx ../scripts/build-upanishad.mjs`, then `npm run build:library` and
   `npm run verify:library` from `mobile/`. The generated JSON is the only source the
   SQLite compiler accepts. Review the manifest, search index, and app count.
5. Run data, reader, and library tests. Run the reader and search journey on
   both iOS and Android simulators, including script rendering, language
   toggles, sharing, bookmarks, read-aloud and app restart. RULEBOOK §11.7
   prevents a content release until both platforms are verified.

Keep unavailable titles marked `coming`. Never fill a gap from memory, patch
OCR by guessing, or imply a partial text is complete. Release entries are an
auditable review record; a JSON flag or green unit test alone is not proof of
collation.
