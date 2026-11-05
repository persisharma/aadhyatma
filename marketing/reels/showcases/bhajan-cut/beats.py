"""Write beats.json: tracked beat times (seconds, relative to the chosen start) for the ad's soundtrack.

Cuts land on real beats rather than a fixed BPM grid; a fixed 143.55 BPM grid drifts up to 0.2 s here.
Usage: python beats.py   (reads storyboard.json "audio": {"file", "start"})
"""
import hashlib
import json
from pathlib import Path

import librosa
import numpy as np

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
cfg = json.loads((HERE / "storyboard.json").read_text())["audio"]
src = ROOT / cfg["file"]
y, sr = librosa.load(src, sr=22050, mono=True)
_, beats = librosa.beat.beat_track(y=y, sr=sr, units="time", tightness=200)
beats = np.asarray(beats)
i0 = int(np.argmin(abs(beats - cfg["start"])))
rel = (beats[i0:] - beats[i0]).round(4).tolist()
(HERE / "beats.json").write_text(json.dumps({
    "file": cfg["file"], "sha256": hashlib.sha256(src.read_bytes()).hexdigest(),
    "start": round(float(beats[i0]), 4), "beats": rel}, indent=1))
print(f"start {beats[i0]:.3f}s, {len(rel)} beats")
