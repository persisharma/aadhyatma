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

export type AccelerometerSample = { x: number; y: number; z: number };

/** The heading math assumes a flat, screen-up phone; past this tilt the
 * horizontal-field projection goes wrong faster than smoothing can hide. */
export const TILT_MAX_DEG = 20;

/**
 * Degrees the device has tilted away from flat (screen up or down), from a
 * gravity-bearing accelerometer sample: the angle between the device normal
 * (±Z) and vertical. Sign-agnostic on |z| because expo-sensors' z convention
 * differs across platforms (iOS −1 g face-up, Android +1 g). A zero-magnitude
 * sample (free fall, broken sensor) reads as flat — the field check still
 * guards the heading.
 */
export function tiltDegreesFromAccel(sample: AccelerometerSample): number {
  const magnitude = Math.sqrt(sample.x * sample.x + sample.y * sample.y + sample.z * sample.z);
  if (magnitude === 0) return 0;
  const cos = Math.min(1, Math.abs(sample.z) / magnitude);
  return (Math.acos(cos) * 180) / Math.PI;
}

export function isTilted(tiltDegrees: number): boolean {
  return tiltDegrees > TILT_MAX_DEG;
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

/**
 * The cardinal wall whose 90° arc contains the heading — the pada ring's
 * vocabulary (PRD-24 Phase 2 §A5): north owns [315°, 45°), east [45°, 135°),
 * south [135°, 225°), west [225°, 315°).
 */
export type CardinalSide = 'north' | 'east' | 'south' | 'west';

const SIDE_ARC_START: Readonly<Record<CardinalSide, number>> = {
  north: 315,
  east: 45,
  south: 135,
  west: 225,
};

export function cardinalSideForHeading(heading: number): CardinalSide {
  const sector = Math.floor(normalizeHeading(heading + 45) / 90); // 0 = north … 3 = west
  return (['north', 'east', 'south', 'west'] as const)[sector];
}

/**
 * The 1–8 pada position along `facing`'s wall for a heading, clockwise —
 * 11.25° per pada (§A5; the number never reaches copy, names do). Null when
 * the heading lies outside that wall's 90° arc, or when the facing is
 * intercardinal: classical door padas belong to cardinal walls only.
 */
export function padaForHeading(heading: number, facing: DishaDirection): number | null {
  if (!(facing in SIDE_ARC_START)) return null;
  const offset = normalizeHeading(heading - SIDE_ARC_START[facing as CardinalSide]);
  if (offset >= 90) return null;
  return Math.floor(offset / 11.25) + 1;
}

/** Degrees the dik's centre sits clockwise from north (labels on the chakra). */
export function dikCenterDegrees(dik: DishaDirection): number {
  const index = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'].indexOf(dik);
  return index * 45;
}

/** Keep the module honestly tied to the shared vocabulary. */
export const ALL_DIK: readonly DishaDirection[] = DISHA_ORDER;
