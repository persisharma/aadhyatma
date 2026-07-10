# Dhyāna audio assets (PRD-15)

**⚠️ The two `guided-*.m4a` tracks are PLACEHOLDERS.** Their narration is
synthesized (espeak-ng) so the full session can be built and tested end-to-end;
the voice must be replaced by the commissioned studio recording before ship
(PRD-15 §8). The bells are synthesized too but are close to shippable quality —
judge by ear before deciding to re-record them.

Nothing in this folder is bundled into the app binary until it is referenced
via `require()` from code (there is no `assetBundlePatterns` glob), so these
files have **zero size impact** on the shipped app today.

## Files

| File | Content | Status |
|---|---|---|
| `guided-hi.m4a` | 8:06 guided dhyāna, Hindi narration per `SCRIPT-hi.md` | placeholder voice |
| `guided-en.m4a` | 8:06 guided dhyāna, English narration per `SCRIPT-en.md` | placeholder voice |
| `bell-start.m4a` | single soft bell strike, 9 s | synthesized, near-shippable |
| `bell-end.m4a` | three fading strikes, 15 s | synthesized, near-shippable |
| `SCRIPT-hi.md` / `SCRIPT-en.md` | the timestamped session scripts — the studio records from these | final draft, pending teacher review |
| `SUNO.md` | how to regenerate the tracks with Suno AI as an intermediate-quality stopgap | guide |

## Encoding contract

AAC mono 64 kbps `.m4a`, 44.1 kHz (PRD-02 §9 standard). Keep the filenames —
they are the stable interface the PRD-15 implementation will `require()`.

## Timeline contract

Both guided tracks share one timeline (segment starts at 0:12, 0:50, 1:40,
2:30, 3:10, 4:20, soft cue 5:55, samāpti 7:10, śānti 7:40, end bell 7:52;
stillness 4:45–7:05 is true silence). The tables in `SCRIPT-*.md` are the
source of truth; `mobile/scripts/gen-dhyana-placeholder-audio.py` mirrors them.

## Regenerating the placeholders

```bash
python3 -m venv /tmp/audio-venv
/tmp/audio-venv/bin/pip install numpy imageio-ffmpeg espeakng-loader
/tmp/audio-venv/bin/python mobile/scripts/gen-dhyana-placeholder-audio.py
/tmp/audio-venv/bin/python mobile/scripts/verify-dhyana-audio.py
```

## Swapping in real recordings

1. Record per `SCRIPT-*.md` (voice direction is in the script header).
2. Encode: `ffmpeg -i master.wav -c:a aac -b:a 64k -ac 1 guided-hi.m4a`
3. Overwrite the file here (same name), run `verify-dhyana-audio.py`
   (relax the exact-timestamp checks if the studio pacing differs), and
   delete the placeholder warning from this README.
