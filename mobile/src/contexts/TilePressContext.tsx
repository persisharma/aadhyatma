import React from 'react';

/**
 * Home "first tap" recovery for launcher tiles and cards (design.md §18).
 *
 * iOS can cancel a child `Pressable`'s `onPress` when it lives inside a
 * `ScrollView` even when the finger never actually drags — so the first tap
 * appears to do nothing and the user has to tap again. This controller keeps a
 * one-tick fallback for that exact press lifecycle: the action is remembered on
 * `onPressIn`, armed on `onPressOut`, and fired on the next event-loop turn
 * unless a real `onPress` already ran (`activateTile`) or a scroll drag marked
 * the gesture (`markTileDrag`).
 *
 * ONE controller is shared across every Home card (grid + Today cluster +
 * Discover) via context. That sharing is load-bearing: a card lives inside the
 * outer vertical `ScrollView`, so a vertical drag started on a card must be able
 * to suppress that card's fallback. A per-component copy could not see the outer
 * scroll's drag and would navigate on a plain page scroll. See PR #219 (which
 * introduced this for the category grid) and #220-follow (Today/Discover).
 */
type PendingTilePress = {
  action: () => void;
  didDrag: boolean;
  handled: boolean;
  fallback?: ReturnType<typeof setTimeout>;
};

export type TilePressHandlers = {
  /** Card `onPressIn`: remember the navigation action for this press. */
  beginTilePress: (action: () => void) => void;
  /** `onScrollBeginDrag` of any enclosing ScrollView: this gesture is a scroll. */
  markTileDrag: () => void;
  /** Card `onPressOut`: arm the no-drag first-tap fallback. */
  finishTilePress: () => void;
  /** Card `onPress`: run immediately (the happy path), cancelling the fallback. */
  activateTile: (fallbackAction: () => void) => void;
};

export function useTilePressController(): TilePressHandlers {
  const pending = React.useRef<PendingTilePress | null>(null);

  const beginTilePress = React.useCallback((action: () => void) => {
    if (pending.current?.fallback !== undefined) clearTimeout(pending.current.fallback);
    pending.current = { action, didDrag: false, handled: false };
  }, []);

  const markTileDrag = React.useCallback(() => {
    if (pending.current) pending.current.didDrag = true;
  }, []);

  const finishTilePress = React.useCallback(() => {
    const p = pending.current;
    if (!p || p.didDrag || p.handled) return;
    p.fallback = setTimeout(() => {
      if (pending.current !== p || p.didDrag || p.handled) return;
      p.handled = true;
      pending.current = null;
      p.action();
    }, 0);
  }, []);

  const activateTile = React.useCallback((fallbackAction: () => void) => {
    const p = pending.current;
    if (p?.fallback !== undefined) clearTimeout(p.fallback);
    const action = p?.action ?? fallbackAction;
    if (p) p.handled = true;
    pending.current = null;
    action();
  }, []);

  React.useEffect(
    () => () => {
      if (pending.current?.fallback !== undefined) clearTimeout(pending.current.fallback);
    },
    []
  );

  return { beginTilePress, markTileDrag, finishTilePress, activateTile };
}

// Default = no enhancement: presses just run their onPress action directly, so a
// card rendered outside a provider (e.g. an isolated component test) behaves
// exactly as a plain Pressable would.
const noopController: TilePressHandlers = {
  beginTilePress: () => undefined,
  markTileDrag: () => undefined,
  finishTilePress: () => undefined,
  activateTile: (fallbackAction) => fallbackAction(),
};

const TilePressContext = React.createContext<TilePressHandlers>(noopController);

export function TilePressProvider({
  value,
  children,
}: {
  value: TilePressHandlers;
  children: React.ReactNode;
}) {
  return <TilePressContext.Provider value={value}>{children}</TilePressContext.Provider>;
}

export function useTilePress(): TilePressHandlers {
  return React.useContext(TilePressContext);
}
