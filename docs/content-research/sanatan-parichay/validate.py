#!/usr/bin/env python3
"""Validate research structure and cross-references, not religious correctness."""
import json
import re
from pathlib import Path
from collections import Counter

HERE = Path(__file__).resolve().parent
errors = []
checks = 0

def check(condition, message):
    global checks
    checks += 1
    if not condition:
        errors.append(message)

sources = json.loads((HERE / "sources.json").read_text(encoding="utf-8"))["sources"]
catalogue = json.loads((HERE / "catalogue.json").read_text(encoding="utf-8"))
source_ids = {s["id"] for s in sources}
check(len(source_ids) == len(sources), "Duplicate source IDs")
check(len(sources) == 107, "Source record count")
check(len(catalogue["collections"]) == 13, "Collection count")
check(len(catalogue["topics"]) == 201, "Topic count")
check(catalogue["publication_cleared"] is False, "Publication gate")
collection_ids = {c["id"] for c in catalogue["collections"]}
topic_ids = [t["id"] for t in catalogue["topics"]]
check(len(set(topic_ids)) == len(topic_ids), "Duplicate topic IDs")

for source in sources:
    check(all(source.get(k) for k in ["id", "title", "url", "edition",
        "checked_locator", "access_status", "notes"]), "Source metadata: " + source["id"])
    check(source["url"].startswith("https://"), "Source URL: " + source["id"])
for topic in catalogue["topics"]:
    check(topic["collection"] in collection_ids, "Unknown collection: " + topic["id"])
    check(bool(topic["title"]["hi"] and topic["title"]["en"]), "Bilingual title: " + topic["id"])
    check(topic["publication_status"] == "draft", "Active topic: " + topic["id"])
    check(topic["evidence"] in catalogue["evidence_statuses"], "Evidence status: " + topic["id"])
    check((HERE / topic["dossier"]).exists(), "Missing dossier: " + topic["id"])
    check(set(topic["source_refs"]) <= source_ids, "Unknown source: " + topic["id"])
    check(bool(topic["source_refs"]) or topic["evidence"] == "follow_up",
        "Unsourced completed topic: " + topic["id"])

rosters = catalogue["rosters"]
for key in ["brihadaranyaka_3_9", "satapatha_4_5_7_2"]:
    check(sum(g["count"] for g in rosters[key]["groups"]) == 33, "33 arithmetic: " + key)
vp = rosters["vishnu_purana_1_15"]
for group, count in [("vasus", 8), ("rudras", 11), ("adityas", 12)]:
    check(len(vp[group]) == len(set(vp[group])) == count, "Puranic roster: " + group)
dikpal = rosters["dikpal_kamika"]
check(len(dikpal["horizontal"]) == 8 and len(dikpal["vertical"]) == 2, "Direction count")
check({d["direction"] for d in dikpal["vertical"]} == {"above", "below"}, "Vertical directions")
for key, size in [("dashavatara_drik", 10), ("dashavatara_jayadeva", 10),
    ("navdurga_kavacha", 9), ("ashtalakshmi_stotra", 8), ("ashtalakshmi_temple", 8),
    ("saptarshi_bhagavata_8_13_5", 7)]:
    check(len(rosters[key]["members"]) == len(set(rosters[key]["members"])) == size,
        "Roster count: " + key)
check(rosters["dashavatara_drik"]["members"] != rosters["dashavatara_jayadeva"]["members"],
    "Dashavatara variants collapsed")
check(len([t for t in catalogue["topics"] if t["collection"] == "symbols" and t.get("phase") == 1]) == 12,
    "Twelve core symbols")
check(len([t for t in catalogue["topics"] if t.get("existing_deity_id")]) == 21,
    "Existing deity audit count")
check(Counter(t["evidence"] for t in catalogue["topics"]) ==
    {"draft_summary": 18, "reference_seed": 169, "follow_up": 14}, "Evidence counts")

def anchors(text):
    counts = Counter()
    result = set()
    for line in text.splitlines():
        if not re.match(r"^#{1,6} ", line):
            continue
        heading = re.sub(r"^#{1,6} ", "", line).strip().lower()
        heading = re.sub(r"[^\w\-\s]", "", heading, flags=re.UNICODE)
        heading = re.sub(r"\s", "-", heading)
        duplicate = counts[heading]
        counts[heading] += 1
        result.add(heading + (("-" + str(duplicate)) if duplicate else ""))
    return result

for path in HERE.glob("*.md"):
    text = path.read_text(encoding="utf-8")
    check(len(re.findall(r"^# ", text, re.M)) == 1, "Single title: " + path.name)
    check("\ufffd" not in text, "Replacement character: " + path.name)
    check(not any(line.rstrip() != line for line in text.splitlines()), "Trailing whitespace: " + path.name)
    for target in re.findall(r"\]\(([^)]+)\)", text):
        if re.match(r"^[a-z]+://", target):
            continue
        filename, _, anchor = target.partition("#")
        destination = (path.parent / filename).resolve() if filename else path
        check(destination.exists(), "Broken local link: " + path.name + " -> " + target)
        if destination.exists() and anchor and destination.suffix == ".md":
            check(anchor in anchors(destination.read_text(encoding="utf-8")),
                "Broken anchor: " + path.name + " -> " + target)
    for match in re.findall(r"sources\.md#([a-z0-9-]+)", text):
        check(match.upper() in source_ids, "Unknown source anchor: " + match)

faq = (HERE / "faq.md").read_text(encoding="utf-8")
check(len(re.findall(r"^\| \d+ \|", faq, re.M)) == 44, "FAQ count")
result = {"status": "FAIL" if errors else "PASS", "checks": checks,
    "sources": len(sources), "topics": len(catalogue["topics"]),
    "collections": len(collection_ids), "faq": 44, "errors": errors}
print(json.dumps(result, ensure_ascii=False, indent=2))
raise SystemExit(1 if errors else 0)
