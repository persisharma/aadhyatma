import type {Pair} from './index';
export const directions = [
  ['उत्तर', 'North', 'कुबेर', 'Kubera'], ['ईशान', 'Northeast', 'ईशान', 'Ishana'],
  ['पूर्व', 'East', 'इन्द्र', 'Indra'], ['आग्नेय', 'Southeast', 'अग्नि', 'Agni'],
  ['दक्षिण', 'South', 'यम', 'Yama'], ['नैऋत्य', 'Southwest', 'निरृति', 'Nirriti'],
  ['पश्चिम', 'West', 'वरुण', 'Varuna'], ['वायव्य', 'Northwest', 'वायु', 'Vayu'],
  ['ऊर्ध्व', 'Above', 'ब्रह्मा', 'Brahma'], ['अधो', 'Below', 'विष्णु', 'Vishnu'],
];
export const groups = [
  ['8 · वसु', '8 · Vasus', 'अग्नि, पृथ्वी, वायु, अन्तरिक्ष, आदित्य, द्यौ, चन्द्रमा और नक्षत्र।', 'Agni, Prithivi, Vayu, Antariksha, Aditya, Dyau, Chandramas and Nakshatras.'],
  ['11 · रुद्र', '11 · Rudras', 'दस प्राण और ग्यारहवाँ आत्मा। शरीर से इनके निकलने पर सम्बन्धी रोते हैं; संवाद इसी से रुद्र नाम समझाता है।', 'Ten pranas and the self as eleventh. The dialogue connects their departure from the body with the weeping of relatives, explaining the name Rudra.'],
  ['12 · आदित्य', '12 · Adityas', 'इस संवाद में बारह महीनों से व्याख्या की गई है।', 'Explained here through the twelve months.'],
  ['1 · इन्द्र', '1 · Indra', 'इस संदर्भ में वज्र का परिचय।', 'The thunderbolt in this context.'],
  ['1 · प्रजापति', '1 · Prajapati', 'इस संवाद में यज्ञ का संदर्भ।', 'Yajna in this dialogue.'],
];
export const grahas: Pair[] = [['सूर्य','Surya'],['चन्द्र','Chandra'],['मंगल','Mangala'],['बुध','Budha'],['बृहस्पति','Brihaspati'],['शुक्र','Shukra'],['शनि','Shani'],['राहु','Rahu'],['केतु','Ketu']];
// Short original explanations of the stotra's epithets; not copied translations.
export const grahaDescriptions: Pair[] = [
  ['स्तोत्र सूर्य को दिवाकर—दिन बनाने वाला—कहता है।', 'Surya is praised as Divakara, maker of the day.'],
  ['चन्द्र का स्मरण शिव के मुकुट के भूषण के रूप में है।', 'Chandra is remembered as an adornment of Shiva’s crown.'],
  ['मंगल धरती से उत्पन्न और हाथ में शक्ति लिए हुए वर्णित हैं।', 'Mangala is described as earth-born and carrying a spear.'],
  ['बुध के सौम्य गुणों और अनुपम रूप का वर्णन है।', 'Budha is praised for a gentle nature and exceptional beauty.'],
  ['बृहस्पति देवों और ऋषियों के गुरु कहे गए हैं।', 'Brihaspati is the teacher of deities and rishis.'],
  ['भार्गव नाम से स्मरण किए गए शुक्र दैत्यों के गुरु हैं।', 'Shukra, addressed as Bhargava, is the preceptor of the daityas.'],
  ['शनैश्चर सूर्य और छाया की सन्तान के रूप में स्मरण किए गए हैं।', 'Shanaishchara is remembered as the child of Surya and Chhaya.'],
  ['राहु का अर्धकाय रूप स्तोत्र में आता है। खगोल में यह चन्द्र-कक्षा के दो पात-बिन्दुओं में से एक है।', 'The hymn describes Rahu with half a body. Astronomically, Rahu denotes one of the lunar orbital nodes.'],
  ['केतु के तेज की तुलना पलाश के फूल से है। खगोल में यह दूसरा चन्द्र-पात है।', 'Ketu’s appearance is likened to a palasha flower. Astronomically, Ketu denotes the other lunar node.'],
];


export const avatarNames: readonly Pair[] = [['मत्स्य','Matsya'],['कूर्म','Kurma'],['वराह','Varaha'],['नरसिंह','Narasimha'],['वामन','Vamana'],['परशुराम','Parashurama'],['राम','Rama'],['बलराम','Balarama'],['कृष्ण','Krishna'],['कल्कि','Kalki']];
export const jayadevaNames: readonly Pair[] = avatarNames.map((name,index)=>index===8?['बुद्ध','Buddha']:name);
export const elementNames: readonly Pair[] = [['आकाश','Space'],['वायु','Air'],['अग्नि','Fire'],['जल','Water'],['पृथ्वी','Earth']];
export function knowledgeText(id:string,page:number):Pair|null {
 if(page!==1)return null;
 const join=(rows:readonly Pair[]):Pair=>[rows.map(x=>x[0].replace(/[।.]+$/,'')).join('। ')+ '।',rows.map(x=>x[1].replace(/[.]+$/,'')).join('. ')+'.'];
 if(id==='dikpal')return join(directions.map(d=>[d[0]+' — '+d[2],d[1]+' — '+d[3]]));
 if(id==='thirty')return join(groups.map(g=>[g[0]+': '+g[2],g[1]+': '+g[3]]));
 if(id==='graha')return join(grahas.map((g,i)=>[g[0]+': '+grahaDescriptions[i][0],g[1]+': '+grahaDescriptions[i][1]]));
 if(id==='forms'){const a=join(avatarNames),b=join(jayadevaNames);return ['बलराम–कृष्ण चयन: '+a[0]+'\n\nजयदेव का चयन: '+b[0],'Balarama–Krishna selection: '+a[1]+'\n\nJayadeva selection: '+b[1]];}
 return null;
}
