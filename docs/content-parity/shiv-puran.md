# Shiv Puran corpus verification

The Granth scope is the complete seven-saṃhitā Shiv Puran with Sanskrit and a Hindi and English meaning for every verse. The reference structure used in this audit has 457 chapters across seven saṃhitās. The independently listed seven-chapter *Śivapurāṇa-māhātmya* should be tracked as a separate opening text when present in the chosen edition. [Reference contents and edition notes](https://www.wisdomlib.org/hinduism/book/shiva-purana-english)

## Sanskrit candidate

The [Snskrt dataset](https://huggingface.co/datasets/snskrt/Shiv_Mahapuran/tree/26a33a41cebdb171fac7da6e6073c7e43ce3e2e7) declares Apache-2.0. Its card describes critical editions without identifying the print edition behind each section. Verify the transcription's provenance and compare its readings against a named edition before adopting it. Sanskrit Wikisource links to all seven saṃhitās. Check its individual pages' upstream credits and edition details before reusing any transcription.

| Input at the pinned revision | SHA-256 |
| --- | --- |
| `0_Shiv_Mahapuran.csv` | `7452bb6b25a5b7461c40efde4c5ddb3cec4b1d15e99575ebb71ea04dee86c0cf` |
| `1_Shiv_Mahapuran_info.csv` | `98ad0cbc6067265e292a002e88ba375c350f67ac6334f02ea045897df8e6a8d2` |

```sh
python3 scripts/audit-shiv-puran.py /path/to/0_Shiv_Mahapuran.csv \
  /path/to/1_Shiv_Mahapuran_info.csv --report /path/to/source-audit.json
```

The audit confirms all **457 chapters** and **24,489 source rows** against the supplied chapter inventory. It identifies **3,031 rows for review**. Of those, 3,028 have a final printed number that differs from the CSV row number, 343 look like chapter colophons, six carry multiple printed numbers, and one contains no Devanagari letters. A row can have several findings. Printed numbering can vary by edition, and this audit records structural differences for review. The source row count includes editorial material and cannot serve as the app's canonical verse count.

The JSON report locates each finding by saṃhitā, khaṇḍa, chapter and source row. Exit status 1 indicates a malformed input or a chapter inventory mismatch. Exit status 2 indicates passages flagged for editorial review. Exit status 0 indicates that the automated structural checks found no issues. The audit samples text structure and cannot verify wording, translation accuracy or reuse rights.

## Meanings and app integration

- The Sanskrit CSV contains no translations. Wisdomlib credits Motilal Banarsidass for the English translation and states that it reproduces the work with permission. The trilingual compilation combines that translation with a Gita Press Hindi translation and Sanskrit Documents text. Obtain reuse rights for the translations or commission independent meanings from the verified Sanskrit. Record author, source, rights and edition for each layer. [English edition](https://www.wisdomlib.org/hinduism/book/shiva-purana-english) · [Trilingual compilation and sources](https://ventpipe.blog/2026/10/20/shri-siva-mahapurana-trilingual-edition/)
- Reconcile printed references, verse ranges and colophons against a named edition. Preserve the edition's stable verse references independently of CSV row indexes. A shared meaning that spans multiple verses needs an explicit range, with each verse resolving to its reviewed meaning in both languages.
- Use a small Granth manifest to browse saṃhitā, khaṇḍa and chapter. Reuse the scripture reader's typography, bookmark and progress controls. Follow the Valmiki reader's asynchronous loading approach and keep payloads out of the launch import graph. Add the Granth entry after the Sanskrit and both meanings are complete and verified, then test the whole journey on iOS and Android.
