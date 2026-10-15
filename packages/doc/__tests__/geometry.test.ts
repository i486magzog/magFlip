import { describe, expect, it } from 'vitest';
import {
  containsRect,
  getRotatedBounds,
  rectsIntersect,
  rotatedRectIntersectsRect,
  unionRects,
} from '../src/common/geometry';
import { getEditRect, getVisibleRect, SurfaceKind } from '../src/model/surface';
import { makeSurface, PAGE_SIZE } from './helpers';

describe('getRotatedBounds', () => {
  it('keeps the box when the rotation is a multiple of 360', () => {
    expect(getRotatedBounds({ x: 10, y: 20, width: 30, height: 40 }, 0))
      .toEqual({ x: 10, y: 20, width: 30, height: 40 });
  });

  it('swaps width and height at 90 degrees', () => {
    const bounds = getRotatedBounds({ x: 0, y: 0, width: 100, height: 20 }, 90);
    expect(bounds.width).toBeCloseTo(20);
    expect(bounds.height).toBeCloseTo(100);
    expect(bounds.x).toBeCloseTo(40);
    expect(bounds.y).toBeCloseTo(-40);
  });
});

describe('rectsIntersect', () => {
  it('is false for rectangles that only touch', () => {
    expect(rectsIntersect({ x: 0, y: 0, width: 10, height: 10 }, { x: 10, y: 0, width: 10, height: 10 })).toBe(false);
  });

  it('is true when they overlap', () => {
    expect(rectsIntersect({ x: 0, y: 0, width: 10, height: 10 }, { x: 9, y: 9, width: 10, height: 10 })).toBe(true);
  });
});

describe('rotatedRectIntersectsRect', () => {
  const page = { x: 0, y: 0, width: 600, height: 900 };

  it('sees a rectangle that lies inside the page', () => {
    expect(rotatedRectIntersectsRect({ x: 10, y: 10, width: 100, height: 100 }, 0, page)).toBe(true);
  });

  it('does not see a rectangle on the pasteboard', () => {
    expect(rotatedRectIntersectsRect({ x: 700, y: 10, width: 100, height: 100 }, 0, page)).toBe(false);
  });

  it('sees a rotated bar reaching into the page', () => {
    // Axis-aligned this bar stands on the pasteboard; turned by 45 degrees
    // its lower end swings across x = 600 into the page.
    const box = { x: 620, y: 0, width: 40, height: 600 };
    expect(rotatedRectIntersectsRect(box, 0, page)).toBe(false);
    expect(rotatedRectIntersectsRect(box, 45, page)).toBe(true);
  });

  it('does not see a rotated square whose bounds overlap but whose corners do not', () => {
    // A square turned by 45 degrees next to the corner of the target: the
    // bounding boxes overlap, the shapes do not.
    const target = { x: 0, y: 0, width: 100, height: 100 };
    const box = { x: 120, y: 120, width: 100, height: 100 };
    expect(getRotatedBounds(box, 45).x).toBeLessThan(100);
    expect(rotatedRectIntersectsRect(box, 45, target)).toBe(false);
  });

  it('sees a line that crosses the page', () => {
    expect(rotatedRectIntersectsRect({ x: -100, y: 400, width: 800, height: 0 }, 0, page)).toBe(true);
  });
});

describe('containsRect', () => {
  it('accepts shared edges', () => {
    expect(containsRect({ x: 0, y: 0, width: 10, height: 10 }, { x: 0, y: 0, width: 10, height: 10 })).toBe(true);
  });

  it('rejects a rectangle sticking out', () => {
    expect(containsRect({ x: 0, y: 0, width: 10, height: 10 }, { x: -1, y: 0, width: 10, height: 10 })).toBe(false);
  });
});

describe('unionRects', () => {
  it('returns undefined for an empty list', () => {
    expect(unionRects([])).toBeUndefined();
  });

  it('covers every rectangle', () => {
    expect(unionRects([
      { x: 0, y: 0, width: 10, height: 10 },
      { x: -5, y: 20, width: 10, height: 10 },
    ])).toEqual({ x: -5, y: 0, width: 15, height: 30 });
  });
});

describe('getEditRect', () => {
  const surface = makeSurface('s0');

  it('is the pages when the surface has no extent', () => {
    expect(getEditRect(surface, SurfaceKind.Single, PAGE_SIZE)).toEqual({ x: 0, y: 0, ...PAGE_SIZE });
  });

  it('keeps the whole design after readers were shut out of it', () => {
    const wide = { ...surface, extent: { rect: { x: 0, y: 0, width: 1200, height: 900 }, isViewerVisible: false } };

    // The reader sees one page; the author keeps designing on all of it.
    expect(getVisibleRect(wide, SurfaceKind.Single, PAGE_SIZE)).toEqual({ x: 0, y: 0, ...PAGE_SIZE });
    expect(getEditRect(wide, SurfaceKind.Single, PAGE_SIZE)).toEqual({ x: 0, y: 0, width: 1200, height: 900 });
  });

  it('adds the pages back to an extent that lost them', () => {
    const wrong = { ...surface, extent: { rect: { x: 700, y: 0, width: 300, height: 900 }, isViewerVisible: true } };

    expect(getEditRect(wrong, SurfaceKind.Single, PAGE_SIZE)).toEqual({ x: 0, y: 0, width: 1000, height: 900 });
  });
});
