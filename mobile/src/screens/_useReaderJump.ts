/**
 * The jump half of a paged reader's counter (RULEBOOK §3 "Reader page counter").
 * Spread the result onto `ReaderPageCounter`:
 *
 *   const jump = useReaderJump({ listRef, offset, setCurrentIndex, readAloud, autoSlide });
 *   <ReaderPageCounter current={currentIndex + 1} total={verseCount} {...jump} />
 *
 * Opening the picker stops both hands-free modes, as the Gita sheet does. The
 * jump sets the index itself and then moves the pager without animation, so the
 * counter is right even before the list reports the new page.
 */
export function useReaderJump({ listRef, offset = 0, setCurrentIndex, readAloud, autoSlide }: {
  listRef: { current: { scrollToIndex: (params: { index: number; animated?: boolean }) => void } | null };
  /** Pages before the first verse: 1 when a previous-chapter card is prepended. */
  offset?: number;
  setCurrentIndex: (index: number) => void;
  readAloud?: { stop: () => void };
  autoSlide?: { stop: () => void };
}) {
  return {
    onOpen: () => { readAloud?.stop(); autoSlide?.stop(); },
    onJump: (page: number) => {
      setCurrentIndex(page - 1);
      listRef.current?.scrollToIndex({ index: offset + page - 1, animated: false });
    },
  };
}
