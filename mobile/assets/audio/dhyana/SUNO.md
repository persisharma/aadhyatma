# Generating the Dhyāna audio with Suno AI (stopgap between espeak and studio)

Suno (suno.com) is a music-generation model. It is **very good** for the bells
and ambience, **workable** for the spoken guidance (natural-sounding voice, but
you don't control pacing precisely), and **not a substitute** for the studio
recording PRD-15 §8 commissions — treat Suno output as an upgraded placeholder.

## Before you start

1. **Plan**: use a paid plan (Pro or higher). The free tier does **not** grant
   commercial-use rights, and we redistribute audio inside the app binary —
   the strictest licensing case (PRD-02 §8). Check Suno's current terms cover
   in-app redistribution before shipping anything it makes.
2. **Mode**: always use **Custom** mode (separate Lyrics + Style fields), and
   the newest model available (v4.5+ handles 8-minute tracks; on older models
   generate ~4 min and use **Extend**).
3. **Expect to edit.** Suno will not honor exact timestamps or a 2¼-minute
   silence. Generate the *pieces*, then assemble to the `SCRIPT-*.md` timeline
   in any editor (Audacity is fine) and encode with ffmpeg (commands below).
   Generating one continuous 8-minute track sounds seamless but the segment
   timings will drift from the script — acceptable for a placeholder, not for
   the shipped timeline contract.

## Piece 1 — bells (`bell-start.m4a`, `bell-end.m4a`)

Instrumental toggle **ON**. Style prompt:

> Single Indian temple bell strike, deep bronze singing bowl resonance, long
> natural decay into silence, meditative, no melody, no rhythm, no other
> instruments, extremely sparse, recorded in a quiet temple hall

Generate a few takes, pick the cleanest strike, and **trim**: one strike +
tail (~9 s) for `bell-start`, three strikes at ~3.5 s spacing with fading
volume (~15 s) for `bell-end` (duplicate and lower the same strike; don't hunt
for a take with exactly three).

## Piece 2 — drone bed (mixed under the narration)

Instrumental toggle **ON**. Style prompt:

> Soft continuous tanpura drone in Sa and Pa, Indian classical meditation
> ambience, warm and very quiet, no percussion, no melody, no vocals, static
> and unchanging, deep and calm

Take ~5 usable minutes (Extend if needed). In the mix keep it **very low**
(≈ −30 dB under the voice) and fade it out entirely during the stillness
section — the silence is part of the design.

## Piece 3 — English narration (`guided-en.m4a`)

Instrumental **OFF**. Style prompt:

> Guided meditation narration, spoken word only, warm calm male voice, very
> slow unhurried pace, long pauses between sentences, gentle and reassuring,
> no singing, no music, no rhythm, meditation teacher

Lyrics field — paste the segment texts from `SCRIPT-en.md` with meta-tags and
explicit pause hints (Suno respects these loosely):

```
[Spoken Word]
[Slow, calm narration with long pauses]

Sit comfortably. Let your spine be gently upright, shoulders soft,
hands resting in your lap. Slowly close your eyes.

[Long pause]

Now bring your attention to the breath. There is nothing to change —
simply watch the breath as it comes and goes.

[Long pause]

With each breath, allow the body and the mind to settle a little more.

[Long pause]

Now bring OM to mind. Breathing in — stillness; breathing out —
silently, within… OM.

[Long pause]

With every out-breath, keep repeating OM silently. If thoughts arise,
it does not matter — gently return to OM.

[Long pause]

Now sit for a while in silence. As the Gita says — like the flame of a
lamp in a windless place, the still mind does not flicker.

[Long instrumental silence]

Simply… still, with OM.

[Long instrumental silence]

Now slowly bring your awareness back to the body. Rub your palms
together, place them gently over your eyes, and slowly open your eyes.

[Pause]

Om shanti, shanti, shanti.
```

If the delivery drifts into sing-song, add "monotone, no musicality, plain
speech" to the style and regenerate. If pauses come out too short, cut the
track at sentence boundaries and re-space the segments to the script
timestamps in the editor — that is the reliable way to hit the timeline.

## Piece 4 — Hindi narration (`guided-hi.m4a`)

Same settings; style prompt adds the language:

> Guided meditation narration in Hindi, spoken word only, warm calm male
> voice, very slow pace, long pauses, no singing, no music, respectful formal
> Hindi, meditation teacher

Lyrics: paste the नौ खण्ड from `SCRIPT-hi.md` (same `[Spoken Word]` /
`[Long pause]` scaffolding as above, Devanagari text as written). Listen for
pronunciation of «ओम् शान्तिः» — regenerate or splice takes if it mangles the
visarga.

## Assembly & encoding

Assemble to the timeline in `SCRIPT-*.md` (bell 0:00 → segments at 0:12, 0:50,
1:40, 2:30, 3:10, 4:20 → silence 4:45–7:05 with the soft cue at 5:55 →
7:10, 7:40 → end bell 7:52; total ≈ 8:06). Then:

```bash
ffmpeg -i guided-hi-master.wav -c:a aac -b:a 64k -ac 1 guided-hi.m4a
ffmpeg -i guided-en-master.wav -c:a aac -b:a 64k -ac 1 guided-en.m4a
ffmpeg -i bell-start.wav      -c:a aac -b:a 64k -ac 1 bell-start.m4a
ffmpeg -i bell-end.wav        -c:a aac -b:a 64k -ac 1 bell-end.m4a
```

Drop the files over the ones in this folder (same names), then run
`mobile/scripts/verify-dhyana-audio.py` to confirm codec/duration/structure.

## Caveats that don't go away

- **Doctrinal review still gates ship** — an AI voice reading the script is
  still voice-of-the-app content (PRD-15 §11).
- **Attribution**: the "About this recording" line cannot credit a voice
  artist; it would need to disclose AI generation — a product decision to make
  deliberately, not by default.
- The studio commissioning in PRD-15 §8 remains the plan of record; Suno
  output only upgrades the development placeholder.
