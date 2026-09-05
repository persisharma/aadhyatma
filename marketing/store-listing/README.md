# Store listing — capturing competitor demand without ads

Companion to `../instagram/` (reach from strangers) and `../linkedin/` (release announcements).
**This kit exists to win installs from people who came to the store looking for someone else's
app**, with zero ad spend. It covers the App Store (live, iOS) and Google Play (Android launch is a
Q4 2026 roadmap item; the listing here is launch-ready).

What lives where:

| Piece | File | Ships via |
|---|---|---|
| App Store listing text (en-GB + **hi**) | `mobile/store.config.json` | `./release.sh --metadata` (`eas metadata:push`) |
| Google Play listing text (en-IN, hi-IN; gu-IN/kn-IN drafts) | `play/<locale>/{title,short_description,full_description}.txt` | paste into Play Console → Store presence → Main store listing (fastlane `supply` layout if you automate later) |
| Limit checker | `check-limits.mjs` | `node marketing/store-listing/check-limits.mjs` — exit 1 if any field is over |

> **Honesty gate.** Every feature named in the copy exists in the repo today (counts pulled from
> `mobile/src/data` on 2026-09-05: 69 texts, 701 Gita shlokas, 9 chalisas, 9 aartis, 84 kathas,
> 166 observances, 71 temples, 21 deities). Widgets, vastu and read-aloud need the **native build**
> that carries them; if you push metadata against an older binary, delete those bullets first.
> Gujarati/Kannada are **scripts**, not translations (runtime transliteration) — the copy says
> "readable in Gujarati and Kannada script" on purpose. Don't "improve" it to "in Gujarati".

---

## 1. The thesis

You cannot buy competitor traffic (no ads) and you cannot name competitors (Apple guideline
2.3.7 and Google Play's metadata policy both reject metadata that references other apps' brands;
Apple rejects the whole submission). So "become a candidate when people come for them" has exactly
three legitimate mechanisms, and this kit is built around them:

1. **Rank on the generic queries that actually deliver their installs.** Nobody types
   "sri mandir" on day one — they type *hanuman chalisa*, *aaj ka panchang*, *bhagavad gita hindi*,
   *aarti*, *vrat katha*, *kundli*. The incumbents own those results today because their metadata
   is tuned for them. Vedansh genuinely has every one of those features, so it can compete on
   every one of those queries. Section 3 maps query → competitor → where Vedansh puts the term.
2. **Get placed on their product pages.** Both stores show *"You might also like"* / *"Similar
   apps"* on every listing. Placement is driven by category match, semantic overlap of the
   listing text, and co-install behaviour. Same category (Lifestyle) + the same feature
   vocabulary in the description = Vedansh appears *on the competitor's own page*. This is the only
   way to literally sit in front of someone who searched for a competitor by name.
3. **Convert their dissatisfied users.** Read the 1–3★ reviews of the puja-booking apps, the
   panchang apps and the kundli apps: ads, forced login, notification spam, upsell nudges,
   online-only. Vedansh's listing therefore leads with the switcher message — **No ads. No login.
   Works offline. Private.** — in the subtitle, the first three lines of the description, the promo
   text and screenshot 1. That sentence is doing the acquisition work; the feature list is proof.

Everything else (localisation, in-app events, custom product pages, ratings) exists to make those
three mechanisms fire harder.

## 2. Rules that bound this

- **No competitor names anywhere** — title, subtitle, keywords, description, screenshots,
  release notes, In-App Event copy. Apple 2.3.7; Play "Metadata" policy (misleading / irrelevant
  references). A rejection costs a review cycle and, on Apple, the version.
- **No performance or price claims in the title/icon** ("#1", "best", "free") — Play rejects
  these outright; Apple treats them as irrelevant keywords.
- **Every claim must exist in the submitted binary** (see the honesty gate above). Reviewers do
  open the app and look for the feature named in screenshot 1.
- **Apple indexes** title (30) + subtitle (30) + keyword field (100) only. The description is
  conversion copy, not ranking copy. **Google Play indexes** title (30), short description (80)
  *and* the full description (4000), plus review text and the developer name — on Play the
  description *is* ranking copy, so it repeats each head term 3–5 times, naturally.
- Title / subtitle / keyword changes on Apple **ship only with a new version**. Promo text, In-App
  Events and Custom Product Pages change any time without a build. On Play everything is editable
  any time (each edit is reviewed, usually within hours).

## 3. Competitor demand map

Archetypes, not names. The point is the *intent* each one owns and where Vedansh answers it.

| Archetype (what they lead with) | Intents they own | Vedansh's honest answer | Where it goes | Switcher angle |
|---|---|---|---|---|
| **Puja-booking "own temple" apps** (aarti · bhajan · chalisa · book puja · chadhava) | hanuman chalisa, aarti, bhajan, mandir app, puja, daily darshan | 9 chalisas + 9 aartis with read-aloud, aarti/chalisa player, puja vidhi & bhog, Theerth temple stories | Title: *Aarti* · Subtitle: *Chalisa* · KW: hanuman, bhajan, puja · Play short desc | "No ads, no login, nothing to buy" |
| **Panchang / Hindu-calendar apps** | panchang, hindu calendar, aaj ka panchang, choghadiya, rahu kaal, muhurat, ekadashi dates | Astronomy-engine panchang, Choghadiya/Rahu Kaal/Abhijit/hora, 166 observances, city picker works offline | Title: *Panchang* · KW: muhurat, calendar, hindu, ekadashi · hi KW: मुहूर्त, panchangam | "Modern, readable, offline — and it comes with the kathas and the texts" |
| **Kundli / rashifal / astrologer apps** | kundli, rashifal, horoscope, kundli matching, namkaran | On-device kundali with dasha & gochar, daily rashifal, Guna Milan, Namkaran | KW: kundli, rashifal · hi KW: कुंडली, राशिफल, horoscope | "Free, private, computed on your phone, no astrologer upsell" |
| **Single-text apps** (Gita apps, Hanuman Chalisa apps, Ramayan/Sundarkand apps) | bhagavad gita hindi, gita with meaning, hanuman chalisa lyrics, sunderkand path | 701 shlokas with meaning, bilingual, read-aloud, resume, bookmarks; Sundarkand + Ramcharitmanas + Valmiki selections | Title: *Gita* · KW: ramayan, sunderkand · hi KW: सुंदरकांड, रामायण, sundarkand (spelling variant) | "One app instead of five, and it's offline" |
| **Bhakti audio / story apps** | bhajan, aarti audio, katha | Recorded chalisa/aarti/mantra tracks, background audio, 84 kathas, TTS read-aloud | KW: bhajan · description "player" section | "Listen and *read along*, verse by verse" |
| **Japa / mala counter apps** | japa counter, mala counter, mantra alarm | 108-bead counter, streaks, mantra alarms, Sankalp programs | Subtitle: *Japa Mala* · KW: mantra | "Counter plus alarm plus 41-day sankalp" |

Two intents Vedansh **should not chase** (weak fit hurts conversion and rating, which then hurts
rank): *live darshan / temple video* and *book a puja*. Leave them out of metadata until the
roadmap ships them.

## 4. Metadata architecture (the copy is in the files; this is why it is shaped that way)

### 4.1 App Store — `mobile/store.config.json`

The old listing used **7 of 30 title characters** ("Vedansh") and only English. The India
storefront indexes **two** localisations — English (U.K.) and **Hindi** — so adding `hi` doubles
the indexed keyword budget from 160 to 320 characters for every Indian user, whichever language
their phone is in. (Verify the storefront→locale table in App Store Connect help; this is the
single biggest free lever in the kit.)

| Field | en-GB (30/30/100) | hi (30/30/100) | Why |
|---|---|---|---|
| Title | `Vedansh: Gita, Aarti, Panchang` | `वेदांश: गीता, आरती, पंचांग` | Brand + the three highest-volume generic intents. Title carries the most ranking weight. |
| Subtitle | `Chalisa, Vrat Katha, Japa Mala` | `हनुमान चालीसा, व्रत कथा, जप` | Apple matches *combinations across fields*: `hanuman` (keyword) + `Chalisa` (subtitle) ranks for "hanuman chalisa"; `Vrat`+`Katha` ranks for "vrat katha"; `ekadashi`+`vrat` for "ekadashi vrat". |
| Keywords | `hanuman,bhajan,mantra,puja,hindu,ramayan,sunderkand,muhurat,kundli,rashifal,ekadashi,calendar,shiv` (98) | `भजन,मंत्र,पूजा,रामायण,सुंदरकांड,मुहूर्त,कुंडली,राशिफल,एकादशी,sundarkand,panchangam,horoscope,shradh` (99) | Never repeat a title/subtitle word; singulars only; no spaces. The Hindi field also carries **romanised spelling variants** (`sundarkand` vs `sunderkand`, `panchangam`) because India indexes both locales — that is extra English keyword space, not a translation. |
| Promo text (170) | switcher message + head terms | same in Hindi | Not indexed; shown above the description; editable *without a release* — rotate it per festival (§7). |
| Description | wedge in the first 3 lines, then proof | Hindi | Not indexed on Apple. The first three lines are all most people read. |
| Categories | LIFESTYLE primary, REFERENCE secondary | | Lifestyle is where the puja, panchang and kundli incumbents live — this is what puts Vedansh in *their* "You might also like" rail. Don't move to Books/Reference. |

Also add later (phase 3, optional): `en-US` so the diaspora storefronts (US, CA, UK, AU, SG, AE)
get "Hindu calendar / horoscope" spellings, and `es-MX`, which the **US** storefront indexes as its
second locale — another 160 characters of English keywords for US Indians. Same trick as `hi`.

### 4.2 Google Play — `play/<locale>/`

| Field | Rule applied |
|---|---|
| Title (30) | Same as Apple: `Vedansh: Gita, Aarti, Panchang`. |
| Short description (80) | Exactly 80: `Gita, Hanuman Chalisa, Aarti, Panchang, Vrat Katha & Japa Mala. Offline. No ads.` — head terms *and* the switcher message; this line is indexed and it is the only text on the search-result card. |
| Full description (4000) | Indexed. Head terms (gita, chalisa, aarti, panchang, vrat katha, japa, mantra, kundali) each appear 3–5×; **Hinglish exactly as people type it** (*aaj ka panchang, aarti sangrah, shubh muhurat, rahu kaal, janam kundli, sunderkand*). First 3 lines = wedge. Emoji section headers survive Play's renderer and break up the wall. |
| Category | **Lifestyle** (one category on Play). Same reason as Apple. |
| Locales | `en-IN` (default), `hi-IN` full; `gu-IN`, `kn-IN` title + short only (**native-speaker check before publishing**). Play serves the listing that matches the device language, so a Hindi-phone user sees the Devanagari listing and Devanagari searches match it. Add `mr-IN` next — Marathi is the third-largest devotional-app audience and the content is Devanagari anyway. |
| Developer name | Indexed on Play. If the account name is a personal name, consider a brand form ("Vedansh Bhakti") — account-level change, do it once, before launch. |
| Pre-registration | Open the Play listing as **pre-registration** as soon as the Android build is in closed testing: it collects installs for launch day and pre-reg badges rank in Play search. |

Run `node marketing/store-listing/check-limits.mjs` after every edit; it counts code points the
way both consoles do, and flags keyword/title duplicates.

## 5. Screenshots and preview — the conversion half

Search ranking gets the impression; screenshot 1 gets the install. Both stores show the first
2–3 frames on the results card (Apple autoplays the preview video there too). Storyboard, same
order on both stores, captions in the listing's language:

| # | Frame | Caption (en) | Caption (hi) |
|---|---|---|---|
| 1 | Home with the ॐ वेदांश ॐ wordmark and the Today strip | **No ads. No login. Works offline.** Gita, Chalisa, Panchang. | **न विज्ञापन, न लॉगइन, पूरी तरह ऑफ़लाइन।** गीता, चालीसा, पंचांग। |
| 2 | Gita verse page, Devanagari + English + IAST | Bhagavad Gita, all 701 shlokas, with meaning | भगवद गीता, सभी 701 श्लोक, अर्थ सहित |
| 3 | Hanuman Chalisa reader with read-aloud pill | Hanuman Chalisa and 8 more, read along or listen | हनुमान चालीसा और 8 अन्य, पढ़िए या सुनिए |
| 4 | Panchang screen with Choghadiya / Rahu Kaal card | Aaj ka Panchang, shubh muhurat, Rahu Kaal | आज का पंचांग, शुभ मुहूर्त, राहु काल |
| 5 | Vrat catalog + katha | 160+ vrats, 80+ kathas, reminders you choose | 160+ व्रत, 80+ कथाएँ, आपके चुने रिमाइंडर |
| 6 | Japam counter + mantra alarm | Japa mala, streaks, wake to your mantra | जप माला, स्ट्रीक, अपने मंत्र से जागिए |
| 7 | Routine / Sankalp | Nitya Sadhana and 4–41 day Sankalp | नित्य साधना और 4–41 दिन का संकल्प |
| 8 | Kundali report + Rashifal | Free kundali and daily rashifal, on your phone only | मुफ़्त कुंडली और दैनिक राशिफल, केवल आपके फ़ोन पर |
| 9 | Theerth map | 70+ dhams with their stories | 70+ धाम, हर एक की कथा |
| 10 | Widgets on a Lock Screen | Today's panchang and verse on your Home Screen | होम स्क्रीन पर आज का पंचांग और श्लोक |

Play allows 8 phone frames — drop 9 and 10 there. Reuse the existing pipeline
(`.context/appstore-<ver>/`, `make-appstore.js`, `scripts/asc-upload-screenshots.mjs`); only the
caption layer changes. The 6.9" preview video should open on frame 1's message inside the first
second (same first-second rule as the Instagram kit).

## 6. Free store features most small devs never switch on

**App Store**

- **In-App Events** — up to 5 published at once, indexed in App Store search and shown on the
  product page and Today tab. Run one per festival: *Navratri 9-day Sankalp*, *Pitru Paksha
  Smaran*, *Karwa Chauth katha & muhurat*, *Diwali Lakshmi puja vidhi*, *Gita Jayanti: read the
  Gita in 18 days*. No build needed; each event is a new surface for the festival's own search
  terms (which spike 10–50× that week).
- **Custom Product Pages (CPPs)** — up to 35, each with its own screenshots/promo text and its
  own URL (`https://apps.apple.com/app/id6766086529?ppid=<uuid>`). Make one per *intent*
  (Gita-first, Panchang-first, Kundali-first, Chalisa/Aarti-first) and per festival. Point the
  Instagram reels, the WhatsApp share card (PRD-05), the LinkedIn posts and the landing page at
  the matching CPP — the visitor lands on a page whose first screenshot is the thing the reel
  showed. App Analytics reports each CPP's conversion separately.
- **Product Page Optimization** — A/B up to 3 treatments of icon/screenshots/preview on the
  default page (icon variants must be in the binary). Test frame 1 message first: *"No ads"*
  vs *"Works offline"* vs *"Gita + Panchang + Chalisa"*.
- **Campaign links** — `?pt=<provider>&ct=<campaign>&mt=8` works for **any** source, not just
  ads, and shows up in App Analytics → Sources → Campaigns. Tag every off-store link.

**Google Play**

- **Store listing experiments** — A/B icon, screenshots, short/full description (up to 5 live).
  Same first test as above.
- **Custom store listings** — by country (diaspora), by pre-registration state, for inactive
  users, and (where the console offers it) **by inbound search keyword**: a Panchang-first listing
  for users who searched "panchang", a Gita-first listing for "gita". Check *Store presence →
  Custom store listings* in your console for the keyword option.
- **UTM referrer** on every link:
  `https://play.google.com/store/apps/details?id=com.prashantsharma.vedansh&referrer=utm_source%3Dwhatsapp%26utm_medium%3Dshare-card%26utm_campaign%3Dnavratri26`
  Play Console → Acquisition breaks installs down by UTM for free. This finally measures the
  WhatsApp share-card funnel PRD-05 wanted.
- **Promotional content (LiveOps)** — Play's festival-event equivalent; eligibility is
  invite-gated, apply once the listing is live.

## 7. Seasonality — the calendar *is* the growth plan

Devotional search volume is a series of spikes, and the incumbents' generic metadata cannot chase
them. Vedansh can, because promo text, In-App Events, CPPs and Play's short description all change
without a build. Next 90 days (dates are approximate — **confirm every one in the app's own
Panchang tab / `getUpcomingFestivals()` before scheduling**):

| Window | Moment | Promo text / short description lead | In-App Event / CPP | Feature to screenshot |
|---|---|---|---|---|
| Sep 14 → 25 | Ganesh Chaturthi → Anant Chaturdashi | "Ganesh Chalisa, Jai Ganesh Deva aarti, sthapana-to-visarjan guidance" | *Ganeshotsav 10 days* | Festival arc (sthapana → visarjan), Ganesh Chalisa |
| Sep 26 → Oct 10 | Pitru Paksha (Sarva Pitru Amavasya) | "Shraddha tithis for your family, Pitru Smaran reminders" | *Pitru Paksha Smaran* | Pitru Smaran list, Panchang tithi |
| Oct 11 → 20 | Sharad Navratri → Dussehra | "Durga Chalisa, Jai Ambe Gauri, 9-day Sankalp, daily muhurat" | *Navratri 9-day Sankalp* (the single highest-volume week of the year) | Sankalp program, Durga Chalisa |
| Oct 29 | Karwa Chauth | "Karwa Chauth katha, moonrise time for your city" | *Karwa Chauth katha & moonrise* | Katha + Panchang moonrise |
| Nov 6 → 10 | Dhanteras → Diwali → Bhai Dooj | "Lakshmi puja muhurat, Mahalakshmi Ashtakam, puja vidhi & bhog" | *Diwali puja muhurat & vidhi* | Muhurat card, Vidhi checklist |
| Nov 15 | Chhath | "Surya Ashtakam, sunrise & sunset for your city" | — | Panchang sunrise/sunset |
| ~Dec 20 | Gita Jayanti (Mokshada Ekadashi) | "Read the Gita: 18 chapters in 18 days" | *Gita Jayanti reading Sankalp* | Gita reader + progress |
| Every Ekadashi / Pradosh | — | Play short description unchanged; rotate only the Apple promo text line | — | — |

Each row = one promo-text edit (Apple), one short-description or LiveOps edit (Play), one
In-App Event, and one Instagram reel from `../instagram/` pointing at the festival CPP with UTM.
Same asset set, four surfaces.

## 8. Ratings — the multiplier on everything above

Both stores weight rating *volume and recency* heavily, and Play's search indexes review text. The
app already has a themed rating sheet (`mobile/src/data/ratingPrompt.ts`: 5 opens, 3 active days,
20 verse reads, re-ask every 5 days, hand-off via `Linking`). Three changes, in priority order:

1. **Ask at completion moments, not on a timer** — end of a chalisa, day 7/21/41 of a Sankalp,
   the 108th bead, Panchang opened 7 days running. Completion is when people are grateful and
   specific. Keep the existing gate as a floor.
2. **Name the feature in the ask** ("Did today's Hanuman Chalisa path help? A rating helps others
   find it"). People then write reviews that say *chalisa*, *panchang*, *gita* — Play indexes that
   text, and it reads as authentic because it is.
3. **Once the Android build exists, add the native in-app review APIs** (`expo-store-review`;
   Play In-App Review is a native module, so it rides the Android launch build). The native sheet
   converts several times better than a store hand-off. Keep the JS sheet as the OTA fallback.

Reply to every review within 48 hours, in the reviewer's language. Reply rate is visible on the
listing and lifts conversion; a reply that says "fixed in 1.4.9" turns 3★ into 5★ more often than
anything else you can do.

## 9. Off-store channels that land on the listing (all free)

- **WhatsApp share cards** (PRD-05) → CPP/UTM links. This is the family-group channel; it is where
  the incumbents' users already talk. Every festival reel ends with "share the katha".
- **Instagram reels kit** (`../instagram/`) → link-in-bio to the *current festival CPP*.
- **Landing page** (`persisharma.github.io/get-vedansh`) → give it the same title words
  ("Bhagavad Gita, Hanuman Chalisa, Panchang app — offline, no ads") and one page per intent
  (`/gita`, `/panchang`, `/hanuman-chalisa`, `/vrat-katha`) each with the store badges carrying
  `pt/ct` and UTM. Google web search for "hanuman chalisa app without ads" is uncontested.
- **Communities** — temple and society WhatsApp groups, r/hinduism, Quora Hindi, Koo/X Hindi
  devotional accounts: answer the actual question ("aaj ka rahu kaal?", "karwa chauth moonrise
  Delhi?") with the app's own screenshot and a UTM link. Never a bare "download my app".
- **Product Hunt / Indie Hackers / HN Show** for the "offline, no tracking, no backend" story —
  a different audience, but it produces the backlinks that lift the landing page.

## 10. Measurement (no paid tools)

| Metric | Where | Target after 60 days |
|---|---|---|
| Impressions → product page views → installs, by source (Search / Browse / Referrer / Web) | App Store Connect → App Analytics → Acquisition; Play Console → Store performance | Search share of installs ≥ 50 %; page conversion ≥ 30 % (India Lifestyle median is ~20–25 %) |
| Per-CPP and per-campaign conversion | App Analytics → Sources → Campaigns / Custom Product Pages | Festival CPPs convert ≥ 1.5× the default page |
| UTM installs | Play Console → Acquisition → UTM | WhatsApp ≥ 30 % of referrer installs (PRD-05 goal) |
| Keyword ranks | Weekly manual check, incognito, on an Indian storefront: `hanuman chalisa`, `bhagavad gita`, `panchang`, `aarti`, `vrat katha`, `japa`, `kundli`, `rashifal` | Top 10 for the six text/panchang terms within 90 days; top 25 for kundli/rashifal |
| "You might also like" placement | Open the top 5 incumbent listings weekly and look for Vedansh in the rail | Present on ≥ 2 of 5 by day 90 |
| Ratings | Both consoles | ≥ 4.6, and review count doubling quarter on quarter |

Free tiers of AppFollow / AppTweak / Sensor Tower give a handful of tracked keywords if you want
the ranks automated; the manual check is enough to start.

## 11. Ship checklist

1. `node marketing/store-listing/check-limits.mjs` → all fields within limits (already green).
2. Regenerate screenshots with the §5 captions; upload with `./release.sh --screenshots-only`.
3. Next store version: `./release.sh --metadata` pushes the new title/subtitle/keywords + the `hi`
   locale (title/subtitle/keywords need a version; promo text can be pushed alone any time).
4. In App Store Connect: enable Hindi localisation for the app record if `metadata:push` asks;
   create the first CPP and In-App Event (§6/§7) for the next festival.
5. Play: create the app record with the `en-IN` listing, add `hi-IN`, set Lifestyle, turn on
   pre-registration, add the UTM to `shareLinks.ts` once the listing URL is live.
6. Move the rating ask to completion moments (§8.1–8.2) — OTA-safe.
7. Put the §7 calendar into whatever you use for reminders; the promo-text edit is a 2-minute job
   that pays every festival.

## Sources

Guidelines and mechanics referenced above:
- Apple App Review Guidelines (2.3.7 metadata, keywords, competitor names): https://developer.apple.com/app-store/review/guidelines/
- Google Play metadata policy: https://support.google.com/googleplay/android-developer/answer/9898842
- App Store 30/30/100 field limits and indexing: https://appscreenshotstudio.com/blog/app-store-metadata-for-indie-devs-title-subtitle-keywords-2026 · https://appfollow.io/blog/app-store-optimization-title
- Play keyword indexing (short + full description): https://phiture.com/asostack/google-play-store-keywords-how-to-find/ · https://asomobile.net/en/blog/how-to-optimize-app-metadata-for-google-play/
- Competitor names in metadata (both stores): https://www.apptweak.com/en/aso-blog/how-to-prepare-for-new-google-metadata-policy-changes · https://asodesk.com/blog/13-rules-for-working-with-app-metadata-in-the-app-store-and-google-play/
- Incumbent listings used for the archetype map: https://play.google.com/store/apps/details?id=com.mandir · https://apps.apple.com/in/app/utsav-puja-mandir-gyan/id6739375483 · https://play.google.com/store/apps/details?id=com.drikp.core · https://play.google.com/store/apps/details?id=com.ojassoft.astrosage · https://play.google.com/store/apps/details?id=com.vlv.aravali.bhakti · https://techcrunch.com/2025/06/30/sri-mandir-keeps-investors-hooked-as-digital-devotion-grows
