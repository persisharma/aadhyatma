# Instagram — why the daily posting isn't landing, and what to do instead

Companion to `../linkedin/`. That kit exists to announce releases to a professional
audience; **this kit exists to get reach from strangers**, which is a different problem
with different rules.

> **Scope note.** Nobody here has access to `@vedansh.app`'s Insights, so §1 is a
> *structural* diagnosis based on the three formats currently being posted (static
> verse cards, reels, app-screenshot feature posts) and on what this repo can
> uniquely produce. §7 lists the three numbers to pull from your own Insights that
> will confirm or kill each hypothesis in a week. Platform specifics drift — treat
> pixel measurements and product names as "verify in the app", not gospel.

> **Before working through any of this, do the settings pass in
> [`account-setup.md`](./account-setup.md).** The account is confirmed on Creator, which
> rules out the audio-library problem — but **Account Status / recommendation
> eligibility is still unchecked**, and if the account isn't eligible to be shown to
> non-followers, nothing below will fix it.

---

## 1. The diagnosis

**Posting daily is not a distribution strategy. It is a production schedule.** Reach
on Instagram is allocated per-post, on evidence that the post held attention and got
passed around. Cadence only decides how many chances you get to produce that evidence.
Daily posting with no retention signal doesn't accumulate — it just produces a long
run of posts that each got shown to a small test audience and stopped there.

Five things are most likely happening, in rough order of how much they cost:

### 1.1 Two of your three formats have a low reach ceiling by design

- **App-screenshot feature posts** are promotional. They convert people who already
  follow you and are near-invisible to anyone who doesn't. They are worth posting —
  but they are a *conversion* format, not a *reach* format, and if they're a third of
  the calendar they're a third of the calendar spent not growing.
- **Single static verse cards** are the weakest surviving format on the platform.
  A still image gives the ranker almost nothing to work with: no watch time, no
  replays, and a swipe-past costs the viewer nothing.

That leaves reels doing all the acquisition work, at roughly a third of the volume.

### 1.2 The reels are almost certainly losing the first second

This is the single highest-leverage fix. A reel gets a very short audition; if the
opening frame doesn't state a reason to stay, the viewer is gone before any of the
content lands. Two specific failure modes, both of which the LinkedIn kit has baked in
(reasonably — for LinkedIn):

- **Slow openings.** `../linkedin/make-reel.js` opens with a branded cover slide for
  3.2s, then crossfades for 0.6s into the first real content. On Instagram that is
  four seconds before you say anything.
- **Fade-in from black.** A fade means frame 0 is literally unreadable.

The builder here opens on a full-stop headline with no fade and hard-cuts at ~1.9s.

### 1.3 The reels are silent

`../linkedin/make-reel.js` never adds an audio track, and neither does this one by
default. A silent reel is doubly penalised: audio is a discovery surface in its own
right (people reach reels *through* a sound), and a muted autoplay with no sound and
no on-screen text is a guaranteed scroll. **Add audio in the Instagram composer before
posting** — see §5.

### 1.4 The content isn't built to be *sent*

For a Hindu devotional audience in India, the dominant sharing motion is a forward to
a family or community WhatsApp group. Sends and saves are the strongest signals this
niche can generate, and they are earned by posts that are **complete in the frame** —
no "link in bio", no cliffhanger, no "part 2 coming". A shloka card someone forwards
to their mother is worth more than a dozen passive views.

This is also exactly what PRD-05 (`docs/roadmap/prds/05-share-verse-card.md`) already
argues for the in-app share surface. The same logic applies to the account.

### 1.5 You're not using the one advantage nobody else has

There are thousands of accounts posting generic shloka cards. There is a much smaller
number that can answer, correctly and for a specific city, **"एकादशी कब है?"** — and
you have the Panchang engine that does it.

Timely, dated, searchable questions are the highest-intent content in this niche:

- People *search* them ("Ekadashi kab hai", "Karwa Chauth 2026", "पारण का समय").
- They *save* the answer to come back to.
- They *send* it to whoever else in the family keeps that vrat.
- They're inherently recurring — every tithi is a new post with the same template.

A generic verse card competes with everyone. "Tomorrow is Ekadashi, here's the paran
window, here's the katha" competes with almost no one, and it is the post most likely
to make someone install a Panchang app.

**If you change one thing:** post the timeliness reel the day *before* every vrat, and
drop the daily-posting requirement to make room for it.

---

## 2. Language

Post Hindi-first. The on-screen headline in Devanagari, the caption opening line in
Hindi, English as the support line. The audience that searches "एकादशी कब है" and the
audience that searches "when is Ekadashi" overlap heavily and both read a Devanagari
headline; the reverse is not true. Every slide layout in `make-reel.js` is built as
Devanagari headline + English subtitle for this reason.

Note the app itself reads in `hi/en/gu/kn` (see `wiki/languages.md`). Gujarati and
Kannada are a real, under-served audience — worth a test once the Hindi engine works,
not before.

---

## 3. The safe zones (why the LinkedIn reels look wrong on Instagram)

Instagram paints its own chrome over your frame. Anything you put underneath it is
gone. On a 1080 × 1920 reel the builder treats these as unusable:

| Region | Reserved | What sits there |
|---|---|---|
| Top | 250 px | header / "Reels" strip |
| Bottom | 540 px | caption, audio ticker, progress bar |
| Right | 250 px | like / comment / send / audio rail |
| Left | 90 px | margin |

That leaves a **live box of 740 × 1130 px** starting at (90, 250). Every readable
thing goes inside it — the `.live` element in `make-reel.js` *is* that box.

For comparison, `../linkedin/make-reel.js` puts its caption block at `bottom: 96px`
and its call-to-action dead centre-bottom. On Instagram both are underneath the
caption tray. If you have been cross-posting those MP4s, the words were not visible.

Check your own layouts with:

```bash
node make-reel.js tithi --slides-only --safe   # red = covered, dashed = live box
```

Screenshots are the one exception: the phone mock deliberately runs *past* the bottom
edge, because what IG covers there is the app's tab bar, which carries no message.

---

## 4. The content system

Replace "post something daily" with a fixed weekly shape. Fewer, better, and each one
has a job:

| Slot | Format | Job | Tool |
|---|---|---|---|
| **Every vrat/festival eve** | timeliness reel | reach + saves + sends | `node make-reel.js tithi` |
| 2× / week | verse reel | reach + sends | `node make-reel.js gita` |
| 1× / week | carousel | saves, dwell time | `node make-reel.js gita --carousel` |
| 1× / 5 posts | app/product reel | conversion | `node make-reel.js app` |
| Daily-ish | Stories | existing followers only | — |

Roughly **4 : 1 content to product**. Stories don't count toward reach — they're for
the people you already have, and they're the right home for the app screenshots you're
currently spending feed slots on.

Turning the static cards into carousels is nearly free (`--carousel` renders the same
manifest at 1080 × 1350). A carousel gets multiple chances to hold a viewer and a
second chance in the feed; a single still gets one.

---

## 5. Publishing checklist

Per post, in order:

1. **Audio — do not skip.** Export silent, then add a track in the Instagram composer
   from Instagram's own library. Using in-app audio keeps the post attached to that
   sound's discovery surface; muxing your own file does not. Devotional instrumental
   or a low flute bed suits the brand. `--audio <file>` exists for licensed audio you
   own, and should be the exception. The account is on Creator, so the full trending
   library is available — see [`account-setup.md`](./account-setup.md) §2.
2. **Cover frame.** Pick the hook frame, not a mid-reel frame. It's the grid thumbnail.
3. **Caption first line = the searchable question**, in Hindi, verbatim as someone
   would type it: `एकादशी कब है? · Ekadashi 2026`. Keywords in the caption do work;
   a wall of hashtags mostly does not.
4. **The value goes in the caption too.** Dates, timings, the paran window — in text.
   People search and save captions.
5. **An explicit send prompt.** "जो व्रत रखते हैं उन्हें भेजें" / "Send this to whoever
   in your family keeps this vrat." Ask for the action you actually want.
6. **3–5 hashtags, relevant only.** They're a weak relevance hint now, not a reach
   lever. `#एकादशी #व्रत #पंचांग #भगवद्गीता`.
7. **Alt text** on carousels — it's a real indexing surface and takes ten seconds.
8. **Link in bio** stays `https://persisharma.github.io/get-vedansh/`
   (`mobile/src/data/shareLinks.ts` — same smart link the app shares).
9. **Post before the moment, not on it.** The evening before a vrat is when people
   search. On the day is too late to be useful.

---

## 6. Using the builder

```bash
cd marketing/instagram

node make-reel.js tithi                 # → vedansh-ig-tithi.mp4   (no screenshots needed)
node make-reel.js gita                  # → vedansh-ig-gita.mp4
node make-reel.js gita --carousel       # → carousel/gita-1.png …  (1080×1350 feed slides)
node make-reel.js tithi --slides-only --safe    # preview with safe-zone overlay
node make-reel.js app                   # product reel — needs screenshots, see below
```

**Prerequisites:** `node`, Google Chrome, and `ffmpeg` on PATH. Override with
`CHROME_BIN` / `FFMPEG_BIN`. The `tithi`, `gita` and `--carousel` paths need no
simulator and no capture step — they are pure typography.

**Screenshots** for the `app` reel come from the LinkedIn kit's verified capture flow;
there is no separate Maestro flow here, deliberately:

```bash
cd ../linkedin && ./capture.sh vrat          # writes shots/vrat/*.png
cd ../instagram && node make-reel.js app     # defaults to ../linkedin/shots/vrat
node make-reel.js app --shots ../linkedin/shots/routine   # or any other shot dir
```

**Editing content:** the `REELS` manifest near the top of `make-reel.js`. Slide kinds
are `hook`, `text`, `verse`, `shot`, `cta` — each documented inline. The `tithi` reel
is meant to be re-edited per occasion: change the strings, re-run, post.

**Brand tokens** (`C`) mirror `../linkedin/make-reel.js` and `mobile/src/theme`:
saffron `#B8621B`, parchment `#F3E7C9`, ink `#1A0E03`; Cormorant Garamond +
Noto Serif Devanagari.

Generated output (`frames/`, `carousel/`, `*.mp4`) is git-ignored — regenerable.

---

## 7. How to tell whether any of this worked

Stop looking at views. Views is the output, not a lever. In Insights, per reel, pull
(Insights needs a Professional account — [`account-setup.md`](./account-setup.md) §1.2):

1. **Watch time / average seconds watched.** This is the one that decides reach.
   Rising = the hooks and the pacing are working.
2. **Sends per reach.** The niche's real signal, and the thing §1.4 is aimed at.
3. **Non-follower reach %.** If this is low, you are only reaching people you already
   have — which is exactly what §1.1 predicts if the calendar is product-heavy.

Then the decision rule: **run each change for at least 2 weeks before judging it**,
and change one thing at a time. Per-post variance on a small account is enormous; a
single flop proves nothing and a single hit proves less.

Two useful confirmations, early:

- If the timeliness reels beat the verse reels on sends and saves, §1.5 is right and
  the calendar should tilt further that way.
- If watch time is flat across *every* format, the problem is upstream of format —
  it's the hook, and §1.2 is where to spend the next iteration.

Instagram can test a reel against non-followers without showing it to your existing
audience ("trial" reels in the composer) — a Creator-account feature, so it should be
available here. It is the cheapest hook test there is: same content, three different
opening frames, keep the winner. Use it before committing a hook to a real post.

---

## 8. Gotchas

- **Google Fonts are fetched at render time.** Slides need network access on first
  render. If Devanagari comes out as tofu boxes, the font request failed — re-run.
- **`--safe` burns the overlay into the output.** Preview only. The script warns if
  you combine it with a video render.
- **Devanagari must not be letter-spaced.** It pulls matras and conjuncts apart. The
  `.kicker.dev` rule resets `letter-spacing` to 0 for exactly this reason — don't
  "fix" the inconsistency with the Latin kicker.
- **Chrome's headless screenshot is taller than its viewport.** `--headless=new`
  returns a PNG at the requested *window* height but paints only the viewport, leaving
  an unpainted band at the bottom (87 px on Chromium 134) that flattens to a black bar
  in the video. This builder captures with 200 px of slack and crops back to the exact
  design height (`cropPngHeight`). **`../linkedin/make-reel.js` does not, and its
  reels carry that black bar** — worth fixing there separately.
- **Reel length.** The builder warns above ~22 s. Long reels need a reason.
- **Don't cross-post the LinkedIn MP4s.** §3 — the text lands under IG's chrome.
