import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

// The /get/ download link's redirect script, run against a stub browser.
const html = readFileSync(new URL("../../get/index.html", import.meta.url), "utf8");
const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).find((s) => s.includes("sendBeacon"));
const IOS = "https://apps.apple.com/app/vedansh/id6766086529";
const PLAY = "https://play.google.com/store/apps/details?id=com.prashantsharma.vedansh";
const UA = {
  android: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/126 Mobile Safari/537.36",
  iphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
  desktop: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
};

function visit(ua, search = "") {
  const els = { ios: { href: "" }, android: { href: "" }, status: { textContent: "" } };
  const out = { beacons: [], redirect: null, els };
  vm.runInNewContext(script, {
    URLSearchParams,
    encodeURIComponent,
    navigator: { userAgent: ua, maxTouchPoints: 0, sendBeacon: (u) => out.beacons.push(u) },
    window: { location: { search, replace: (u) => { out.redirect = u; } } },
    document: { getElementById: (id) => els[id] },
  });
  return out;
}

test("/get/ sends each phone to its own store and counts the visit under its campaign", () => {
  const a = visit(UA.android, "?utm_source=poster");
  assert.equal(a.redirect, `${PLAY}&referrer=${encodeURIComponent("utm_source=poster")}`);
  assert.deepEqual(a.beacons, ["/api/hits?p=%2Fget%2F&src=poster"]);
  assert.equal(visit(UA.iphone).redirect, IOS);
  const d = visit(UA.desktop);
  assert.equal(d.redirect, null, "a desktop with no store named chooses on the page");
  assert.equal(d.els.android.href, PLAY);
});

test("/get/ honours the store a visitor tapped on the temple-walk site, keeping its tags", () => {
  const ios = visit(UA.android, "?utm_source=mandir&utm_medium=hero&store=ios");
  assert.equal(ios.redirect, `${IOS}?ct=mandir`);
  assert.deepEqual(ios.beacons, ["/api/hits?p=%2Fget%2F&src=mandir"]);
  const play = visit(UA.desktop, "?utm_source=mandir&utm_medium=sheet&store=android");
  assert.equal(play.redirect, `${PLAY}&referrer=${encodeURIComponent("utm_source=mandir&utm_medium=sheet")}`);
  assert.equal(play.els.status.textContent, "Taking you to Google Play…");
  assert.equal(visit(UA.desktop, "?store=nonsense").redirect, null, "an unknown store falls back to the device rule");
});
