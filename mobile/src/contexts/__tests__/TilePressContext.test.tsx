import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { View } from 'react-native';
import {
  useTilePressController,
  TilePressProvider,
  useTilePress,
  type TilePressHandlers,
} from '@/contexts/TilePressContext';

// Capture the (stable) controller from a mounted harness so tests can drive the
// press lifecycle directly. The pending state lives in the harness's ref, so the
// tree is kept mounted for the life of each test.
function mountController(): TilePressHandlers {
  let handlers!: TilePressHandlers;
  function Harness() {
    handlers = useTilePressController();
    return React.createElement(View, null);
  }
  act(() => {
    TestRenderer.create(React.createElement(Harness));
  });
  return handlers;
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('useTilePressController — Home first-tap recovery', () => {
  it('runs the action immediately on a real onPress (happy path)', () => {
    const c = mountController();
    const action = jest.fn();
    act(() => {
      c.beginTilePress(action);
      c.activateTile(() => undefined);
    });
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('recovers an iOS-cancelled first tap via the onPressOut fallback', () => {
    const c = mountController();
    const action = jest.fn();
    // onPressIn → onPressOut with NO onPress (the cancelled-tap lifecycle).
    act(() => {
      c.beginTilePress(action);
      c.finishTilePress();
    });
    expect(action).not.toHaveBeenCalled(); // nothing until the tick fires
    act(() => jest.runAllTimers());
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire the fallback when the gesture was a scroll drag', () => {
    const c = mountController();
    const action = jest.fn();
    act(() => {
      c.beginTilePress(action);
      c.markTileDrag(); // an enclosing ScrollView reported a drag
      c.finishTilePress();
      jest.runAllTimers();
    });
    expect(action).not.toHaveBeenCalled();
  });

  it('suppresses the fallback even when the drag is reported after onPressOut', () => {
    const c = mountController();
    const action = jest.fn();
    act(() => {
      c.beginTilePress(action);
      c.finishTilePress(); // fallback armed first
      c.markTileDrag(); // ...then the scroll drag lands
      jest.runAllTimers();
    });
    expect(action).not.toHaveBeenCalled();
  });

  it('fires the action exactly once when both onPress and the fallback race', () => {
    const c = mountController();
    const action = jest.fn();
    act(() => {
      c.beginTilePress(action);
      c.finishTilePress(); // arms the fallback
      c.activateTile(() => undefined); // real onPress wins and cancels it
      jest.runAllTimers();
    });
    expect(action).toHaveBeenCalledTimes(1);
  });
});

describe('TilePressContext wiring', () => {
  it('defaults to a no-op controller that just runs the onPress action', () => {
    let handlers!: TilePressHandlers;
    function Consumer() {
      handlers = useTilePress();
      return React.createElement(View, null);
    }
    act(() => {
      TestRenderer.create(React.createElement(Consumer));
    });
    const fallback = jest.fn();
    act(() => handlers.activateTile(fallback)); // no provider → run directly
    expect(fallback).toHaveBeenCalledTimes(1);
  });

  it('shares one controller through the provider', () => {
    let provided!: TilePressHandlers;
    let consumed!: TilePressHandlers;
    function Tree() {
      provided = useTilePressController();
      return React.createElement(TilePressProvider, {
        value: provided,
        children: React.createElement(Consumer),
      });
    }
    function Consumer() {
      consumed = useTilePress();
      return React.createElement(View, null);
    }
    act(() => {
      TestRenderer.create(React.createElement(Tree));
    });
    expect(consumed).toBe(provided);

    // A tap driven through the consumed handlers runs the pending action.
    const action = jest.fn();
    act(() => {
      consumed.beginTilePress(action);
      consumed.finishTilePress();
      jest.runAllTimers();
    });
    expect(action).toHaveBeenCalledTimes(1);
  });
});
