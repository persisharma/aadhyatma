import type { CategoryIconKey } from '@/components/CategoryIcon';

export type PurposeId =
  | 'protection'
  | 'obstacles'
  | 'courage'
  | 'peace'
  | 'knowledge'
  | 'devotion'
  | 'wealth'
  | 'prosperity'
  | 'health'
  | 'victory'
  | 'moksha'
  | 'auspicious-beginnings'
  | 'family-welfare'
  | 'morning-practice';

export type PurposeMeta = {
  id: PurposeId;
  nameHi: string;
  nameEn: string;
  shortNameEn?: string;
  iconKey: CategoryIconKey;
};

export const purposes: readonly PurposeMeta[] = [
  { id: 'protection', nameHi: 'सुरक्षा', nameEn: 'Protection', iconKey: 'purpose-protection' },
  { id: 'obstacles', nameHi: 'विघ्न निवारण', nameEn: 'Obstacles', iconKey: 'purpose-obstacles' },
  { id: 'courage', nameHi: 'साहस', nameEn: 'Courage', iconKey: 'purpose-courage' },
  { id: 'peace', nameHi: 'शांति', nameEn: 'Peace', iconKey: 'purpose-peace' },
  { id: 'knowledge', nameHi: 'विद्या', nameEn: 'Knowledge', iconKey: 'purpose-insight' },
  { id: 'devotion', nameHi: 'भक्ति', nameEn: 'Devotion', iconKey: 'purpose-devotion' },
  { id: 'wealth', nameHi: 'धन', nameEn: 'Wealth', iconKey: 'purpose-wealth' },
  { id: 'prosperity', nameHi: 'समृद्धि', nameEn: 'Prosperity', iconKey: 'purpose-prosperity' },
  { id: 'health', nameHi: 'आरोग्य', nameEn: 'Health', iconKey: 'purpose-health' },
  { id: 'victory', nameHi: 'विजय', nameEn: 'Victory', iconKey: 'purpose-victory' },
  { id: 'moksha', nameHi: 'मोक्ष', nameEn: 'Moksha', iconKey: 'purpose-moksha' },
  {
    id: 'auspicious-beginnings',
    nameHi: 'शुभारम्भ',
    nameEn: 'Auspicious Beginnings',
    shortNameEn: 'Auspicious',
    iconKey: 'purpose-auspicious',
  },
  {
    id: 'family-welfare',
    nameHi: 'कुटुम्ब कल्याण',
    nameEn: 'Family Welfare',
    iconKey: 'purpose-family',
  },
  {
    id: 'morning-practice',
    nameHi: 'प्रभात साधना',
    nameEn: 'Morning Practice',
    iconKey: 'purpose-morning',
  },
];

const PURPOSE_BY_ID = new Map(purposes.map((purpose) => [purpose.id, purpose] as const));

export function getPurposeMeta(id: PurposeId): PurposeMeta {
  const meta = PURPOSE_BY_ID.get(id);
  if (!meta) throw new Error(`Unknown purpose: ${id}`);
  return meta;
}
