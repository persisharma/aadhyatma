import importlib.util
import unittest
from collections import Counter
from pathlib import Path


spec = importlib.util.spec_from_file_location(
    "audit_shiv_puran", Path(__file__).resolve().parents[1] / "audit-shiv-puran.py",
)
audit_shiv_puran = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit_shiv_puran)


class ShivPuranAuditTest(unittest.TestCase):
    def setUp(self):
        self.verses = []
        self.inventory = []
        totals = Counter()
        for (samhita, khanda), chapter_count in audit_shiv_puran.PARTS.items():
            for chapter in range(1, chapter_count + 1):
                reference = {"samhita": samhita, "khanda": khanda, "adhyaya": str(chapter)}
                self.verses.append({
                    **reference, "shloka_number": "1", "shloka_text": "देवः ॥ १ ॥",
                })
                self.inventory.append({**reference, "num_shlokas": "1"})
                totals[samhita] += 1
        self.inventory.extend(
            {"samhita": name, "khanda": "", "adhyaya": "TOTAL", "num_shlokas": str(count)}
            for name, count in totals.items()
        )

    def test_complete_inventory_and_clean_source(self):
        result = audit_shiv_puran.audit(self.verses, self.inventory)
        self.assertEqual(result["samhitas"], 7)
        self.assertEqual(result["chapters"], 457)
        self.assertEqual(result["sourceRows"], 457)
        self.assertEqual(result["findings"], [])

    def test_reports_merged_verses_and_colophons_by_source_row(self):
        self.verses[0]["shloka_text"] = "देवः ॥ १ ॥\nइति श्रीपुराणे द्वितीयोऽध्यायः ॥ २ ॥"
        self.verses[1]["shloka_text"] = "देवः"
        result = audit_shiv_puran.audit(self.verses, self.inventory)
        self.assertEqual(result["rowsWithFindings"], 2)
        self.assertEqual(result["findings"][0]["sourceRow"], 1)
        self.assertEqual(result["findings"][0]["printedNumbers"], [1, 2])
        self.assertEqual(result["issueCounts"], {
            "printed-number-differs-from-row": 1,
            "multiple-printed-numbers": 1,
            "possible-chapter-colophon": 1,
            "missing-printed-number": 1,
        })

    def test_reports_a_blank_sanskrit_passage(self):
        self.verses[0]["shloka_text"] = "॥ १ ॥"
        result = audit_shiv_puran.audit(self.verses, self.inventory)
        self.assertEqual(result["issueCounts"], {"missing-sanskrit": 1})

    def test_rejects_a_missing_chapter_even_when_inputs_agree(self):
        self.verses.pop(0)
        self.inventory.pop(0)
        with self.assertRaisesRegex(ValueError, "457 chapters"):
            audit_shiv_puran.audit(self.verses, self.inventory)

    def test_rejects_reappearing_chapter(self):
        self.verses.insert(2, {**self.verses[0], "shloka_number": "2"})
        with self.assertRaisesRegex(ValueError, "must be contiguous"):
            audit_shiv_puran.audit(self.verses, self.inventory)
