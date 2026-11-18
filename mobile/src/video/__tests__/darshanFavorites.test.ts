import { createDarshanFavoritesStore } from "../darshanFavorites";
const flush = async () => {
  for (let i = 0; i < 12; i++) await Promise.resolve();
};
test("hydrates once, sanitizes IDs and blocks taps until the saved roster is read", async () => {
  let finish!: (value: string) => void;
  const storage = {
    getItem: jest.fn(
      () =>
        new Promise<string>((resolve) => {
          finish = resolve;
        }),
    ),
    setItem: jest.fn(async (_key: string, _value: string) => {}),
  };
  const store = createDarshanFavoritesStore(storage);
  const a = store.hydrate();
  store.hydrate();
  store.toggle("somnath");
  expect(storage.setItem).not.toHaveBeenCalled();
  expect(storage.getItem).toHaveBeenCalledTimes(1);
  finish('["khatu-shyam","khatu-shyam","unknown",7]');
  await a;
  expect(store.getSnapshot()).toEqual({
    ids: ["khatu-shyam"],
    ready: true,
    failed: false,
  });
  store.toggle("somnath");
  await flush();
  expect(JSON.parse(storage.setItem.mock.calls[0][1])).toEqual([
    "khatu-shyam",
    "somnath",
  ]);
});
test("serializes rapid favourite toggles and retries a failed write without losing the current roster", async () => {
  const storage = {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async (_key: string, _value: string) => {}),
  };
  const store = createDarshanFavoritesStore(storage);
  await store.hydrate();
  store.toggle("somnath");
  store.toggle("khatu-shyam");
  store.toggle("somnath");
  await flush();
  expect(storage.setItem.mock.calls.map((call) => JSON.parse(call[1]))).toEqual(
    [["somnath"], ["somnath", "khatu-shyam"], ["khatu-shyam"]],
  );
  storage.setItem.mockRejectedValueOnce(new Error("disk"));
  store.toggle("somnath");
  await flush();
  expect(store.getSnapshot().failed).toBe(true);
  await store.retry();
  expect(store.getSnapshot()).toEqual({
    ids: ["khatu-shyam", "somnath"],
    ready: true,
    failed: false,
  });
});
test("read failure remains disabled until retry succeeds; malformed JSON can recover", async () => {
  const storage = {
    getItem: jest
      .fn()
      .mockRejectedValueOnce(new Error("disk"))
      .mockResolvedValueOnce("bad-json"),
    setItem: jest.fn(async (_key: string, _value: string) => {}),
  };
  const store = createDarshanFavoritesStore(storage);
  await store.hydrate();
  expect(store.getSnapshot()).toEqual({ ids: [], ready: false, failed: true });
  await store.retry();
  expect(store.getSnapshot()).toEqual({ ids: [], ready: true, failed: false });
});

test("both Srisailam temple guides save the same channel favourite", async () => {
  const storage = {
    getItem: jest.fn(async () => '["bhramaramba"]'),
    setItem: jest.fn(async (_key: string, _value: string) => {}),
  };
  const store = createDarshanFavoritesStore(storage);
  await store.hydrate();
  expect(store.getSnapshot().ids).toEqual(["mallikarjuna"]);
  store.toggle("bhramaramba");
  await flush();
  expect(store.getSnapshot().ids).toEqual([]);
});
