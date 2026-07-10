"""Verify the generated dhyana assets: codec, duration, and audio structure."""
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
DIR = Path("/home/user/aadhyatma/mobile/assets/audio/dhyana")
SR = 44100
fails = []

def probe(path: Path) -> str:
    r = subprocess.run([FFMPEG, "-i", str(path)], capture_output=True, text=True)
    return r.stderr

def decode(path: Path) -> np.ndarray:
    r = subprocess.run(
        [FFMPEG, "-loglevel", "error", "-i", str(path), "-f", "s16le", "-ac", "1",
         "-ar", str(SR), "-"], capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype=np.int16).astype(np.float32) / 32768.0

def rms_db(x: np.ndarray) -> float:
    r = np.sqrt(np.mean(x**2))
    return 20 * np.log10(r) if r > 0 else -120.0

def check(name, cond, detail=""):
    print(f"  {'PASS' if cond else 'FAIL'}  {name}  {detail}")
    if not cond:
        fails.append(name)

for f in ["bell-start.m4a", "bell-end.m4a", "guided-hi.m4a", "guided-en.m4a"]:
    p = DIR / f
    info = probe(p)
    m = re.search(r"Audio: (\w+).*?(\d+) Hz, (\w+).*?(\d+) kb/s", info)
    dur = re.search(r"Duration: (\d+):(\d+):(\d+\.\d+)", info)
    secs = int(dur[1]) * 3600 + int(dur[2]) * 60 + float(dur[3])
    print(f"{f}: codec={m[1]} {m[2]}Hz {m[3]} {m[4]}kb/s dur={secs:.1f}s size={p.stat().st_size/1024:.0f}KB")
    check("codec aac mono", m[1] == "aac" and m[3] == "mono")
    check("bitrate ~64k", 48 <= int(m[4]) <= 80, f"{m[4]}kb/s")
    if f.startswith("bell"):
        check("bell duration 5-16s", 5 <= secs <= 16, f"{secs:.1f}s")
    else:
        check("guided duration 7:50-8:10", 470 <= secs <= 490, f"{secs:.1f}s")
        x = decode(p)
        seg = lambda a, b: x[int(a * SR):int(b * SR)]
        check("opening bell present", rms_db(seg(0.5, 4)) > -40, f"{rms_db(seg(0.5,4)):.0f}dB")
        check("narration @0:12", rms_db(seg(12, 18)) > -35, f"{rms_db(seg(12,18)):.0f}dB")
        check("narration @3:10", rms_db(seg(190, 196)) > -35, f"{rms_db(seg(190,196)):.0f}dB")
        check("stillness silent @5:20-5:50", rms_db(seg(320, 350)) < -60, f"{rms_db(seg(320,350)):.0f}dB")
        check("soft mid-cue @5:55", -60 < rms_db(seg(355, 358)) < -25, f"{rms_db(seg(355,358)):.0f}dB")
        check("stillness silent @6:10-7:00", rms_db(seg(370, 420)) < -60, f"{rms_db(seg(370,420)):.0f}dB")
        check("samapti narration @7:10", rms_db(seg(430, 436)) > -35, f"{rms_db(seg(430,436)):.0f}dB")
        check("end bell @7:52", rms_db(seg(472, 478)) > -40, f"{rms_db(seg(472,478)):.0f}dB")
        check("peak <= -1dBFS", np.abs(x).max() <= 0.92, f"peak={np.abs(x).max():.2f}")

total = sum(p.stat().st_size for p in DIR.glob("*.m4a"))
print(f"\ntotal m4a size: {total/1024/1024:.2f} MB")
check("folder <= 9 MB", total <= 9 * 1024 * 1024)
sys.exit(1 if fails else 0)
