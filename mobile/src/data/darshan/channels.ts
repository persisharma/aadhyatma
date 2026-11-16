/** Official sources reviewed 13–16 November 2026. Every channel opens its
 * current-broadcast embed in app. Dedicated temple live-page discovery is
 * preferred when available. No dated IDs, scraped channel HTML or live badges. */
export type DarshanChannel = {
  templeId: string;
  relatedTempleIds?: readonly string[];
  channelId: string;
  channel: string;
  sourceUrl: string;
  livePage?: string;
  kind: "darshan" | "tv" | "scheduled";
};
export const darshanChannels: readonly DarshanChannel[] = [
  {
    templeId: "somnath",
    channelId: "UCT1egsvA08YcdMLiEu1DTRg",
    channel: "Shree Somnath Trust",
    sourceUrl: "https://somnath.org/somnath-live-darshan",
    livePage: "https://somnath.org/somnath-live-darshan",
    kind: "darshan",
  },
  {
    templeId: "kashi-vishwanath",
    channelId: "UCdMj2twWfMHXrWgX5oVdoyA",
    channel: "Shree Kashi Vishwanath Mandir",
    sourceUrl: "https://www.shrikashivishwanath.org/online/live_darshan",
    livePage: "https://www.shrikashivishwanath.org/online/live_darshan",
    kind: "darshan",
  },
  {
    templeId: "omkareshwar",
    channelId: "UCsIZ3yYwCW4316fPX3V-4lg",
    channel: "Shri Omkar Official",
    sourceUrl: "https://www.shriomkareshwar.org/LiveDarshan.aspx",
    kind: "darshan",
  },
  {
    templeId: "dwarkadhish",
    channelId: "UCBAvMHZO3BIfMMhOK9LMOYQ",
    channel: "Shri Dwarkadhish Mandir Official",
    sourceUrl: "https://dwarkadhish.org/",
    kind: "darshan",
  },
  {
    templeId: "naina-devi",
    channelId: "UCeHrvDbvedJ6b_RPJWmQJFw",
    channel: "Mata Shri Naina Devi Ji Official",
    sourceUrl: "https://srinainadevi.com/",
    kind: "darshan",
  },
  {
    templeId: "mallikarjuna",
    relatedTempleIds: ["bhramaramba"],
    channelId: "UCNIzL2dT2gZxQae2LHXvl0A",
    channel: "Srisaila TV",
    sourceUrl: "https://www.srisailadevasthanam.org/en-in/home",
    kind: "tv",
  },
  {
    templeId: "tirupati-balaji",
    channelId: "UCS2Y83GD-fc7qqgNW5uj41g",
    channel: "SVBC TTD · Telugu",
    sourceUrl: "https://www.svbcttd.org/",
    kind: "tv",
  },
  {
    templeId: "khatu-shyam",
    channelId: "UCT-3fEwrrxlwMrWgMvoqt-w",
    channel: "Shri Shyam Darshan",
    sourceUrl: "https://www.shrishyammandir.com/",
    kind: "scheduled",
  },
  {
    templeId: "banke-bihari",
    channelId: "UCwh96MUAk0m81vEXaHVm6Ng",
    channel: "Thakur Shri Banke Bihariji",
    sourceUrl: "https://www.youtube.com/channel/UCwh96MUAk0m81vEXaHVm6Ng",
    kind: "scheduled",
  },
];
export const darshanForTemple = (id: string) =>
  darshanChannels.find(
    (c) => c.templeId === id || c.relatedTempleIds?.includes(id),
  );
export const channelLiveUrl = (c: DarshanChannel) =>
  `https://www.youtube.com/channel/${c.channelId}/live`;
