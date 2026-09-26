const mockFiles = new Set<string>();
const mockDb = {
  getFirstAsync: jest.fn(), execAsync: jest.fn().mockResolvedValue(undefined), closeAsync: jest.fn().mockResolvedValue(undefined),
};
const mockOpen = jest.fn().mockResolvedValue(mockDb);
const mockCopy = jest.fn(async ({to}: {to:string}) => {mockFiles.add(to);});
const mockDelete = jest.fn(async (file:string) => {mockFiles.delete(file);});
jest.mock('expo-sqlite', () => ({defaultDatabaseDirectory:'/documents/SQLite',openDatabaseAsync:mockOpen}));
jest.mock('expo-asset', () => ({Asset:{fromModule:() => ({downloadAsync:async () => ({localUri:'file:///bundle/library.db'})})}}));
jest.mock('expo-file-system/legacy', () => ({
  makeDirectoryAsync:jest.fn().mockResolvedValue(undefined),
  getInfoAsync:async (file:string) => ({exists:mockFiles.has(file)}),
  copyAsync:mockCopy, deleteAsync:mockDelete,
  moveAsync:async ({from,to}:{from:string;to:string}) => {mockFiles.delete(from);mockFiles.add(to);},
  readDirectoryAsync:async () => ['user.db','unrelated.db'],
}));
import { LIBRARY_VERSION } from '../libraryVersion';
const destination = `file:///documents/SQLite/vedansh-scriptures-${LIBRARY_VERSION}.db`;
beforeEach(() => {
  jest.resetModules();mockFiles.clear();jest.clearAllMocks();
  mockDb.getFirstAsync.mockImplementation(async (sql:string) => sql.includes('metadata') ? {version:LIBRARY_VERSION,schema_version:1}:{quick_check:'ok'});
});
test('concurrent first opens import once, validate, then make content read-only', async () => {
  const {initializeLibrary,database}=require('../content.native');
  await Promise.all([initializeLibrary(),initializeLibrary()]);
  expect(mockCopy).toHaveBeenCalledTimes(1);
  expect(mockFiles.has(destination)).toBe(true);
  expect(mockDb.execAsync).toHaveBeenCalledWith('PRAGMA query_only=ON');
  expect(database()).toBe(mockDb);
  expect(mockDelete).not.toHaveBeenCalledWith(expect.stringContaining('user.db'),expect.anything());
});
test('warm launch reuses the same version without copying the database again', async () => {
  mockFiles.add(destination);
  await require('../content.native').initializeLibrary();
  expect(mockCopy).not.toHaveBeenCalled();
});
test('corrupt or wrong-version copies are closed and restored before exposing the library', async () => {
  mockFiles.add(destination);
  mockDb.getFirstAsync.mockResolvedValueOnce({version:'old',schema_version:1});
  await require('../content.native').initializeLibrary();
  expect(mockDb.closeAsync).toHaveBeenCalledTimes(1);
  expect(mockCopy).toHaveBeenCalledTimes(1);
  expect(mockOpen).toHaveBeenCalledTimes(2);
});
test('failed imports reject, and an explicit retry can succeed without touching user data', async () => {
  mockCopy.mockRejectedValueOnce(new Error('disk full')).mockRejectedValueOnce(new Error('disk full'));
  const {initializeLibrary,database}=require('../content.native');
  await expect(initializeLibrary()).rejects.toThrow('disk full');
  expect(() => database()).toThrow('must be initialized');
  await initializeLibrary();
  expect(database()).toBe(mockDb);
});
