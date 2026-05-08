import { deities, type DeityIconKey } from './deities';
import type { Deity } from './texts';

const expectedIcons: Record<Deity, DeityIconKey> = {
  rama: 'bowArrow',
  krishna: 'bansuriPeacockFeather',
  shiva: 'trishul',
  hanuman: 'gada',
  durga: 'lotus',
  ganesha: 'modak',
};

for (const deity of deities) {
  const iconKey: DeityIconKey = deity.iconKey;
  if (iconKey !== expectedIcons[deity.id]) {
    throw new Error(`Unexpected icon for ${deity.id}: ${iconKey}`);
  }
}
