#!/usr/bin/env python3
"""Build the complete Valmiki Ramayana payload consumed by the mobile app.

The Sanskrit/English source is pinned to the MIT-licensed structured export of
the National Sanskrit University/IIT Kanpur Southern-recension text.  Hindi is
read from the pinned RamCharit.in extraction.  The upstream structured export
contains some merged rows; this builder splits those rows at their printed
kanda.sarga.shloka markers and fetches the small set of malformed rows from the
independent verse-by-verse mirror at valmikiramayan.net.

Run from the repository root.  Supplying local sources avoids all downloads:

  python3 scripts/build-valmiki-ramayan.py \
    --corpus /path/to/Valmiki_Ramayan_Shlokas.json \
    --hindi-dir /path/to/valmiki-ramayana
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
import shutil
import tarfile
import tempfile
import unicodedata
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = REPO_ROOT / "mobile" / "src" / "data" / "valmiki-ramayan"

CORPUS_COMMIT = "3c7b5d91b3e31d8cf1b561a6366f8999ef0a29ad"
CORPUS_URL = (
    "https://raw.githubusercontent.com/Ashutosh-Vijay/"
    f"Valmiki_Ramayan_Dataset/{CORPUS_COMMIT}/data/Valmiki_Ramayan_Shlokas.json"
)
CORPUS_SHA256 = "373fec26817638ac2d808623a15262a70b2411a42112e2b68eebdab4803acbbb"

HINDI_COMMIT = "c91f3b539b3b985d23af80cf6c2457bdee59ec20"
HINDI_ARCHIVE_URL = (
    "https://github.com/andvraman/valmiki-ramayana/"
    f"archive/{HINDI_COMMIT}.tar.gz"
)
VERIFIED_TEXT_COMMIT = "e29943e3ad9362f9585a98ce6f628e77b577db99"
VERIFIED_TEXT_URL = (
    "https://github.com/vishvAsa/rAmAyaNam/tree/"
    f"{VERIFIED_TEXT_COMMIT}/vAlmIkIyam/drAviDa-pAThaH/mUlam"
)

KANDAS = [
    (1, "Bala Kanda", "बालकाण्ड", "Bala Kanda", "bala"),
    (2, "Ayodhya Kanda", "अयोध्याकाण्ड", "Ayodhya Kanda", "ayodhya"),
    (3, "Aranya Kanda", "अरण्यकाण्ड", "Aranya Kanda", "aranya"),
    (4, "Kishkindha Kanda", "किष्किन्धाकाण्ड", "Kishkindha Kanda", "kishkindha"),
    (5, "Sundara Kanda", "सुन्दरकाण्ड", "Sundara Kanda", "sundara"),
    (6, "Yuddha Kanda", "युद्धकाण्ड", "Yuddha Kanda", "yuddha"),
    (7, "Uttara Kanda", "उत्तरकाण्ड", "Uttara Kanda", "uttara"),
]

KANDA_NUMBER = {source_name: number for number, source_name, *_ in KANDAS}
DEVANAGARI_DIGITS = str.maketrans("0123456789", "०१२३४५६७८९")
RAMCHARIT_URLS = {
    1: "https://www.ramcharit.in/valmiki-ramayana-bala-kanda-in-sanskrit-with-hindi-meaning-pdf/",
    2: "https://www.ramcharit.in/valmiki-ramayana-ayodhya-kand-complete-in-hindi-pdf/",
    3: "https://www.ramcharit.in/valmiki-ramayana-aranya-kanda-in-hindi-sanskrit-complete-pdf/",
    4: "https://www.ramcharit.in/valmiki-ramayana-kiskindha-kanda-in-hindi-sanskrit-complete-pdf/",
    5: "https://www.ramcharit.in/valmiki-ramayana-sundara-kanda-in-hindi-sanskrit-complete-pdf/",
    6: "https://www.ramcharit.in/valmiki-ramayana-yuddha-kanda-in-hindi-sanskrit-complete-pdf/",
    7: "https://www.ramcharit.in/valmiki-ramayana-uttar-kanda-in-hindi-sanskrit-complete-pdf/",
}

# RamCharit.in's Yuddhakanda numbering has a few split half-verses that are
# represented with decimal identifiers in its extracted files.  These explicit
# alignments were checked against the surrounding Sanskrit and Gita Press prose.
HINDI_REFERENCE_OVERRIDES: dict[tuple[int, str, int], str] = {
    (6, "76", 81): "80.1",
    (6, "76", 82): "80.2",
    (6, "96", 33): "32",
    (6, "102", 26): "25",
    (6, "108", 4): "3.1",
    (6, "108", 9): "8.1",
    (6, "114", 12): "11",
    (6, "114", 16): "15",
    (6, "114", 32): "31",
    (6, "114", 34): "33.1",
    (6, "114", 36): "35",
    (6, "114", 44): "43",
    (6, "114", 119): "118.1",
    (6, "114", 125): "124",
    (6, "127", 6): "5",
    (6, "127", 12): "11",
    (6, "127", 14): "13",
    (6, "127", 16): "15.1",
    (6, "127", 21): "20",
}

# These two upstream rows repeat the preceding verse and its printed reference;
# neither the Gita Press-aligned Hindi source nor independent verse editions has
# the claimed extra verse.  They are source-export artefacts, not scripture.
PHANTOM_DUPLICATE_REFERENCES = {(7, "1", 42), (7, "8", 30)}

# The pinned structured export contains 28 visibly corrupted or contaminated
# rows (duplicated/reordered vowel signs, headings, OCR characters, and inline
# editorial alternatives). These readings were checked against the
# independent Dravida-patha transcription at vishvAsa/rAmAyaNam commit
# e29943e3ad9362f9585a98ce6f628e77b577db99 and, where that recension groups
# the half-verses differently, the Gita Press scan.  Keeping the corrections
# here makes the repair explicit and reproducible.
VERIFIED_TEXT_OVERRIDES: dict[tuple[int, str, int], str] = {
    (1, "1", 6): "श्रुत्वा चैतत्त्रिलोकज्ञो वाल्मीकेर्नारदो वचः। श्रूयतामिति चामन्त्र्य प्रहृष्टो वाक्यमब्रवीत्॥",
    (1, "32", 1): "ब्रह्मयोनिर्महानासीत् कुशो नाम महातपाः। अक्लिष्टव्रतधर्मज्ञः सज्जनप्रतिपूजकः॥",
    (2, "101", 2): "शाश्वतोऽयं सदा धर्मः स्थितोऽस्मासु नरर्षभ। ज्येष्ठे पुत्रे स्थिते राजा न कनीयान् भवेन्नृपः॥",
    (2, "105", 20): "अहोरात्राणि गच्छन्ति सर्वेषां प्राणिनामिह। आयूंषि क्षपयन्त्याशु ग्रीष्मे जलमिवांशवः॥",
    (2, "52", 62): "परितुष्टा हि सा देवी वनवासं गते मयि। राजानं नातिशङ्केत मिथ्यावादीति धार्मिकम्॥",
    (2, "71", 1): "स प्राङ्मुखो राजगृहादभिनिर्याय राघवः। ततस्सुदामां द्युतिमान् सन्तीर्यावेक्ष्य तां नदीम्॥",
    (6, "17", 3): "ये चाप्यनुचरास्तस्य चत्वारो भीमविक्रमाः। तेऽपि सर्वायुधोपेता भूषणैश्चापि भूषिताः॥",
    (6, "18", 22): "पिशाचान् दानवान् यक्षान् पृथिव्यां चैव राक्षसान्। अङ्गुल्यग्रेण तान् हन्यामिच्छन् हरिगणेश्वर॥",
    (6, "41", 76): "ततस्तस्याविदूरेण निपत्य स हरिपुङ्गवः। दीप्ताग्निसदृशस्तस्थावङ्गदः कनकाङ्गदः॥",
    (6, "55", 5): "परिगृह्य स तामाज्ञां रावणस्य महाबलः। बलं सम्प्रेरयामास तदा लघुपराक्रमः॥",
    (6, "58", 30): "शोणितौघमहातोयां यमसागरगामिनीम्। यकृत् प्लीहमहापङ्कां विनिकीर्णान्त्रशैवलाम्॥",
    (6, "63", 2): "दृष्टो दोषो हि योऽस्माभिः पुरा मन्त्रविनिर्णये। हितेष्वनभियुक्तेन सोऽयमासादितस्त्वया॥",
    (6, "69", 67): "स वानरान् सप्त शतानि वीरः प्रासेन दीप्तेन विनिर्बिभेद। एकः क्षणेनेन्द्ररिपुर्महात्मा जघान सैन्यं हरिपुङ्गवानाम्॥",
    (6, "69", 87): "अङ्गदस्य वचश्श्रुत्वा प्रचुक्रोध नरान्तकः। सन्दश्य दशनैरोष्ठं विनिश्श्वस्य भुजङ्गवत्॥",
    (6, "74", 60): "वज्रालयं वैश्रवणालयं च सूर्यप्रभं सूर्यनिबन्धनं च। ब्रह्मासनं शङ्करकार्मुकं च ददर्श नाभिं च वसुन्धरायाः॥",
    (6, "76", 39): "तस्य तच्छुशुभे भूयः सशरं धनुरुत्तमम्। विद्युदैरावतार्चिष्माद्द्वितीयेन्द्रधनुर्यथा॥",
    (6, "87", 7): "तथेत्युक्त्वा महातेजाः सौमित्रिर्मित्रनन्दनः। बभूवावस्थितस्तत्र चित्रं विस्फारयन् धनुः॥",
    (6, "90", 43): "स यन्तरि महातेजा हते मन्दोदरीसुतः। स्वयं सारथ्यमकरोत् पुनश्च धनुरस्पृशत्॥",
    (6, "98", 37): "महोदरं तं विनिपात्य भूमौ महागिरेः कीर्णमिवैकदेशम्। सूर्यात्मजस्तत्र रराज लक्ष्म्या सूर्यस्स्वतेजोभिरिवाप्रधृष्यः॥",
    (6, "106", 14): "श्रूयतां प्रतिदास्यामि यन्निमित्तं मया रथः। नदीवेग इवाम्भोभिः संयुगे विनिवर्तितः॥",
    (6, "116", 3): "सम्प्रविश्य यथान्यायं सीताया विदितो हरिः। ददर्श मृजया हीनां सातङ्कां रोहिणीमिव॥",
    (6, "126", 28): "तथा त्वमपि सर्वाभिः स्त्रीभिः सह महाबल॥",
    (6, "129", 10): "अपयाते त्वयि तदा समुद्भ्रान्तमृगद्विजम्। परिद्यूनमिवात्यर्थं तद्वनं समपद्यत॥",
    (7, "18", 27): "यथान्ये विविधै रोगैः पीड्यन्ते प्राणिनो मया। ते न ते प्रभविष्यन्ति मयि प्रीते न संशयः॥",
    (7, "22", 15): "ततो महाशक्तिशरैः पात्यमानैर्महोरसि। नाशक्नोत्प्रतिकर्तुं स राक्षसः शल्यपीडितः॥",
    (7, "23", 51): "रावणं त्वब्रवीन्मन्त्री प्रहस्तो नाम वारुणः। गतः खलु महाराजो ब्रह्मलोकं जलेश्वरः॥",
    (7, "25", 34): "इन्द्रजित्त्वग्रतः सैन्यात्सैनिकान्परिगृह्य च। जगाम रावणो मध्ये कुम्भकर्णश्च पृष्ठतः॥",
    (7, "49", 23): "इमां भवन्त्यः पश्यन्तु स्नेहेन परमेण हि। गौरवान्मम वाक्याच्च पूज्या वोऽस्तु विशेषतः॥",
}

# Keep Daily Bhakti and global search bounded.  The full 23k corpus remains
# available in the reader; these established anchor verses are the lightweight
# cross-feature sample and do not force seven multi-megabyte kandas into memory.
DAILY_SELECTION_REFERENCES = [
    "1.1.1", "1.1.2", "1.1.8", "1.1.98", "1.2.15", "1.2.36", "1.18.8",
    "2.25.3", "2.27.4", "2.40.9", "2.109.13",
    "3.37.2", "3.37.13", "3.50.1",
    "4.3.28", "4.3.29", "4.6.22",
    "5.12.10", "5.13.59", "5.42.33", "5.42.34",
    "6.18.3", "6.105.3", "6.105.4", "6.109.25", "6.131.99", "6.131.104",
    "7.108.1",
]

REFERENCE_MARKER = re.compile(
    r"(?:॥|।{1,2}|\|{1,2})?\s*"
    r"(?<![\d०-९.])([1-7१-७])\s*[.\-]\s*([\d०-९]+(?:\.[\d०-९]+)?)\s*[.\-,]\s*([\d०-९]+)(?![\d०-९.])\s*"
    r"(?:॥|।{1,2}|\|{1,2})?"
)

INDEPENDENT_VOWELS = {
    "अ": "a", "आ": "ā", "इ": "i", "ई": "ī", "उ": "u", "ऊ": "ū",
    "ऋ": "ṛ", "ॠ": "ṝ", "ऌ": "ḷ", "ॡ": "ḹ", "ए": "e", "ऐ": "ai",
    "ओ": "o", "औ": "au",
}
CONSONANTS = {
    "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "ṅ",
    "च": "c", "छ": "ch", "ज": "j", "झ": "jh", "ञ": "ñ",
    "ट": "ṭ", "ठ": "ṭh", "ड": "ḍ", "ढ": "ḍh", "ण": "ṇ",
    "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
    "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m",
    "य": "y", "र": "r", "ल": "l", "व": "v", "श": "ś", "ष": "ṣ",
    "स": "s", "ह": "h", "ळ": "ḻ",
}
VOWEL_SIGNS = {
    "ा": "ā", "ि": "i", "ी": "ī", "ु": "u", "ू": "ū", "ृ": "ṛ",
    "ॄ": "ṝ", "ॢ": "ḷ", "ॣ": "ḹ", "े": "e", "ै": "ai", "ो": "o",
    "ौ": "au",
}


def download(url: str, target: Path) -> None:
    request = urllib.request.Request(url, headers={"User-Agent": "Aadhyatma-content-builder/1.0"})
    with urllib.request.urlopen(request, timeout=90) as response, target.open("wb") as output:
        shutil.copyfileobj(response, output)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def prepare_sources(args: argparse.Namespace, temp_dir: Path) -> tuple[Path, Path]:
    if args.corpus:
        corpus = args.corpus.resolve()
    else:
        corpus = temp_dir / "Valmiki_Ramayan_Shlokas.json"
        download(CORPUS_URL, corpus)
    if sha256(corpus) != CORPUS_SHA256:
        raise ValueError(f"corpus hash mismatch: {corpus}")

    if args.hindi_dir:
        hindi_dir = args.hindi_dir.resolve()
    else:
        archive = temp_dir / "hindi.tar.gz"
        download(HINDI_ARCHIVE_URL, archive)
        with tarfile.open(archive, "r:gz") as tar:
            members = tar.getmembers()
            if any(member.name.startswith("/") or ".." in Path(member.name).parts for member in members):
                raise ValueError("unsafe Hindi source archive")
            tar.extractall(temp_dir / "hindi", filter="data")
        roots = [path for path in (temp_dir / "hindi").iterdir() if path.is_dir()]
        if len(roots) != 1:
            raise ValueError("unexpected Hindi source archive layout")
        hindi_dir = roots[0]
    return corpus, hindi_dir


def normalize_sarga(value: Any) -> str:
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value)


def collapse_space(value: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(value)).strip()


def strip_tags(value: str) -> str:
    value = re.sub(r"<br\s*/?>", "\n", value, flags=re.I)
    return collapse_space(re.sub(r"<[^>]+>", " ", value))


def source_segments(text: str) -> dict[tuple[int, str, int], str]:
    matches = list(REFERENCE_MARKER.finditer(text))
    segments: dict[tuple[int, str, int], str] = {}
    previous_end = 0
    for marker in matches:
        segment = text[previous_end:marker.end()]
        key = (
            int(marker.group(1).translate(str.maketrans("०१२३४५६७८९", "0123456789"))),
            marker.group(2).translate(str.maketrans("०१२३४५६७८९", "0123456789")),
            int(marker.group(3).translate(str.maketrans("०१२३४५६७८९", "0123456789"))),
        )
        segments[key] = segment
        previous_end = marker.end()
    return segments


def fetch_verified_override(kanda: int, sarga: str, shloka: int) -> tuple[str, str]:
    slug = KANDAS[kanda - 1][4]
    if "." in sarga:
        raise ValueError(f"cannot fetch decimal sarga override {kanda}.{sarga}.{shloka}")
    mirror_dir = {1: "baala", 4: "kish"}.get(kanda, slug)
    url = (
        f"https://www.valmikiramayan.net/utf8/{mirror_dir}/sarga{sarga}/"
        f"{slug}sans{sarga}.htm"
    )
    request = urllib.request.Request(url, headers={"User-Agent": "Aadhyatma-content-builder/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            page = response.read().decode("utf-8", errors="replace")
    except Exception as error:
        raise RuntimeError(f"failed to fetch verified override {url}#Verse{shloka}") from error
    anchor = None
    sanskrit = ""
    verse_anchor = re.search(rf'<a\s+name=["\']Verse{shloka}["\'][^>]*>', page, flags=re.I)
    candidate_area = page[verse_anchor.end():] if verse_anchor else page
    ascii_digits = str.maketrans("०१२३४५६७८९", "0123456789")
    citation_orders = ((str(kanda), sarga, str(shloka)), (sarga, str(kanda), str(shloka)))
    for candidate in re.finditer(
        r'<p\s+class=["\']SanSloka["\']>(.*?)</p>', candidate_area, flags=re.I | re.S
    ):
        candidate_text = strip_tags(candidate.group(1))
        candidate_ascii = candidate_text.translate(ascii_digits)
        has_reference = any(
            re.search(
                rf"(?<!\d){re.escape(first)}\s*[-.,]\s*{re.escape(second)}"
                rf"\s*[-.,]\s*{re.escape(third)}(?!\d)",
                candidate_ascii,
            )
            for first, second, third in citation_orders
        )
        if (verse_anchor or has_reference) and re.search(r"[\u0900-\u097f]", candidate_text):
            anchor = candidate
            sanskrit = candidate_text
            break
    if not anchor:
        raise ValueError(f"missing Sanskrit override at {url}#Verse{shloka}")
    tail = candidate_area[anchor.end():]
    meaning_match = re.search(r'<p\s+class=["\']tat["\']>(.*?)</p>', tail, flags=re.I | re.S)
    if not meaning_match:
        raise ValueError(f"missing English override at {url}#Verse{shloka}")
    return sanskrit, strip_tags(meaning_match.group(1))


def fetch_hindi_override(kanda: int, sarga: str, shloka: int) -> str:
    url = (
        "https://www.dharmasutra.org/citation/"
        f"ramayana-kaanda-{kanda}-sarga-{sarga}-shloka-{shloka}"
    )
    request = urllib.request.Request(url, headers={"User-Agent": "Aadhyatma-content-builder/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            page = response.read().decode("utf-8", errors="replace")
    except Exception as error:
        raise RuntimeError(f"failed to fetch Hindi meaning {url}") from error
    match = re.search(
        r"हिंदी अनुवाद</h3>.*?<p[^>]*>(.*?)</p>",
        page,
        flags=re.I | re.S,
    )
    if not match:
        raise ValueError(f"missing Hindi meaning at {url}")
    return strip_tags(match.group(1))


def clean_sanskrit(text: str) -> str:
    text = unicodedata.normalize("NFC", html.unescape(text))
    text = text.translate({0x200C: None, 0x200D: None, 0xFEFF: None, 0x00AD: None})
    # The structured source regularly exports Devanagari visarga as ASCII ':'.
    text = text.replace(":", "ः")
    text = REFERENCE_MARKER.sub("", text)
    # Remove malformed trailing numeric stamps after the liturgical text.
    text = re.sub(r"(?:॥|।।|\|\|)?\s*[०-९\d]+(?:[.\-][०-९\d]+){1,3}\s*(?:॥|।।|\|\|)?\s*$", "", text)
    # Citation typos and OCR footnote numbers occasionally evade the structured
    # marker regex. Digits are never part of the Sanskrit liturgical line.
    text = re.sub(r"[०-९\d]+(?:[.,\-][०-९\d]+)*", "", text)
    text = text.replace(".", " ").replace(",", " ")
    text = text.replace("।।", "॥").replace("||", "॥").replace("|", "।")
    text = re.sub(r"\s*।\s*", "। ", text)
    text = re.sub(r"\s*॥\s*", "॥ ", text)
    return collapse_space(text).strip(" ।॥")


def split_lines(text: str) -> list[str]:
    cleaned = clean_sanskrit(text)
    parts = [part.strip() for part in re.split(r"[।॥]+", cleaned) if part.strip()]
    if not parts:
        raise ValueError(f"empty Sanskrit after cleaning: {text!r}")
    return [f"{part}{'॥' if index == len(parts) - 1 else '।'}" for index, part in enumerate(parts)]


def devanagari_to_iast(text: str) -> str:
    # Normalize four rare/corrupt code points in the source export before the
    # deterministic Devanagari-to-IAST pass.
    text = text.translate(str.maketrans({"ऱ": "र", "ऺ": "र", "ॆ": "े", "ॊ": "ो"}))
    output: list[str] = []
    i = 0
    while i < len(text):
        char = text[i]
        if char in CONSONANTS:
            base = CONSONANTS[char]
            i += 1
            if i < len(text) and text[i] == "़":
                i += 1
            after = text[i] if i < len(text) else ""
            if after == "्":
                output.append(base)
                i += 1
            elif after in VOWEL_SIGNS:
                output.append(base + VOWEL_SIGNS[after])
                i += 1
            else:
                output.append(base + "a")
            continue
        if char in INDEPENDENT_VOWELS:
            output.append(INDEPENDENT_VOWELS[char])
        elif char in {"ं", "ँ"}:
            output.append("ṁ")
        elif char == "ः":
            output.append("ḥ")
        elif char == "ऽ":
            output.append("'")
        elif char not in {"्", "़", "।", "॥"} and char not in "०१२३४५६७८९":
            output.append(char)
        i += 1
    iast = collapse_space("".join(output)).strip()
    # Match the app-wide Sanskrit style in design.md §3.1: IAST diacritics
    # plus the same Hunterian-style digraphs used by the Gita corpus.
    iast = re.sub(r"ch(?!h)", "chh", iast)
    iast = re.sub(r"c(?!h)", "ch", iast)
    iast = re.sub(r"ṣ(?=[aāiīuūeoṛṝ])", "ṣh", iast)
    iast = re.sub(r"ś(?=[aāiīuūeoṛṝ])", "śh", iast)
    return re.sub(r"ṛ(?!i)", "ṛi", iast)


def load_hindi(hindi_dir: Path) -> dict[tuple[int, str, str], str]:
    lookup: dict[tuple[int, str, str], str] = {}
    merged_data_path = hindi_dir / "data.json"
    if not merged_data_path.exists():
        raise ValueError(f"missing Hindi alignment data: {merged_data_path}")
    for row in json.loads(merged_data_path.read_text(encoding="utf-8")):
        kanda = KANDA_NUMBER.get(row.get("kanda"))
        meaning = collapse_space(str(row.get("hindi") or ""))
        if kanda and meaning:
            lookup[(kanda, normalize_sarga(row["sarga"]), str(row["shloka"]))] = meaning

    files = sorted(hindi_dir.glob("hindi_*_*.json"))
    if len(files) != 647:
        raise ValueError(f"expected 647 Hindi sarga files, found {len(files)} in {hindi_dir}")
    for path in files:
        match = re.fullmatch(r"hindi_(\d+)_(.+)\.json", path.name)
        if not match:
            continue
        kanda, sarga = int(match.group(1)), match.group(2)
        rows = json.loads(path.read_text(encoding="utf-8"))
        by_number = {str(row["shloka"]): row for row in rows}
        for row in rows:
            number = str(row["shloka"])
            meaning = collapse_space(str(row.get("hindi") or ""))
            if not meaning and row.get("combined_to") is not None:
                target = by_number.get(str(row["combined_to"]))
                meaning = collapse_space(str((target or {}).get("hindi") or ""))
            if meaning:
                lookup[(kanda, sarga, number)] = meaning
    return lookup


def source_metadata(kanda: int, _kanda_slug: str) -> dict[str, Any]:
    reference_urls = [
        CORPUS_URL,
        RAMCHARIT_URLS[kanda],
        VERIFIED_TEXT_URL,
        "https://www.valmikiramayan.net/",
        "https://sanskritdocuments.org/mirrors/ramayana/valmiki/ramayana.htm",
    ]
    hindi_sources = "Gita Press Hindi prose as published by RamCharit.in"
    if kanda == 2:
        reference_urls.append(
            "https://www.dharmasutra.org/citation/ramayana-kaanda-2-sarga-102-shloka-10"
        )
        hindi_sources += ", with Dharmasutra verse meanings for one truncated source page"
    return {
        "baseText": (
            "National Sanskrit University/IIT Kanpur Southern-recension Sanskrit and English "
            "digital text (pinned MIT structured export), checked against valmikiramayan.net "
            f"and the pinned vishvAsa Dravida-patha transcription; {hindi_sources}"
        ),
        "canonicalEdition": (
            "Gita Press Srimad Valmiki Ramayana, Sanskrit text with English translation "
            "(complete 2-volume scan)"
        ),
        "canonicalEditionUrls": [
            "https://archive.org/details/valmiki-ramayana-gita-press-english",
        ],
        "canonicalEditionStatus": (
            "Verified 2026-08-01 against the searchable 2,303-page scan for all seven kandas, "
            "edition structure, Sanskrit presentation, and verse-by-verse translation format."
        ),
        "referenceUrls": reference_urls,
        "sourceVersions": {
            "structuredCorpusCommit": CORPUS_COMMIT,
            "structuredCorpusSha256": CORPUS_SHA256,
            "hindiExtractionCommit": HINDI_COMMIT,
            "verifiedTextCommit": VERIFIED_TEXT_COMMIT,
        },
        "notes": (
            "Complete 648-sarga digital corpus for this Southern-recension numbering: 23,289 "
            "verified verse records across seven kandas. Two duplicate export artefacts whose "
            "printed citations repeated the preceding Uttarakanda verse were removed. The "
            "traditional '24,000 shlokas' is "
            "a conventional total and edition counts vary. Upstream merged Sanskrit rows were "
            "split only at printed verse markers; 18 malformed/duplicate rows were replaced from "
            "the independent verse-by-verse mirror, and 28 corrupted or contaminated rows were corrected "
            "against the pinned Dravida-patha transcription and Gita Press scan. Where Gita Press gives one Hindi prose "
            "translation for a verse range, that complete combined translation is repeated for "
            "each verse in the range. RamCharit.in's Ayodhyakanda 2.102 page ends at verse 9, so "
            "verses 10-49 use independently published Hindi verse meanings from Dharmasutra. "
            "English meanings in Uttarakanda are editorial/machine-"
            "assisted in the pinned structured source; the Sanskrit and generated IAST are not."
        ),
        "retrievedOn": "2026-08-01",
    }


def build(corpus_path: Path, hindi_dir: Path) -> None:
    corpus: list[dict[str, Any]] = json.loads(corpus_path.read_text(encoding="utf-8"))
    if len(corpus) != 23_291:
        raise ValueError(f"expected 23,291 corpus rows, found {len(corpus)}")
    hindi = load_hindi(hindi_dir)

    text_frequencies = Counter(
        (
            KANDA_NUMBER[row["kanda"]],
            normalize_sarga(row["sarga"]),
            unicodedata.normalize("NFC", row["shloka_text"]).strip(),
        )
        for row in corpus
    )
    repaired_rows = 0
    marker_split_rows = 0
    missing_hindi: list[tuple[int, str, int]] = []
    chapters: dict[int, list[dict[str, Any]]] = defaultdict(list)
    seen_references: set[tuple[int, str, int]] = set()

    for row in corpus:
        kanda = KANDA_NUMBER[row["kanda"]]
        sarga = normalize_sarga(row["sarga"])
        shloka = int(row["shloka"])
        reference_key = (kanda, sarga, shloka)
        if reference_key in PHANTOM_DUPLICATE_REFERENCES:
            continue
        if reference_key in seen_references:
            raise ValueError(f"duplicate reference {reference_key}")
        seen_references.add(reference_key)

        source_text = unicodedata.normalize("NFC", row["shloka_text"]).strip()
        segments = source_segments(source_text)
        selected_text = segments.get(reference_key, source_text)
        meaning_en = collapse_space(str(row.get("explanation") or ""))
        if reference_key in segments and len(segments) > 1:
            marker_split_rows += 1

        duplicate_needs_repair = (
            text_frequencies[(kanda, sarga, source_text)] > 1 and reference_key not in segments
        )
        verified_text = VERIFIED_TEXT_OVERRIDES.get(reference_key)
        if verified_text:
            selected_text = verified_text
            repaired_rows += 1
        elif duplicate_needs_repair:
            selected_text, meaning_en = fetch_verified_override(kanda, sarga, shloka)
            override_segments = source_segments(selected_text)
            selected_text = override_segments.get(reference_key, selected_text)
            repaired_rows += 1

        lines = split_lines(selected_text)
        for line in lines:
            if re.search(r"[^\u0900-\u097f\s।॥]", line):
                raise ValueError(f"non-Sanskrit export artifact in {reference_key}: {line!r}")
        lines_en = [devanagari_to_iast(line) for line in lines]
        if not meaning_en:
            raise ValueError(f"missing English meaning for {reference_key}")

        hindi_number = HINDI_REFERENCE_OVERRIDES.get(reference_key, str(shloka))
        meaning_hi = hindi.get((kanda, sarga, hindi_number), "")
        if not meaning_hi:
            if kanda == 2 and sarga == "102" and 10 <= shloka <= 49:
                meaning_hi = fetch_hindi_override(kanda, sarga, shloka)
            else:
                missing_hindi.append(reference_key)
                meaning_hi = collapse_space(str(row.get("translation") or ""))
        if not meaning_hi:
            raise ValueError(f"missing Hindi meaning for {reference_key}")

        reference = f"{kanda}.{sarga}.{shloka}"
        chapters[kanda].append(
            {
                "id": f"valmiki-{kanda}-{sarga.replace('.', '-')}-{shloka}",
                "kanda": kanda,
                "section": "shloka",
                "stanza": kanda,
                "numInSection": len(chapters[kanda]) + 1,
                "reference": reference,
                "labelHi": f"श्लोक · {reference.translate(DEVANAGARI_DIGITS)}",
                "labelEn": f"Shloka · {reference}",
                "lines": lines,
                "linesEn": lines_en,
                "meaningHi": meaning_hi,
                "meaningEn": meaning_en,
            }
        )

    if missing_hindi:
        raise ValueError(f"Hindi alignment incomplete for {len(missing_hindi)} rows: {missing_hindi[:20]}")
    expected_repairs = 18 + len(VERIFIED_TEXT_OVERRIDES)
    if repaired_rows != expected_repairs:
        raise ValueError(
            f"expected {expected_repairs} malformed/duplicate repairs, performed {repaired_rows}"
        )

    manifest: list[dict[str, Any]] = []
    for number, _source_name, title_hi, title_en, slug in KANDAS:
        verses = chapters[number]
        sarga_count = len({verse["reference"].split(".", 2)[1] for verse in verses})
        chapter = {
            "chapter": number,
            "titleHi": title_hi,
            "titleEn": title_en,
            "sargaCount": sarga_count,
            "verseCount": len(verses),
            "source": source_metadata(number, slug),
            "verses": verses,
        }
        target = OUTPUT_DIR / f"chapter-{number:02d}.json"
        target.write_text(json.dumps(chapter, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
        manifest.append(
            {
                "chapter": number,
                "titleHi": title_hi,
                "titleEn": title_en,
                "sargaCount": sarga_count,
                "verseCount": len(verses),
            }
        )

    (OUTPUT_DIR / "chapters-manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    verse_by_reference = {
        verse["reference"]: verse
        for verses in chapters.values()
        for verse in verses
    }
    missing_daily = [ref for ref in DAILY_SELECTION_REFERENCES if ref not in verse_by_reference]
    if missing_daily:
        raise ValueError(f"daily selection references missing: {missing_daily}")
    (OUTPUT_DIR / "daily-selection.json").write_text(
        json.dumps(
            [verse_by_reference[ref] for ref in DAILY_SELECTION_REFERENCES],
            ensure_ascii=False,
            separators=(",", ":"),
        ) + "\n",
        encoding="utf-8",
    )
    print(
        f"Wrote {sum(item['verseCount'] for item in manifest):,} verses across "
        f"{sum(item['sargaCount'] for item in manifest)} sargas; "
        f"split {marker_split_rows:,} marked rows and repaired {repaired_rows} malformed rows."
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--corpus", type=Path)
    parser.add_argument("--hindi-dir", type=Path)
    args = parser.parse_args()
    with tempfile.TemporaryDirectory(prefix="aadhyatma-valmiki-") as temporary:
        corpus, hindi_dir = prepare_sources(args, Path(temporary))
        build(corpus, hindi_dir)


if __name__ == "__main__":
    main()
