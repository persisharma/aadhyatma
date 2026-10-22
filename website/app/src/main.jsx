import React from "react";
import { hydrateRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./styles.css";
import { startAnalytics } from "./analytics.js";

try { startAnalytics(); } catch { /* The website works when measurement is unavailable. */ }

hydrateRoot(
  document.getElementById("root"),
  <React.StrictMode>
    <App
      initialLanguage={document.documentElement.lang === "hi" ? "hi" : "en"}
    />
  </React.StrictMode>,
);
