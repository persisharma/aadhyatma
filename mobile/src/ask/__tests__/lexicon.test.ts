/**
 * Anti-drift gate (PRD-25 §4.3): every registry entry the resolver can answer
 * about must produce at least one usable lexicon key, and every hand alias
 * must point at an id that exists. A new deity or festival cannot ship
 * unaskable; a renamed id cannot leave a dangling alias.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { deities } from '@/data/deities';
import { EVENT_RULES, DISHA_ORDER } from '@/panchang/eventMuhurat';
import { OBSERVANCE_RULES } from '@/panchang/festivals';
import { VASTU_ROOM_ENTRIES } from '@/data/vastu/roomGuidance';
import { japamMantras } from '@/data/japam';
import { VIDHI_ENTRIES } from '@/data/vidhi';
import { ALIASES } from '../aliases';
import { getAskLexicon } from '../lexicon';

const lex = getAskLexicon();
const has = (type: string, id: string) => lex.entries.some((e) => e.type === type && e.id === id);

test('every registry entry has lexicon coverage', () => {
  for (const d of deities) assert.ok(has('deity', d.id), `deity ${d.id}`);
  for (const r of OBSERVANCE_RULES) assert.ok(has('observance', r.id), `observance ${r.id}`);
  for (const r of EVENT_RULES) assert.ok(has('occasion', r.id), `occasion ${r.id}`);
  for (const d of DISHA_ORDER) assert.ok(has('disha', d), `disha ${d}`);
  for (const r of VASTU_ROOM_ENTRIES) assert.ok(has('room', r.id), `room ${r.id}`);
  for (const m of japamMantras) assert.ok(has('mantra', m.id), `mantra ${m.id}`);
  for (const v of VIDHI_ENTRIES) assert.ok(has('vidhi', v.id), `vidhi ${v.id}`);
});

test('every alias points at an id that exists in its registry', () => {
  const ids: Record<string, Set<string>> = {
    deity: new Set(deities.map((d) => d.id)),
    observance: new Set(OBSERVANCE_RULES.map((r) => r.id)),
    occasion: new Set(EVENT_RULES.map((r) => r.id)),
    disha: new Set(DISHA_ORDER),
    room: new Set(VASTU_ROOM_ENTRIES.map((r) => r.id)),
    mantra: new Set(japamMantras.map((m) => m.id)),
    vidhi: new Set(VIDHI_ENTRIES.map((v) => v.id)),
  };
  for (const [form, type, id] of ALIASES) {
    assert.ok(ids[type].has(id), `alias "${form}" → ${type}:${id} does not exist`);
  }
});

test('observance classes exist and pick up their members from the registry', () => {
  const ek = lex.entries.find((e) => e.id === 'class:ekadashi');
  assert.ok(ek?.isClass);
  assert.ok((ek!.members?.length ?? 0) >= 20, `ekadashi members: ${ek!.members?.length}`);
  assert.ok(ek!.members!.includes('nirjala-ekadashi'));
  const shiv = lex.entries.find((e) => e.id === 'class:shivaratri');
  assert.ok(shiv!.members!.includes('maha-shivaratri'));
  assert.ok(shiv!.members!.includes('masik-shivaratri'));
});

test('every key is folded, non-trivial, and unique per (type,id)', () => {
  const seen = new Set<string>();
  for (const e of lex.entries) {
    assert.ok(e.key.length >= 3, `${e.type}:${e.id} key "${e.key}"`);
    assert.ok(/^[a-z0-9 ]+$/.test(e.key), `${e.type}:${e.id} key not folded: "${e.key}"`);
    const k = `${e.type}:${e.id}:${e.key}`;
    assert.ok(!seen.has(k), `duplicate ${k}`);
    seen.add(k);
  }
});

test('lexicon stays inside the bundle budget (§13.7)', () => {
  const bytes = lex.entries.reduce((n, e) => n + e.key.length + e.id.length + e.label.length, 0);
  assert.ok(bytes < 250_000, `lexicon text ${bytes} B`);
  assert.ok(lex.entries.length > 300, `only ${lex.entries.length} forms`);
});
