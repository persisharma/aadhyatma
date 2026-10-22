import React, { useEffect, useRef, useState } from "react";
import {
  House,
  BookOpen,
  FlowerLotus,
  CalendarBlank,
  Lamp,
  MapPin,
  Sun,
  MagnifyingGlass,
  ArrowRight,
  ArrowLeft,
  X,
  List,
  DeviceMobile,
  AppleLogo,
  GooglePlayLogo,
  Check,
  UsersThree,
  Bell,
  HandsPraying,
  CaretRight,
  ArrowUpRight,
  ArrowCounterClockwise,
  BookmarkSimple,
  Headphones,
  Heart,
  HandHeart,
  Compass,
  SquaresFour,
} from "@phosphor-icons/react";
import {
  offerings,
  groups,
  faqs,
  storeLinks,
  sectionDetails,
  featureDetails,
} from "./catalog.js";
import content from "./preview-content.json";
import { track } from "./analytics.js";
import { FeatureExplorer } from "./FeatureExplorer.jsx";
import { SanskarShowcase, TheerthShowcase, ShareMaker, TodayCard } from "./Showcase.jsx";
import { VisitCounter } from "./VisitCounter.jsx";
import { MalaPreview } from "./MalaPreview.jsx";
const icons = {
  House,
  BookOpen,
  FlowerLotus,
  CalendarBlank,
  Lamp,
  MapPin,
  Sun,
  MagnifyingGlass,
  UsersThree,
  Bell,
  HandsPraying,
  BookmarkSimple,
  Headphones,
  Heart,
  HandHeart,
  Compass,
  SquaresFour,
  DeviceMobile,
};
const Icon = ({ name, ...props }) => {
  const Component = icons[name] || BookOpen;
  return <Component size={23} weight="light" aria-hidden="true" {...props} />;
};

function LanguageToggle({ lang, setLang }) {
  return (
    <div className="language-toggle" role="group" aria-label="Website language">
      <button
        lang="hi"
        aria-pressed={lang === "hi"}
        data-track="language-hi" onClick={() => setLang("hi")}
      >
        हिन्दी
      </button>
      <button
        lang="en"
        aria-pressed={lang === "en"}
        data-track="language-en" onClick={() => setLang("en")}
      >
        English
      </button>
    </div>
  );
}
function ModalShell({ children, title, close, back, lang, section = "modal" }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current.showModal();
    return () => {
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      data-section={section}
      aria-labelledby="modal-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="modal-top">
        {back ? (
          <button data-track="back" className="text-button back-button" onClick={back}>
            <ArrowLeft size={18} />
            {lang === "hi" ? "वापस" : "Back"}
          </button>
        ) : (
          <span className="eyebrow">
            {lang === "hi" ? "वेदांश की एक झलक" : "A glimpse of Vedansh"}
          </span>
        )}
        <button
          autoFocus
          className="icon-button"
          data-track="close-preview" aria-label={lang === "hi" ? "बन्द करें" : "Close preview"}
          onClick={close}
        >
          <X size={22} />
        </button>
      </div>
      <div className="modal-content">
        <h2 id="modal-title">{title}</h2>
        {children}
      </div>
    </dialog>
  );
}
function StoreButtons({ lang, source }) {
  return (
    <div className="store-buttons">
      <a
        data-track={`store-ios-${source}`} className="store-button"
        href={storeLinks.ios}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("store_click", { platform: "ios", source })}
      >
        <AppleLogo size={30} weight="fill" aria-hidden="true" />
        <span>
          <small>{lang === "hi" ? "iPhone के लिए" : "Download on the"}</small>
          App Store
        </span>
        <ArrowUpRight size={17} />
      </a>
      <a
        data-track={`store-android-${source}`} className="store-button"
        href={storeLinks.android}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("store_click", { platform: "android", source })}
      >
        <GooglePlayLogo size={28} aria-hidden="true" />
        <span>
          <small>{lang === "hi" ? "Android के लिए" : "Get it on"}</small>Google
          Play
        </span>
        <ArrowUpRight size={17} />
      </a>
    </div>
  );
}
function JapaPreview({
  lang,
  count,
  setCount,
  mantra,
  setMantra,
  install,
  compact = false,
}) {
  const hi = lang === "hi";
  const complete = count >= 11;
  return (
    <div className={`japa-preview ${compact ? "compact" : ""}`}>
      <img
        className="japa-art"
        src="/assets/japa.webp"
        width="120"
        height="120"
        alt=""
        loading="lazy"
      />
      <div className="japa-controls">
        <label
          className="sr-only"
          htmlFor={compact ? "home-mantra" : "modal-mantra"}
        >
          {hi ? "मन्त्र चुनें" : "Choose a mantra"}
        </label>
        <select
          data-track="choose-mantra" id={compact ? "home-mantra" : "modal-mantra"}
          value={mantra}
          onChange={(e) => {
            setMantra(Number(e.target.value));
            setCount(0);
          }}
        >
          {content.mantras.map((m, i) => (
            <option key={m.id} value={i}>
              {hi ? m.nameHi : m.nameEn}
            </option>
          ))}
        </select>
        <div className="japa-number" role="status" aria-live="polite">
          <strong>{String(count).padStart(2, "0")}</strong>
          <span>
            {" "}
            / 11 <small>{hi ? "जप की झलक" : "preview"}</small>
          </span>
        </div>
        {!complete ? (
          <button
            data-track="count-chant" className="button small"
            onClick={() => {
              setCount((n) => Math.min(n + 1, 11));
              if (count === 0) track("preview_start", { feature: "japa" });
            }}
          >
            <FlowerLotus size={18} />
            {count
              ? hi
                ? "अगला जप"
                : "Count a chant"
              : hi
                ? "जप आज़माएँ"
                : "Try japa"}
          </button>
        ) : (
          <button
            data-track="continue-japa" className="button small"
            onClick={() => install("japa-complete")}
          >
            {hi ? "ऐप में पूरी माला जपें" : "Continue a full mala in the app"}
            <ArrowRight size={17} />
          </button>
        )}
        {count > 0 && (
          <button
            data-track="reset-japa" className="reset-button"
            aria-label={hi ? "जप फिर शुरू करें" : "Reset japa preview"}
            onClick={() => setCount(0)}
          >
            <ArrowCounterClockwise size={17} />
          </button>
        )}
        {!compact && (
          <p className="small-copy" role="status">
            {complete
              ? hi
                ? "एक छोटा विराम पूरा हुआ। ऐप में १०८ जप, स्मरण और दैनिक साधना साथ रखें।"
                : "A small moment, well kept. Find the 108-bead counter, reminders and daily practice in the app."
              : hi
                ? "हर जप के बाद बटन दबाएँ। यहाँ ११ जप का अनुभव लें।"
                : "Tap once after each chant. Enjoy a short, 11-count preview here."}
          </p>
        )}
      </div>
    </div>
  );
}

export function App({ initialLanguage = "en" }) {
  const [lang, setLanguage] = useState(initialLanguage),
    [group, setGroup] = useState("all"),
    [query, setQueryState] = useState(""),
    [menu, setMenu] = useState(false),
    [modal, setModal] = useState(null),
    [verseIndex, setVerseIndex] = useState(0),
    [count, setCount] = useState(0),
    [mantra, setMantra] = useState(0),
    [readerLang, setReaderLang] = useState(null),
    [experience, setExperience] = useState("library"),
    [textSize, setTextSize] = useState(20),
    [showIast, setShowIast] = useState(false);
  const menuClose = useRef(null),
    menuButton = useRef(null);
  const hi = lang === "hi";
  const t = (en, hindi) => (hi ? hindi : en);
  function setQuery(value) {
    setQueryState(value);
    const url = new URL(window.location.href);
    value ? url.searchParams.set("q", value) : url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  }
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) {
      setQuery(q);
      requestAnimationFrame(() =>
        document.getElementById("offerings")?.scrollIntoView(),
      );
    }
    const onHash = () => {
      const id = window.location.hash.slice(1);
      if (offerings.some((f) => f.id === id)) { setModal({ type: "feature", id }); track("offering_open", { feature: id }); }
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    if (!menu) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuClose.current?.focus();
    const trap = (e) => {
      if (e.key === "Escape") setMenu(false);
      if (e.key === "Tab") {
        const list = [
          ...document.querySelectorAll(".sidebar button, .sidebar a"),
        ].filter((el) => el.offsetParent !== null);
        const first = list[0],
          last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", trap);
      menuButton.current?.focus();
    };
  }, [menu]);
  function setLang(next) {
    setLanguage(next);
    document.documentElement.lang = next;
    const url = new URL(window.location.href);
    url.pathname = next === "hi" ? "/hi/" : "/";
    window.history.replaceState(null, "", url);
    document.title =
      next === "hi"
        ? "वेदांश — गीता, पंचांग और नित्य साधना ऐप"
        : "Vedansh — Bhagavad Gita, Panchang & Daily Devotion App";
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute(
        "href",
        `https://vedansh.app${next === "hi" ? "/hi/" : "/"}`,
      );
  }
  function chooseGroup(id) {
    setGroup(id);
    setExperience(id);
    setQuery("");
    setMenu(false);
    requestAnimationFrame(() =>
      document
        .getElementById("experience")
        ?.scrollIntoView({ behavior: "smooth" }),
    );
  }
  function home() {
    setMenu(false);
    setGroup("all");
    setQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function install(source, origin = null) {
    track("install_prompt", { source });
    setModal({ type: "install", source, origin });
  }
  function openFeature(id) {
    setReaderLang(null);
    setModal({ type: "feature", id });
    track("offering_open", { feature: id });
    if (["gita", "japa", "chalisa"].includes(id)) track("preview_start", { feature: id });
  }
  useEffect(() => {
    if (count === 11) track("preview_complete", { feature: "japa" });
  }, [count]);
  const closeModal = () => setModal(null);
  const filtered = offerings.filter(
    (f) =>
      (group === "all" || f.group === group) &&
      `${f.en} ${f.hi} ${f.description} ${f.descriptionHi}`
        .toLocaleLowerCase()
        .includes(query.trim().toLocaleLowerCase()),
  );
  const feature =
      modal?.type === "feature"
        ? offerings.find((f) => f.id === modal.id)
        : null,
    verse = content.gita[verseIndex],
    meaningLang = readerLang || lang,
    selectedGroup = groups.find((g) => g[0] === group);
  const imageByGroup = {
      panchang: "panchang",
      puja: "vrat",
      explore: "theerth",
      jyotish: "jyotish",
      practice: "sadhana",
      stories: "app-kids",
    },
    japaProps = { lang, count, setCount, mantra, setMantra };
  return (
    <>
      <a className="skip-link" href="#main">
        {t("Skip to content", "मुख्य सामग्री पर जाएँ")}
      </a>
      {menu && (
        <button
          className="menu-scrim"
          aria-label={t("Close navigation", "मेनू बन्द करें")}
          onClick={() => setMenu(false)}
          tabIndex={-1}
        />
      )}
      <aside
        data-section="sidebar"
        id="mobile-navigation"
        className={`sidebar ${menu ? "open" : ""}`}
        aria-label={t("Main navigation", "मुख्य मेनू")}
      >
        <div className="sidebar-brand">
          <a
            href={hi ? "/hi/" : "/"}
            onClick={(e) => {
              e.preventDefault();
              home();
            }}
            className="brand"
          >
            <img src="/assets/icon.webp" width="43" height="43" alt="" />
            <span>Vedansh</span>
          </a>
          <button
            ref={menuClose}
            className="icon-button mobile-only"
            aria-label={t("Close navigation", "मेनू बन्द करें")}
            onClick={() => setMenu(false)}
          >
            <X size={23} />
          </button>
        </div>
        <nav>
          <button
            className={`nav-item ${group === "all" && !query ? "active" : ""}`}
            data-track="home" onClick={home}
          >
            <House size={24} weight="light" />
            {t("Welcome", "स्वागत है")}
          </button>
          {groups.slice(1).map(([id, en, hindi, icon]) => (
            <button
              key={id}
              data-track={`nav-${id}`} className={`nav-item ${group === id ? "active" : ""}`}
              aria-current={group === id ? "true" : undefined}
              onClick={() => chooseGroup(id)}
            >
              <Icon name={icon} />
              <span>{t(en, hindi)}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <LanguageToggle lang={lang} setLang={setLang} />
          <div className="sidebar-download">
            <DeviceMobile size={29} weight="light" />
            <p>
              {t("Your daily companion.", "आपका नित्य साथी।")}
              <small>{t("Carry it with you.", "हमेशा आपके साथ।")}</small>
            </p>
          </div>
          <button
            data-track="install" className="button sidebar-cta"
            onClick={() => {
              setMenu(false);
              install("sidebar");
            }}
          >
            {t("Get the free app", "निःशुल्क ऐप पाएँ")}
            <ArrowUpRight size={18} />
          </button>
          <p className="sidebar-platforms">iPhone & Android</p>
          <VisitCounter lang={lang} className="sidebar-visits" />
        </div>
      </aside>
      <div className="app-shell" inert={menu ? true : undefined}>
        <header className="topbar" data-section="header">
          <button
            ref={menuButton}
            className="icon-button mobile-only"
            data-track="open-menu" aria-label={t("Open navigation", "मेनू खोलें")}
            aria-expanded={menu}
            aria-controls="mobile-navigation"
            onClick={() => setMenu(true)}
          >
            <List size={24} />
          </button>
          <a href="#main" className="brand mobile-brand">
            <img src="/assets/icon.webp" width="30" height="30" alt="" />
            <span>Vedansh</span>
          </a>
          <form
            className="search-form"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              setGroup("all");
              const u = new URL(window.location.href);
              query
                ? u.searchParams.set("q", query)
                : u.searchParams.delete("q");
              window.history.replaceState(null, "", u);
              document
                .getElementById("offerings")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <MagnifyingGlass size={21} weight="light" aria-hidden="true" />
            <input
              aria-label={t("Search app offerings", "ऐप की सुविधाएँ खोजें")}
              placeholder={t(
                "Find a text, mantra, or practice…",
                "पाठ, मन्त्र या साधना खोजें…",
              )}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setGroup("all");
              }}
            />
            {query && (
              <button
                type="button"
                className="icon-button"
                data-track="clear-search" aria-label={t("Clear search", "खोज मिटाएँ")}
                onClick={() => setQuery("")}
              >
                <X size={16} />
              </button>
            )}
          </form>
          <div className="topbar-lang mobile-only">
            <LanguageToggle lang={lang} setLang={setLang} />
          </div>
          <button className="topbar-install" data-track="install" onClick={() => install("header")}>
            {t("Get the app", "ऐप पाएँ")}
            <ArrowUpRight size={17} />
          </button>
        </header>
        <main id="main">
          <section data-section="hero" className="hero" aria-labelledby="hero-title">
            <img
              className="hero-art"
              src="/assets/hero-krishna-arjuna.webp"
              alt="Sepia manuscript illustration of Krishna revealing his universal form to Arjuna"
              width="1315"
              height="1196"
              fetchPriority="high"
            />
            <div className="hero-copy">
              <p className="eyebrow">
                {t(
                  "Ancient wisdom. Everyday devotion.",
                  "प्राचीन ज्ञान। नित्य भक्ति।",
                )}
              </p>
              <h1 data-section-view id="hero-title">
                <span className="hero-brand">{t("Vedansh App", "वेदांश ऐप")}</span>
                {t("Make space", "जीवन में भक्ति")}
                <br />
                {t("for the sacred.", "के लिए स्थान बनाएँ।")}
              </h1>
              <p className="hero-lede">
                {t("Gita, japa, Panchang & puja. Your daily devotion, in one free app.", "गीता, जप, पंचांग और पूजा। नित्य भक्ति, एक निःशुल्क ऐप में।")}
              </p>
              <div className="hero-actions">
                <button className="button" data-track="install" onClick={() => install("hero")}>
                  <DeviceMobile size={21} />
                  {t("Get Vedansh — free", "वेदांश पाएँ — निःशुल्क")}
                  <ArrowRight size={19} />
                </button>
                <button
                  className="text-button"
                  data-track="preview-gita" onClick={() => openFeature("gita")}
                >
                  {t("Preview the Gita", "गीता की झलक देखें")}
                  <ArrowRight size={18} />
                </button>
              </div>
              <div className="trust-line">
                <span>
                  <Check size={14} />
                  {t("Free app", "निःशुल्क ऐप")}
                </span>
                <span>
                  <Check size={14} />
                  {t("No ads", "विज्ञापन रहित")}
                </span>
                <span>
                  <Check size={14} />
                  {t("No account needed", "खाता आवश्यक नहीं")}
                </span>
              </div>
            </div>
          </section>
          <section
            data-section="daily" className="daily-section"
            aria-label={t("Try a little of Vedansh", "वेदांश का छोटा अनुभव")}
          >
            <div className="daily-practice">
              <p className="eyebrow">
                {t("A moment, just for you", "कुछ पल, केवल आपके लिए")}
              </p>
              <h2 data-section-view>{t("Begin with a little japa", "कुछ जप से शुरुआत करें")}</h2>

              <JapaPreview
                {...japaProps}
                compact
                install={(source) => install(source)}
              />
              <a data-track="open-mala" className="text-button open-mala" href="#mala">
                {t("Open mala view", "माला की झलक खोलें")}
                <ArrowRight size={16} />
              </a>
            </div>
            <div className="daily-explore">
              <p className="eyebrow">
                {t("Discover your daily companion", "अपने नित्य साथी को जानें")}
              </p>
              <h2>{t("More meaning in every day", "हर दिन, भक्ति के साथ")}</h2>

              {[
                [
                  "panchang",
                  "CalendarBlank",
                  t("Panchang & Muhurat", "पंचांग और मुहूर्त"),
                  t(
                    "Understand the day, for your city.",
                    "अपने नगर के लिए दिन का विधान जानें।",
                  ),
                ],
                [
                  "vidhi",
                  "Lamp",
                  t("Vrat & guided pujas", "व्रत और पूजा विधि"),
                  t(
                    "Stories, preparation, and every step.",
                    "कथाएँ, तैयारी और हर चरण।",
                  ),
                ],
              ].map(([id, icon, title, desc]) => (
                <button
                  key={id}
                  data-track={`preview-${id}`} className="explore-row"
                  onClick={() => openFeature(id)}
                >
                  <span className="icon-medallion">
                    <Icon name={icon} size={26} />
                  </span>
                  <span>
                    <strong>{title}</strong>
                    <small>{desc}</small>
                  </span>
                  <CaretRight size={18} />
                </button>
              ))}
            </div>
          </section>
          <FeatureExplorer
            lang={lang}
            active={experience}
            setActive={setExperience}
            onPreview={openFeature}
            onInstall={install}
          />
          <section
            data-section="mala" className="mala-section"
            id="mala"
            aria-labelledby="mala-heading"
          >
            <div className="mala-intro">
              <p className="eyebrow">
                {t(
                  "One chant. One moment of presence.",
                  "एक जप। एक पल एकाग्रता का।",
                )}
              </p>
              <h2 data-section-view id="mala-heading">
                {t("A mala that moves", "एक माला, जो आपके")}
                <br />
                <em>{t("with you.", "साथ चले।")}</em>
              </h2>
              <p>{t("11 chants here. Your full 108-bead practice in the app.", "यहाँ ११ जप। पूरे १०८ जप की साधना ऐप में।")}</p>
              <button
                className="button"
                data-track="install" onClick={() => install("mala-section")}
              >
                {t("Keep your practice in the app", "अपनी साधना ऐप में रखें")}
                <ArrowUpRight size={17} />
              </button>
            </div>
            <MalaPreview
              lang={lang}
              count={count}
              setCount={setCount}
              mantra={mantra}
              setMantra={setMantra}
              onInstall={() => install("mala-complete")}
            />
          </section>
          <TodayCard lang={lang} onInstall={install} />
          <SanskarShowcase lang={lang} onInstall={install} />
          <TheerthShowcase lang={lang} onInstall={install} />
          <ShareMaker lang={lang} onInstall={install} />
          <section
            id="offerings"
            data-section="catalog"
            className="offerings-section"
            aria-labelledby="offerings-title"
          >
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  {t(
                    "One app. Many ways to connect.",
                    "एक ऐप। भक्ति के अनेक मार्ग।",
                  )}
                </p>
                <h2 data-section-view id="offerings-title">
                  {t("Explore the app", "ऐप की सुविधाएँ जानें")}
                </h2>
              </div>
            </div>
            <div
              className="category-filters"
              role="group"
              aria-label={t("Filter offerings", "सुविधाएँ चुनें")}
            >
              {groups.map(([id, en, hindi]) => (
                <button
                  key={id}
                  data-track={`filter-${id}`} aria-pressed={group === id}
                  className={group === id ? "selected" : ""}
                  onClick={() => {
                    setGroup(id);
                    setQuery("");
                  }}
                >
                  {t(en, hindi)}
                </button>
              ))}
            </div>
            {(query || group !== "all") && (
              <div className="results-summary" role="status">
                {filtered.length} {t("offerings", "सुविधाएँ")}
                {query
                  ? ` · “${query}”`
                  : ` · ${t(selectedGroup[1], selectedGroup[2])}`}
                <button
                  className="text-button"
                  onClick={() => {
                    setGroup("all");
                    setQuery("");
                  }}
                >
                  {t("Show all", "सभी देखें")}
                  <X size={14} />
                </button>
              </div>
            )}
            <div className="catalog-groups">
              {groups.slice(1).map(([id, en, hindi, icon]) => {
                const items = filtered.filter(f => f.group === id);
                if (!items.length) return null;
                return <details key={`${id}-${group}-${Boolean(query)}`} className="catalog-group" open={group !== "all" || Boolean(query)}>
                  <summary data-track={`catalog-${id}`}>
                    <Icon name={icon} size={24}/>
                    <span>{t(en,hindi)}</span>
                    <small>{items.length}</small><CaretRight size={18}/>
                  </summary>
                  <div className="offering-list">
                    {items.map(f => <article className="offering" key={f.id} id={f.id}>
                      <div>
                        <h3><a data-track={`offering-${f.id}`} href={`#${f.id}`} onClick={e => {e.preventDefault();openFeature(f.id);}}>
                          {t(f.en,f.hi)}<ArrowUpRight size={16}/>
                        </a></h3>
                        <p>{t(f.description,f.descriptionHi)}</p>
                        {f.preview && <span className="preview-badge">{t("Try a preview", "झलक आज़माएँ")}</span>}
                      </div>
                    </article>)}
                  </div>
                </details>;
              })}
            </div>
            {filtered.length === 0 && (
              <div className="empty-state">
                <MagnifyingGlass size={35} weight="light" />
                <h3>
                  {t("A different word might help", "कोई दूसरा शब्द आज़माएँ")}
                </h3>
                <p>
                  {t(
                    "Try “Gita”, “japa”, “puja”, “Kundali” or browse all offerings.",
                    "“गीता”, “जप”, “पूजा”, “कुंडली” खोजें या सभी सुविधाएँ देखें।",
                  )}
                </p>
                <button
                  className="button"
                  onClick={() => {
                    setQuery("");
                    setGroup("all");
                  }}
                >
                  {t("Explore all offerings", "सभी सुविधाएँ देखें")}
                </button>
              </div>
            )}
          </section>
          <section data-section="page-install" className="app-invitation" aria-labelledby="install-heading">
            <img
              src="/assets/icon.webp"
              width="76"
              height="76"
              alt="Vedansh app icon"
              loading="lazy"
            />
            <p className="eyebrow">
              {t(
                "Let a small moment become a daily practice",
                "एक छोटा पल, नित्य साधना बन जाए",
              )}
            </p>
            <h2 data-section-view id="install-heading">
              {t("Keep the sacred close.", "भक्ति को अपने पास रखें।")}
            </h2>
            <p>
              {t(
                "Your complete devotional library. Always with you.",
                "आपके भक्ति ग्रन्थ। सदैव आपके साथ।",
              )}
            </p>
            <StoreButtons lang={lang} source="page-install" />
            <p className="install-trust">
              {t(
                "Free on iPhone & Android · No ads · No account required",
                "iPhone और Android पर निःशुल्क · विज्ञापन रहित · खाता आवश्यक नहीं",
              )}
            </p>
          </section>
          <section
            id="questions"
            data-section="faq"
            className="faq-section"
            aria-labelledby="faq-title"
          >
            <p className="eyebrow">
              {t("A few things you might wonder", "कुछ सामान्य प्रश्न")}
            </p>
            <h2 data-section-view id="faq-title">{t("Before you begin", "शुरू करने से पहले")}</h2>
            <div className="faq-list">
              {faqs.map(([q, a, qHi, aHi]) => (
                <details key={q}>
                  <summary data-track={`faq-${faqs.findIndex(f => f[0] === q) + 1}`}>
                    {t(q, qHi)}
                    <CaretRight size={19} />
                  </summary>
                  <p>{t(a, aHi)}</p>
                </details>
              ))}
            </div>
          </section>
          <footer data-section="footer" className="footer">
            <a href="#main" className="brand">
              <img src="/assets/icon.webp" width="30" height="30" alt="" />
              <span>Vedansh</span>
            </a>
            <p>
              {t(
                "Ancient wisdom. Always with you.",
                "प्राचीन ज्ञान। सदैव आपके साथ।",
              )}
            </p>
            <VisitCounter lang={lang} className="footer-visits" />
            <div>
              <a
                data-track="privacy" href="https://vedansh.app/privacy/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("Privacy", "गोपनीयता")}
              </a>
              <a
                data-track="terms" href="https://vedansh.app/terms/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("Terms", "शर्तें")}
              </a>
              <a
                data-track="support" href="https://vedansh.app/support/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("Support", "सहायता")}
              </a>
            </div>
          </footer>
        </main>
        <div data-section="mobile-sticky" className="mobile-install-bar">
          <img src="/assets/icon.webp" width="40" height="40" alt="" />
          <div>
            <strong>Vedansh</strong>
            <small>{t("Free · No ads", "निःशुल्क · विज्ञापन रहित")}</small>
          </div>
          <a
            data-track="install" className="button small"
            href="https://vedansh.app/get/?utm_source=website&utm_medium=sticky&utm_campaign=interactive_preview"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              track("smart_download_click", { source: "mobile-sticky" })
            }
          >
            {t("Get the app", "ऐप पाएँ")}
            <ArrowUpRight size={17} />
          </a>
        </div>
      </div>
      {modal?.type === "install" && (
        <ModalShell
          section="install-dialog"
          lang={lang}
          title={t(
            "Keep this moment with you.",
            "भक्ति के इन पलों को साथ रखें।",
          )}
          close={closeModal}
          back={modal.origin ? () => setModal(modal.origin) : null}
        >
          <div className="install-modal">
            <img
              className="install-icon"
              src="/assets/icon.webp"
              width="72"
              height="72"
              alt="Vedansh"
            />
            <p className="modal-lede">
              {t(
                "Your complete practice, in one free app.",
                "आपकी पूरी साधना, एक निःशुल्क ऐप में।",
              )}
            </p>
            <ul className="benefit-list">
              {[
                t(
                  "Sacred texts & meanings",
                  "पवित्र पाठ और अर्थ",
                ),
                t(
                  "Japa & daily reminders",
                  "जप और नित्य स्मरण",
                ),
                t(
                  "Panchang, puja guides & Jyotish tools",
                  "पंचांग, पूजा विधि और ज्योतिष साधन",
                ),
              ].map((s) => (
                <li key={s}>
                  <Check size={18} />
                  {s}
                </li>
              ))}
            </ul>
            <StoreButtons lang={lang} source={modal.source} />
            <p className="install-trust">
              {t(
                "No ads. No account. Just you and your practice.",
                "न विज्ञापन, न खाते की आवश्यकता। केवल आप और आपकी साधना।",
              )}
            </p>
            <div className="qr-block">
              <img
                src="/assets/get-qr.svg"
                alt="QR code linking to vedansh.app/get to download Vedansh"
                width="100"
                height="100"
              />
              <p>
                <strong>{t("On your computer?", "कम्प्यूटर पर हैं?")}</strong>
                {t(
                  "Scan with your phone to get the app.",
                  "ऐप पाने के लिए अपने फ़ोन से स्कैन करें।",
                )}
                <a
                  data-track="download-link" href="https://vedansh.app/get/?utm_source=website&utm_medium=install-dialog"
                  onClick={() => track("smart_download_click", { source: modal.source, platform: "smart" })}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  vedansh.app/get <ArrowUpRight size={13} />
                </a>
              </p>
            </div>
          </div>
        </ModalShell>
      )}
      {feature && (
        <ModalShell
          key="feature"
          section={`preview-${feature.id}`}
          lang={lang}
          title={t(feature.en, feature.hi)}
          close={closeModal}
        >
          <p className="modal-lede">
            {t(feature.description, feature.descriptionHi)}
          </p>
          {feature.preview === "reader" ? (
            <>
              <div className="reader-meta">
                <span>
                  {t("Selected verse", "चुना हुआ श्लोक")} · 2.{verse.number}
                </span>
                <span>
                  {verseIndex + 1} / 3 {t("preview", "झलक")}
                </span>
              </div>
              <img
                className="reader-art"
                src="/assets/gita.webp"
                alt="Krishna and Arjuna manuscript illustration"
                width="1054"
                height="1492"
              />
              <div className="reader-settings">
                <label>
                  {t("Verse text size", "श्लोक का आकार")}
                  <input
                    data-track="text-size" type="range"
                    min="16"
                    max="28"
                    value={textSize}
                    aria-label={t("Verse text size", "श्लोक का आकार")}
                    onChange={(e) => setTextSize(Number(e.target.value))}
                  />
                </label>
                <button
                  className={showIast ? "selected" : ""}
                  data-track="transliteration" aria-pressed={showIast}
                  onClick={() => setShowIast(!showIast)}
                >
                  {t("Transliteration", "लिप्यन्तरण")}
                </button>
              </div>
              <div
                className="reader-verse"
                lang="sa"
                style={{ fontSize: textSize }}
              >
                {verse.sanskrit.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              {showIast && (
                <div className="reader-iast" lang="sa-Latn">
                  {verse.transliteration.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              )}
              <div
                className="reader-language"
                role="group"
                aria-label={t("Meaning language", "अर्थ की भाषा")}
              >
                <button
                  data-track="meaning-hi" aria-pressed={meaningLang === "hi"}
                  onClick={() => setReaderLang("hi")}
                >
                  हिन्दी अर्थ
                </button>
                <button
                  data-track="meaning-en" aria-pressed={meaningLang === "en"}
                  onClick={() => setReaderLang("en")}
                >
                  English meaning
                </button>
              </div>
              <p
                className={`reader-meaning ${meaningLang === "hi" ? "devanagari" : ""}`}
                lang={meaningLang}
              >
                {meaningLang === "hi" ? verse.meaningHi : verse.meaningEn}
              </p>
              <div className="reader-pagination">
                <button
                  className="text-button"
                  data-track="previous-verse" disabled={verseIndex === 0}
                  onClick={() => setVerseIndex((i) => i - 1)}
                >
                  <ArrowLeft size={17} />
                  {t("Previous", "पिछला")}
                </button>
                <button
                  className="text-button"
                  data-track={verseIndex < 2 ? "next-verse" : "continue-reading"} onClick={() =>
                    verseIndex < 2
                      ? setVerseIndex((i) => i + 1)
                      : install("gita-preview-complete", modal)
                  }
                >
                  {verseIndex < 2
                    ? t("Next verse", "अगला श्लोक")
                    : t("Keep reading in the app", "ऐप में आगे पढ़ें")}
                  <ArrowRight size={17} />
                </button>
              </div>
            </>
          ) : feature.preview === "chalisa" ? (
            <>
              <img
                className="chalisa-art"
                src="/assets/hanuman.webp"
                width="420"
                height="420"
                alt="Hanuman devotional pencil illustration"
              />
              <div className="reader-meta">
                <span>{t("Opening doha", "आरम्भिक दोहा")}</span>
                <span>{t("Short preview", "छोटी झलक")}</span>
              </div>
              <div className="reader-verse" lang="hi">
                {content.chalisa.lines.map((l) => (
                  <p key={l}>{l}</p>
                ))}
              </div>
              <p className="reader-meaning">
                {hi ? content.chalisa.meaningHi : content.chalisa.meaningEn}
              </p>
            </>
          ) : feature.preview === "japa" ? (
            <MalaPreview
              {...japaProps}
              onInstall={() => install("japa-mala-preview", modal)}
            />
          ) : (
            <div className="feature-overview">
              <div className="feature-overview-copy">
                <p className="eyebrow">
                  {t("Inside the free app", "निःशुल्क ऐप में")}
                </p>
                <h3>
                  {t(
                    "Make it part of your day.",
                    "इसे अपने दिन का हिस्सा बनाएँ।",
                  )}
                </h3>
                <ul className="feature-benefits">
                  {(
                    featureDetails[feature.id] || sectionDetails[feature.group]
                  ).map(([en, hindi]) => (
                    <li key={en}>
                      <Check size={16} />
                      <span>{t(en, hindi)}</span>
                    </li>
                  ))}
                </ul>
                {feature.group === "panchang" && (
                  <p className="small-copy">
                    {t(
                      "The app calculates timings for your selected city. No live Panchang is calculated on this website.",
                      "ऐप आपके चुने हुए नगर के लिए समय गणना करता है। वेबसाइट पर वास्तविक पंचांग गणना नहीं होती।",
                    )}
                  </p>
                )}
              </div>
              {imageByGroup[feature.group] &&
                (feature.group === "jyotish" ||
                  feature.group === "stories" ||
                  [
                    "panchang",
                    "choghadiya",
                    "muhurat",
                    "vrat",
                    "my-vrat",
                    "theerth",
                    "routine",
                    "sankalp",
                  ].includes(feature.id)) && (
                  <figure>
                    <img
                      src={`/assets/${hi ? "hi/" : ""}${feature.id === "ramayan-comic" ? "app-comic" : imageByGroup[feature.group]}.webp`}
                      alt={`${t(groups.find((g) => g[0] === feature.group)[1], groups.find((g) => g[0] === feature.group)[2])} section in the Vedansh mobile app; illustrative app screenshot`}
                      width="600"
                      height="1304"
                      loading="lazy"
                    />
                    <figcaption>
                      {t(
                        "A look inside the app · illustrative screenshot",
                        "ऐप की एक झलक · उदाहरण चित्र",
                      )}
                    </figcaption>
                  </figure>
                )}
            </div>
          )}
          <div className="preview-gate">
            <BookOpen size={25} weight="light" />
            <div>
              <strong>
                {t(
                  "Your full journey is in the app.",
                  "आपकी पूरी यात्रा ऐप में है।",
                )}
              </strong>
              <p>
                {t(
                  "Complete readings, saved progress, and daily practice. All free.",
                  "पूरे पाठ, सहेजी प्रगति और नित्य साधना। सब निःशुल्क।",
                )}
              </p>
            </div>
            <button
              className="button"
              data-track={`install-${feature.id}`} onClick={() => install(`${feature.id}-preview`, modal)}
            >
              {t("Get the free app", "निःशुल्क ऐप पाएँ")}
              <ArrowRight size={17} />
            </button>
          </div>
        </ModalShell>
      )}
    </>
  );
}
