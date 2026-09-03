#!/usr/bin/env python
# xtts_synth.py — batch XTTS-v2 voice-clone TTS. Reads a JSON job from stdin:
#   {"ref": "<reference wav>", "lang": "hi", "items": [{"text": "...", "file": "out.wav"}, ...]}
# Loads the model once, clones the reference voice, writes each item's wav. Free/local.
import os, sys, json

os.environ.setdefault("COQUI_TOS_AGREED", "1")  # skip the interactive model-license prompt

import torch

# XTTS-v2 checkpoints don't load under torch>=2.6's default weights_only=True — allowlist the
# config/model classes so torch.load accepts them.
try:
    from TTS.tts.configs.xtts_config import XttsConfig
    from TTS.tts.models.xtts import XttsAudioConfig, XttsArgs
    from TTS.config.shared_configs import BaseDatasetConfig
    torch.serialization.add_safe_globals([XttsConfig, XttsAudioConfig, XttsArgs, BaseDatasetConfig])
except Exception as e:
    print(f"[xtts] safe-globals note: {e}", file=sys.stderr)

from TTS.api import TTS

job = json.load(sys.stdin)
ref = job["ref"]
lang = job.get("lang", "hi")
items = job["items"]
speed = float(job.get("speed", 1.0))          # >1 = faster (fixes draggy pacing)
temperature = float(job.get("temperature", 0.7))  # lower = steadier timbre
top_p = float(job.get("top_p", 0.85))
rep = float(job.get("repetition_penalty", 5.0))

device = "cuda" if torch.cuda.is_available() else "cpu"  # MPS has XTTS op gaps; CPU is reliable
print(f"[xtts] loading model on {device} (speed={speed}, temp={temperature})…", file=sys.stderr, flush=True)
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)

for it in items:
    tts.tts_to_file(
        text=it["text"], speaker_wav=ref, language=lang, file_path=it["file"],
        speed=speed, temperature=temperature, top_p=top_p, repetition_penalty=rep,
    )
    print(f"[xtts] wrote {it['file']}", file=sys.stderr, flush=True)

print("[xtts] done", file=sys.stderr, flush=True)
