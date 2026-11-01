import * as Notifications from 'expo-notifications';

// Share one read between initial navigation and its bounded retry path. Clearing
// the native cache prevents a previous tap being replayed on a later icon launch.
let launchResponse: Promise<Notifications.NotificationResponse | null> | undefined;
export function readLaunchNotificationResponse() {
  return (launchResponse ??= Notifications.getLastNotificationResponseAsync().then(async response => {
    if (response) await clearLaunchNotificationResponse();
    return response;
  }));
}

export async function clearLaunchNotificationResponse() {
  try {
    await Notifications.clearLastNotificationResponseAsync();
  } catch {
    // Optional cleanup must not lose the actual notification destination.
  }
}
