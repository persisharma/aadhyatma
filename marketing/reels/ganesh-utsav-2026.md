# Ganesh Utsav 2026 — a reel a day, sthapana → visarjan

**Mon 14 Sep → Fri 25 Sep 2026. Twelve days, twelve reels.** One content reel per day, each
anchored to an observance the app actually resolves for that date. Every reel is authored and
buildable today — `content/<slug>.content.mjs`, rendered by `make-content.mjs`.

---

## 1. The dates are the app's, not a guess

Every date below comes from the shipped panchang engine (`resolveObservancesForYear(2026,
'purnimant')`, Ujjain/IST) and the arc solver in `mobile/src/panchang/arcs.ts` — not from an
almanac lookup. Regenerate them any time:

```bash
cd mobile && npm install                 # tsx + deps
TZ=Asia/Kolkata npx tsx -e "
import { resolveObservancesForYear } from './src/panchang/festivalEngine';
const iso=(d)=>d.toISOString().slice(0,10);
resolveObservancesForYear(2026,'purnimant')
  .filter(o=>o.date.getMonth()===8).sort((a,b)=>a.date-b.date)
  .forEach(o=>console.log(iso(o.date), o.rule.id));"
```

**Sthapana — Mon 14 Sep 2026.** **Anant Chaturdashi — Fri 25 Sep 2026.**
Note the span is *twelve civil days, not ten*: a tithi vriddhi sits inside the arc, which is
exactly why the app solves the visarjan date instead of storing it. The solver's other exits:

| Family's choice | Visarjan date |
|---|---|
| डेढ़ दिन (1½) | Tue 15 Sep |
| तीन दिन (3) | Wed 16 Sep |
| पाँच दिन (5) | Fri 18 Sep |
| सात दिन (7) | Sun 20 Sep |
| दस दिन (10) | **Fri 25 Sep** — Anant Chaturdashi |

**This shapes the whole slate.** Most of the audience is *not* on the ten-day arc. Days 2, 3, 5 and
7 are each somebody's visarjan day, so each of those reels is written to work as a farewell reel
for the families leaving that day — not as a mid-utsav filler for the ones staying.

---

## 2. The slate

Every day of the arc landed on a real shipped observance — nothing here is invented to fill a slot.

| # | Date | Anchor (app rule id) | Reel — hook | Slug |
|---|---|---|---|---|
| 1 | **Mon 14 Sep** | `ganesh-chaturthi` · sthapana | आज रात चाँद मत देखिए। | `ganesh-chaturthi-chandra` |
| 2 | Tue 15 Sep | 1½-day visarjan | गणपति कितने दिन? | `ganesh-kitne-din` |
| 3 | Wed 16 Sep | `rishi-panchami` · 3-day visarjan | अनजाने में हुई भूल? | `rishi-panchami-kshama` |
| 4 | Thu 17 Sep | `skanda-sashti` | भाई दौड़ा, गणेश बैठे रहे। | `skanda-sashti-parikrama` |
| 5 | Fri 18 Sep | `kanya-sankranti` · 5-day visarjan | आज गौरी विदा होती हैं। | `ganesh-paanchva-din` |
| 6 | Sat 19 Sep | `durva-ashtami` (+`mahalakshmi-vrat`) | गणेश को घास क्यों? | `durva-ashtami-durva` |
| 7 | Sun 20 Sep | 7-day visarjan | विसर्जन से पहले क्या होता है? | `ganesh-uttar-puja` |
| 8 | Mon 21 Sep | gap day | मोदक ही क्यों? | `modak-kyon` |
| 9 | Tue 22 Sep | `parivartini-ekadashi` | आज विष्णु करवट बदलते हैं। | `parivartini-ekadashi-karvat` |
| 10 | Wed 23 Sep | `dwadashi-vrat-shukla` | तीन पग में तीन लोक। | `vaman-teen-pag` |
| 11 | Thu 24 Sep | `pradosh-vrat-shukla` | संध्या के वे डेढ़ घंटे। | `pradosh-sandhya` |
| 12 | **Fri 25 Sep** | `anant-chaturdashi` · visarjan | विदा का दिन आ गया। | `anant-chaturdashi-visarjan` |

Day 13 is not part of the utsav but is worth queueing: **Sat 26 Sep** is `purnima-vrat` +
`shree-satyanarayan-vrat`, and Pitru Paksha opens straight after. Don't let the account go quiet
on the 26th — the visarjan reel will still be circulating.

---

## 3. Build

```bash
cd marketing/reels
node make-content.mjs ganesh-chaturthi-chandra --lang hi
node make-content.mjs ganesh-chaturthi-chandra --lang hi --music music/bansuri.mp3   # if you have a track
```
→ `out/vedansh-content-<slug>-hi.mp4`. Needs `ffmpeg` + Chrome; no simulator, no Maestro — these
are content reels, not feature reels.

Batch the whole slate ahead of time (rendering is the slow part, posting is not):

```bash
for s in ganesh-chaturthi-chandra ganesh-kitne-din rishi-panchami-kshama skanda-sashti-parikrama \
         ganesh-paanchva-din durva-ashtami-durva ganesh-uttar-puja modak-kyon \
         parivartini-ekadashi-karvat vaman-teen-pag pradosh-sandhya anant-chaturdashi-visarjan; do
  node make-content.mjs "$s" --lang hi || echo "FAILED: $s"
done
```

**Render all twelve before the 14th.** A daily slate that depends on a daily render will break on
the first day something goes wrong, and there is no slack in a festival calendar.

---

## 4. Posting

**Post on the day, 7:00–8:00 AM IST.** This deliberately departs from `instagram/reel-checklist.md`
§1 ("post the evening before"). That rule exists for vrat reels, where the decision to fast is made
the night before. A festival-arc reel is not that: every reel here opens with **आज**, the puja
happens that morning, and a reel that says "आज" landing the previous evening is simply wrong.

Two exceptions, both worth honouring:

- **Day 1 (chandra)** — post by **early evening on the 14th**, before moonrise. The reel's whole
  job is to reach someone *before* they look up. A morning post plus a re-share to Stories at dusk.
- **Day 9 (Parivartini Ekadashi)** — the vrat decision *is* made the night before. Story teaser on
  the evening of the 21st, reel on the morning of the 22nd.

Caption line 1 is the searchable Hindi question (`instagram/posts/caption-templates.md` §A):

| # | Caption line 1 | Hashtags |
|---|---|---|
| 1 | गणेश चतुर्थी पर चाँद क्यों नहीं देखते? — 14 सितंबर, सोमवार 🪔 | #गणेशचतुर्थी #गणपतिबप्पामोरया #व्रतकथा #पंचांग |
| 2 | गणपति कितने दिन बिठाते हैं? — डेढ़, तीन, पाँच, सात या दस | #गणेशउत्सव #गणपति #विसर्जन #परंपरा |
| 3 | ऋषि पंचमी 2026 कब है? — 16 सितंबर, बुधवार | #ऋषिपंचमी #व्रत #व्रतकथा #पंचांग |
| 4 | स्कंद षष्ठी 2026 — 17 सितंबर, गुरुवार | #स्कंदषष्ठी #कार्तिकेय #गणेश #कथा |
| 5 | गौरी विसर्जन कब है? — 18 सितंबर, शुक्रवार | #ज्येष्ठागौरी #गणेशविसर्जन #गणेशउत्सव |
| 6 | दूर्वा अष्टमी 2026 कब है? — 19 सितंबर, शनिवार | #दूर्वाअष्टमी #गणेश #भोग #व्रत |
| 7 | गणेश विसर्जन से पहले उत्तर-पूजा क्या है? | #गणेशविसर्जन #उत्तरपूजा #गणेशउत्सव |
| 8 | गणेश जी को मोदक क्यों चढ़ाते हैं? | #मोदक #गणेश #भोग #गणेशउत्सव |
| 9 | परिवर्तिनी एकादशी 2026 कब है? — 22 सितंबर, मंगलवार | #परिवर्तिनीएकादशी #एकादशी #व्रत #पंचांग |
| 10 | वामन द्वादशी की कथा — तीन पग की भूमि | #वामनअवतार #द्वादशी #कथा #दान |
| 11 | प्रदोष व्रत सितंबर 2026 — 24 सितंबर, गुरुवार | #प्रदोषव्रत #शिव #व्रत #पंचांग |
| 12 | अनंत चतुर्दशी 2026 कब है? — 25 सितंबर, शुक्रवार | #अनंतचतुर्दशी #गणेशविसर्जन #गणपतिबप्पामोरया |

Days 1, 3, 6, 9, 11 and 12 carry a date in line 1 — those are the days people actually search for.
Add the tithi start/end and parana times from the app before posting; the template's `{…}` slots
are there for it.

---

## 5. What these reels must not claim

Checked against shipped content while writing. These are not style notes — they are accuracy limits.

- **The visarjan vidhi does not ship.** `data/vidhi/ganesh-visarjan-uttar-puja.ts` is
  `status: 'draft'`, and the registry resolves a draft id to `null` exactly like an unknown id
  (`data/vidhi/index.ts`). Day 7's reel therefore describes uttar-puja as *household practice* and
  never says "विधि ऐप में देखिए". **Do not caption it as an in-app vidhi.** The sthapana vidhi
  (`ganesh-chaturthi-sthapana`) *is* verified and ships — day 1 and day 2 may point at it.
- **No visarjan mantra is quoted.** The draft vidhi deliberately withholds the customary
  *punaragamanaya cha* formula until it is verbatim-verified (RULEBOOK §11.3). Day 12 uses the
  household refrain "अगले बरस तू जल्दी आ" instead — a folk line, not scripture, and it lands harder.
- **No durva count.** The "twenty-one durva" figure is *not* in the shipped
  `durva-ashtami-vrat-katha`, so day 6 doesn't assert it. It argues the point the katha does make —
  the commonest offering is the dearest.
- **The app has no Vamana entry.** 23 Sep resolves only as the generic `dwadashi-vrat-shukla`.
  Day 10 is complete in the frame; its caption must not promise an in-app katha.
- Everything else is backed: the Syamantaka / mithya-kalank story (day 1) is in
  `ganesha-chaturthi-vrat-katha`, and the fourteen-knot anant sutra (day 12) is verbatim from
  `anant-chaturdashi-vrat-katha`.

---

## 6. If a day slips

Don't post nothing. The content library already carries Ganesha-safe reels that fit any day of the
arc: **`vakratunda`** (why every puja begins with Ganesha) and **`krodh-vinash`**. `japa-108` and
`deepak-jyot` work as neutral fillers. A repost beats a gap — the arc's momentum is the asset.

---

*Dates verified against the shipped engine on 2026-09-07. Content defs live in `content/`; the
pipeline and its gotchas are documented in `README.md`, authoring rules in
`../instagram/reel-checklist.md`.*
