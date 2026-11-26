import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { createCohort } from '../../mobile/src/retention/cohort.ts';
import worker from './worker.mjs';

const day = 86_400_000;
const sql = (name) => readFileSync(new URL(name, import.meta.url), 'utf8');
function fixture() {
  const db = new DatabaseSync(':memory:');
  db.exec(sql('schema.sql'));
  const env = {
    DB: {
      prepare(statement) {
        const run = (...args) => db.prepare(statement).run(...args);
        return { bind: (...args) => ({ run: () => run(...args) }), run };
      },
    },
  };
  async function post(event) {
    return worker.fetch(
      new Request('https://vedansh.example/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      }),
      env,
    );
  }
  function install() {
    let raw = null;
    let online = true;
    const config = {
      read: async () => raw,
      write: async (v) => {
        raw = v;
      },
      now: Date.now,
      uuid: randomUUID,
      send: async (e) => online && (await post(e)).ok,
    };
    return {
      boot: () => createCohort(config),
      network: (v) => {
        online = v;
      },
      raw: () => raw,
    };
  }
  return { db, env, post, install };
}

test('first action, session and exact D7 survive retries, upgrades and cold starts', async () => {
  const { db, post, install } = fixture();
  const start = Date.now() - 10 * day;
  const phone = install();
  phone.network(false);
  const first = phone.boot();
  await first.foreground(true, '1.6.0', '25', 'a', start);
  await Promise.all([
    first.complete('kundali_generated', 'a', start),
    first.complete('bead_counted', 'a', start),
  ]);
  await first.flush();
  const events = JSON.parse(phone.raw()).pending;
  assert.equal(events.length, 2);
  assert.notEqual(events[0].id, events[1].id);
  assert.equal((await post(events[0])).status, 204); // lost HTTP acknowledgement
  phone.network(true);
  const returning = phone.boot();
  for (const offset of [6, 7, 7, 8])
    await returning.foreground(false, '1.6.1', '26', 'b', start + offset * day);
  await returning.flush();
  assert.equal(db.prepare('SELECT count(*) n FROM retention_events').get().n, 3);
  const rows = db.prepare(sql('report.sql')).all();
  assert.deepEqual(
    { ...rows[0] },
    {
      cohort: events[0].cohort,
      version: '1.6.0',
      build: '25',
      action: 'kundali_generated',
      first_session: 1,
      installations: 1,
      cohort_percent: 100,
      day7_returns: 1,
      day7_percent: 100,
    },
  );
});

test('includes non-activators, separates later first actions and excludes existing installs and day-eight returns', async () => {
  const { db, install } = fixture();
  const t = Date.now() - 10 * day;
  const old = install().boot();
  await old.foreground(false, '1.6.0', '25', 'old', t);
  await old.complete('other_read', 'old', t);
  for (const group of ['none', 'later', 'immature']) {
    const client = install().boot();
    const start = group === 'immature' ? Date.now() : t;
    await client.foreground(true, '1.6.0', '25', 'a', start);
    if (group === 'none') {
      await client.foreground(false, '1.6.0', '25', 'b', t + 7 * day);
      await client.complete('gita_read', 'b', t + 7 * day);
    }
    if (group === 'later') {
      await client.complete('other_read', 'b', t + day);
      await client.foreground(false, '1.6.0', '25', 'c', t + 8 * day);
    }
    await client.flush();
  }
  const rows = db.prepare(sql('report.sql')).all();
  assert.deepEqual(
    rows.map((r) => [r.action, r.first_session, r.installations, r.day7_percent]).sort(),
    [
      ['no_measured_action', 0, 1, 100],
      ['no_measured_action', 0, 1, null],
      ['other_read', 0, 1, 0],
    ].sort(),
  );
});

test('collector rejects unknown fields and premature returns, and purges expired cohorts', async () => {
  const { db, post, env } = fixture();
  const e = {
    id: randomUUID(),
    cohort: new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10),
    version: '1.6.0',
    build: '25',
    fact: 'first_open',
    action: null,
    firstSession: false,
  };
  assert.equal((await post({ ...e, location: 'test' })).status, 400);
  assert.equal((await post({ ...e, fact: 'day7_return' })).status, 400);
  assert.equal((await post({ ...e, fact: 'first_action', action: 'arbitrary-content' })).status, 400);
  assert.equal((await post(e)).status, 204);
  db.exec("UPDATE retention_events SET cohort=date('now','-47 days')");
  await worker.scheduled(null, env);
  assert.equal(db.prepare('SELECT count(*) n FROM retention_events').get().n, 0);
});
