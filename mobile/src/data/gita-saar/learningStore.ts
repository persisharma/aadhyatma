import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';
import { gitaSaarChaptersManifest } from './index';
const KEY = '@vedansh/gita-saar-reflections-v1';
export const MAX_REFLECTION_LENGTH = 1000;
export type GitaSaarReflection = {
  chapter: number;
  verseIndex: number;
  text: string;
  updatedAt: number;
};
type Snapshot = { ready: boolean; reflections: readonly GitaSaarReflection[] };
type Storage = Pick<typeof AsyncStorage, 'getItem' | 'setItem'>;
function validRef(chapter: number, index: number) {
  return (
    Number.isInteger(chapter) &&
    Number.isInteger(index) &&
    index >= 0 &&
    index < (gitaSaarChaptersManifest[chapter - 1]?.verseCount ?? 0)
  );
}
export function decodeReflections(raw: string | null): GitaSaarReflection[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (
      !value ||
      typeof value !== 'object' ||
      !('version' in value) ||
      value.version !== 1 ||
      !('reflections' in value) ||
      !Array.isArray(value.reflections)
    )
      return [];
    const byRef = new Map<string, GitaSaarReflection>();
    for (const item of value.reflections) {
      if (!item || typeof item !== 'object') continue;
      const r = item as Partial<GitaSaarReflection>;
      if (
        typeof r.chapter !== 'number' ||
        typeof r.verseIndex !== 'number' ||
        !validRef(r.chapter, r.verseIndex) ||
        typeof r.text !== 'string' ||
        !r.text.trim() ||
        r.text.length > MAX_REFLECTION_LENGTH ||
        typeof r.updatedAt !== 'number' ||
        !Number.isFinite(r.updatedAt) ||
        r.updatedAt < 0
      )
        continue;
      const key = `${r.chapter}:${r.verseIndex}`;
      const row = {
        chapter: r.chapter,
        verseIndex: r.verseIndex,
        text: r.text.trim(),
        updatedAt: r.updatedAt,
      };
      if (!byRef.has(key) || byRef.get(key)!.updatedAt < row.updatedAt)
        byRef.set(key, row);
    }
    return [...byRef.values()].sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}
/** Hydrate lazily; serialize durable writes so rapid saves cannot drop other notes. */
export function createGitaSaarLearningStore(storage: Storage) {
  let snapshot: Snapshot = { ready: false, reflections: [] };
  let hydration: Promise<void> | undefined;
  let queue: Promise<void> = Promise.resolve();
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());
  const hydrate = () =>
    (hydration ??= storage
      .getItem(KEY)
      .then((raw) => {
        const decoded = decodeReflections(raw);
        snapshot = {
          ready: true,
          reflections:
            decoded.length === 0 && snapshot.reflections.length === 0
              ? snapshot.reflections
              : decoded,
        };
        emit();
      })
      .catch(() => {
        hydration = undefined; // Do not overwrite existing notes after a failed read; allow retry.
        throw new Error('Gita Saar reflections could not be loaded');
      }));
  const mutate = (
    apply: (rows: readonly GitaSaarReflection[]) => GitaSaarReflection[]
  ) => {
    const operation = queue
      .catch(() => undefined)
      .then(async () => {
        await hydrate();
        const rows = apply(snapshot.reflections);
        await storage.setItem(
          KEY,
          JSON.stringify({ version: 1, reflections: rows })
        );
        snapshot = { ready: true, reflections: rows };
        emit();
      });
    queue = operation;
    return operation;
  };
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    hydrate,
    save: (chapter: number, verseIndex: number, text: string) => {
      const clean = text.trim();
      if (
        !validRef(chapter, verseIndex) ||
        !clean ||
        clean.length > MAX_REFLECTION_LENGTH
      )
        return Promise.reject(new Error('Invalid reflection'));
      return mutate((rows) => [
        { chapter, verseIndex, text: clean, updatedAt: Date.now() },
        ...rows.filter(
          (r) => r.chapter !== chapter || r.verseIndex !== verseIndex
        ),
      ]);
    },
    remove: (chapter: number, verseIndex: number) =>
      mutate((rows) =>
        rows.filter((r) => r.chapter !== chapter || r.verseIndex !== verseIndex)
      ),
  };
}
const store = createGitaSaarLearningStore(AsyncStorage);
const getRows = () => store.getSnapshot().reflections;
export function useGitaSaarLearning() {
  // Empty hydration does not invalidate every mounted native reader cell.
  const reflections = useSyncExternalStore(store.subscribe, getRows, getRows);
  useEffect(() => {
    void store.hydrate().catch(() => undefined);
  }, []);
  return {
    ready: store.getSnapshot().ready,
    reflections,
    save: store.save,
    remove: store.remove,
  };
}
