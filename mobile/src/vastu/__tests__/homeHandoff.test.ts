/**
 * F0 handoff (PRD-24 Phase 2 US-14): the shared text carries EVERYTHING — the
 * grid, every finding with its weight and accommodation, the framing that
 * forbids a reader from adding to it, and a machine-readable tail that
 * round-trips to the exact assessment model. And it must hold the same stance
 * bar as the screens: no score, no percent, no remedies-register.
 */
import { assessHome } from '../assessHome';
import { buildHomeHandoffText } from '../homeHandoff';
import type { HomeRecord } from '../homeRecord';

const record: HomeRecord = {
  id: 'h1',
  version: 1,
  label: 'Prestige 3BHK, 7वाँ तल',
  kind: 'flat',
  template: 'flat-3bhk',
  role: 'considering',
  facing: 'east',
  doorPada: null,
  rooms: [
    { roomId: 'main-door', ordinal: 1, zone: 'east', via: 'manual', recordedAt: '2026-09-07T10:00:00.000Z' },
    { roomId: 'kitchen', ordinal: 1, zone: 'southeast', via: 'compass', recordedAt: '2026-09-07T10:00:00.000Z' },
    { roomId: 'toilet', ordinal: 1, zone: 'northeast', via: 'manual', recordedAt: '2026-09-07T10:00:00.000Z' },
    { roomId: 'toilet', ordinal: 2, zone: 'northwest', via: 'manual', recordedAt: '2026-09-07T10:00:00.000Z' },
    { roomId: 'puja-room', ordinal: 1, zone: null, via: null, recordedAt: null },
  ],
  createdAt: '2026-09-07T09:00:00.000Z',
  updatedAt: '2026-09-07T10:00:00.000Z',
};

const model = assessHome(record);
const text = buildHomeHandoffText(record, model);

test('every finding appears with its title (ordinals included) and class', () => {
  for (const group of model.groups) {
    for (const finding of group.findings) {
      const title = finding.ordinal > 1 ? `${finding.titleHi} ${finding.ordinal}` : finding.titleHi;
      expect(text).toContain(title);
    }
  }
  expect(text).toContain('शौचालय · स्नानघर 2'); // the ordinal form specifically
});

test('every accommodation the registry carries for these findings travels with the text', () => {
  for (const group of model.groups) {
    for (const finding of group.findings) {
      if (finding.accommodationHi) expect(text).toContain(finding.accommodationHi);
    }
  }
  // The fixture's NE toilet is forbidden — its accommodation must be there.
  expect(text).toContain('जहाँ संभव न हो');
});

test('the framing header instructs a reader to stay inside the findings', () => {
  expect(text).toContain('do not add findings');
  expect(text).toContain('do not suggest remedies');
  expect(text).toContain('NOT a prediction, a score');
});

test('the mandala grid row names each placed room in its zone cell', () => {
  const gridSection = text.slice(text.indexOf('## मंडल'), text.indexOf('## कक्ष-दर-कक्ष'));
  expect(gridSection).toContain('आग्नेय'); // SE cell exists
  const seCell = gridSection.split('\n').find((line) => line.includes('रसोई'));
  expect(seCell).toBeDefined();
  expect(seCell).toContain('आग्नेय');
});

test('weight words render for every measured room', () => {
  expect(text).toContain('विधान');
  expect(text).toMatch(/भार \/ weight/);
});

test('unmeasured rooms are named honestly', () => {
  expect(text).toContain('अभी मापा नहीं (not yet measured)');
});

test('the JSON tail parses and deep-equals the model — the AI grounding object', () => {
  const tail = text.slice(text.indexOf('```json') + 8, text.lastIndexOf('```'));
  expect(JSON.parse(tail.trim())).toEqual(JSON.parse(JSON.stringify(model)));
});

test('stance guard on the whole text: no score/percent/rating/remedy register', () => {
  const prose = text.slice(0, text.indexOf('## Machine-readable'));
  expect(prose).not.toMatch(/\d+\s?%/);
  expect(prose).not.toMatch(/rating/i);
  expect(prose).not.toMatch(/\d+ (of|में से) \d+/);
  expect(prose).not.toMatch(/उपाय|यंत्र/);
  expect(prose).not.toMatch(/खरीद(ें|िए)/);
});

test('privacy line states the map never left the phone by itself', () => {
  expect(text).toContain('This map lives only on that phone');
});
