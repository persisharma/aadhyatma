import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';

jest.mock('@/audio/audioSession', () => ({ ensureBackgroundAudioMode: jest.fn() }));

const voiceList = [
  { identifier: 'hi-enhanced', name: 'Lekha Premium', quality: 'Enhanced', language: 'hi-IN' },
  { identifier: 'hi-default', name: 'Lekha', quality: 'Default', language: 'hi-IN' },
];

jest.mock('expo-speech', () => {
  const calls: { text: string; options: Record<string, unknown> }[] = [];
  return {
    __esModule: true,
    speak: jest.fn((text: string, options: Record<string, unknown>) => calls.push({ text, options })),
    stop: jest.fn(() => Promise.resolve()),
    pause: jest.fn(() => Promise.resolve()),
    resume: jest.fn(() => Promise.resolve()),
    isSpeakingAsync: jest.fn(() => Promise.resolve(false)),
    getAvailableVoicesAsync: jest.fn(() => Promise.resolve(voiceList)),
    maxSpeechInputLength: 4000,
    __calls: calls,
  };
});

import * as Speech from 'expo-speech';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { ThemeProvider } from '@/theme/ThemeContext';
import { GitaLanguageProvider, type Lang } from '@/data/gita/language';
import { ReadAloudPrefsProvider } from '@/contexts/ReadAloudPrefsContext';
import { ReadAloudProvider } from '@/contexts/ReadAloudContext';
import ReadAloudSettingsSheet, { readAloudRowLabel } from '../ReadAloudSettingsSheet';
import { READING_SIZE_SAMPLE } from '../ReadingSizePickerSheet';
import { DEFAULT_READ_ALOUD_PREFS } from '@/readAloud/prefs';

const speechMock = Speech as unknown as {
  __calls: { text: string; options: Record<string, unknown> }[];
  speak: jest.Mock;
  getAvailableVoicesAsync: jest.Mock;
};

const store: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((k: string) => Promise.resolve(store[k] ?? null)),
  setItem: jest.fn((k: string, v: string) => {
    store[k] = v;
    return Promise.resolve();
  }),
}));

let tree: TestRenderer.ReactTestRenderer | null = null;

async function renderSheet(lang: Lang = 'hi') {
  await act(async () => {
    tree = TestRenderer.create(
      <FontScaleProvider>
        <ThemeProvider>
          <GitaLanguageProvider initialLang={lang}>
            <ReadAloudPrefsProvider>
              <ReadAloudProvider>
                <ReadAloudSettingsSheet visible onClose={() => {}} />
              </ReadAloudProvider>
            </ReadAloudPrefsProvider>
          </GitaLanguageProvider>
        </ThemeProvider>
      </FontScaleProvider>
    );
  });
  await act(async () => {
    await Promise.resolve();
  });
  return tree!;
}

function byLabel(t: TestRenderer.ReactTestRenderer, label: string) {
  return t.root.findAll(
    (n) => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function'
  );
}

function allText(t: TestRenderer.ReactTestRenderer): string {
  return t.root
    .findAllByType(Text)
    .map((n) => n.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k];
  speechMock.__calls.length = 0;
  speechMock.speak.mockClear();
  speechMock.getAvailableVoicesAsync.mockResolvedValue(voiceList);
});

afterEach(() => {
  if (tree) {
    act(() => tree!.unmount());
    tree = null;
  }
});

describe('readAloudRowLabel', () => {
  it('reports what is spoken plus the rate', () => {
    expect(readAloudRowLabel(DEFAULT_READ_ALOUD_PREFS, 'en', 'ready')).toBe('Verse & meaning · 1.0×');
    expect(
      readAloudRowLabel({ ...DEFAULT_READ_ALOUD_PREFS, readMeaning: false, rate: 1.3 }, 'en', 'ready')
    ).toBe('Verse only · 1.3×');
  });

  it('reports unavailability ahead of any preference', () => {
    expect(readAloudRowLabel(DEFAULT_READ_ALOUD_PREFS, 'en', 'unavailable')).toBe('Unavailable');
  });

  it('localizes into all four languages', () => {
    for (const lang of ['hi', 'en', 'gu', 'kn'] as const) {
      expect(readAloudRowLabel(DEFAULT_READ_ALOUD_PREFS, lang, 'ready')).toMatch(/1\.0×$/);
    }
  });
});

describe('voice selection', () => {
  it('lists Automatic plus the probed voices, Enhanced first', async () => {
    const t = await renderSheet();
    expect(byLabel(t, 'Automatic voice')).toHaveLength(1);
    expect(byLabel(t, 'Voice Lekha Premium')).toHaveLength(1);
    expect(byLabel(t, 'Voice Lekha')).toHaveLength(1);

    const text = allText(t);
    expect(text.indexOf('Lekha Premium')).toBeLessThan(text.lastIndexOf('Lekha'));
  });

  it('starts on Automatic and persists an explicit choice', async () => {
    const t = await renderSheet();
    expect(byLabel(t, 'Automatic voice')[0].props.accessibilityState.selected).toBe(true);

    await act(async () => {
      byLabel(t, 'Voice Lekha')[0].props.onPress();
    });

    expect(byLabel(t, 'Voice Lekha')[0].props.accessibilityState.selected).toBe(true);
    expect(byLabel(t, 'Automatic voice')[0].props.accessibilityState.selected).toBe(false);
    expect(JSON.parse(store['@vedansh/read-aloud']).voiceByTarget.hi).toBe('hi-default');
  });
});

describe('rate', () => {
  it('steps and clamps at both bounds', async () => {
    const t = await renderSheet();

    await act(async () => {
      byLabel(t, 'Faster')[0].props.onPress();
    });
    // `{value.toFixed(1)}×` renders as two children, so match across the join.
    expect(allText(t)).toMatch(/1\.1\s*×/);

    // Walk to the ceiling; the button then reports itself disabled.
    for (let i = 0; i < 10; i += 1) {
      await act(async () => {
        byLabel(t, 'Faster')[0].props.onPress();
      });
    }
    expect(allText(t)).toMatch(/1\.5\s*×/);
    expect(byLabel(t, 'Faster')[0].props.accessibilityState.disabled).toBe(true);

    for (let i = 0; i < 20; i += 1) {
      await act(async () => {
        byLabel(t, 'Slower')[0].props.onPress();
      });
    }
    expect(allText(t)).toMatch(/0\.5\s*×/);
    expect(byLabel(t, 'Slower')[0].props.accessibilityState.disabled).toBe(true);
  });
});

describe('what to read', () => {
  it('has meaning ON and commentary OFF by default', async () => {
    const t = await renderSheet();
    expect(byLabel(t, 'Read meaning')[0].props.accessibilityState.checked).toBe(true);
    expect(byLabel(t, 'Read commentary')[0].props.accessibilityState.checked).toBe(false);
  });

  it('toggles and persists', async () => {
    const t = await renderSheet();

    await act(async () => {
      byLabel(t, 'Read commentary')[0].props.onPress();
    });

    expect(byLabel(t, 'Read commentary')[0].props.accessibilityState.checked).toBe(true);
    expect(JSON.parse(store['@vedansh/read-aloud']).readCommentary).toBe(true);
  });
});

describe('preview', () => {
  it('speaks the shared reading-size sample line', async () => {
    const t = await renderSheet();

    await act(async () => {
      byLabel(t, 'Preview voice')[0].props.onPress();
      await Promise.resolve();
    });

    expect(speechMock.speak).toHaveBeenCalled();
    expect(speechMock.__calls[0].text).toBe(READING_SIZE_SAMPLE.hi);
  });

  it('previews in the active script', async () => {
    const t = await renderSheet('kn');

    await act(async () => {
      byLabel(t, 'Preview voice')[0].props.onPress();
      await Promise.resolve();
    });

    expect(speechMock.__calls[0].text).toBe(READING_SIZE_SAMPLE.kn);
  });
});

describe('the unavailable state', () => {
  it('replaces the voice list with an explainer and a retry', async () => {
    speechMock.getAvailableVoicesAsync.mockResolvedValue([]);
    const t = await renderSheet();

    expect(byLabel(t, 'Automatic voice')).toHaveLength(0);
    expect(byLabel(t, 'Check again for voices')).toHaveLength(1);
    // No preview to offer when nothing can speak.
    expect(byLabel(t, 'Preview voice')).toHaveLength(0);
  });

  it('re-probes on retry and recovers when voice data appears', async () => {
    speechMock.getAvailableVoicesAsync.mockResolvedValue([]);
    const t = await renderSheet();
    expect(byLabel(t, 'Check again for voices')).toHaveLength(1);

    speechMock.getAvailableVoicesAsync.mockResolvedValue(voiceList);
    await act(async () => {
      byLabel(t, 'Check again for voices')[0].props.onPress();
      await Promise.resolve();
    });

    expect(byLabel(t, 'Automatic voice')).toHaveLength(1);
  });

  it('still offers speed and what-to-read, so the prefs stay editable', async () => {
    speechMock.getAvailableVoicesAsync.mockResolvedValue([]);
    const t = await renderSheet();
    expect(byLabel(t, 'Faster')).toHaveLength(1);
    expect(byLabel(t, 'Read meaning')).toHaveLength(1);
  });
});

describe('the gu/kn disclosure', () => {
  it('tells Gujarati and Kannada readers they will hear Hindi', async () => {
    // They read a transliterated script but the speech path uses the Devanagari
    // source with a Hindi voice — surprising unless it is said out loud.
    for (const lang of ['gu', 'kn'] as const) {
      const t = await renderSheet(lang);
      expect(allText(t)).toMatch(lang === 'gu' ? /હિન્દી આવાજ/ : /ಹಿಂದಿ ಧ್ವನಿ/);
      act(() => t.unmount());
      tree = null;
    }
  });

  it('shows no such note for Hindi or English readers', async () => {
    const t = await renderSheet('hi');
    expect(allText(t)).not.toMatch(/હિન્દી આવાજ/);
  });
});
