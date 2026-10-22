import { devotionalCharanRows } from '../devotionalShareLayout';
import { transliterateDevanagari } from '../transliterate';

const chaupai = ['सुनत सभय मन मुख मुसुकाई। कहत दसानन सबहि सुनाई॥', 'भूमि परा कर गहत अकासा। लघु तापस कर बाग बिलासा॥1॥'];
it('splits a stored chaupai couplet into its four charans', () => {
  expect(devotionalCharanRows('hi', chaupai, chaupai)).toEqual(['सुनत सभय मन मुख मुसुकाई।', 'कहत दसानन सबहि सुनाई॥', 'भूमि परा कर गहत अकासा।', 'लघु तापस कर बाग बिलासा॥1॥']);
});
it('keeps one-charan lines, Gita half-shlokas and mantra phrases whole', () => {
  for (const lines of [
    ['राम दूत अतुलित बल धामा।', 'अंजनि-पुत्र पवनसुत नामा॥2॥'],
    ['अत्र शूरा महेष्वासा भीमार्जुनसमा युधि।', 'युयुधानो विराटश्च द्रुपदश्च महारथः।।1.4।।'],
    ['अव त्वं माम्। अव वक्तारम्। अव श्रोतारम्।'],
    ['त्वमेव प्रत्यक्षं तत्त्वमसि। त्वमेव केवलं कर्ताऽसि।'],
  ]) expect(devotionalCharanRows('hi', lines, lines)).toEqual(lines);
});
it('splits the re-scripted and romanized lines where the Devanagari splits', () => {
  expect(devotionalCharanRows('gu', chaupai, chaupai.map(l => transliterateDevanagari(l, 'gu')))).toHaveLength(4);
  expect(devotionalCharanRows('kn', chaupai, chaupai.map(l => transliterateDevanagari(l, 'kn')))).toHaveLength(4);
  const en = ['Sunat sabhay man mukh musukaaee. kahat dasaanan sabahi sunaaee', 'Bhoomi paraa kar gahat akaasaa. laghu taapas kar baag bilaasaa'];
  expect(devotionalCharanRows('en', chaupai, en)).toEqual(['Sunat sabhay man mukh musukaaee.', 'kahat dasaanan sabahi sunaaee', 'Bhoomi paraa kar gahat akaasaa.', 'laghu taapas kar baag bilaasaa']);
  const prose = ['Ravan smiled. He spoke. Then he laughed', 'One line'];
  expect(devotionalCharanRows('en', chaupai, prose)).toEqual(prose);
});
