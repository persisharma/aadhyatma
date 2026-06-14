#!/usr/bin/env node
/**
 * claude-usage-watchdog.mjs
 * ---------------------------------------------------------------------------
 * Reports how much of the current Claude Code 5-hour session window has been
 * consumed, so an autonomous /loop can pause near the limit and auto-resume
 * after the window resets (see docs/ops/claude-usage-watchdog.md).
 *
 * PRIVACY / SECURITY (org rules — non-negotiable):
 *   - Reads ONLY the numeric `message.usage.*` token counts and the
 *     `timestamp` field from local Claude Code transcripts
 *     (~/.claude/projects/<slug>/*.jsonl).
 *   - NEVER reads, stores, logs, or prints message content, file paths inside
 *     messages, API keys, or any PII. Output is purely aggregate numbers +
 *     ISO timestamps.
 *
 * USAGE:
 *   node scripts/claude-usage-watchdog.mjs                # human summary
 *   node scripts/claude-usage-watchdog.mjs --json         # machine-readable
 *   CLAUDE_SESSION_TOKEN_BUDGET=44000000 node ... --json   # explicit budget
 *   CLAUDE_USAGE_THRESHOLD=90 node ...                     # pause threshold %
 *
 * EXIT CODES:
 *   0  under threshold (safe to keep working)
 *   10 at/over threshold (caller should pause until `resetTime`)
 *   1  could not determine usage (no transcripts / parse error)
 *
 * No external dependencies; pure Node stdlib.
 */

import { readdir, readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;
const PROJECTS_DIR = path.join(homedir(), '.claude', 'projects');
const BUDGET_CACHE = path.join(homedir(), '.claude', '.usage-watchdog-budget.json');
const BUDGET_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
// Conservative fallback only used when there is no history and no env override.
const DEFAULT_BUDGET_TOKENS = 50_000_000;

const THRESHOLD = clampPct(Number(process.env.CLAUDE_USAGE_THRESHOLD ?? 90));
const JSON_OUT = process.argv.includes('--json');

function clampPct(n) {
  if (!Number.isFinite(n)) return 90;
  return Math.min(100, Math.max(1, n));
}

function floorToHour(ms) {
  return Math.floor(ms / (60 * 60 * 1000)) * (60 * 60 * 1000);
}

/** Recursively list *.jsonl transcript files, optionally filtered by mtime age. */
async function listTranscripts(maxAgeMs) {
  if (!existsSync(PROJECTS_DIR)) return [];
  const out = [];
  const now = Date.now();
  async function walk(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        await walk(full);
      } else if (e.isFile() && e.name.endsWith('.jsonl')) {
        if (maxAgeMs == null) {
          out.push(full);
        } else {
          try {
            const s = await stat(full);
            if (now - s.mtimeMs <= maxAgeMs) out.push(full);
          } catch {
            /* ignore unstatable file */
          }
        }
      }
    }
  }
  await walk(PROJECTS_DIR);
  return out;
}

/** Sum the four token kinds. Returns 0 for malformed records. */
function recordTokens(usage) {
  if (!usage || typeof usage !== 'object') return 0;
  const n = (v) => (Number.isFinite(v) ? v : 0);
  return (
    n(usage.input_tokens) +
    n(usage.output_tokens) +
    n(usage.cache_creation_input_tokens) +
    n(usage.cache_read_input_tokens)
  );
}

/**
 * Extract { ts, tokens } usage events from transcript files.
 * Only `timestamp` and `message.usage` are ever read.
 */
async function extractEvents(files) {
  const events = [];
  for (const file of files) {
    let text;
    try {
      text = await readFile(file, 'utf8');
    } catch {
      continue;
    }
    for (const line of text.split('\n')) {
      if (!line || line[0] !== '{') continue;
      let rec;
      try {
        rec = JSON.parse(line);
      } catch {
        continue;
      }
      const usage = rec?.message?.usage;
      if (!usage) continue;
      const tokens = recordTokens(usage);
      if (tokens <= 0) continue;
      const ts = rec.timestamp ? Date.parse(rec.timestamp) : NaN;
      if (!Number.isFinite(ts)) continue;
      events.push({ ts, tokens });
    }
  }
  events.sort((a, b) => a.ts - b.ts);
  return events;
}

/**
 * Group events into Claude-Code-style 5h blocks.
 * A block starts at the hour-floor of its first event; a new block begins when
 * 5h elapse since the block start OR there is a >5h gap between events.
 */
function buildBlocks(events) {
  const blocks = [];
  let cur = null;
  let lastTs = null;
  for (const ev of events) {
    const needNew =
      !cur ||
      ev.ts - cur.start >= FIVE_HOURS_MS ||
      (lastTs != null && ev.ts - lastTs >= FIVE_HOURS_MS);
    if (needNew) {
      cur = { start: floorToHour(ev.ts), end: 0, tokens: 0, lastTs: ev.ts };
      blocks.push(cur);
    }
    cur.tokens += ev.tokens;
    cur.lastTs = ev.ts;
    lastTs = ev.ts;
  }
  for (const b of blocks) b.end = b.start + FIVE_HOURS_MS;
  return blocks;
}

/** Resolve the per-window token budget: env > cache > historical max > default. */
async function resolveBudget() {
  const envBudget = Number(process.env.CLAUDE_SESSION_TOKEN_BUDGET);
  if (Number.isFinite(envBudget) && envBudget > 0) {
    return { budget: envBudget, source: 'env' };
  }

  // Cached historical-max budget (refreshed at most once/day — the scan is expensive).
  try {
    if (existsSync(BUDGET_CACHE)) {
      const cached = JSON.parse(await readFile(BUDGET_CACHE, 'utf8'));
      if (
        cached &&
        Number.isFinite(cached.budget) &&
        cached.budget > 0 &&
        Date.now() - (cached.computedAt ?? 0) < BUDGET_CACHE_TTL_MS
      ) {
        return { budget: cached.budget, source: 'cache' };
      }
    }
  } catch {
    /* fall through to recompute */
  }

  // Recompute historical max across the last 30 days of transcripts.
  const files = await listTranscripts(30 * 24 * 60 * 60 * 1000);
  const events = await extractEvents(files);
  const blocks = buildBlocks(events);
  let maxBlock = 0;
  for (const b of blocks) maxBlock = Math.max(maxBlock, b.tokens);

  if (maxBlock > 0) {
    try {
      await mkdir(path.dirname(BUDGET_CACHE), { recursive: true });
      await writeFile(
        BUDGET_CACHE,
        JSON.stringify({ budget: maxBlock, computedAt: Date.now() }),
      );
    } catch {
      /* cache write is best-effort */
    }
    return { budget: maxBlock, source: 'historical-max' };
  }
  return { budget: DEFAULT_BUDGET_TOKENS, source: 'default' };
}

async function main() {
  // Active-block usage only needs files touched in the last ~6h (a block ≤ 5h).
  const recentFiles = await listTranscripts(6 * 60 * 60 * 1000);
  const events = await extractEvents(recentFiles);
  const blocks = buildBlocks(events);

  const now = Date.now();
  const last = blocks[blocks.length - 1];
  const active =
    last && now < last.end && now - last.lastTs < FIVE_HOURS_MS ? last : null;

  const { budget, source } = await resolveBudget();
  const used = active ? active.tokens : 0;
  const pct = budget > 0 ? Math.min(100, (used / budget) * 100) : 0;
  const resetTime = active ? new Date(active.end).toISOString() : null;
  const secondsToReset = active
    ? Math.max(0, Math.round((active.end - now) / 1000))
    : 0;
  const paused = pct >= THRESHOLD;

  const result = {
    now: new Date(now).toISOString(),
    activeBlock: !!active,
    blockStart: active ? new Date(active.start).toISOString() : null,
    resetTime,
    secondsToReset,
    usedTokens: used,
    budgetTokens: budget,
    budgetSource: source,
    pct: Math.round(pct * 10) / 10,
    threshold: THRESHOLD,
    paused,
  };

  if (JSON_OUT) {
    process.stdout.write(JSON.stringify(result) + '\n');
  } else {
    const bar = renderBar(result.pct);
    console.log(`Claude session usage: ${result.pct}% ${bar}`);
    console.log(
      `  used ${fmt(used)} / ${fmt(budget)} tokens (budget: ${source})`,
    );
    if (active) {
      console.log(
        `  window resets at ${resetTime} (in ${fmtDuration(secondsToReset)})`,
      );
    } else {
      console.log('  no active session window (idle)');
    }
    console.log(
      paused
        ? `  >>> AT/OVER ${THRESHOLD}% — pause and resume after reset.`
        : `  under ${THRESHOLD}% — safe to continue.`,
    );
  }

  process.exit(paused ? 10 : 0);
}

function fmt(n) {
  return n.toLocaleString('en-US');
}
function fmtDuration(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
function renderBar(pct) {
  const filled = Math.round((pct / 100) * 20);
  return '[' + '█'.repeat(filled) + '░'.repeat(20 - filled) + ']';
}

main().catch((err) => {
  // Never surface transcript content in errors — only the error name/message.
  process.stderr.write(`usage-watchdog error: ${err?.name ?? 'Error'}\n`);
  process.exit(1);
});
