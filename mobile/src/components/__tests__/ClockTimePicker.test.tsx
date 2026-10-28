import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { ThemeProvider } from '@/theme/ThemeContext';
import ClockTimePicker from '../ClockTimePicker';

/**
 * The birth-time picker reuses the reminder stepper's HR/MIN columns in 24-hour
 * form. HR/MIN step the underlying minute-of-day; the emitted value is always
 * zero-padded 24-hour `HH:mm`.
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
  test('renders the 24-hour value with no meridiem', async () => {
    const tree = await renderPicker('17:42', () => {});
    const text = displayedTexts(tree);
    expect(text).toContain('17');
    expect(text).toContain('42');
    expect(text).not.toMatch(/AM|PM/);
    await act(async () => tree.unmount());
  });

  test('pads a morning hour to two digits', async () => {
    const tree = await renderPicker('05:42', () => {});
    expect(displayedTexts(tree)).toContain('05');
    await act(async () => tree.unmount());
  });

  test('stepping the hour up adds one clock hour and can cross noon', async () => {
    const onChange = jest.fn();
    const tree = await renderPicker('11:42', onChange);
    await act(async () => press(tree, 'Increase Hour').props.onPress());
    expect(onChange).toHaveBeenCalledWith('12:42');
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
});
