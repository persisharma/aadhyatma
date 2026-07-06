import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { ThemeProvider } from '@/theme/ThemeContext';
import {
  localDateKey,
  nextAlarmFireTimestamp,
} from '@/notifications/japamAlarms';
import type { JapamAlarm } from '@/notifications/japamAlarms';

/**
 * Drives the AlarmEditorSheet the way a user would: toggle repeat-day chips,
 * type a label, arm skip-next, confirm — and asserts the draft/patch payload
 * handed to onCreate/onSave. This is the JS-level twin of the Maestro flow
 * (.maestro/japam-alarms-e2e.yaml), runnable without a device.
 */

jest.mock('expo-linear-gradient', () => {
  const r = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...p }: Record<string, unknown>) =>
      r.createElement(View, p, children),
  };
});
// The screen module pulls the alarms context for its list screen; the editor
// under test receives everything via props, so a bare stub suffices.
jest.mock('@/contexts/JapamAlarmsContext', () => ({
  useJapamAlarms: () => ({
    alarms: [],
    permissionStatus: 'granted',
    canAdd: true,
    addAlarm: jest.fn(),
    updateAlarm: jest.fn(),
    toggleAlarm: jest.fn(),
    removeAlarm: jest.fn(),
  }),
}));

const { GitaLanguageProvider } = jest.requireActual<
  typeof import('@/data/gita/language')
>('@/data/gita/language');
const { AlarmEditorSheet } = jest.requireActual<
  typeof import('../JapamAlarmsScreen')
>('../JapamAlarmsScreen');

type SheetProps = React.ComponentProps<typeof AlarmEditorSheet>;

const mounted: TestRenderer.ReactTestRenderer[] = [];

afterEach(async () => {
  // Unmount everything so the sheet's countdown interval is cleared before
  // the Jest environment tears down.
  while (mounted.length > 0) {
    const tree = mounted.pop()!;
    await act(async () => {
      tree.unmount();
    });
  }
});

async function renderSheet(
  props: Partial<SheetProps> & Pick<SheetProps, 'state'>
): Promise<TestRenderer.ReactTestRenderer> {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <FontScaleProvider>
        <ThemeProvider>
          <GitaLanguageProvider initialLang="en">
            <AlarmEditorSheet
              onClose={jest.fn()}
              onCreate={jest.fn()}
              onSave={jest.fn()}
              {...props}
            />
          </GitaLanguageProvider>
        </ThemeProvider>
      </FontScaleProvider>
    );
  });
  mounted.push(tree);
  return tree;
}

function byLabel(tree: TestRenderer.ReactTestRenderer, label: string) {
  const node = tree.root
    .findAll((n) => n.props.accessibilityLabel === label)
    .at(0);
  if (!node) throw new Error(`No node with accessibilityLabel "${label}"`);
  return node;
}

function textContents(tree: TestRenderer.ReactTestRenderer): string[] {
  return tree.root
    .findAllByType(Text)
    .map((n) =>
      Array.isArray(n.props.children)
        ? n.props.children.join('')
        : String(n.props.children ?? '')
    );
}

const editAlarm = (extra: Partial<JapamAlarm> = {}): JapamAlarm => ({
  id: 'a1',
  mantraId: 'om-namah-shivaya',
  time: { hour: 6, minute: 0 },
  enabled: true,
  ...extra,
});

describe('AlarmEditorSheet — repeat days, label, once', () => {
  test('new alarm defaults to daily; deselecting weekend days yields a Weekdays draft with a label', async () => {
    const onCreate = jest.fn();
    const tree = await renderSheet({ state: { kind: 'new' }, onCreate });

    // All 7 chips render, all selected (checked) by default.
    const sunday = byLabel(tree, 'Repeat Sunday');
    const saturday = byLabel(tree, 'Repeat Saturday');
    expect(sunday.props.accessibilityState).toEqual({ checked: true });

    await act(async () => {
      sunday.props.onPress();
    });
    await act(async () => {
      saturday.props.onPress();
    });
    expect(textContents(tree).some((t) => t.startsWith('Weekdays'))).toBe(true);

    await act(async () => {
      byLabel(tree, 'Alarm label').props.onChangeText('  Morning Japa  ');
    });
    await act(async () => {
      byLabel(tree, 'Confirm alarm').props.onPress();
    });

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCreate).toHaveBeenCalledWith({
      mantraId: expect.any(String),
      time: { hour: 6, minute: 0 },
      label: 'Morning Japa',
      repeatDays: [1, 2, 3, 4, 5],
    });
  });

  test('deselecting every day makes a one-time draft (repeatDays: []) and says so', async () => {
    const onCreate = jest.fn();
    const tree = await renderSheet({ state: { kind: 'new' }, onCreate });

    for (const day of [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
    ]) {
      await act(async () => {
        byLabel(tree, `Repeat ${day}`).props.onPress();
      });
    }
    expect(
      textContents(tree).some((t) => t.includes('turns off after ringing'))
    ).toBe(true);

    await act(async () => {
      byLabel(tree, 'Confirm alarm').props.onPress();
    });
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ repeatDays: [] })
    );
  });

  test('new-alarm editor offers no skip-next control', async () => {
    const tree = await renderSheet({ state: { kind: 'new' } });
    expect(
      tree.root.findAll((n) => n.props.accessibilityLabel === 'Skip next alarm')
    ).toHaveLength(0);
  });
});

describe('AlarmEditorSheet — edit mode & skip-next', () => {
  test('arming skip-next saves the next occurrence date; repeat stays daily', async () => {
    const onSave = jest.fn();
    const alarm = editAlarm();
    const tree = await renderSheet({ state: { kind: 'edit', alarm }, onSave });

    await act(async () => {
      byLabel(tree, 'Skip next alarm').props.onPress();
    });
    await act(async () => {
      byLabel(tree, 'Confirm alarm').props.onPress();
    });

    const expectedSkip = localDateKey(
      new Date(nextAlarmFireTimestamp({ time: alarm.time }, new Date()))
    );
    expect(onSave).toHaveBeenCalledWith('a1', {
      mantraId: alarm.mantraId,
      time: alarm.time,
      label: '',
      repeatDays: null,
      skipNextDate: expectedSkip,
    });
  });

  test('a one-time alarm being edited hides the skip-next control', async () => {
    const tree = await renderSheet({
      state: { kind: 'edit', alarm: editAlarm({ repeatDays: [] }) },
    });
    expect(
      tree.root.findAll((n) => n.props.accessibilityLabel === 'Skip next alarm')
    ).toHaveLength(0);
  });

  test('an existing weekly selection hydrates the chips', async () => {
    const tree = await renderSheet({
      state: { kind: 'edit', alarm: editAlarm({ repeatDays: [2, 4] }) },
    });
    expect(byLabel(tree, 'Repeat Tuesday').props.accessibilityState).toEqual({
      checked: true,
    });
    expect(byLabel(tree, 'Repeat Sunday').props.accessibilityState).toEqual({
      checked: false,
    });
    expect(textContents(tree).some((t) => t.startsWith('Tue, Thu'))).toBe(true);
  });
});
