import { lazy } from 'react';

/**
 * The Panchang stack is the one tab kept behind a dynamic boundary: it pulls in
 * ~70 modules (Kundali, Rashifal, Gochar, Namkaran, Vastu, the vidhi flow) that
 * a launch onto Home must not evaluate. See `TabNavigator`.
 *
 * ONE shared promise, so a preload and the `React.lazy` render read the same
 * evaluation instead of racing two of them.
 */
let loading: Promise<{ default: React.ComponentType<object> }> | null = null;

const load = () => (loading ??= import('./PanchangStackNavigator') as Promise<{ default: React.ComponentType<object> }>);

/**
 * Evaluate the Panchang chunk BEFORE `NavigationContainer` mounts.
 *
 * A cold start that lands on the Panchang tab (a widget tap, a vrat/muhurat
 * notification) makes this lazy stack the very first screen committed — a path
 * that never ran while every launch went through Home first and reached the
 * Panchang chunk later, warm. Awaiting it in `App.tsx`'s existing pre-mount
 * race keeps the cold landing identical to the warm one Maestro exercises, and
 * gives the caller a chance to handle a chunk that fails to evaluate instead of
 * suspending on it forever with no error boundary in reach.
 *
 * Rejections are the caller's to handle; the module registry caches the
 * evaluated module, so the later `React.lazy` render resolves off this promise.
 */
export const preloadPanchangStack = load;

export const LazyPanchangStackNavigator = lazy(load);
