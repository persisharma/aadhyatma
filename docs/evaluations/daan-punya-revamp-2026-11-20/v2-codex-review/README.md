# Daan-Punya revamp — v2 (Codex design review + painted-icon plan)

Status: **review output only. The v1 prototype in `../prototype/` is untouched.**
Date: 2026-11-20 · Base reviewed: Option A (`../prototype/Main.dc.html`, `../prototype/CauseIcon.dc.html`).

This folder captures a design discussion run with **Codex (GPT-5)** on how to make the
दान-पुण्य guide *more visually delightful* and *consistent with the app's existing icon
system* (the painted "Storybook miniatures" used in every other section). It does not change
the v1 prototype; it adds the brief and component needed to take the agreed direction forward.

---

## Verdict (Codex)

**Option A is the strongest visual base.** Keep its warm editorial look, painted hero/step/katha
artwork and the cause grid. The one thing that visibly breaks the app's design language is the
**10 seva/cause icons**: they are flat hand-drawn SVG line-art (`../prototype/CauseIcon.dc.html`)
sitting right next to painted miniatures on Steps 1, 3 and 4. Replace them.

## Decisions reached

| # | Decision | Status |
|---|---|---|
| 1 | Replace all 10 line-art seva icons with **painted Storybook miniatures** (same pipeline/brief as the rest of the app). | ✅ agreed — see `seva-icon-generation-brief.md` |
| 2 | **Drop the radial-gradient disc** behind cause icons. The painting supplies its own texture; the disc is extra chrome the approved reference icons don't use. | ✅ agreed — see `CauseIcon.v2.dc.html` |
| 3 | Keep **exactly one** dark night-sky verse panel as the signature moment; render the other verses with the same tokens but a quieter, flatter treatment so the panel doesn't feel templated. | ✅ agreed (apply when wiring v2) |
| 4 | Keep the 5-step guide as the base, but make step actions reachable **without gating** (skippable, per RULEBOOK §27). | ✅ agreed (apply when wiring v2) |
| 5 | Let the hero lead: fewer nested borders/shadows on the cards beneath it so it reads as an illustrated guide, not a stack of tiles. | ✅ agreed (apply when wiring v2) |

## Final reconciled seva icon set

Each subject is **one or two painted objects**, distinct from the shipped `daan.png` (a bowl of
offerings), `granth.png`/`sanskar.png` (books), and distinct from its 9 siblings at 32 px.
"Override" = changed from the v1 README subject list, with the reason.

| Seva | Final painted subject | Override vs v1 README |
|---|---|---|
| **anna** (food) | A standing sheaf of ripe wheat ears tied with a cord. | Was a *bowl of rice + lota* → collided with `daan.png`. Wheat sheaf reads "anna-daan" without another bowl. |
| **gau** (cow) | A calm zebu cow, hump and short horns clear, a marigold garland on the neck. | — (kept) |
| **bal** (children) | A child's cloth shoulder satchel with a simple buckle flap. | Dropped the extra slate + tiffin → one object; slate/book now belongs to *vidya/granth*. |
| **vriddha** (elders) | A curved wooden walking stick with round spectacles hung on the handle. | — (kept) |
| **vidya** (learning) | A brass inkpot with a reed pen resting across it. | Was an *open book* → collided with `granth.png`/`sanskar.png`. Inkpot + pen reads "vidya-daan". |
| **arogya** (health) | A brass mortar and pestle with two tulsi leaves. | Dropped the red drop (reads as blood/medical cross). |
| **vastra** (clothing) | One folded white cotton cloth with a saffron border on the top fold. | Dropped the rolled blanket → single clean fold, won't read as a book stack. |
| **jeev** (animals) | A small sparrow perched on the edge of a round twig nest. | Was a *water bowl + sparrow + grain* → the bowl drifted toward anna/daan. Nest + bird is a distinct silhouette. |
| **aapada** (relief) | A simple tarpaulin shelter stretched over two poles. | Dropped the hut + grain sack → bold shapes that survive 32 px. |
| **seva** (service) | A short traditional hand-broom (jhāḍū) bound at the neck. | Was *two hands holding a lit diya* → reads as worship/offering. Jhāḍū reads "seva". |

**Carry-forward collision check (in the brief's acceptance list):** `anna` (wheat sheaf, ears
up) and `seva` (broom, handle up / bristles) are both bound bundles — they must be told apart at
32 px by orientation and grain vs. straw. `arogya` mortar must not read as a plain bowl.

## The one thing that must NOT regress

> When moving from line-art to painted icons, **preserve instant recognition and distinct
> silhouettes at 32 px.** A prettier icon that's ambiguous at chip size is a regression.

## Risks Codex flagged (hold the implementation PR to these)

- **Token audit.** Several v1 shadow/glass values are literal `rgba(...)` rather than named
  `colors.ts` tokens (e.g. `rgba(90,58,30,0.18)`, `rgba(255,235,200,0.30)`). Map to tokens.
- **Four languages + Large text.** v1 only demonstrates English/Hindi. Re-check the 3-col cause
  grid labels, header wrapping and card heights in Gujarati, Kannada and enlarged text; keep 44 px
  targets.
- **design.md §73 (fact, not stance).** "Bhaav is the measure, never the amount" reads as stance.
  Keep the teaching factual and source-grounded.
- **Open owner decisions unchanged:** index label (`दान करें` vs "Start the guide"), the stepper
  reversing the Sept 2026 design.md §73 decision, English body font (Noto Serif → Cormorant).

## How to take this forward

1. **Generate the 10 painted icons** via the Codex artwork pipeline using
   `seva-icon-generation-brief.md` (final subjects + the app's exact shared prompt + acceptance
   checks). Export each to the house format and name `seva-<id>.png`.
2. **Swap the component:** use `CauseIcon.v2.dc.html` (painted, unframed, no disc) in place of
   `../prototype/CauseIcon.dc.html` when wiring the v2 prototype.
3. **Apply delight decisions 3–5** to a `Main.v2.dc.html` copy (don't edit v1).
4. Re-run the four-language / Large-text / 32 px icon checks before any implementation PR.
