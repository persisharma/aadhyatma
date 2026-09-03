/**
 * A validated cold-start destination, resolved BEFORE `NavigationContainer`
 * mounts and handed to `TabNavigator` as its initial route (+ initial params).
 *
 * Two launch sources produce one: a Home/Lock Screen widget URL
 * (`widgets/deepLink.ts`) and a notification tap that launched the app
 * (`notifications/deepLink.ts`). Resolving either up front is what stops the
 * tab navigator committing its default Home route first and only then
 * redirecting — Home paid its full mount cost as an intermediate screen the
 * user never asked for.
 */
export type StartTarget =
  | { kind: 'verse'; sourceId: string; verseIndex: number; chapter?: number }
  | { kind: 'panchang'; dateMs: number }
  | { kind: 'japam'; mantraId?: string };
