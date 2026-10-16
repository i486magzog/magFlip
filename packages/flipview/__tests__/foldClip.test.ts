import { describe, expect, test } from '@jest/globals';
import { clipPolygonToSide, getFoldClip, toClipPath } from '../src/foldClip';

const PAGE = { width: 400, height: 600 };
const MARGIN = 50;

describe('clipPolygonToSide', () => {
  const square = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }];

  test('keeps the half of a square on the side asked for', () => {
    // A vertical line at x = 40, keeping the left.
    const left = clipPolygonToSide(square, { x: 40, y: -10 }, { x: 40, y: 110 }, { x: 0, y: 50 });

    expect(left).toHaveLength(4);
    expect(Math.max(...left.map(point => point.x))).toBeCloseTo(40);
    expect(Math.min(...left.map(point => point.x))).toBe(0);
  });

  test('keeps all of a square that lies on that side', () => {
    expect(clipPolygonToSide(square, { x: 200, y: 0 }, { x: 200, y: 100 }, { x: 0, y: 0 })).toEqual(square);
  });
});

describe('getFoldClip', () => {
  // The bottom right corner of a right page folds over: the fold line runs from
  // the bottom edge (x = 300) to the right edge (y = 500).
  const foldA = { x: 300, y: 600 };
  const foldB = { x: 400, y: 500 };
  const corner = { x: 400, y: 600 };

  test('leaves the page what has not folded over, with the tabs beyond its edge', () => {
    const area = getFoldClip(foldA, foldB, corner, false, PAGE, MARGIN)!;

    // The top of the page and of the margin stays, the folded corner does not.
    expect(area).toContainEqual({ x: -MARGIN, y: -MARGIN });
    expect(area).toContainEqual({ x: PAGE.width + MARGIN, y: -MARGIN });
    expect(area).not.toContainEqual({ x: PAGE.width + MARGIN, y: PAGE.height + MARGIN });
  });

  test('gives the flap only what has folded over', () => {
    const area = getFoldClip(foldA, foldB, corner, true, PAGE, MARGIN)!;

    expect(area).toContainEqual({ x: PAGE.width + MARGIN, y: PAGE.height + MARGIN });
    expect(area).not.toContainEqual({ x: -MARGIN, y: -MARGIN });
  });

  test('cuts nothing from the page and shows nothing on the flap before a fold', () => {
    expect(getFoldClip(corner, corner, corner, false, PAGE, MARGIN)).toBeUndefined();
    expect(getFoldClip(corner, corner, corner, true, PAGE, MARGIN)).toEqual([]);
  });
});

describe('toClipPath', () => {
  test('writes no clip, an empty clip or the corners', () => {
    expect(toClipPath(undefined)).toBe('');
    expect(toClipPath([])).toBe('polygon(0 0, 0 0, 0 0)');
    expect(toClipPath([{ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }])).toBe('polygon(1px 2px, 3px 4px, 5px 6px)');
  });
});
