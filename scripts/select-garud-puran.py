#!/usr/bin/env python3
"""Build a small, explicitly unverified research selection from cached Hindi pages.

Run with the collector's virtualenv (beautifulsoup4 required). Source wording is
preserved; this does not author scripture, translations, or app content.
"""
import hashlib
import json
import re
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "tmp/garud-puran/extracted/hindi-abridged-pages.jsonl"
OUT = ROOT / "tmp/garud-puran/selected"
DOCS = ROOT / "docs/content/garud-puran"

# Match actual in-page headings. Contents numbers are not reliable page joins.
# English chapter numbers refer ONLY to Saroddhara, not to the wider Purana.
SELECTIONS = [
    ("karma", "कर्म और उसके फल", "Karma and its consequences", "teaching", 596, "सत्कर्मकी महिमा तथा कर्मविपाकका फल", [], "A practical entry into the text's account of conduct and consequences."),
    ("daan", "दान का महत्त्व", "The importance of giving", "teaching", 180, "दान-धर्मकी महिमा", [8], "Giving is a recurring theme in the collected text and Saroddhara."),
    ("human-life", "मनुष्य जीवन का महत्त्व", "The value of human life", "teaching", 517, "चौरासी लाख योनियोंमें", [16], "An accessible teaching on the opportunity to practise dharma."),
    ("liberation", "विवेक, सत्संग और मोक्ष", "Discernment, good company and liberation", "teaching", 604, "भगवान् विष्णुद्वारा गरुडको दिये गये", [16], "Balances afterlife material with the text's concluding liberation teaching."),
    ("babhruvahana", "बभ्रुवाहन और प्रेत सुदेव", "Babhruvahana and the departed Sudeva", "story", 507, "राजा बभ्रुवाहनकी कथा,", [7], "A named narrative also present in Saroddhara; help for a departed stranger."),
    ("five-pretas", "ब्राह्मण और पाँच प्रेत", "The Brahmin and the five pretas", "story", 500, "संतप्तक ब्राह्मण तथा पाँच प्रेतोंकी कथा", [], "A narrative connecting conduct, company and divine grace; name spelling needs collation."),
    ("viravahana", "राजा वीरवाहन की कथा", "The story of King Viravahana", "story", 493, "वृषोत्सर्गकी महिमामें राजा वीरवाहनकी कथा,", [], "A ritual-linked narrative that also contains a Narada episode; optional deeper reading."),
    ("sita-ancestors", "सीता और पितरों का दर्शन", "Sita's vision of the ancestors", "story", 511, "श्राद्धान्नका पितरोंके पास पहुँचना,", [], "A narrative explanation of ancestral offerings. Attribute this telling to Garud Puran, not automatically to Valmiki Ramayan."),
    ("shraddha", "श्राद्ध का परिचय", "Understanding shraddha", "tradition", 181, "श्राद्धके अवसर तथा अधिकारी;", [13], "Relevant to ancestral remembrance; introduce meaning before procedural detail."),
    ("mourning-rites", "मृत्यु के बाद के संस्कार", "Rites after death", "tradition", 483, "आशौचमें विहित कृत्य,", [11, 12, 13], "The funeral-reading context is historically attested; this is education, not one universal family ritual schedule."),
    ("yama", "यमराज और कर्मफल", "Yama and the fruits of action", "tradition", 534, "जीवका यमपुरीमें प्रवेश,", [14], "A short entry into the text's traditional account of judgment."),
    ("vaitarani", "वैतरणी का वर्णन", "The account of Vaitarani", "tradition", 598, "यममार्गमें स्थित वैतरणी नदीका वर्णन,", [2], "A recurring afterlife theme; keep graphic detail optional and identify it as a scriptural account."),
]


def build():
    source_bytes = SOURCE.read_bytes()
    pages = [json.loads(line) for line in source_bytes.decode().splitlines()]
    # Retain each HTML top-level node and its page provenance in source order.
    nodes = []
    for page in pages:
        soup = BeautifulSoup(page["html"], "html.parser")
        for node in soup.contents:
            nodes.append((page, node))
    records = []
    OUT.mkdir(parents=True, exist_ok=True)
    for ident, hi, en, kind, page_number, prefix, english_chapters, reason in SELECTIONS:
        starts = [i for i, (p, n) in enumerate(nodes)
                  if p["page"] == page_number and re.fullmatch(r"h[1-6]", n.name or "")
                  and n.get_text(" ", strip=True).startswith(prefix)]
        assert len(starts) == 1, (ident, starts)
        start = starts[0]
        end = next(i for i in range(start + 1, len(nodes))
                   if re.fullmatch(r"h[1-6]", nodes[i][1].name or ""))
        selected = nodes[start:end]
        parts = []
        for p, node in selected:
            if not parts or parts[-1]["page"] != p["page"]:
                parts.append({"page": p["page"], "sourceUrl": p["sourceUrl"],
                              "sourcePageSha256": hashlib.sha256(p["html"].encode()).hexdigest(), "html": ""})
            parts[-1]["html"] += str(node)
        for part in parts:
            part["text"] = BeautifulSoup(part["html"], "html.parser").get_text("\n", strip=True)
        text = "\n\n".join(p["text"] for p in parts)
        assert len(text) > 400, ident
        record = {
            "id": ident, "titleHi": hi, "titleEn": en, "kind": kind,
            "selectionReason": reason, "status": "research-extract-unverified",
            "releaseEligible": False, "contentType": "source-passage-not-authored-summary",
            "sourceId": "bharatkosha-gita-press-abridged-hi",
            "sourceHeading": nodes[start][1].get_text(" ", strip=True),
            "sourcePages": [p["page"] for p in parts],
            "stopBeforeHeading": nodes[end][1].get_text(" ", strip=True),
            "relatedSaroddharaChapters": english_chapters,
            "englishReferenceStatus": "topic pointers only; not aligned translations",
            "meaningHi": None, "meaningEn": None,
            "sourceNotes": "Selection from a Hindi abridgement, not the complete Purana or a verified complete original chapter. OCR, running headers and footnotes remain. Full source wording is retained within heading boundaries; source promises and social prescriptions are not editorial endorsements.",
            "fragments": parts,
        }
        (OUT / f"{ident}.json").write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n")
        (OUT / f"{ident}.txt").write_text(text + "\n")
        metadata = {k: v for k, v in record.items() if k != "fragments"}
        metadata["localFile"] = f"tmp/garud-puran/selected/{ident}.json"
        metadata["textCharacters"] = len(text)
        records.append(metadata)
    manifest = {
        "titleHi": "गरुड़ पुराण — चयनित कथाएँ और शिक्षाएँ",
        "titleEn": "Garud Puran — Selected Stories and Teachings",
        "selectedOn": "2026-10-12", "releaseEligible": False,
        "sourceSha256": hashlib.sha256(source_bytes).hexdigest(),
        "selectionBasis": "Editorial relevance plus attested funeral/ancestor-reading context; no popularity survey or claim these are the most followed stories.",
        "proposedReadingFormat": "Each future editorial Hindi/English reading: 3–5 minutes, source citation, optional original passage. This duration is a target, not the size of the present raw extracts.",
        "editionBoundary": "Saroddhara is a separate 16-chapter digest. Its chapters are related reading pointers, never identical-number joins to this Hindi abridgement or the three-book Sanskrit corpus.",
        "practiceBoundary": "Ritual customs vary by region, lineage and family. Present educational context, not a universal procedure. Do not treat afterlife imagery as observed fact or caste, gender, illness or harmful historical prescriptions as present-day instructions.",
        "references": [
            {"url": "https://bharatkosha.org/hi/granth/garuda-puran-gita-press", "role": "Previously captured Hindi OCR; selected passage headings and source samples inspected locally. Rights and print collation pending."},
            {"url": "https://sacred-texts.com/book/the-garuda-purana/contents", "role": "Saroddhara contents opened; chapter topic pointers."},
            {"url": "https://sacred-texts.com/book/the-garuda-purana/shell/introduction", "role": "Historical 1911 introduction; funeral-use context, not a contemporary popularity survey."},
            {"url": "https://sacred-texts.com/book/the-garuda-purana/chapter-vii-babhruvahana-s-sacrament-for-the-departed-one", "role": "English Babhruvahana source opened via web. Direct local HTTP download returned 403; no English chapter stored."},
            {"url": "https://sacred-texts.com/book/the-garuda-purana/chapter-viii-an-account-of-the-gifts-for-the-dying", "role": "English giving source opened via web; not locally downloaded or aligned."},
            {"url": "https://sacred-texts.com/book/the-garuda-purana/chapter-xvi-an-account-of-the-law-for-liberation", "role": "English liberation source opened via web; not locally downloaded or aligned."},
            {"url": "https://ebooks.tirumala.org/downloads/garudapuran.pdf", "role": "TTD institutional digest opened via web; supports the 16-chapter selection approach, not an independent Sanskrit collation."},
        ],
        "pending": ["Collate selected OCR against print scans and independent textual witnesses.", "Write and review clearly labelled short Hindi/English editorial readings; none authored here.", "Resolve translation reproduction rights before app reuse.", "Keep editions and ritual variants explicit; do not promote topic pointers to verse-level matches."],
        "items": records,
    }
    (DOCS / "curated-selection.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"items": len(records), "stories": sum(r["kind"] == "story" for r in records),
                      "uniqueSourcePages": len({p for r in records for p in r["sourcePages"]}),
                      "sourceTextCharacters": sum(r["textCharacters"] for r in records),
                      "releaseEligible": False}))


if __name__ == "__main__":
    build()
