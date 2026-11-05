"""Hindi narration for the story reel (Kokoro-82M, Apache-2.0), Whisper-checked when --whisper is given.
Usage: python voice.py --models <kokoro dir> [--whisper <whisper-turbo dir>] [--out DIR]
"""
import argparse, json, re, sys
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
SPAN = re.compile(r"\{([^|}]+)\|([^}]+)\}")
ap = argparse.ArgumentParser()
ap.add_argument("--models", required=True); ap.add_argument("--whisper"); ap.add_argument("--out", default=str(ROOT / "marketing/reels/out/story-reel"))
a = ap.parse_args()
cfg = json.loads((HERE / "script.json").read_text())
out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
k = Kokoro(str(Path(a.models) / "kokoro-v1.0.onnx"), str(Path(a.models) / "voices-v1.0.bin"))
check = None
if a.whisper:
    sys.path.insert(0, str(ROOT / "marketing/reels/showcases/feature-tour"))
    from whisper_check import WhisperCheck
    check = WhisperCheck(a.whisper)
rows = []
for i, sc in enumerate(cfg["scenes"]):
    spoken = SPAN.sub(r"\2", sc["vo"])  # pronunciation spellings, e.g. वेदान्श
    s, sr = k.create(spoken, voice=cfg["voice"]["voice"], speed=cfg["voice"]["speed"], lang="hi")
    f = out / f"vo-{i:02d}.wav"; sf.write(f, s, sr)
    row = {"i": i, "id": sc["id"], "text": SPAN.sub(r"\1", sc["vo"]), "file": f.name, "seconds": round(len(s) / sr, 3)}
    if check: row["whisper"] = check.transcribe(s, sr, "hi")
    rows.append(row); print(f"{sc['id']:<9} {row['seconds']:.2f}s  {row.get('whisper', '')}", flush=True)
(out / "vo.json").write_text(json.dumps(rows, ensure_ascii=False, indent=1))
