import React, { useEffect, useState } from "react";

// The site's all-time visit counter — same contract as website/script.js:
// one POST per browser session (shared session key, so moving between this
// page and the static legal pages never double-counts), GET afterwards. The
// landing utm_source rides along on the counted POST. Nothing about the
// visitor is stored. A failed request simply shows nothing.
let pending = null;
function loadTotal() {
  if (pending) return pending;
  const key = "vedansh-hit";
  let counted = false;
  try { counted = sessionStorage.getItem(key) === "1"; } catch { /* private mode */ }
  // Do Not Track / Global Privacy Control: show the total, but don't count this visit.
  if (navigator.doNotTrack === "1" || navigator.globalPrivacyControl === true) counted = true;
  let url = "/api/hits?p=" + encodeURIComponent(location.pathname);
  try {
    const src = (new URLSearchParams(location.search).get("utm_source") || "").toLowerCase();
    if (!counted && src) url += "&src=" + encodeURIComponent(src);
  } catch { /* old browser */ }
  const read = () => fetch("/api/hits?all=1", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null));
  pending = fetch(url, { method: counted ? "GET" : "POST", cache: "no-store" })
    .then((r) => (r.ok ? r.json() : r.status === 405 ? read() : null))
    .then((d) => {
      if (!d || typeof d.total !== "number") return null;
      try { if (sessionStorage.getItem(key) !== "1") sessionStorage.setItem(key, "1"); } catch { /* ignore */ }
      return d.total;
    })
    .catch(() => null);
  return pending;
}

export function VisitCounter({ lang, className = "" }) {
  const [total, setTotal] = useState(null);
  useEffect(() => { loadTotal().then(setTotal); }, []);
  if (total == null) return null;
  const n = total.toLocaleString(lang === "hi" ? "hi-IN" : "en-IN");
  return <span className={`visit-counter ${className}`}>{lang === "hi" ? `${n} दर्शन` : `${n} visits`}</span>;
}
