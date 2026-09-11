/**
 * मेरा घर record: pure parse/serialize invariants (PRD-24 Phase 2 §C2/§6).
 */
import {
  EMPTY_HOME_ROSTER,
  HOME_ROSTER_CAP,
  parseHomeRoster,
  removeHome,
  serializeHomeRoster,
  upsertHome,
  type HomeRecord,
  type HomeRecordValidators,
} from '../homeRecord';

const validators: HomeRecordValidators = {
  isRoomKnown: (id) => id !== 'retired-room',
  isTemplateKnown: (id) => id === 'flat-3bhk' || id === 'custom',
};

const home = (over: Partial<HomeRecord> = {}): HomeRecord => ({
  id: 'h1',
  version: 1,
  label: 'हमारा घर',
  kind: 'flat',
  template: 'flat-3bhk',
  role: 'considering',
  facing: 'east',
  doorPada: null,
  rooms: [
    { roomId: 'kitchen', ordinal: 1, zone: 'southeast', via: 'manual', recordedAt: '2026-09-06T10:00:00.000Z', at: { fx: 0.4, fy: 0.6 } },
    { roomId: 'toilet', ordinal: 1, zone: null, via: null, recordedAt: null },
  ],
  createdAt: '2026-09-06T09:00:00.000Z',
  updatedAt: '2026-09-06T10:00:00.000Z',
  ...over,
});

describe('serde round-trip', () => {
  test('a roster survives serialize → parse byte-identically', () => {
    const roster = upsertHome(EMPTY_HOME_ROSTER, home());
    const back = parseHomeRoster(serializeHomeRoster(roster), validators);
    expect(back).toEqual(roster);
  });

  test('null, garbage, and non-object payloads yield the empty roster', () => {
    expect(parseHomeRoster(null, validators)).toEqual(EMPTY_HOME_ROSTER);
    expect(parseHomeRoster('not json', validators)).toEqual(EMPTY_HOME_ROSTER);
    expect(parseHomeRoster('42', validators)).toEqual(EMPTY_HOME_ROSTER);
  });

  test('an unknown payload version is treated as absent (never migrated, never crashed)', () => {
    const raw = JSON.stringify({ version: 2, homes: [home()], livingId: 'h1' });
    expect(parseHomeRoster(raw, validators)).toEqual(EMPTY_HOME_ROSTER);
  });
});

describe('retired ids and validation (drop, never a crash)', () => {
  test('a placement with a retired room id is dropped; the home survives', () => {
    const raw = serializeHomeRoster(
      upsertHome(EMPTY_HOME_ROSTER, home({ rooms: [...home().rooms, { roomId: 'retired-room', ordinal: 1, zone: 'north', via: 'manual', recordedAt: null }] }))
    );
    const back = parseHomeRoster(raw, validators);
    expect(back.homes[0].rooms.map((r) => r.roomId)).toEqual(['kitchen', 'toilet']);
  });

  test('an unknown template falls back to custom with placements intact', () => {
    const raw = serializeHomeRoster(upsertHome(EMPTY_HOME_ROSTER, home({ template: 'flat-9bhk' })));
    const back = parseHomeRoster(raw, validators);
    expect(back.homes[0].template).toBe('custom');
    expect(back.homes[0].rooms).toHaveLength(2);
  });

  test('an invalid zone or facing is nulled; sketch point is clamped to 0–1', () => {
    const raw = JSON.stringify({
      version: 1,
      livingId: null,
      homes: [home({ facing: 'up' as never, rooms: [{ roomId: 'kitchen', ordinal: 1, zone: 'below', via: 'manual', recordedAt: 'x', at: { fx: 4, fy: -1 } }] as never })],
    });
    const back = parseHomeRoster(raw, validators);
    expect(back.homes[0].facing).toBeNull();
    expect(back.homes[0].rooms[0].zone).toBeNull();
    expect(back.homes[0].rooms[0].via).toBeNull();
    expect(back.homes[0].rooms[0].at).toEqual({ fx: 1, fy: 0 });
  });
});

describe('roster invariants', () => {
  test('the cap holds at 12 — the newest upsert wins, the oldest falls off', () => {
    let roster = EMPTY_HOME_ROSTER;
    for (let i = 1; i <= HOME_ROSTER_CAP + 2; i += 1) {
      roster = upsertHome(roster, home({ id: `h${i}` }));
    }
    expect(roster.homes).toHaveLength(HOME_ROSTER_CAP);
    expect(roster.homes[0].id).toBe(`h${HOME_ROSTER_CAP + 2}`);
    expect(roster.homes.some((h) => h.id === 'h1')).toBe(false);
  });

  test('saving a living home claims livingId; deleting it clears it', () => {
    let roster = upsertHome(EMPTY_HOME_ROSTER, home({ id: 'a', role: 'living' }));
    expect(roster.livingId).toBe('a');
    roster = upsertHome(roster, home({ id: 'b' }));
    expect(roster.livingId).toBe('a');
    roster = removeHome(roster, 'a');
    expect(roster.livingId).toBeNull();
    expect(roster.homes.map((h) => h.id)).toEqual(['b']);
  });

  test('a livingId pointing at a missing home is dropped on parse', () => {
    const raw = JSON.stringify({ version: 1, homes: [home()], livingId: 'ghost' });
    expect(parseHomeRoster(raw, validators).livingId).toBeNull();
  });
});

describe('doorPada (PRD-24 Phase 2 §A5)', () => {
  test('a valid 1–32 pada round-trips; legacy payloads without one read null', () => {
    const raw = JSON.stringify({ version: 1, homes: [{ ...home(), doorPada: 17 }], livingId: null });
    expect(parseHomeRoster(raw, validators).homes[0]!.doorPada).toBe(17);
    const legacy = home() as Record<string, unknown>;
    delete legacy.doorPada;
    const legacyRaw = JSON.stringify({ version: 1, homes: [legacy], livingId: null });
    expect(parseHomeRoster(legacyRaw, validators).homes[0]!.doorPada).toBeNull();
  });

  test('out-of-range or non-integer padas are nulled, never a crash', () => {
    for (const bad of [0, 33, -4, 3.5, '12', {}]) {
      const raw = JSON.stringify({ version: 1, homes: [{ ...home(), doorPada: bad }], livingId: null });
      expect(parseHomeRoster(raw, validators).homes[0]!.doorPada).toBeNull();
    }
  });
});
