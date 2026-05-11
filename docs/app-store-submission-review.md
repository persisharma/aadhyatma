# Vedansh — App Store Submission Review (v1.1.1, build 5)

Prepared after the previous rejection citing **Guideline 4.2 — Minimum Functionality**.
Audience: App Review team (notes pasted into App Review Information) and the
maintainer (engineering punch list).

---

## 1. Why the prior 4.2 rejection likely happened

4.2 is invoked when the reviewer perceives the app as:

- a repackaged website / book / PDF reader, or
- a thin shell around static text with no genuinely "app-like" interaction.

For a scripture-reader app this is the default suspicion. The previous build
probably read, to a fast-scanning reviewer, like "another Bhagavad Gita reader."
The fix is **not** to add gimmicks — it is to make the interactive,
state-bearing, value-adding features impossible to miss in the review notes and
in the first 30 seconds of the demo path.

The current code already contains the features that satisfy 4.2. The gap is
**communication** to the reviewer (App Review Information notes, optional
demo video, app description) and a handful of small product polish items.

---

## 2. What the app actually does (feature inventory, current code)

Verified against the codebase on branch `claude/review-app-submission-E4F5v`:

### Content (bundled, offline, no network)

- **23 active sections** across 5 categories — see `mobile/src/data/texts.ts`.
- **Bhagavad Gita** — 18 chapters, 701 verses. Every verse has Sanskrit,
  transliteration, Hindi meaning, English meaning, **and** multi-paragraph
  commentary in both languages (`mobile/src/data/gita/chapter-*.json`,
  ~24k+ lines of JSON across 72 content files).
- **Sundarkand** — 16 sargas with verse-level Hindi + English meaning.
- **Ramcharitmanas** — Balkand with multi-language meanings.
- **4 Chalisas** — Hanuman, Shiv, Durga, Ganesh, each with bilingual meanings.
- **4 Stotrams** — Shiva (incl. Maha Mrityunjay, Shiv Tandav), Durga, Ganesh,
  Vishnu Sahasranama.
- **Hanuman Ashtak, Ram Stuti** — verse-level bilingual content.
- **7 Aartis** with bilingual stanza-by-stanza explanations
  (`mobile/src/data/aarti/`).
- **4 Japa mantras** (Om Namah Shivaya, Hare Krishna Mahamantra, Gayatri
  Mantra, Om Namo Bhagavate Vasudevaya) — see `mobile/src/data/japam/japam.json`.

### Interactive features (this is the 4.2 answer)

1. **Japam (Mantra) Counter** — `mobile/src/screens/JapamCounterScreen.tsx`
   - Tap-to-chant counter with **108-bead mala tracking** and round counts.
   - Distinct haptic feedback on every bead (light impact) and on every
     completed round of 108 (success notification) — via `expo-haptics`.
   - Per-mantra counters, persisted locally; "Reset Beads" and "Clear All"
     with confirm modals.
2. **Sadhak Profile / Insights** — `mobile/src/screens/ProfileScreen.tsx`
   + `mobile/src/contexts/UserActivityContext.tsx`
   - Lifetime / monthly / daily totals for verses read + beads chanted.
   - **Consecutive-day streak** counter.
   - **7-day trend bar chart** of total spiritual activity.
   - Per-source and per-mantra breakdowns.
3. **Bookmarks (Wishlist)** — `mobile/src/screens/WishlistScreen.tsx`
   + `mobile/src/contexts/BookmarksContext.tsx`
   - Tap-to-save any verse across any of the 23 sections; deep-link back to
     the exact verse on tap.
4. **Reading Progress + Resume sheet** —
   `mobile/src/contexts/ReadingProgressContext.tsx`
   + `mobile/src/components/ResumeReadingSheet.tsx`
   - Per-section progress saved automatically as the user pages forward;
     on re-entry the app offers "Resume from verse X" vs "Start over."
5. **Auto-advance to next chapter** when paging past the last verse.
6. **Daily Bhakti** — `mobile/src/screens/DailyBhaktiScreen.tsx`
   - Random verse pulled from a curated pool across all sections; refreshable;
     respects the language toggle.
7. **Bilingual everywhere (Hindi ↔ English) with a persisted toggle**
   - `mobile/src/data/gita/language.tsx`. Single source of truth; the toggle
     is rendered on every reader, chapter index, japam, and aarti screen.
8. **Two browse axes** — Category grid (Granth / Stotram / Chalisa / Japam /
   Aarti) and Deity index (Ram / Krishna / Shiva / Hanuman / Durga / Ganesha).
9. **Tab navigation** — Home, Bhakti, More — with a custom-drawn icon set.
10. **Custom typography pipeline** — Noto Serif Devanagari + Cormorant Garamond,
    bundled via `expo-font` with a splash-screen gate so verses never render
    in a fallback font.
11. **Faded hand-drawn sketch backgrounds** per section
    (`mobile/assets/chalisa/`, `mobile/assets/gita/`,
    `mobile/assets/shiva-strotam/`) — deterministically picked per verse id,
    not random per render.
12. **Report a Discrepancy** — pre-filled `mailto:` flow in every Help / About
    surface so readers can flag textual errors. `incardible.app@gmail.com`.
13. **OTA updates** wired through `expo-updates` against the EAS project so
    content corrections ship without a new App Store build.

### Privacy posture (relevant to 5.1.1, 5.1.2)

- **No network calls** for content. All scripture JSON is bundled
  (verified — no `fetch` / `axios` / `firebase` / analytics SDK in
  `mobile/src`). The only outbound call is `expo-updates` to Expo's OTA
  endpoint, which serves the JS bundle.
- **No accounts, no sign-in, no identifiers collected.** AsyncStorage holds
  bookmarks, japam counts, reading progress, activity totals, and the
  language preference — all on-device, never transmitted.
- **No permissions requested.** `app.json` declares only
  `ITSAppUsesNonExemptEncryption: false`. No camera / mic / location /
  contacts / photos / tracking entitlements.
- **No ads, no IAP, no subscriptions.** Free.

---

## 3. App Review Information — recommended notes (paste into ASC)

> Vedansh is an offline, bilingual (Hindi / English) reader and practice
> companion for classical Hindu scripture. It is not a static book or PDF —
> it is a daily-use sadhana app with the following interactive,
> state-bearing features:
>
> 1. **Japa Mantra Counter** (Home → Japa tile → tap any mantra): a 108-bead
>    mala tracker with per-bead haptic feedback, automatic round counting,
>    and persisted per-mantra history. Try "Om Namah Shivaya" — tap the
>    center repeatedly to feel the per-bead haptic and the round-completion
>    haptic at the 108th tap.
> 2. **Sadhak Profile / Insights** (More tab → Sadhak Profile): lifetime,
>    monthly, and daily totals of verses read and mantras chanted; a
>    consecutive-day streak counter; a 7-day activity bar chart; per-source
>    and per-mantra breakdowns. State is built up by actually using the app.
> 3. **Bookmarks / Wishlist** (tap the bookmark icon on any verse, then More
>    tab → Wishlist): cross-section bookmark store that deep-links back to
>    the exact verse.
> 4. **Reading Progress with Resume sheet**: open any chapter, swipe forward
>    a few verses, leave, and re-open — the app offers "Resume from verse X"
>    vs "Start over."
> 5. **Daily Bhakti** (middle tab): a verse-of-the-day surface drawn from a
>    curated pool across all 23 sections; pull-refresh to re-roll.
> 6. **Language toggle** (top bar of every reader): instantly swaps Hindi
>    Devanagari and English meanings/transliteration across the entire app;
>    preference is persisted.
> 7. **Two browse axes**: Home grid by Category (Granth / Stotram / Chalisa /
>    Japam / Aarti) and by Deity (Ram / Krishna / Shiva / Hanuman / Durga /
>    Ganesha).
>
> Content scope: 23 active sections including Bhagavad Gita (701 verses with
> Sanskrit, transliteration, and bilingual commentary), Sundarkand
> (16 sargas), four Chalisas, four Stotrams (incl. Vishnu Sahasranama),
> Ramcharitmanas Balkand, Hanuman Ashtak, Ram Stuti, seven Aartis with
> verse-by-verse explanations, and four Japa mantras.
>
> Privacy: the app makes no network calls for content, requires no account,
> requests no permissions, and collects no personal data. All user state
> (bookmarks, japa counts, reading progress) is stored locally in
> AsyncStorage and is never transmitted off-device. No ads, no IAP, no
> tracking SDKs.
>
> Demo path for the reviewer (≈ 60 seconds):
>   a. Home → tap "Japa" tile → tap "Om Namah Shivaya" → tap the central
>      counter ~10 times (feel haptics, see beads count up).
>   b. Back to Home → tap "Granth" → tap "Bhagavad Gita" → tap any chapter
>      → swipe through 2-3 verses → toggle the HI/EN language switch in
>      the top bar (content swaps live) → tap the bookmark icon.
>   c. Bhakti tab → see the random verse → pull to refresh.
>   d. More tab → Sadhak Profile → see Lifetime / Monthly / Today totals,
>      the 7-day trend, the streak counter, and the per-source breakdown
>      populated by the steps above.
>   e. More tab → Wishlist → tap the bookmark saved in step (b) — the app
>      deep-links back to that exact verse.
>
> Contact for any content / textual questions: incardible.app@gmail.com

---

## 4. Other guidelines — risks and status

| # | Guideline | Status | Notes |
|---|-----------|--------|-------|
| 1.1.6 | Objectionable / false info | ✅ low | Disclaimer modal explicitly states "no scholarly or sectarian authority claimed" (HI + EN), and provides a takedown email. |
| 1.2 | User-generated content | ✅ n/a | No UGC surfaces. |
| 1.6 | Data security | ✅ low | All user state is local AsyncStorage. No transmission. |
| 2.1 | App completeness | ✅ low | 23 active sections; no placeholders shipping as active (coming-soon entries are `hidden: true`). |
| 2.3.1 | Accurate metadata | ⚠️ verify | Confirm App Store description matches the feature list in §3. Screenshots should include the Japa counter and the Sadhak Profile — those are the strongest 4.2 answers. |
| 2.3.3 | Screenshots | ⚠️ action | If current screenshots only show verse-reader screens, reviewer will re-anchor on the "book" reading. Add screenshots of: Japa counter (with bead ring + round count), Sadhak Profile (Lifetime totals + 7-day chart), Wishlist, Daily Bhakti, Resume-reading sheet, Language-toggle before/after. |
| 2.5.1 | Public APIs only | ✅ low | Expo SDK 54 + React Native 0.81 only. |
| **4.0** | Design | ✅ low | Custom theme tokens, deliberate Devanagari + Latin typography pairing, parchment palette, ornament dividers, hand-drawn sketch backgrounds. Bottom tabs with bespoke icons. |
| **4.2** | Minimum functionality | ⚠️ **primary risk** | See §1 and §3. The Japa counter + Sadhak Profile + bookmarks + resume + bilingual toggle, taken together, are well beyond "a repackaged book." Communicate this explicitly in the App Review notes and lead the screenshots with the interactive surfaces. |
| 4.2.6 | Templated apps | ✅ low | Custom Expo / RN code; no template generator. |
| 4.3 | Spam / duplicate | ✅ low | Bilingual + Japa + Insights composition is not a duplicate of any known submission from this developer. |
| 5.1.1 | Data collection | ✅ low | No data collection. Disclaimer says so; behaviour matches. Confirm App Privacy answers in ASC say "Data Not Collected" for all categories. |
| 5.1.2 | Data use & sharing | ✅ low | None. |
| 5.1.7 | Tracking | ✅ low | No ATT prompt needed — no tracking. |
| 5.2 | Intellectual property | ⚠️ verify | Texts are public-domain Bharatiya classics; disclaimer claims fair use for translations and commentary, with a takedown email. **Action**: ensure no translation is taken verbatim from a copyrighted modern translator. The Gita commentary in `chapter-*.json` is long-form prose — confirm provenance is public domain (Swami Sivananda commentary is PD in many jurisdictions but verify) or that it is original. |
| 5.6.1 | Developer name | ✅ verify | App registered to `prashant.sharma` (Expo owner); App Store account name should match the disclaimer's stated maintainer. |

---

## 5. Concrete code/product changes worth making before resubmission

Order is by effort × likelihood-of-helping. None are blockers; (a)–(c) are
the highest-leverage.

(a) **Surface the interactive features higher.** Today the Home screen leads
    with the category grid, which reads as "a list of books." Consider
    promoting the Japa tile (or a "Today" card showing the streak + last
    read verse + next mala round) above the category grid. This is the
    same one-screen demo the reviewer sees in the first 5 seconds.

(b) **Add a privacy section to the About & Disclaimer modal.** The current
    disclaimer is about textual accuracy / fair use. Add a third heading,
    "Privacy", with one paragraph in each language stating: no accounts,
    no data leaves the device, no analytics, no tracking, no third-party
    SDKs. This pre-empts 5.1.x questions and helps 4.2 (privacy-first
    apps are perceived as more "considered").

(c) **Screenshots / preview video.** Submit a 15–30s App Preview video
    showing: Japa tap → bead ring fill → round haptic → Sadhak Profile
    insights → bookmark a verse → reopen, get Resume sheet. This is the
    cheapest 4.2 fix in App Review history.

(d) **App Store description** — open the paragraph with what makes it not a
    book: "Daily japa counter with 108-bead mala tracking. Sadhak Profile
    with streak and 7-day insights. Bookmarks across 23 scriptures.
    Bilingual Hindi ↔ English. Fully offline. No accounts, no ads, no
    tracking." Then list the content. Reviewers read the first two lines.

(e) **Provide demo creds note "n/a — no login required"** in App Review
    Information. Prevents a back-and-forth.

(f) **Verify content provenance.** Walk through one chapter of each
    section's commentary file and confirm the prose is either (i) clearly
    public domain (older than 95 years in the relevant jurisdiction, e.g.
    Sivananda, Tilak, etc.) or (ii) original. Add an attribution line
    in the About modal naming the public-domain commentators whose work
    informed the meanings — this strengthens 5.2 and adds editorial
    credibility.

(g) **(Optional) Privacy policy URL.** Even though no data is collected,
    Apple's App Privacy form prefers a URL. A one-page static page hosted
    on GitHub Pages stating "we collect nothing" is enough.

(h) **(Optional) Support URL** in ASC. Currently only an email
    (`incardible.app@gmail.com`). A simple FAQ / support page (even the
    same GitHub Pages site) reads more professionally to reviewers.

---

## 6. Things in the code that are fine but worth knowing

- `expo-updates` is wired; do not push a fresh OTA payload during review
  that diverges from the binary, or you will trip 2.5.2 (executable code
  delivery). Keep the production channel stable until approval.
- `predictiveBackGestureEnabled: false` (Android) and the reader screens
  disabling the iOS back gesture (`gestureEnabled: false`) is intentional
  to keep the swipe-paginated FlatList from conflicting with system back —
  reviewers occasionally flag this; it is the correct call.
- `newArchEnabled: true` — Expo 54 default. No action needed.
- `runtimeVersion: { policy: 'appVersion' }` — correct. New binary versions
  get fresh OTA channels; safe.

---

## 7. TL;DR for the reviewer reply box (paste this verbatim if helpful)

> Thank you for the review. Vedansh is an interactive sadhana
> (spiritual-practice) app, not a static reader. The features that
> distinguish it from a book are:
>
> • **Japa mantra counter** with 108-bead mala tracking, per-bead and
>   per-round haptic feedback, and persisted per-mantra history.
> • **Sadhak Profile / Insights** showing lifetime, monthly, and daily
>   totals of verses read and mantras chanted, a consecutive-day streak,
>   and a 7-day activity chart.
> • **Bookmarks** across all 23 sections, with deep-link return to the
>   exact verse.
> • **Reading progress with a Resume sheet** that offers "Resume from
>   verse X" or "Start over."
> • **Daily Bhakti** verse-of-the-day with a curated pool.
> • **Bilingual Hindi ↔ English** toggle that swaps meanings and
>   transliterations live across the entire app; preference persisted.
> • Browse by **Category** (Granth, Stotram, Chalisa, Japa, Aarti) **and
>   by Deity** (Ram, Krishna, Shiva, Hanuman, Durga, Ganesha).
>
> The app is fully offline, requires no account, requests no permissions,
> collects no personal data, transmits nothing off-device, and contains
> no ads, IAP, or third-party tracking SDKs.
>
> A 60-second demo path is included in the App Review Information notes.
> Please let us know if any of the above is unclear or if a specific
> surface would help — happy to record an App Preview video.
