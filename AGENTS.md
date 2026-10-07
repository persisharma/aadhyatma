# Aadhyatma

## Wiki

This repo has a persistent knowledge wiki at `wiki/`. Full schema and operations live in the `llm-wiki` skill (`.claude/skills/llm-wiki/SKILL.md`).
- `wiki/overview.md` for architecture, module map, and system overview.
- Operations: `ingest`, `query`, `lint` — via the `llm-wiki` skill.

## Kids stories

For every new or revised kids story, follow RULEBOOK §29 and `docs/content-parity/kids-story-pacing/authoring-checklist.md`. Review the complete sourced arc and every page transition, including character roles, motives, responses and consequences; reviewing only the opening is insufficient. Record the page-by-page pacing review with provenance and check all four full narratives. Preserve the complete illustrated content, allow vertical scrolling for captions and trim only a visually reviewed empty bottom band. Review every new or replaced image, including covers, and update its frame/hash in `mobile/src/components/kidsStoryArtFrames.json`; the frame must follow the painted boundary, never caption length. Inspect the full native sequence at Standard and Large sizes; passing tests does not establish narrative or artwork completeness. Record pending editorial/device checks explicitly.
