#!/usr/bin/env python3
"""Audit the pinned Snskrt Sanskrit transcription before Granth ingestion."""

from __future__ import annotations

import argparse
import csv
import json
import re
from collections import Counter
from pathlib import Path


PARTS = {
    ("Viśveśvarasaṃhitā", "Viśveśvarasaṃhitā"): 25,
    ("Rudrasaṃhitā", "Sṛṣṭikhaṇḍa"): 20,
    ("Rudrasaṃhitā", "Satīkhaṇḍa"): 43,
    ("Rudrasaṃhitā", "Pārvatīkhaṇḍa"): 55,
    ("Rudrasaṃhitā", "Kumārakhaṇḍa"): 20,
    ("Rudrasaṃhitā", "Yuddhakhaṇḍa"): 59,
    ("Śatarudrasaṃhitā", "Śatarudrasaṃhitā"): 42,
    ("Koṭirudrasaṃhitā", "Koṭirudrasaṃhitā"): 43,
    ("Umāsaṃhitā", "Umāsaṃhitā"): 51,
    ("Kailāsasaṃhitā", "Kailāsasaṃhitā"): 23,
    ("Vāyavīyasaṃhitā", "Pūrvabhāga"): 35,
    ("Vāyavīyasaṃhitā", "Uttarabhāga"): 41,
}
MARKER = re.compile(r"(?:॥|।।|\|\|)[ \t]*([०-९0-9]+)[ \t]*(?:॥|।।|\|\|)")
COLOPHON = re.compile(r"^[ \t]*इति[ \t]*श्री[^\n]*?(?:अध्याय|ऽध्याय|ा[ेयो]?ध्याय)", re.MULTILINE)
DEVANAGARI = re.compile(r"[\u0904-\u0939]")
DEVANAGARI_DIGITS = str.maketrans("०१२३४५६७८९", "0123456789")


def read_csv(path: Path, required_fields: set[str]) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as source:
        reader = csv.DictReader(source, strict=True)
        fields = set(reader.fieldnames or [])
        missing = required_fields - fields
        if missing:
            raise ValueError(f"{path}: missing CSV columns {', '.join(sorted(missing))}")
        return list(reader)


def chapter_key(row: dict[str, str]) -> tuple[str, str, int]:
    return row["samhita"], row["khanda"], int(row["adhyaya"])


def audit(
    verses: list[dict[str, str]], inventory: list[dict[str, str]],
) -> dict:
    expected_chapters = [
        (samhita, khanda, number)
        for (samhita, khanda), length in PARTS.items()
        for number in range(1, length + 1)
    ]
    expected_rows = {}
    expected_totals = {}
    for row in inventory:
        count = int(row["num_shlokas"])
        if row["adhyaya"] == "TOTAL":
            section = row["samhita"]
            if section in expected_totals:
                raise ValueError(f"Duplicate section in the inventory: {section}")
            expected_totals[section] = count
            continue
        key = chapter_key(row)
        if key in expected_rows or count < 1:
            raise ValueError(f"Duplicate chapter or invalid row count in the inventory: {key}")
        expected_rows[key] = count
    if list(expected_rows) != expected_chapters:
        raise ValueError("The chapter inventory must match the 457 chapters in edition order")

    findings = []
    issue_counts: Counter[str] = Counter()
    counts: Counter[tuple[str, str, int]] = Counter()
    section_rows: Counter[str] = Counter()
    previous_chapter = None
    for row in verses:
        key = chapter_key(row)
        row_number = int(row["shloka_number"])
        if key != previous_chapter and counts[key]:
            raise ValueError(f"{key}: the chapter's source rows must be contiguous")
        previous_chapter = key
        counts[key] += 1
        section_rows[key[0]] += 1
        if row_number != counts[key]:
            raise ValueError(f"{key}: expected source row {counts[key]}, got {row_number}")

        passage = row["shloka_text"]
        numbers = [int(value.translate(DEVANAGARI_DIGITS)) for value in MARKER.findall(passage)]
        issues = []
        if not DEVANAGARI.search(passage):
            issues.append("missing-sanskrit")
        if not numbers:
            issues.append("missing-printed-number")
        elif numbers[-1] != row_number:
            issues.append("printed-number-differs-from-row")
        if len(numbers) > 1:
            issues.append("multiple-printed-numbers")
        if COLOPHON.search(passage):
            issues.append("possible-chapter-colophon")
        if issues:
            issue_counts.update(issues)
            findings.append({
                "samhita": key[0],
                "khanda": key[1],
                "chapter": key[2],
                "sourceRow": row_number,
                "printedNumbers": numbers,
                "issues": issues,
            })

    if dict(counts) != expected_rows or list(counts) != expected_chapters:
        raise ValueError("The Sanskrit rows must match the chapter inventory in edition order")
    if dict(section_rows) != expected_totals:
        raise ValueError("The Sanskrit section row counts do not match the inventory totals")

    return {
        "samhitas": len(section_rows),
        "chapters": len(counts),
        "sourceRows": len(verses),
        "rowsWithFindings": len(findings),
        "issueCounts": dict(issue_counts),
        "findings": findings,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("verses", type=Path, help="0_Shiv_Mahapuran.csv")
    parser.add_argument("inventory", type=Path, help="1_Shiv_Mahapuran_info.csv")
    parser.add_argument("--report", type=Path, help="write findings by source row as JSON")
    args = parser.parse_args()
    chapter_fields = {"samhita", "khanda", "adhyaya"}
    try:
        result = audit(
            read_csv(args.verses, chapter_fields | {"shloka_number", "shloka_text"}),
            read_csv(args.inventory, chapter_fields | {"num_shlokas"}),
        )
        if args.report:
            args.report.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    except (OSError, TypeError, ValueError, csv.Error) as error:
        parser.exit(1, f"Audit error: {error}\n")
    summary = {key: value for key, value in result.items() if key != "findings"}
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    if result["rowsWithFindings"]:
        parser.exit(2, "Source rows need editorial review before import.\n")


if __name__ == "__main__":
    main()
