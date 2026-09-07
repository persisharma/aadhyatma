/**
 * Assessment engine pins (PRD-24 Phase 2 §C3/§6/§7): every class reachable,
 * the frozen group order, registry order within a group, all-six counts with
 * zeros preserved, serde round-trip (no Date instances), and the draft rule —
 * a room that is not verified is never judged.
 */
import {
  FINDING_CLASS_ORDER,
  assessHome,
  classifyPlacement,
} from '../assessHome';
import type { HomeRecord } from '../homeRecord';
import { getVastuRoomEntries, getVastuRoomEntry } from '@/data/vastu/roomGuidance';

const record = (rooms: HomeRecord['rooms'], over: Partial<HomeRecord> = {}): HomeRecord => ({
  id: 'h1',
  version: 1,
  label: 'Prestige 3BHK',
  kind: 'flat',
  template: 'flat-3bhk',
  role: 'considering',
  facing: 'east',
  rooms,
  createdAt: '2026-09-06T09:00:00.000Z',
  updatedAt: '2026-09-06T09:00:00.000Z',
  ...over,
});

const place = (roomId: string, zone: HomeRecord['rooms'][number]['zone'], ordinal = 1) => ({
  roomId,
  ordinal,
  zone,
  via: zone === null ? null : ('manual' as const),
  recordedAt: zone === null ? null : '2026-09-06T10:00:00.000Z',
});

describe('classifyPlacement (§0.2 — five classes and not a sixth)', () => {
  const kitchen = getVastuRoomEntry('kitchen')!;
  const toilet = getVastuRoomEntry('toilet')!;
  const tulsi = getVastuRoomEntry('tulsi')!;

  test('every class is reachable', () => {
    expect(classifyPlacement(kitchen, 'southeast')).toBe('in-keeping');
    expect(classifyPlacement(kitchen, 'northwest')).toBe('alternate');
    expect(classifyPlacement(toilet, 'northeast')).toBe('forbidden');
    expect(classifyPlacement(toilet, 'center')).toBe('forbidden');
    expect(classifyPlacement(kitchen, 'south')).toBe('differs'); // vidhana, in no set
    expect(classifyPlacement(tulsi, 'south')).toBe('preferred-unmet'); // shreyas, in no set
    expect(classifyPlacement(kitchen, null)).toBe('unmeasured');
  });

  test('the centre entry reads center as in keeping, anything else as differs', () => {
    const brahmasthan = getVastuRoomEntry('brahmasthan')!;
    expect(classifyPlacement(brahmasthan, 'center')).toBe('in-keeping');
    expect(classifyPlacement(brahmasthan, 'north')).toBe('differs');
  });
});

describe('assessHome model', () => {
  const model = assessHome(
    record([
      place('toilet', 'northeast'), // forbidden
      place('kitchen', 'south'), // differs
      place('tulsi', 'west'), // preferred-unmet
      place('kitchen', 'northwest', 2), // alternate
      place('puja-room', 'northeast'), // in-keeping
      place('main-door', null), // unmeasured
    ])
  );

  test('groups appear in the frozen order, only non-empty groups render', () => {
    expect(model.groups.map((g) => g.cls)).toEqual([
      'forbidden',
      'differs',
      'preferred-unmet',
      'alternate',
      'in-keeping',
      'unmeasured',
    ]);
    expect(FINDING_CLASS_ORDER).toEqual([
      'forbidden',
      'differs',
      'preferred-unmet',
      'alternate',
      'in-keeping',
      'unmeasured',
    ]);
  });

  test('all six counts are present — a zero is information, not absence', () => {
    const zeroModel = assessHome(record([place('kitchen', 'southeast')]));
    expect(Object.keys(zeroModel.counts).sort()).toEqual([...FINDING_CLASS_ORDER].sort());
    expect(zeroModel.counts.forbidden).toBe(0);
    expect(zeroModel.counts['in-keeping']).toBe(1);
  });

  test('registry order within a group, ordinal breaking ties', () => {
    const entries = getVastuRoomEntries().map((e) => e.id);
    const multi = assessHome(
      record([
        place('toilet', 'northwest', 2),
        place('toilet', 'northwest', 1),
        place('kitchen', 'southeast'),
      ])
    );
    const inKeeping = multi.groups.find((g) => g.cls === 'in-keeping')!;
    const ids = inKeeping.findings.map((f) => `${f.roomId}-${f.ordinal}`);
    expect(ids).toEqual(['kitchen-1', 'toilet-1', 'toilet-2']);
    expect(entries.indexOf('kitchen')).toBeLessThan(entries.indexOf('toilet'));
  });

  test('the model serialises round-trip with no Date instances', () => {
    const back = JSON.parse(JSON.stringify(model));
    expect(back).toEqual(model);
  });

  test('a draft room is never judged — its placement is simply absent', () => {
    const withDraft = assessHome(
      record([place('kitchen', 'southeast'), place('master-bed', 'southwest')])
    );
    expect(withDraft.groups.flatMap((g) => g.findings.map((f) => f.roomId))).toEqual(['kitchen']);
  });

  test('accommodation text rides forbidden/differs findings where the row states one', () => {
    const forbidden = model.groups.find((g) => g.cls === 'forbidden')!.findings[0];
    expect(forbidden.roomId).toBe('toilet');
    expect(forbidden.accommodationHi).toBeTruthy();
  });

  test('the sketch point rides the finding untouched and unjudged', () => {
    const withAt = assessHome(
      record([{ ...place('kitchen', 'southeast'), at: { fx: 0.25, fy: 0.7 } }])
    );
    const finding = withAt.groups[0].findings[0];
    expect(finding.at).toEqual({ fx: 0.25, fy: 0.7 });
    expect(finding.cls).toBe('in-keeping');
  });
});
