# Story-reel style test (3 stories × 3 styles)

This kit renders 6.5-second teasers that let you pick a direction for a folk-art story reel series. It was prompted by a reference reel in Tholu Bommalata style. No reference designs are copied: every figure is original SVG.

| Style | How it's made |
| --- | --- |
| Tholu Bommalata puppets | `characters.mjs` jointed figures with perforated (dotted) outlines, a lamp-lit screen and zig-zag borders |
| Pattachitra | The same figures with fine double outlines, a red ground, a flower border band and stylised trees |
| App's painted art | The app's reviewed story illustrations with a slow push-in |

| Story | Caption source |
| --- | --- |
| Hanuman & Surya | `hanuman-sun.json` hs01/hs02 (Valmiki Uttara-kanda 35–36) |
| Ganesha | `ganesha-birth.json` gb07 (Shiva Purana) |
| Shani & Ravana | **No source in the app.** This is a title-card mock only, with no story claim. Source it under RULEBOOK §29 before any real episode. |

```sh
node marketing/reels/showcases/story-styles/build.mjs            # 9 MP4s + 3×3 sheet + labelled comparison reel, ~8 min
node marketing/reels/showcases/story-styles/build.mjs --preview  # stills + sheet only
```

Outputs go to the git-ignored folder `marketing/reels/out/story-styles/`. The files are `story-<style>-<story>.mp4`, `variations-3x3.jpg` and `story-styles-all-9.mp4`. The audio is the synthesised tanpura from `../feature-tour/music.py` and is only a placeholder. A full episode would need its scene sequence, narration or bhajan, and a check against the app's complete story arc (RULEBOOK §29: every page transition, not just the opening).
