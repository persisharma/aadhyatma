import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { canonicalBookmarkId, canonicalSourceId } from '@/data/sourceIdMigration';

const STORAGE_KEY = '@vedansh/bookmarks';

export type BookmarkRef = {
  id: string;
  sourceId: string;
  chapter?: number;
  verseIndex: number;
  savedAt: number;
  previewHi: string;
  previewEn: string;
};

type BookmarksContextValue = {
  bookmarks: BookmarkRef[];
  isLoading: boolean;
  addBookmark: (ref: BookmarkRef) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
};

const BookmarksContext = createContext<BookmarksContextValue>({
  bookmarks: [],
  isLoading: true,
  addBookmark: () => {},
  removeBookmark: () => {},
  isBookmarked: () => false,
});

function migrate(list: unknown): { items: BookmarkRef[]; changed: boolean } {
  if (!Array.isArray(list)) return { items: [], changed: false };
  let changed = false;
  const seenIds = new Set<string>();
  const items: BookmarkRef[] = [];
  for (const raw of list) {
    if (!raw || typeof raw !== 'object') {
      changed = true;
      continue;
    }
    const item = raw as BookmarkRef;
    const newSourceId = canonicalSourceId(item.sourceId);
    const newId = canonicalBookmarkId(item.id, newSourceId);
    const rewritten = newSourceId !== item.sourceId || newId !== item.id;
    if (rewritten) changed = true;
    // De-dup: if migration produces an id that already exists (because the
    // user re-bookmarked the same verse under the canonical id after install),
    // keep the most recent one and drop the older.
    if (seenIds.has(newId)) {
      changed = true;
      const existingIdx = items.findIndex((b) => b.id === newId);
      if (existingIdx >= 0 && items[existingIdx].savedAt < item.savedAt) {
        items[existingIdx] = { ...item, sourceId: newSourceId, id: newId };
      }
      continue;
    }
    seenIds.add(newId);
    items.push(rewritten ? { ...item, sourceId: newSourceId, id: newId } : item);
  }
  return { items, changed };
}

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<BookmarkRef[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            const { items, changed } = migrate(parsed);
            setBookmarks(items);
            if (changed) {
              AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => undefined);
            }
          } catch {
            /* corrupted JSON — leave empty */
          }
        }
      })
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, []);

  const persist = useCallback((next: BookmarkRef[]) => {
    setBookmarks(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const addBookmark = useCallback(
    (ref: BookmarkRef) => {
      if (isLoading) return;
      persist([ref, ...bookmarks.filter((b) => b.id !== ref.id)]);
    },
    [isLoading, bookmarks, persist]
  );

  const removeBookmark = useCallback(
    (id: string) => {
      if (isLoading) return;
      persist(bookmarks.filter((b) => b.id !== id));
    },
    [isLoading, bookmarks, persist]
  );

  const isBookmarked = useCallback(
    (id: string) => bookmarks.some((b) => b.id === id),
    [bookmarks]
  );

  return (
    <BookmarksContext.Provider value={{ bookmarks, isLoading, addBookmark, removeBookmark, isBookmarked }}>
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  return useContext(BookmarksContext);
}
