import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import VratReminderSheet from '../VratReminderSheet';
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'en' }) }));
let tree: TestRenderer.ReactTestRenderer;
const close = jest.fn(); const save = jest.fn();
function press(id: string) { act(() => tree.root.findAll(n => n.props.accessibilityRole === 'button').find(n => n.props.testID === id || n.props.accessibilityLabel === id)!.props.onPress()); }
beforeEach(() => {
  jest.clearAllMocks();
  act(() => { tree = TestRenderer.create(<VratReminderSheet visible titleName="Karwa Chauth" initial={{ advanceDays: 1, dayOf: true }} onClose={close} onSave={save} />); });
});
afterEach(() => act(() => tree.unmount()));
test('closing setup discards unsaved timing changes', () => {
  press('2 days'); press('08:00'); press('reminder-sheet-close');
  expect(close).toHaveBeenCalledTimes(1);
  expect(save).not.toHaveBeenCalled();
});
test('saving commits the chosen advance/day-of time before closing', () => {
  press('2 days'); press('08:00'); press('reminder-sheet-save');
  expect(save).toHaveBeenCalledWith({ advanceDays: 2, dayOf: true, dayOfTime: { hour: 8, minute: 0 } });
  expect(close).toHaveBeenCalledTimes(1);
});
