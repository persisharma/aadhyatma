import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { openDatabaseAsync, defaultDatabaseDirectory, type SQLiteDatabase } from 'expo-sqlite';
import { LIBRARY_VERSION } from './libraryVersion';

let active: SQLiteDatabase | undefined;
let opening: Promise<void> | undefined;
const name = `vedansh-scriptures-${LIBRARY_VERSION}.db`;
const sqliteDirectory = defaultDatabaseDirectory.replace(/\/$/, '');
const directory = sqliteDirectory.startsWith('file://') ? sqliteDirectory : `file://${sqliteDirectory}`;
const destination = `${directory}/${name}`;

/** Immutable, content-addressed DBs keep an interrupted update from replacing a good copy.
 * User bookmarks/progress are separate AsyncStorage records and are never migrated here.
 */
export function initializeLibrary(): Promise<void> {
  if (active) return Promise.resolve();
  if (!opening) opening = openLibrary().catch((error) => { opening = undefined; throw error; });
  return opening;
}
async function openLibrary() {
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  for (let attempt = 0; attempt < 2; attempt++) {
    let db: SQLiteDatabase | undefined;
    try {
      const exists = (await FileSystem.getInfoAsync(destination)).exists;
      if (!exists) {
        const asset = await Asset.fromModule(require('../../assets/library/library.db')).downloadAsync();
        if (!asset.localUri) throw new Error('Bundled scripture asset unavailable');
        const staging = `${destination}.tmp`;
        await FileSystem.deleteAsync(staging, { idempotent: true });
        await FileSystem.copyAsync({ from: asset.localUri, to: staging });
        await FileSystem.moveAsync({ from: staging, to: destination });
      }
      db = await openDatabaseAsync(name);
      const metadata = await db.getFirstAsync<{version: string; schema_version: number}>('SELECT * FROM metadata');
      if (metadata?.version !== LIBRARY_VERSION || metadata.schema_version !== 1) throw new Error('Scripture version mismatch');
      if (!exists) {
        const check = await db.getFirstAsync<{quick_check: string}>('PRAGMA quick_check');
        if (check?.quick_check !== 'ok') throw new Error('Scripture database integrity failed');
      }
      await db.execAsync('PRAGMA query_only=ON');
      active = db;
      // Only our own immutable content copies; never user data or other databases.
      void FileSystem.readDirectoryAsync(directory).then((files) => Promise.all(files
        .filter((file) => /^vedansh-scriptures-[a-f0-9]{64}\.db$/.test(file) && file !== name)
        .map((file) => FileSystem.deleteAsync(`${directory}/${file}`, {idempotent:true}))
      )).catch(() => undefined);
      return;
    } catch (error) {
      await db?.closeAsync().catch(() => undefined);
      await FileSystem.deleteAsync(destination, { idempotent: true });
      if (attempt === 1) throw error;
    }
  }
}
export function database(): SQLiteDatabase {
  if (!active) throw new Error('Scripture library must be initialized before readers mount');
  return active;
}
/** Compatibility adapter for short texts. Large readers use readVerseRange instead. */
export function readContent<T>(key: string): T {
  const doc = database().getFirstSync<{metadata:string}>('SELECT metadata FROM documents WHERE key=?', key);
  if (!doc) throw new Error(`Unknown scripture document: ${key}`);
  const verses = database().getAllSync<{data:string}>('SELECT data FROM verses WHERE document_key=? ORDER BY position', key);
  return { ...JSON.parse(doc.metadata), verses: verses.map((row) => JSON.parse(row.data)) } as T;
}
export function readVerse<T>(key: string, position: number): T {
  const row = database().getFirstSync<{data:string}>('SELECT data FROM verses WHERE document_key=? AND position=?',key,position);
  if (!row) throw new Error(`Unknown scripture verse: ${key}:${position}`);
  return JSON.parse(row.data) as T;
}
export async function readVerseRange<T>(key: string, start: number, count: number): Promise<T[]> {
  if (!Number.isInteger(start) || start < 0 || !Number.isInteger(count) || count < 1 || count > 96) throw new Error('Invalid scripture page range');
  const rows = await database().getAllAsync<{data:string}>(
    'SELECT data FROM verses WHERE document_key=? AND position>=? AND position<? ORDER BY position', key,start,start+count);
  return rows.map((row) => JSON.parse(row.data) as T);
}
