import React, { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTour } from '@/contexts/TourContext';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { useGitaLanguage } from '@/data/gita/language';
import { moreTabTarget } from '@/navigation/entryRoutes';
import { hasWidgetHost, readWidgetPayload } from '@/widgets/native';
import { widgetDateKey, WIDGET_TIME_ZONE } from '@/widgets/contract';
import {
  startMetaAppEvents,
  metaTrackingAvailable,
} from '@/utils/metaAppEvents';
import OnboardingSetupSheet from './OnboardingSetupSheet';
import ReminderOptInModal from './ReminderOptInModal';
import { WidgetHowToSheet } from './DailyBhaktiNudge';
import {
  claimLaunchAsk,
  completeLaunchSelection,
  suppressLaunchAsks,
  hydrateLaunchAsks,
  localDay,
  reminderDue,
  useLaunchAsks,
} from './launchAskStore';
import {
  loadNudgeRecord,
  nudgeSnapshot,
  updateNudge,
  startWidgetPinFlow,
} from './widgetNudgeStore';
import {
  nudgeWidgets,
  widgetAddedPatch,
  type NudgeWidget,
} from './dailyBhaktiNudgeView';
export default function LaunchAskHost({
  targeted = false,
}: {
  targeted?: boolean;
}) {
  const tour = useTour(),
    prefs = useNotificationPreferences();
  const launch = useLaunchAsks();
  const { lang } = useGitaLanguage();
  const navigation = useNavigation<any>();
  const [kind, setKind] = useState<'reminder' | 'widgets' | null>(null),
    [loaded, setLoaded] = useState(false),
    [lines, setLines] = useState<readonly string[]>([]),
    [widgets, setWidgets] = useState<NudgeWidget[]>([]);
  const decided = useRef(false);
  const trackingStarted = useRef(false);
  const [trackingReady, setTrackingReady] = useState(Platform.OS !== 'ios');
  useEffect(() => {
    let alive = true;
    void Promise.all([hydrateLaunchAsks(), loadNudgeRecord()]).then(() => {
      if (alive) setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (!loaded || tour.isLoading || prefs.isLoading || decided.current) return;
    if (targeted) {
      suppressLaunchAsks();
      decided.current = true;
      return;
    }
    if (tour.shouldShowOnboardingSetup || tour.shouldShowFirstLaunchTour) {
      claimLaunchAsk(true);
      decided.current = true;
      return;
    }
    if (tour.shouldShowWhatsNew) {
      claimLaunchAsk();
      decided.current = true;
      return;
    }
    if (!trackingReady) {
      if (!trackingStarted.current) {
        trackingStarted.current = true;
        void (async () => {
          try {
            if (metaTrackingAvailable()) {
              const tracking = await import('expo-tracking-transparency');
              const status = await tracking.getTrackingPermissionsAsync();
              if (status.status === 'undetermined' && !claimLaunchAsk()) return;
            }
            await startMetaAppEvents();
          } catch {
            // Optional measurement must never prevent devotional use.
          } finally {
            setTrackingReady(true);
          }
        })();
      }
      return;
    }
    if (launch.taken || launch.record.lastDay === localDay()) {
      decided.current = true;
      completeLaunchSelection();
      return;
    }
    // Existing snoozes and manual Settings opt-outs survive this migration.
    const snoozed =
      prefs.meta.lastDeclinedAt != null &&
      Date.now() - prefs.meta.lastDeclinedAt < 15 * 86400000 &&
      launch.record.declines === 0;
    if (
      !(
        prefs.prefs.dailyVerseEnabled && prefs.permissionStatus === 'granted'
      ) &&
      !prefs.meta.optedOutAt &&
      !launch.record.stopped &&
      !snoozed &&
      !(prefs.permissionStatus === 'denied' && !prefs.canAskAgain) &&
      reminderDue(launch.record)
    ) {
      if (claimLaunchAsk(false, 'reminder')) {
        decided.current = true;
        setKind('reminder');
      }
      return;
    }
    const record = nudgeSnapshot();
    if (
      hasWidgetHost() &&
      launch.record.firstDay !== localDay() &&
      !record.widgetDismissedAt &&
      !record.panchangAddedAt
    ) {
      if (claimLaunchAsk()) {
        decided.current = true;
        setWidgets(
          nudgeWidgets(record.widgetAddedAt ? 'panchangWidget' : 'widget'),
        );
        void readWidgetPayload()
          .then((payload) => {
            if (payload.kind === 'ready')
              setLines(
                payload.payload.verses.days.find(
                  (d) =>
                    d.dateKey === widgetDateKey(new Date(), WIDGET_TIME_ZONE),
                )?.lines[lang] ?? [],
              );
          })
          .catch(() => undefined);
        setKind('widgets');
      }
      return;
    }
    decided.current = true;
    completeLaunchSelection();
  }, [loaded, tour, prefs, launch, targeted, lang, trackingReady]);
  if (tour.shouldShowOnboardingSetup && !targeted)
    return <OnboardingSetupSheet />;
  const gallery = () => {
    setKind(null);
    navigation.navigate('MoreTab', moreTabTarget('WidgetGallery'));
  };
  if (kind === 'reminder')
    return <ReminderOptInModal onClose={() => setKind(null)} />;
  if (kind === 'widgets')
    return (
      <WidgetHowToSheet
        visible
        widgets={widgets}
        previewLines={lines}
        onClose={() => {
          void updateNudge({ widgetDismissedAt: Date.now() });
          setKind(null);
        }}
        onDone={() => {
          widgets.forEach((w) => {
            void updateNudge(widgetAddedPatch(w, Date.now()));
          });
          setKind(null);
        }}
        onGallery={gallery}
        onAdd={() => {
          void startWidgetPinFlow(widgets).then((opened) => {
            if (opened) setKind(null);
            else gallery();
          });
        }}
      />
    );
  return null;
}
