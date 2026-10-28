import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Linking } from 'react-native';
import VratReminderPermissionNotice from '../VratReminderPermissionNotice';
let mockStatus = 'denied';
const mockRequest = jest.fn(async () => 'granted');
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'en' }) }));
jest.mock('@/contexts/NotificationPreferencesContext', () => ({ useNotificationPreferences: () => ({ permissionStatus: mockStatus, canAskAgain: true, requestPermission: mockRequest }) }));
let tree: TestRenderer.ReactTestRenderer;
afterEach(() => act(() => tree.unmount()));
test('denied notifications offer system settings without touching Daily Bhakti', () => {
  mockStatus = 'denied'; const open = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
  act(() => { tree = TestRenderer.create(<VratReminderPermissionNotice />); });
  act(() => tree.root.find(n => n.props.accessibilityRole === 'button').props.onPress());
  expect(open).toHaveBeenCalledTimes(1);
  expect(mockRequest).not.toHaveBeenCalled(); open.mockRestore();
});
test('no notice is shown when OS permission is granted', () => {
  mockStatus = 'granted';
  act(() => { tree = TestRenderer.create(<VratReminderPermissionNotice />); });
  expect(tree.toJSON()).toBeNull();
});
