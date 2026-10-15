#!/usr/bin/env python3
"""Collect Garud Puran research sources; never write to the mobile application.

Requires beautifulsoup4. Raw third-party sources and derived research data stay
under the repository's ignored tmp/ directory. This is acquisition, not textual
verification or permission to redistribute. See docs/content/garud-puran/README.md.
"""
from __future__ import annotations

import argparse
import concurrent.futures
import datetime as dt
import hashlib
import json
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "tmp/garud-puran"
SOURCES = {
    "sanskritdocuments.html": "https://sanskritdocuments.org/doc_purana/garuDapurANa.html",
    "gretil.html": "https://gretil.sub.uni-goettingen.de/gretil/corpustei/transformations/html/sa_garuDapurANa.htm",
    "bharatkosha.html": "https://bharatkosha.org/hi/granth/garuda-puran-gita-press",
    "dutt-index.html": "https://www.wisdomlib.org/hinduism/book/the-garuda-purana-dutt",
    "dutt-archive-meta.json": "https://archive.org/metadata/cu31924023202819",
    "dutt-original-ocr.txt": "https://archive.org/download/cu31924023202819/cu31924023202819_djvu.txt",
    "dutt-original-pages.xml": "https://archive.org/download/cu31924023202819/cu31924023202819_djvu.xml",
    "hindi-archive-meta.json": "https://archive.org/metadata/garuda-puran-gita-press-gorakhpur",
    "hindi-original-ocr.txt": "https://archive.org/download/garuda-puran-gita-press-gorakhpur/Garuda%20Puran%20-%20Gita%20Press%20Gorakhpur_djvu.txt",
}
DEV_DIGITS = str.maketrans("०१२३४५६७८९", "0123456789")
# Retain the source's appended *1 verses and inconsistent closing punctuation.
# Some Devanagari references lack an opening danda; do not silently drop them.
DEV_REF = re.compile(r"([०-९]+),([०-९]+)\.([०-९]+)(\*[०-९]+)?\s*[।॥]")
IAST_REF = re.compile(r"GarP_(\d+),(\d+)\.(\d+)(\*\d+)?\s*/{1,2}")


def dump(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def jsonl(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("".join(json.dumps(row, ensure_ascii=False) + "\n" for row in rows), encoding="utf-8")


def fetch(root: Path, name: str, url: str) -> dict:
    path = root / "raw" / name
    sidecar = path.with_name(path.name + ".meta.json")
    if path.exists() and sidecar.exists():
        meta = json.loads(sidecar.read_text())
        if meta["url"] == url and hashlib.sha256(path.read_bytes()).hexdigest() == meta["sha256"]:
            return {"file": name, "status": "cached", **meta}
        raise ValueError(f"Cache provenance/hash mismatch: {path}")
    path.parent.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(url, headers={"User-Agent": "Vedansh-SourceResearch/1.0"})
    limit = 80_000_000
    with urllib.request.urlopen(request, timeout=40) as response:
        if int(response.headers.get("Content-Length", "0")) > limit:
            raise ValueError(f"Source exceeds {limit} byte research download limit")
        data = response.read(limit + 1)
        if len(data) > limit:
            raise ValueError("Source exceeds research download limit")
        meta = {
            "url": url, "resolvedUrl": response.url,
            "retrievedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
            "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(),
        }
    path.write_bytes(data)
    dump(sidecar, meta)
    return {"file": name, "status": "downloaded", **meta}


def collect(root: Path) -> None:
    # Two concurrent requests per batch; downloaded sources are reused by hash.
    supplemental = json.loads((ROOT / "docs/content/garud-puran/supplemental-sources.json").read_text())
    jobs = list(SOURCES.items()) + list(supplemental.items()) + [
        (f"hindi-pages/{start:04}.html", SOURCES["bharatkosha.html"] + f"?from={start}")
        for start in range(21, 635, 20)
    ]
    results = []
    def run(job: tuple[str, str]) -> dict:
        name, url = job
        try:
            result = fetch(root, name, url)
        except Exception as error:
            result = {"file": name, "url": url, "status": "failed", "error": str(error)}
        print(f"{result['status']}: {name}", flush=True)
        return result
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        results.extend(pool.map(run, jobs))
    dump(root / "fetch-results.json", results)


def extract_spans(text: str, pattern: re.Pattern, source_id: str) -> tuple[list[dict], str]:
    """Keep all text between references, including speakers/colophons. No repair.

    These are source spans, NOT publication-ready verse lines. A span can include
    an opening invocation, chapter heading or colophon before its numbered verse.
    Character offsets reconstruct the complete extracted source losslessly.
    """
    rows, previous = [], 0
    for i, match in enumerate(pattern.finditer(text), 1):
        book, chapter, verse = [int(x.translate(DEV_DIGITS)) for x in match.groups()[:3]]
        suffix = (match.group(4) or "").translate(DEV_DIGITS)
        rows.append({
            "recordId": f"{source_id}-{i:05}", "sourceId": source_id,
            "reference": f"{book}.{chapter}.{verse}{suffix}", "sourceMarker": match.group(),
            "book": book, "chapter": chapter, "verse": verse,
            "startOffset": previous, "endOffset": match.end(),
            "sourceSpan": text[previous:match.end()],
            "status": "extracted-unverified", "releaseEligible": False,
        })
        previous = match.end()
    return rows, text[previous:]


def audit_refs(rows: list[dict]) -> dict:
    ref_counts = Counter(row["reference"] for row in rows)
    chapters = defaultdict(list)
    books = defaultdict(set)
    for row in rows:
        chapters[(row["book"], row["chapter"])].append(row["verse"])
        books[row["book"]].add(row["chapter"])
    return {
        "records": len(rows), "uniqueReferences": len(ref_counts),
        "chapters": len(chapters),
        "books": [{"book": b, "chapterCount": len(cs), "firstChapter": min(cs),
                   "lastChapter": max(cs), "missingChapterNumbers": sorted(set(range(1, max(cs)+1))-cs),
                   "records": sum(len(v) for (book, _), v in chapters.items() if book == b)}
                  for b, cs in sorted(books.items())],
        "duplicateReferences": {r: n for r, n in ref_counts.items() if n > 1},
        "verseNumberGaps": [
            {"book": b, "chapter": c, "missing": sorted(set(range(1, max(vs)+1))-set(vs))}
            for (b, c), vs in sorted(chapters.items())
            if set(range(1, max(vs)+1))-set(vs)
        ],
        "note": "Counts describe source reference markers, not a certified canonical verse total. Number gaps and duplicates are preserved for review; outlier labels (e.g. 3.28.1130) can create apparent gaps without proving missing text.",
    }


def extract_hindi_page(pane, file: str) -> dict:
    link = pane.find("a", href=re.compile(r"/garuda-puran-gita-press/\d+$"))
    if not link:
        raise ValueError(f"Hindi page permalink missing: {file}")
    number = int(link["href"].rsplit("/", 1)[-1])
    body = pane.select_one(".font-body")
    if body is None:
        raise ValueError(f"Hindi page {number} body missing")
    text = body.get_text("\n", strip=True)
    return {
        "page": number, "sourceId": "bharatkosha-gita-press-abridged-hi",
        "sourceUrl": urllib.parse.urljoin("https://bharatkosha.org", link["href"]),
        "rawFile": file, "text": text, "html": body.decode_contents(),
        "status": "ocr-unverified", "releaseEligible": False,
        "hasOcrPlaceholder": bool(re.search(r"provided image|no text to transcribe|completely blank", text, re.I)),
    }


def extract_ocr_pages(path: Path, source_id: str) -> list[dict]:
    tree = ET.parse(path)
    rows = []
    for i, obj in enumerate(tree.findall(".//OBJECT")):
        lines = [" ".join("".join(w.itertext()) for w in line.findall("WORD")) for line in obj.findall(".//LINE")]
        rows.append({"scanIndex": i, "sourceId": source_id,
                     "text": "\n".join(lines), "status": "ocr-unverified", "releaseEligible": False})
    return rows


def build(root: Path) -> dict:
    raw, out = root / "raw", root / "extracted"
    out.mkdir(parents=True, exist_ok=True)
    reports, ref_sets = {}, {}
    for name, pattern in [("sanskritdocuments", DEV_REF), ("gretil", IAST_REF)]:
        soup = BeautifulSoup((raw / f"{name}.html").read_text(), "html.parser")
        element = soup.find("pre") if name == "sanskritdocuments" else soup.find("div", {"xml:lang": "sa-Latn"})
        if element is None:
            raise ValueError(f"{name}: source text container missing")
        text = element.get_text()
        rows, suffix = extract_spans(text, pattern, name)
        if not rows:
            raise ValueError(f"{name}: no numbered source records")
        assert "".join(row["sourceSpan"] for row in rows) + suffix == text
        (out / f"{name}.txt").write_text(text, encoding="utf-8")
        (out / f"{name}-trailing.txt").write_text(suffix, encoding="utf-8")
        jsonl(out / f"{name}-records.jsonl", rows)
        grouped = defaultdict(list)
        for row in rows:
            grouped[(row["book"], row["chapter"])].append(row)
        for (book, chapter), records in grouped.items():
            dump(out / name / f"book-{book}" / f"chapter-{chapter:03}.json", records)
        reports[name] = audit_refs(rows)
        ref_sets[name] = set(row["reference"] for row in rows)
    reports["sourceRelationship"] = "SanskritDocuments credits GRETIL. These are related transcriptions, NOT two independent attestations."
    reports["referenceDifferences"] = {
        "onlySanskritDocuments": sorted(ref_sets["sanskritdocuments"] - ref_sets["gretil"]),
        "onlyGretil": sorted(ref_sets["gretil"] - ref_sets["sanskritdocuments"]),
    }
    supplement_path = raw / "wikisource-chapter62.json"
    if supplement_path.exists():
        wikitext = json.loads(supplement_path.read_text())["parse"]["wikitext"]["*"]
        poem = re.search(r"<poem>(.*?)</poem>", wikitext, re.S)
        if not poem:
            raise ValueError("Wikisource chapter 62 has no poem container")
        text = poem.group(1)
        rows, previous = [], 0
        for match in re.finditer(r"॥\s*62\.(\d+)\s*॥", text):
            rows.append({"reference": f"1.62.{match.group(1)}", "sourceId": "wikisource-chapter62",
                         "sourceSpan": text[previous:match.end()], "status": "extracted-unverified",
                         "releaseEligible": False})
            previous = match.end()
        dump(out / "supplemental/wikisource-chapter62.json", {
            "sourceUrl": "https://sa.wikisource.org/wiki/गरुडपुराणम्/आचारकाण्डः/अध्यायः_६२",
            "note": "Separate gap candidate; not merged into GRETIL. Edition alignment and independent scan verification pending.",
            "verses": rows, "trailingText": text[previous:],
        })
        reports["chapter62Supplement"] = {"records": len(rows), "mergedIntoBase": False}

    hindi = {}
    for path in [raw / "bharatkosha.html", *sorted((raw / "hindi-pages").glob("*.html"))]:
        soup = BeautifulSoup(path.read_text(), "html.parser")
        for pane in soup.select(".reader-pane"):
            row = extract_hindi_page(pane, str(path.relative_to(root)))
            if row["page"] in hindi and hindi[row["page"]]["text"] != row["text"]:
                raise ValueError(f"Conflicting Hindi source snapshots: page {row['page']}")
            hindi[row["page"]] = row
    rows = [hindi[p] for p in sorted(hindi)]
    jsonl(out / "hindi-abridged-pages.jsonl", rows)
    soup = BeautifulSoup((raw / "bharatkosha.html").read_text(), "html.parser")
    toc = [{"title": a.get_text(" ", strip=True), "url": urllib.parse.urljoin("https://bharatkosha.org", a["href"])}
           for a in soup.select("a[href]") if "/adhyay/" in a["href"]]
    dump(out / "hindi-abridged-contents.json", toc)
    reports["hindi"] = {
        "edition": "Gita Press 1189: Sankshipta Garud Puran, Hindi only; abridged",
        "expectedPages": 634, "pagesCollected": len(rows),
        "missingPages": sorted(set(range(1, 635)) - set(hindi)),
        "ocrPlaceholderPages": [r["page"] for r in rows if r["hasOcrPlaceholder"]],
        "contentsEntries": len(toc),
        "alignment": "Page-level reference only; not aligned verse-by-verse with the Sanskrit corpus.",
    }
    reports["hindiBilingualScans"] = []
    for volume in [1, 2]:
        path = raw / f"hindi-dli-vol{volume}.xml"
        if path.exists():
            pages = extract_ocr_pages(path, f"shriram-sharma-1968-vol{volume}")
            jsonl(out / f"hindi-sharma-vol{volume}-pages.jsonl", pages)
            reports["hindiBilingualScans"].append({
                "volume": volume, "scanPages": len(pages),
                "pdf": f"raw/hindi-dli-vol{volume}.pdf",
                "extractedPages": f"extracted/hindi-sharma-vol{volume}-pages.jsonl",
                "status": "Sanskrit/Hindi scans acquired. OCR noisy, chapter coverage and verse alignment unverified. Reuse permission not established; see the dated QA record for visual checks of this snapshot.",
            })

    xml_path = raw / "dutt-original-pages.xml"
    english = []
    if xml_path.exists():
        english = extract_ocr_pages(xml_path, "dutt-1908-cornell")
        jsonl(out / "english-dutt-pages.jsonl", english)
    soup = BeautifulSoup((raw / "dutt-index.html").read_text(), "html.parser")
    toc = [{"title": a.get_text(" ", strip=True), "url": urllib.parse.urljoin("https://www.wisdomlib.org", a["href"])}
           for a in soup.select("a[href]") if "/the-garuda-purana-dutt/d/" in a["href"]]
    dump(out / "english-dutt-contents.json", toc)
    reports["english"] = {
        "edition": "Manmatha Nath Dutt, 1908, Cornell scan cu31924023202819",
        "ocrFile": "raw/dutt-original-ocr.txt", "scanPagesExtracted": len(english),
        "contentsEntries": len(toc),
        "chapterEntries": sum(r["title"].startswith("Chapter ") for r in toc),
        "scope": "248-chapter Purva/Achara text; not a translation of all three GRETIL books.",
        "alignment": "Chapter numbering differs from GRETIL; no automatic meaningEn joins have been made.",
    }
    if (raw / "dutt-vol2.pdf").exists():
        reports["englishSupplementalScan"] = {
            "file": "raw/dutt-vol2.pdf", "ocrFile": "raw/dutt-vol2-ocr.txt",
            "edition": "The Garuda Mahapuranam volume II, New Bharatiya Book Corporation, first edition 2007; archive attributes it to M. N. Dutt.",
            "status": "Research reference only. Sanskrit/English scan; existing OCR badly garbles English. Printed all-rights-reserved notice; reuse clearance pending.",
            "scope": "Preta and Brahma research reference; see the dated QA record for inspected samples. Full collation pending.",
        }
    reports["releaseEligible"] = False
    reports["meaningHiVerseRows"] = 0
    reports["meaningEnVerseRows"] = 0
    reports["generatedAt"] = dt.datetime.now(dt.timezone.utc).isoformat()
    dump(root / "coverage-report.json", reports)
    files = []
    for path in sorted(raw.rglob("*.meta.json")):
        try:
            meta = json.loads(path.read_text())
            if "sha256" in meta:
                source = path.with_name(path.name.removesuffix(".meta.json"))
                if not source.exists() or hashlib.sha256(source.read_bytes()).hexdigest() != meta["sha256"]:
                    raise ValueError(f"Changed raw source: {source}")
                files.append({"file": str(source.relative_to(root)), **meta})
        except json.JSONDecodeError:
            raise ValueError(f"Invalid metadata: {path}")
    dump(root / "source-manifest.json", files)
    return reports


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--fetch", action="store_true", help="Fetch or hash-check cached sources before extraction")
    args = parser.parse_args()
    if args.fetch:
        collect(args.output)
    report = build(args.output)
    print(json.dumps({"sanskrit": report["sanskritdocuments"]["records"],
                      "hindiPages": report["hindi"]["pagesCollected"],
                      "englishPages": report["english"]["scanPagesExtracted"],
                      "releaseEligible": False}, indent=2))


if __name__ == "__main__":
    main()
