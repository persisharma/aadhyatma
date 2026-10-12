import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AppState } from 'react-native';
import type { VideoMapping } from '@/data/video/videoMappings';

// ---- mocks ------------------------------------------------------------------

// Capture the latest props handed to the YoutubePlayer so tests can drive its
// callbacks and assert the controlled `play` flag.
const mockRnyi: { props?: Record<string, unknown> } = {};

jest.mock('react-native-youtube-iframe', () => {
  const React = require('react');
  const Player = React.forwardRef((props: Record<string, unknown>, ref: React.Ref<unknown>) => {
    mockRnyi.props = props;
    React.useImperativeHandle(ref, () => ({
      getCurrentTime: () => Promise.resolve(0),
      getDuration: () => Promise.resolve(0),
      seekTo: () => {},
    }));
    return null;
  });
  Player.displayName = 'YoutubePlayer';
  return {
    __esModule: true,
    default: Player,
    PLAYER_STATES: {
      ENDED: 'ended',
      PAUSED: 'paused',
      PLAYING: 'playing',
      UNSTARTED: 'unstarted',
      BUFFERING: 'buffering',
      VIDEO_CUED: 'video cued',
    },
    PLAYER_ERRORS: {
      HTML5_ERROR: 'HTML5_error',
      VIDEO_NOT_FOUND: 'video_not_found',
      EMBED_NOT_ALLOWED: 'embed_not_allowed',
      INVALID_PARAMETER: 'invalid_parameter',
    },
  };
});

jest.mock('@/components/AppIcon', () => ({ __esModule: true, default: () => null }));

jest.mock('@/theme/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      surface: '#fff',
      border: '#ccc',
      ink: '#000',
      inkMuted: '#666',
      saffron: '#B8621B',
      saffronDeep: '#8A3E0B',
      saffronTint: 'rgba(184,98,27,0.12)',
      onPrimary: '#fff',
      videoStage: '#000',
    },
  }),
}));

// The player is unit-tested outside a NavigationContainer, so stand in for
// useFocusEffect: run the effect on mount and stash the blur cleanup so a test
// can fire it (a tab switch) without a real navigator.
const mockFocus: { cleanup?: () => void } = {};
jest.mock('@react-navigation/native', () => {
  const ReactLib = require('react');
  return {
    useFocusEffect: (cb: () => void | (() => void)) => {
      ReactLib.useEffect(() => {
        const cleanup = cb();
        mockFocus.cleanup = typeof cleanup === 'function' ? cleanup : undefined;
      }, [cb]);
    },
  };
});

import DockedYouTubePlayer from '../DockedYouTubePlayer';
import * as arbiter from '@/audio/playbackArbiter';

const mapping: VideoMapping = {
  contentId: 'hanuman-chalisa',
  videoId: 'AETFvQonfV8',
  titleHi: 'श्री हनुमान चालीसा',
  titleEn: 'Shree Hanuman Chalisa',
  channel: 'T-Series Bhakti Sagar',
  sourceUrl: 'https://www.youtube.com/watch?v=AETFvQonfV8',
  spokenLang: 'hi',
  reviewedOn: '2026-10-12',
  status: 'verified',
};

function allText(root: TestRenderer.ReactTestRenderer): string {
  return JSON.stringify(root.toJSON());
}

beforeEach(() => {
  mockRnyi.props = undefined;
  jest.restoreAllMocks();
  jest.useRealTimers();
});

it('claims the playback arbiter the moment it opens', () => {
  const claim = jest.spyOn(arbiter, 'claimPlayback');
  let r!: TestRenderer.ReactTestRenderer;
  act(() => {
    r = TestRenderer.create(<DockedYouTubePlayer mapping={mapping} uiLang="en" onClose={() => {}} />);
  });
  expect(claim).toHaveBeenCalledWith('youtube');
  // Opens playing (the user tapped "Play video").
  expect(mockRnyi.props?.play).toBe(true);
  act(() => r.unmount());
});

it('shows the localized error card on a player error', () => {
  let r!: TestRenderer.ReactTestRenderer;
  act(() => {
    r = TestRenderer.create(<DockedYouTubePlayer mapping={mapping} uiLang="en" onClose={() => {}} />);
  });
  act(() => (mockRnyi.props?.onError as (e: string) => void)('embed_not_allowed'));
  expect(allText(r)).toContain('Can’t play this video');
  act(() => r.unmount());
});

it('pauses on background and never auto-resumes on foreground', () => {
  const handlers: ((s: string) => void)[] = [];
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_e, cb) => {
    handlers.push(cb as (s: string) => void);
    return { remove: jest.fn() } as never;
  });
  let r!: TestRenderer.ReactTestRenderer;
  act(() => {
    r = TestRenderer.create(<DockedYouTubePlayer mapping={mapping} uiLang="en" onClose={() => {}} />);
  });
  expect(mockRnyi.props?.play).toBe(true);
  act(() => handlers.forEach((h) => h('background')));
  expect(mockRnyi.props?.play).toBe(false);
  act(() => handlers.forEach((h) => h('active')));
  expect(mockRnyi.props?.play).toBe(false);
  act(() => r.unmount());
});

it('pauses when the reader loses focus (tab switch), without unmounting', () => {
  let r!: TestRenderer.ReactTestRenderer;
  act(() => {
    r = TestRenderer.create(<DockedYouTubePlayer mapping={mapping} uiLang="en" onClose={() => {}} />);
  });
  expect(mockRnyi.props?.play).toBe(true);
  // Simulate the reader blurring (switch to another tab): AppState stays `active`
  // because inactive tab stacks stay mounted, so only the blur cleanup pauses it.
  act(() => mockFocus.cleanup?.());
  expect(mockRnyi.props?.play).toBe(false);
  act(() => r.unmount());
});

it('falls out of the spinner into the error card when load times out', () => {
  jest.useFakeTimers();
  let r!: TestRenderer.ReactTestRenderer;
  act(() => {
    r = TestRenderer.create(<DockedYouTubePlayer mapping={mapping} uiLang="en" onClose={() => {}} />);
  });
  act(() => {
    jest.advanceTimersByTime(16000);
  });
  expect(allText(r)).toContain('Can’t play this video');
  act(() => r.unmount());
});

it('removes its AppState listener on unmount (no leak after teardown)', () => {
  const remove = jest.fn();
  jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove } as never);
  let r!: TestRenderer.ReactTestRenderer;
  act(() => {
    r = TestRenderer.create(<DockedYouTubePlayer mapping={mapping} uiLang="en" onClose={() => {}} />);
  });
  act(() => r.unmount());
  expect(remove).toHaveBeenCalled();
});
