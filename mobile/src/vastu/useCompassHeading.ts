/**
 * Live compass heading for the दिशा चक्र (PRD-24 §4). Wraps expo-sensors'
 * Magnetometer behind the honest-accuracy contract:
 *
 * - `unavailable` — no magnetometer (simulators, some tablets). The screen
 *   must open in manual mode; guidance never depends on the sensor.
 * - `unreliable` — the field magnitude has left Earth's plausible band
 *   (nearby metal/current, or the sensor needs its figure-8 calibration).
 *   The heading keeps updating — a wrong-but-live dial plus a visible warning
 *   beats a frozen one — the UI shows the calibration hint.
 * - `ok` — plausible field, smoothed heading.
 *
 * The returned heading is TRUE north when the selected panchang city has a
 * bundled declination (PRD-24 §3), silently magnetic otherwise.
 */
import { useEffect, useRef, useState } from 'react';

import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { getDeclinationForCity } from '@/data/vastu/declination';
import {
  applyDeclination,
  headingFromSample,
  isFieldPlausible,
  smoothHeading,
} from './compass';

export type CompassStatus = 'starting' | 'ok' | 'unreliable' | 'unavailable';

export type CompassHeading = {
  status: CompassStatus;
  /** True-north heading in [0, 360), null until the first sample (or forever when unavailable). */
  heading: number | null;
};

const UPDATE_INTERVAL_MS = 100;
/** Readings outside the plausible band must persist this many samples before the
 * status flips — a single pass near a door frame shouldn't flash the warning. */
const UNRELIABLE_AFTER = 5;

type MagnetometerModule = typeof import('expo-sensors').Magnetometer;

/**
 * Lazy AND probed: a runtime whose binary predates expo-sensors (a stale dev
 * client) must degrade to `unavailable`, the same honest state a sensorless
 * device reports. The probe matters — requiring the expo-sensors barrel
 * initialises EVERY sensor class, so on such a runtime the import itself
 * throws (dev clients redbox it) before any `isAvailableAsync` runs.
 */
function loadMagnetometer(): MagnetometerModule | null {
  try {
    const { requireOptionalNativeModule } =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('expo-modules-core') as typeof import('expo-modules-core');
    // The barrel also inits Pedometer/Gyroscope/…, so probe for the whole
    // sensor family this binary would need before touching it.
    const present = ['ExponentMagnetometer', 'ExponentPedometer'].every((name) =>
      requireOptionalNativeModule(name)
    );
    if (!present) return null;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return (require('expo-sensors') as typeof import('expo-sensors')).Magnetometer;
  } catch {
    return null;
  }
}

export function useCompassHeading(enabled: boolean): CompassHeading {
  const { location } = usePanchangLocation();
  const declination = getDeclinationForCity(location.cityId);

  const [state, setState] = useState<CompassHeading>({ status: 'starting', heading: null });
  const smoothed = useRef<number | null>(null);
  const implausibleRun = useRef(0);
  const declinationRef = useRef(declination);
  declinationRef.current = declination;

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let subscription: { remove: () => void } | null = null;

    (async () => {
      const Magnetometer = loadMagnetometer();
      const available = Magnetometer
        ? await Magnetometer.isAvailableAsync().catch(() => false)
        : false;
      if (cancelled) return;
      if (!Magnetometer || !available) {
        setState({ status: 'unavailable', heading: null });
        return;
      }
      Magnetometer.setUpdateInterval(UPDATE_INTERVAL_MS);
      subscription = Magnetometer.addListener((sample) => {
        smoothed.current = smoothHeading(smoothed.current, headingFromSample(sample));
        if (isFieldPlausible(sample)) {
          implausibleRun.current = 0;
        } else {
          implausibleRun.current += 1;
        }
        setState({
          status: implausibleRun.current >= UNRELIABLE_AFTER ? 'unreliable' : 'ok',
          heading: applyDeclination(smoothed.current, declinationRef.current),
        });
      });
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
      smoothed.current = null;
      implausibleRun.current = 0;
    };
  }, [enabled]);

  return state;
}
