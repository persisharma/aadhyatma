import React, { useEffect, useRef, useState } from 'react';
import { AppState, InteractionManager, Linking, Platform } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import * as Updates from 'expo-updates';
import { Magnetometer } from 'expo-sensors';
import { useTour } from '@/contexts/TourContext';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { useRatingPrompt } from '@/contexts/RatingPromptContext';
import { claimLaunchAsk, localDay, useLaunchAsks } from '@/components/launchAskStore';
import { navigationRef } from '@/notifications/deepLink';
import { startTargetToNavigateAction } from '@/navigation/startTarget';
import { HOUR, pickExplore, recordDecline, recordShown, recordVisit } from '@/data/discovery/policy';
import { sectionForRoute, type ExploreSection } from '@/data/discovery/sections';
import { exploreSnapshot, loadExplore, setExploreVisible, updateExplore, useExploreStore } from '@/data/discovery/store';
import ExploreSheet from './ExploreSheet';
export default function ExploreLaunch() {
    const snapshot = useExploreStore(), tour = useTour(), reminders = useNotificationPreferences(), rating = useRatingPrompt();
    const launch = useLaunchAsks();
    const { isUpdatePending } = Updates.useUpdates();
    const [section, setSection] = useState<ExploreSection | null>(null), [ready, setReady] = useState(false), [unavailable, setUnavailable] = useState<string[]>([]), [episode, setEpisode] = useState(0), [routeTick, setRouteTick] = useState(0);
    const intent = useRef(false), claimed = useRef(false), closing = useRef(false), ownsLaunch = useRef(false), background = useRef<number | null>(null);
    const higher = tour.shouldShowFirstLaunchTour || tour.shouldShowOnboardingSetup || tour.shouldShowWhatsNew || rating.visible || (!ownsLaunch.current && ((Updates.isEnabled && isUpdatePending) || launch.taken || launch.record.lastDay === localDay()));
    const higherRef = useRef(higher);
    higherRef.current = higher;
    function recordCurrent() { const route = navigationRef.getCurrentRoute(); if (route) {
        const id = sectionForRoute(route.name, route.params);
        if (id)
            void updateExplore(s => recordVisit(s, id));
    } }
    useEffect(() => {
        void loadExplore();
        let active = true;
        Promise.all([Linking.getInitialURL(), Notifications.getLastNotificationResponseAsync(), Magnetometer.isAvailableAsync()]).then(([url, response, sensor]) => { if (!active)
            return; intent.current = !!url || !!response; setUnavailable([...(sensor ? [] : ['vastu']), ...(Platform.OS === 'ios' || Platform.OS === 'android' ? [] : ['widgets'])]); setReady(true); }).catch(() => { if (active) {
            intent.current = true;
            setReady(true);
        } });
        const external = () => { intent.current = true; claimed.current = true; setSection(null); setExploreVisible(false); setEpisode(n => n + 1); };
        const link = Linking.addEventListener('url', external), notice = Notifications.addNotificationResponseReceivedListener(external);
        const app = AppState.addEventListener('change', next => { if (next === 'background') {
            background.current = Date.now();
            setSection(null);
            setExploreVisible(false);
        } if (next === 'active' && background.current !== null) {
            if (Date.now() - background.current >= HOUR / 2) {
                intent.current = false;
                claimed.current = false;
                setEpisode(n => n + 1);
            }
            background.current = null;
        } });
        const onRoute = () => { recordCurrent(); setRouteTick(n => n + 1); };
        const unsubscribe = navigationRef.addListener('state', onRoute), initial = setTimeout(onRoute, 1000);
        return () => { active = false; clearTimeout(initial); link.remove(); notice.remove(); app.remove(); unsubscribe(); setExploreVisible(false); };
    }, []);
    // A slow ledger read must not lose a deep-linked visit that mounted before hydration.
    useEffect(() => { if (snapshot.ready)
        recordCurrent(); }, [snapshot.ready]);
    useEffect(() => {
        if (higher && !tour.isLoading) {
            claimed.current = true;
            if (section) {
                setSection(null);
                setExploreVisible(false);
            }
            return;
        }
        if (!snapshot.ready || snapshot.firstCollectionSession || !ready || !launch.ready || !launch.selectionComplete || tour.isLoading || reminders.isLoading || intent.current || claimed.current || section)
            return;
        if (!navigationRef.isReady() || navigationRef.getCurrentRoute()?.name !== 'Home')
            return;
        let cancelled = false;
        let timer: ReturnType<typeof setTimeout> | undefined;
        const task = InteractionManager.runAfterInteractions(() => {
            timer = setTimeout(async () => {
                if (cancelled || claimed.current || intent.current || higherRef.current || AppState.currentState !== 'active' || navigationRef.getCurrentRoute()?.name !== 'Home')
                    return;
                const before = exploreSnapshot().state, now = Date.now();
                if (before.shown.some(t => t > now)) {
                    await updateExplore(s => ({ ...s, createdAt: Math.min(s.createdAt, now - 24 * HOUR), shown: [now], sleepUntil: Math.min(s.sleepUntil, now + 7 * 24 * HOUR) }));
                    return;
                }
                if (before.createdAt > now) {
                    await updateExplore(s => ({ ...s, createdAt: now }));
                    return;
                }
                const candidate = pickExplore(before, now, unavailable);
                if (!candidate)
                    return;
                claimed.current = true;
                // Reserve the same daily slot as onboarding, reminders, widgets and rating.
                // Set ownership first so our own store notification is not a preemption.
                ownsLaunch.current = true;
                if (!claimLaunchAsk()) {
                    ownsLaunch.current = false;
                    return;
                }
                if (!await updateExplore(s => recordShown(s, candidate.id, now)))
                    return;
                if (cancelled || intent.current || higherRef.current || navigationRef.getCurrentRoute()?.name !== 'Home') {
                    await updateExplore(s => ({ ...s, shown: s.shown.filter(t => t !== now), last: before.last }));
                    return;
                }
                closing.current = false;
                setExploreVisible(true);
                setSection(candidate);
            }, 800);
        });
        return () => { cancelled = true; task.cancel(); if (timer)
            clearTimeout(timer); };
    }, [snapshot.ready, snapshot.firstCollectionSession, ready, launch.ready, launch.selectionComplete, tour.isLoading, reminders.isLoading, higher, episode, routeTick, section, unavailable]);
    const finish = () => { if (closing.current)
        return false; closing.current = true; setSection(null); setExploreVisible(false); return true; };
    if (!section)
        return null;
    return <ExploreSheet key={section.id} section={section} onDismiss={() => { if (finish())
        void updateExplore(s => recordDecline(s, section.id, Date.now())); }} onDisable={() => { if (finish())
        void updateExplore(s => ({ ...s, enabled: false })); }} onOpen={name => { if (!finish())
        return; void updateExplore(s => ({ ...recordVisit(s, section.id), streak: 0 })); const target = section.id === 'suvichar' ? { ...section.target, params: { exploreDraft: { name, deity: 'ram-darbar' } } } : section.target; navigationRef.dispatch(CommonActions.navigate(startTargetToNavigateAction(target))); }}/>;
}
