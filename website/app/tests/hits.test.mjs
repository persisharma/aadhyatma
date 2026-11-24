import assert from "node:assert/strict";
import test from "node:test";
import { onRequest } from "../../functions/api/hits.js";
import { dailySeries } from "../public/stats/daily.js";

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
