# Design-Doc Sync (design.md / RULEBOOK.md)

Code is canonical, but `design.md` and `RULEBOOK.md` must never lag it by more than the change that moved it. This rule enforces RULEBOOK §0.1 in every session.

## MANDATORY Behavior

**Before finishing any change that touches a user-facing surface** — screen structure, a component's spec, navigation, theme tokens, type scale, labels/copy patterns, interaction/motion/a11y behaviour — you MUST:

1. Open `design.md` and find the section(s) describing the surface you changed (the doc has a numbered section per screen/component/subsystem).
2. Update those sections to match the new behaviour **in the same commit series/PR** — sizes, tokens, structure lists, interaction notes, file pointers.
3. If no section covers the surface, ADD one (continue the § numbering; match the house style: Purpose, Structure, token-based specs, file pointers).
4. If the change alters the **integration contract** (content shapes, file sets, category/deity/registry enumerations, verification steps, test gates), update the matching `RULEBOOK.md` section too.

**Enumerations:** categories, deities, and theerth groups live in code (`mobile/src/data/categories.ts`, `deities.ts`, `theerth/temples.ts`). When you change one, refresh every doc mirror of that list (design.md §18/§41/§42, RULEBOOK §1 rows 6–7, §12).

## When it does NOT apply

- Pure refactors with zero user-visible or contract-visible change.
- Test-only, script-only, or docs-only changes.
- Changes to `wiki/` (governed by the `llm-wiki` skill instead).

## Why

A July 2026 audit found ~35 sections of design.md describing an app that no longer existed (3-tab bar vs shipped 5, phantom Bookmarks tab, map-first Theerth vs shipped list-first) because nothing coupled doc updates to code changes. Fixing drift retroactively cost a full audit + rewrite; keeping the doc current per-PR costs minutes.

## Authority

Source code is canonical. When doc and code disagree, trust code, then fix the doc — never "fix" the code to match a stale doc without an explicit product decision.
