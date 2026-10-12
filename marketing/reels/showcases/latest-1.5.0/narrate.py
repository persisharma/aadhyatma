"""Generate preset synthetic voices; no cloned voice or app data is sent."""
import asyncio
import json
from pathlib import Path
import sys

import truststore
truststore.inject_into_ssl()
import edge_tts

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
OUT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / "marketing/reels/out/latest-1.5.0"
CONFIG = json.loads((HERE / "storyboard.json").read_text())


async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for lang, voice in [("hi", "hi-IN-SwaraNeural"), ("en", "en-IN-NeerjaNeural")]:
        for index, scene in enumerate(CONFIG["scenes"]):
            file = OUT / f"voice-{lang}-{index}.mp3"
            if file.exists() and file.stat().st_size:
                continue
            await edge_tts.Communicate(scene[lang]["narration"], voice, rate="+8%").save(str(file))
            print(f"Generated {lang} scene {scene['id']}", flush=True)


asyncio.run(main())
