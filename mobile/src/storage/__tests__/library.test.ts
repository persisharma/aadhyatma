import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { librarySearchQuery } from '../searchQuery';
import { normalize, rankAny, MatchRank } from '../../data/searchNormalize';
import { LIBRARY_VERSION } from '../libraryVersion';
const root = path.resolve(import.meta.dirname, '../..');
const db = new DatabaseSync(path.join(root,'../assets/library/library.db'), {readOnly:true});

test('every source document and verse survives SQLite conversion exactly, including IDs and native meanings', () => {
  const documents = db.prepare('SELECT * FROM documents ORDER BY key').all();
  assert.equal(documents.length,114);
  let total = 0;
  for (const doc of documents) {
    const original = JSON.parse(fs.readFileSync(path.join(root,'data',String(doc.key)), 'utf8'));
    const verses = db.prepare('SELECT data FROM verses WHERE document_key=? ORDER BY position').all(doc.key).map((r) => JSON.parse(String(r.data)));
    assert.deepEqual({...JSON.parse(String(doc.metadata)), verses}, original, String(doc.key));
    assert.equal(verses.length,doc.verse_count);
    total += verses.length;
    for (const start of [0, Math.floor(verses.length/2), Math.max(0,verses.length-24)]) {
      const page = db.prepare('SELECT data FROM verses WHERE document_key=? AND position>=? AND position<? ORDER BY position').all(doc.key,start,start+24).map((r) => JSON.parse(String(r.data)));
      assert.deepEqual(page,original.verses.slice(start,start+24));
    }
  }
  assert.equal(total,25395);
  assert.equal(db.prepare('SELECT version FROM metadata').get()?.version,LIBRARY_VERSION);
  assert.equal(db.prepare('PRAGMA integrity_check').get()?.integrity_check,'ok');
});
test('indexed SQLite search preserves exact/prefix/substring ranking, unicode folding, caps and stable ordering', () => {
  const entries = db.prepare('SELECT * FROM search_entries ORDER BY ordinal').all().map((r) => ({kind:String(r.kind),entry:JSON.parse(String(r.data)),fields:JSON.parse(String(r.fields))}));
  for (const raw of ['राम','कर्म','kṛṣṇa','shiva','ātmā','a','रा','7.1.1','तपः','truth','%','_','" OR 1=1 --','śrī rāma','peace','unfindablevalue','नारायण']) {
    const q = normalize(raw);
    if (!q) continue;
    for (const kind of ['section','deity','verse']) {
      const expected = entries.filter((r) => r.kind===kind).map((r) => ({entry:r.entry,rank:rankAny(r.fields,q)})).filter((r) => r.rank!==MatchRank.NONE).sort((a,b) => a.rank-b.rank).slice(0,kind==='verse'?51:1000);
      const {sql,params}=librarySearchQuery(q,kind);
      const actual=db.prepare(sql).all(...params).map((r) => ({entry:JSON.parse(String(r.data)),rank:r.rank}));
      assert.deepEqual(actual,expected,`${raw} / ${kind}`);
    }
  }
});
test('all 23,289 Ramayan verses are searchable and retain their chapter and zero-based index', () => {
  const rows=db.prepare("SELECT data FROM search_entries WHERE json_extract(data,'$.sourceId')='valmiki-ramayan' AND kind='verse'").all();
  assert.equal(rows.length,23289);
  const last=JSON.parse(String(rows.at(-1)!.data));
  assert.equal(last.chapter,7);
  assert.equal(last.verseIndex,3460);
});

test('every migrated verse has a search result pointing at the same document position and text', () => {
  const indexed = new Map(db.prepare("SELECT data FROM search_entries WHERE kind='verse'").all()
    .map(row => { const entry = JSON.parse(String(row.data)); return [entry.id, entry]; }));
  let checked = 0;
  for (const doc of db.prepare('SELECT key,metadata FROM documents ORDER BY key').all()) {
    const key = String(doc.key);
    const family = key.split('/')[0];
    const metadata = JSON.parse(String(doc.metadata));
    const sourceId = family === 'gita' ? 'bhagavad-gita' :
      ['aarti','ashtakam','sanskar','kavacham','stuti','suktam'].includes(family)
        ? path.basename(key,'.json') : family;
    const rows = db.prepare('SELECT position,data FROM verses WHERE document_key=? ORDER BY position').all(key);
    for (const row of rows) {
      const verse = JSON.parse(String(row.data));
      const id = `verse:${sourceId}:${metadata.chapter ?? '_'}:${row.position}`;
      const entry = indexed.get(id);
      assert.ok(entry, `Missing searchable verse: ${key}:${row.position}`);
      assert.equal(entry.firstLineHi, (verse.sanskrit ?? verse.lines)[0] ?? '', `${id} Hindi snippet`);
      assert.equal(entry.firstLineEn, (verse.transliteration ?? verse.linesEn)[0] ?? '', `${id} English snippet`);
      checked++;
    }
  }
  assert.equal(checked,25395);
});

test('every 24-row page including the final partial page has exact source order with no gaps', () => {
  let checked = 0;
  for (const doc of db.prepare('SELECT key FROM documents ORDER BY key').all()) {
    const original = JSON.parse(fs.readFileSync(path.join(root,'data',String(doc.key)), 'utf8'));
    const visited: string[] = [];
    for (let start=0; start<original.verses.length; start+=24) {
      const rows = db.prepare('SELECT data FROM verses WHERE document_key=? AND position>=? AND position<? ORDER BY position')
        .all(doc.key,start,start+24).map(row => JSON.parse(String(row.data)));
      assert.deepEqual(rows,original.verses.slice(start,start+24),`${doc.key}:${start}`);
      visited.push(...rows.map(row => row.id));
      checked+=rows.length;
    }
    assert.deepEqual(visited,original.verses.map((verse:{id:string}) => verse.id));
    assert.equal(new Set(visited).size,visited.length);
  }
  assert.equal(checked,25395);
});
