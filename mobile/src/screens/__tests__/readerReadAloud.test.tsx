/**
 * The cross-reader read-aloud contract.
 *
 * Mounts EVERY reader inside the REAL providers — which is also the net that proves
 * App.tsx is wired, since `useReadAloud` is a lenient hook whose default silently
 * renders no control. Every reader (Japam excepted — it is a counter, not a reader)
 * carries read-aloud, so a new reader must be added to the READERS table below or this
 * suite is how its missing control is caught. RULEBOOK §3.
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
import { prepareForSpeech } from '@/readAloud/pronounce';
import { getChalisa } from '@/data/chalisaRegistry';
import { getGitaChapter } from '@/data/gita';
import { getAarti } from '@/data/aarti';
import { getAshtakam } from '@/data/ashtakam';
import { getKavacham } from '@/data/kavacham';
import { getStuti } from '@/data/stuti';
import { getSuktam } from '@/data/suktam';
import { getSanskar } from '@/data/sanskar';
import { getKathaContent } from '@/panchang/kathaContent';
import { getBajrangBaanChapter } from '@/data/bajrang-baan';
import { getHanumanAshtakChapter } from '@/data/hanuman-ashtak';
import { getKrishnaStotramChapter } from '@/data/krishna-stotram';
import { getRamStutiChapter } from '@/data/ram-stuti';
import { getRamcharitmanasChapter } from '@/data/ramcharitmanas';
import { getShivaStrotamChapter } from '@/data/shiva-strotam';
import { getSundarkandChapter } from '@/data/sundarkand';
import { getGaneshStotramChapter } from '@/data/ganesh-stotram';
import { getDurgaStotramChapter } from '@/data/durga-stotram';
import { getSaraswatiStotramChapter } from '@/data/saraswati-stotram';
import { getVishnuSahasranamaChapter } from '@/data/vishnu-sahasranama';
import { getValmikiRamayanChapter } from '@/data/valmiki-ramayan';
import ChalisaReaderScreen from '../ChalisaReaderScreen';
import GitaReaderScreen from '../GitaReaderScreen';
import AartiReaderScreen from '../AartiReaderScreen';
import AshtakamReaderScreen from '../AshtakamReaderScreen';
import KavachamReaderScreen from '../KavachamReaderScreen';
import StutiReaderScreen from '../StutiReaderScreen';
import SuktamReaderScreen from '../SuktamReaderScreen';
import SanskarReaderScreen from '../SanskarReaderScreen';
import VratKathaReaderScreen from '../VratKathaReaderScreen';
import BajrangBaanReaderScreen from '../BajrangBaanReaderScreen';
import HanumanAshtakReaderScreen from '../HanumanAshtakReaderScreen';
import KrishnaStotramReaderScreen from '../KrishnaStotramReaderScreen';
import RamStutiReaderScreen from '../RamStutiReaderScreen';
import RamcharitmanasReaderScreen from '../RamcharitmanasReaderScreen';
import ShivaStrotamReaderScreen from '../ShivaStrotamReaderScreen';
import SundarkandReaderScreen from '../SundarkandReaderScreen';
import GaneshStotramReaderScreen from '../GaneshStotramReaderScreen';
import DurgaStotramReaderScreen from '../DurgaStotramReaderScreen';
import SaraswatiStotramReaderScreen from '../SaraswatiStotramReaderScreen';
import VishnuSahasranamaReaderScreen from '../VishnuSahasranamaReaderScreen';
import ValmikiRamayanReaderScreen from '../ValmikiRamayanReaderScreen';

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
 * Any reader screen. `never` props are assignable to every screen's real props, so
 * the table below needs no per-screen cast.
 */
type AnyReaderScreen = React.ComponentType<{ navigation: never; route: never }>;

type ReaderEntry = {
  name: string;
  Screen: AnyReaderScreen;
  routeName: string;
  params: Record<string, unknown>;
  /** First Devanagari line page 1 speaks, read from the real bundled content. */
  firstSpokenLine: string;
};

function screen(
  Screen: AnyReaderScreen,
  routeName: string,
  params: Record<string, unknown>
): Pick<ReaderEntry, 'Screen' | 'routeName' | 'params'> {
  return { Screen, routeName, params };
}

function readerElement({ Screen, routeName, params }: ReaderEntry) {
  return (
    <Screen navigation={navigation} route={{ key: 'r', name: routeName, params } as never} />
  );
}

/**
 * The first Devanagari line page 1 speaks, read from the real bundled content. A
 * stotram's chapter 1 opens on an intro page with no lines, which the controller
 * skips rather than stalls on — so the first *non-empty* line is what is heard.
 */
function firstLine(pages: readonly (readonly string[])[]): string {
  const page = pages.find((lines) => lines.some((l) => l.trim().length > 0));
  if (!page) throw new Error('fixture has no speakable line');
  return page.find((l) => l.trim().length > 0)!;
}

function chapter1<T>(get: (chapter: number) => T | null | undefined): T {
  const c = get(1);
  if (!c) throw new Error('chapter 1 must exist');
  return c;
}

const katha = getKathaContent('nirjala-ekadashi-katha');
if (!katha) throw new Error('fixture katha must exist');

/**
 * Every reader wired to read-aloud. `firstSpokenLine` comes from the bundled content,
 * not hardcoded. Japam is deliberately absent: it is a counter, not a reader.
 */
const READERS: readonly ReaderEntry[] = [
  {
    name: 'ChalisaReaderScreen (hanuman-chalisa)',
    ...screen(ChalisaReaderScreen, 'ChalisaReader', {
      chalisaId: 'hanuman-chalisa',
      initialIndex: 0,
    }),
    firstSpokenLine: firstLine(getChalisa('hanuman-chalisa').verses.map((v) => v.lines)),
  },
  {
    name: 'GitaReaderScreen (chapter 1)',
    ...screen(GitaReaderScreen, 'GitaReader', { chapter: 1, initialIndex: 0 }),
    firstSpokenLine: firstLine(getGitaChapter(1).verses.map((v) => v.sanskrit)),
  },
  {
    name: 'AartiReaderScreen (index 0)',
    ...screen(AartiReaderScreen, 'AartiReader', { aartiIndex: 0, initialIndex: 0 }),
    firstSpokenLine: firstLine(getAarti(0).verses.map((v) => v.lines)),
  },
  {
    name: 'AshtakamReaderScreen (lingashtakam)',
    ...screen(AshtakamReaderScreen, 'AshtakamReader', {
      ashtakamId: 'lingashtakam',
      initialIndex: 0,
    }),
    firstSpokenLine: firstLine(getAshtakam('lingashtakam').verses.map((v) => v.lines)),
  },
  {
    name: 'KavachamReaderScreen (rama-raksha-stotra)',
    ...screen(KavachamReaderScreen, 'KavachamReader', {
      kavachamId: 'rama-raksha-stotra',
      initialIndex: 0,
    }),
    firstSpokenLine: firstLine(getKavacham('rama-raksha-stotra').verses.map((v) => v.lines)),
  },
  {
    name: 'StutiReaderScreen (krishna-stuti)',
    ...screen(StutiReaderScreen, 'StutiReader', { stutiId: 'krishna-stuti', initialIndex: 0 }),
    firstSpokenLine: firstLine(getStuti('krishna-stuti').verses.map((v) => v.lines)),
  },
  {
    name: 'SuktamReaderScreen (devi-suktam)',
    ...screen(SuktamReaderScreen, 'SuktamReader', { suktamId: 'devi-suktam', initialIndex: 0 }),
    firstSpokenLine: firstLine(getSuktam('devi-suktam').verses.map((v) => v.lines)),
  },
  {
    name: 'SanskarReaderScreen (prabhati-shloka)',
    ...screen(SanskarReaderScreen, 'SanskarReader', {
      sanskarId: 'prabhati-shloka',
      initialIndex: 0,
    }),
    firstSpokenLine: firstLine(getSanskar('prabhati-shloka').verses.map((v) => v.lines)),
  },
  {
    // Prose: the katha body IS the text (adapter's `bodyHi` branch).
    name: 'VratKathaReaderScreen (nirjala-ekadashi-katha)',
    ...screen(VratKathaReaderScreen, 'VratKathaReader', { kathaId: 'nirjala-ekadashi-katha' }),
    firstSpokenLine: firstLine(katha.sections.map((s) => s.bodyHi)),
  },
  {
    name: 'BajrangBaanReaderScreen (chapter 1)',
    ...screen(BajrangBaanReaderScreen, 'BajrangBaanReader', { chapter: 1, initialIndex: 0 }),
    firstSpokenLine: firstLine(chapter1(getBajrangBaanChapter).verses.map((v) => v.lines)),
  },
  {
    name: 'HanumanAshtakReaderScreen (chapter 1)',
    ...screen(HanumanAshtakReaderScreen, 'HanumanAshtakReader', { chapter: 1, initialIndex: 0 }),
    firstSpokenLine: firstLine(chapter1(getHanumanAshtakChapter).verses.map((v) => v.sanskrit)),
  },
  {
    name: 'KrishnaStotramReaderScreen (chapter 1)',
    ...screen(KrishnaStotramReaderScreen, 'KrishnaStotramReader', { chapter: 1, initialIndex: 0 }),
    firstSpokenLine: firstLine(chapter1(getKrishnaStotramChapter).verses.map((v) => v.sanskrit)),
  },
  {
    name: 'RamStutiReaderScreen (chapter 1)',
    ...screen(RamStutiReaderScreen, 'RamStutiReader', { chapter: 1, initialIndex: 0 }),
    firstSpokenLine: firstLine(chapter1(getRamStutiChapter).verses.map((v) => v.sanskrit)),
  },
  {
    name: 'RamcharitmanasReaderScreen (chapter 1)',
    ...screen(RamcharitmanasReaderScreen, 'RamcharitmanasReader', { chapter: 1, initialIndex: 0 }),
    firstSpokenLine: firstLine(chapter1(getRamcharitmanasChapter).verses.map((v) => v.lines)),
  },
  {
    name: 'ShivaStrotamReaderScreen (chapter 1)',
    ...screen(ShivaStrotamReaderScreen, 'ShivaStrotamReader', { chapter: 1, initialIndex: 0 }),
    firstSpokenLine: firstLine(chapter1(getShivaStrotamChapter).verses.map((v) => v.sanskrit)),
  },
  {
    name: 'SundarkandReaderScreen (chapter 1)',
    ...screen(SundarkandReaderScreen, 'SundarkandReader', { chapter: 1, initialIndex: 0 }),
    firstSpokenLine: firstLine(chapter1(getSundarkandChapter).verses.map((v) => v.lines)),
  },
  {
    name: 'GaneshStotramReaderScreen (chapter 1)',
    ...screen(GaneshStotramReaderScreen, 'GaneshStotramReader', { chapter: 1, initialIndex: 0 }),
    firstSpokenLine: firstLine(chapter1(getGaneshStotramChapter).verses.map((v) => v.sanskrit)),
  },
  {
    name: 'DurgaStotramReaderScreen (chapter 1)',
    ...screen(DurgaStotramReaderScreen, 'DurgaStotramReader', { chapter: 1, initialIndex: 0 }),
    firstSpokenLine: firstLine(chapter1(getDurgaStotramChapter).verses.map((v) => v.sanskrit)),
  },
  {
    name: 'SaraswatiStotramReaderScreen (chapter 1)',
    ...screen(SaraswatiStotramReaderScreen, 'SaraswatiStotramReader', {
      chapter: 1,
      initialIndex: 0,
    }),
    firstSpokenLine: firstLine(chapter1(getSaraswatiStotramChapter).verses.map((v) => v.sanskrit)),
  },
  {
    name: 'VishnuSahasranamaReaderScreen (chapter 1)',
    ...screen(VishnuSahasranamaReaderScreen, 'VishnuSahasranamaReader', {
      chapter: 1,
      initialIndex: 0,
    }),
    firstSpokenLine: firstLine(chapter1(getVishnuSahasranamaChapter).verses.map((v) => v.sanskrit)),
  },
  {
    name: 'ValmikiRamayanReaderScreen (kāṇḍa 1)',
    ...screen(ValmikiRamayanReaderScreen, 'ValmikiRamayanReader', { chapter: 1, initialIndex: 0 }),
    firstSpokenLine: firstLine(chapter1(getValmikiRamayanChapter).verses.map((v) => v.lines)),
  },
];

let tree: TestRenderer.ReactTestRenderer | null = null;

async function mount(entry: ReaderEntry) {
  await act(async () => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="hi">
        <ReadAloudPrefsProvider>
          <ReadAloudProvider>
            <ShareProvider>{readerElement(entry)}</ShareProvider>
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

describe.each(READERS)('$name', (entry) => {
  const { firstSpokenLine } = entry;
  it('renders exactly one read-aloud control on the toggle row', async () => {
    const t = await mount(entry);
    // Exactly one: the control is a screen-level control on the language-toggle
    // row, NOT in the per-page `topActions` (one copy per verse page).
    expect(findByA11y(t, 'Read aloud')).toHaveLength(1);
  });

  it('speaks the first line of the current page when pressed', async () => {
    const t = await mount(entry);

    await act(async () => {
      findByA11y(t, 'Read aloud')[0].props.onPress();
      await Promise.resolve();
    });

    expect(speechMock.speak).toHaveBeenCalled();
    // The utterance is the line after the synthesizer normalisation (dandas → stops,
    // avagraha dropped), so compare against the same transform. A long katha
    // paragraph may be packed into several utterances; its leading run is always in
    // the first one.
    const expected = prepareForSpeech(firstSpokenLine, 'hi').slice(0, 40);
    expect(expected.length).toBeGreaterThan(0);
    expect(speechMock.__calls[0].text).toContain(expected);
  });

  it('flips to a pause affordance while speaking', async () => {
    const t = await mount(entry);

    await act(async () => {
      findByA11y(t, 'Read aloud')[0].props.onPress();
      await Promise.resolve();
    });

    expect(findByA11y(t, 'Pause reading aloud')).toHaveLength(1);
    expect(findByA11y(t, 'Read aloud')).toHaveLength(0);
  });

  it('returns to the idle affordance when paused', async () => {
    const t = await mount(entry);

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

  it('keeps the page counter visible in the header', async () => {
    // The control lives on the toggle row, off the header, so the counter keeps its
    // space; if the counter is ever squeezed out again, this is the tripwire.
    const t = await mount(entry);
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
  it('renders no control, so a reader suite mounted without the provider is unaffected', async () => {
    // The lenient hook's default reports available: false. This is what keeps every
    // reader's own smoke suite green without adding a provider to it.
    await act(async () => {
      tree = TestRenderer.create(
        <GitaLanguageProvider initialLang="hi">
          <ShareProvider>{readerElement(READERS[0])}</ShareProvider>
        </GitaLanguageProvider>
      );
    });

    expect(findByA11y(tree!, 'Read aloud')).toHaveLength(0);
    expect(speechMock.speak).not.toHaveBeenCalled();
  });
});
