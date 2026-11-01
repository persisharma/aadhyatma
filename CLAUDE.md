# Aadhyatma

## Shared agent instructions

@AGENTS.md

Follow [the shared Vedansh build checklist](docs/engineering/vedansh-build-checklist.md) for every implementation task. The AGENTS.md import preserves the common acceptance, work-preservation and evidence rules across coding assistants.

## Wiki

This repo has a persistent knowledge wiki at `wiki/`. Full schema and operations live in the `llm-wiki` skill (`.claude/skills/llm-wiki/SKILL.md`).
- `wiki/overview.md` for architecture, module map, and system overview.
- Operations: `ingest`, `query`, `lint` — via the `llm-wiki` skill.
