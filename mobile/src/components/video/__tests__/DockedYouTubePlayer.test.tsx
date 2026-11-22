import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AppState, Linking, Platform } from 'react-native';
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
    typography: Object.fromEntries(['meaning', 'meaningEnglish', 'meaningGujarati', 'meaningKannada'].map(key => [key, { fontFamily: 'Test' }])),
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
import { GitaLanguageProvider } from '@/data/gita/language';
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

it('a resume from the embed’s own controls silences the source that paused it', () => {
  // Regression: the in-video ▶ (controls: true) reported PLAYING without claiming the
  // arbiter, so the bhajan that had paused the video kept playing over it.
  const stopRecorded = jest.fn();
  let r!: TestRenderer.ReactTestRenderer;
  act(() => {
    r = TestRenderer.create(<DockedYouTubePlayer mapping={mapping} uiLang="en" onClose={() => {}} />);
  });
  const unregister = arbiter.registerStopper('recorded', stopRecorded);
  // A bhajan starts: the arbiter pauses the video.
  act(() => arbiter.claimPlayback('recorded'));
  expect(mockRnyi.props?.play).toBe(false);
  expect(stopRecorded).not.toHaveBeenCalled();
  // The user taps play inside the video itself.
  const claim = jest.spyOn(arbiter, 'claimPlayback');
  act(() => (mockRnyi.props?.onChangeState as (s: string) => void)('playing'));
  expect(claim).toHaveBeenCalledWith('youtube');
  expect(stopRecorded).toHaveBeenCalledTimes(1);
  expect(mockRnyi.props?.play).toBe(true);
  unregister();
  act(() => r.unmount());
});

it('does not re-claim on a PLAYING report for playback it already owns', () => {
  let r!: TestRenderer.ReactTestRenderer;
  act(() => {
    r = TestRenderer.create(<DockedYouTubePlayer mapping={mapping} uiLang="en" onClose={() => {}} />);
  });
  const claim = jest.spyOn(arbiter, 'claimPlayback');
  act(() => (mockRnyi.props?.onChangeState as (s: string) => void)('playing'));
  expect(claim).not.toHaveBeenCalled();
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


it('broadcasts accept display metadata without forging recitation verification and skip duration polling', () => {
  jest.useFakeTimers();
  const interval = jest.spyOn(global, 'setInterval');
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<DockedYouTubePlayer mapping={{ videoId: 'AAAAAAAAAAA', titleHi: 'सोमनाथ', titleEn: 'Somnath', channel: 'Shree Somnath Trust' }} uiLang="en" broadcast onClose={() => {}} />); });
  act(() => (mockRnyi.props?.onReady as () => void)());
  expect(interval).not.toHaveBeenCalled();
  expect(allText(tree)).toContain('Temple broadcast');
  expect(allText(tree)).not.toContain('0:00');
  act(() => tree.unmount());
});


it('wires broadcast pause, play, close and fresh-source retry without app-owned outgoing links', () => {
  const close = jest.fn(), refresh = jest.fn();
  const external = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<DockedYouTubePlayer mapping={mapping} uiLang="en" broadcast onClose={close} onRefreshSource={refresh} />); });
  const tap = (label: string) => act(() => tree.root.findAll(n => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function')[0].props.onPress());
  tap('Pause'); expect(mockRnyi.props?.play).toBe(false);
  tap('Play'); expect(mockRnyi.props?.play).toBe(true);
  expect(tree.root.findAll(n => n.props.accessibilityLabel === 'Open in YouTube')).toHaveLength(0);
  expect(external).not.toHaveBeenCalled();
  tap('Close video'); expect(close).toHaveBeenCalledTimes(1);
  act(() => (mockRnyi.props?.onError as (e: string) => void)('embed_not_allowed'));
  const retry = tree.root.findAll(n => typeof n.props.onPress === 'function' && n.props.accessibilityRole === 'button')[0];
  act(() => retry.props.onPress()); expect(refresh).toHaveBeenCalledTimes(1);
  act(() => tree.unmount());
});

it('retains the reader same-video handoff while broadcast error recovery stays in app', () => {
  const external = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  const browse = jest.fn();
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<DockedYouTubePlayer mapping={mapping} uiLang="en" onClose={() => {}} />); });
  act(() => tree.root.findAll(n => n.props.accessibilityLabel === 'Open in YouTube' && typeof n.props.onPress === 'function')[0].props.onPress());
  expect(external).toHaveBeenCalledWith('https://www.youtube.com/watch?v=AETFvQonfV8');
  act(() => tree.unmount());
  act(() => { tree = TestRenderer.create(<DockedYouTubePlayer mapping={mapping} uiLang="en" broadcast onChooseBroadcast={browse} onClose={() => {}} />); });
  act(() => (mockRnyi.props?.onError as (e: string) => void)('embed_not_allowed'));
  expect(allText(tree)).not.toContain('Open in YouTube');
  const button = tree.root.findAll(n => n.props.accessibilityRole === 'button' && typeof n.props.onPress === 'function').find(n => n.props.onPress === browse);
  expect(button).toBeDefined();
  act(() => button!.props.onPress());
  expect(browse).toHaveBeenCalled();
  act(() => tree.unmount());
});

it('allows broadcast labels to wrap so large system text keeps both controls reachable', () => {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<DockedYouTubePlayer mapping={mapping} uiLang="kn" broadcast onClose={() => {}} />); });
  const label = tree.root.findAll(n => n.props.children === 'ದೇವಾಲಯದ ಪ್ರಸಾರ' && n.props.style)[0];
  expect(label.props.numberOfLines).toBeUndefined();
  expect(require('react-native').StyleSheet.flatten(label.props.style).flexShrink).toBe(1);
  act(() => tree.unmount());
});

describe('ANR-03: poster first, WebView after the sheet has painted (Android)', () => {
  afterEach(() => { jest.useRealTimers(); });

  it('shows a poster first and mounts the player a beat later on Android', () => {
    jest.useFakeTimers();
    jest.replaceProperty(Platform, 'OS', 'android');
    let r!: TestRenderer.ReactTestRenderer;
    act(() => {
      r = TestRenderer.create(<DockedYouTubePlayer mapping={mapping} uiLang="en" onClose={() => {}} />);
    });
    expect(mockRnyi.props).toBeUndefined();
    expect(r.root.findAllByProps({ testID: 'youtube-poster' }).length).toBeGreaterThan(0);
    act(() => { jest.advanceTimersByTime(200); });
    expect(mockRnyi.props?.videoId).toBe(mapping.videoId);
    expect(r.root.findAllByProps({ testID: 'youtube-poster' })).toHaveLength(0);
    act(() => r.unmount());
  });

  it('mounts the player at once on iOS (the Chromium stall is Android-only)', () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    let r!: TestRenderer.ReactTestRenderer;
    act(() => {
      r = TestRenderer.create(<DockedYouTubePlayer mapping={mapping} uiLang="en" onClose={() => {}} />);
    });
    expect(mockRnyi.props?.videoId).toBe(mapping.videoId);
    act(() => r.unmount());
  });
});

it('UX-09: a failed "Open in YouTube" shows a brief message', async () => {
  jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('no handler'));
  let r!: TestRenderer.ReactTestRenderer;
  act(() => {
    r = TestRenderer.create(<DockedYouTubePlayer mapping={mapping} uiLang="en" onClose={() => {}} />);
  });
  expect(r.root.findAllByProps({ testID: 'youtube-open-failed' })).toHaveLength(0);
  const open = r.root.find((n) => n.props.accessibilityLabel === 'Open in YouTube' && typeof n.props.onPress === 'function');
  await act(async () => { open.props.onPress(); });
  expect(allText(r)).toContain('Couldn’t open YouTube');
  act(() => r.unmount());
});


it.each([
  ['hi', 'मंदिर की कथा पढ़ें'], ['en', 'Read temple story'],
  ['gu', 'મંદિરની કથા વાંચો'], ['kn', 'ದೇವಾಲಯದ ಕಥೆಯನ್ನು ಓದಿ'],
] as const)('offers a story only after a broadcast failure (%s)', (lang, label) => {
  const story = jest.fn();
  const retry = jest.fn();
  const browse = jest.fn();
  const claim = jest.spyOn(arbiter, 'claimPlayback');
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<GitaLanguageProvider initialLang={lang}><DockedYouTubePlayer mapping={mapping} uiLang={lang} broadcast onReadTempleStory={story} onRefreshSource={retry} onChooseBroadcast={browse} onClose={() => {}} /></GitaLanguageProvider>); });
  expect(allText(tree)).not.toContain(label);
  act(() => (mockRnyi.props?.onReady as () => void)());
  expect(allText(tree)).not.toContain(label);
  act(() => (mockRnyi.props?.onError as (e: string) => void)('embed_not_allowed'));
  expect(allText(tree)).toContain(label);
  const claims = claim.mock.calls.length;
  const action = tree.root.findAll(n => n.props.testID === 'darshan-read-story' && n.props.accessibilityRole === 'button')[0];
  act(() => { action.props.onPress(); action.props.onPress(); });
  expect(story).toHaveBeenCalledTimes(2);
  expect(retry).not.toHaveBeenCalled();
  expect(browse).not.toHaveBeenCalled();
  expect(claim).toHaveBeenCalledTimes(claims);
  act(() => tree.unmount());
});
it.each([false, true])('does not offer absent stories or change reader recovery (broadcast=%s)', broadcast => {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<DockedYouTubePlayer mapping={mapping} uiLang="en" broadcast={broadcast} onReadTempleStory={broadcast ? undefined : jest.fn()} onClose={() => {}} />); });
  act(() => (mockRnyi.props?.onError as (e: string) => void)('embed_not_allowed'));
  expect(allText(tree)).not.toContain('Read temple story');
  expect(allText(tree)).toContain('Retry');
  if (!broadcast) expect(allText(tree)).toContain('YouTube');
  act(() => tree.unmount());
});
