# Reel creation checklist

Things to get right *while making* a reel, as opposed to `README.md` (what to post and
why) and `account-setup.md` (the account underneath it).

**Sections 2–5 are enforced by the builder.** `make-reel.js` lints the manifest before
it renders anything, and the warnings quote the section numbers below. Run the check on
its own with:

```bash
node make-reel.js <reel> --check
```

Warnings never block. Errors block unless you pass `--force`. Sections 1, 6 and 7 are
judgement or eyeball work that no linter can do — those are on you.

---

## 1. Before you write a slide — what is this reel *for*?

Pick one, and don't blend them. A reel doing two jobs does neither.

| Job | Format | Success signal |
|---|---|---|
| Reach a stranger | timeliness (`tithi`) or verse (`gita`) | sends, saves, non-follower reach |
| Convert a follower | product (`app`) | link taps, installs |

Then, before writing:

- **One idea per reel.** If you can't say what it's about in one line, it's two reels.
- **Is it complete in the frame?** No "link in bio", no "part 2". If the value only
  arrives elsewhere, it won't get sent — and sends are the point (README §1.4).
- **Timeliness beats evergreen.** If there's a vrat within the week, make *that* reel.
  Post the evening before, not on the day.
- **Would you forward this to your own family group?** If not, don't post it.

## 2. Structure — machine-checked

### 2.1 Slide 0 must be a `hook`
Enforced as an **error**. Frame 0 decides whether anything else gets watched. It renders
with no fade-in so it is legible at t=0.

- **≤ 6 words**, ≤ 30 characters in `hi`. A hook has to land in one glance.
- Make it a question or a problem, not a title. `एकादशी कब है?` works; `एकादशी विशेष`
  doesn't.
- It must be a promise the rest of the reel actually keeps.

### 2.2 Last slide must be a `cta` that repeats the hook verbatim
The closing card carries the same `hi` line as the hook, so when the reel loops the seam
is invisible — and replays are the cheapest watch-time you can get. The linter warns if
`cta.hi !== hook.hi`.

There is deliberately **no fade-out**. A fade to black announces the end and kills the
replay.

### 2.3 Keep it to ~8 slides
Past that the reel outruns the attention its hook bought.

## 3. Copy budgets — machine-checked

These are **heuristics**, not proofs. They catch copy that is obviously too long; they
can't guarantee a line fits. §6.1 is the real check.

| Field | Budget | Rendered at |
|---|---|---|
| `hi` on a `hook` | 30 chars | 112px |
| `hi` on a `text`/`shot` | 42 chars | 88px / 64px |
| `hi` on a `cta` | 34 chars | 88px |
| `en` (any slide) | 95 chars | 42px |
| `kicker` | 16 chars | 34px |
| `sanskrit`, per line | 62 chars | 62px |

### 3.1 `hi` is the payload
One idea. If it needs a comma-spliced second clause, split the slide.

### 3.2 `en` is a subtitle, not a translation
It supports the Devanagari line for someone who can't read it. It is not a second
headline and it is not a place to put everything you cut from `hi`.

### 3.3 `kicker` is a label
`तिथि`, `पारण`, `कथा`. One or two words. Never a sentence.

### 3.4 Break `sanskrit` at the shloka's own line breaks
Use `\n` where the verse breaks. Long lines wrap raggedly inside the 740px live box,
which reads as sloppy on devotional content specifically.

## 4. Devanagari-first — machine-checked

Hindi leads on every slide; English supports (README §2). The linter flags:

- `hi` with no Devanagari in it — usually means English got typed in the wrong field.
- `en` containing Devanagari — usually means `hi` and `en` are swapped.
- `ref` on a verse slide not in Devanagari — `भगवद्गीता · २.४७`, not `Bhagavad Gita 2.47`.
  Devanagari numerals for the verse number too.

**Never letter-space Devanagari.** It pulls matras and conjuncts apart. The `.kicker.dev`
CSS rule resets it to 0 — don't "fix" the inconsistency with the Latin kicker.

## 5. Pacing — machine-checked

### 5.1 Per-slide dwell time
**1.4s–4.2s.** Defaults: hook 2.0, text 1.9, shot 2.6, verse 3.2, cta 2.4.

- Under 1.4s nobody finishes reading it.
- Over 4.2s is dead air, and dead air is where people swipe.
- Screenshots need longer than text — the eye has to find the content inside the frame.
- A verse needs longest. Don't rush a shloka to hit a runtime target; cut a slide.

### 5.2 Total runtime
**7s–22s.** Under 7s you haven't said anything; over 22s needs a reason you can state.

### 5.3 Cuts, not crossfades
Text reels use `transition: 'cut'`. A crossfade burns ~0.45s of attention per slide and
reads as corporate video. Only the `app` reel uses `fade`, because screenshots benefit
from the softer join.

## 6. After rendering — eyeball it

No linter catches these.

### 6.1 Check the safe zones
```bash
node make-reel.js <reel> --slides-only --safe
```
Red = covered by Instagram's own UI. Dashed box = the live area. **Nothing readable may
touch red.** This is the ground truth that §3's character budgets only approximate.

`--safe` burns the overlay into the output — preview only, never post that file.

### 6.2 Look for tofu
Fonts come from Google Fonts at render time. If Devanagari renders as `□□□`, the font
request failed. Re-run; don't ship it.

### 6.3 Check the screenshot framing
The phone mock takes its aspect ratio from the screenshot's own dimensions, so a capture
from any device is framed rather than cropped sideways. Still worth a look: the *top* of
the app screen must sit inside the live box, since the bottom deliberately runs off-frame
behind IG's caption tray.

### 6.4 Watch it once, muted, at arm's length
That is how it will actually be seen. If the message doesn't survive that, the frame
isn't carrying it.

## 7. At upload

Full detail in README §5; the reel-specific ones:

- **Add audio in the Instagram composer.** The builder exports silent on purpose. The
  account is on Creator, so the full trending library is available
  (`account-setup.md` §2). A silent reel is a scrolled reel.
- **Pick the hook frame as the cover**, not a mid-reel frame — it's the grid thumbnail.
- **Trial the hook.** Creator accounts can test a reel against non-followers without
  showing it to existing ones. Same content, three different opening frames, keep the
  winner. Cheapest experiment available.
- **Caption line 1 = the searchable question**, in Hindi, phrased as someone would type
  it. Templates in `posts/caption-templates.md`.
- **Ask for the send.** "जो व्रत रखते हैं उन्हें भेजें."

## 8. What the lint does and doesn't catch

**Catches:** missing/misplaced hook, broken loop seam, slide count, copy over budget,
`hi`/`en` swapped or missing Devanagari, ragged shloka lines, dwell times, total runtime,
missing screenshot files.

**Cannot catch:** whether the hook is *good*, whether the reel is worth posting, whether
text actually fits (use `--safe`), font load failures, or anything about the caption and
upload settings.

A clean lint means the reel is well-formed. It does not mean it's worth posting.
