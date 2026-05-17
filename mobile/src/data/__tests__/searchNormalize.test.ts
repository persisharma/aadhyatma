import assert from 'node:assert/strict';

import { MatchRank, normalize, rank, rankAny } from '../searchNormalize';

// Lowercase ASCII.
assert.equal(normalize('Hello'), 'hello');

// IAST diacritics folded to base letters.
assert.equal(normalize('Kṛṣṇa'), 'krsna');
assert.equal(normalize('Bhagavad Gītā'), 'bhagavad gita');
assert.equal(normalize('Śiva'), 'siva');
assert.equal(normalize('dhṛitarāśhtra'), 'dhritarashtra');

// Devanagari preserved verbatim (nukta variants folded).
assert.equal(normalize('कृष्ण'), 'कृष्ण');
assert.equal(normalize('क़िला'), 'किला'); // क़ → क

// Devanagari danda + double-danda stripped.
assert.equal(
  normalize('कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।'),
  'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन'
);
assert.equal(normalize('॥ श्री हनुमते नमः ॥'), 'श्री हनुमते नमः');

// Whitespace collapsed and trimmed.
assert.equal(normalize('   foo    bar   '), 'foo bar');

// Empty / whitespace-only.
assert.equal(normalize(''), '');
assert.equal(normalize('   '), '');

// Idempotent.
const messy = '  Bhagavad Gītā · श्लोक 2.47!  ';
assert.equal(normalize(normalize(messy)), normalize(messy));

// rank: exact / prefix / substring / none.
assert.equal(rank('hanuman', 'hanuman'), MatchRank.EXACT);
assert.equal(rank('hanuman chalisa', 'hanuman'), MatchRank.PREFIX);
assert.equal(rank('jai hanuman', 'hanuman'), MatchRank.SUBSTRING);
assert.equal(rank('rama', 'hanuman'), MatchRank.NONE);

// rank: empty inputs are safe.
assert.equal(rank('foo', ''), MatchRank.NONE);
assert.equal(rank('', 'foo'), MatchRank.NONE);

// rankAny picks the best (lowest) rank across fields.
assert.equal(
  rankAny(['jai hanuman', 'hanuman', 'long body text'], 'hanuman'),
  MatchRank.EXACT
);
assert.equal(
  rankAny(['hanuman chalisa', 'long body text'], 'hanuman'),
  MatchRank.PREFIX
);
assert.equal(rankAny([], 'hanuman'), MatchRank.NONE);

// IAST + Devanagari queries land at the same normalized form.
assert.equal(normalize('Kṛṣṇa'), normalize('Kṛṣṇa'));
assert.equal(normalize('krishna'), 'krishna');
assert.equal(normalize('कृष्ण'), normalize('कृष्ण'));
// Cross-script matching is by intent of the corpus, not by transliteration.
// We don't fold Devanagari → Latin or vice versa; that's a v2 problem.
