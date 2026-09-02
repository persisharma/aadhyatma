# Claude Usage Watchdog — auto-pause near the limit, auto-resume after reset

**Goal:** run long autonomous Claude Code work without it dying when the 5-hour
session window fills up — and without you having to come back and resume
manually. A 1-minute monitor loop watches usage; at ≥90% it stops doing work and
schedules a wake-up for when the window resets, which then resumes the task.

## Pieces

1. **`scripts/claude-usage-watchdog.mjs`** — the measurement core. Reads only the
   numeric `message.usage.*` token counts + `timestamp` from local transcripts
   (`~/.claude/projects/**/*.jsonl`). Prints a usage summary or `--json`. Exit
   code `10` = at/over threshold (pause), `0` = safe, `1` = couldn't determine.
   It **never** reads or prints message content, API keys, or PII.

2. **The two-stage `/loop`** (this document) — the dynamic, self-paced loop that
   calls the script every minute and pauses/resumes via `ScheduleWakeup`.

## Configuration

| Env var | Meaning | Default |
|---|---|---|
| `CLAUDE_SESSION_TOKEN_BUDGET` | Tokens that count as 100% of a 5h window. **Set this to your real ceiling for an accurate gate.** | largest historical 5h block (cached 24h) |
| `CLAUDE_USAGE_THRESHOLD` | Pause percentage. | `90` |

Find a good budget value by watching `node scripts/claude-usage-watchdog.mjs`
across a few full sessions and noting the `used` figure when you actually get
rate-limited; set the budget just below that.

## Quick check (one-off)

```bash
node scripts/claude-usage-watchdog.mjs            # human summary + bar
node scripts/claude-usage-watchdog.mjs --json     # {pct, resetTime, paused, …}
```

## The two-stage loop (the "don't babysit" part)

Launch a self-paced loop and paste this as the loop body (replace the **TASK**
line with whatever long job you want guarded):

```
/loop Guard my Claude usage and run a task without hitting the limit.

Each time you wake:
1. Run: node scripts/claude-usage-watchdog.mjs --json
   Parse `paused`, `pct`, `secondsToReset`, `resetTime` from the JSON.
2. If paused === true (usage ≥ threshold):
     - Do NOT do any task work this turn.
     - Report "paused at <pct>% — resuming after <resetTime>".
     - Schedule the next wake with delaySeconds = min(3600, secondsToReset + 30)
       and the SAME loop prompt. (ScheduleWakeup clamps to ≤3600s, so for a
       multi-hour wait it re-checks each hour and keeps sleeping until the
       window actually rolls over and pct drops — then it auto-resumes.)
3. If paused === false (safe):
     - Do ONE bounded chunk of the TASK below.
     - If the TASK is fully complete, stop the loop (do not reschedule).
     - Otherwise schedule the next wake with delaySeconds = 60 and the SAME prompt.

TASK: <your long autonomous task here, e.g. "continue implementing the plan in
docs/roadmap/prds/08-theerth-real-map.md, one phase per turn, committing each phase">
```

### Why the delays are what they are

- **60s when safe** — keeps the monitor responsive and the prompt cache warm.
- **`min(3600, secondsToReset+30)` when paused** — `ScheduleWakeup` caps a single
  sleep at 1 hour. A 5-hour window can need a >1h wait, so the loop sleeps in
  ≤1h hops, re-checks, and only resumes once the new window has actually started
  (usage drops below threshold). No manual resume needed.

## Robust alternative (headless, no model-in-the-loop)

If you'd rather gate a headless run from the shell instead of a `/loop`:

```bash
# pseudo-wrapper: poll every 60s; pause until reset when over threshold
while :; do
  if node scripts/claude-usage-watchdog.mjs --json | node -e '
      let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
        const u=JSON.parse(s);
        if(u.paused){ console.error(`paused ${u.pct}% → sleep ${u.secondsToReset+30}s`); process.exit(10);} 
        process.exit(0);})'; then
    : # under threshold — kick off / continue the next work chunk here
  else
    sleep "$(node scripts/claude-usage-watchdog.mjs --json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const u=JSON.parse(s);process.stdout.write(String(Math.min(3600,u.secondsToReset+30)))})')"
  fi
  sleep 60
done
```

The `/loop` form above is the recommended one — it keeps full task context
between pauses, which the headless wrapper does not.
