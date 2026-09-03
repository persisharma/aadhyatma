import { UJJAIN_GEO, UJJAIN_CITY_ID } from '@/panchang/engine';
import type { AskContext } from '../types';

/** A fixed Tuesday morning in Ujjain — every corpus expectation is relative to it. */
export function testContext(overrides: Partial<AskContext> = {}): AskContext {
  return {
    now: new Date(2026, 11, 1, 10, 0, 0), // 1 Dec 2026, 10:00 local
    location: { ...UJJAIN_GEO, cityId: UJJAIN_CITY_ID },
    calendarSystem: 'purnimant',
    lang: 'hi',
    ...overrides,
  };
}
