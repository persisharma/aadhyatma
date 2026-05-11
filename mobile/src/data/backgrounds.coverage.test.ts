import assert from 'node:assert/strict';

import { aartiIdByIndex } from './aarti';
import {
  getCategoryBackground,
  getDeityBackground,
  getReaderBackground,
  getSourceBackground,
} from './backgrounds';
import { categories } from './categories';
import { deities } from './deities';
import { japamMantras } from './japam';
import { library } from './texts';

for (const category of categories.filter((item) => item.status === 'active')) {
  assert.ok(getCategoryBackground(category.id), `missing background for category ${category.id}`);
}

for (const deity of deities) {
  assert.ok(getDeityBackground(deity.id), `missing background for deity ${deity.id}`);
}

for (const entry of library.filter((item) => item.status === 'active' && !item.hidden)) {
  assert.ok(getSourceBackground(entry.id), `missing source background for ${entry.id}`);
  assert.ok(getReaderBackground(entry.id, { id: 'coverage', stanza: 1 }), `missing reader background for ${entry.id}`);
}

for (const aartiId of aartiIdByIndex) {
  assert.ok(getSourceBackground(aartiId), `missing source background for ${aartiId}`);
}

for (const mantra of japamMantras) {
  assert.ok(getSourceBackground(mantra.id), `missing japa background for ${mantra.id}`);
}
