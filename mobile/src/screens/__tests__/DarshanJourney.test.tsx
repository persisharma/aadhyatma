import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { AppState, Linking, type AppStateStatus } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider } from "@/theme/ThemeContext";
import { GitaLanguageProvider, type Lang } from "@/data/gita/language";
import { FontScaleProvider } from "@/contexts/FontScaleContext";
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
it("a channel-only temple never fetches/silently replays an old video and offers the exact official channel", async () => {
  const fetchMock = jest.spyOn(global, "fetch");
  const open = jest.spyOn(Linking, "openURL").mockResolvedValue(true);
  const tree = await render("player", "en", "khatu-shyam");
  expect(fetchMock).not.toHaveBeenCalled();
  expect(
    tree.root.findAllByProps({ testID: "youtube-native-boundary" }),
  ).toHaveLength(0);
  press(tree, "darshan-youtube");
  expect(open).toHaveBeenCalledWith(
    "https://www.youtube.com/channel/UCT-3fEwrrxlwMrWgMvoqt-w/live",
  );
});
it("network failure exposes retry and YouTube; dismissing during a pending lookup aborts it", async () => {
  const fetchMock = jest
    .spyOn(global, "fetch")
    .mockRejectedValueOnce(new Error("offline"));
  const tree = await render("player");
  expect(tree.root.findByProps({ testID: "darshan-retry" })).toBeDefined();
  let signal: AbortSignal | undefined;
  fetchMock.mockImplementation((_url, options) => {
    signal = options?.signal as AbortSignal;
    return new Promise(() => {});
  });
  press(tree, "darshan-retry");
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
  expect(tree.root.findByProps({ testID: "darshan-retry" })).toBeDefined();
  expect(
    tree.root.findAllByProps({ testID: "youtube-native-boundary" }),
  ).toHaveLength(0);
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


it('offers the temple website if the YouTube hand-off cannot open', async () => {
  jest.spyOn(global, 'fetch').mockRejectedValue(new Error('source unavailable'));
  const external = jest.spyOn(Linking, 'openURL').mockRejectedValueOnce(new Error('cannot open')).mockResolvedValue(true);
  const tree = await render('player');
  press(tree, 'darshan-youtube'); await flush();
  expect(JSON.stringify(tree.toJSON())).toContain('Could not open the link');
  press(tree, 'darshan-website'); await flush();
  expect(external).toHaveBeenLastCalledWith('https://somnath.org/');
});
