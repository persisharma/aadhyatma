"""Research extraction tests. Fixture text is deliberately not scripture."""
import importlib.util
import tempfile
import unittest
from pathlib import Path

from bs4 import BeautifulSoup

spec = importlib.util.spec_from_file_location(
    "garud_gather", Path(__file__).resolve().parents[1] / "gather-garud-puran.py"
)
gather = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gather)


class ResearchExtractionTests(unittest.TestCase):
    def test_source_is_lossless_including_unnumbered_material(self):
        text = "INTRO\nfixture A ॥ १,१.१॥\nSPEAKER\nfixture B ॥ १,१.२॥\nCOLOPHON"
        rows, suffix = gather.extract_spans(text, gather.DEV_REF, "fixture")
        self.assertEqual([r["reference"] for r in rows], ["1.1.1", "1.1.2"])
        self.assertEqual("".join(r["sourceSpan"] for r in rows) + suffix, text)
        self.assertIn("SPEAKER", rows[1]["sourceSpan"])
        self.assertTrue(all(not r["releaseEligible"] for r in rows))

    def test_duplicates_are_preserved_and_reported(self):
        rows, _ = gather.extract_spans(
            "A // GarP_1,1.1 // B // GarP_1,1.1 // C // GarP_1,3.3 //", gather.IAST_REF, "fixture"
        )
        report = gather.audit_refs(rows)
        self.assertEqual(report["duplicateReferences"], {"1.1.1": 2})
        self.assertEqual(report["books"][0]["missingChapterNumbers"], [2])
        self.assertEqual(report["verseNumberGaps"], [{"book": 1, "chapter": 3, "missing": [1, 2]}])
        self.assertEqual(len({r["recordId"] for r in rows}), 3)

    def test_reference_match_does_not_consume_malformed_markers(self):
        text = "A ॥ १,१.१॥\nB ॥ १,?.२॥\nC ॥ १,१.३॥"
        rows, suffix = gather.extract_spans(text, gather.DEV_REF, "fixture")
        self.assertEqual(len(rows), 2)
        self.assertEqual("".join(r["sourceSpan"] for r in rows) + suffix, text)
        self.assertEqual(gather.audit_refs(rows)["verseNumberGaps"][0]["missing"], [2])

    def test_added_verses_and_source_punctuation_variants_survive(self):
        rows, suffix = gather.extract_spans("A ॥ १,१.१॥ B ॥ १,१.१*१॥ C १,१.२ ।", gather.DEV_REF, "fixture")
        self.assertEqual([r["reference"] for r in rows], ["1.1.1", "1.1.1*1", "1.1.2"])
        self.assertEqual(gather.audit_refs(rows)["duplicateReferences"], {})
        self.assertEqual(suffix, "")

    def test_hindi_excludes_navigation_and_keeps_source_page(self):
        soup = BeautifulSoup('<div class="reader-pane"><div><span>पृष्ठ 7</span>'
            '<a href="/hi/granth/garuda-puran-gita-press/7">स्थायी लिंक</a></div>'
            '<div class="font-body"><p>Research fixture.</p><p>Second paragraph.</p></div></div>', "html.parser")
        row = gather.extract_hindi_page(soup.div, "fixture.html")
        self.assertEqual(row["page"], 7)
        self.assertEqual(row["text"], "Research fixture.\nSecond paragraph.")
        self.assertFalse(row["releaseEligible"])

    def test_hindi_ocr_placeholder_is_not_presented_as_translation(self):
        soup = BeautifulSoup('<div><a href="/hi/granth/garuda-puran-gita-press/2">page</a>'
            '<div class="font-body">The provided image is completely blank.</div></div>', "html.parser")
        self.assertTrue(gather.extract_hindi_page(soup.div, "fixture.html")["hasOcrPlaceholder"])

    def test_hash_mismatch_stops_cached_source_reuse(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "raw").mkdir()
            (root / "raw/source.txt").write_text("modified")
            gather.dump(root / "raw/source.txt.meta.json", {"url": "https://example.org/source", "sha256": "invalid"})
            with self.assertRaisesRegex(ValueError, "hash mismatch"):
                gather.fetch(root, "source.txt", "https://example.org/source")


if __name__ == "__main__":
    unittest.main()
