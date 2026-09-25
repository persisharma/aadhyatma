import { questionForPurpose, readingText as T, type ReadingText } from './prashnaQuestions';
import type { PhaseTone } from './prashnaPhase';
import type { PurposeId } from './prashnaPurposes';

type Copy = {
  prompt: ReadingText;
  headlines: Record<PhaseTone, ReadingText>;
  step: { advance: ReadingText; careful: ReadingText };
  steps?: Partial<Record<PhaseTone, ReadingText>>;
};

// Editorial decisions about what to do with a timing indication. None of these
// phrases predicts selection, marks, profit, a partner, or a travel outcome.
const COPY: Record<string, Copy> = {
  'naukri:general': {
    prompt: T('काम के लिए अभी क्या दिशा है?', 'What direction fits work now?'),
    headlines: {
      supportive: T('काम में अगले अवसर पर बातचीत बढ़ाएँ', 'Move work opportunities forward now'),
      mixed: T('अवसर खोजें, पर शर्तें परखकर आगे बढ़ें', 'Explore opportunities, but check the terms'),
      effort: T('अभी काम की तैयारी और पकड़ मज़बूत करें', 'Build your footing before a major work move'),
      active: T('काम सक्रिय है; बदलाव का पक्ष तय नहीं', 'Work is active; a change is not clearly favoured'),
      limited: T('काम के अगले कदम का समय स्पष्ट नहीं', 'Timing for the next work move is unclear'),
    },
    step: { advance: T('अगले अवसर में काम और सफलता की अपेक्षाएँ पूछें।', 'Ask what the work and success criteria would be in the next opportunity.'), careful: T('पहले अपनी मुख्य प्राथमिकता तय करें; वास्तविक अवसर की शर्तों से निर्णय लें।', 'Name your main priority, then decide from the terms of a real opportunity.') },
  },
  'naukri:job-first': {
    prompt: T('पहली नौकरी के लिए क्या करूँ?', 'How should I approach my first job?'),
    headlines: {
      supportive: T('पहली नौकरी के आवेदन आगे बढ़ाएँ', 'Advance first-job applications now'),
      mixed: T('आवेदन करें; जल्दी चयन मानकर योजना न बनाएँ', 'Apply, without planning on a quick selection'),
      effort: T('आवेदन के साथ कौशल का प्रमाण तैयार करें', 'Prepare proof of your skills as you apply'),
      active: T('आवेदन जारी रखें; चयन का संकेत स्पष्ट नहीं', 'Keep applying; selection is not established'),
      limited: T('पहली नौकरी के समय पर स्पष्ट संकेत नहीं', 'First-job timing is unclear'),
    },
    step: { advance: T('दो उपयुक्त भूमिकाएँ चुनें और हर एक के लिए अपने काम का उदाहरण तैयार करें।', 'Choose two suitable role types and prepare a work example for each.'), careful: T('आवेदन के जवाबों से खोज सुधारें; कुंडली चयन की पुष्टि नहीं करती।', 'Use application responses to adjust your search; the chart cannot confirm selection.') },
  },
  'naukri:job-growth': {
    prompt: T('मौजूदा भूमिका में आगे बढ़ूँ?', 'Should I seek growth in my current role?'),
    headlines: {
      supportive: T('अगली भूमिका की बातचीत अभी बढ़ाएँ', 'Raise the next-role conversation now'),
      mixed: T('बातचीत करें; पदोन्नति की शर्तें स्पष्ट करें', 'Discuss growth, but clarify promotion criteria'),
      effort: T('पहले योगदान और परिणाम सामने रखें', 'Document your contributions before pushing for growth'),
      active: T('काम सक्रिय है; पदोन्नति का पक्ष तय नहीं', 'Work is active; promotion is not established'),
      limited: T('पदोन्नति के समय पर स्पष्ट संकेत नहीं', 'Promotion timing is unclear'),
    },
    step: { advance: T('तीन हाल के परिणाम लेकर प्रबंधक से अगली भूमिका के मानदंड और समीक्षा की तारीख पूछें।', 'Bring three recent outcomes to your manager and ask for next-role criteria and a review date.'), careful: T('अधिक काम को पदोन्नति का वादा न मानें; लिखित मानदंड और प्रतिक्रिया लें।', 'Do not treat extra work as a promise of promotion; get criteria and feedback.') },
  },
  'naukri:job-switch': {
    prompt: T('नौकरी बदलूँ?', 'Should I change jobs?'),
    headlines: {
      supportive: T('हाँ, बदलाव की तलाश आगे बढ़ाएँ', 'Yes, pursue a job change now'),
      mixed: T('अभी तलाश करें; नौकरी छोड़ने का निर्णय रोकें', 'Search now; hold off on resigning'),
      effort: T('अभी तुरंत बदलाव के बजाय तैयारी करें', 'Prepare before making an immediate switch'),
      active: T('अभी बदलाव के पक्ष में स्पष्ट संकेत नहीं', 'No clear case for switching right now'),
      limited: T('अभी बदलाव के समय पर स्पष्ट उत्तर नहीं', 'No clear timing answer for a switch yet'),
    },
    step: { advance: T('नई भूमिका पर बात आगे बढ़ाएँ। काम, वेतन और शुरू करने की तारीख लिखित रूप में स्पष्ट होने पर ही अंतिम निर्णय लें।', 'Advance interviews. Make the final decision after the role, pay and start date are clear in writing.'), careful: T('आवेदन और बातचीत जारी रखें। प्रस्ताव मिले तो नई ज़िम्मेदारी और काम का दबाव मौजूदा भूमिका से मिलाएँ; उसके बाद ही छोड़ें।', 'Keep applying and interviewing. Compare an offer’s responsibilities and workload with your current role before leaving.') },
    steps: {
      mixed: T('आवेदन और बातचीत जारी रखें। कोई प्रस्ताव मिले तो नई ज़िम्मेदारी और काम का दबाव अपनी मौजूदा भूमिका से मिलाएँ; उसके बाद ही छोड़ने का निर्णय लें।', 'Keep applying and interviewing. Compare an offer’s responsibilities and workload with your current role before deciding to leave.'),
      effort: T('विकल्प खोजें, कौशल और संपर्क तैयार करें। केवल इस समय-संकेत के आधार पर जल्दबाज़ी में इस्तीफ़ा न दें।', 'Explore openings and prepare your skills and contacts. Avoid a rushed resignation based on this timing indication alone.'),
      active: T('बदलाव का निर्णय वास्तविक प्रस्ताव और अपनी प्राथमिकताओं के आधार पर लें। इस गणना से बेहतर परिणाम का पक्ष तय नहीं होता।', 'Decide from an actual offer and your priorities. This reading does not establish that a switch would work out better.'),
      limited: T('इस गणना में चल रही दशा से नौकरी बदलने का सीधा समय-संकेत नहीं मिलता। कोई प्रस्ताव हो तो उसकी शर्तें परखकर निर्णय लें।', 'The running dasha has no direct job-change timing link in this calculation. If you have an offer, judge its actual terms.'),
    },
  },
  'vyapar:general': {
    prompt: T('व्यापार में अभी क्या दिशा है?', 'What direction fits business now?'),
    headlines: {
      supportive: T('छोटा व्यापारिक कदम आगे बढ़ाएँ', 'Move a small business step forward'),
      mixed: T('विचार आज़माएँ; बड़ी प्रतिबद्धता रोकें', 'Test the idea; hold off on a large commitment'),
      effort: T('पहले माँग और तैयारी पर काम करें', 'Work on demand and preparation first'),
      active: T('व्यापार सक्रिय है; लाभ का पक्ष तय नहीं', 'Business is active; profit is not established'),
      limited: T('व्यापार शुरू करने का समय स्पष्ट नहीं', 'Business timing is unclear'),
    },
    step: { advance: T('एक ग्राहक समस्या चुनकर सीमित प्रयोग करें और प्रतिक्रिया दर्ज करें।', 'Choose one customer problem, run a small test, and record feedback.'), careful: T('ख़र्च बढ़ाने से पहले वास्तविक माँग और लागत जाँचें।', 'Check real demand and costs before increasing spending.') },
  },
  'vyapar:business-start': {
    prompt: T('नया व्यापार शुरू करूँ?', 'Should I start a new business?'),
    headlines: {
      supportive: T('हाँ, विचार का छोटा प्रयोग शुरू करें', 'Yes, start a small test of the idea'),
      mixed: T('छोटा प्रयोग करें; बड़ा निवेश अभी रोकें', 'Run a small pilot; defer a large investment'),
      effort: T('लॉन्च से पहले ग्राहक और लागत परखें', 'Check customers and costs before launch'),
      active: T('विचार सक्रिय है; शुरू करने का पक्ष तय नहीं', 'The idea is active; launch is not clearly favoured'),
      limited: T('नया व्यापार शुरू करने का समय स्पष्ट नहीं', 'New-business timing is unclear'),
    },
    step: { advance: T('एक ग्राहक समस्या पर सीमित प्रयोग करें और पहले से तय करें कि कौन-सी प्रतिक्रिया आगे बढ़ने का आधार होगी।', 'Run a limited test of one customer problem and decide beforehand what feedback would justify proceeding.'), careful: T('वास्तविक ग्राहक प्रतिक्रिया और लागत देखें; कुंडली माँग या लाभ की पुष्टि नहीं करती।', 'Check actual customer feedback and costs; the chart cannot establish demand or profit.') },
  },
  'vyapar:business-partner': {
    prompt: T('व्यापार में साझेदार जोड़ूँ?', 'Should I add a business partner?'),
    headlines: {
      supportive: T('साझेदारी की बातचीत आगे बढ़ाएँ', 'Advance partnership discussions now'),
      mixed: T('साथ काम आज़माएँ; स्थायी समझौता रोकें', 'Try working together; defer a permanent deal'),
      effort: T('पहले भूमिकाएँ और निर्णय-अधिकार लिखें', 'Define roles and decision rights first'),
      active: T('साझेदारी का विषय सक्रिय है; सहमति का पक्ष तय नहीं', 'Partnership is active; a deal is not clearly favoured'),
      limited: T('साझेदारी तय करने का समय स्पष्ट नहीं', 'Partnership timing is unclear'),
    },
    step: { advance: T('सीमित काम साथ करें; ज़िम्मेदारियाँ और निर्णय का तरीका लिखकर फिर बड़ा समझौता सोचें।', 'Try a limited project together; write down responsibilities and decision rules before a larger agreement.'), careful: T('भूमिकाएँ, मतभेद सुलझाने का तरीका और समझौते की पेशेवर समीक्षा पहले तय करें।', 'Set roles, a dispute process, and appropriate professional review of the agreement first.') },
  },
  'vidya:general': {
    prompt: T('पढ़ाई के लिए अभी क्या दिशा है?', 'What direction fits study now?'),
    headlines: {
      supportive: T('पढ़ाई को व्यवस्थित रूप से आगे बढ़ाएँ', 'Move your study plan forward now'),
      mixed: T('पढ़ें, पर कठिन हिस्से अलग पहचानें', 'Continue studying; identify the difficult parts'),
      effort: T('अभी अभ्यास और समझ पर अधिक समय दें', 'Give practice and understanding more time'),
      active: T('पढ़ाई सक्रिय है; परिणाम का पक्ष तय नहीं', 'Study is active; the outcome is not established'),
      limited: T('पढ़ाई के परिणाम का समय स्पष्ट नहीं', 'Study outcome timing is unclear'),
    },
    step: { advance: T('एक विषय का अभ्यास करें और देखें कि समझ, याद रखने या समय में कहाँ मदद चाहिए।', 'Practise one topic and identify whether understanding, recall, or timing needs work.'), careful: T('अभ्यास के नतीजे से योजना बदलें; कुंडली क्षमता या अंक नहीं मापती।', 'Adjust your plan using practice results; the chart does not measure ability or marks.') },
  },
  'vidya:study-exam': {
    prompt: T('परीक्षा की तैयारी कैसी रखूँ?', 'How should I prepare for an exam?'),
    headlines: {
      supportive: T('परीक्षा अभ्यास की गति बढ़ाएँ', 'Increase focused exam practice now'),
      mixed: T('अभ्यास जारी रखें; कमज़ोर हिस्से जाँचें', 'Keep practising; check weak areas'),
      effort: T('पहले गलतियों का कारण पहचानें', 'Diagnose mistakes before increasing pace'),
      active: T('तैयारी सक्रिय है; अंक का निष्कर्ष नहीं', 'Preparation is active; marks cannot be inferred'),
      limited: T('परीक्षा परिणाम का समय-संकेत स्पष्ट नहीं', 'Exam-outcome timing is unclear'),
    },
    step: { advance: T('बिना नोट्स एक अभ्यास-पत्र हल करें; गलतियों को समझ, याद और समय के हिसाब से बाँटें।', 'Try one practice paper without notes; sort errors by understanding, recall, and timing.'), careful: T('कमज़ोर हिस्से पर दोबारा अभ्यास करके सुधार मापें; अंक कुंडली से न मानें।', 'Practise the weak area again and measure improvement; do not infer marks from the chart.') },
  },
  'vidya:study-course': {
    prompt: T('कौन-सा कोर्स चुनूँ?', 'How should I choose a course?'),
    headlines: {
      supportive: T('कोर्स के विकल्प सक्रिय रूप से परखें', 'Actively compare course options now'),
      mixed: T('विकल्प जाँचें; जल्दबाज़ी में प्रवेश न लें', 'Compare options; avoid a rushed enrolment'),
      effort: T('पहले रुचि और शर्तें परखें', 'Check fit and prerequisites first'),
      active: T('पढ़ाई का विषय सक्रिय है; कोर्स तय नहीं', 'Study is active; no course is chosen by the chart'),
      limited: T('कोर्स चुनने का समय स्पष्ट नहीं', 'Course-choice timing is unclear'),
    },
    step: { advance: T('दो कोर्स के शुरुआती अभ्यास आज़माएँ और प्रवेश की शर्तें मिलाएँ।', 'Try an introductory task from each of two courses and compare prerequisites.'), careful: T('रुचि, लागत और छात्र के वास्तविक अनुभव से निर्णय लें; ग्रह किसी विषय को खारिज नहीं करते।', 'Decide from interests, costs, and a current student’s experience; the chart does not rule out a subject.') },
  },
  'dhan:general': {
    prompt: T('पैसे को लेकर अभी क्या करूँ?', 'What should I do about money now?'),
    headlines: {
      supportive: T('बचत की योजना आगे बढ़ाएँ', 'Move a savings plan forward'),
      mixed: T('बचत करें; बड़ी प्रतिबद्धता सावधानी से लें', 'Save, and approach a large commitment carefully'),
      effort: T('पहले ख़र्च और ज़िम्मेदारियाँ स्पष्ट करें', 'Clarify expenses and obligations first'),
      active: T('धन का विषय सक्रिय है; लाभ का संकेत स्पष्ट नहीं', 'Money is active; gain is not established'),
      limited: T('धन-संबंधी समय का संकेत स्पष्ट नहीं', 'Money-related timing is unclear'),
    },
    step: { advance: T('नियमित आय, आवश्यक ख़र्च और बचत की एक यथार्थ योजना लिखें।', 'Write a realistic plan using regular income, essential expenses, and savings.'), careful: T('बड़ी प्रतिबद्धता से पहले नक़दी और देनदारियाँ जाँचें; निवेश का निर्णय वित्तीय सलाह से लें।', 'Check cash and obligations before a large commitment; seek financial advice for investment decisions.') },
  },
  'vivah:general': {
    prompt: T('विवाह के विषय में अभी कैसे बढ़ूँ?', 'How should I approach marriage now?'),
    headlines: {
      supportive: T('रिश्ते की बातचीत आगे बढ़ाएँ', 'Move relationship conversations forward'),
      mixed: T('बातचीत करें; अहम मतभेद पहले समझें', 'Talk, but understand key differences first'),
      effort: T('निर्णय से पहले अपेक्षाएँ स्पष्ट करें', 'Clarify expectations before a decision'),
      active: T('विवाह का विषय सक्रिय है; निर्णय तय नहीं', 'Marriage is active; a decision is not established'),
      limited: T('विवाह के समय पर स्पष्ट संकेत नहीं', 'Marriage timing is unclear'),
    },
    step: { advance: T('दोनों की सहमति से काम, घर और परिवार की अपेक्षाओं पर खुलकर बात करें।', 'With both people’s consent, discuss expectations about work, home, and family.'), careful: T('वास्तविक संबंध और दोनों की सहमति को आधार रखें; कुंडली साथी या विवाह की तारीख तय नहीं करती।', 'Base the decision on the real relationship and both people’s consent; the chart does not choose a partner or wedding date.') },
  },
  'yatra:general': {
    prompt: T('यात्रा या स्थान बदलने पर कैसे बढ़ूँ?', 'How should I approach travel or relocation?'),
    headlines: {
      supportive: T('यात्रा की तैयारी आगे बढ़ाएँ', 'Advance travel preparations now'),
      mixed: T('यात्रा की योजना बनाएँ; व्यवस्था जाँचें', 'Plan the trip, but verify arrangements'),
      effort: T('पहले दस्तावेज़ और ज़िम्मेदारियाँ सँभालें', 'Settle documents and obligations first'),
      active: T('यात्रा का विषय सक्रिय है; परिणाम तय नहीं', 'Travel is active; the outcome is not established'),
      limited: T('यात्रा के समय पर स्पष्ट संकेत नहीं', 'Travel timing is unclear'),
    },
    step: { advance: T('यात्रा का उद्देश्य तय करें और टिकट, दस्तावेज़ तथा रहने की व्यवस्था की पुष्टि करें।', 'Define the trip’s purpose and confirm tickets, documents, and accommodation.'), careful: T('स्थान बदलने से पहले अवसर, ख़र्च और मौजूदा ज़िम्मेदारियों को मिलाकर देखें।', 'Before relocating, compare the opportunity, costs, and current responsibilities.') },
  },
};

export function phaseDecisionCopy(purposeId: PurposeId, questionId: string, tone: PhaseTone): { prompt: ReadingText; headline: ReadingText; nextStep: ReadingText } {
  const key = `${purposeId}:${questionForPurpose(purposeId, questionId).id}`;
  const copy = COPY[key];
  if (!copy) throw new Error(`missing phase decision copy for ${key}`);
  return { prompt: copy.prompt, headline: copy.headlines[tone], nextStep: copy.steps?.[tone] ?? copy.step[tone === 'supportive' || tone === 'mixed' ? 'advance' : 'careful'] };
}
