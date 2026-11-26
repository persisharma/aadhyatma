-- First measured action during days 0–6, frozen before the day-7 outcome.
WITH base AS (
  SELECT cohort, version, build,
    SUM(fact='first_open') AS opens,
    SUM(fact='first_action') AS activated,
    SUM(fact='day7_return' AND action IS NULL) AS unactivated_returns
  FROM retention_events GROUP BY cohort, version, build
), groups AS (
  SELECT cohort, version, build, action, first_session,
    SUM(fact='first_action') AS installations, SUM(fact='day7_return') AS returns
  FROM retention_events WHERE action IS NOT NULL
  GROUP BY cohort, version, build, action, first_session
  UNION ALL
  SELECT cohort, version, build, 'no_measured_action', 0, opens-activated, unactivated_returns FROM base
)
SELECT cohort, version, build, action, first_session, installations,
  ROUND(100.0*installations / SUM(installations) OVER (PARTITION BY cohort, version, build),1) AS cohort_percent,
  CASE WHEN cohort < date('now','+330 minutes','-7 days') THEN returns END AS day7_returns,
  CASE WHEN cohort < date('now','+330 minutes','-7 days')
       THEN ROUND(100.0*returns/NULLIF(installations,0),1) END AS day7_percent
FROM groups WHERE installations > 0 ORDER BY cohort DESC, version, build, installations DESC;
