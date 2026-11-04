# Vedansh feature tour (Meta ads)

A vertical feature tour for Meta (Reels, Stories and Feed), in Hindi and English, with voice-over. It runs about 50 seconds: 13 feature beats, each timed to its narration, then a call to action. It covers: reading with meaning, Gita Saar, bhajans, Panchang, Vrat and festival reminders, Puja Vidhi, Kundali, Rashifal and Guna Milan, Jap Mala and Sankalp, kids' stories, Ask Vedansh, sharing cards, and a list of further features (Pitru Smaran, Vastu, Daan Punya, Theerth, Muhurat, Namkaran, widgets and Japa alarms).

## Reproduce

```sh
python marketing/reels/showcases/feature-tour/narrate.py --models <kokoro dir> [--whisper <whisper-turbo dir>]
node marketing/reels/showcases/feature-tour/build.mjs            # both languages, ~12 min
node marketing/reels/showcases/feature-tour/build.mjs --no-vo    # music-only cut, 43.5 s
node marketing/reels/showcases/feature-tour/build.mjs --lang hi  # one language
node marketing/reels/showcases/feature-tour/build.mjs --preview  # review stills only, ~10 s
```

Requirements: Python packages `kokoro-onnx` and `soundfile` (plus `onnxruntime` for the optional check), with Kokoro v1.0 `kokoro-v1.0.onnx` and `voices-v1.0.bin` from the [kokoro-onnx model-files-v1.0 release](https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0). Also Playwright with Chromium, `ffmpeg`/`ffprobe` with libx264, Python 3 with NumPy, and network access to Google Fonts (Cormorant Garamond, Inter, Noto Serif Devanagari, Noto Sans Gujarati/Kannada). The build stops if any web font fails to load.

Outputs are written to the git-ignored folder `marketing/reels/out/feature-tour/`:

| File | Use |
| --- | --- |
| `vedansh-feature-tour-{en,hi}-9x16.mp4` | Reels and Stories, 1080×1920, 30 fps, H.264/AAC |
| `vedansh-feature-tour-{en,hi}-4x5.mp4` | Feed, a 1080×1350 centre crop of the 9:16 video |
| `review-{en,hi}.jpg`, `stills-*/` | Contact sheet and one still per scene, for review |
| `vedansh-feature-tour-{en,hi}.srt` | Voice-over captions, if you upload captions separately |
| `vo.json`, `vo-*.wav` | Voice-over clips, phonemes and Whisper round-trip transcripts |
| `manifest.json` | Output probes and hashes, plus SHA-256 of every source screen |

## How it works

- `storyboard.json` holds the scenes, layouts, screens and EN/HI copy. A scene can share its screens across languages or list separate `en`/`hi` screens.
- `build.mjs` builds one HTML page per language. `renderAt(t)` positions every element for time `t`, and each frame is screenshotted in Chromium and piped to ffmpeg, so the output is deterministic. Captures wider than a phone (the 1080×1920 Android sources) are fitted to the frame width, so no app UI is cropped at the sides.
- `narrate.py` voices each `vo` line with Kokoro-82M (Apache-2.0) using the Indian female voice `hf_alpha` in both languages. English lines mark Indic terms as `{Panchang|पंचांग}`, so those words are phonemised as Hindi and sound Indian rather than anglicised. `phonemeFixes` in `storyboard.json` corrects espeak errors; for example, it restores the schwa in एकादशी.
- `whisper_check.py` transcribes every clip with Whisper large-v3-turbo (sherpa-onnx export) as an intelligibility check. It uses a byte-level greedy decoder because sherpa's own recogniser truncates Devanagari. Lines Whisper misheard were reworded until they transcribed correctly.
- Piper's Hindi voices were rejected: their training data is CC BY-NC-SA, which is non-commercial and so not usable in ads.
- `music.py` generates an original tanpura drone and two bell strikes from oscillators. No sampled or licensed audio is used. The mix is normalised to about −16 LUFS.

## Layout safety

- All text sits between y≈300 and y≈1250. That keeps it clear of the Reels top bar and the bottom caption/CTA overlay (the bottom ~35%), and inside the 4:5 Feed crop (y 285–1635).
- Phones run off the bottom edge on purpose. This hides most capture-era tab bars.

## Claims and provenance

- Every claim comes from the submitted 1.5.0 store copy (`docs/releases/1.5.0/listing/`): no login, no in-app ads, Hindi/English meanings, Gujarati/Kannada script options, background audio, reminders, Guna Milan and the rest. The video does not claim the app is free, works offline, or guarantees Jyotish results.
- Screens are unaltered native captures already committed under `docs/evaluations/`, `docs/content*/` and `latest-1.5.0/screens/`, dated 6–27 October 2026. Some predate the 1.5.0 Vrat tab, so the tab bars and status-bar clocks are not uniform. The Hindi cut uses Hindi captures where they exist (Kundali, kids' stories, Japa, Sankalp, Gita Saar). Other scenes in both cuts show mixed-language UI, unlike the stricter locale rule for store listings.
- The Kundali screens use fictional demo birth details. No personal data appears.
- The voice-over is synthetic and has been checked only by machine transcription, not by a listener. Before you spend on ads, have a native Hindi speaker listen to both cuts. For a top-performing ad, a human voice artist recording the same `vo` lines will likely sound warmer.
- The builder uploads and posts nothing.
