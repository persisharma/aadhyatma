# Vedansh bhajan cut (Meta ads)

A 28-second, beat-cut feature reel in Hindi and English. It is the fast, devotional alternative to `../feature-tour/`, made after feedback that the earlier version felt too slow and too AI-made.

- **Sound:** the app's own recorded bhajan, "Govind Bolo" (`mobile/assets/audio-library/govind-bolo.mp3`), from 16.14 s, where the full arrangement starts and the chant enters. There is no synthetic voice. Confirm that the recording's licence covers paid advertising before you spend.
- **Picture:** real app screens shown full-bleed, like a screen recording, with scrolling, a zoom punch on each cut and tap marks. A warm vignette sits over them. Captions are short and Hindi-first, in a maroon and cream creator style.
- **Pacing:** every cut lands on a tracked beat from `beats.json`. The hook runs 2 beats per deity card; each feature gets 4 beats (about 1.7 s); the call to action gets 10. A fixed BPM grid would drift up to 0.2 s.
- **Claims:** only those in the 1.5.0 store copy.

```sh
python marketing/reels/showcases/bhajan-cut/beats.py        # librosa; rerun if the audio start changes
node marketing/reels/showcases/bhajan-cut/build.mjs         # hi + en, 9:16 and 4:5, ~6 min
node marketing/reels/showcases/bhajan-cut/build.mjs --preview
```

Outputs go to the git-ignored folder `marketing/reels/out/bhajan-cut/`. Text stays within y 300–1300, which is safe for the Reels overlays and the 4:5 crop. The screen captures are the same committed native captures used by `feature-tour`, with the same date and mixed-UI caveats. Nothing is uploaded.

## Voiced variants

`voice.py` voices five short lines, in Hindi and English, with Kokoro `hf_alpha` (female) and `hm_omega` (male). `mix.mjs` then lays them over the rendered videos without re-rendering. The voice gets a warm EQ, light compression and a short room echo, and the bhajan ducks under it. Outputs are `vedansh-bhajan-cut-{hi,en}-voice-{female,male}-{9x16,4x5}.mp4`. They use new filenames so cached music-only files can't be confused with them.

```sh
python marketing/reels/showcases/bhajan-cut/voice.py --models <kokoro dir> [--whisper <whisper-turbo dir>]
node marketing/reels/showcases/bhajan-cut/mix.mjs
```

Whisper reads each line back correctly from the final mix. No one has listened to it: the voice is still synthetic, so have a native speaker review it before spending.
