"""Synthesise the feature-tour voice-over with Kokoro-82M (Apache-2.0) and optionally verify it with Whisper.

English lines may contain {Display|देवनागरी} spans: those words are phonemised as Hindi so Indic terms
(Panchang, Choghadiya, Kundali…) are pronounced as Indian speakers say them, not anglicised.

Usage:
  python narrate.py --models <dir with kokoro-v1.0.onnx + voices-v1.0.bin> [--out DIR]
                    [--voice-en hf_alpha] [--voice-hi hf_alpha] [--whisper <sherpa-onnx-whisper-turbo dir>]
Model files: https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
Whisper (check only): https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-turbo.tar.bz2
"""
import argparse
import json
import re
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
SPAN = re.compile(r"\{([^|}]+)\|([^}]+)\}")

ap = argparse.ArgumentParser()
ap.add_argument("--models", required=True)
ap.add_argument("--out", default=str(ROOT / "marketing/reels/out/feature-tour"))
ap.add_argument("--voice-en")
ap.add_argument("--voice-hi")
ap.add_argument("--speed", type=float)
ap.add_argument("--whisper")
args = ap.parse_args()

out = Path(args.out)
out.mkdir(parents=True, exist_ok=True)
models = Path(args.models)
kokoro = Kokoro(str(models / "kokoro-v1.0.onnx"), str(models / "voices-v1.0.bin"))
board = json.loads((HERE / "storyboard.json").read_text())
cfg = board["voice"]
args.voice_en = args.voice_en or cfg["voices"]["en"]
args.voice_hi = args.voice_hi or cfg["voices"]["hi"]
args.speed = args.speed or cfg["speed"]


def fixed(ph):
    for wrong, right in cfg.get("phonemeFixes", {}).items():
        ph = ph.replace(wrong, right)
    return ph


def phonemes(line, lang):
    """Plain text uses the line's language; {display|spoken} spans are always spoken as Hindi."""
    base = "hi" if lang == "hi" else "en-us"
    parts, at = [], 0

    def plain(seg):
        # espeak reads a segment-initial danda aloud ("purna viram"); move leading punctuation onto the previous part.
        lead = re.match(r"\s*([।.,?!]+)", seg)
        if lead and parts:
            parts[-1] += "," if lead.group(1).startswith(",") else "."
            seg = seg[lead.end():]
        if seg.strip():
            parts.append(kokoro.tokenizer.phonemize(seg, base))

    for m in SPAN.finditer(line):
        plain(line[at:m.start()])
        parts.append(kokoro.tokenizer.phonemize(m.group(2), "hi"))
        at = m.end()
    plain(line[at:])
    return re.sub(r"\s+([,.?!])", r"\1", " ".join(p.strip() for p in parts))


checker = None
if args.whisper:
    import sys
    sys.path.insert(0, str(HERE))
    from whisper_check import WhisperCheck
    checker = WhisperCheck(args.whisper)

report = {"engine": "Kokoro-82M v1.0 via kokoro-onnx", "speed": args.speed, "lines": []}
for lang, voice in (("en", args.voice_en), ("hi", args.voice_hi)):
    for i, scene in enumerate(board["scenes"]):
        line = scene[lang]["vo"]
        ph = fixed(phonemes(line, lang))
        samples, sr = kokoro.create(ph, voice=voice, speed=args.speed, is_phonemes=True)
        samples = np.concatenate([samples, np.zeros(int(sr * 0.05), dtype=samples.dtype)])
        file = out / f"vo-{lang}-{i:02d}.wav"
        sf.write(file, samples, sr)
        row = {"lang": lang, "scene": scene["id"], "voice": voice, "text": SPAN.sub(r"\1", line), "phonemes": ph,
               "file": file.name, "seconds": round(len(samples) / sr, 3)}
        if checker:
            row["whisper"] = checker.transcribe(samples, sr, lang)
        report["lines"].append(row)
        print(f"{lang} {scene['id']:<10} {row['seconds']:.2f}s  {row.get('whisper', '')}", flush=True)
(out / "vo.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))
