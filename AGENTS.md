# Aadhyatma

## Wiki

This repo has a persistent knowledge wiki at `wiki/`. Full schema and operations live in the `llm-wiki` skill (`.claude/skills/llm-wiki/SKILL.md`).
- `wiki/overview.md` for architecture, module map, and system overview.
- Operations: `ingest`, `query`, `lint` — via the `llm-wiki` skill.

## Kids stories

For every new or revised kids story, follow RULEBOOK §29 and `docs/content-parity/kids-story-pacing/authoring-checklist.md`. Review the complete sourced arc and every page transition, including character roles, motives, responses and consequences; reviewing only the opening is insufficient. Record the page-by-page pacing review with provenance and check all four full narratives. Preserve the complete illustrated content, allow vertical scrolling for captions and trim only a visually reviewed empty bottom band. Review every new or replaced image, including covers, and update its frame/hash in `mobile/src/components/kidsStoryArtFrames.json`; the frame must follow the painted boundary, never caption length. Inspect the full native sequence at Standard and Large sizes; passing tests does not establish narrative or artwork completeness. Record pending editorial/device checks explicitly.

Every new illustrated story section must also follow RULEBOOK §29.1 and design.md §76's image/layout contract. Use `docs/content-parity/kids-stories-art-style.md` for new generation prompts: do not reserve a blank lower fifth or caption area inside artwork. Inspect actual image bounds, aspect ratio, spacing and safe-area ownership before fixing scroll; never copy another image's crop percentage. Reusable implementation request: `docs/content-parity/story-image-layout-prompt.md`.
