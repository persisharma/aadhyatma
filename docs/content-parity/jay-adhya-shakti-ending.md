# Jay Adhya Shakti extended ending — 2026-10-18

The maintainer requested restoration of the familiar extended ending. Append
`jas-19`–`jas-21` after the existing eighteen stanzas; do not renumber or rewrite
`jas-01`–`jas-18`. The collection position remains 10. The JSON and both listing
counts now read 21. This single-reading aarti has no chapters manifest or generated
verse-count symbol; its registry count is maintained in `texts.ts`.

## Text and provenance

The base closing edition is Hindu Community Center, NJ's **Daily Prayers Hindi**,
printed page 17 (PDF page 19):
https://hindumandirnj.org/doc/Daily_Prayers_Hindi.pdf

Read the extracted text and rendered page. It prints the unity stanza, the
Vallabh Bhatt service stanza and the mandap stanza after the signature. Preserve
that order and those readings, with punctuation/word spacing aligned to the
existing Gujarati-to-Devanagari script-conversion convention.

Cross-checks read on 2026-10-18:

- https://www.swargarohan.org/aarti-stuti/001 — the unity/bhavsagar stanza, with
  `એ બે એક સ્વરૂપ / અંતર નવ ગણશો` rather than the NJ reading.
- https://bharatlyrics.com/jay-adhyashakti-lyrics/ — Prakash Barot/Rekha Prajapati
  edition, all three closing stanzas in the same order. It uses `રાખ્યા` rather
  than NJ's `આપી` and `જય બહુચરી બાળા` rather than NJ's `જય બહુચર વાળી`.
- https://www.sundhamata.in/index.php — a temple-published service stanza, adding
  a request for the same service, and a different mandap stanza.

Do not mix these variant lines into the NJ edition. The NJ booklet also prints
a separate chundadi stanza; it is an additional extension, outside the three
stanzas requested here. Do not attribute every extended stanza to Shivanand Swami.
Meanings in Hindi, English and Gujarati are editorial. English verse lines are
pronunciation-based romanization, following design.md §3.1.

The earlier **whole-body** two-source collation remains Pending. Its existing
maintainer attestation and candidate-edition URLs stay intact; closing-stanza
references live in `source.closingStanzas`, so this check does not falsely clear
that older outstanding work.

## Validation

- Focused regression suite: 3 tests pass, including exact closing anchors,
  stable original-eighteen SHA-256, IDs/index, counts, meanings, English parity,
  Devanagari grammar and Gujarati/Kannada script conversion.
- Before-fix check: the suite fails against the original 18-stanza payload.
- Existing content-correctness expectations now pin the extended ending;
  `test:data` includes the focused suite.
- `aarti-smoke.yaml` now pages through the preserved signature and all three
  additions, checking the last page in Hindi and English.
- Local test runtime: Node 24's TypeScript stripping with an extension resolver;
  CI uses the repository's existing `tsx --test` command.
- Full `npm test` was attempted but stopped at typecheck: `tsc: not found`.
  Dependencies/full checkout were unavailable locally; CI must supply full-suite
  evidence. No iOS/Android emulator, adb or Maestro was available, so the updated
  native flow is **authored, not executed**. Native visual/E2E checks at Standard
  and Large, including regional-script rendering, remain pending before merge.

Keep the PR draft until the repository's full test and native verification
requirements are satisfied. No build, OTA or release was requested or performed.
