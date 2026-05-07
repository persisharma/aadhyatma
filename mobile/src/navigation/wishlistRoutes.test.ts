import assert from 'node:assert/strict';

import type { BookmarkRef } from '@/contexts/BookmarksContext';
import { buildWishlistNavigationTarget } from './wishlistRoutes';

const baseBookmark = {
  savedAt: 0,
  previewHi: '',
  previewEn: '',
} satisfies Pick<BookmarkRef, 'savedAt' | 'previewHi' | 'previewEn'>;

assert.deepEqual(
  buildWishlistNavigationTarget({
    ...baseBookmark,
    id: 'sundarkand:12:4',
    sourceId: 'sundarkand',
    chapter: 12,
    verseIndex: 4,
  }),
  {
    screen: 'SundarkandReader',
    params: { chapter: 12, initialIndex: 4 },
  }
);

assert.deepEqual(
  buildWishlistNavigationTarget({
    ...baseBookmark,
    id: 'hanuman-chalisa::7',
    sourceId: 'hanuman-chalisa',
    verseIndex: 7,
  }),
  {
    screen: 'ChalisaReader',
    params: { initialIndex: 7 },
  }
);
