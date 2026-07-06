---
name: llm-wiki
description: "Maintain and query the persistent knowledge wiki at wiki/. Use when the user says 'ingest', 'query the wiki', 'lint the wiki', 'update the wiki', or references wiki pages. Also auto-trigger after merging a PR, finishing a task that produced material new knowledge, or when unfamiliar with a subsystem. Implements the Karpathy LLM-wiki pattern."
---

# LLM Wiki

Operate the `wiki/` knowledge layer. Source code is canonical. Wiki is a derived navigation aid.

## When To Use

- User says `ingest`, `query`, `lint`, or mentions the wiki explicitly.
- Starting work in an unfamiliar subsystem → `query` first.
- Finishing a task that produced material new knowledge → `ingest`.
- After merging a PR that touched several files → `ingest`.
- Periodically → `lint`.

## Authority Model

- **Source code is the final authority.** Wiki is derived.
- When wiki contradicts code: **trust code, fix wiki**.
- Cite wiki pages using the path **as it exists on disk**. Check `wiki/index.md` for real paths — do not invent subdir paths that don't exist.
- Verify at source before making code changes based on wiki.

## Directory Layout

```
wiki/
├── index.md              # Master catalog
├── log.md                # Append-only activity log
├── overview.md           # Stack, entry points, request shape
├── subsystems/           # One page per major subsystem
├── entities/             # Per key data model or domain type
├── concepts/             # Cross-cutting patterns
├── integrations/         # Third-party adapters and external APIs
├── runbooks/             # Ops procedures
└── decisions/            # Why X over Y — architectural choices
```

Existing flat pages at `wiki/*.md` are valid. New pages SHOULD use typed subdirs.

## Page Granularity

- One page per **subsystem** (maps to top-level source dir or major package).
- One page per **route family** only when a subsystem page is too broad.
- One page per **important entity** (high-traffic model or domain type) — skip trivial ones.
- One page per **cross-cutting concept** (auth, error handling, caching strategy, etc.).
- One page per **integration** (external API, message queue topic family, cache key family).
- One page per **runbook** or **decision** when durable knowledge exists.

Avoid: one-page-per-file, stub-everything, pages covering a single function.

## Page Format

```
---
title: <name>
type: subsystem | route-family | entity | concept | integration | runbook | decision
sources: [paths]
last_verified_date: YYYY-MM-DD
confidence: high | medium | low
status: current | needs-review | stub
---

## Summary
2-3 sentences.

## Details
Responsibilities, non-obvious logic, signatures, schema fields.

## Dependencies
[[wikilinks]]

## Gotchas
Edges, bugs, constraints, incidents.
```

Existing pages without frontmatter are valid. Add frontmatter opportunistically on edit.

## Operations

### ingest

Input: explicit file list, or a base ref to diff against.

1. Get changed files:
    - If user provides list → use it.
    - Else detect default branch and run `git diff --name-only <base>...HEAD`.
    - Ignore vendored, generated, lock files, and dependency dirs.
2. Read `wiki/index.md`. Map changed source paths → affected wiki pages.
3. For each affected page, re-read source and decide:
    - **Material change** → update page. Bump `last_verified_date`.
    - **Source changed, not reviewed** → set `status: needs-review`.
    - **Nothing material** → leave page alone.
4. Create a new page **only** if a new subsystem/entity/concept/integration appeared. No stub-pregeneration.
5. Update `wiki/index.md` for added/removed pages.
6. Append `wiki/log.md`: `## [YYYY-MM-DD] ingest | <summary>`
7. Log gaps: `## [YYYY-MM-DD] gap | <what is missing>`

### query

Input: a question about the codebase.

1. Read `wiki/index.md`.
2. Read relevant pages fully.
3. Answer with wiki citations (use on-disk paths).
4. Open source freely when wiki is stale, `needs-review`, missing, or insufficient. Wiki is not a gate.
5. File new page **only** for durable output (architecture comparison, invariant, domain concept, runbook, decision). Skip transient Q&A.
6. If filed: `## [YYYY-MM-DD] query | <summary> → filed as <page>`

### lint

Check and fix:

- Orphan pages (no inbound `[[wikilinks]]`)
- Dead `[[wikilinks]]`
- `status: needs-review` pages that can be refreshed now
- Missing pages referenced in prose
- Unresolved `gap` entries in log
- Contradictions between pages → flag `[!contradiction]`
- Duplicate pages covering same ground → merge
- Obsolete pages → prune

Append: `## [YYYY-MM-DD] lint | <summary>`

**Response format for query/auto-query:**

Structure answers so a human can follow them without reading source:

- **Start with a 1-2 sentence direct answer** to the question.
- **Walk through the flow** step-by-step when the question is about how something works. Use numbered steps with the file/function responsible for each step. Explain each step in 1-2 lines.
- **Cite wiki pages and source paths** inline (e.g. `wiki/shipping.md`, `services/shipping.service.js:calculateOptions`). Don't dump raw file paths without context.
- **Call out gotchas and edge cases** relevant to the question — these are the high-value bits.
- **Use short code snippets** only when they clarify a non-obvious pattern (e.g. a response shape, a config key). Don't paste entire functions.
- **End with "Related pages"** listing 2-3 wiki links for deeper reading.

Keep it scannable — headers, short paragraphs, bullet points. Not a wall of text, not a one-liner either. Target: someone unfamiliar with the subsystem should understand the answer without opening a single file.

## Update Threshold

Update wiki only when:
- New subsystem, entity, concept, integration, or decision discovered.
- Existing summary was **wrong** or **incomplete** in a way that misled.
- Code change altered public behavior, architecture, or an invariant.
- Task produced reusable knowledge (runbook, decision).

Do NOT update for:
- Spot lookups where nothing new was learned.
- One-off confirmations.
- Transient debugging sessions.
- Cosmetic / mechanical source edits.

Batch updates to end of task. One wiki pass per task, not per file read.

## Wiki-First Protocol

```
Question / Task
     ↓
wiki/index.md → relevant pages
     ↓
Answer or act (cite wiki) — verify at source before code changes
     ↓
Open source freely if wiki stale, missing, or insufficient
     ↓
Update wiki ONLY if threshold met (see above)
```

## log.md

`## [YYYY-MM-DD] <operation> | <description>`
Operations: `ingest`, `query`, `lint`, `gap`, `prune`.
Append-only. Never edit past entries.

## Pruning

A wiki page is a liability if stale, unread, or duplicated. Remove or merge:
- Delete pages covering removed code.
- Merge pages with overlapping scope.
- Note in log: `## [YYYY-MM-DD] prune | <page> — <reason>`

## Arg Dispatch

When invoked with args:

- `ingest [files...]` or `ingest --base <ref>` → run ingest
- `query <question>` → run query
- `lint` → run lint

No args → ask which operation.

## Do Not

- Do not treat wiki as authoritative over code.
- Do not update wiki after every spot-read.
- Do not create stub pages ahead of need.
- Do not file chat-shaped Q&A as pages.
- Do not assume any specific default branch — detect it.