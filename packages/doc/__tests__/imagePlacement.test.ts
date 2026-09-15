import { describe, expect, it } from 'vitest';
import { getImagePlacement } from '../src/media/imagePlacement';
import { MediaFit } from '../src/model/element';

const BOX = { width: 200, height: 100 };
const SQUARE = { width: 400, height: 400 };

describe('getImagePlacement', () => {
  it('covers the box and centres the overflow, like object-fit: cover', () => {
    expect(getImagePlacement(BOX, MediaFit.Cover, null, SQUARE)).toEqual({ x: 0, y: -50, width: 200, height: 200 });
  });

  it('fits inside the box and centres the gap, like object-fit: contain', () => {
    expect(getImagePlacement(BOX, MediaFit.Contain, null, SQUARE)).toEqual({ x: 50, y: 0, width: 100, height: 100 });
  });

  it('fills the box with the cropped region when it has the shape of the box', () => {
    const crop = { x: 0.25, y: 0.5, width: 0.5, height: 0.25 };

    // Every fit gives the same result: nothing is left over to cover or contain.
    for (const fit of [MediaFit.Cover, MediaFit.Contain, MediaFit.Fill]) {
      expect(getImagePlacement(BOX, fit, crop, SQUARE)).toEqual({ x: -100, y: -200, width: 400, height: 400 });
    }
  });

  it('stretches the region with fill, or when the size of the source is unknown', () => {
    const crop = { x: 0.5, y: 0, width: 0.5, height: 1 };

    expect(getImagePlacement(BOX, MediaFit.Fill, crop, SQUARE)).toEqual({ x: -200, y: -0, width: 400, height: 100 });
    expect(getImagePlacement(BOX, MediaFit.Cover, crop, undefined)).toEqual({ x: -200, y: -0, width: 400, height: 100 });
  });
});
