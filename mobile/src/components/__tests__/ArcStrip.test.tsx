/**
 * पर्व-अर्क strip (PRD-28, design.md §65.2): the compressed strip, the chooser
 * that defaults to nothing, the solved visarjan, the Kanya Pujan hand-off, the
 * verified-only visarjan-vidhi door, and silence for non-arc rules.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';

import ArcStrip, { pickStripOrdinals } from '@/components/ArcStrip';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { GitaLanguageProvider } from '@/data/gita/language';
import { ThemeProvider } from '@/theme/ThemeContext';
import { buildArcOccurrence, ARC_BY_ID } from '@/panchang/arcs';
import { getRuleById } from '@/panchang/vratCatalog';
import type { ArcChoiceState } from '@/panchang/arcChoiceStore';

const mockPermission = { status: 'granted' as string };
jest.mock('@/contexts/NotificationPreferencesContext', () => ({
  useNotificationPreferences: () => ({ permissionStatus: mockPermission.status }),
}));

const mockChoices: { state: ArcChoiceState } = { state: {} };
const mockSave = jest.fn();
const mockClear = jest.fn();
jest.mock('@/panchang/useArcChoices', () => ({
  useArcChoices: () => ({ choices: mockChoices.state, hydrated: true }),
}));
jest.mock('@/panchang/arcChoiceStore', () => {
  const actual = jest.requireActual('@/panchang/arcChoiceStore');
  return {
    ...actual,
    saveArcChoice: (...args: unknown[]) => {
      mockSave(...args);
      return Promise.resolve();
    },
    clearArcChoice: (...args: unknown[]) => {
      mockClear(...args);
      return Promise.resolve();
    },
  };
});

// The visarjan vidhi door is verified-only: default registry = both drafts hidden.
const mockGetVidhiById = jest.fn((_id: string): unknown => null);
jest.mock('@/data/vidhi', () => {
  const actual = jest.requireActual('@/data/vidhi');
  return { ...actual, getVidhiById: (id: string) => mockGetVidhiById(id) };
});

const trees: TestRenderer.ReactTestRenderer[] = [];
afterEach(() => {
  act(() => trees.splice(0).forEach((t) => t.unmount()));
  mockChoices.state = {};
  mockPermission.status = 'granted';
  mockSave.mockClear();
  mockClear.mockClear();
  mockGetVidhiById.mockReset();
  mockGetVidhiById.mockReturnValue(null);
});

const onOpenRule = jest.fn();
const onOpenVidhi = jest.fn();

async function render(ruleId: string, today: Date, lang: 'hi' | 'en' = 'en') {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <FontScaleProvider>
        <ThemeProvider>
          <GitaLanguageProvider initialLang={lang}>
            <ArcStrip rule={getRuleById(ruleId)!} calendarSystem="purnimant" today={today} onOpenRule={onOpenRule} onOpenVidhi={onOpenVidhi} />
          </GitaLanguageProvider>
        </ThemeProvider>
      </FontScaleProvider>
    );
  });
  trees.push(tree);
  return tree;
}

const allText = (tree: TestRenderer.ReactTestRenderer) =>
  tree.root
    .findAllByType(Text)
    .map((n) => (Array.isArray(n.props.children) ? n.props.children.join('') : String(n.props.children)))
    .join('\n');
const has = (tree: TestRenderer.ReactTestRenderer, testID: string) => tree.root.findAllByProps({ testID }).length > 0;
const byId = (tree: TestRenderer.ReactTestRenderer, testID: string) => tree.root.findAllByProps({ testID })[0];
const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

describe('pickStripOrdinals', () => {
  test('keeps first, last, labelled/rule-bound days and today, with a gap marker between non-adjacent picks', () => {
    const occ = buildArcOccurrence(ARC_BY_ID.get('ganesh-utsav')!, d(2026, 9, 14), 10); // 12 days, rules on 1 and 12
    expect(pickStripOrdinals(occ, 4)).toEqual([1, 'gap', 4, 'gap', 12]);
    expect(pickStripOrdinals(occ, null)).toEqual([1, 'gap', 12]);
    expect(pickStripOrdinals(occ, 2)).toEqual([1, 2, 'gap', 12]);
    const diwali = buildArcOccurrence(ARC_BY_ID.get('deepavali')!, d(2026, 11, 7), null);
    expect(pickStripOrdinals(diwali, 2)).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('ArcStrip', () => {
  test('renders nothing for a rule outside every arc', async () => {
    const tree = await render('holi', d(2026, 9, 3));
    expect(tree.toJSON()).toBeNull();
  });

  test('Ganesh, unchosen: chooser with NO selected option, no visarjan row, honest "day N" without a total', async () => {
    const tree = await render('ganesh-chaturthi', d(2026, 9, 17));
    expect(has(tree, 'observance-arc-strip')).toBe(true);
    expect(has(tree, 'arc-duration-chooser')).toBe(true);
    expect(has(tree, 'arc-visarjan-row')).toBe(false);
    for (const dur of [1.5, 3, 5, 7, 10]) {
      expect(byId(tree, `arc-duration-${dur}`).props.accessibilityState).toEqual({ selected: false });
    }
    const text = allText(tree);
    expect(text).toContain('How many days will the murti stay?');
    expect(text).toContain('it never recommends one');
    expect(text).toContain('Today is day 4');
    expect(text).not.toMatch(/day 4 of/);
    expect(text).not.toContain('Visarjan');
  });

  test('tapping a duration saves an occurrence-scoped choice; tapping the selected one clears it; "Decide later" clears', async () => {
    const tree = await render('ganesh-chaturthi', d(2026, 9, 10));
    await act(async () => byId(tree, 'arc-duration-5').props.onPress());
    expect(mockSave).toHaveBeenCalledWith('ganesh-utsav', '2026-09-14', 5);
    mockChoices.state = { 'ganesh-utsav': { dateKey: '2026-09-14', durationDays: 5 } };
    const chosen = await render('ganesh-chaturthi', d(2026, 9, 10));
    expect(byId(chosen, 'arc-duration-5').props.accessibilityState).toEqual({ selected: true });
    await act(async () => byId(chosen, 'arc-duration-5').props.onPress());
    expect(mockClear).toHaveBeenCalledWith('ganesh-utsav');
    await act(async () => byId(chosen, 'arc-duration-later').props.onPress());
    expect(mockClear).toHaveBeenCalledTimes(2);
  });

  test('Ganesh, 5 days chosen: the solved visarjan (Fri 18 Sep 2026), 5 slots, remaining count, reminder note only when permission granted', async () => {
    mockChoices.state = { 'ganesh-utsav': { dateKey: '2026-09-14', durationDays: 5 } };
    const tree = await render('ganesh-chaturthi', d(2026, 9, 16));
    const text = allText(tree);
    expect(has(tree, 'arc-visarjan-row')).toBe(true);
    expect(text).toContain('Your visarjan');
    expect(text).toContain('Friday · 18 Sep');
    expect(text).toContain('Today is day 3 of 5');
    expect(text).toContain('2 left');
    expect(text).toContain('Reminder: 6 PM the evening before and 7 AM on the day.');
    expect(has(tree, 'arc-slot-5')).toBe(true);
    expect(has(tree, 'arc-slot-12')).toBe(false);

    mockPermission.status = 'denied';
    const quiet = await render('ganesh-chaturthi', d(2026, 9, 16));
    expect(allText(quiet)).not.toContain('Reminder:');
  });

  test('a stale choice from another year does not bind: this year renders unchosen', async () => {
    mockChoices.state = { 'ganesh-utsav': { dateKey: '2025-08-27', durationDays: 10 } };
    const tree = await render('ganesh-chaturthi', d(2026, 9, 15));
    expect(has(tree, 'arc-visarjan-row')).toBe(false);
    expect(byId(tree, 'arc-duration-10').props.accessibilityState).toEqual({ selected: false });
  });

  test('the chooser lives on the sthapana rule only — Anant Chaturdashi shows the arc, not the chooser', async () => {
    mockChoices.state = { 'ganesh-utsav': { dateKey: '2026-09-14', durationDays: 10 } };
    const tree = await render('anant-chaturdashi', d(2026, 9, 25));
    expect(has(tree, 'observance-arc-strip')).toBe(true);
    expect(has(tree, 'arc-duration-chooser')).toBe(false);
    expect(allText(tree)).toContain('Visarjan today');
    expect(allText(tree)).toContain('Today is day 12 of 12');
  });

  test('Diwali: five named days, day 2 labelled Naraka Chaturdashi, other rule-bound days open their own detail', async () => {
    const tree = await render('diwali', d(2026, 11, 8));
    const text = allText(tree);
    expect(text).toContain('Dhanteras');
    expect(text).toContain('Naraka Chaturdashi');
    expect(text).toContain('Govardhan Puja');
    expect(text).toContain('Bhai Dooj');
    expect(text).toContain('Today is day 2 of 5');
    expect(has(tree, 'arc-duration-chooser')).toBe(false);
    await act(async () => byId(tree, 'arc-slot-1').props.onPress());
    expect(onOpenRule).toHaveBeenCalledWith('dhanteras');
    // The current rule's own slot is not a button; the gap day has no rule to open.
    expect(byId(tree, 'arc-slot-3').props.onPress).toBeUndefined();
    expect(byId(tree, 'arc-slot-2').props.onPress).toBeUndefined();
  });

  test('Navratri: the Kanya Pujan preparation hand-off surfaces on the eve, opens the shipped vidhi keyed to the sthapana date, and is absent otherwise', async () => {
    const eve = await render('navratri-start', d(2026, 10, 20));
    expect(has(eve, 'arc-prepare-row')).toBe(true);
    expect(allText(eve)).toContain('Prepare for Kanya Pujan');
    expect(allText(eve)).toContain('as your family keeps it');
    await act(async () => byId(eve, 'arc-prepare-row').props.onPress());
    expect(onOpenVidhi).toHaveBeenCalledWith('navratri-ghatasthapana', d(2026, 10, 11).getTime());

    const early = await render('navratri-start', d(2026, 10, 13));
    expect(has(early, 'arc-prepare-row')).toBe(false);
    const dashami = await render('dussehra', d(2026, 10, 21));
    expect(has(dashami, 'arc-prepare-row')).toBe(false);
    expect(allText(dashami)).toContain('Visarjan today');
  });

  test('visarjan vidhi door: absent while the entry is draft (registry returns null); present on the eve/day once verified', async () => {
    mockChoices.state = { 'ganesh-utsav': { dateKey: '2026-09-14', durationDays: 5 } };
    const draft = await render('ganesh-chaturthi', d(2026, 9, 18));
    expect(has(draft, 'arc-visarjan-vidhi')).toBe(false);

    const { ALL_VIDHI_ENTRIES } = jest.requireActual('@/data/vidhi');
    const verified = { ...ALL_VIDHI_ENTRIES.find((v: { id: string }) => v.id === 'ganesh-visarjan-uttar-puja'), status: 'verified' };
    mockGetVidhiById.mockImplementation((id) => (id === 'ganesh-visarjan-uttar-puja' ? verified : null));
    const day = await render('ganesh-chaturthi', d(2026, 9, 18));
    expect(has(day, 'arc-visarjan-vidhi')).toBe(true);
    expect(allText(day)).toContain('Ganesh Visarjan · Uttar Puja');
    await act(async () => byId(day, 'arc-visarjan-vidhi').props.onPress());
    expect(onOpenVidhi).toHaveBeenCalledWith('ganesh-visarjan-uttar-puja', d(2026, 9, 18).getTime());
    const eve = await render('ganesh-chaturthi', d(2026, 9, 17));
    expect(has(eve, 'arc-visarjan-vidhi')).toBe(true);
    const tooEarly = await render('ganesh-chaturthi', d(2026, 9, 15));
    expect(has(tooEarly, 'arc-visarjan-vidhi')).toBe(false);
  });

  test('Hindi renders Devanagari numerals and the stance copy', async () => {
    mockChoices.state = { 'ganesh-utsav': { dateKey: '2026-09-14', durationDays: 3 } };
    const tree = await render('ganesh-chaturthi', d(2026, 9, 15), 'hi');
    const text = allText(tree);
    expect(text).toContain('कितने दिन विराजेंगे?');
    expect(text).toContain('सुझाव नहीं देता');
    expect(text).toContain('आज दिन २ / ३');
    expect(text).toContain('आपका विसर्जन');
    expect(text).toContain('डेढ़ दिन');
  });
});
