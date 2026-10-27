# Panchang day-panel icon rework

Six individually generated transparent Storybook miniatures: `chandra`, `karana`,
`nitya-yoga`, `agni-vaas`, `sunset`, and `moonrise`. Existing icons are reused.

Generated with the built-in `image_gen` tool. Every call included the approved
Storybook style board; sunset and moonrise also included `surya.png` as the edit
target. `prompts.json` contains the final exact prompts. `sources.json` records
each selected master, original generated path, prompt, reference hashes, and master
hash. `selected-generations.json` records the selected call inputs.

The owner rejected the crescent-and-star treatment during this session. Chandra
and moonrise were regenerated as plain cratered lunar discs with no star. The
superseded crescent-and-star outputs are not exported or registered. Nitya Yoga
retains the joined sun and crescent, with no star.

`export.py` retains the existing pipeline: clear alpha below 8, fit the visible
bounds to 432 px, center on a 512 px canvas, and quantize to a 256-color alpha
palette. All six shipped icons total 205,445 bytes, under the separate 300 KB
budget. The earlier icon-family budgets remain unchanged.

`review.png` compares the six with shipped surya, nakshatra, and vrat at 30 and
72 logical pixels. The lunar subjects remain distinct: full disc, half-lit disc,
joined sun/moon, and disc at the horizon. The contact sheet was visually inspected.
The icon/provenance suite passes (three tests). Native layout and full screen
implementation remain pending.

The owner requested a prototype before deciding whether the lower observance
card repeats the selected day's observances or only shows the following day's.
The independent question about regional-calendar and Pitru entry points remains
open. Do not treat either choice as approved from this asset work.
