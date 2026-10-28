import {
  createGitaSaarLearningStore,
  decodeReflections,
} from '../learningStore';
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
}));
const old = {
  chapter: 1,
  verseIndex: 0,
  text: 'A remembered thought',
  updatedAt: 1,
};
function storage(raw: string | null = null) {
  return {
    getItem: jest.fn(async () => raw),
    setItem: jest.fn(async (_key: string, value: string) => {
      raw = value;
    }),
  };
}
test('hydrates versioned notes, rejects invalid references and keeps the newest duplicate', () => {
  const rows = decodeReflections(
    JSON.stringify({
      version: 1,
      reflections: [
        old,
        { ...old, text: 'Newer', updatedAt: 2 },
        { ...old, chapter: 17 },
        { ...old, verseIndex: 200 },
        { ...old, text: ' ' },
      ],
    })
  );
  expect(rows).toEqual([{ ...old, text: 'Newer', updatedAt: 2 }]);
  expect(decodeReflections('{broken')).toEqual([]);
  expect(
    decodeReflections(JSON.stringify({ version: 2, reflections: [old] }))
  ).toEqual([]);
});
test('a save waits for hydration and serial writes preserve earlier and simultaneous notes', async () => {
  const disk = storage(JSON.stringify({ version: 1, reflections: [old] }));
  const store = createGitaSaarLearningStore(disk);
  await Promise.all([store.save(5, 0, 'Work'), store.save(2, 0, 'Worry')]);
  expect(store.getSnapshot().reflections).toHaveLength(3);
  const reloaded = createGitaSaarLearningStore(
    storage(disk.setItem.mock.calls.at(-1)![1])
  );
  await reloaded.hydrate();
  expect(reloaded.getSnapshot().reflections).toEqual(
    store.getSnapshot().reflections
  );
});
test('failed persistence does not report success or discard the earlier note', async () => {
  const disk = storage(JSON.stringify({ version: 1, reflections: [old] }));
  const store = createGitaSaarLearningStore(disk);
  await store.hydrate();
  disk.setItem.mockRejectedValueOnce(new Error('disk full'));
  await expect(store.save(1, 0, 'New writing')).rejects.toThrow('disk full');
  expect(store.getSnapshot().reflections).toEqual([old]);
  await store.save(1, 0, 'Retry succeeds');
  expect(store.getSnapshot().reflections[0].text).toBe('Retry succeeds');
});
test('failed initial reads never overwrite saved data and can be retried', async () => {
  const disk = storage(JSON.stringify({ version: 1, reflections: [old] }));
  disk.getItem.mockRejectedValueOnce(new Error('temporarily unavailable'));
  const store = createGitaSaarLearningStore(disk);
  await expect(store.save(5, 0, 'Work')).rejects.toThrow();
  expect(disk.setItem).not.toHaveBeenCalled();
  await store.save(5, 0, 'Work');
  expect(store.getSnapshot().reflections).toHaveLength(2);
});
test('removes only the selected note; rejects blank and oversized writing', async () => {
  const store = createGitaSaarLearningStore(storage());
  await store.save(1, 0, 'First');
  await store.save(5, 0, 'Other');
  await store.remove(1, 0);
  expect(store.getSnapshot().reflections.map((r) => r.text)).toEqual(['Other']);
  await expect(store.save(1, 0, ' ')).rejects.toThrow();
  await expect(store.save(1, 0, 'a'.repeat(1001))).rejects.toThrow();
});
