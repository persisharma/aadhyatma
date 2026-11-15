import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useSyncExternalStore } from "react";
import { darshanForTemple } from "@/data/darshan/channels";
const KEY = "@vedansh/darshan-favourites-v1";
type Storage = Pick<typeof AsyncStorage, "getItem" | "setItem">;
/** One lazy shared store for sheet/list/player. No startup reads or provider. */
export function createDarshanFavoritesStore(storage: Storage) {
  let state = { ids: [] as string[], ready: false, failed: false };
  const listeners = new Set<() => void>();
  let loading: Promise<void> | undefined;
  let writing = Promise.resolve();
  const notify = () => listeners.forEach((fn) => fn());
  function hydrate() {
    return (loading ??= storage
      .getItem(KEY)
      .then((raw) => {
        let parsed: unknown = [];
        try {
          parsed = raw ? JSON.parse(raw) : [];
        } catch {
          /* Recover malformed data as an empty roster. */
        }
        state = {
          ids: Array.isArray(parsed)
            ? [
                ...new Set(
                  parsed
                    .filter(
                      (id): id is string =>
                        typeof id === "string" && !!darshanForTemple(id),
                    )
                    .map((id) => darshanForTemple(id)!.templeId),
                ),
              ]
            : [],
          ready: true,
          failed: false,
        };
      })
      .catch(() => {
        state = { ...state, ready: false, failed: true };
        loading = undefined;
      })
      .then(notify));
  }
  function persist(ids: string[]) {
    writing = writing
      .then(() => storage.setItem(KEY, JSON.stringify(ids)))
      .then(() => {
        state = { ...state, failed: false };
        notify();
      })
      .catch(() => {
        state = { ...state, failed: true };
        notify();
      });
    return writing;
  }
  return {
    getSnapshot: () => state,
    subscribe: (fn: () => void) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    hydrate,
    retry: () => (state.ready ? persist(state.ids) : hydrate()),
    toggle: (id: string) => {
      // Do not overwrite saved favourites while hydration is still pending.
      const canonical = darshanForTemple(id)?.templeId;
      if (!state.ready || !canonical) return;
      const ids = state.ids.includes(canonical)
        ? state.ids.filter((value) => value !== canonical)
        : [...state.ids, canonical];
      state = { ...state, ids, failed: false };
      notify();
      // Serialize snapshots so rapid taps cannot persist an older roster last.
      void persist(ids);
    },
  };
}
const store = createDarshanFavoritesStore(AsyncStorage);
export function useDarshanFavorites() {
  const current = useSyncExternalStore(store.subscribe, store.getSnapshot);
  useEffect(() => {
    void store.hydrate();
  }, []);
  return { ...current, retry: store.retry, toggle: store.toggle };
}
