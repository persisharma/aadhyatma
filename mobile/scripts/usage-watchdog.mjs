#!/usr/bin/env node
// Claude usage watchdog for the autonomous vrat-katha build loop.
//
// Reads Claude Code token usage from `ccusage` (via npx, no install needed) and
// decides whether the build loop may proceed.
//
// Output (stdout): a single JSON object:
//   { decision: "GO" | "PAUSE" | "STOP", pct, blockTokens, blockCostUSD,
//     limitTokens, resetInMinutes, monthCostUSD, reason }
//
//   GO    – usage below threshold; author the next batch.
//   PAUSE – active 5-hour block >= threshold; wait `resetInMinutes` for the
//           rolling window to reset, then re-check.
//   STOP  – month-to-date cost has reached the configured org monthly cap.
//           A monthly cap cannot be waited out, so the loop must stop + report.
//
// Config (env, all optional):
//   USAGE_THRESHOLD        pause when block pct >= this (default 0.90)
//   USAGE_TOKEN_LIMIT      explicit per-5h-block token ceiling. If unset, the
//                          limit self-calibrates to the max totalTokens seen in
//                          any past completed block (ccusage `--token-limit max`).
//   USAGE_MONTHLY_CAP_USD  org monthly spend cap in USD. If set and month-to-date
//                          cost >= 98% of it, decision = STOP. If unset, the
//                          monthly check is skipped.
//
// Fails OPEN: if ccusage is unavailable, prints decision "GO" with a warning on
// stderr. Durability then relies on the loop's commit-per-batch behavior.

import { execFileSync } from 'node:child_process';

const THRESHOLD = Number(process.env.USAGE_THRESHOLD ?? '0.90');
const ENV_TOKEN_LIMIT = process.env.USAGE_TOKEN_LIMIT ? Number(process.env.USAGE_TOKEN_LIMIT) : null;
const MONTHLY_CAP = process.env.USAGE_MONTHLY_CAP_USD ? Number(process.env.USAGE_MONTHLY_CAP_USD) : null;

function ccusage(args) {
  // `npx -y ccusage@latest <args>` — cached after first resolve.
  const out = execFileSync('npx', ['-y', 'ccusage@latest', ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    timeout: 90_000,
    maxBuffer: 32 * 1024 * 1024,
  });
  return JSON.parse(out);
}

function emit(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}

let blocks;
try {
  blocks = ccusage(['blocks', '--json']).blocks ?? [];
} catch (err) {
  process.stderr.write(`[watchdog] ccusage unavailable, failing open to GO: ${err.message}\n`);
  emit({ decision: 'GO', pct: 0, reason: 'ccusage-unavailable' });
  process.exit(0);
}

const active = blocks.find((b) => b.isActive && !b.isGap);
if (!active) {
  // No active block = no recent usage; safe to proceed.
  emit({ decision: 'GO', pct: 0, reason: 'no-active-block' });
  process.exit(0);
}

// Self-calibrated limit: largest past completed (non-active, non-gap) block.
const pastMax = blocks
  .filter((b) => !b.isActive && !b.isGap && typeof b.totalTokens === 'number')
  .reduce((m, b) => Math.max(m, b.totalTokens), 0);

const limitTokens = ENV_TOKEN_LIMIT ?? (pastMax > 0 ? pastMax : null);

const blockTokens = active.totalTokens ?? 0;
const blockCostUSD = active.costUSD ?? 0;
const pct = limitTokens ? blockTokens / limitTokens : 0;

const now = Date.now();
const endTime = active.endTime ? new Date(active.endTime).getTime() : now;
const resetInMinutes = Math.max(0, Math.ceil((endTime - now) / 60_000));

// Monthly org spend cap — a hard stop (can't be waited out).
let monthCostUSD = null;
if (MONTHLY_CAP) {
  try {
    const monthly = ccusage(['monthly', '--json']).monthly ?? [];
    // current month = the row with the latest "month" key (YYYY-MM)
    const cur = monthly.reduce((a, b) => (!a || (b.month ?? '') > (a.month ?? '') ? b : a), null);
    monthCostUSD = cur ? (cur.totalCost ?? cur.costUSD ?? 0) : 0;
  } catch (err) {
    process.stderr.write(`[watchdog] monthly check failed, ignoring: ${err.message}\n`);
  }
  if (monthCostUSD != null && monthCostUSD >= MONTHLY_CAP * 0.98) {
    emit({
      decision: 'STOP', pct, blockTokens, blockCostUSD, limitTokens,
      resetInMinutes, monthCostUSD,
      reason: `month-to-date cost $${monthCostUSD.toFixed(2)} >= 98% of cap $${MONTHLY_CAP}`,
    });
    process.exit(0);
  }
}

// If we have no calibrated limit yet (no history), fail open but report it.
if (!limitTokens) {
  emit({
    decision: 'GO', pct: 0, blockTokens, blockCostUSD, limitTokens: null,
    resetInMinutes, monthCostUSD, reason: 'no-limit-calibration-yet',
  });
  process.exit(0);
}

const decision = pct >= THRESHOLD ? 'PAUSE' : 'GO';
emit({
  decision, pct: Number(pct.toFixed(4)), blockTokens, blockCostUSD, limitTokens,
  resetInMinutes, monthCostUSD,
  reason: decision === 'PAUSE'
    ? `block at ${(pct * 100).toFixed(1)}% of ${limitTokens} tok; reset in ${resetInMinutes}m`
    : `block at ${(pct * 100).toFixed(1)}% of ${limitTokens} tok`,
});
