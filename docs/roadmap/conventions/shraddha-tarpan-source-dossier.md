# Shraddha / Tarpana source dossier — 2026-08-19

## Purpose and selected v1 boundary

This dossier closes PRD-19 Phase 3's source-access gap. It does **not** certify one universal
household rite. The opened sources distinguish a compact tila-tarpana from a full parvana
shraddha, and the latter contains branch, family and officiant-dependent procedure.

**Decision recorded 2026-08-19:** v1 selects the narrow **household tila-tarpana remembrance
guide**. `mobile/src/data/vidhi/shraddha-tarpan-vidhi.ts` is registered with no inline mantra,
no fixed gotra/name formula, no pinda/bhojana/homa sequence, and no claim to be complete
Shraddha. The rejected alternative remains useful only as future scope:

1. **Selected:** household tila-tarpana remembrance guide — source-backed materials, safety,
   instruction-only offering markers and optional Gita hand-offs; formulas remain omitted.
2. **Not selected:** priest-guided parvana-shraddha companion — preparation, timing, conduct/safety guidance
   and reader hand-offs, while the officiant owns branch-specific sankalpa, homa, pinda and
   bhojana liturgy.

Do not splice both into a simplified “complete shraddha” and do not copy the illustrative
prototype strings.

## Opened sources

| Source | Opened evidence | What it supports |
|---|---|---|
| [Gita Press, *Nitya Karma Puja Prakash*, code 592 scan](https://archive.org/details/NityaKarmaPujaPrakashGitaPressGorakhpur) | Publisher imprint and twelfth reprint inspected; Tarpana chapter, printed pp. 103–116 | Eligibility/material cautions; vessel and darbha preparation; sankalpa; ordered deva, rishi, divya-manushya, divya-pitru, yama and related tarpana sections; exact formulas for later transcription review |
| [Sri Kanchi Kamakoti Peetham, condensed *Dharma Sindhu*, Shraddha Prakarana](https://www.kamakoti.org/kamakoti/dharmasindhu/bookview.php?chapnum=26) | Chapter 26 opened in full | Full shraddha structure and variants; Kutapa/Rohina/Aparahna timing; pinda, bhojana, tila-tarpana and anukalpa distinctions |
| [DrikPanchang, Pitru Paksha Shraddha dates](https://www.drikpanchang.com/shraddha/pitru-paksha-shraddha-dates.html) | Procedure/timing copy opened for 2026 city pages | Tithi-day selection; Kutapa, Rohina and Aparahna windows; tarpan follows the Shraddha; regional variation warning |
| [DrikPanchang, 96 Shraddha occasions](https://www.drikpanchang.com/shraddha/info/shraddha-days.html) | Occasion list opened | Annual/paksha/date context only; not a liturgical sequence |

## Concordant source facts safe to use

- **Timing is occurrence-specific and location-based.** Parvana Shraddha belongs in Kutapa,
  Rohina and the following Aparahna span; it is not an all-day generic checklist.
- **Tila-tarpana and full Shraddha are not synonyms.** Dharma Sindhu treats tila-tarpana as a
  component or anukalpa in defined circumstances, and records exceptions. The UI must name its
  chosen scope accurately.
- **Core materials attested across the opened sources:** clean water and vessel, darbha/kusha,
  black sesame; the fuller rite additionally uses the family/officiant's food and pinda materials.
  DrikPanchang describes pinda materials including rice, sesame, barley, milk, honey and ghee;
  these must not be imposed on a tarpana-only checklist.
- **Orientation, sacred-thread position, addressee order and formulas vary by branch and rite.**
  They are not safe to flatten into generic prose. Exact instructions belong to the selected
  source convention and qualified review.
- **A full Shraddha includes substantially more than water offering.** Dharma Sindhu identifies
  agnoukarana, pinda-dana and Brahmana-bhojana as integral elements and also records constrained
  alternatives. The app should not claim completion after a short water-offering flow.
- **No open flame or water-body disposal is necessary in the narrow digital guide.** Where the
  selected family procedure calls for homa, pinda disposition or flowing water, the UI should
  defer to an officiant/local rules and carry explicit fire, hygiene and environmental safety
  copy.

## Shipped v1 data boundary

The registered entry contains only the following, which do not invent liturgy:

- a source-backed preparation checklist for the selected scope;
- timing and “follow your family tradition / officiant” context;
- instruction-only markers for sankalpa, offering and conclusion;
- existing Gita chapter 15 and 2 reader hand-offs, clearly labelled as optional remembrance
  reading rather than as a replacement for ritual;
- the source block above, with the Gita Press chapter/page range and retrieval date.

The following remain blocked from any future expansion until qualified review:

- every inline mantra or name/gotra formula;
- a single fixed pinda/bhojana sequence across traditions;
- a regional convention label; and
- any assertion that the short guide is a “complete Shraddha”.
