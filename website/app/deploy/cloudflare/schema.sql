-- Additive migration; leaves existing production hits counters untouched.
CREATE TABLE IF NOT EXISTS website_events (
  id TEXT PRIMARY KEY,
  ts INTEGER NOT NULL,
  payload TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS website_events_ts ON website_events(ts);
