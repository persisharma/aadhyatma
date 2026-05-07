import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  addBookmark: (ref: BookmarkRef) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
};

const BookmarksContext = createContext<BookmarksContextValue>({
  bookmarks: [],
  addBookmark: () => {},
  removeBookmark: () => {},
  isBookmarked: () => false,
});

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<BookmarkRef[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setBookmarks(JSON.parse(raw));
        } catch {}
      }
    });
  }, []);

  const persist = useCallback((next: BookmarkRef[]) => {
    setBookmarks(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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
    <BookmarksContext.Provider value={{ bookmarks, addBookmark, removeBookmark, isBookmarked }}>
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  return useContext(BookmarksContext);
}
