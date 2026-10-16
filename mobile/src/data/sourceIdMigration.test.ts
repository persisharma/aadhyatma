import assert from 'node:assert/strict';

import { canonicalBookmarkId, canonicalSourceId } from './sourceIdMigration';

// canonicalSourceId migrates legacy aarti-N to the canonical library id.
assert.equal(canonicalSourceId('aarti-0'), 'om-jai-jagdish');
assert.equal(canonicalSourceId('aarti-2'), 'jai-ganesh-deva');
assert.equal(canonicalSourceId('aarti-5'), 'aarti-kunj-bihari');
assert.equal(canonicalSourceId('aarti-6'), 'saraswati-aarti');
assert.equal(canonicalSourceId('aarti-7'), 'gayatri-aarti');
assert.equal(canonicalSourceId('aarti-8'), 'khatu-shyam-aarti');
assert.equal(canonicalSourceId('aarti-9'), 'om-jai-lakshmi-mata');
assert.equal(canonicalSourceId('aarti-10'), 'jay-adhya-shakti');
assert.equal(canonicalSourceId('aarti-11'), 'shani-aarti');
assert.equal(canonicalSourceId('aarti-12'), 'dattatreya-aarti');
assert.equal(canonicalSourceId('aarti-13'), 'om-jai-gange-mata');
assert.equal(canonicalSourceId('aarti-14'), 'ambe-tu-hai-jagdambe-kali');
assert.equal(canonicalSourceId('aarti-15'), 'kubera-aarti');
assert.equal(canonicalSourceId('aarti-16'), 'santoshi-mata-aarti');
assert.equal(canonicalSourceId('aarti-17'), 'ahoi-mata-aarti');
assert.equal(canonicalSourceId('aarti-18'), 'vaishno-devi-aarti');
assert.equal(canonicalSourceId('aarti-19'), 'ekadashi-mata-aarti');
assert.equal(canonicalSourceId('aarti-20'), 'tulsi-aarti');
assert.equal(canonicalSourceId('aarti-21'), 'shakambhari-aarti');
// Out-of-range index falls through unchanged so the consumer can decide.
assert.equal(canonicalSourceId('aarti-22'), 'aarti-22');
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
