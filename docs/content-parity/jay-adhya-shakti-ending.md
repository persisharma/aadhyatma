# Jay Adhya Shakti extended ending — 2026-10-18

The maintainer requested restoration of the familiar extended ending, then
corrected the order: display unity (`jas-19`) at 18, signature (`jas-18`) at 19,
service (`jas-20`) at 20 and mandap (`jas-21`) at 21. Keep IDs with their existing
text; number and label the pages according to the new display order. The first
seventeen positions and all original verse wording/meanings stay unchanged. The collection position remains 10. The JSON and both listing
counts now read 21. This single-reading aarti has no chapters manifest or generated
verse-count symbol; its registry count is maintained in `texts.ts`.

## Text and provenance

The base closing edition is Hindu Community Center, NJ's **Daily Prayers Hindi**,
printed page 17 (PDF page 19):
https://hindumandirnj.org/doc/Daily_Prayers_Hindi.pdf

Read the extracted text and rendered page. It prints the unity stanza, the
Vallabh Bhatt service stanza and the mandap stanza after the signature. Retain
the NJ readings, with punctuation/word spacing aligned to the
existing Gujarati-to-Devanagari script-conversion convention.

The maintainer's later explicit order correction takes precedence for the app:
unity → signature → service → mandap. The cited NJ/Barot publications use a
different order; do not present the chosen app order as universally canonical.

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
  stable first-seventeen SHA-256, IDs/index, counts, meanings, English parity,
  Devanagari grammar and Gujarati/Kannada script conversion.
- Before-fix check: the revised order suite fails against the merged 21-stanza
  payload with signature before unity, then passes after the swap.
- Existing content-correctness expectations now pin the extended ending;
  `test:data` includes the focused suite.
- `aarti-smoke.yaml` now pages through unity, signature, service and mandap, checking the last page in Hindi and English.
- Local test runtime: Node 24's TypeScript stripping with an extension resolver;
  CI uses the repository's existing `tsx --test` command.
- Full `npm test` was attempted but stopped at typecheck: `tsc: not found`.
  Dependencies/full checkout were unavailable locally; CI must supply full-suite
  evidence. No iOS/Android emulator, adb or Maestro was available, so the updated
  native flow is **authored, not executed**. Native visual/E2E checks at Standard
  and Large, including regional-script rendering, remain pending before merge.

Keep the PR draft until the repository's full test and native verification
requirements are satisfied. No build, OTA or release was requested or performed.
