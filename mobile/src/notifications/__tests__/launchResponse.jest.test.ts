import * as Notifications from 'expo-notifications';
jest.mock('expo-notifications', () => ({
  getLastNotificationResponseAsync: jest.fn(),
  clearLastNotificationResponseAsync: jest.fn(async () => undefined),
}));

beforeEach(() => { jest.resetModules(); jest.clearAllMocks(); });
test('reads and consumes a native tap once, sharing it with the retry path', async () => {
  const notifications = require('expo-notifications') as typeof Notifications;
  const response = { notification: { request: { identifier: 'tap' } } };
  jest.mocked(notifications.getLastNotificationResponseAsync).mockResolvedValueOnce(response as never).mockResolvedValue(null);
  const { readLaunchNotificationResponse } = require('../launchResponse');
  expect(await readLaunchNotificationResponse()).toBe(response);
  expect(await readLaunchNotificationResponse()).toBe(response);
  expect(notifications.getLastNotificationResponseAsync).toHaveBeenCalledTimes(1);
  expect(notifications.clearLastNotificationResponseAsync).toHaveBeenCalledTimes(1);
});
test('cleanup failure preserves the actual tapped destination', async () => {
  const notifications = require('expo-notifications') as typeof Notifications;
  const response = { notification: { request: { identifier: 'tap' } } };
  jest.mocked(notifications.getLastNotificationResponseAsync).mockResolvedValue(response as never);
  jest.mocked(notifications.clearLastNotificationResponseAsync).mockRejectedValueOnce(new Error('native cleanup failed'));
  expect(await require('../launchResponse').readLaunchNotificationResponse()).toBe(response);
});
