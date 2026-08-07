/**
 * The curated catalog behind default-on festive reminders.
 *
 * Every entry pairs a famous festival (an `ObservanceRule.id` from
 * `panchang/festivals.ts`) with:
 *   - a hand-authored bilingual greeting + invitation ("the customised message"), and
 *   - the id of a bundled library section the invitation names, which is what a tap
 *     on the notification opens.
 *
 * Deliberately data-only: no imports from `festivals.ts`, `texts.ts`, or
 * `expo-notifications`, so the planner that consumes it stays pure and
 * `tsx`-testable. Cross-references are pinned instead by
 * `__tests__/festiveReminders.test.ts`, which fails if a `ruleId` leaves the
 * observance catalog or a `sourceId` stops being a routable library entry.
 *
 * Curation rules (enforced by that test):
 *   - Famous only. This ships enabled by default, so every entry has to be a
 *     festival a typical user would already be observing — the opt-in surface for
 *     everything else is following a vrat (§33), not this list.
 *   - Every entry MUST name real bundled content. A festival with no honest
 *     content match (Raksha Bandhan, Bhai Dooj) is simply absent rather than
 *     pointed at a loosely-related text — the whole promise of the message is
 *     that the reading it names is one tap away.
 *   - Order is fame order, and it is the cap tie-break (see `festiveReminderPure`).
 */

export type FestiveReminderEntry = {
  /** `ObservanceRule.id` in `panchang/festivals.ts`. */
  ruleId: string;
  /** `LibraryEntry.id` in `data/texts.ts` — the reading the message invites. */
  sourceId: string;
  /** Festive greeting, Devanagari-led. gu/kn are re-scripted at format time. */
  greetingHi: string;
  greetingEn: string;
  /** The invitation to read `sourceId` today. Names the text explicitly. */
  inviteHi: string;
  inviteEn: string;
};

export const FESTIVE_REMINDERS: readonly FestiveReminderEntry[] = [
  {
    ruleId: 'diwali',
    sourceId: 'mahalakshmi-ashtakam',
    greetingHi: 'शुभ दीपावली',
    greetingEn: 'Happy Diwali',
    inviteHi: 'दीप जलाएँ और महालक्ष्म्यष्टकम् का पाठ करें।',
    inviteEn: 'Light a lamp and read the Mahalakshmi Ashtakam.',
  },
  {
    ruleId: 'maha-shivaratri',
    sourceId: 'shiv-chalisa',
    greetingHi: 'हर हर महादेव',
    greetingEn: 'Har Har Mahadev',
    inviteHi: 'शिव की इस रात्रि में शिव चालीसा का पाठ करें।',
    inviteEn: 'Read the Shiv Chalisa on this night of Shiva.',
  },
  {
    ruleId: 'holi',
    sourceId: 'krishna-chalisa',
    greetingHi: 'होली की शुभकामनाएँ',
    greetingEn: 'Happy Holi',
    inviteHi: 'रंगों के इस पर्व पर कृष्ण चालीसा का पाठ करें।',
    inviteEn: 'Read the Krishna Chalisa on this festival of colours.',
  },
  {
    ruleId: 'navratri-start',
    sourceId: 'durga-chalisa',
    greetingHi: 'जय माता दी',
    greetingEn: 'Jai Mata Di',
    inviteHi: 'नवरात्रि के पहले दिन दुर्गा चालीसा से आरंभ करें।',
    inviteEn: 'Begin the nine nights with the Durga Chalisa.',
  },
  {
    ruleId: 'dussehra',
    sourceId: 'ram-chalisa',
    greetingHi: 'विजयादशमी की शुभकामनाएँ',
    greetingEn: 'Happy Dussehra',
    inviteHi: 'धर्म की विजय के दिन राम चालीसा का पाठ करें।',
    inviteEn: 'Read the Ram Chalisa on the day dharma prevailed.',
  },
  {
    ruleId: 'janmashtami',
    sourceId: 'bhagavad-gita',
    greetingHi: 'जय श्री कृष्ण',
    greetingEn: 'Jai Shri Krishna',
    inviteHi: 'कृष्ण जन्म के इस दिन भगवद् गीता का एक अध्याय पढ़ें।',
    inviteEn: 'Read a chapter of the Bhagavad Gītā to mark Janmashtami.',
  },
  {
    ruleId: 'ganesh-chaturthi',
    sourceId: 'ganesh-chalisa',
    greetingHi: 'गणपति बप्पा मोरया',
    greetingEn: 'Ganpati Bappa Morya',
    inviteHi: 'विघ्नहर्ता के स्वागत में गणेश चालीसा का पाठ करें।',
    inviteEn: 'Welcome Ganesha with the Ganesh Chalisa.',
  },
  {
    ruleId: 'ram-navami',
    sourceId: 'ram-chalisa',
    greetingHi: 'जय श्री राम',
    greetingEn: 'Jai Shri Ram',
    inviteHi: 'राम जन्म के दिन राम चालीसा का पाठ करें।',
    inviteEn: 'Read the Ram Chalisa on Ram Navami.',
  },
  {
    ruleId: 'hanuman-jayanti',
    sourceId: 'hanuman-chalisa',
    greetingHi: 'जय बजरंगबली',
    greetingEn: 'Jai Bajrangbali',
    inviteHi: 'आज हनुमान चालीसा का पाठ अवश्य करें।',
    inviteEn: 'Read the Hanuman Chalisa today.',
  },
  {
    ruleId: 'makar-sankranti',
    sourceId: 'surya-ashtakam',
    greetingHi: 'मकर संक्रांति की शुभकामनाएँ',
    greetingEn: 'Happy Makar Sankranti',
    inviteHi: 'सूर्य के उत्तरायण पर सूर्याष्टकम् का पाठ करें।',
    inviteEn: 'Read the Surya Ashtakam as the Sun turns north.',
  },
  {
    ruleId: 'vasant-panchami',
    sourceId: 'saraswati-chalisa',
    greetingHi: 'जय मां सरस्वती',
    greetingEn: 'Jai Maa Saraswati',
    inviteHi: 'विद्या के इस पर्व पर सरस्वती चालीसा का पाठ करें।',
    inviteEn: 'Read the Saraswati Chalisa on this festival of learning.',
  },
  {
    ruleId: 'dhanteras',
    sourceId: 'kubera-stotram',
    greetingHi: 'शुभ धनतेरस',
    greetingEn: 'Happy Dhanteras',
    inviteHi: 'समृद्धि की कामना से श्री कुबेर स्तोत्रम् का पाठ करें।',
    inviteEn: 'Read the Kubera Stotram for prosperity.',
  },
  {
    ruleId: 'karwa-chauth',
    sourceId: 'jai-ambe-gauri',
    greetingHi: 'करवा चौथ की शुभकामनाएँ',
    greetingEn: 'Karwa Chauth greetings',
    inviteHi: 'मां गौरी की आरती जय अम्बे गौरी गाएँ।',
    inviteEn: 'Sing Jai Ambe Gauri, the aarti of Maa Gauri.',
  },
  {
    ruleId: 'guru-purnima',
    sourceId: 'bhagavad-gita',
    greetingHi: 'गुरु पूर्णिमा की शुभकामनाएँ',
    greetingEn: 'Guru Purnima greetings',
    inviteHi: 'गुरु स्मरण में भगवद् गीता का एक अध्याय पढ़ें।',
    inviteEn: 'Remember your guru with a chapter of the Bhagavad Gītā.',
  },
  {
    ruleId: 'govardhan-puja',
    sourceId: 'krishna-chalisa',
    greetingHi: 'गोवर्धन पूजा की शुभकामनाएँ',
    greetingEn: 'Govardhan Puja greetings',
    inviteHi: 'अन्नकूट के दिन कृष्ण चालीसा का पाठ करें।',
    inviteEn: 'Read the Krishna Chalisa on Annakut day.',
  },
  {
    ruleId: 'chhath-puja',
    sourceId: 'surya-ashtakam',
    greetingHi: 'छठ पूजा की शुभकामनाएँ',
    greetingEn: 'Chhath Puja greetings',
    inviteHi: 'सूर्य को अर्घ्य देते हुए सूर्याष्टकम् का पाठ करें।',
    inviteEn: 'Offer arghya to the Sun with the Surya Ashtakam.',
  },
  {
    ruleId: 'akshaya-tritiya',
    sourceId: 'vishnu-sahasranama',
    greetingHi: 'अक्षय तृतीया की शुभकामनाएँ',
    greetingEn: 'Akshaya Tritiya greetings',
    inviteHi: 'अक्षय फल के लिए विष्णु सहस्रनाम का पाठ करें।',
    inviteEn: 'Read the Vishnu Sahasranama for lasting merit.',
  },
  {
    ruleId: 'gita-jayanti',
    sourceId: 'bhagavad-gita',
    greetingHi: 'गीता जयंती की शुभकामनाएँ',
    greetingEn: 'Gita Jayanti greetings',
    inviteHi: 'गीता के प्रकट दिवस पर एक अध्याय पढ़ें।',
    inviteEn: 'Read a chapter on the day the Gītā was spoken.',
  },
];

const ENTRY_BY_RULE_ID = new Map(FESTIVE_REMINDERS.map((e) => [e.ruleId, e] as const));

/** The catalog entry for an observance rule, or null when it isn't a festive reminder. */
export function getFestiveReminderEntry(ruleId: string): FestiveReminderEntry | null {
  return ENTRY_BY_RULE_ID.get(ruleId) ?? null;
}

/** Fame order — the index doubles as the cap tie-break priority. */
export function festiveReminderOrder(ruleId: string): number {
  const index = FESTIVE_REMINDERS.findIndex((e) => e.ruleId === ruleId);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}
