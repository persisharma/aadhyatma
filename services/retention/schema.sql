CREATE TABLE IF NOT EXISTS retention_events (
  id TEXT PRIMARY KEY, cohort TEXT NOT NULL, version TEXT NOT NULL, build TEXT NOT NULL,
  fact TEXT NOT NULL, action TEXT, first_session INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS retention_cohorts ON retention_events(cohort, version, build);
