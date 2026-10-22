import React from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  BookOpen,
  CaretRight,
} from "@phosphor-icons/react";
import { groups, sectionDetails } from "./catalog.js";

const scenes = {
  library: {
    image: "reader",
    feature: "gita",
    title: [
      "Read with meaning. Return with understanding.",
      "अर्थ के साथ पढ़ें। समझ के साथ फिर जुड़ें।",
    ],
    description: [
      "Sanskrit verses, a language you feel at home in, and space to read at your own pace.",
      "संस्कृत श्लोक, अपनी सहज भाषा में अर्थ और अपनी गति से पढ़ने का समय।",
    ],
    action: ["Try three Gita verses", "गीता के तीन श्लोक आज़माएँ"],
  },
  stories: {
    image: "kids",
    feature: "kids-stories",
    title: [
      "A story to share. A tradition to carry.",
      "साझा करने को कथा। साथ रखने को परम्परा।",
    ],
    description: [
      "Illustrated stories and the Ramayana comic invite younger readers into a world of devotion.",
      "चित्र कथाएँ और रामायण कॉमिक छोटे पाठकों को भक्ति की दुनिया से जोड़ते हैं।",
    ],
    action: ["Explore Sanskar stories", "संस्कार कथाएँ देखें"],
  },
  practice: {
    image: "sadhana",
    feature: "japa",
    title: [
      "A little practice, made part of your day.",
      "थोड़ी साधना, हर दिन का हिस्सा।",
    ],
    description: [
      "Bring your readings, japa and Sankalp together. Begin with a small moment and return tomorrow.",
      "पाठ, जप और संकल्प एक साथ रखें। कुछ पल से शुरुआत करें और अगले दिन फिर जुड़ें।",
    ],
    action: ["Try an 11-count japa", "११ जप आज़माएँ"],
  },
  panchang: {
    image: "panchang",
    feature: "panchang",
    title: [
      "Know the day, wherever you are.",
      "जहाँ भी हों, दिन का विधान जानें।",
    ],
    description: [
      "A Panchang for your chosen city, a calendar to plan with, and Muhurat windows with explanations.",
      "चुने हुए नगर का पंचांग, योजना के लिए मास-कैलेंडर और कारण सहित मुहूर्त।",
    ],
    action: ["See the Panchang offering", "पंचांग की सुविधा जानें"],
  },
  puja: {
    image: "vrat",
    feature: "vidhi",
    title: [
      "Tradition, one thoughtful step at a time.",
      "परम्परा, एक-एक चरण के साथ।",
    ],
    description: [
      "Learn the stories behind the fasts you keep. Prepare for puja with samagri and a guide by your side.",
      "अपने व्रत की कथा जानें। सामग्री और साथ चलती विधि के साथ पूजा की तैयारी करें।",
    ],
    action: ["Explore vrat & puja", "व्रत और पूजा जानें"],
  },
  explore: {
    image: "theerth",
    feature: "theerth",
    title: [
      "A sacred place. A story behind every journey.",
      "एक तीर्थ। हर यात्रा के पीछे एक कथा।",
    ],
    description: [
      "Travel through India’s sacred places by state, deity or pilgrimage circuit, with context to deepen the journey.",
      "राज्य, देवता या यात्रा के अनुसार भारत के तीर्थों के बारे में जानें।",
    ],
    action: ["Explore sacred journeys", "तीर्थ यात्रा जानें"],
  },
  jyotish: {
    image: "jyotish",
    feature: "kundali",
    title: [
      "Explore the chart. Understand the context.",
      "कुंडली देखें। उसका सन्दर्भ समझें।",
    ],
    description: [
      "Kundali, Guna Milan, Rashifal and Namkaran, brought together in the app’s Jyotish space.",
      "कुंडली, गुण मिलान, राशिफल और नामकरण, ऐप के ज्योतिष अनुभाग में एक साथ।",
    ],
    action: ["Explore Jyotish", "ज्योतिष जानें"],
  },
  family: {
    image: "share",
    feature: "parampara",
    title: [
      "Keep what matters close to your family.",
      "परिवार के लिए जो अनमोल है, उसे सहेजें।",
    ],
    description: [
      "Remember family tithis, preserve traditions and send a verse to someone you love.",
      "परिवार की तिथियाँ याद रखें, परम्पराएँ सहेजें और अपनों को एक श्लोक भेजें।",
    ],
    action: ["Explore family tools", "पारिवारिक साधन जानें"],
  },
};

export function FeatureExplorer({
  lang,
  active,
  setActive,
  onPreview,
  onInstall,
}) {
  const hi = lang === "hi",
    t = (en, hindi) => (hi ? hindi : en),
    scene = scenes[active];
  return (
    <section
      data-section="experience"
      id="experience"
      className="feature-explorer"
      aria-labelledby="experience-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            {t("Step inside the app", "ऐप को करीब से जानें")}
          </p>
          <h2 data-section-view id="experience-title">
            {t("Many paths. One companion.", "अनेक मार्ग। एक साथी।")}
          </h2>
        </div>
      </div>
      <div className="showcase-layout">
        <div
          className="showcase-tabs"
          role="tablist"
          aria-label={t("Explore app experiences", "ऐप के अनुभव जानें")}
        >
          {groups.slice(1).map(([id, en, hindi], i) => (
            <button
              data-track={`tab-${id}`}
              key={id}
              id={`showcase-tab-${id}`}
              role="tab"
              aria-selected={active === id}
              aria-controls="showcase-panel"
              tabIndex={active === id ? 0 : -1}
              onClick={() => setActive(id)}
              onKeyDown={(e) => {
                if (
                  [
                    "ArrowRight",
                    "ArrowDown",
                    "ArrowLeft",
                    "ArrowUp",
                    "Home",
                    "End",
                  ].includes(e.key)
                ) {
                  e.preventDefault();
                  const step = ["ArrowRight", "ArrowDown"].includes(e.key)
                    ? 1
                    : -1;
                  const next =
                    e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? groups.length - 2
                        : (i + step + groups.length - 1) % (groups.length - 1);
                  setActive(groups[next + 1][0]);
                  document
                    .getElementById(`showcase-tab-${groups[next + 1][0]}`)
                    ?.focus();
                }
              }}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              {t(en, hindi)}
              <CaretRight size={15} />
            </button>
          ))}
        </div>
        <div
          role="tabpanel"
          id="showcase-panel"
          aria-labelledby={`showcase-tab-${active}`}
          className="showcase-panel"
        >
          <figure className="app-screenshot">
            <img
              key={scene.image}
              src={`/assets/${hi ? "hi/" : ""}app-${scene.image}.webp`}
              alt={t(
                `${groups.find((g) => g[0] === active)[1]} in the Vedansh mobile app`,
                "वेदांश ऐप की वास्तविक स्क्रीन",
              )}
              width="900"
              height="1956"
              loading="lazy"
            />
            <figcaption>
              {t(
                "Actual app screen · illustrative preview",
                "ऐप की वास्तविक स्क्रीन · उदाहरण की झलक",
              )}
            </figcaption>
          </figure>
          <div className="showcase-copy">
            <span className="eyebrow">
              {t("A look inside Vedansh", "वेदांश की एक झलक")}
            </span>
            <h3>{t(...scene.title)}</h3>
            <p className="scene-highlights">{sectionDetails[active].map(([en,hindi]) => t(en,hindi)).join(" · ")}</p>
            <button
              data-track={`install-${active}`} className="button"
              onClick={() => onInstall(`experience-${active}`)}
            >
              {t("Get the free app", "निःशुल्क ऐप पाएँ")}
              <ArrowUpRight size={17} />
            </button>
            <button
              data-track={`preview-${active}`} className="text-button"
              onClick={() => onPreview(scene.feature)}
            >
              {t(...scene.action)}
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
