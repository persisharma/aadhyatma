# Daan-Punya revamp — prototype for review

Status: **design prototype, not implemented.** No app code changes on this branch.
Live canvas (owner-private): https://claude.ai/artifact/SvD7zW3VWkVjm2y8jMLFRn

Goal: make दान-पुण्य teach giving as clearly and visually as the shipped Mahadasha guide (design.md §51e) — understandable by a child — and keep RULEBOOK §27 intact.

## Options on the canvas

| Option | Files | Idea |
|---|---|---|
| **A — five-step guide** (owner's current pick) | `prototype/Main.dc.html` (index + all steps), `AStep1–5`, `AHindi`, `AHindiStep3` (wrappers that mount `Main` at a step / in Hindi) | Index → 1 What daan is · 2 How to give · 3 What to give today · 4 Whom it reaches · 5 Remember it quietly. Daan-dwaar door on every step (owner request). |
| B — today-first home | `prototype/OptionB.dc.html` | Large "today's daan" painting first, then week, three short reads, nine-seva grid, verses, kathas, register. |
| C — learn through kathas | `prototype/OptionC.dc.html` | The five kathas as a path, each teaching one principle, ending on today's daan. |
| Shared | `prototype/CausePage.dc.html`, `prototype/CauseIcon.dc.html` | Daan-dwaar single-seva page; the ten interim seva icons. |

Format: each `.dc.html` is a Design Component — inline-styled markup with `{{holes}}` filled by the `renderVals()` class at the bottom of the file. `canvas.json` is the board layout. `/_blob/<id>` URLs are artwork uploaded to the canvas; their sources are listed below.

## Content provenance

All copy is taken from shipped, verified registries — nothing new was authored except plain-language glosses:
`mobile/src/data/daan/{causes,principles,vaar,kathas,directory}.ts`. The plain glosses (six ways to give, three kinds of giving, "In one line", "How much should I give?") need editorial review.

## Constraints a review should hold the design to

1. **Tokens only** — every colour must exist in `mobile/src/theme/colors.ts` (owner rejected invented colours).
2. **RULEBOOK §27** — no fruit-promise or fear copy, no suggested amounts, no totals/streaks/scores, the app never handles money; Daan-dwaar may not be a tab; home keeps both standing doors.
3. **design.md §73 copy rule** — a UI line carries a fact, never stance; no "on this device" copy.
4. **Accessibility** — text ≥ 4.5:1, targets ≥ 44 px, works in Hindi/Gujarati/Kannada and Large text.
5. **Icons** — the owner wants Codex-painted storybook icons (style board `docs/evaluations/storybook-icons-2026-10-06/selected-storybook-reference.png`, shared prompt in `docs/evaluations/remaining-icons-2026-10-16/generation-brief.md`). `CauseIcon.dc.html` is a hand-drawn interim set.

## Decisions the owner still has to make

- **A reverses a Sept 2026 decision**: design.md §73 removed the journey's stepper. Choosing A means updating design.md §73 and RULEBOOK §27 in the implementation PR.
- **Index button label**: the prototype says "Start the guide"; RULEBOOK §27.1 names the home's filled door `दान करें`.
- **Daan-dwaar on every step** (owner request) vs. a teach-first flow — kept, as a full-width row above Back/Next.

## Review history

Two adversarial review rounds (Claude) already applied: panchangTile cards with flat nested rows, 3-stop skyNight panels with gold border, one night panel per verse, storybook paintings on katha cards and step headers, saffronDeep primary buttons (7.57:1 vs saffron's 4.37:1), items as tags not fake buttons, Daan-dwaar outline contrast fix. Open from round 2: English body text still Noto Serif Latin (app uses Cormorant); interim icons are line art.

## Seva icon subjects for Codex generation

1 anna — brass bowl heaped with rice beside a small copper lota · 2 gau — gentle zebu cow, hump, marigold garland · 3 bal — child's cloth satchel with wooden slate and tiffin · 4 vriddha — carved walking stick beside folded round spectacles · 5 vidya — open book with reed pen and brass inkpot · 6 arogya — brass mortar and pestle with tulsi leaves and one small red drop (no cross symbol) · 7 vastra — folded white cotton cloth with saffron border on a rolled wool blanket · 8 jeev — terracotta water bowl, sparrow on the rim, scattered grain · 9 aapada — small hut with a fresh tarpaulin roof beside a grain sack · 10 seva — two open hands holding a lit diya.

## Artwork used (`/_blob` ids → repo sources)

| Blob id (prefix) | Source |
|---|---|
| 14cc0ec5 | `mobile/assets/garud-puran/daan.webp` |
| c05044a8 | `mobile/assets/reader-illustrations/daan-annapurna-bhiksha.webp` |
| fb90e302 | `mobile/assets/backgrounds/daan-annapurna-bhiksha.webp` |
| 0c4057c5 | `mobile/assets/explore/daan.jpg` |
| 4823116d · 2798c474 · 20a6e81c · df09148e · 5ae1d720 · 1692545a · 0da2d154 · 53d157e4 · e1025563 · b4736564 · a31fdd74 · 4fdceb74 | storybook `daan`, `granth`, `vrat`, `ghar`, `krishna`, `ganga`, `muhurat`, `suktam`, `occasion-vyapar`, `kavacham`, `vishnu`, `occasion-vidyarambh` in `mobile/assets/icons/storybook/` |

## Not verified

No native render, no device check, no four-language check beyond the two Hindi boards. This folder is review material only.
