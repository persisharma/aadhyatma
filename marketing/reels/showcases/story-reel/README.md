# Story reel: हनुमान और सूर्य, in three styles, with voice-over

## Style rule (user decision, 5 November 2026)
- **Story already fully illustrated in the app** (the kids' stories and their reviewed `kids-stories/*.webp` pages): use **style 3**, the app's painted art.
- **Story without full illustration** (vrat kathas and other sourced text): use **style 1**, Tholu Bommalata puppets drawn in code.
- **Pattachitra** (style 2) is not in use. Its code stays for reference.
- **Audio:** the default is narration only (`--bed none`), so music can be added in Instagram/Meta at upload. The synthesised tanpura is opt-in (`--bed tanpura`). `--remux` rebuilds only the audio of an already-rendered reel.

This kit renders one story from the app in three art styles: Tholu Bommalata puppets, Pattachitra, and the app's own painted illustrations. Each version has Hindi narration and subtitles and is about 60 s long (1080×1920).

- **Content:** `mobile/src/data/kidsStories/hanuman-sun.json` (Valmiki Ramayana, Uttara-kanda 35–36). The nine narration lines keep the app's full causal arc: Anjana leaves for fruit → the hungry child sees the red sun as fruit → he leaps while Vayu cools him → Rahu, come to eclipse the sun, flees to Indra → Hanuman goes for Airavata and Indra's vajra strikes him → grieving Vayu stops the air, and the world turns to Brahma → Brahma revives him, the air returns, and the gods bless him → call to action. A reel compresses the arc, but no event is added or reordered.
- **Voice:** Kokoro-82M (Apache-2.0), voice `hf_alpha`, via `voice.py`. It was checked with a Whisper round trip at speed 0.95; the current speed is 1.0. It has a warm EQ and a light room echo, and the original synthesised tanpura ducks under it. It is still a synthetic voice: get a native-speaker listen, or a human recording, before paid use.
- **Figures:** `../story-styles/characters.mjs` plus `cast.mjs`, which adds Anjana, Vayu, Indra, Brahma, Rahu and Airavata. All are original SVG. The painted version uses the app's reviewed `hs-*.webp` pages.

```sh
python marketing/reels/showcases/story-reel/voice.py --models <kokoro dir> [--whisper <whisper-turbo dir>]
node marketing/reels/showcases/story-reel/build.mjs [--style puppet|patta|painted]   # ~6–7 min per style
```

Outputs go to the git-ignored folder `marketing/reels/out/story-reel/hanuman-surya-{puppet,patta,painted}.mp4`. RULEBOOK §29 editorial review of the condensed narration is still pending, as are native-speaker listening and a decision on music.
