# Post 3 — Milestone: Android crossed 50+ downloads in week one

**CTA link:** https://persisharma.github.io/get-vedansh/  (smart link → iPhone & Android)
**Pair with:** `milestone-stores-portrait.png` (4:5) — **upload this one.** LinkedIn's feed is mostly
mobile, and 4:5 is the tallest ratio it shows uncropped, so the panels stay legible on a phone.
`milestone-stores.png` is the same card in 2.27:1 landscape — fine on desktop, but it renders as a
thin strip on mobile with ~8pt captions. Keep it only if you need a wide crop somewhere else.

Both are already scrubbed: no status bars, no browser chrome, and the developer name/handle masked out
of both listings. Upload as-is.
Regenerate with `python3 ../make-store-card.py <play.png> <ios.png>` (writes both) if the numbers move.

Attaching an image also stops LinkedIn rendering a link-preview card, so the CTA URL stays as plain
text in the body — that's why the link can stay in the post rather than going in the first comment.
**Suggested timing:** post while the week-one number is still fresh.

**Numbers used (update before publishing if they've moved):**
- Android — 50+ downloads in the **first week** on the Play Store.
- iOS — ~90+ downloads over **~10 weeks** on the App Store.
- **10+ ratings — combined across both platforms**, not per store (roughly 5 + 5; both listings show 5.0★).

**Tone:** short celebration, not a lessons post. The numbers do the talking — no takeaways,
no distribution theory. Also carries a light feedback ask and a one-line teaser for the next thing.

────────────────────────────────────────────────────────────
COPY–PASTE THE TEXT BELOW  (LinkedIn is plain text — no markdown)
────────────────────────────────────────────────────────────

A small milestone I'm quietly happy about 🙏

Vedansh took about 10 weeks on the App Store to reach ~90 downloads.

The Android build went live last week — and crossed 50+ downloads in seven days.

And 10+ ratings now across the two stores put together, every one of them five stars.

Small numbers, I know. But they're real people who kept a little app on their phone, and that means a lot.

If you use it and something feels missing or clumsy — tell me. Suggestions are what shape whatever I build next.

It's called Vedansh — Panchang, vrat & festival calendar, Gita, chalisas, aartis, stotrams, and a daily routine you build yourself. All offline, no account.
👉 https://persisharma.github.io/get-vedansh/ (iPhone & Android)

Also started work on something new, on a very different charter. More on that soon.

────────────────────────────────────────────────────────────
Optional
────────────────────────────────────────────────────────────
- Hashtags (pick 3–5): #BuildInPublic #IndieApp #ReactNative #Android #Spirituality
- Reach tip: LinkedIn throttles posts with an external link in the body. Alternative — end with "Link in the first comment 👇" and drop https://persisharma.github.io/get-vedansh/ as your own first comment.
- Visual: `milestone-stores.png` — the two listings side by side; the "50+ Downloads" tile is the hook. The App Store doesn't show a download count at all, so the captions under each panel are what carry the 10-weeks-vs-1-week contrast.
- If the numbers move before you publish, update all three figures in the copy AND the `CAP_IOS` / `CAP_PLAY` captions at the top of `make-store-card.py`, then re-run it.
- Keep the teaser to one line and unnamed — naming it invites "what is it?" replies you can't answer yet. The reveal is its own post.
- Drop the last line entirely if you'd rather not tease yet; the post stands without it.
