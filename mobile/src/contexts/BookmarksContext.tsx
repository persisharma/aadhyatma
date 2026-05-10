import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { canonicalSourceId } from '@/data/sourceIdMigration';

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
  const items: BookmarkRef[] = [];
  for (const raw of list) {
    if (!raw || typeof raw !== 'object') {
      changed = true;
      continue;
    }
    const item = raw as BookmarkRef;
    const canonical = canonicalSourceId(item.sourceId);
    if (canonical !== item.sourceId) {
      changed = true;
      items.push({ ...item, sourceId: canonical });
    } else {
      items.push(item);
    }
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
      persist([ref, ...bookmarks.filter((b) => b.id !== ref.id)]);
    },
    [bookmarks, persist]
  );

  const removeBookmark = useCallback(
    (id: string) => {
      persist(bookmarks.filter((b) => b.id !== id));
    },
    [bookmarks, persist]
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
