import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { AccessibilityInfo, AppState, Linking, ScrollView, View, type AppStateStatus } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider } from "@/theme/ThemeContext";
import { GitaLanguageProvider, type Lang } from "@/data/gita/language";
import { FontScaleProvider } from "@/contexts/FontScaleContext";
import { FONT_SCALES, fontScaleFactor, type FontScale } from '@/theme/fontScale';
import LibraryCard from "@/components/LibraryCard";
import DarshanQuickScreen from "../DarshanQuickScreen";
import DarshanListScreen from "../DarshanListScreen";
import DarshanPlayerScreen from "../DarshanPlayerScreen";

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    SafeAreaView: (p: object) => React.createElement(View, p),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});
jest.mock("@/components/AppIcon", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("@/components/video/DockedYouTubePlayer", () => ({
  __esModule: true,
  default: (p: object) =>
    require("react").createElement(require("react-native").View, {
      ...p,
      testID: "youtube-native-boundary",
    }),
}));
const mockFocus: { blur?: () => void } = {};
jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (cb: () => () => void) => {
    require("react").useEffect(() => {
      const cleanup = cb();
      mockFocus.blur = cleanup;
      return cleanup;
    }, [cb]);
  },
}));
const nav = { navigate: jest.fn(), replace: jest.fn(), goBack: jest.fn() };
let trees: TestRenderer.ReactTestRenderer[] = [];
const flush = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};
async function render(
  screen: "quick" | "list" | "player",
  lang: Lang = "en",
  templeId = "somnath",
) {
  let tree!: TestRenderer.ReactTestRenderer;
  const component =
    screen === "quick" ? (
      <DarshanQuickScreen
        navigation={nav as never}
        route={{ key: "q", name: "DarshanQuick" }}
      />
    ) : screen === "list" ? (
      <DarshanListScreen
        navigation={nav as never}
        route={{ key: "l", name: "DarshanList" }}
      />
    ) : (
      <DarshanPlayerScreen
        navigation={nav as never}
        route={{ key: templeId, name: "DarshanPlayer", params: { templeId } }}
      />
    );
  await act(async () => {
    tree = TestRenderer.create(
      <FontScaleProvider>
        <ThemeProvider>
          <GitaLanguageProvider initialLang={lang}>
            {component}
          </GitaLanguageProvider>
        </ThemeProvider>
      </FontScaleProvider>,
    );
  });
  trees.push(tree);
  await flush();
  return tree;
}
function press(tree: TestRenderer.ReactTestRenderer, id: string) {
  act(() =>
    tree.root
      .findAll(
        (n) => n.props.testID === id && typeof n.props.onPress === "function",
      )[0]
      .props.onPress(),
  );
}
afterEach(() => {
  act(() => trees.forEach((t) => t.unmount()));
  trees = [];
  jest.restoreAllMocks();
  jest.clearAllMocks();
  jest.useRealTimers();
});

it.each(["hi", "en", "gu", "kn"] as Lang[])(
  "quick sheet uses real temples, closes and replaces itself with browse / player (%s)",
  async (lang) => {
    const tree = await render("quick", lang);
    expect([
      ...new Set(
        tree.root
          .findAll((p) => p.props.testID?.startsWith("darshan-temple-"))
          .map((p) => p.props.testID),
      ),
    ]).toHaveLength(2);
    press(tree, "darshan-temple-somnath");
    expect(nav.replace).toHaveBeenCalledWith("DarshanPlayer", {
      templeId: "somnath",
    });
    press(tree, "darshan-view-all");
    expect(nav.replace).toHaveBeenCalledWith("DarshanList");
    press(tree, "darshan-close");
    expect(nav.goBack).toHaveBeenCalled();
  },
);
it("browses actual channels, searches temple/city, and exposes a recoverable empty state", async () => {
  const tree = await render("list");
  const search = tree.root.findByProps({ testID: "darshan-search" });
  act(() => search.props.onChangeText("Varanasi"));
  expect([
    ...new Set(
      tree.root
        .findAll((p) => p.props.testID?.startsWith("darshan-temple-"))
        .map((p) => p.props.testID),
    ),
  ]).toHaveLength(1);
  press(tree, "darshan-temple-kashi-vishwanath");
  expect(nav.navigate).toHaveBeenCalledWith("DarshanPlayer", {
    templeId: "kashi-vishwanath",
  });
  act(() => search.props.onChangeText("nothing-matches"));
  expect(tree.root.findByProps({ testID: "darshan-empty" })).toBeDefined();
  act(() => search.props.onChangeText(""));
  expect([
    ...new Set(
      tree.root
        .findAll((p) => p.props.testID?.startsWith("darshan-temple-"))
        .map((p) => p.props.testID),
    ),
  ]).toHaveLength(9);
});
it("resolves the current official player, saves favourites and opens the actual guide", async () => {
  jest.spyOn(global, "fetch").mockResolvedValue({
    ok: true,
    url: "https://somnath.org/somnath-live-darshan",
    text: async () =>
      '<iframe src="https://www.youtube.com/embed/AAAAAAAAAAA">',
  } as Response);
  const tree = await render("player");
  expect(
    tree.root.findByProps({ testID: "youtube-native-boundary" }).props.mapping
      .videoId,
  ).toBe("AAAAAAAAAAA");
  press(tree, "darshan-save");
  await flush();
  expect(AsyncStorage.setItem).toHaveBeenCalledWith(
    "@vedansh/darshan-favourites-v1",
    expect.stringContaining("somnath"),
  );
  const reading = tree.root.findAllByType(LibraryCard)[0];
  act(() => reading.props.onPress());
  expect(nav.navigate).toHaveBeenCalledWith(
    "ChalisaReader",
    expect.any(Object),
  );
  press(tree, "darshan-guide");
  expect(nav.navigate).toHaveBeenCalledWith("TheerthDetail", {
    templeId: "somnath",
  });
  act(() => mockFocus.blur?.());
  expect(
    tree.root.findAllByProps({ testID: "youtube-native-boundary" }),
  ).toHaveLength(0);
  expect(tree.root.findByProps({ testID: "darshan-watch" })).toBeDefined();
});
it.each(['omkareshwar', 'dwarkadhish', 'naina-devi', 'mallikarjuna', 'tirupati-balaji', 'khatu-shyam', 'banke-bihari'])(
  'opens %s as a stable in-app channel player without outgoing links', async (templeId) => {
    const fetchMock = jest.spyOn(global, 'fetch');
    const external = jest.spyOn(Linking, 'openURL');
    const tree = await render('player', 'en', templeId);
    const channel = require('@/data/darshan/channels').darshanForTemple(templeId);
    expect(tree.root.findByProps({ testID: 'youtube-native-boundary' }).props.channelId).toBe(channel.channelId);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(tree.root.findAllByProps({ testID: 'darshan-youtube' })).toHaveLength(0);
    expect(tree.root.findAllByProps({ testID: 'darshan-website' })).toHaveLength(0);
    expect(external).not.toHaveBeenCalled();
  },
);
it('failed official lookup falls back to the visible in-app channel, and blur cancels a retry', async () => {
  const fetchMock = jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('offline'));
  const tree = await render('player');
  expect(tree.root.findByProps({ testID: 'youtube-native-boundary' }).props.channelId).toBe('UCT1egsvA08YcdMLiEu1DTRg');
  let signal: AbortSignal | undefined;
  fetchMock.mockImplementation((_url, options) => {
    signal = options?.signal as AbortSignal;
    return new Promise(() => {});
  });
  act(() => tree.root.findByProps({ testID: 'youtube-native-boundary' }).props.onRefreshSource());
  act(() => mockFocus.blur?.());
  expect(signal?.aborted).toBe(true);
});
it("backgrounding cancels lookup; no new player mounts from its late response", async () => {
  let background: ((s: AppStateStatus) => void) | undefined;
  let finish!: (r: Response) => void;
  jest
    .spyOn(AppState, "addEventListener")
    .mockImplementation((_e, listener) => {
      background = listener;
      return { remove: jest.fn() };
    });
  jest.spyOn(global, "fetch").mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const tree = await render("player");
  act(() => background?.("background"));
  await act(async () => {
    finish({
      ok: true,
      text: async () =>
        '<iframe src="https://www.youtube.com/embed/AAAAAAAAAAA">',
    } as Response);
  });
  expect(
    tree.root.findAllByProps({ testID: "youtube-native-boundary" }),
  ).toHaveLength(0);
});

it("a broadcast lookup times out with retry instead of leaving a permanent spinner", async () => {
  jest.useFakeTimers();
  jest.spyOn(global, "fetch").mockImplementation(() => new Promise(() => {}));
  const tree = await render("player");
  act(() => jest.advanceTimersByTime(12000));
  expect(tree.root.findByProps({ testID: 'youtube-native-boundary' }).props.channelId).toBe('UCT1egsvA08YcdMLiEu1DTRg');
});


it('embed Retry discovers a replacement video instead of remounting the broken ID', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValueOnce({ ok: true, text: async () => '<iframe src="https://www.youtube.com/embed/AAAAAAAAAAA">' } as Response).mockResolvedValueOnce({ ok: true, text: async () => '<iframe src="https://www.youtube.com/embed/BBBBBBBBBBB">' } as Response);
  const tree = await render('player');
  const player = tree.root.findByProps({ testID: 'youtube-native-boundary' });
  expect(player.props.mapping.videoId).toBe('AAAAAAAAAAA');
  await act(async () => player.props.onRefreshSource());
  await flush();
  expect(tree.root.findByProps({ testID: 'youtube-native-boundary' }).props.mapping.videoId).toBe('BBBBBBBBBBB');
});


it.each(['hi', 'en', 'gu', 'kn'] as Lang[])('shows sourced temple content, expandable story, real readings and in-app switching (%s)', async (lang) => {
  jest.spyOn(global, 'fetch').mockRejectedValue(new Error('source unavailable'));
  const tree = await render('player', lang);
  const temple = require('@/data/theerth/temples').getTempleDetailById('somnath');
  const localize = require('@/utils/localize');
  expect(JSON.stringify(tree.toJSON())).toContain(localize.meaningByLang(lang, temple.significanceHi, temple.significanceEn));
  expect(tree.root.findByProps({ testID: 'darshan-about' })).toBeDefined();
  expect(tree.root.findAllByType(LibraryCard).length).toBeGreaterThanOrEqual(3);
  press(tree, 'darshan-story');
  expect(tree.root.findByProps({ testID: 'darshan-story-content' }).props.children).toBe(localize.meaningByLang(lang, temple.originStoryHi, temple.originStoryEn));
  press(tree, 'darshan-story');
  expect(tree.root.findAllByProps({ testID: 'darshan-story-content' })).toHaveLength(0);
  press(tree, 'darshan-temple-omkareshwar');
  expect(nav.replace).toHaveBeenCalledWith('DarshanPlayer', { templeId: 'omkareshwar' });
});

it.each((['hi', 'en', 'gu', 'kn'] as Lang[]).flatMap(lang =>
  (Object.keys(FONT_SCALES) as FontScale[]).map(size => [lang, size] as const),
))('retains script, reading scale and a full-width pinned player (%s / %s)', async (lang, size) => {
  jest.spyOn(AsyncStorage, 'getItem').mockImplementation(async key => key === '@vedansh/font-scale' ? size : null);
  const tree = await render('player', lang, 'banke-bihari');
  expect(tree.root.findByProps({ testID: 'darshan-title' }).props.style.fontSize).toBe(24 * fontScaleFactor(size));
  const summary = tree.root.findByProps({ testID: 'darshan-summary' });
  expect(summary.findByType(require('@/components/LanguageToggle').default).props.compact).toBe(true);
  expect(tree.root.findByProps({ testID: 'darshan-title-row' }).props.style.flexWrap).toBe('wrap');
  expect(summary.findAllByType(require('@/components/darshan/DarshanUI').DarshanText).filter(n => n.props.testID === 'darshan-title')).toHaveLength(1);
  const hero = tree.root.findByProps({ testID: 'darshan-hero' });
  const body = tree.root.findByProps({ testID: 'darshan-content' });
  expect(hero.parent).toBe(body.parent); // player remains visible while content scrolls
  expect(tree.root.findAllByProps({ testID: 'darshan-youtube' })).toHaveLength(0);
});

it('retries the failed favourite snapshot in app without toggling the saved choice again', async () => {
  const write = jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('storage unavailable'));
  const tree = await render('player', 'en', 'banke-bihari');
  press(tree, 'darshan-save');
  await flush();
  const failedSnapshot = write.mock.calls[write.mock.calls.length - 1];
  press(tree, 'darshan-save-retry');
  await flush();
  expect(write.mock.calls[write.mock.calls.length - 1]).toEqual(failedSnapshot);
  expect(tree.root.findAllByProps({ testID: 'darshan-save-retry' })).toHaveLength(0);
});


it.each(['hi', 'en', 'gu', 'kn'] as Lang[])('opens the existing story after layout without retry/navigation (%s)', async lang => {
  jest.useFakeTimers();
  const tree = await render('player', lang, 'banke-bihari');
  const heading = tree.root.findAllByType(View).find(n => n.props.testID === 'darshan-story')!;
  const scroll = tree.root.findAllByType(ScrollView).find(n => n.props.testID === 'darshan-content')!;
  const measure = jest.spyOn(heading.instance, 'measureLayout').mockImplementation((_relative: unknown, done: unknown) => (done as (...args: any[]) => void)(0, 420, 200, 60));
  const scrollTo = jest.spyOn(scroll.instance, 'scrollTo');
  const focus = jest.spyOn(AccessibilityInfo, 'setAccessibilityFocus');
  jest.spyOn(require('react-native'), 'findNodeHandle').mockReturnValue(42);
  const player = tree.root.findByProps({ testID: 'youtube-native-boundary' });
  const read = () => act(() => player.props.onReadTempleStory());
  read();
  expect(tree.root.findByProps({ testID: 'darshan-story-content' })).toBeDefined();
  expect(scrollTo).not.toHaveBeenCalled();
  act(() => scroll.props.onContentSizeChange());
  act(() => jest.advanceTimersByTime(20));
  expect(measure).toHaveBeenCalled();
  expect(scrollTo).toHaveBeenCalledWith({ y: 420, animated: false });
  act(() => jest.advanceTimersByTime(20));
  expect(focus).toHaveBeenCalledWith(42);
  read(); read();
  act(() => jest.advanceTimersByTime(40));
  expect(tree.root.findByProps({ testID: 'darshan-story' }).props.accessibilityState.expanded).toBe(true);
  expect(tree.root.findByProps({ testID: 'youtube-native-boundary' })).toBe(player);
  expect(nav.navigate).not.toHaveBeenCalled();
  expect(nav.replace).not.toHaveBeenCalled();
  // A queued native measurement cannot steal focus after blur.
  let late!: (...args: any[]) => void;
  measure.mockImplementation((_relative: unknown, done: unknown) => { late = done as (...args: any[]) => void; });
  read();
  act(() => jest.advanceTimersByTime(20));
  act(() => mockFocus.blur?.());
  focus.mockClear(); scrollTo.mockClear();
  act(() => { late(0, 900, 200, 60); jest.advanceTimersByTime(40); });
  expect(focus).not.toHaveBeenCalled();
  expect(scrollTo).not.toHaveBeenCalled();
});
it.each(['', '   '])('withholds the shortcut when selected-language story is empty (%j)', async empty => {
  const data = require('@/data/theerth/temples');
  const original = data.getTempleDetailById('banke-bihari');
  jest.spyOn(data, 'getTempleDetailById').mockReturnValue({ ...original, originStoryEn: empty });
  const tree = await render('player', 'en', 'banke-bihari');
  expect(tree.root.findByProps({ testID: 'youtube-native-boundary' }).props.onReadTempleStory).toBeUndefined();
  expect(tree.root.findAllByProps({ testID: 'darshan-story' })).toHaveLength(0);
});


it('invalidates delayed focus and resets expansion when the same screen receives a new temple route', async () => {
  jest.useFakeTimers();
  const tree = await render('player', 'en', 'banke-bihari');
  const heading = tree.root.findAllByType(View).find(n => n.props.testID === 'darshan-story')!;
  let late!: (x: number, y: number, width: number, height: number) => void;
  jest.spyOn(heading.instance, 'measureLayout').mockImplementation((_relative: unknown, done: unknown) => { late = done as typeof late; });
  const focus = jest.spyOn(AccessibilityInfo, 'setAccessibilityFocus');
  act(() => tree.root.findByProps({ testID: 'youtube-native-boundary' }).props.onReadTempleStory());
  act(() => tree.root.findByProps({ testID: 'darshan-content' }).props.onContentSizeChange());
  act(() => jest.advanceTimersByTime(20));
  act(() => tree.update(<FontScaleProvider><ThemeProvider><GitaLanguageProvider initialLang="en">
    <DarshanPlayerScreen navigation={nav as never} route={{ key: 'banke-bihari', name: 'DarshanPlayer', params: { templeId: 'omkareshwar' } }} />
  </GitaLanguageProvider></ThemeProvider></FontScaleProvider>));
  expect(tree.root.findAllByProps({ testID: 'darshan-story-content' })).toHaveLength(0);
  act(() => { late(0, 420, 200, 60); jest.advanceTimersByTime(40); });
  expect(focus).not.toHaveBeenCalled();
  expect(tree.root.findByProps({ testID: 'youtube-native-boundary' }).props.mapping.titleEn).toContain('Omkareshwar');
});
