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

## Instagram format (`"format": "ig"` in a story's script.json)

The user asked for reels that make people curious instead of reading like information. The `ig` format changes:
- **Hook:** the first frame already shows the hook figures and its first caption phrase.
- **Captions:** big kinetic captions replace the subtitle card. The narration is split into phrases of up to four words, timed by each phrase's share of the clip. Names listed in `highlight` are shown in gold.
- **Day chip:** a yellow chip per scene, e.g. "दिन 2/5 · नरक चतुर्दशी".
- **Cuts:** hard cuts (0.08 s) with a zoom punch, an optional `shake` at chosen moments, and tighter pauses between lines.
- **Ending:** a save/share line ("सेव कीजिए…").

Write the script as a curiosity gap first, with the answer afterwards. Example: `diwali-ig` opens with "दीपावली में यमराज, नरकासुर और इंद्र?"

## Stories

Each story lives in `stories/<id>/`: `script.json` holds the narration, title, call to action and voice settings, and `scenes.mjs` holds the puppet choreography.

| Story | Source in the app | Style |
| --- | --- | --- |
| `hanuman-surya` | `kidsStories/hanuman-sun.json` (fully illustrated) | painted (style 3); puppet also available |
| `dhanteras` | `panchang/kathaContent/entries/dhanteras-legends.ts` (samudra-manthan, dhanvantari-amrit, dhanteras-blessing) | puppet (style 1): the katha has no illustrations |
| `diwali-ig` | Same sources as `diwali` | puppet, Instagram format (~40 s) |
| `diwali` | Five-day arc from `panchang/arcs.ts` (deepavali), with `dhanteras-legends`, `narak-chaturdashi-katha`, `diwali-legends`, `govardhan-puja-katha` and `bhai-dooj-katha` | puppet (style 1); dates are deliberately left out of the video and added in the post caption |

`phonemeFixes` in a story's voice settings correct espeak pronunciations. For example, `-दशी` words lose their schwa, and धन्वंतरि gets first-syllable stress.

```sh
python marketing/reels/showcases/story-reel/voice.py --story dhanteras --models <kokoro dir> [--whisper <whisper-turbo dir>]
node marketing/reels/showcases/story-reel/build.mjs --story dhanteras --style puppet   # ~6–7 min
```

Outputs go to the git-ignored folder `marketing/reels/out/story-reel/<story>/<story>-<style>.mp4`. RULEBOOK §29 editorial review of the condensed narration is still pending, as are native-speaker listening and a decision on music.
