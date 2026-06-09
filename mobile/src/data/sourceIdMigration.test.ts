import assert from 'node:assert/strict';

import { canonicalBookmarkId, canonicalSourceId } from './sourceIdMigration';

// canonicalSourceId migrates legacy aarti-N to the canonical library id.
assert.equal(canonicalSourceId('aarti-0'), 'om-jai-jagdish');
assert.equal(canonicalSourceId('aarti-2'), 'jai-ganesh-deva');
assert.equal(canonicalSourceId('aarti-5'), 'aarti-kunj-bihari');
assert.equal(canonicalSourceId('aarti-6'), 'saraswati-aarti');
// Out-of-range index falls through unchanged so the consumer can decide.
assert.equal(canonicalSourceId('aarti-7'), 'aarti-7');
assert.equal(canonicalSourceId('aarti-x'), 'aarti-x');
// Already canonical, leave alone.
assert.equal(canonicalSourceId('om-jai-jagdish'), 'om-jai-jagdish');
assert.equal(canonicalSourceId('bhagavad-gita'), 'bhagavad-gita');
assert.equal(canonicalSourceId('shiv-chalisa'), 'shiv-chalisa');

// canonicalBookmarkId rewrites legacy aarti:N:M ids to <canonical>:M so the
// new reader's `${sourceId}:${verseIndex}` lookup matches.
assert.equal(canonicalBookmarkId('aarti:0:5', 'om-jai-jagdish'), 'om-jai-jagdish:5');
assert.equal(canonicalBookmarkId('aarti:6:2', 'aarti-kunj-bihari'), 'aarti-kunj-bihari:2');

// Non-aarti bookmark ids pass through unchanged.
assert.equal(canonicalBookmarkId('bhagavad-gita:1:0', 'bhagavad-gita'), 'bhagavad-gita:1:0');
assert.equal(canonicalBookmarkId('hanuman-chalisa::3', 'hanuman-chalisa'), 'hanuman-chalisa::3');
assert.equal(canonicalBookmarkId('sundarkand:5:7', 'sundarkand'), 'sundarkand:5:7');

// Already-canonical aarti id is left alone.
assert.equal(canonicalBookmarkId('om-jai-jagdish:5', 'om-jai-jagdish'), 'om-jai-jagdish:5');
