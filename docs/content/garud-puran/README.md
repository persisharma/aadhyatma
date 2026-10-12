# Garud Puran source collection

Collected 2026-10-01 for a future Vedansh reader. **Data acquisition only: no app
integration, no generated scripture, and no publication-ready bilingual corpus.**

## Smaller selection gathered on 2026-10-12

The current product direction is **गरुड़ पुराण — चयनित कथाएँ और शिक्षाएँ /
Garud Puran — Selected Stories and Teachings**. Start with twelve short readings,
with a proposed reading time of 3–5 minutes each (roughly 36–60 minutes total).
Those are future editorial-reading targets, not measured times for the raw passages.

The [selection manifest](curated-selection.json) contains twelve actual source
extracts' locations, headings, page provenance, reasons for selection, and gaps.
Local Hindi HTML/text passages are in `tmp/garud-puran/selected/`; the standalone
handoff is `tmp/garud-puran/garud-puran-selected-sources.zip`.

| Group | Selected subjects |
| --- | --- |
| Everyday teachings | Karma and its consequences; giving; the value of human life; discernment, good company and liberation |
| Stories | Babhruvahana and Sudeva; the Brahmin and five pretas; King Viravahana; Sita's vision of the ancestors |
| Traditional context | Shraddha; rites after death; Yama and the fruits of action; Vaitarani |

For the later reader, lead with everyday teachings and Babhruvahana; put detailed
ritual material and graphic afterlife descriptions behind optional deeper reading.
Each story should retain its source's narrative and a clearly labelled editorial
explanation. The Viravahana passage includes a Narada episode; it is a deeper-read
candidate. Sita's story must be attributed to this Garud Puran telling, not labelled
as a Valmiki Ramayan episode without separate verification.

**What “important” means here:** this is an editorial selection supported by
traditional subject matter, not a measured ranking of the most popular stories.
The [1911 Saroddhara introduction](https://sacred-texts.com/book/the-garuda-purana/introduction)
attests funeral use historically. Its [16-chapter contents](https://sacred-texts.com/book/the-garuda-purana/contents)
and [TTD's institutional digest](https://ebooks.tirumala.org/downloads/garudapuran.pdf)
support prioritising death/ancestor traditions alongside liberation. They do not
establish that every family follows the same rites. Saroddhara is a distinct digest,
not the full Purana; its chapter numbers are only related-reading pointers here.

**Captured:** 12 heading-bounded Hindi research passages spanning parts of 59
distinct source pages, including four stories. The original OCR wording, headers
and footnotes remain. The Hindi contents list and the body pagination disagree;
selection uses headings actually found in the body, not an assumed page offset.
English Saroddhara references were opened online for comparison, but direct local
download returned HTTP 403; this packet does not contain English translations.

**Still pending:** print/OCR collation, independent verification, reuse clearance,
and concise Hindi/English editorial readings. There are no newly authored meanings
or verified verses in this packet. All items remain `releaseEligible: false`.
The abridgement's historical social prescriptions, disease/karma claims and
afterlife imagery must not become unqualified present-day advice. Preserve ritual
variants and distinguish educational explanation from a family-specific vidhi.

Rebuild from the existing collection:

```sh
tmp/garud-puran/.venv/bin/python scripts/select-garud-puran.py
```

The downloaded files and extracted data are in [`../../../tmp/garud-puran/`](../../../tmp/garud-puran/).
That directory is intentionally Git-ignored under the repository's existing
research-artifact rule. This documentation, the source URLs, the collector and its
tests can be versioned without committing third-party scans or unverified text.
Keep the local research directory when handing this work to another task; Git
alone will not transfer it. The collector can also fetch the sources again.

## What was gathered

| Collection | Actual coverage | Local files, relative to `tmp/garud-puran/` |
| --- | --- | --- |
| Sanskrit, Devanagari | 11,979 numbered source records, 11,963 unique references, in 317 chapter groups across three books | `extracted/sanskritdocuments-records.jsonl`; `extracted/sanskritdocuments/book-N/chapter-NNN.json` |
| Sanskrit, Roman transcription | GRETIL's corresponding three-book text, independently preserved as a related source transcription | `extracted/gretil-records.jsonl`; `extracted/gretil/book-N/chapter-NNN.json` |
| Missing chapter candidate | 19 verses for Achara chapter 62 from Wikisource, kept separate | `extracted/supplemental/wikisource-chapter62.json` |
| Sanskrit + Hindi, Shriram Sharma edition | Both DLI volumes, 479 + 477 = **956 scan pages**; original PDFs, OCR text/XML, and page JSONL | `raw/hindi-dli-vol1.pdf`, `raw/hindi-dli-vol2.pdf`; `extracted/hindi-sharma-vol1-pages.jsonl`, `extracted/hindi-sharma-vol2-pages.jsonl` |
| Hindi, Gita Press abridgement | **634/634 pages**, with 275 contents entries | `extracted/hindi-abridged-pages.jsonl`, `extracted/hindi-abridged-contents.json` |
| English, M. N. Dutt 1908 | Original Cornell OCR, **800 scan pages**; contents list 248 chapters | `raw/dutt-original-ocr.txt`, `raw/dutt-original-pages.xml`, `extracted/english-dutt-pages.jsonl`, `extracted/english-dutt-contents.json` |
| Sanskrit + English, later volume II | **494-page PDF**, including inspected Preta and Brahma samples; original OCR also saved | `raw/dutt-vol2.pdf`, `raw/dutt-vol2-ocr.txt` |

Counts describe the downloaded editions, not the traditional 19,000-verse count
or a guarantee that every canonical verse has been acquired. All extracted
records carry `releaseEligible: false`. There are currently **zero aligned
`meaningHi` / `meaningEn` verse records**: translations have been collected as
source pages, not automatically joined to Sanskrit verse numbers.

## Sources and edition boundaries

1. [SanskritDocuments](https://sanskritdocuments.org/doc_purana/garuDapurANa.html)
   credits GRETIL. Its three books contain 239 populated Achara chapter groups
   (numbered through 240, with 62 explicitly `MISSING`), 49 Dharma/Preta groups,
   and 29 Brahma groups. Its personal-study/research restriction is preserved in
   the raw HTML; commercial redistribution permission is not established.
2. [GRETIL](https://gretil.sub.uni-goettingen.de/gretil/corpustei/transformations/html/sa_garuDapurANa.htm)
   identifies the Venkatesvara Steam Press edition or a reprint, with Sansknet
   transcription and CC BY-NC-SA 4.0 terms. GRETIL and SanskritDocuments are
   **not two independent attestations** of the text.
3. [Wikisource chapter 62](https://sa.wikisource.org/wiki/गरुडपुराणम्/आचारकाण्डः/अध्यायः_६२)
   supplies a separate 19-verse candidate for the upstream gap. Its colophon
   names the same chapter subject. It has not been merged: printed-edition
   verification and collation remain outstanding. Raw API wikitext is saved.
4. Shriram Sharma's Sanskrit/Hindi edition is available through the Digital
   Library of India scans of [volume I](https://archive.org/details/in.ernet.dli.2015.312987)
   and [volume II](https://archive.org/details/in.ernet.dli.2015.312988). The catalog
   dates them to 1968. PDF and OCR page counts agree at 479/477; catalog descriptions
   instead say 481/479. Preserve this discrepancy rather than invent two missing
   pages. Sample scans show the paired Sanskrit/Hindi layout; the OCR is noisy.
   Full chapter coverage, numbering alignment, and reproduction rights need review.
5. [BharatKosha's Hindi Gita Press volume](https://bharatkosha.org/hi/granth/garuda-puran-gita-press)
   has a cover explicitly saying **संक्षिप्त गरुडपुराण**, code 1189, Hindi only.
   Do not turn these pages into supposed complete verse meanings. Page 2 contains
   an OCR placeholder for a blank image; this is flagged. The site's CC BY-SA
   footer and archive uploader license statements do not establish the original
   publisher's permission for every underlying translation.
6. [Dutt's 1908 Cornell scan](https://archive.org/details/cu31924023202819) is the
   source of the saved English OCR. It has a no-known-US-copyright-restrictions
   notice. The [Wisdom Library contents](https://www.wisdomlib.org/hinduism/book/the-garuda-purana-dutt)
   give 248 chapters of the Purva/Achara text. That numbering is not the same as
   GRETIL's 240, and this volume is not a translation of all three GRETIL books.
   Direct chapter download returned HTTP 403, so the original archive OCR was
   collected instead; no claim is made to have downloaded the cleaned website text.
7. [The later volume II](https://archive.org/details/TheGarudaMahapuranamVol.IIM.N.Dutt)
   is attributed to Dutt by the archive. Its inspected publisher page says New
   Bharatiya Book Corporation, first edition 2007, **all rights reserved**.
   Preta chapter 7 and Brahma (Moksha) chapter 25 were visually confirmed in
   Sanskrit/English. Treat this as a research scan pending rights and edition
   review, not as a cleared extension of the 1908 translation. Existing OCR
   badly corrupts the English and needs re-extraction before meaningful use.

## Data integrity and handoff

- [`coverage-report.json`](../../../tmp/garud-puran/coverage-report.json) records
  counts, missing chapter numbers, duplicate references, and differences between
  the two Sanskrit transcriptions. The source's `3.28.1130` label is an outlier:
  numeric gaps are not automatically evidence of hundreds of missing verses.
- [`source-manifest.json`](../../../tmp/garud-puran/source-manifest.json) records
  source URLs, retrieval timestamps, bytes and SHA-256 hashes. Every raw download
  also has a `.meta.json` sidecar. The collector rejects changed cached bytes.
- Sanskrit `sourceSpan` fields preserve all characters between numbered markers,
  including speakers, invocations and colophons. These are research spans, **not
  clean verse-line arrays**. Source suffixes such as `*1` and duplicate reference
  labels are preserved. Concatenating the spans and trailing text reproduces the
  extracted source exactly.
- Page JSONL uses zero-based `scanIndex` for archive OCR, and one-based `page`
  for BharatKosha. Neither is a Sanskrit verse identifier or a printed-page join.
- [qa-review.json](qa-review.json) records exact PDF hashes and the sample pages
  visually inspected. Sample inspection does not certify a whole volume.
- Before integration: choose a base edition, collate anomalies against scans,
  establish reuse rights, clean OCR, then align and review Hindi/English meanings
  by verse. Do not substitute the abridgement or modern scan OCR automatically.

## Reproduce

From the repository root (Python 3):

```sh
python3 -m venv tmp/garud-puran/.venv
tmp/garud-puran/.venv/bin/python -m pip install beautifulsoup4
PYTHONDONTWRITEBYTECODE=1 tmp/garud-puran/.venv/bin/python scripts/gather-garud-puran.py --fetch
PYTHONDONTWRITEBYTECODE=1 tmp/garud-puran/.venv/bin/python -m unittest discover -s scripts/tests -p 'test_gather_garud_puran.py'
```

Omit `--fetch` to regenerate extracted records and reports from saved raw sources.
PDF visual review additionally used `pypdfium2` and `pillow`. The collector never
modifies `mobile/` or activates content. App tests and device E2E are not applicable
to this acquisition-only change; parser tests and source-coverage checks are.

## Selected-reading integration (12 October 2026)

The later user-approved scope is now implemented as **12 selected editorial readings**, with 28 Hindi/English prose pages and nine illustrations. See [INTEGRATION.md](INTEGRATION.md), [the source comparison](selected-readings-review.json), and [the interactive preview](preview.html). This is a separate artifact from the raw acquisition above: the original corpus remains unverified and is not bundled or certified by the new selection. The acquisition-only test statement above applies to the collector, not to this later app change.
