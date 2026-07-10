"""Generate the PRD-15 dhyana audio assets.

Outputs (AAC mono 64 kbps .m4a) into mobile/assets/audio/dhyana/:
  bell-start.m4a   single soft temple-bell strike (~9 s)
  bell-end.m4a     three fading strikes (~15 s)
  guided-hi.m4a    ~8:05 guided dhyana, Hindi  (espeak-ng PLACEHOLDER voice)
  guided-en.m4a    ~8:05 guided dhyana, English (espeak-ng PLACEHOLDER voice)

The segment table mirrors SCRIPT-hi.md / SCRIPT-en.md — keep them in sync.
"""
import ctypes
import shutil
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import numpy as np
import espeakng_loader
import imageio_ffmpeg

SR = 44100
OUT_DIR = Path("/home/user/aadhyatma/mobile/assets/audio/dhyana")
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

# ---------------------------------------------------------------- espeak-ng
AUDIO_OUTPUT_SYNCHRONOUS = 2
espeakCHARS_UTF8 = 1
espeakRATE, espeakPITCH = 1, 3

_lib = ctypes.cdll.LoadLibrary(str(espeakng_loader.get_library_path()))
ESPEAK_SR = _lib.espeak_Initialize(
    AUDIO_OUTPUT_SYNCHRONOUS, 0, str(espeakng_loader.get_data_path()).encode(), 0
)
_chunks = []

@ctypes.CFUNCTYPE(ctypes.c_int, ctypes.POINTER(ctypes.c_short), ctypes.c_int, ctypes.c_void_p)
def _cb(wav, n, events):
    if n > 0:
        _chunks.append(np.ctypeslib.as_array(wav, shape=(n,)).copy())
    return 0

_lib.espeak_SetSynthCallback(_cb)

def speak(text: str, voice: str, rate: int = 118, pitch: int = 38) -> np.ndarray:
    """Synthesize text -> float32 mono at SR, RMS-normalized to ~-22 dBFS."""
    _chunks.clear()
    assert _lib.espeak_SetVoiceByName(voice.encode()) == 0
    _lib.espeak_SetParameter(espeakRATE, rate, 0)
    _lib.espeak_SetParameter(espeakPITCH, pitch, 0)
    b = text.encode("utf-8")
    assert _lib.espeak_Synth(b, len(b) + 1, 0, 0, 0, espeakCHARS_UTF8, None, None) == 0
    pcm = np.concatenate(_chunks).astype(np.float32) / 32768.0
    # resample espeak SR -> SR (linear; fine for a placeholder voice)
    t_src = np.arange(len(pcm)) / ESPEAK_SR
    t_dst = np.arange(int(len(pcm) * SR / ESPEAK_SR)) / SR
    out = np.interp(t_dst, t_src, pcm).astype(np.float32)
    rms = np.sqrt(np.mean(out**2)) or 1.0
    return out * (10 ** (-22 / 20) / rms)

# ---------------------------------------------------------------- synthesis
def bell_strike(f0: float = 172.0, dur: float = 9.0, amp: float = 1.0) -> np.ndarray:
    """Temple-bell / singing-bowl voice: inharmonic partials, long decay."""
    t = np.arange(int(dur * SR)) / SR
    partials = [  # ratio, level, decay seconds
        (1.00, 1.00, 5.5), (2.02, 0.55, 4.0), (2.94, 0.32, 3.0),
        (4.11, 0.18, 2.2), (5.42, 0.10, 1.6), (6.79, 0.06, 1.1),
    ]
    y = np.zeros_like(t)
    for ratio, lvl, dec in partials:
        f = f0 * ratio
        vib = 1.0 + 0.0015 * np.sin(2 * np.pi * 5.1 * t)  # slow beating shimmer
        y += lvl * np.exp(-t / dec) * np.sin(2 * np.pi * f * vib * t)
    attack = np.minimum(t / 0.012, 1.0)  # soft mallet attack, no click
    y *= attack
    y[-int(0.5 * SR):] *= np.linspace(1, 0, int(0.5 * SR))  # tail fade
    return (amp * y / np.abs(y).max()).astype(np.float32)

def place(canvas: np.ndarray, clip: np.ndarray, at_sec: float, gain: float = 1.0):
    i = int(at_sec * SR)
    j = min(i + len(clip), len(canvas))
    canvas[i:j] += clip[: j - i] * gain

def drone(dur: float) -> np.ndarray:
    """Very soft tanpura-like Sa-Pa bed (~-33 dBFS)."""
    t = np.arange(int(dur * SR)) / SR
    y = np.zeros_like(t)
    for f, lvl in [(110.0, 1.0), (110.6, 0.5), (165.0, 0.45), (220.0, 0.3), (221.1, 0.15)]:
        y += lvl * np.sin(2 * np.pi * f * t)
    y *= 1.0 + 0.12 * np.sin(2 * np.pi * 0.11 * t)  # slow swell
    y /= np.abs(y).max()
    return (y * 10 ** (-33 / 20)).astype(np.float32)

def fade(x: np.ndarray, in_sec: float = 3.0, out_sec: float = 4.0) -> np.ndarray:
    n_in, n_out = int(in_sec * SR), int(out_sec * SR)
    x[:n_in] *= np.linspace(0, 1, n_in)
    x[-n_out:] *= np.linspace(1, 0, n_out)
    return x

def write_m4a(x: np.ndarray, path: Path):
    x = np.clip(x, -1, 1)
    peak = np.abs(x).max()
    if peak > 10 ** (-1 / 20):  # master ceiling -1 dBFS
        x = x * (10 ** (-1 / 20) / peak)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        wav_path = f.name
    with wave.open(wav_path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
    subprocess.run(
        [FFMPEG, "-y", "-loglevel", "error", "-i", wav_path,
         "-c:a", "aac", "-b:a", "64k", "-ac", "1", str(path)],
        check=True,
    )
    Path(wav_path).unlink()
    print(f"wrote {path.name}: {path.stat().st_size/1024:.0f} KB, {len(x)/SR:.1f}s")

# Segment table — mirrors SCRIPT-hi.md / SCRIPT-en.md
SEGMENTS = [
    # (at_sec, gain, hindi, english)
    (12,  1.0, "आराम से बैठिए। रीढ़ सहज रूप से सीधी, कंधे शिथिल, हाथ गोद में। आँखें धीरे से बंद कर लीजिए।",
               "Sit comfortably. Let your spine be gently upright, shoulders soft, hands resting in your lap. Slowly close your eyes."),
    (50,  1.0, "अब अपना ध्यान श्वास पर लाइए। कुछ भी बदलने की आवश्यकता नहीं है — बस आती-जाती साँस को देखते रहिए।",
               "Now bring your attention to the breath. There is nothing to change — simply watch the breath as it comes and goes."),
    (100, 1.0, "प्रत्येक साँस के साथ शरीर और मन को थोड़ा और शांत होने दीजिए।",
               "With each breath, allow the body and the mind to settle a little more."),
    (150, 1.0, "अब मन में ओम् का स्मरण कीजिए। साँस भीतर — स्थिरता; साँस बाहर — मन ही मन… ओम्।",
               "Now bring OM to mind. Breathing in — stillness; breathing out — silently, within… OM."),
    (190, 1.0, "हर साँस छोड़ते हुए मन ही मन ओम् दोहराते रहिए। विचार आएँ तो कोई बात नहीं — धीरे से ओम् पर लौट आइए।",
               "With every out-breath, keep repeating OM silently. If thoughts arise, it does not matter — gently return to OM."),
    (260, 1.0, "अब कुछ क्षण मौन में बैठिए। जैसे गीता कहती है — वायुरहित स्थान में दीपक की लौ जैसा स्थिर मन।",
               "Now sit for a while in silence. As the Gita says — like the flame of a lamp in a windless place, the still mind does not flicker."),
    (355, 0.4, "बस… ओम् के साथ, स्थिर।",           # mid-stillness cue, near-whisper
               "Simply… still, with OM."),
    (430, 1.0, "अब धीरे-धीरे अपने ध्यान को वापस शरीर पर लाइए। हथेलियों को आपस में रगड़कर आँखों पर रखिए, और धीरे से आँखें खोलिए।",
               "Now slowly bring your awareness back to the body. Rub your palms together, place them gently over your eyes, and slowly open your eyes."),
    (460, 1.0, "ओम् शान्तिः, शान्तिः, शान्तिः।",
               "Om, shanti, shanti, shanti."),
]
TOTAL = 8 * 60 + 6   # 8:06 canvas
END_BELL_AT = 472    # 7:52

def build_guided(lang: str) -> np.ndarray:
    voice = "hi" if lang == "hi" else "en"
    y = np.zeros(int(TOTAL * SR), dtype=np.float32)
    # bells
    place(y, bell_strike(dur=9.0), 0.0, gain=0.8)
    end_bell = np.zeros(int(14 * SR), dtype=np.float32)
    for k, at in enumerate([0.0, 3.5, 7.0]):
        place(end_bell, bell_strike(dur=7.0), at, gain=0.7 * (0.72 ** k))
    place(y, end_bell, END_BELL_AT)
    # drone beds: under guidance (0:08–4:50) and return for samapti (7:00–8:06)
    d1 = fade(drone(290 - 8), in_sec=4, out_sec=8)
    place(y, d1, 8.0)
    d2 = fade(drone(TOTAL - 420), in_sec=5, out_sec=6)
    place(y, d2, 420.0)
    # narration
    for at, gain, hi_text, en_text in SEGMENTS:
        place(y, speak(hi_text if lang == "hi" else en_text, voice), at, gain=gain)
    return y

def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    write_m4a(bell_strike(dur=9.0), OUT_DIR / "bell-start.m4a")
    end_bell = np.zeros(int(15 * SR), dtype=np.float32)
    for k, at in enumerate([0.0, 3.5, 7.0]):
        place(end_bell, bell_strike(dur=7.0), at, gain=0.9 * (0.72 ** k))
    write_m4a(end_bell, OUT_DIR / "bell-end.m4a")
    write_m4a(build_guided("hi"), OUT_DIR / "guided-hi.m4a")
    write_m4a(build_guided("en"), OUT_DIR / "guided-en.m4a")

if __name__ == "__main__":
    main()
