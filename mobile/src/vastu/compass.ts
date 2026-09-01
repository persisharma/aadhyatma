/**
 * वास्तु दिशा compass math (PRD-24) — PURE: no sensor, clock or store reads.
 * The hook (`useCompassHeading.ts`) feeds magnetometer samples through these;
 * keeping the math here makes the wrap/sector/declination behaviour unit-testable
 * without mocking expo-sensors.
 *
 * Conventions:
 * - Headings are degrees clockwise from north, normalised to [0, 360).
 * - Declination is east-positive (WMM convention): true = magnetic + declination.
 * - The device is assumed flat, screen up, portrait — the classical use ("stand
 *   in the room, point the phone's top edge") and the only orientation the UI
 *   instructs. Tilt error is folded into the honest-accuracy state, not modelled.
 */
import { DISHA_ORDER, type DishaDirection } from '@/panchang/eventMuhurat';

/** Earth's magnetic field magnitude lies in ~[25, 65] µT; readings outside this
 * band mean nearby metal/current or a sensor needing calibration (PRD-24 §4). */
export const FIELD_MIN_UT = 25;
export const FIELD_MAX_UT = 65;

export type MagnetometerSample = { x: number; y: number; z: number };

export function normalizeHeading(deg: number): number {
  // Double modulo also normalises the -0 that a bare `deg % 360` can emit.
  return ((deg % 360) + 360) % 360;
}

/**
 * Magnetic heading from a flat-portrait magnetometer sample. Device axes are
 * +X right of screen, +Y top of screen (expo-sensors uses the shared device
 * coordinate system on both platforms): top edge pointing magnetic north puts
 * the horizontal field along +Y → 0°; pointing east puts it along −X → 90°.
 */
export function headingFromSample(sample: MagnetometerSample): number {
  return normalizeHeading((Math.atan2(-sample.x, sample.y) * 180) / Math.PI);
}

export function fieldMagnitude(sample: MagnetometerSample): number {
  return Math.sqrt(sample.x * sample.x + sample.y * sample.y + sample.z * sample.z);
}

export function isFieldPlausible(sample: MagnetometerSample): boolean {
  const m = fieldMagnitude(sample);
  return m >= FIELD_MIN_UT && m <= FIELD_MAX_UT;
}

/** True-north heading; a null declination (city not in the table) stays magnetic. */
export function applyDeclination(magneticHeading: number, declination: number | null): number {
  return normalizeHeading(magneticHeading + (declination ?? 0));
}

/**
 * Wrap-aware exponential smoothing: steps by the SHORTEST arc so 358° → 2°
 * moves through north instead of sweeping the long way round the dial.
 */
export function smoothHeading(prev: number | null, next: number, alpha = 0.25): number {
  if (prev == null) return normalizeHeading(next);
  const delta = ((next - prev + 540) % 360) - 180;
  return normalizeHeading(prev + alpha * delta);
}

/**
 * The 45° sector a heading falls in, in DISHA_ORDER vocabulary — north is the
 * sector [337.5°, 22.5°). DISHA_ORDER starts at east, so the index walks from
 * the east sector (heading 90° ± 22.5°) clockwise.
 */
export function dikForHeading(heading: number): DishaDirection {
  const sector = Math.floor(normalizeHeading(heading + 22.5) / 45); // 0 = north … 7 = north-west
  // Sector order from north clockwise; map into DISHA_ORDER (east-first) ids.
  const fromNorth: readonly DishaDirection[] = [
    'north',
    'northeast',
    'east',
    'southeast',
    'south',
    'southwest',
    'west',
    'northwest',
  ];
  return fromNorth[sector];
}

/** Degrees the dik's centre sits clockwise from north (labels on the chakra). */
export function dikCenterDegrees(dik: DishaDirection): number {
  const index = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'].indexOf(dik);
  return index * 45;
}

/** Keep the module honestly tied to the shared vocabulary. */
export const ALL_DIK: readonly DishaDirection[] = DISHA_ORDER;
