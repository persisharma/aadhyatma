# Daan-Punya revamp — FULL audit (Codex + Claude), 2026-11-20

Scope: the **entire** revamp prototype, not just icons — all three options (A/B/C), the shared
Daan-dwaar cause page, the interim icons, and all copy. Audited against `RULEBOOK.md` §27,
`design.md` §73/§51e, `mobile/src/theme/colors.ts`, the shipped `mobile/src/data/daan/*` registries,
and the app's shared components (ReaderHeader, ListCard, ShareButton, storybook icons).

Run with **Codex (GPT-5)** reading every file; the concrete FAILs were **spot-verified by Claude**
(CausePage water/health icon, hardcoded Friday, "Start the guide" label — all confirmed). The v1
prototype in `../prototype/` is untouched.

Legend: **FAIL** = breaks a rule/contract or is factually wrong · **RISK** = likely problem / needs
a decision · **QUESTION** = product decision required · **PASS** = checked and good.

---

## Fix-first (top 10, severity order)

1. **Restore the §27/§73 navigation contract.** Two standing doors on home; the guide as one
   *skippable* scroll (not a 5-step gate); record + directory as *ungated* terminal actions, record
   before directory. (A currently gates and shows a sticky Daan-dwaar on every step.)
2. **Home filled button** → `दान करें` (not "Start the guide" / "मार्गदर्शिका आरम्भ करें"). `Main.dc.html:575`
3. **Wire every control / kill placeholders.** Register, "Record a daan", directory rows, and
   "Read the story" are inert; OptionC shows a literal `[katha painting]` placeholder.
4. **Content bug:** CausePage pairs **"Drinking water" with the आरोग्य (health) icon**, but water is
   an `anna` cause (health = medical/blood/medicine). `CausePage.dc.html:62`
5. **Remove / attribute stance copy** (design.md §73 = fact, not stance): "Bhaav is the measure,
   never the amount", "Remember it quietly / चुपचाप याद रखें", "Daan is not a favour but dharma",
   "There is no fixed amount…".
6. **Derive today's date & vaar at runtime** — every option hardcodes Friday (`TODAY = 5`), so
   "today's daan" is wrong on any other day. `Main.dc.html:506`
7. **Tokens + contrast:** replace non-token colours (`#F6ECD0`, `#F1E3BF`, `#FFF9EE`, `#F6E6BC`,
   literal shadow rgba); fix white-on-`saffron #B8621B` buttons in B/C (**4.37:1 < 4.5:1 AA**) → use
   `saffronDeep`.
8. **Indic line-height:** several Hindi lines are **1.44×–1.57×**, under RULEBOOK §3's **1.65×**
   (headings 21/33, ledes 13.5/21, check labels 12.5/18). Raise leading; verify Gujarati/Kannada/Large.
9. **Bind copy to the verified registries** (`causes/principles/vaar/kathas/directory.ts`) instead of
   a hand-copied second dataset that will drift; include IAST transliterations + source lines.
10. **Adopt shared shells** (ReaderHeader / ListCard / ShareButton) + the painted storybook icons;
    then do the rendered + native + four-language visual review (none recorded yet).

**Verdict (A vs B vs C):** **A's teaching order — what → how → today → whom → remember — is the best
"teach a child" sequence** and the right base. But ship it as §73's *single skippable scroll*, not a
5-step gate. **B** gives "today's gift" too much prominence (470px hero first) — reads as a giving
prompt, not teaching. **C**'s story-path premise is the most distinctive but currently runs on
placeholder art, inert story controls and **invented moralising glosses**. Do **not** implement until
the navigation contract, copy, date logic, cause routing, tokens/contrast and four-language
accessibility are all resolved.

---

## 1. Content & provenance

- **PASS** — Ṛgveda 10.117.6, Taittirīya 1.11.3 and Gītā 17.20 Devanagari + citations + meanings
  match `principles.ts` (15/47/77). `Main.dc.html:177`
- **PASS** — The seven vaar→cause mappings match `vaar.ts` (Wed gau, Thu vidya+anna, Fri anna+vastra). `Main.dc.html:497`
- **FAIL** — CausePage shows "Drinking water" under the **आरोग्य icon**; water is an `anna` cause. `CausePage.dc.html:62` → use anna icon or a real health service.
- **FAIL** — OptionC: *"True giving costs the giver"* / *"Give from what you have — not only from
  what is left over"* are **invented, unreferenced moralising** glosses (not Karna's registry lesson)
  and can pressure users to give more. `OptionC.dc.html:141`
- **FAIL** — "The Upanishad's **six words**" mislabels six clauses/injunctions; registry IAST
  transliteration omitted. `Main.dc.html:544`
- **RISK** — Cause names / mahatva / org summaries are **hand-copied into a second dataset** (drift
  risk) though they currently match. `Main.dc.html:453` → render from registry accessors.
- **RISK** — OptionC katha **sequence differs from registry order** and shows no source/canon line. `OptionC.dc.html:130`
- **RISK** — Six "child" glosses are interpretations, not translations ("With awe", "Never look
  down…"). Label as plain-language explanation. `Main.dc.html:613`
- **RISK** — "today" hardcoded Friday (see §6). `Main.dc.html:674`

## 2. RULEBOOK §27 compliance

- **FAIL** — A's **sticky Daan-dwaar on every step** lets users reach the directory before the
  terminal record action; §27 wants one skippable journey, terminal actions at the end, record before
  directory. `Main.dc.html:406` / `RULEBOOK.md:1449`
- **FAIL** — Home filled button "Start the guide" + 5-step **gate** vs §27's `दान करें` + one-scroll
  skippable structure (also the §73 Sept-2026 stepper removal). `Main.dc.html:575`
- **FAIL** — Directory rows look tappable but have **no URLs/hand-off**; record button inert. `CausePage.dc.html:81,95`
- **RISK** — "There is no fixed amount. The Upanishad says…" presents a generalisation as scripture;
  §27 bans suggested amounts. `Main.dc.html:552`
- **RISK** — OptionB's **₹10 meal price** in a giving context risks reading as a recommended gift
  (§27.14 bars figures in directory copy). `directory.ts:37` / `RULEBOOK.md:1467`
- **RISK** — OptionC "**0 of 5 read**" counter adds gamified completion framing absent from §73. `OptionC.dc.html:38`
- **PASS** — Daan-dwaar is a link, not a tab; no payment UI, no amount input. `Main.dc.html:407`

## 3. design.md §73 — fact, not stance

- **FAIL** — "Bhaav is the measure, never the amount" + "Sudama's gift was complete" = editorial
  conclusion stated as fact. `Main.dc.html:554`
- **FAIL** — "wanting nothing back" / "Daan is not a favour but dharma" = definitional stance. `Main.dc.html:539,543`
- **FAIL** — "Remember it quietly / चुपचाप याद रखें" instructs a stance; "Why gupt daan comes first" /
  "tradition holds highest" rank practices. `Main.dc.html:515,568,569`
- **FAIL** — "With faith, by your means, with humility" + the six child cards turn source into direct
  **instructions**; C adds more imperatives. `Main.dc.html:512` / `OptionC.dc.html:67,133`
- **RISK** — Gītā gloss compresses *pātra* into "right person" (judgement about people); prefer
  "worthy patra / fit recipient" + cite. `Main.dc.html:536`

## 4. Tokens & colour

- **FAIL** — `#F6ECD0`, `#F1E3BF`, `#FFF9EE`, `#F6E6BC` are **not in `colors.ts`** (used across
  A/B/C/CausePage); shadows are hand-authored literals. `Main.dc.html:17` → map to palette/elevation
  /spacing/radius tokens.
- **FAIL** — White on `saffron #B8621B` ≈ **4.37:1 < 4.5:1** in B/C. `OptionB.dc.html:53` / `OptionC.dc.html:91` → `saffronDeep`.
- **PASS** — `#F2C46B` on `#160A03` ≈ 11.94:1; `#5A3A1E` on `#F8EFD6` ≈ 8.89:1. `Main.dc.html:74`
- **RISK** — Icons are the interim line-art set, not the painted storybook set. `CauseIcon.dc.html:15`
  → **addressed by the v2 icon plan** (`seva-icon-generation-brief.md`, `CauseIcon.v2.dc.html`).

## 5. Accessibility

- **FAIL** — Hindi leading under §3's 1.65×: heading 21/33 = 1.57×, lede 13.5/21 = 1.56×, check
  labels 12.5/18 = 1.44× (verse blocks 18/33 do pass). `Main.dc.html:143,56,239`
- **RISK** — Only English/Hindi shown; B/C/CausePage English-only. **No Gujarati, Kannada or Large
  text** demonstrated. `AStep1.dc.html:19` / `README.md:58`
- **RISK** — Fixed 390px width + fixed heights + px text → no responsive / Large-text reflow proof. `OptionB.dc.html:17`
- **PASS** — Back target 44×44; most prominent controls ≥44px. `Main.dc.html:21`

## 6. Structure, navigation & states

- **FAIL** — Every OptionB cause tile links to the **same generic CausePage, which always selects
  anna**. `OptionB.dc.html:102` / `CausePage.dc.html:106` → pass + render the selected cause.
- **FAIL** — OptionB register/back inert; "Give today" returns to Main's index, not the journey. `OptionB.dc.html:24,53`
- **FAIL** — OptionC "Read the story" has no handler; panel shows `[katha painting]` + only a short
  teaching, not the registry story. `OptionC.dc.html:72,61,63`
- **RISK** — Step "read" state is component-local; no saved/fresh persistence modelled. `Main.dc.html:431`
- **QUESTION** — A's stepper **reverses the Sept-2026 design.md §73 decision**; does the impl PR update
  both §73 and §27? `Main.dc.html:414`
- **PASS** — A's what/how/today/whom/remember order is the most legible for a child — keep it inside
  §73's single scroll with a quiet skip and ungated terminal actions. `Main.dc.html:510`

## 7. Visual delight & app-consistency

- **RISK** — Repeated night-sky panels + gold borders + star dots + layered shadows feel
  **templated**; B/C repeat the same night bands across unrelated kathas. `Main.dc.html:190` →
  keep **one** signature night panel, quiet the rest (agreed delight decision #3).
- **FAIL** — OptionB's 470px donation hero dominates the first view, delaying teaching. `OptionB.dc.html:27`
- **FAIL** — Hand-rolls header/card geometry/shadows/type instead of **ReaderHeader/ListCard**. `Main.dc.html:17`
- **FAIL** — No shared **ShareButton** on verses/kathas (current §73 requires share on principles +
  kathas; app ShareButton = 48px target). `design.md:3985` / `ShareButton.tsx:24`
- **RISK** — OptionC panels identical + placeholder art → each katha doesn't feel like its own teaching. `OptionC.dc.html:27`
- **RISK** — No native/rendered visual review recorded. `README.md:58`

## 8. Cross-option consistency

- **FAIL** — B/C omit A's Cormorant title setup (Devanagari serif globally) and use the failing
  saffron/white button; A uses saffronDeep. `OptionB.dc.html:11`
- **FAIL** — B hardcodes its own vaar/cause/katha lists instead of the shared registries. `OptionB.dc.html:157`
- **FAIL** — C places today's daan + doors at the **end**; A/B put an immediate door at top/index →
  pick one IA contract and wire all three. `OptionC.dc.html:83`
- **RISK** — Shared cause chips static, only anna selected; CausePage receives no cause/date/locale
  /filtered-org state. `CausePage.dc.html:26`

---

## Already addressed by the v2 icon work (this folder)

- Line-art → painted storybook icons: final subject set + ready-to-run `seva-icon-generation-brief.md`.
- Drop the radial-gradient disc behind cause icons: `CauseIcon.v2.dc.html`.
- Keep one signature night-sky panel (delight decision #3) — apply when wiring `Main.v2`.

See `README.md` in this folder for the icon decisions and overrides.
