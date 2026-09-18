/**
 * नया resolver (TRD-42 §4/§9). `tsx --test`, not Jest — `src/data` is excluded
 * from the Jest testMatch on purpose (see mobile/jest.config.js).
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  FEATURE_FEED,
  feedVersionsMissingFromWhatsNew,
  pendingFeatures,
  seedSeenForFreshInstall,
  type FeatureFeedEntry,
} from '../home/featureFeed';

const feed: FeatureFeedEntry[] = [
  { id: 'c', version: '1.5.0', titleHi: 'ग', titleEn: 'C', descHi: 'ग', descEn: 'c', thumb: 'ग', target: { tab: 'home', screen: 'Library' } },
  { id: 'b', version: '1.4.8', titleHi: 'ख', titleEn: 'B', descHi: 'ख', descEn: 'b', thumb: 'ख', target: { tab: 'more', screen: 'WidgetGallery' } },
  { id: 'a', version: '1.4.7', titleHi: 'क', titleEn: 'A', descHi: 'क', descEn: 'a', thumb: 'क', target: { tab: 'panchang', screen: 'GunaMilan' } },
];

test('an entry authored above the running version is never advertised', () => {
  // Guards the release race: a feed entry can land in the bundle a version
  // before the screen it points at is reachable.
  const out = pendingFeatures({}, '1.4.8', feed);
  assert.deepEqual(out.map((f) => f.id), ['b', 'a']);
});

test('an opened feature drops out for good', () => {
  const out = pendingFeatures({ b: '1.4.8' }, '1.4.8', feed);
  assert.deepEqual(out.map((f) => f.id), ['a']);
});

test('everything opened renders nothing at all', () => {
  // Present-or-absent is the whole vocabulary — there is no "all caught up".
  assert.deepEqual(pendingFeatures({ a: '1', b: '1', c: '1' }, '1.5.0', feed), []);
});

test('a user who skipped versions still gets at most three', () => {
  const many = [...feed, ...feed.map((f) => ({ ...f, id: `${f.id}2` }))];
  assert.equal(pendingFeatures({}, '1.5.0', many).length, 3);
});

test('order is feed order, newest version first', () => {
  const out = pendingFeatures({}, '1.5.0', feed);
  assert.deepEqual(out.map((f) => f.version), ['1.5.0', '1.4.8', '1.4.7']);
});

test('a fresh install starts with everything already seen', () => {
  // A first-time user has no history for anything to be new against, and is
  // about to get the 24-step tour. नया must be empty for them.
  const seeded = seedSeenForFreshInstall('1.4.8', feed);
  assert.deepEqual(pendingFeatures(seeded, '1.4.8', feed), []);
  assert.equal(Object.keys(seeded).length, feed.length);
});

test('every shipped feed entry names a version whatsNew knows', () => {
  // The two must not drift: whatsNew is the curated copy, the feed is the door.
  assert.deepEqual(feedVersionsMissingFromWhatsNew(), []);
});

test('shipped feed ids are unique', () => {
  const ids = FEATURE_FEED.map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length);
});
