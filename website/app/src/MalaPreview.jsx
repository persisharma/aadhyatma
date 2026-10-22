import React from "react";
import { ArrowRight, ArrowCounterClockwise } from "@phosphor-icons/react";
import content from "./preview-content.json";
import { track } from "./analytics.js";

// Functional counter visualization adapted from the user-supplied prototype.
// Beads represent count/progress; devotional illustrations remain real raster assets.
export function MalaPreview({
  lang,
  count,
  setCount,
  mantra,
  setMantra,
  onInstall,
}) {
  const hi = lang === "hi",
    t = (en, hindi) => (hi ? hindi : en),
    complete = count >= 11;
  const tick = () => {
    if (count === 0) track("preview_start", { feature: "japa" });
    if (!complete) setCount((n) => Math.min(11, n + 1));
  };
  return (
    <div className="mala-experience">
      <label className="mala-label" htmlFor="mala-mantra">
        {t("Choose your mantra", "अपना मन्त्र चुनें")}
      </label>
      <select
        data-track="choose-mantra" id="mala-mantra"
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
      <div className="mala-stage">
        <svg viewBox="0 0 440 440" className="mala-ring" aria-hidden="true">
          <circle
            cx="220"
            cy="220"
            r="192"
            fill="none"
            stroke="#b79b70"
            strokeWidth="1"
          />
          {Array.from({ length: 108 }, (_, i) => {
            const a = (i / 108) * 2 * Math.PI - Math.PI / 2;
            return (
              <circle
                key={i}
                cx={(220 + 192 * Math.cos(a)).toFixed(3)}
                cy={(220 + 192 * Math.sin(a)).toFixed(3)}
                r={i === count - 1 ? 6.8 : 4.7}
                fill={
                  i < count ? "#B8621B" : i === count ? "#8A3E0B" : "#a38a62"
                }
                opacity={i < count ? 1 : 0.5}
              />
            );
          })}
        </svg>
        <button
          data-track={complete ? "continue-japa" : "count-chant"} className={`mala-centre ${complete ? "complete" : ""}`}
          aria-label={
            complete
              ? t("Continue japa in the app", "ऐप में जप जारी रखें")
              : t("Count one chant", "एक जप गिनें")
          }
          onClick={complete ? onInstall : tick}
        >
          <span className="eyebrow">
            {complete
              ? t("A little pause, complete", "कुछ पल का विराम पूरा")
              : t("Tap. Chant. Repeat.", "दबाएँ। जपें। फिर दोहराएँ।")}
          </span>
          <strong>{String(count).padStart(2, "0")}</strong>
          <span className="mala-count-label">
            {t("of 11 preview chants", "/ ११ जप की झलक")}
          </span>
          <span className="mala-mantra" lang="hi">
            {content.mantras[mantra].nameHi}
          </span>
          {complete && (
            <span className="mala-continue">
              {t("Continue in the app", "ऐप में जारी रखें")}
              <ArrowRight size={16} />
            </span>
          )}
        </button>
      </div>
      {content.mantras[mantra].lines.length > 1 && (
        <div className="mala-mantra-text" lang="hi">
          {content.mantras[mantra].lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}
      <div className="mala-feedback">
        <span role="status" aria-live="polite">
          {complete
            ? t(
                "11 moments of devotion. Take the next one with you.",
                "भक्ति के ११ पल। अगला पल ऐप के साथ।",
              )
            : t(
                "A short preview of your daily practice.",
                "आपकी नित्य साधना की एक छोटी झलक।",
              )}
        </span>
        <button
          data-track="reset-mala" className="icon-button"
          aria-label={t("Reset mala preview", "माला फिर शुरू करें")}
          onClick={() => setCount(0)}
        >
          <ArrowCounterClockwise size={18} />
        </button>
      </div>
    </div>
  );
}
