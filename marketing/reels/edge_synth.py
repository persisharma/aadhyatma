#!/usr/bin/env python
# edge_synth.py — batch Microsoft Edge neural TTS (free, natural Hindi). Reads a JSON job from stdin:
#   {"voice": "hi-IN-MadhurNeural", "rate": "+8%", "items": [{"text": "...", "file": "out.mp3"}, ...]}
# truststore makes Python trust the macOS keychain (needed behind the corporate TLS proxy).
import sys, json, asyncio

import truststore
truststore.inject_into_ssl()
import edge_tts

job = json.load(sys.stdin)
voice = job.get("voice", "hi-IN-MadhurNeural")
rate = job.get("rate", "+0%")
pitch = job.get("pitch", "+0Hz")
items = job["items"]


async def main():
    for it in items:
        c = edge_tts.Communicate(it["text"], voice, rate=rate, pitch=pitch)
        await c.save(it["file"])
        print(f"[edge] wrote {it['file']}", file=sys.stderr, flush=True)


asyncio.run(main())
print("[edge] done", file=sys.stderr, flush=True)
