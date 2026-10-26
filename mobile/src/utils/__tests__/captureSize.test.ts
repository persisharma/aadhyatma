import { capturePixelSize } from '../captureSize';
it('passes Android pixel sizes through unchanged', () => {
  expect(capturePixelSize(680, 2000, 1)).toEqual({ width: 680, height: 2000 });
});
it.each([2, 3])('uses UIKit point dimensions at pixel ratio %s', scale => {
  const result = capturePixelSize(1080, 1350, scale);
  expect(result.width * scale).toBe(1080); expect(result.height * scale).toBe(1350);
});
