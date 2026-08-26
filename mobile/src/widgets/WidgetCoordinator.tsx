import { useEffect, useRef } from 'react';
import { AppState, InteractionManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGitaLanguage } from '@/data/gita/language';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { usePanchangCalendarHydrated, usePanchangCalendarSystem } from '@/panchang/usePanchang';
import { useUserActivity } from '@/contexts/UserActivityContext';
import { useJapamCounter } from '@/contexts/JapamCounterContext';
import { isValidIanaTimeZone, stableWidgetPayloadKey } from './contract';
import { writeWidgetPayload } from './native';

const LAST_PLAN_KEY = '@vedansh/widget:last-plan-key-v1';
const THROTTLE_MS = 30_000;

/**
 * Invisible, deliberately deferred bridge. Crucially this module does not
 * statically import the verse corpus, Panchang engine, or native planner: those
 * are evaluated only after the first interaction window has completed.
 */
export default function WidgetCoordinator() {
  const { lang, isLoading: languageLoading } = useGitaLanguage();
  const { location, isLoading: locationLoading } = usePanchangLocation();
  const [calendarSystem] = usePanchangCalendarSystem();
  const calendarHydrated = usePanchangCalendarHydrated();
  const { activity, isLoading: activityLoading } = useUserActivity();
  const { entries, isLoading: countersLoading } = useJapamCounter();
  const lastRunAt = useRef(0);
  const generationRef = useRef(0);
  const revision = JSON.stringify(activity);
  const lastUsedMantraId = Object.entries(entries).sort((a, b) => b[1].updatedAt - a[1].updatedAt)[0]?.[0];
  const resolvedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const deviceTimeZone = isValidIanaTimeZone(resolvedTimeZone) ? resolvedTimeZone : 'UTC';

  useEffect(() => {
    if (languageLoading || locationLoading || !calendarHydrated || activityLoading || countersLoading) return undefined;
    const generation = ++generationRef.current;
    let cancelled = false;
    let inFlight = false;
    let rerunRequested = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      if (cancelled) return;
      if (inFlight) { rerunRequested = true; return; }
      if (timer) clearTimeout(timer);
      const delay = Math.max(0, THROTTLE_MS - (Date.now() - lastRunAt.current));
      timer = setTimeout(() => {
        InteractionManager.runAfterInteractions(async () => {
          if (cancelled) return;
          inFlight = true;
          try {
            // Dynamic boundary preserves Home first-frame independence.
            const { planWidgetPayload } = await import('./planPayload');
            const payload = await planWidgetPayload({ generatedAt: new Date(), locale: lang, location, calendarSystem, deviceTimeZone, activity, lastUsedMantraId });
            // Dependency changes are allowed to finish their CPU work, but may
            // never overwrite a newer location/language/calendar/activity plan.
            if (cancelled || generation !== generationRef.current) return;
            const key = stableWidgetPayloadKey(payload);
            const previous = await AsyncStorage.getItem(LAST_PLAN_KEY).catch((error) => {
              // A read failure forces a (safe) rewrite; surface it so a wedged
              // dedup cache is diagnosable rather than a silent perpetual rewrite.
              console.warn('[WidgetCoordinator] dedup key read failed; forcing a rewrite', error);
              return null;
            });
            if (cancelled || generation !== generationRef.current) return;
            if (previous !== key) {
              const result = await writeWidgetPayload(payload);
              // Expo Go/dev clients without the binary module do not mark the
              // payload committed; a later compatible binary retries.
              if (result === 'native' && !cancelled && generation === generationRef.current) await AsyncStorage.setItem(LAST_PLAN_KEY, key);
            }
          } catch (error) {
            // Fail-closed for the user — the prior atomic payload stays intact and
            // native readers expose its freshness/recovery — but never fail-silent
            // for us: an unlogged plan/write failure lets widgets age into recovery
            // with no way to tell why.
            console.warn('[WidgetCoordinator] payload plan/write failed', error);
          } finally {
            inFlight = false;
            // Stamp the attempt (success OR handled failure) so a persistent
            // failure is throttled to once per THROTTLE_MS instead of re-planning
            // on every foreground. A superseding generation owns its own timing.
            if (!cancelled && generation === generationRef.current) lastRunAt.current = Date.now();
            if (rerunRequested && !cancelled) { rerunRequested = false; schedule(); }
          }
        });
      }, delay);
    };

    schedule();
    const sub = AppState.addEventListener('change', (state) => { if (state === 'active') schedule(); });
    return () => { cancelled = true; if (timer) clearTimeout(timer); sub.remove(); };
  }, [activity, activityLoading, calendarHydrated, calendarSystem, countersLoading, deviceTimeZone, lang, languageLoading, location, locationLoading, revision, lastUsedMantraId]);

  return null;
}
