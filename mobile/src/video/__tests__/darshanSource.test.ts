import { officialEmbedId, resolveDarshanVideo } from "../darshanSource";
import {
  darshanChannels,
  channelLiveUrl,
  darshanForTemple,
} from "@/data/darshan/channels";
import { baseTemples } from "@/data/theerth/templeRows";

test("extracts only an unambiguous official player, not a social link or hidden satellite-shrine input", () => {
  expect(
    officialEmbedId(
      `<input value="https://www.youtube.com/embed/BBBBBBBBBBB"><a href="https://www.youtube.com/watch?v=CCCCCCCCCCC">Channel</a><iframe src="https://www.youtube.com/embed/AAAAAAAAAAA?rel=0"></iframe>`,
    ),
  ).toBe("AAAAAAAAAAA");
  expect(
    officialEmbedId(
      `<iframe src='//www.youtube-nocookie.com/embed/AAAAAAAAAAA'></iframe>`,
    ),
  ).toBe("AAAAAAAAAAA");
  expect(
    officialEmbedId(
      `<iframe src="https://www.youtube.com/embed/AAAAAAAAAAA"></iframe><iframe src="https://www.youtube.com/embed/BBBBBBBBBBB"></iframe>`,
    ),
  ).toBeNull();
});
test.each([
  '<iframe src="https://www.youtube.com.evil.test/embed/AAAAAAAAAAA">',
  '<iframe src="javascript:alert(1)">',
  '<iframe src="http://www.youtube.com/embed/AAAAAAAAAAA">',
  '<iframe src="https://www.youtube.com/embed/live_stream?channel=UC123">',
  '<iframe src="https://www.youtube.com/embed/short">',
  "x".repeat(1500001),
])("fails closed for unsupported / malformed / oversized content", (html) =>
  expect(officialEmbedId(html)).toBeNull(),
);
test("all listed channels map to real temples and unique official channels; no dated IDs bundled", () => {
  expect(new Set(darshanChannels.map((c) => c.templeId)).size).toBe(
    darshanChannels.length,
  );
  for (const c of darshanChannels) {
    expect(baseTemples.some((t) => t.id === c.templeId)).toBe(true);
    expect(c.channelId).toMatch(/^UC[\w-]{22}$/);
    expect(channelLiveUrl(c)).toBe(
      `https://www.youtube.com/channel/${c.channelId}/live`,
    );
  }
});
test("uses the abort signal, rejects error / off-domain pages, and never fetches channel HTML", async () => {
  const fetchMock = jest.spyOn(global, "fetch");
  const signal = new AbortController().signal;
  fetchMock.mockResolvedValueOnce({
    ok: true,
    url: darshanChannels[0].livePage,
    text: async () =>
      '<iframe src="https://www.youtube.com/embed/AAAAAAAAAAA">',
  } as Response);
  expect(await resolveDarshanVideo(darshanChannels[0], signal)).toBe(
    "AAAAAAAAAAA",
  );
  expect(fetchMock).toHaveBeenCalledWith(
    darshanChannels[0].livePage,
    expect.objectContaining({ signal }),
  );
  fetchMock.mockResolvedValueOnce({ ok: false } as Response);
  expect(await resolveDarshanVideo(darshanChannels[0], signal)).toBeNull();
  fetchMock.mockResolvedValueOnce({
    ok: true,
    url: "https://attacker.test/",
    text: jest.fn(),
  } as unknown as Response);
  expect(await resolveDarshanVideo(darshanChannels[0], signal)).toBeNull();
  const calls = fetchMock.mock.calls.length;
  expect(await resolveDarshanVideo(darshanChannels[2], signal)).toBeNull();
  expect(fetchMock).toHaveBeenCalledTimes(calls);
  fetchMock.mockRestore();
});

test("Mallikarjuna and Bhramaramba share one Srisaila TV entry, not two live cameras", () => {
  expect(darshanForTemple("bhramaramba")).toBe(
    darshanForTemple("mallikarjuna"),
  );
});
