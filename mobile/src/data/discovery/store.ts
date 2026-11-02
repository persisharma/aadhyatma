import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EXPLORE_KEY, initialExploreState, parseExploreState, recordVisit, type ExploreState } from './policy';
let snapshot = { ready: false, firstCollectionSession: false, state: initialExploreState(Date.now()), visible: false };
const listeners = new Set<() => void>();
let queue = Promise.resolve();
let loading: Promise<void> | undefined;
function emit() { listeners.forEach(fn => fn()); }
export function useExploreStore() { return useSyncExternalStore(fn => { listeners.add(fn); return () => { listeners.delete(fn); }; }, () => snapshot); }
export function exploreSnapshot() { return snapshot; }
export function isExploreSurfaceOpen() { return snapshot.visible; }
export function setExploreVisible(visible: boolean) { snapshot = { ...snapshot, visible }; emit(); }
export function updateExplore(change: (s: ExploreState) => ExploreState): Promise<boolean> { let success = false; queue = queue.then(async () => { if (!snapshot.ready)
    return; const next = change(snapshot.state); if (next === snapshot.state) {
    success = true;
    return;
} try {
    await AsyncStorage.setItem(EXPLORE_KEY, JSON.stringify(next));
    snapshot = { ...snapshot, state: next };
    success = true;
    emit();
}
catch {
    snapshot = { ...snapshot, ready: false, visible: false };
    emit();
} }); return queue.then(() => success); }
export function loadExplore() { if (loading)
    return loading; loading = (async () => { try {
    const raw = await AsyncStorage.getItem(EXPLORE_KEY);
    let state = parseExploreState(raw, Date.now());
    if (!raw) {
        const evidence = await AsyncStorage.multiGet(['@vedansh/routines', '@vedansh/sadhana', '@vedansh/pitru-smaran']);
        const ids = ['routine', 'sankalp', 'pitru'];
        evidence.forEach(([, v], i) => { if (v && v !== '[]' && v !== '{}' && v !== 'null')
            state = recordVisit(state, ids[i]); });
        await AsyncStorage.setItem(EXPLORE_KEY, JSON.stringify(state));
    }
    snapshot = { ...snapshot, state, ready: true, firstCollectionSession: !raw };
    emit();
}
catch {
    snapshot = { ...snapshot, ready: false };
    emit();
} })(); return loading; }
