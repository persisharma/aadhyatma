import React, { useEffect, useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";

// Showcase sections merged in from the single-file reference prototype:
// real story, comic, temple and share art (resized copies in public/assets),
// with copy taken from the app's own content files on main.

const stories = [
  ["krishna-janma", "The Birth of Krishna", "कृष्ण की जन्म-कथा"],
  ["hanuman-sun", "Hanuman and the Sun", "हनुमान और सूर्य"],
  ["ganesha-birth", "The Birth of Ganesha", "गणेश की जन्म-कथा"],
  ["durga-mahishasura", "Durga and Mahishasura", "दुर्गा और महिषासुर"],
  ["kaliya-nag", "Krishna and Kaliya Nag", "कृष्ण और कालिया नाग"],
];

export function SanskarShowcase({ lang, onInstall }) {
  const t = (en, hi) => (lang === "hi" ? hi : en);
  return (
    <section data-section="sanskar" className="showcase-section sanskar-section" id="sanskar-showcase" aria-labelledby="sanskar-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{t("Sanskar · for children", "संस्कार · बच्चों के लिए")}</p>
          <h2 data-section-view id="sanskar-heading">{t("Stories they’ll ask for again.", "कथाएँ, जो बच्चे फिर माँगें।")}</h2>
        </div>
        <p>{t("Illustrated stories of Krishna, Hanuman, Ganesha and Maa Durga, and the Ramayana as a comic.", "कृष्ण, हनुमान, गणेश और माँ दुर्गा की चित्र-कथाएँ, और रामायण की चित्र-कथा।")}</p>
      </div>
      <ul className="story-rail" aria-label={t("Illustrated stories", "चित्र-कथाएँ")}>
        {stories.map(([id, en, hi]) => (
          <li key={id} className="story-card">
            <img src={`/assets/sanskar/${id}.webp`} alt="" loading="lazy" width="520" height="650" />
            <span className="story-title">{t(en, hi)}</span>
            {lang !== "hi" && <span className="story-sub" lang="hi">{hi}</span>}
          </li>
        ))}
      </ul>
      <div className="comic-feature">
        <div className="comic-fan" aria-hidden="true">
          {[1, 2, 3].map((n) => <img key={n} src={`/assets/sanskar/comic-${n}.webp`} alt="" loading="lazy" />)}
        </div>
        <div>
          <p className="eyebrow">{t("Ramayana comic", "रामायण चित्र-कथा")}</p>
          <h3>{t("Bālakāṇḍa, panel by panel.", "बालकांड, एक-एक चित्र में।")}</h3>
          <p>{t("An illustrated reader in Hindi and English, so the youngest in the house can follow Rama’s childhood.", "हिन्दी और अंग्रेज़ी में चित्र-कथा, ताकि घर का सबसे छोटा भी राम का बचपन पढ़ सके।")}</p>
          <button className="button" data-track="install-sanskar" onClick={() => onInstall("sanskar")}>
            {t("Read the stories in the app", "कथाएँ ऐप में पढ़ें")}
            <ArrowUpRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
}

// First sentence of each temple's significance, verbatim from
// mobile/src/data/theerth/details/{legacy,regional}.ts on main.
const temples = [
  ["khatu-shyam", "Khatu Shyam Ji", "खाटू श्याम जी", "Rajasthan", "राजस्थान",
    "At Khatu in Sikar district, Khatu Shyam Ji is Rajasthan’s busiest lokdevta shrine, where Shyam Baba is revered as Krishna himself in the Kali Yuga and called “haare ka sahara”, refuge of the defeated.",
    "सीकर ज़िले के खाटू में स्थित खाटू श्याम जी राजस्थान का सबसे व्यस्त लोकदेव तीर्थ है, जहाँ श्याम बाबा को कलियुग में कृष्ण का ही स्वरूप और “हारे का सहारा” माना जाता है।"],
  ["salasar-balaji", "Salasar Balaji", "सालासर बालाजी", "Rajasthan", "राजस्थान",
    "Salasar Dham in Churu district is revered as a siddha-peeth of Hanuman devotion.",
    "चूरू ज़िले का सालासर धाम हनुमान-भक्ति का सिद्धपीठ माना जाता है।"],
  ["karni-mata", "Karni Mata, Deshnoke", "करणी माता, देशनोक", "Rajasthan", "राजस्थान",
    "Karni Mata Temple at Deshnoke near Bikaner is the seat of the kuldevi of the royal houses of Bikaner and Jodhpur, and is known across the world for the thousands of sacred rats, the kabas, that live freely in its precinct.",
    "बीकानेर के पास देशनोक का करणी माता मंदिर बीकानेर और जोधपुर के राजघरानों की कुलदेवी का धाम है और काबा कहलाने वाले हज़ारों पवित्र चूहों की अनोखी परम्परा के लिए विश्वभर में जाना जाता है।"],
  ["khandoba-jejuri", "Khandoba, Jejuri", "खंडोबा, जेजुरी", "Maharashtra", "महाराष्ट्र",
    "Set on a hill above the Karha river in Purandar taluka of Pune district, the Khandoba temple of Jejuri is the foremost lokdevta shrine of Maharashtra.",
    "पुणे ज़िले के पुरंदर तालुका में कऱ्हा नदी के ऊपर पहाड़ी पर बसा जेजुरी का खंडोबा मंदिर महाराष्ट्र का सबसे बड़ा लोकदेव तीर्थ है।"],
];

export function TheerthShowcase({ lang, onInstall }) {
  const t = (en, hi) => (lang === "hi" ? hi : en);
  return (
    <section data-section="theerth" className="showcase-section theerth-section" id="theerth-showcase" aria-labelledby="theerth-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{t("Theerth", "तीर्थ")}</p>
          <h2 data-section-view id="theerth-heading">{t("Every temple has a story.", "हर मंदिर की एक कथा है।")}</h2>
        </div>
        <p>{t("How each was founded, its deity, its fair, and the journey there.", "स्थापना, स्वरूप, मेला और यात्रा — हर तीर्थ की पूरी कथा।")}</p>
      </div>
      <ul className="temple-grid">
        {temples.map(([id, en, hi, stEn, stHi, dEn, dHi]) => (
          <li key={id} className="temple-card" tabIndex={0}>
            <img src={`/assets/theerth/${id}.webp`} alt="" loading="lazy" width="560" height="747" />
            <div className="temple-cap">
              <strong>{t(en, hi)}</strong>
              <span>{t(stEn, stHi)}</span>
            </div>
            <p className="temple-story">{t(dEn, dHi)}</p>
          </li>
        ))}
      </ul>
      <button className="text-button" data-track="install-theerth" onClick={() => onInstall("theerth")}>
        {t("Read every temple’s katha in the app", "हर तीर्थ की कथा ऐप में पढ़ें")}
        <ArrowUpRight size={15} />
      </button>
    </section>
  );
}

const verses = [
  ["Gita 2.47", "गीता २.४७", "krishna",
    "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
    "You have a right to your actions alone, never to their fruits.", "Bhagavad Gita 2.47"],
  ["Ramcharitmanas", "रामचरितमानस", "rama-darbar",
    "मंगल भवन अमंगल हारी।\nद्रवउ सो दसरथ अजिर बिहारी॥",
    "May He who is the home of all good and the remover of all ill look on me with grace.", "Ramcharitmanas · Balkand"],
  ["Hanuman Chalisa", "हनुमान चालीसा", "ram-hanuman",
    "श्रीगुरु चरन सरोज रज, निज मनु मुकुरु सुधारि।\nबरनउँ रघुबर बिमल जसु, जो दायकु फल चारि॥",
    "Cleansing the mirror of my mind with the dust of my guru’s lotus feet, I sing the pure glory of Raghuvar.", "Hanuman Chalisa · Doha"],
];

export function ShareMaker({ lang, onInstall }) {
  const t = (en, hi) => (lang === "hi" ? hi : en);
  const [v, setV] = useState(0);
  const [story, setStory] = useState(false);
  const [, , bg, text, meaning, src] = verses[v];
  return (
    <section data-section="share" className="showcase-section share-section" id="share-maker" aria-labelledby="share-heading">
      <div className="share-copy">
        <p className="eyebrow">{t("Share", "भेजिए")}</p>
        <h2 data-section-view id="share-heading">{t("Send a verse to someone you love.", "किसी अपने को एक श्लोक भेजिए।")}</h2>
        <p>{t("Any verse, muhurat or match becomes a card for WhatsApp or Instagram. Pick one:", "कोई भी श्लोक, मुहूर्त या मिलान WhatsApp या Instagram के लिए कार्ड बन जाता है। चुनिए:")}</p>
        <div className="chip-row" role="group" aria-label={t("Verse", "श्लोक")}>
          {verses.map(([en, hi], i) => (
            <button key={en} aria-pressed={v === i} onClick={() => setV(i)}>{t(en, hi)}</button>
          ))}
        </div>
        <div className="chip-row" role="group" aria-label={t("Format", "आकार")}>
          <button aria-pressed={!story} onClick={() => setStory(false)}>{t("4:5 post", "4:5 पोस्ट")}</button>
          <button aria-pressed={story} onClick={() => setStory(true)}>{t("9:16 story", "9:16 स्टोरी")}</button>
        </div>
        <button className="button" data-track="install-share" onClick={() => onInstall("share")}>
          {t("Make your own card in the app", "अपना कार्ड ऐप में बनाएँ")}
          <ArrowUpRight size={17} />
        </button>
      </div>
      <div className="share-stage">
        <figure className={`share-card${story ? " story" : ""}`} style={{ backgroundImage: `url(/assets/share/${bg}.webp)` }}>
          <p className="share-verse" lang="sa">{text}</p>
          {lang !== "hi" && <p className="share-meaning">{meaning}</p>}
          <figcaption>{src}</figcaption>
          <span className="share-brand"><img src="/assets/icon.webp" alt="" width="20" height="20" />Vedansh</span>
        </figure>
      </div>
    </section>
  );
}

// Sunrise/sunset (sunrise equation) and the day's choghadiya + Rahu Kaal —
// deterministic from date, place and weekday. Computed only after mount so the
// pre-rendered HTML stays identical across builds. Tithi and nakshatra stay in
// the app, which computes them precisely.
const D2R = Math.PI / 180;
const norm = (x) => ((x % 360) + 360) % 360;
function sunTimes(y, m, d, lat, lon) {
  const n = Math.round(Date.UTC(y, m, d, 12) / 864e5 + 2440587.5 - 2451545);
  const js = n - lon / 360, M = norm(357.5291 + 0.98560028 * js), Mr = M * D2R;
  const C = 1.9148 * Math.sin(Mr) + 0.02 * Math.sin(2 * Mr) + 0.0003 * Math.sin(3 * Mr);
  const lam = norm(M + C + 282.9372) * D2R;
  const jt = 2451545 + js + 0.0053 * Math.sin(Mr) - 0.0069 * Math.sin(2 * lam);
  const dec = Math.asin(Math.sin(lam) * Math.sin(23.4397 * D2R));
  const w = Math.acos((Math.sin(-0.833 * D2R) - Math.sin(lat * D2R) * Math.sin(dec)) / (Math.cos(lat * D2R) * Math.cos(dec))) / D2R;
  return { rise: (jt - w / 360 - 2440587.5) * 864e5, set: (jt + w / 360 - 2440587.5) * 864e5 };
}
const IST = 5.5 * 36e5;
const ist = (ms) => { const d = new Date(ms + IST); return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), wd: d.getUTCDay() }; };
const hm = (ms) => { const d = new Date(ms + IST); const h = d.getUTCHours(); return `${h % 12 || 12}:${String(d.getUTCMinutes()).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };
const CYCLE = ["udveg", "char", "labh", "amrit", "kaal", "shubh", "rog"];
const DAY_START = ["udveg", "amrit", "rog", "labh", "shubh", "char", "kaal"];
const RAHU_PART = [8, 2, 7, 5, 6, 4, 3];
const CG = { udveg: ["Udveg", "उद्वेग", "avoid"], char: ["Char", "चर", "neutral"], labh: ["Labh", "लाभ", "good"], amrit: ["Amrit", "अमृत", "good"], kaal: ["Kaal", "काल", "avoid"], shubh: ["Shubh", "शुभ", "good"], rog: ["Rog", "रोग", "avoid"] };
const cities = [["Ujjain", "उज्जैन", 23.1765, 75.7885], ["Delhi", "दिल्ली", 28.6139, 77.209], ["Mumbai", "मुंबई", 19.076, 72.8777], ["Varanasi", "वाराणसी", 25.3176, 82.9739], ["Bengaluru", "बेंगलुरु", 12.9716, 77.5946], ["Kolkata", "कोलकाता", 22.5726, 88.3639], ["Ahmedabad", "अहमदाबाद", 23.0225, 72.5714]];

export function TodayCard({ lang, onInstall }) {
  const t = (en, hi) => (lang === "hi" ? hi : en);
  const [city, setCity] = useState(0);
  const [now, setNow] = useState(null);
  useEffect(() => { setNow(Date.now()); const id = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(id); }, []);
  let day = null;
  if (now) {
    const [, , lat, lon] = cities[city], p = ist(now), s = sunTimes(p.y, p.m, p.d, lat, lon), len = (s.set - s.rise) / 8;
    const start = CYCLE.indexOf(DAY_START[p.wd]);
    const parts = Array.from({ length: 8 }, (_, i) => ({ key: CYCLE[(start + i) % 7], at: s.rise + i * len, rahu: RAHU_PART[p.wd] === i + 1 }));
    day = { s, parts, cur: now >= s.rise && now < s.set ? Math.floor((now - s.rise) / len) : -1 };
  }
  return (
    <section data-section="today" className="showcase-section today-section" id="today-panchang" aria-labelledby="today-heading">
      <div className="today-head">
        <div>
          <p className="eyebrow">{t("Today, for your city", "आज, आपके शहर के लिए")}</p>
          <h2 data-section-view id="today-heading">{t("Today’s timings, for your city.", "आज का समय, आपके शहर के लिए।")}</h2>
        </div>
        <label className="city-pick">
          <span>{t("City", "शहर")}</span>
          <select value={city} onChange={(e) => setCity(+e.target.value)}>
            {cities.map(([en, hi], i) => <option key={en} value={i}>{t(en, hi)}</option>)}
          </select>
        </label>
      </div>
      <div className="today-stats" aria-live="polite">
        <div><small>{t("Sunrise", "सूर्योदय")}</small><b>{day ? hm(day.s.rise) : "—"}</b></div>
        <div><small>{t("Sunset", "सूर्यास्त")}</small><b>{day ? hm(day.s.set) : "—"}</b></div>
        <div><small>{t("Choghadiya now", "अभी चौघड़िया")}</small><b>{day && day.cur >= 0 ? t(CG[day.parts[day.cur].key][0], CG[day.parts[day.cur].key][1]) : t("After sunset", "सूर्यास्त के बाद")}</b></div>
        <div><small>{t("Rahu Kaal", "राहु काल")}</small><b>{day ? (() => { const r = day.parts.find((x) => x.rahu); return `${hm(r.at)}`; })() : "—"}</b></div>
      </div>
      <ol className="cg-strip">
        {(day ? day.parts : Array.from({ length: 8 }, () => null)).map((x, i) => (
          <li key={i} data-rahu={t("Rahu", "राहु")} className={x ? `${CG[x.key][2]}${day.cur === i ? " now" : ""}${x.rahu ? " rahu" : ""}` : ""}>
            <b>{x ? t(CG[x.key][0], CG[x.key][1]) : "·"}</b>
            <span>{x ? hm(x.at) : ""}</span>
          </li>
        ))}
      </ol>
      <p className="today-note">
        {t("Day choghadiya in IST, approximate to a minute or two. Tithi, nakshatra, yoga, karana and the full Panchang are in the app.", "दिन का चौघड़िया IST में, एक-दो मिनट के अंतर तक। तिथि, नक्षत्र, योग, करण और पूरा पंचांग ऐप में।")}{" "}
        <button className="text-button" data-track="install-today" onClick={() => onInstall("today")}>
          {t("Open today’s Panchang", "आज का पंचांग खोलें")}<ArrowUpRight size={14} />
        </button>
      </p>
    </section>
  );
}
