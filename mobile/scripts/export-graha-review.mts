/**
 * Writes the jyotishi review sheet for the graha cards (RULEBOOK §14.7.7):
 *
 *   npm run export:graha-review
 *
 * The sheet is rendered from the content tables by `renderGrahaReviewSheet`,
 * so it always matches what the app shows; `grahaReading.engine.test.ts`
 * fails when the committed copy is stale. Run it after any content edit.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderGrahaReviewSheet } from '../src/panchang/grahaReviewSheet';

const here = dirname(fileURLToPath(import.meta.url));
const target = resolve(here, '../../docs/reviews/graha-readings-jyotishi-review.md');

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, renderGrahaReviewSheet());
console.log(`wrote ${target}`);
