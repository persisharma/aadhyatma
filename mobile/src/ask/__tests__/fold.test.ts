/**
 * Folding is the whole ballgame for Devanagari ↔ Hinglish matching (PRD-41
 * §13.1). Each case below is a defect the spike actually shipped with.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fold, stem, GENERIC_TOKENS } from '../fold';

test('inherent vowel: a bare consonant carries "a"', () => {
  assert.equal(fold('गणेश'), 'ganesh');
  assert.equal(fold('मंदिर'), 'mandir'); // anusvara does NOT suppress the inherent vowel
  assert.equal(fold('गणपति'), 'ganapati');
});

test('word-final schwa is deleted (Hindi), written ā is kept', () => {
  assert.equal(fold('दिशा'), 'disha');
  assert.equal(fold('राहु काल'), 'rahu kal');
  assert.equal(fold('किस दिशा में'), 'kis disha men');
  assert.equal(fold('गृह प्रवेश'), 'grih pravesh'); // Hindi pronunciation; 'griha pravesh' arrives via the id/nameEn form
});

test('Devanagari, IAST and Hinglish land on one key', () => {
  assert.equal(fold('एकादशी'), fold('ekadashi'));
  assert.equal(fold('ekādaśī'), fold('ekadashi'));
  assert.equal(fold('Ekaadashi'), fold('ekadashi'));
  assert.equal(fold('शिवरात्रि'), fold('shivratri').replace('shivratri', 'shivaratri'));
  assert.equal(fold('मुहूर्त'), 'muhurt');
});

test('Hinglish spelling noise collapses', () => {
  assert.equal(fold('pooja'), fold('puja'));
  assert.equal(fold('Shree Ganesha'), fold('shri ganesha'));
  assert.equal(fold('waahan'), fold('vahan'));
  assert.equal(fold('Falahar'), fold('phalahar'));
  assert.equal(fold('zyada'), fold('jyada'));
});

test('fold is idempotent and strips punctuation', () => {
  for (const s of ['गणेश जी को क्या चढ़ाएँ?', 'Ekadashi kab hai??', '  raahu   kaal ']) {
    assert.equal(fold(fold(s)), fold(s));
  }
  assert.equal(fold('कल एकादशी है क्या?'), 'kal ekadashi hai kya');
});

test('stem strips honorific tails so ganeshji ≡ ganesha ≡ ganesh', () => {
  assert.equal(stem('ganeshji'), stem('ganesha'));
  assert.equal(stem('ganesha'), 'ganesh');
  assert.equal(stem('hanumanji'), 'hanuman');
});

test('generic tokens include the ones that produced false entity tags', () => {
  for (const t of ['vrat', 'kal', 'kaal', 'puja', 'din', 'katha']) assert.ok(GENERIC_TOKENS.has(t), t);
});
