import assert from "node:assert/strict";
import test from "node:test";
import { onRequest } from "../../functions/api/hits.js";
import { dailySeries, splitBySource, CHANNELS } from "../public/stats/daily.js";

// In-memory stand-in for the D1 `hits` table, answering the exact statements
// functions/api/hits.js prepares.
function fakeDB() {
  const rows = new Map();
  const exec = (sql, [k] = []) => {
    if (sql.startsWith("INSERT INTO hits")) {
      rows.set(k, (rows.get(k) || 0) + 1);
      return { results: [{ n: rows.get(k) }] };
    }
    if (sql.startsWith("SELECT n FROM hits")) return { results: rows.has(k) ? [{ n: rows.get(k) }] : [] };
    if (sql.startsWith("SELECT k, n FROM hits")) {
      return { results: [...rows].map(([key, n]) => ({ k: key, n })).sort((a, b) => b.n - a.n) };
    }
    return { results: [] };
  };
  const statement = (sql, args) => ({
    bind: (...next) => statement(sql, next),
    all: async () => exec(sql, args),
    run: async () => exec(sql, args),
  });
  return {
    rows,
    prepare: (sql) => statement(sql, []),
    batch: async (list) => Promise.all(list.map((s) => s.all())),
  };
}

const call = (env, method, query) =>
  onRequest({ request: new Request(`https://vedansh.app/api/hits?${query}`, { method }), env, waitUntil: () => {} })
    .then((r) => r.json());

async function at(iso, fn) {
  const realNow = Date.now;
  Date.now = () => Date.parse(iso);
  try { return await fn(); } finally { Date.now = realNow; }
}

test("a counted visit is also counted on its India-time day, and /stats/ reads the days oldest first", async () => {
  const env = { DB: fakeDB() };
  await at("2026-11-23T10:00:00Z", () => call(env, "POST", "p=%2F"));
  await at("2026-11-24T06:00:00Z", () => call(env, "POST", "p=%2Fget%2F&src=instagram"));
  // 00:30 IST on 25 November is still the 24th in UTC.
  await at("2026-11-24T19:00:00Z", () => call(env, "POST", "p=%2Fhi%2F"));

  const all = await call(env, "GET", "all=1");
  assert.deepEqual(all.days, [
    { name: "2026-11-23", count: 1 },
    { name: "2026-11-24", count: 1 },
    { name: "2026-11-25", count: 1 },
  ]);
  assert.equal(all.total, 3);
  assert.ok(!all.pages.some((p) => p.name.startsWith("20")), "day rows stay out of the page list");
});

test("reading the counter does not count a day; an unlisted path still does, so days add up to the total", async () => {
  const env = { DB: fakeDB() };
  await at("2026-11-24T06:00:00Z", async () => {
    await call(env, "GET", "p=%2F");
    await call(env, "POST", "p=%2Fnot-a-page%2F");
  });
  const all = await call(env, "GET", "all=1");
  assert.deepEqual(all.days, [{ name: "2026-11-24", count: 1 }]);
  assert.equal(all.days.reduce((sum, d) => sum + d.count, 0), all.total);
});

test("the daily chart covers the counted days up to today, zero-filling quiet days, at most 30", () => {
  assert.deepEqual(dailySeries([], "2026-11-24"), []);
  assert.deepEqual(
    dailySeries([{ name: "2026-11-21", count: 4 }, { name: "2026-11-23", count: 2 }], "2026-11-24"),
    [
      { date: "2026-11-21", count: 4 },
      { date: "2026-11-22", count: 0 },
      { date: "2026-11-23", count: 2 },
      { date: "2026-11-24", count: 0 },
    ],
  );
  const long = Array.from({ length: 45 }, (_, i) => ({
    name: new Date(Date.UTC(2026, 9, 10 + i)).toISOString().slice(0, 10), count: i,
  }));
  const series = dailySeries(long, "2026-11-23");
  assert.equal(series.length, 30);
  assert.deepEqual(series.at(-1), { date: "2026-11-23", count: 44 });
  assert.equal(series[0].date, "2026-10-25");
});

test("India-time today for the chart", async () => {
  const { istToday } = await import("../public/stats/daily.js");
  assert.equal(istToday(Date.parse("2026-11-24T18:29:00Z")), "2026-11-24");
  assert.equal(istToday(Date.parse("2026-11-24T18:30:00Z")), "2026-11-25");
});

test("each counted visit also lands on its day's source row: /get/ vs a site landing, tagged or direct", async () => {
  const env = { DB: fakeDB() };
  await at("2026-11-26T06:00:00Z", async () => {
    await call(env, "POST", "p=%2F&src=instagram");
    await call(env, "POST", "p=%2F&src=Instagram");
    await call(env, "POST", "p=%2Fhi%2F");
    await call(env, "POST", "p=%2Fget%2F&src=website");
    await call(env, "POST", "p=%2Fget%2F");
    await call(env, "POST", "p=%2Fprivacy%2F&src=not%20a%20slug");
    await call(env, "GET", "p=%2F&src=instagram");
  });
  const all = await call(env, "GET", "all=1");
  const rows = Object.fromEntries(all.daySources.map((r) => [`${r.date} ${r.kind} ${r.source}`, r.count]));
  assert.deepEqual(rows, {
    "2026-11-26 site instagram": 2,
    "2026-11-26 site direct": 2,
    "2026-11-26 get website": 1,
    "2026-11-26 get direct": 1,
  });
  assert.equal(all.daySources.reduce((sum, r) => sum + r.count, 0), all.days[0].count, "source rows add up to the day");
  assert.ok(!all.sources.some((s) => s.name.includes("2026")), "day-source rows stay out of the all-time source lists");
});

test("each day splits into channels; instagram tags merge, /get/ keeps its own bar, older days stay unsplit", () => {
  assert.deepEqual(CHANNELS.map((c) => c.id), ["direct", "instagram", "other", "get"]);
  const series = [
    { date: "2026-11-25", count: 9 },
    { date: "2026-11-26", count: 11 },
  ];
  const split = splitBySource(series, [
    { date: "2026-11-26", kind: "site", source: "direct", count: 3 },
    { date: "2026-11-26", kind: "site", source: "instagram", count: 2 },
    { date: "2026-11-26", kind: "site", source: "ig", count: 1 },
    { date: "2026-11-26", kind: "site", source: "poster", count: 1 },
    { date: "2026-11-26", kind: "get", source: "instagram", count: 1 },
    { date: "2026-11-26", kind: "get", source: "direct", count: 1 },
  ]);
  assert.deepEqual(split[0].parts, { direct: 0, instagram: 0, other: 0, get: 0, unsplit: 9 });
  assert.deepEqual(split[1].parts, { direct: 3, instagram: 3, other: 1, get: 2, unsplit: 2 });
  assert.deepEqual(split[1].tags, [
    { kind: "site", source: "instagram", count: 2 },
    { kind: "site", source: "ig", count: 1 },
    { kind: "site", source: "poster", count: 1 },
    { kind: "get", source: "instagram", count: 1 },
  ]);
  assert.equal(split[1].count, 11, "the day total is unchanged");
  assert.deepEqual(splitBySource(series, undefined)[1].parts, { direct: 0, instagram: 0, other: 0, get: 0, unsplit: 11 });
});
