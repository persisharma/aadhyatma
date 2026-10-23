import React, { createContext, forwardRef, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { ScrollView, View, type FlatListProps, type ScrollViewProps } from 'react-native';

/**
 * Lets auto-slide (design.md §85) scroll a page to its bottom before turning it.
 *
 * A reader's pager renders its cells through `makePageScrollCell` (FlatList's
 * `CellRendererComponent`), which tells each cell's subtree its list index. A page
 * renders `AutoSlideScrollView` in place of its vertical `ScrollView`; that registers
 * the scroll view's size and position with the reader under that index, so the
 * slideshow can scroll whichever page is on screen without the page knowing about it.
 * Outside an auto-slide pager it is a plain `ScrollView`.
 */

/** What auto-slide needs from a page's vertical scroll view. */
export type PageScroll = {
  /** Visible height. */
  viewport: number;
  /** Content height. */
  content: number;
  /** Current vertical offset. */
  y: number;
  scrollTo: (y: number) => void;
};

/** A reader's mounted pages, keyed by list index. */
export type PageScrollRegistry = {
  register: (index: number, page: PageScroll) => () => void;
  /** The user grabbed (`true`) or let go of (`false`) page `index`. */
  hold: (index: number, held: boolean) => void;
};

const PageScrollContext = createContext<{ index: number; registry: PageScrollRegistry } | null>(null);

/** FlatList's own cell-renderer props (cellKey, index, item, style, onLayout, …). */
type CellProps =
  NonNullable<FlatListProps<unknown>['CellRendererComponent']> extends React.ComponentType<infer P> ? P : never;

/** A `CellRendererComponent` that renders FlatList's default cell plus the page index. */
export function makePageScrollCell(registry: PageScrollRegistry) {
  return function AutoSlideCell({ index, style, onLayout, onFocusCapture, children }: CellProps) {
    const value = useMemo(() => ({ index, registry }), [index]);
    // `onFocusCapture` is missing from RN's ViewProps typings but is what the default
    // cell passes (VirtualizedListCellRenderer), so forward it the same way.
    const focus = { onFocusCapture };
    return (
      <View style={style} onLayout={onLayout} {...focus}>
        <PageScrollContext.Provider value={value}>{children}</PageScrollContext.Provider>
      </View>
    );
  };
}

const AutoSlideScrollView = forwardRef<ScrollView, ScrollViewProps>(function AutoSlideScrollView(props, ref) {
  const { onLayout, onContentSizeChange, onScrollBeginDrag, onScrollEndDrag, onMomentumScrollEnd } = props;
  const scope = useContext(PageScrollContext);
  const inner = useRef<ScrollView>(null);
  useImperativeHandle(ref, () => inner.current as ScrollView, []);

  const [page] = useState<PageScroll>(() => {
    const p: PageScroll = {
      viewport: 0,
      content: 0,
      y: 0,
      scrollTo: (y) => {
        p.y = y;
        inner.current?.scrollTo({ y, animated: true });
      },
    };
    return p;
  });

  useEffect(() => scope?.registry.register(scope.index, page), [scope, page]);

  return (
    <ScrollView
      {...props}
      ref={inner}
      onLayout={(e) => {
        page.viewport = e.nativeEvent.layout.height;
        onLayout?.(e);
      }}
      onContentSizeChange={(w, h) => {
        page.content = h;
        onContentSizeChange?.(w, h);
      }}
      onScrollBeginDrag={(e) => {
        scope?.registry.hold(scope.index, true);
        onScrollBeginDrag?.(e);
      }}
      onScrollEndDrag={(e) => {
        page.y = e.nativeEvent.contentOffset.y;
        scope?.registry.hold(scope.index, false);
        onScrollEndDrag?.(e);
      }}
      onMomentumScrollEnd={(e) => {
        page.y = e.nativeEvent.contentOffset.y;
        onMomentumScrollEnd?.(e);
      }}
    />
  );
});

export default AutoSlideScrollView;
