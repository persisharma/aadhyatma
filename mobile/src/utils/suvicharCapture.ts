/** Native view-shot uses UIKit points on iOS and bitmap pixels on Android. */
export function suvicharCaptureSize(width: number, height: number, captureScale: number) {
  if (![width, height, captureScale].every(n => Number.isFinite(n) && n > 0)) {
    throw new Error('Suvichar layout is not ready');
  }
  return { width: 1080 / captureScale, height: Math.ceil(height * 1080 / width) / captureScale };
}
