import { suvicharCaptureSize } from '../suvicharCapture';
it('preserves the complete tall Android card at 1080 physical pixels', () => {
  expect(suvicharCaptureSize(360, 1200, 1)).toEqual({ width: 1080, height: 3600 });
});
it.each([2, 3])('uses UIKit point dimensions at pixel ratio %s', scale => {
  const result = suvicharCaptureSize(360, 1200, scale);
  expect(result.width * scale).toBe(1080); expect(result.height * scale).toBe(3600);
});
it('rounds upward to preserve the final pixel row', () => {
  expect(suvicharCaptureSize(361, 1000, 1).height).toBe(2992);
});
it.each([0, -1, NaN, Infinity])('rejects invalid native geometry %s', invalid => {
  expect(() => suvicharCaptureSize(invalid, 1000, 1)).toThrow();
  expect(() => suvicharCaptureSize(360, invalid, 1)).toThrow();
  expect(() => suvicharCaptureSize(360, 1000, invalid)).toThrow();
});
