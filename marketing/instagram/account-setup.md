# Account settings review — `@vedansh.app`

Companion to `README.md`. That doc is about what you post; this one is about the
account underneath it. **Work top to bottom** — §1 lists the settings that can flatten
reach on their own, no matter how good the content is, and it's worth ruling those out
before spending another week on hooks.

> **Scope note.** Nobody here can see `@vedansh.app`'s settings, so this is a checklist
> to walk with the app open, not an audit of your actual configuration. Instagram moves
> and renames these menus constantly — where a path here doesn't match what you see,
> search Settings for the nearest term rather than assuming the setting is gone.
> Everything below is a *reach* or *findability* argument; nothing here is cosmetic.

---

## 1. Blockers — check these first

Any one of these produces exactly the symptom you have (posting daily, views flat) and
none of them are fixed by better content.

### 1.1 Is the account public?

`Settings → Account privacy`

A private account gets **zero** non-follower reach — nothing is eligible for Explore,
Reels, hashtags or search. Trivial to check, catastrophic if wrong, so check it.

### 1.2 Is it a Professional account?

`Settings → Account type and tools → Switch to professional account`

Two reasons this is step one:

- **Without it you have no Insights**, which means the measurement plan in README §7
  (watch time, sends per reach, non-follower reach %) can't run at all. You'd be
  iterating blind.
- Professional accounts get the Account Status panel in §1.3, which is the single most
  valuable thing on this page.

### 1.3 Account Status — are you eligible to be recommended?

`Professional dashboard → Account Status` (or `Settings → Account status`)

**This is the highest-value check on the list.** It tells you whether your content is
eligible to be shown to people who don't follow you. An account can be marked
non-recommendable — for a past strike, for content judged to breach the Recommendation
Guidelines, or sometimes for a misclassification — without any obvious notification.

If it says you're **not eligible for recommendations**, that *is* your answer: reach to
strangers is switched off at the account level, and every hour spent on hooks is wasted
until it's resolved. There's usually a request-review flow on the same screen.

Devotional content is a plausible misclassification target — religious imagery and
Sanskrit/Hindi text get mis-scored by automated systems more often than English
lifestyle content does. Worth checking even if you're certain you've done nothing wrong.

### 1.4 Suggestion / recommendation toggles

`Settings → Suggested content`, and the "similar account suggestions" toggle on
`Edit profile`

Make sure you haven't opted out of being suggested to others. The account-suggestion
toggle in particular is easy to have switched off years ago and forgotten.

---

## 2. Creator vs Business — this one has teeth

`Settings → Account type and tools`

Both are Professional accounts and both give you Insights, so it looks like a cosmetic
choice. It isn't, for one specific reason that lands directly on README §1.3:

**Business accounts see a restricted audio library.** Instagram licenses its
trending-audio catalogue for personal/creator use; accounts flagged as businesses get a
smaller commercial-safe library. Creator accounts get the full one.

Since "the reels are silent" is one of the diagnosed causes and the fix is *add audio
from Instagram's own library in the composer*, being on a Business account may be
quietly removing the exact fix you need.

**Verify it directly** rather than trusting this doc: open the Reels composer, tap the
audio picker, and see whether trending/popular tracks are offered or whether you only
get a generic royalty-free set.

| | Creator | Business |
|---|---|---|
| Full trending audio library | ✅ | ⚠️ restricted |
| Insights | ✅ | ✅ |
| Native scheduling (Meta Business Suite) | partial | ✅ |
| Third-party schedulers / API posting | limited | ✅ |
| Action buttons, shop, ads | limited | ✅ |

**Recommendation: Creator.** You have no ad spend and no shop; audio access matters more
than scheduling, and you can schedule manually. Switching is reversible — but do it
once and leave it, since flip-flopping account types is not a free operation.

---

## 3. The profile is a search surface

Instagram is a search engine now, and the profile fields are indexed. Right now they're
almost certainly written as branding rather than as findability.

### 3.1 The Name field — the one people miss

`Edit profile → Name`

**This is not your username.** It's a separate, *searchable* field, and it is the single
most under-used ranking surface on the platform. Someone typing "पंचांग" or "vrat
calendar" into search can match your Name field; they cannot match your bio.

- Now (probably): `Vedansh`
- Better: `Vedansh · पंचांग, व्रत, गीता`

You get ~30 characters. Spend them on what people search for, not on a tagline. Keep
`Vedansh` in it — brand plus keywords, not keywords alone.

Username `@vedansh.app` is fine as-is. Don't change it; you'd lose every existing link.

### 3.2 Bio

`Edit profile → Bio`

Hindi-first, same as the captions (README §2). It needs to answer "what is this and why
should I follow" in the two lines visible before the fold. Something like:

```
व्रत, पंचांग और गीता — एक जगह 🪔
आपके शहर की तिथि · व्रत कथा · reminders
मुफ़्त · पूरी तरह ऑफ़लाइन · iPhone & Android
```

Bio text is weighted much less than the Name field for search, so write it for humans.

### 3.3 Links

`Edit profile → Links`

You get up to 5 link slots, not 1. Primary stays the smart link that already routes to
both stores — `https://persisharma.github.io/get-vedansh/`, defined in
`mobile/src/data/shareLinks.ts`. One link is genuinely fine here; the app is the only
destination. Don't add filler.

### 3.4 Category

`Edit profile → Category`

Shows under your name. Pick something a devotee reads and recognises. Avoid anything
that reads as a commercial vendor.

### 3.5 Profile photo

Must be legible as a ~40px circle in a comment thread. A wordmark that needs reading at
full size is invisible at thumbnail size — use the ॐ / deity glyph, not the full lockup.
`mobile/src/components/deityGlyphs/` and `wiki/deity-icons.md` have the drawn glyph set.

---

## 4. Sharing and reuse toggles

These directly serve the "designed to be sent" thesis in README §1.4. If any are off,
you are blocking your own distribution.

`Settings → Sharing and reuse` (also per-post in the composer's Advanced settings)

- **Allow resharing to Stories — ON.** Non-negotiable. When someone reshares your reel
  to their Story, that is your best-converting distribution, and it's free. If this is
  off, the audience most inclined to spread your content literally cannot.
- **Allow remixes — ON.** Remixes are free reach.
- **Allow downloads — ON.** For this niche especially: people save devotional content
  and forward it on WhatsApp. That's the motion you *want*, and a download that leaves
  the platform still originated with a post that got attention.
- **Auto-generated captions — ON.** Reels autoplay muted; captions hold viewers who
  haven't tapped for sound yet, which is watch time, which is reach.
- **Share to Facebook** — if there's a linked Page, cross-posting reels is free
  incremental distribution at zero marginal effort.

## 5. Things that quietly suppress engagement

- **Hidden words / comment filters** — `Settings → Hidden Words`. An over-broad manual
  filter (or the aggressive default offensive-word filter) can silently hide real
  comments. Comments are a signal; check what's actually being caught.
- **Manual comment approval / restricted accounts** — if these were turned on during
  some past spam wave, turn them back off.
- **Sensitive-content classification** — if your own posts appear behind a warning
  screen or don't surface in hashtag results, that's a misclassification worth appealing
  via the same Account Status flow in §1.3.

## 6. Hygiene

Not reach levers, but the downside is total loss of the account:

- **Two-factor authentication ON**, with recovery codes saved somewhere outside the
  phone.
- **Email and phone verified**, so account recovery is actually possible.
- **Check logged-in devices** and revoke anything unfamiliar.

---

## 7. Do this in one sitting

1. Public? Professional? → §1.1, §1.2
2. **Account Status — recommendation eligibility.** If this is bad, stop and fix it
   before anything else. → §1.3
3. Open the audio picker; if trending tracks are missing, switch to Creator. → §2
4. Rewrite the Name field with keywords. → §3.1
5. Turn on resharing, remixes, downloads, auto-captions. → §4
6. Check Hidden Words isn't eating comments. → §5
7. Enable 2FA. → §6

Steps 2–5 are the ones that plausibly move the number. Everything else is hygiene.

Then give it two weeks before judging any of it, and change one thing at a time —
same rule as README §7.
