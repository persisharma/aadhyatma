import React from "react";
import { renderToString } from "react-dom/server";
import { App } from "./App.jsx";
export function render(lang = "en") {
  return renderToString(<App initialLanguage={lang} />);
}
