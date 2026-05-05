---
description: Add a new content section to Aadhyatma following RULEBOOK.md (interactive scaffolder)
argument-hint: "[optional: section id, e.g. ramcharitmanas]"
---

# /add-section

You are scaffolding a new content section for the Aadhyatma React Native app. Read [`/RULEBOOK.md`](../../RULEBOOK.md) and [`/design.md`](../../design.md) **before** doing anything else. Everything below assumes you have read both. If you have not, stop and read them now.

You scaffold by **copying existing template files and renaming identifiers** — never by generating component or screen code from scratch. The three live sections (Hanuman Chalisa, Bhagavad Gītā, Sundarkand) are the only acceptable templates.

The user invocation may include a section id as `$ARGUMENTS` (e.g. `/add-section ramcharitmanas`). Treat it as a hint, not a contract — still confirm via Phase A.

---

## Phase A — Gather inputs

Use `mcp__conductor__AskUserQuestion` to collect inputs in batches. **One AskUserQuestion call per batch**, not per field.

### Batch A1 — Identity (mandatory)
Ask the user (in a single AskUserQuestion call where possible, or in plain prose if free-form text is needed) for:
- `id` (lowercase-hyphen, unique). Validate: not already in `mobile/src/data/texts.ts` `library` array. Read that file to check.
- `nameHi` (Devanagari title)
- `nameEn` (English title)
- `sub` (Devanagari listing subtitle, e.g. `40 चौपाई · अर्थ सहित`)
- `thumb` (single Devanagari glyph)

If `$ARGUMENTS` provided an `id`, pre-fill it and confirm rather than asking again.

### Batch A2 — Subsection structure (optional)
Ask: does this section have subsections (chapters / kāṇḍas / sargas)?
- **Options:** `none`, `chapters (Gita-style)`, `kand (Ramcharitmanas-style)`, `other` (user supplies term).
- If anything other than `none`: ask for the count and request a path to a JSON manifest file the user has prepared with `[{ index: 1, titleHi, titleEn, verseCount? }, …]`. If the user does not have one, offer to scaffold an empty manifest at `mobile/src/data/<id>/<id>-manifest.json` for them to fill in, then **stop and ask the user to fill it in before re-running** the command.

### Batch A3 — Content data (mandatory)
Ask the user for the path to a content JSON file already prepared with the verse data. Required shape per verse:
```ts
{ id: string; lines: string[]; meaningHi: string; meaningEn: string; commentaryHi?: string[]; commentaryEn?: string[] }
```
For chapter-based sections, the file is per-chapter; the user supplies one path or a directory containing `chapter-NN.json` files.

If the user has no content yet, scaffold an empty skeleton with a single placeholder verse and **stop**, asking the user to populate it before re-running. **Do not invent verse content.**

### Batch A4 — Background image (mandatory)
Ask the user to confirm they have placed at least one PNG/WebP at `mobile/assets/<id>/`. Use `Glob` with pattern `mobile/assets/<id>/*.{png,webp,jpg,jpeg}` to verify and list the files you found.

If zero images: stop. Tell the user to add at least one image satisfying `design.md` §6 (faded vintage sketch, ≈50 % opacity after sepia, subject top-anchored, bottom third clean) and re-run.

---

## Phase B — Validate

Run every check below. **All must pass** or stop and report which failed.

1. `id` is not present in the `library` array in `mobile/src/data/texts.ts`.
2. `mobile/assets/<id>/` exists and contains ≥ 1 image file.
3. The content JSON file the user supplied exists, parses as JSON, and every verse has non-empty `id`, `lines` (length ≥ 1), `meaningHi`, and `meaningEn`. Reject if any verse is missing one of those four.
4. If subsections were declared: the manifest file exists and every entry has `titleHi` and `titleEn`.
5. There is no existing screen file at `mobile/src/screens/<Pascal>ReaderScreen.tsx` (avoid clobbering).

`<Pascal>` = `id` converted to PascalCase. Compute it once and reuse.

---

## Phase C — Scaffold

Apply the ten changes from `RULEBOOK.md` §2, in order.

For each scaffolded file, **read the template file first**, then `Write` the new file with identifier substitutions. Substitutions to perform:

| Token in template | Replacement |
|-------------------|-------------|
| `gita` / `Gita` / `GITA` | `<id>` / `<Pascal>` / `<UPPER>` |
| `sundarkand` / `Sundarkand` / `SUNDARKAND` | `<id>` / `<Pascal>` / `<UPPER>` |
| absolute references to `data/gita/…` or `assets/gita/…` | `data/<id>/…`, `assets/<id>/…` |
| `useGitaLanguage` | **leave as-is** — the rulebook mandates reusing this hook |
| `GitaLanguageProvider` | **leave as-is** — same reason |

Choose the template based on the section's shape:

| Section shape | VersePage template | Reader template | Chapters screen? |
|---------------|--------------------|-----------------|------------------|
| Subsection-less, no commentary | `SundarkandVersePage.tsx` | `SundarkandReaderScreen.tsx` | no |
| Subsection-less, with commentary | `GitaVersePage.tsx` (drop chapter scoping) | `SundarkandReaderScreen.tsx` shell + Gita verse page | no |
| Chapter-based | `GitaVersePage.tsx` | `GitaReaderScreen.tsx` | yes — copy `GitaChaptersIndexScreen.tsx` |

### File-by-file

1. **Move/copy the user's content JSON** to `mobile/src/data/<id>/<id>.json` (or per-chapter files for chapter-based).
2. **`mobile/src/data/<id>/index.ts`** — adapt `mobile/src/data/gita/index.ts` (chapter-based) or write a flat loader (subsection-less). Include invariant checks: every verse has the required fields; counts match.
3. **`mobile/assets/<id>/index.ts`** — adapt `mobile/assets/gita/index.ts`. Export each image with a typed key. The dictionary keys are derived from the filenames you found in Phase A4.
4. **`mobile/src/components/<Pascal>VersePage.tsx`** — copy template, substitute identifiers. Verify the deterministic image-selection logic (`hash(verse.id) % images.length`) is preserved.
5. **`mobile/src/screens/<Pascal>ReaderScreen.tsx`** — copy template, substitute identifiers.
6. **`mobile/src/screens/<Pascal>ChaptersScreen.tsx`** *(only if subsections)* — copy `GitaChaptersIndexScreen.tsx`.
7. **`mobile/src/navigation/types.ts`** — `Edit` to add the new route param types. Read first, locate the existing `GitaReader` / `SundarkandReader` declarations, and add a sibling block for `<Pascal>Reader` (and `<Pascal>Chapters` if applicable).
8. **`mobile/src/navigation/RootNavigator.tsx`** — `Edit` to register the screen(s) using the same `gestureEnabled: false, animation: 'fade'` options as existing screens.
9. **`mobile/src/data/texts.ts`** — `Edit` to append a `LibraryEntry` for `<id>`. Status `'active'`. Place it before the `coming` entries.
10. **`mobile/src/screens/HomeScreen.tsx`** — `Edit` the routing if/else (≈ lines 81–87) to add a branch: `if (entry.id === '<id>') navigation.navigate('<Pascal>Reader' / '<Pascal>Chapters', …)`.

---

## Phase D — Verify and report

1. Run `cd mobile && npx tsc --noEmit`. Capture and surface any errors. Fix obvious identifier-substitution typos before stopping. If types still fail, stop and report — do not paper over with `any`.
2. Print a checklist mapping every RULEBOOK.md §1 field to the file/line where it landed:
   ```
   id          → mobile/src/data/texts.ts:<line>
   nameHi      → mobile/src/data/texts.ts:<line>
   nameEn      → mobile/src/data/texts.ts:<line>
   sub         → mobile/src/data/texts.ts:<line>
   thumb       → mobile/src/data/texts.ts:<line>
   subsections → mobile/src/data/<id>/<id>-manifest.json (or "none")
   image(s)    → mobile/assets/<id>/<filename> × N
   per-verse   → mobile/src/data/<id>/<id>.json (N verses)
   ```
3. Print the next-steps reminder verbatim:
   > **Next steps for the human:**
   > - Boot Expo (`cd mobile && npx expo start`) and verify the new card on Home, the reader navigation, the Hindi/English toggle on every page, and that backgrounds render correctly.
   > - Spot-check the PR diff for any new hex codes or hardcoded `fontFamily:` — there should be none.
   > - Per RULEBOOK §4, both `meaningHi` and `meaningEn` must be present on every verse before merging.

Do **not** create a git commit. The human runs the device test first, then commits.

---

## Failure modes (stop and ask)

- User has no content data yet → scaffold skeleton, stop.
- User has no background image yet → stop, do not generate placeholder PNGs.
- User wants a feature outside RULEBOOK.md (audio, lyrics, video, search) → stop and ask the user to extend the rulebook + design.md first.
- A required template file is missing from the repo → stop. Do not invent a replacement.
- Type errors in Phase D that can't be resolved by identifier substitution → stop, surface the error verbatim, do not patch with `any`.
