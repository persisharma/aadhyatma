/**
 * The cross-reader read-aloud contract.
 *
 * Mounts each read-aloud-enabled reader inside the REAL providers — which is also the
 * net that proves App.tsx is wired, since `useReadAloud` is a lenient hook whose
 * default silently renders no control. When a reader gains read-aloud (the v1.1
 * fan-out), add it to the READERS table below. RULEBOOK §3.
 */

import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
  impactAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn(() => Promise.resolve(null)) }));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(false)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));
jest.mock('@/audio/audioSession', () => ({ ensureBackgroundAudioMode: jest.fn() }));
jest.mock('@/contexts/AudioPlayerContext', () => ({
  useAudioPlayerContext: () => ({ playTrack: jest.fn(), openNowPlaying: jest.fn() }),
}));

// A speech engine with a Hindi voice, capturing every utterance.
jest.mock('expo-speech', () => {
  const calls: { text: string; options: Record<string, unknown> }[] = [];
  return {
    __esModule: true,
    speak: jest.fn((text: string, options: Record<string, unknown>) => calls.push({ text, options })),
    stop: jest.fn(() => Promise.resolve()),
    pause: jest.fn(() => Promise.resolve()),
    resume: jest.fn(() => Promise.resolve()),
    isSpeakingAsync: jest.fn(() => Promise.resolve(false)),
    getAvailableVoicesAsync: jest.fn(() =>
      Promise.resolve([
        { identifier: 'hi-voice', name: 'Lekha', quality: 'Default', language: 'hi-IN' },
      ])
    ),
    maxSpeechInputLength: 4000,
    __calls: calls,
  };
});

import * as Speech from 'expo-speech';
import { GitaLanguageProvider } from '@/data/gita/language';
import { ShareProvider } from '@/utils/shareVerse';
import { ReadAloudPrefsProvider } from '@/contexts/ReadAloudPrefsContext';
import { ReadAloudProvider } from '@/contexts/ReadAloudContext';
import { getChalisa } from '@/data/chalisaRegistry';
import { getGitaChapter } from '@/data/gita';
import ChalisaReaderScreen from '../ChalisaReaderScreen';
import GitaReaderScreen from '../GitaReaderScreen';

const speechMock = Speech as unknown as {
  __calls: { text: string; options: Record<string, unknown> }[];
  speak: jest.Mock;
};

/** Only the three methods the readers call; typed loosely on purpose. */
const navigation = {
  goBack: () => undefined,
  navigate: () => undefined,
  replace: () => undefined,
} as never;

/**
 * Every reader wired to read-aloud, with the first Devanagari line its page 1 should
 * speak. `firstSpokenLine` is read from the real bundled content, not hardcoded.
 */
const READERS: readonly {
  name: string;
  render: () => React.ReactElement;
  firstSpokenLine: string;
}[] = [
  {
    name: 'ChalisaReaderScreen (hanuman-chalisa)',
    render: () => (
      <ChalisaReaderScreen
        navigation={navigation}
        route={
          {
            key: 'r',
            name: 'ChalisaReader',
            params: { chalisaId: 'hanuman-chalisa', initialIndex: 0 },
          } as never
        }
      />
    ),
    firstSpokenLine: getChalisa('hanuman-chalisa').verses[0].lines[0],
  },
  {
    name: 'GitaReaderScreen (chapter 1)',
    render: () => (
      <GitaReaderScreen
        navigation={navigation}
        route={{ key: 'r', name: 'GitaReader', params: { chapter: 1, initialIndex: 0 } } as never}
      />
    ),
    firstSpokenLine: getGitaChapter(1).verses[0].sanskrit[0],
  },
];

let tree: TestRenderer.ReactTestRenderer | null = null;

async function mount(render: () => React.ReactElement) {
  await act(async () => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="hi">
        <ReadAloudPrefsProvider>
          <ReadAloudProvider>
            <ShareProvider>{render()}</ShareProvider>
          </ReadAloudProvider>
        </ReadAloudPrefsProvider>
      </GitaLanguageProvider>
    );
  });
  // Voice probe + prefs hydration.
  await act(async () => {
    await Promise.resolve();
  });
  return tree!;
}

/**
 * Matches on `accessibilityLabel` rather than component type: a `Pressable` renders
 * through several host/composite layers, so `findAllByType(Pressable)` misses it.
 * `.filter(has onPress)` keeps one node per control instead of every layer carrying
 * the inherited label. Same approach as JapamAlarmEditor.test.tsx's `byLabel`.
 */
function findByA11y(t: TestRenderer.ReactTestRenderer, label: string) {
  return t.root.findAll(
    (n) => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function'
  );
}

beforeEach(() => {
  speechMock.__calls.length = 0;
  speechMock.speak.mockClear();
});

afterEach(() => {
  if (tree) {
    act(() => tree!.unmount());
    tree = null;
  }
});

describe.each(READERS)('$name', ({ render, firstSpokenLine }) => {
  it('renders exactly one read-aloud control in the top bar', async () => {
    const t = await mount(render);
    // Exactly one: the control belongs in the header, NOT in the per-page
    // `topActions`, which would render one copy per verse page.
    expect(findByA11y(t, 'Read aloud')).toHaveLength(1);
  });

  it('speaks the first line of the current page when pressed', async () => {
    const t = await mount(render);

    await act(async () => {
      findByA11y(t, 'Read aloud')[0].props.onPress();
      await Promise.resolve();
    });

    expect(speechMock.speak).toHaveBeenCalled();
    expect(speechMock.__calls[0].text).toContain(firstSpokenLine.replace(/[।॥]/g, '').trim());
  });

  it('flips to a pause affordance while speaking', async () => {
    const t = await mount(render);

    await act(async () => {
      findByA11y(t, 'Read aloud')[0].props.onPress();
      await Promise.resolve();
    });

    expect(findByA11y(t, 'Pause reading aloud')).toHaveLength(1);
    expect(findByA11y(t, 'Read aloud')).toHaveLength(0);
  });

  it('returns to the idle affordance when paused', async () => {
    const t = await mount(render);

    await act(async () => {
      findByA11y(t, 'Read aloud')[0].props.onPress();
      await Promise.resolve();
    });
    await act(async () => {
      findByA11y(t, 'Pause reading aloud')[0].props.onPress();
      await Promise.resolve();
    });

    expect(findByA11y(t, 'Read aloud')).toHaveLength(1);
  });

  it('keeps the page counter visible beside the control', async () => {
    // The header's `sideWidth` had to grow for the extra glyph; if the counter is
    // squeezed out or the title is pushed off-centre, this is the tripwire.
    const t = await mount(render);
    const text = t.root
      .findAllByType(Text)
      .map((n) => n.props.children)
      .flat(Number.POSITIVE_INFINITY)
      .join(' ');
    // The counter renders as three children (`1`, ' / ', total), so match loosely.
    expect(text).toMatch(/1\s+\/\s+\d+/);
  });
});

describe('read-aloud is absent without a provider', () => {
  it('renders no control, so the other 18 readers are unaffected', async () => {
    // The lenient hook's default reports available: false. This is what keeps every
    // untouched reader suite green without adding a provider to it.
    await act(async () => {
      tree = TestRenderer.create(
        <GitaLanguageProvider initialLang="hi">
          <ShareProvider>{READERS[0].render()}</ShareProvider>
        </GitaLanguageProvider>
      );
    });

    expect(findByA11y(tree!, 'Read aloud')).toHaveLength(0);
    expect(speechMock.speak).not.toHaveBeenCalled();
  });
});
