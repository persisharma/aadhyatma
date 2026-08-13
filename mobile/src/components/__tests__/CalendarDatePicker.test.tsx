import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { ThemeProvider } from '@/theme/ThemeContext';
import CalendarDatePicker from '../CalendarDatePicker';

/**
 * The birth-date calendar emits the same `YYYY-MM-DD` string the old text field
 * did. Days are labelled "<d> <Month> <year>" in English for stable a11y/Maestro
 * targeting regardless of the reading language.
 */

async function renderPicker(props: Partial<React.ComponentProps<typeof CalendarDatePicker>> = {}) {
  const onSelect = jest.fn();
  const onClose = jest.fn();
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <FontScaleProvider>
        <ThemeProvider>
          <CalendarDatePicker
            visible
            value="1992-08-14"
            lang="en"
            minDate="1900-01-01"
            maxDate="2026-08-11"
            onSelect={onSelect}
            onClose={onClose}
            {...props}
          />
        </ThemeProvider>
      </FontScaleProvider>
    );
  });
  return { tree, onSelect, onClose };
}

function find(tree: TestRenderer.ReactTestRenderer, label: string) {
  return tree.root
    .findAll((n) => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function')
    .at(0);
}

function exists(tree: TestRenderer.ReactTestRenderer, label: string): boolean {
  return tree.root.findAll((n) => n.props.accessibilityLabel === label).length > 0;
}

describe('CalendarDatePicker', () => {
  test('lands on the value’s month and marks the selected day', async () => {
    const { tree } = await renderPicker();
    expect(exists(tree, 'August 1992, tap to change year')).toBe(true);
    const day = find(tree, '14 August 1992');
    expect(day).toBeTruthy();
    expect(day!.props.accessibilityState.selected).toBe(true);
    await act(async () => tree.unmount());
  });

  test('selecting a day and confirming emits YYYY-MM-DD', async () => {
    const { tree, onSelect } = await renderPicker();
    await act(async () => find(tree, '20 August 1992')!.props.onPress());
    await act(async () => find(tree, 'Confirm date')!.props.onPress());
    expect(onSelect).toHaveBeenCalledWith('1992-08-20');
    await act(async () => tree.unmount());
  });

  test('the month arrows page forward', async () => {
    const { tree } = await renderPicker();
    await act(async () => find(tree, 'Next month')!.props.onPress());
    expect(exists(tree, 'September 1992, tap to change year')).toBe(true);
    await act(async () => tree.unmount());
  });

  test('the year jump moves the calendar across decades', async () => {
    const { tree, onSelect } = await renderPicker();
    await act(async () => find(tree, 'August 1992, tap to change year')!.props.onPress());
    await act(async () => find(tree, 'Year 1970')!.props.onPress());
    expect(exists(tree, 'August 1970, tap to change year')).toBe(true);
    await act(async () => find(tree, '15 August 1970')!.props.onPress());
    await act(async () => find(tree, 'Confirm date')!.props.onPress());
    expect(onSelect).toHaveBeenCalledWith('1970-08-15');
    await act(async () => tree.unmount());
  });

  test('the month strip jumps within the chosen year', async () => {
    const { tree, onSelect } = await renderPicker();
    await act(async () => find(tree, 'August 1992, tap to change year')!.props.onPress()); // open overlay
    await act(async () => find(tree, 'Month February')!.props.onPress()); // month -> Feb, overlay stays open
    await act(async () => find(tree, 'Year 1992')!.props.onPress()); // year -> close overlay
    expect(exists(tree, 'February 1992, tap to change year')).toBe(true);
    await act(async () => find(tree, '10 February 1992')!.props.onPress());
    await act(async () => find(tree, 'Confirm date')!.props.onPress());
    expect(onSelect).toHaveBeenCalledWith('1992-02-10');
    await act(async () => tree.unmount());
  });

  test('days after maxDate are disabled and non-selectable', async () => {
    const { tree, onSelect } = await renderPicker({ value: '2026-08-05' });
    const future = tree.root
      .findAll((n) => n.props.accessibilityLabel === '12 August 2026')
      .at(0);
    expect(future!.props.accessibilityState.disabled).toBe(true);
    expect(future!.props.disabled).toBe(true);
    // Confirm without a fresh pick keeps the original in-range value.
    await act(async () => find(tree, 'Confirm date')!.props.onPress());
    expect(onSelect).toHaveBeenCalledWith('2026-08-05');
    await act(async () => tree.unmount());
  });

  test('the leap day is reachable in a leap year', async () => {
    const { tree, onSelect } = await renderPicker({ value: '1992-02-10' });
    await act(async () => find(tree, '29 February 1992')!.props.onPress());
    await act(async () => find(tree, 'Confirm date')!.props.onPress());
    expect(onSelect).toHaveBeenCalledWith('1992-02-29');
    await act(async () => tree.unmount());
  });

  test('today has a stable calendar accessibility suffix for native automation', async () => {
    const today = new Date();
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const { tree } = await renderPicker({ value: key, maxDate: key });
    const labels = tree.root.findAll((n) => typeof n.props.accessibilityLabel === 'string').map((n) => n.props.accessibilityLabel);
    expect(labels.some((label) => label.endsWith(', Today'))).toBe(true);
    await act(async () => tree.unmount());
  });
});
