import { readableRomanization } from '../readableRomanization';

/**
 * Golden pairs for the reader-facing respelling (design.md §3.1): long vowels keep
 * their macron, dotted letters take their plain spelling, and strict IAST's c/ch
 * become ch/chh. Pairs come from the shipped corpus in both IAST dialects.
 */

describe('readableRomanization', () => {
  test('Hunterian dialect (Gita): digraphs collapse, ch stays ch', () => {
    expect(readableRomanization(['śhiṣhyaste ’haṁ śhādhi māṁ tvāṁ prapannam'])).toEqual([
      'shishyaste ’ham shādhi mām tvām prapannam',
    ]);
    expect(readableRomanization(['dhṛitarāśhtra uvācha'])).toEqual(['dhritarāshtra uvācha']);
    expect(readableRomanization(['pṛichchhāmi tvāṁ dharma-sammūḍha-chetāḥ'])).toEqual([
      'prichchhāmi tvām dharma-sammūdha-chetāh',
    ]);
  });

  test('strict dialect (stotras, kavacham): c → ch, ch → chh, decided per verse', () => {
    expect(
      readableRomanization(['asti guhyatamaṃ vipra', 'devyās-tu kavacaṃ puṇyaṃ tac-chṛṇuṣva mahāmune'])
    ).toEqual(['asti guhyatamam vipra', 'devyās-tu kavacham punyam tach-chhrinushva mahāmune']);
    expect(readableRomanization(['karmaṇy evādhikāras te mā phaleṣu kadācana'])).toEqual([
      'karmany evādhikāras te mā phaleshu kadāchana',
    ]);
  });

  test('a stray c in a Hunterian verse is not read as strict IAST', () => {
    expect(readableRomanization(['tameva chārcayannityaṁ bhaktyā puruṣhamavyayam'])).toEqual([
      'tameva chārcayannityam bhaktyā purushamavyayam',
    ]);
  });

  test('capitals keep their case', () => {
    expect(readableRomanization(['Śrī Kṛṣṇa'])).toEqual(['Shrī Krishna']);
  });

  test('pronunciation ASCII and Devanagari pass through as the same array', () => {
    const awadhi = ['Shree Guru charan saroj raj'];
    expect(readableRomanization(awadhi)).toBe(awadhi);
    const deva = ['कर्मण्येवाधिकारस्ते'];
    expect(readableRomanization(deva)).toBe(deva);
  });

  test('returns the same array for the same input (FlatList stability)', () => {
    const lines = ['oṁ namaḥ śhivāya'];
    expect(readableRomanization(lines)).toBe(readableRomanization(lines));
  });
});
