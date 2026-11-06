"""Voice-over clips for the bhajan cut (Kokoro-82M, Apache-2.0), optionally Whisper-checked.

{display|spoken} spans are phonemised as Hindi (Indic terms in English lines; pronunciation spellings in Hindi).
Usage: python voice.py --models <dir with kokoro-v1.0.onnx, voices-v1.0.bin> [--whisper <turbo dir>] [--out DIR]
"""
import argparse
import json
import re
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
SPAN = re.compile(r"\{([^|}]+)\|([^}]+)\}")
ap = argparse.ArgumentParser()
ap.add_argument("--models", required=True)
ap.add_argument("--whisper")
ap.add_argument("--out", default=str(ROOT / "marketing/reels/out/bhajan-cut"))
args = ap.parse_args()
cfg = json.loads((HERE / "storyboard.json").read_text())["voiceOver"]
out = Path(args.out); out.mkdir(parents=True, exist_ok=True)
k = Kokoro(str(Path(args.models) / "kokoro-v1.0.onnx"), str(Path(args.models) / "voices-v1.0.bin"))
check = None
if args.whisper:
    sys.path.insert(0, str(ROOT / "marketing/reels/showcases/feature-tour"))
    from whisper_check import WhisperCheck
    check = WhisperCheck(args.whisper)


def phonemes(line, lang):
    base, parts, at = ("hi" if lang == "hi" else "en-us"), [], 0

    def plain(seg):
        lead = re.match(r"\s*([।.,?!]+)", seg)
        if lead and parts:
            parts[-1] += "," if lead.group(1).startswith(",") else "."
            seg = seg[lead.end():]
        if seg.strip():
            parts.append(k.tokenizer.phonemize(seg, base))

    for m in SPAN.finditer(line):
        plain(line[at:m.start()]); parts.append(k.tokenizer.phonemize(m.group(2), "hi")); at = m.end()
    plain(line[at:])
    ph = re.sub(r"\s+([,.?!])", r"\1", " ".join(p.strip() for p in parts))
    for wrong, right in cfg["phonemeFixes"].items():
        ph = ph.replace(wrong, right)
    return ph


rows = []
for voice in cfg["voices"]:
    for lang in ("hi", "en"):
        for i, line in enumerate(cfg["lines"]):
            ph = phonemes(line[lang], lang)
            s, sr = k.create(ph, voice=voice, speed=cfg["speed"], is_phonemes=True)
            f = out / f"vo-{voice}-{lang}-{i}.wav"
            sf.write(f, s, sr)
            row = {"voice": voice, "lang": lang, "i": i, "shot": line["shot"], "text": SPAN.sub(r"\1", line[lang]), "file": f.name, "seconds": round(len(s) / sr, 3)}
            if check:
                row["whisper"] = check.transcribe(s, sr, lang)
            rows.append(row)
            print(f"{voice} {lang} {i} {row['seconds']:.2f}s  {row.get('whisper', '')}", flush=True)
(out / "vo.json").write_text(json.dumps(rows, ensure_ascii=False, indent=1))
