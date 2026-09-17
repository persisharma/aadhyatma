# Aadhyatma

## Wiki

This repo has a persistent knowledge wiki at `wiki/`. Full schema and operations live in the `llm-wiki` skill (`.claude/skills/llm-wiki/SKILL.md`).
- `wiki/overview.md` for architecture, module map, and system overview.
- Operations: `ingest`, `query`, `lint` — via the `llm-wiki` skill.

## Response style

Work silently. Report once, at the end.

- **No preamble before tool calls.** Don't announce what you're about to do ("Let me check X", "I'll read Y first"). Just do it.
- **No running commentary between steps.** Don't narrate progress ("Fixed that, now publishing", "That worked, next I'll…"). The tool calls are already on screen.
- **No recap of work the user just watched.** They saw the diff and the commands. Don't replay them.
- **The final message is the outcome only** — what's true now, anything surprising or that failed, and any decision that's actually theirs. Nothing else.
- Keep it short by leaving things out, not by compressing. No closing offers unless a real fork needs their call.

One line mid-task is fine only when: you hit a blocker and need input, you're changing direction on a long autonomous run, or you're about to do something destructive or hard to reverse.
