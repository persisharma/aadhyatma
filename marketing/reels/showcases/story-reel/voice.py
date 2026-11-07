"""Hindi narration for the story reel (Kokoro-82M, Apache-2.0), Whisper-checked when --whisper is given.
Usage: python voice.py --models <kokoro dir> [--story hanuman-surya|dhanteras] [--whisper <whisper-turbo dir>] [--out DIR]
"""
import argparse, json, re, sys
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
SPAN = re.compile(r"\{([^|}]+)\|([^}]+)\}")
ap = argparse.ArgumentParser()
ap.add_argument("--models", required=True); ap.add_argument("--whisper"); ap.add_argument("--story", default="hanuman-surya"); ap.add_argument("--out")
a = ap.parse_args()
cfg = json.loads((HERE / "stories" / a.story / "script.json").read_text())
out = Path(a.out or ROOT / "marketing/reels/out/story-reel" / a.story); out.mkdir(parents=True, exist_ok=True)
k = Kokoro(str(Path(a.models) / "kokoro-v1.0.onnx"), str(Path(a.models) / "voices-v1.0.bin"))
check = None
if a.whisper:
    sys.path.insert(0, str(ROOT / "marketing/reels/showcases/feature-tour"))
    from whisper_check import WhisperCheck
    check = WhisperCheck(a.whisper)
rows = []
import numpy as np
# Natural pacing ("voice.pacing": true): voice each phrase on its own and join with punctuation-sized pauses,
# so pauses fall only at commas / full stops / "…", never inside a phrase. Phrase timings feed the captions.
GAP = {",": 0.16, "—": 0.24, "।": 0.4, ".": 0.4, "?": 0.42, "!": 0.4, "…": 0.5}
SPLIT = re.compile(r"(?<=[,।?!…—.])\s*")
def synth(text):
    ph = k.tokenizer.phonemize(text, "hi")
    for wrong, right in cfg["voice"].get("phonemeFixes", {}).items():  # espeak quirks, e.g. -दशी schwa
        ph = ph.replace(wrong, right)
    return k.create(ph, voice=cfg["voice"]["voice"], speed=cfg["voice"]["speed"], is_phonemes=True)
for i, sc in enumerate(cfg["scenes"]):
    display, spoken = SPAN.sub(r"\1", sc["vo"]), SPAN.sub(r"\2", sc["vo"])  # pronunciation spellings, e.g. वेदान्श
    phrases = []
    if cfg["voice"].get("pacing"):
        dp = [x for x in SPLIT.split(display) if x.strip()]; spp = [x for x in SPLIT.split(spoken) if x.strip()]
        if len(dp) != len(spp): dp = spp
        chunks, t, sr = [], 0.0, 24000
        for k_, (d_, sp_) in enumerate(zip(dp, spp)):
            s_, sr = synth(sp_.strip())
            phrases.append({"text": d_.strip().rstrip(",।?!…—.").strip(), "s": round(t, 3), "e": round(t + len(s_) / sr, 3)})
            chunks.append(s_); t += len(s_) / sr
            if k_ < len(spp) - 1:
                g = GAP.get(sp_.strip()[-1], 0.08) * cfg["voice"].get("pauseScale", 1); chunks.append(np.zeros(int(sr * g), dtype=s_.dtype)); t += g
        s = np.concatenate(chunks)
    else:
        s, sr = synth(spoken)
    f = out / f"vo-{i:02d}.wav"; sf.write(f, s, sr)
    row = {"i": i, "id": sc["id"], "text": display, "file": f.name, "seconds": round(len(s) / sr, 3)}
    if phrases: row["phrases"] = phrases
    if check: row["whisper"] = check.transcribe(s, sr, "hi")
    rows.append(row); print(f"{sc['id']:<9} {row['seconds']:.2f}s  {row.get('whisper', '')}", flush=True)
(out / "vo.json").write_text(json.dumps(rows, ensure_ascii=False, indent=1))
