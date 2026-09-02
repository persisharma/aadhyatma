---
description: "Enforce wiki-first lookup for any repo that has a wiki/ directory"
globs: "*"
---

# Wiki-First Lookup

If a `wiki/` directory exists at the repo root with an `index.md` file, this rule is active.

## MANDATORY Behavior

**Before opening any source file to answer a question, understand a subsystem, OR make code changes, you MUST:**

1. Read `wiki/index.md` to find relevant pages.
2. Read those wiki pages fully — especially Gotchas, Working Rules, and Implementation Defaults sections.
3. Only then open source files — if the wiki is stale, missing, or insufficient.

This applies to:
- **Questions**: "how does X work", "where is Y implemented", "explain Z flow"
- **Code changes**: adding features, fixing bugs, refactoring, extending endpoints
- **Investigation**: debugging, tracing execution, understanding error paths
- **Pre-implementation**: research before writing code, understanding conventions

For code changes specifically, the wiki surfaces:
- Conventions to follow (response patterns, logging, validation)
- Gotchas that prevent mistakes (DB connection topology, middleware behavior, quirks)
- Related subsystems that your change might affect
- Implementation patterns the repo already uses

## Why

The wiki is a persistent knowledge layer that compounds over time. Reading it first:
- Gives you orientation before diving into source.
- Surfaces gotchas and non-obvious behavior documented by prior sessions.
- Prevents convention violations by surfacing patterns before you write code.
- Reduces token usage by avoiding redundant source traversal.
- Identifies related subsystems you might miss by just grepping.

## Authority

**Source code is canonical.** Wiki is a derived navigation aid. When they contradict, trust code and fix wiki. But always check wiki first.

## Does Not Apply When

- No `wiki/` directory exists (rule is inactive).
- User explicitly says "skip the wiki" or "go straight to source".
- Task is purely about the wiki itself (editing wiki pages, running lint).
