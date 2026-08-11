import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { ThemeProvider } from '@/theme/ThemeContext';
import ClockTimePicker from '../ClockTimePicker';

/**
 * The AM/PM birth-time picker reuses the reminder stepper's HR/MIN columns and
 * adds a period toggle. HR/MIN step the underlying 24-hour minute-of-day; the
 * 12-hour display and AM/PM are derived from it, and the toggle shifts ±12h.
 * The emitted value is always zero-padded 24-hour `HH:mm`.
 */

async function renderPicker(
  value: string,
  onChange: (next: string) => void
): Promise<TestRenderer.ReactTestRenderer> {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <FontScaleProvider>
        <ThemeProvider>
          <ClockTimePicker value={value} onChange={onChange} label="Birth time" />
        </ThemeProvider>
      </FontScaleProvider>
    );
  });
  return tree;
}

function press(tree: TestRenderer.ReactTestRenderer, label: string) {
  const node = tree.root
    .findAll((n) => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function')
    .at(0);
  if (!node) throw new Error(`No pressable labelled "${label}"`);
  return node;
}

function displayedTexts(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((n) => n.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

describe('ClockTimePicker', () => {
  test('renders the 12-hour display of a 24-hour value', async () => {
    const tree = await renderPicker('05:42', () => {});
    const text = displayedTexts(tree);
    expect(text).toContain('5');
    expect(text).toContain('42');
    expect(text).toContain('AM');
    await act(async () => tree.unmount());
  });

  test('stepping the hour up adds one clock hour and can cross noon', async () => {
    const onChange = jest.fn();
    const tree = await renderPicker('11:42', onChange);
    await act(async () => press(tree, 'Increase Hour').props.onPress());
    expect(onChange).toHaveBeenCalledWith('12:42'); // 11 AM -> 12 PM
    await act(async () => tree.unmount());
  });

  test('stepping the minute down subtracts one minute', async () => {
    const onChange = jest.fn();
    const tree = await renderPicker('05:42', onChange);
    await act(async () => press(tree, 'Decrease Minute').props.onPress());
    expect(onChange).toHaveBeenCalledWith('05:41');
    await act(async () => tree.unmount());
  });

  test('minute wraps into the next hour', async () => {
    const onChange = jest.fn();
    const tree = await renderPicker('05:59', onChange);
    await act(async () => press(tree, 'Increase Minute').props.onPress());
    expect(onChange).toHaveBeenCalledWith('06:00');
    await act(async () => tree.unmount());
  });

  test('hour wraps across midnight', async () => {
    const onChange = jest.fn();
    const tree = await renderPicker('23:30', onChange);
    await act(async () => press(tree, 'Increase Hour').props.onPress());
    expect(onChange).toHaveBeenCalledWith('00:30');
    await act(async () => tree.unmount());
  });

  test('toggling period shifts an AM time to PM', async () => {
    const onChange = jest.fn();
    const tree = await renderPicker('05:42', onChange);
    await act(async () => press(tree, 'Toggle AM/PM').props.onPress());
    expect(onChange).toHaveBeenCalledWith('17:42'); // 5 AM -> 5 PM
    await act(async () => tree.unmount());
  });

  test('12 AM (midnight) toggles to 12 PM (noon)', async () => {
    const onChange = jest.fn();
    const tree = await renderPicker('00:15', onChange);
    // Displayed as 12 AM.
    expect(displayedTexts(tree)).toContain('12');
    await act(async () => press(tree, 'Toggle AM/PM').props.onPress());
    expect(onChange).toHaveBeenCalledWith('12:15');
    await act(async () => tree.unmount());
  });

  test('12 PM (noon) toggles to 12 AM (midnight)', async () => {
    const onChange = jest.fn();
    const tree = await renderPicker('12:00', onChange);
    await act(async () => press(tree, 'Toggle AM/PM').props.onPress());
    expect(onChange).toHaveBeenCalledWith('00:00');
    await act(async () => tree.unmount());
  });
});
