import type { UpvasInfoEntry } from '../types';
import e0 from './entries/ekadashi-upvas';
import e1 from './entries/janmashtami-upvas';
import e2 from './entries/karwa-chauth-upvas';
import e3 from './entries/maha-shivaratri-upvas';
import e4 from './entries/nirjala-ekadashi-upvas';
import e5 from './entries/pradosh-upvas';
import e6 from './entries/purnima-satyanarayan-upvas';
import e7 from './entries/sankashti-chaturthi-upvas';

/** Every authored entry, drafts included — the accessor filters (PRD-09/P4 §8). */
export const UPVAS_CONTENT: readonly UpvasInfoEntry[] = [e0, e1, e2, e3, e4, e5, e6, e7];
