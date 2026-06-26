# Native Gujarati & Kannada meaning translations — source research

**Date:** 2026-06-23 · **For:** deciding how to source authoritative gu/kn *meaning* translations (verse stays transliterated; commentary out of scope). · **Status:** research findings — no content captured here.

## Bottom line

After surveying the open/free landscape, the honest result is:

1. **Verse text in Gujarati/Kannada script** is everywhere — but that is *transliteration of the Sanskrit/Awadhi*, which the app already produces at runtime. Nothing to "gather."
2. **Native, verse-aligned, openly-licensed Gujarati/Kannada *meaning* translations basically do not exist as reusable structured data.** Every open dataset/API I found carries **Sanskrit + Hindi + English only**. Dedicated multi-language devotional sites mark gu/kn meanings *"coming soon."*
3. Where native gu/kn meanings *do* exist, they are either **(a) copyrighted** (Gita Press, ISKCON/BBT) — being downloadable on archive.org does **not** make them public domain — or **(b) public-domain scanned books** that are unstructured OCR PDFs, only for the big classics (Gita / Ramayan / Ramcharitmanas), with **nothing** for the 36 chalisas/aartis/stotrams or the 82 vrat-kathas, and Kannada scarcer than Gujarati.

So "bring native translations for each content from free sources" is **not achievable** — the data isn't out there. Below is exactly what is and isn't available, so you can decide.

## A. Open-licensed datasets/APIs — but NO Gujarati/Kannada meaning

| Source | License | Content | gu/kn meaning? |
|---|---|---|---|
| [gita/gita](https://github.com/gita/gita) + [bhagavadgita.io API](https://github.com/gita/bhagavad-gita-api) | Unlicense / MIT | Gita: Sanskrit + multiple English + Hindi translations & commentaries | ❌ none |
| [vedicscriptures/bhagavad-gita-api](https://github.com/vedicscriptures/bhagavad-gita-api) | GPL-3.0 | Gita: Sanskrit + Hindi/English commentary authors (Sivananda, Chinmayananda, Ramsukhdas…) | ❌ none |
| [bhavykhatri/DharmicData](https://github.com/bhavykhatri/DharmicData) | ODbL | Gita, Ramcharitmanas, Valmiki Ramayana, Vedas in JSON — sourced from IIT-K Supersite / Sacred-Texts (Sanskrit + Hindi/English) | ❌ none |
| [Bhagwat-Gita-Infinity (HuggingFace)](https://huggingface.co/datasets/ArnavLatiyan/Bhagwat-Gita-Infinity) | CC BY-SA 4.0 | Sanskrit + IAST + English + optional Hindi | ❌ none |
| [i8o8i-Developer/Bhagwat-Gita-DataSet](https://github.com/i8o8i-Developer/Bhagwat-Gita-DataSet) | MIT | CSV: Sanskrit + Hindi + English | ❌ none |
| [anonatul/hanuman-chalisa-api](https://github.com/anonatul/hanuman-chalisa-api) | (verse-by-verse API) | Hanuman Chalisa: Devanagari + IAST + English + Hindi ("more languages planned") | ❌ none yet |
| [sanatan-learnings/bhagavad-gita](https://github.com/sanatan-learnings/bhagavad-gita) | MIT | ⚠️ mostly **AI-generated** (8 of 701 verses done; rest need LLM generation) — not authoritative | ❌ avoid |

**Takeaway:** these would only re-supply Hindi/English (which we already have). They do not advance native gu/kn.

## B. "Gujarati/Kannada" that is actually script-rendering, not translation

| Source | What it really is | Reusable? |
|---|---|---|
| [Gita Supersite (IIT-K)](https://www.gitasupersite.iitk.ac.in/) | Offers a Gujarati/Kannada **script** toggle, but the commentary shown is the **Hindi** commentary rendered in that script (= transliteration, what we already do) | Academic-use terms; not native translation |
| [sanskritdocuments.org](https://sanskritdocuments.org/) (Gita, chalisas in gu/kn) | The **verse** transliterated into gu/kn script — not a meaning translation | License: personal/research only, **no commercial repost without permission** |
| [vignanam.org](https://vignanam.org/veda/hanuman-chalisa-meaning.html) | Hanuman Chalisa "Meaning" in Kannada/Gujarati columns = **"Coming soon…"** | Nothing to take |

## C. Genuine native gu/kn meaning — but copyrighted or unstructured

- **Copyrighted (you'd need a licensing decision — not "public"):**
  - [archive.org: Bhagavadgita in Kannada — Srila Prabhupada](https://archive.org/details/bhagavadgita-srila-prabhupadas-books) — ISKCON / Bhaktivedanta Book Trust, Kannada by Prof. L.S. Sheshagiri Rao. Verse + word-by-word + translation + purport. **On archive.org ≠ public domain — BBT holds copyright.**
  - [ExoticIndia](https://www.exoticindiaart.com/) Gita-Press / other Kannada & Gujarati "अर्थ सहित" editions — commercial, copyrighted.
- **Public domain but unstructured (whole-book OCR scans, classics only):**
  - [gu.wikisource.org — Ramcharit Manas in Gujarati](https://gu.wikisource.org/wiki/સૂચિ:Ramcharit_Manas_in_Gujarati.pdf) (Wikisource = PD).
  - [archive.org — Ramayan Mulak Gujarati](https://archive.org/details/dli.ernet.422917) (Gujarat Vidyapith, Digital Library of India, Govt of India — PD scan).
  - Digital Library of India / archive.org hold more PD Gita/Ramayan editions, but quality, language detection, and verse-alignment vary; **Kannada PD editions are sparse**.
  - These need OCR → clean-up → manual verse-by-verse alignment to our data. Big effort; classics only; nothing for chalisas/aartis/stotrams/kathas.

## D. Realistic options (your call)

1. **License an authoritative edition** (Gita Press / ISKCON-BBT) for the classics — clean, authoritative, but a copyright/permission decision. Covers Gita (+ maybe Sundarkand/Ramcharitmanas); not the long tail.
2. **Digitize specific public-domain books** (Wikisource Ramcharit Manas Gujarati, DLI Ramayan Gujarati): OCR + align. Authoritative-ish, PD, but heavy manual work and only the classics.
3. **Commission native translators** for what has no open source (the 36 chalisas/aartis/stotrams, the 82 kathas, all of Kannada). The only path to *complete* native coverage with verifiable provenance.
4. **Keep transliteration** for everything without a licensed/PD source (today's behaviour) and layer (1)/(2)/(3) in per section over time — the `meaningByLang` seam already supports this.

## E. What I can build regardless (no content risk)

Additive plumbing so any verified translation drops in per-section with graceful fallback to transliteration, each carrying its `source`/citation (RULEBOOK §10.2):
`meaningGu?` / `meaningKn?` + optional `meaningSource` on the verse type → `meaningByLang` prefers the native field, else transliterates. Verse untouched.

## Sources
- https://github.com/gita/gita · https://github.com/gita/bhagavad-gita-api · https://github.com/vedicscriptures/bhagavad-gita-api
- https://github.com/bhavykhatri/DharmicData · https://huggingface.co/datasets/ArnavLatiyan/Bhagwat-Gita-Infinity · https://github.com/i8o8i-Developer/Bhagwat-Gita-DataSet
- https://github.com/anonatul/hanuman-chalisa-api · https://www.gitasupersite.iitk.ac.in/ · https://sanskritdocuments.org/ · https://vignanam.org/
- https://archive.org/details/bhagavadgita-srila-prabhupadas-books · https://gu.wikisource.org/ · https://archive.org/details/dli.ernet.422917
