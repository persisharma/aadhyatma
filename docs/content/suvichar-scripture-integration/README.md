# Suvichar catalogue integration

The app previously used 21 shared original thoughts, rotated across every deity. This change integrates all 600 approved catalogue entries and 21 approved app proposals as **621 short editorial meanings and narrative lessons**. Each keeps its stable review ID and source passage. The 400 greeting drafts and 37 research candidates are not silently promoted into this collection; the existing seven ready-made wishes remain available.

Daily cards and weekday cards select within the deity's collection. “Another thought” visits every entry in that collection; “Browse all thoughts” opens a searchable, virtualized list, including late catalogue IDs. A selected stable ID persists with favorites, including where several Hindi variants share an English sense. Reading-language changes re-render a selected entry in the new language. Edited wording loses its scripture label; earlier custom messages and legacy favorites are preserved.

References and meaning types appear on the native preview, image capture and text-share content. The source link opens the cited passage. Meanings, prayer meanings, hymn meanings and story lessons are not labelled as direct quotations. The 364 source locations and their edition/context caveats remain in `source-register.json`; its verification statuses are retained, not upgraded by tests. This integration does not establish independent scholarly acceptance or add new Sanskrit liturgical text.

The source register identifies Krishna's Gita teaching, Rama's dialogues and life episodes, Hanuman's devotional-text episodes, Shiva's Upanishadic context, prayers addressed to the goddesses, and Kapila's avatar connection for the Vishnu selection. Artwork forms follow their parent devotional family; source labels continue to name the actual text and speaker context, rather than inventing temple-specific quotations.

Annapurna has 51 entries including the app proposal, but no published master. Her explicitly text-only card uses native parchment, the real Vedansh badge and the normal measured capture gate. This is not an artwork fallback for existing deities: an existing deity's image failure still blocks capture. No image has been generated, uploaded or substituted. Saraswati's temple-arch card uses the reviewed 20 pt top inset to clear its painted border.

## Reproduction

`node scripts/build-suvichar-content.mjs` builds the runtime JSON from `reviewed-copy.json`, `source-register.json` and `source-meanings-en.tsv`. Hindi is preserved verbatim from the approved review. English is an independently authored source-level sense, so variants using the same passage can share English wording. Gujarati and Kannada follow the app's existing Hindi re-scripting policy.

## Validation

See the PR for the exact completed checks and pending native/export review. Unit checks exhaust catalogue coverage, deity isolation, complete daily and manual cycles in all four languages, repeated-English stable IDs, preference/favorite restoration, custom-edit attribution removal and reference-bearing capture props. They are not a substitute for native export or source-edition review.


Completed locally: 71 tests across seven focused suites; TypeScript; content-correctness validation; ESLint on the touched runtime files; deterministic regeneration; scoped Devanagari validation; Maestro YAML parsing. CoreText metrics cover all 621 Hindi and English messages at the unchanged 21 pt card size and 280.8 pt text width: every message uses one or two lines (`layout-check.json`). This models message typography, not native card/export acceptance.

The repository-wide Devanagari command reports 33 existing defects across six unrelated Ashtakam/Valmiki source files; none is in the new catalogue. The dedicated iOS simulator loaded this worktree's bundle initially, but the Maestro launch had a packager-location failure and its corrected retry found the device unavailable. Android/native export checks were not completed. Keep the PR in draft until native iOS/Android, Gujarati/Kannada, Large text and WhatsApp image/export review pass. No artwork publication, OTA or release is part of this change.
