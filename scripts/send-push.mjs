#!/usr/bin/env node
/**
 * Fan out a remote push notification to every device registered with
 * Supabase, using Expo's free push service (https://exp.host/--/api/v2/push/send).
 *
 * Reads tokens via the Supabase REST API with the service-role key (bypasses
 * RLS, so it can SELECT the full table). Both keys are read from environment
 * variables — see `.env.example`.
 *
 * Usage:
 *   node scripts/send-push.mjs --title "New chapter" --body "Tap to read"
 *   node scripts/send-push.mjs --title "..." --body "..." --update-id <id>
 *   node scripts/send-push.mjs --dry-run --title "..." --body "..."
 *
 * Exit codes:
 *   0 — all batches accepted (some tokens may still have per-ticket errors;
 *       check stdout)
 *   1 — config error or hard failure before any send happened
 *   2 — at least one Expo batch failed
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const EXPO_PUSH_BATCH_SIZE = 100;

function parseArgs(argv) {
  const out = { title: '', body: '', updateId: '', dryRun: false };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--title' || a === '-t') {
      out.title = argv[++i] ?? '';
    } else if (a === '--body' || a === '-b') {
      out.body = argv[++i] ?? '';
    } else if (a === '--update-id') {
      out.updateId = argv[++i] ?? '';
    } else if (a === '--dry-run') {
      out.dryRun = true;
    } else if (a === '--help' || a === '-h') {
      console.log(
        'Usage: send-push.mjs --title "..." --body "..." [--update-id <id>] [--dry-run]'
      );
      process.exit(0);
    } else {
      console.error(`Unknown arg: ${a}`);
      process.exit(1);
    }
  }
  return out;
}

function loadDotEnv() {
  // Lightweight .env loader so we don't take on `dotenv` as a dep just for this.
  // Looks at SCRIPT_DIR/../.env relative to this file.
  try {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const envPath = path.resolve(here, '..', '.env');
    if (!fs.existsSync(envPath)) return;
    const raw = fs.readFileSync(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {
    // No .env or unreadable — env vars must be provided some other way.
  }
}

async function fetchTokens(supabaseUrl, serviceRoleKey) {
  const url = `${supabaseUrl}/rest/v1/push_tokens?select=token,platform&limit=10000`;
  const res = await fetch(url, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Supabase fetch failed (${res.status}): ${text}`);
  }
  const rows = await res.json();
  return rows
    .map((r) => r.token)
    .filter((t) => typeof t === 'string' && t.startsWith('ExponentPushToken['));
}

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

async function sendBatch(messages) {
  const res = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
    },
    body: JSON.stringify(messages),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Expo push returned non-JSON (${res.status}): ${text.slice(0, 200)}`);
  }
  if (!res.ok) {
    throw new Error(`Expo push HTTP ${res.status}: ${text.slice(0, 500)}`);
  }
  return json;
}

async function main() {
  loadDotEnv();

  const { title, body, updateId, dryRun } = parseArgs(process.argv);
  if (!title.trim() || !body.trim()) {
    console.error('ERROR: --title and --body are required.');
    process.exit(1);
  }

  const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      'ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set ' +
        '(via .env at repo root or the shell environment).'
    );
    process.exit(1);
  }

  console.log(`Fetching push tokens from Supabase...`);
  let tokens;
  try {
    tokens = await fetchTokens(supabaseUrl, serviceRoleKey);
  } catch (err) {
    console.error(String(err));
    process.exit(1);
  }
  console.log(`Found ${tokens.length} token(s).`);

  if (tokens.length === 0) {
    console.log('Nothing to send.');
    return;
  }

  const data = updateId.trim()
    ? { type: 'ota-release', updateId: updateId.trim() }
    : { type: 'ota-release' };

  const messages = tokens.map((to) => ({
    to,
    title,
    body,
    sound: 'default',
    priority: 'high',
    channelId: 'ota-release',
    data,
  }));

  if (dryRun) {
    console.log('--dry-run: would send the following batches:');
    for (const batch of chunk(messages, EXPO_PUSH_BATCH_SIZE)) {
      console.log(`  batch of ${batch.length}`);
    }
    return;
  }

  let okCount = 0;
  let errCount = 0;
  let batchFailures = 0;

  for (const batch of chunk(messages, EXPO_PUSH_BATCH_SIZE)) {
    try {
      const resp = await sendBatch(batch);
      const tickets = Array.isArray(resp?.data) ? resp.data : [];
      for (const t of tickets) {
        if (t?.status === 'ok') okCount += 1;
        else {
          errCount += 1;
          const msg = t?.message ?? JSON.stringify(t);
          console.warn(`  ticket error: ${msg}`);
        }
      }
    } catch (err) {
      batchFailures += 1;
      console.error(`  batch failed: ${String(err)}`);
    }
  }

  console.log(`Sent: ${okCount} ok, ${errCount} per-token errors, ${batchFailures} batch failures.`);
  if (batchFailures > 0) process.exit(2);
}

main().catch((err) => {
  console.error(String(err));
  process.exit(1);
});
