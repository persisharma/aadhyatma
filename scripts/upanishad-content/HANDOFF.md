# Upanishad batch handoff

Standing instruction from the owner: author all 108 Muktikā Upanishads with full
content, **five per session, strictly in Muktikā order** (size does not matter),
each batch in its own fresh session. No "coming soon" framing beyond rows not yet
authored.

## Batch protocol (one session = one batch of 5)

1. Read `wiki/index.md`, `wiki/subsystems/readers.md` (Upanishad gotchas), RULEBOOK §0.1,
   §11.12, §11.14, and one finished module (e.g. `shvetashvatara.mjs`, `aitareya.mjs`
   for 3-level `khandas`) to copy the exact shape.
2. First `git fetch origin claude/upanishad-granth-app-qu2jaa` and fast-forward — a
   chained session's checkout can predate the parent's push, and a stale Progress line
   makes you redo the previous batch. Then pick the next 5 unshipped ids in `mobile/src/data/upanishad/registry.ts` order
   (shipped = a `<slug>.mjs` exists here). Author `scripts/upanishad-content/<slug>.mjs`
   for each: `{slug, muktika, vedaHi, vedaEn, source{…}, shanti: M(lines, hi, en),
   mantras | khandas}` with `const M = (lines, meaningHi, meaningEn) => ({ lines,
   meaningHi, meaningEn })`. Full text, every mantra, Hindi + English meaning.
   The network policy blocks the Sanskrit source hosts, so record in `source.notes`
   that a line-by-line scan check is owed.
   If a helper agent reports it could not recall a passage and wrote a "stand-in" or
   "reconstruction", never ship it as text: recover the genuine passage or leave the
   whole text for later — and name the least-certain passages in `source.notes`.
   A held-back text is skipped (not blocking): take the next unshipped id so the batch
   still ships five, and list the held id under "Held" below. Partial drafts go in
   `drafts/` (the build ignores subfolders) — never ship one until its gaps are filled.
3. Build from repo root: `npx --prefix mobile tsx scripts/build-upanishad.mjs`.
4. Gates (in `mobile/`): `npx tsc --noEmit`, `npm run lint` (0 errors),
   `npm run test:data` (only the pre-existing `launchGraph` byte-budget failure is
   allowed — never raise that budget), and
   `npx jest --config jest.config.js --runInBand src/screens/__tests__/UpanishadReaderScreen.test.tsx src/data/__tests__/devanagariWellFormed.test.ts`.
5. Update pins to the new totals / readable set:
   - `mobile/src/data/__tests__/contentCorrectness.test.ts` (sub regexes, manifest list,
     per-text sectionCounts)
   - `mobile/src/data/chapteredTotals.test.ts` (upanishad expectedTotal)
   - `mobile/src/data/__tests__/searchIndex.test.ts` (page count, readable id set)
   - `mobile/src/screens/__tests__/UpanishadReaderScreen.test.tsx` (sparse next/prev asserts)
   - `mobile/.maestro/granth-smoke.yaml` (coming-row example = first unshipped id)
   - `mobile/src/data/tour/whatsNew.ts` (1.4.8 body, hi + en)
   - `design.md` §75 (prose counts, table rows, "all N pages"), data-shape families line
   - wiki: `readers.md`, `overview.md`, append `log.md`
   - the "Progress" line below
6. Commit on `claude/upanishad-granth-app-qu2jaa`, push `git push -u origin
   claude/upanishad-granth-app-qu2jaa`. No PR. No model ids in committed files.
7. Chain: call `create_session` (claude-code-remote MCP; same environment,
   `source_url` https://github.com/persisharma/aadhyatma, `source_revision` and
   `outcome_branch` = `claude/upanishad-granth-app-qu2jaa`) with the prompt:
   "Do the next Upanishad batch: follow scripts/upanishad-content/HANDOFF.md exactly,
   then chain the following session." Stop chaining once all 108 are shipped.

## Progress

Shipped (30/108): 1–25, 28, 31, 32, 34, 36. Next batch: the next five unshipped
ids after 36 — 37 Tejobindu, 38 Nadabindu, 39 Dhyanabindu, 40 Brahmavidya,
41 Yogatattva (skip any that cannot be recalled in full; take the next id).

Held (full printed wording not recallable offline; the source hosts are blocked —
ship only once a printed text is supplied in the repo or network access allows it):
26 Brihajjabala (brāhmaṇas 2–8), 27 Nrisimhatapani (most of both parts),
29 Maitreyi (draft in `drafts/maitreyi.mjs`: one adhyāya-2 mādhūkara verse missing,
1.2–1.3 prose uncertain), 30 Subala (khaṇḍas 4, 9–11, 16), 33 Sarvasara
(¶11–12 and closing ślokas), 35 Shukarahasya (nyāsa sections, verse sets, close).
