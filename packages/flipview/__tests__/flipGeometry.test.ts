import { describe, expect, test } from '@jest/globals';
import { MZMath, Zone } from '@magflip/core';
import { FlipActionLine } from '../src/flipActionLine';
import { Flipping } from '../src/flipManager';
import { Gutter } from '../src/gutter';

describe('FlipActionLine', () => {
  test('exposes left, right and center points on the same y', () => {
    const line = new FlipActionLine(0, 400, 300);

    expect(line.leftP).toEqual({ x: 0, y: 300 });
    expect(line.rightP).toEqual({ x: 400, y: 300 });
    expect(line.centerP).toEqual({ x: 200, y: 300 });
  });
});

describe('MZMath', () => {
  test('findSymmetricPoint reflects a point across the origin point', () => {
    expect(MZMath.findSymmetricPoint({ x: 200, y: 600 }, { x: 400, y: 600 })).toEqual({ x: 0, y: 600 });
  });

  test('getRadianPositive always returns a value in [0, 2π)', () => {
    const radian = MZMath.getRadianPositive({ x: 0, y: 0 }, { x: 0, y: -1 });

    expect(radian).toBeCloseTo((3 * Math.PI) / 2);
  });

  test('findPerpendicularFoot projects a point onto a line', () => {
    const line = { p1: { x: 0, y: 0 }, p2: { x: 10, y: 0 } };

    expect(MZMath.findPerpendicularFoot(line, { x: 3, y: 5 })).toEqual({ x: 3, y: 0 });
  });
});

describe('Flipping.getInfoToFlip', () => {
  /**
   * An opened book: left page 0~200, right page 200~400, height 600.
   * The user drags the right-bottom corner (400, 600).
   */
  const createFlipping = () => {
    const flipping = new Flipping();
    flipping.gutter = new Gutter({ left: 200, right: 200, top: 0, bottom: 600, width: 0, height: 600 });
    flipping.eventZone = Zone.RB;
    flipping.activeCornerGP = { x: 400, y: 600 };
    flipping.activeCornerOppositeGP = { x: 0, y: 600 };
    return flipping;
  };

  test('snaps back when released near the starting corner', () => {
    const info = createFlipping().getInfoToFlip({ x: 350, y: 550 });

    expect(info.isSnappingBack).toBe(true);
    expect(info.targetCornerGP).toEqual({ x: 400, y: 600 });
  });

  test('flips forward when released past the gutter', () => {
    const info = createFlipping().getInfoToFlip({ x: 50, y: 550 });

    expect(info.isSnappingBack).toBe(false);
    expect(info.isFlippingForward).toBe(true);
    expect(info.targetCornerGP).toEqual({ x: 0, y: 600 });
  });
});

describe('Flipping.getInfoToRelease', () => {
  const createFlipping = (mouseDownGP: { x: number; y: number }) => {
    const flipping = new Flipping();
    flipping.gutter = new Gutter({ left: 200, right: 200, top: 0, bottom: 600, width: 0, height: 600 });
    flipping.eventZone = Zone.RB;
    flipping.activeCornerGP = { x: 400, y: 600 };
    flipping.activeCornerOppositeGP = { x: 0, y: 600 };
    flipping.mouseDownGP = mouseDownGP;
    return flipping;
  };

  test('turns the page across on a click, though the mouse stayed by the corner', () => {
    const info = createFlipping({ x: 390, y: 590 }).getInfoToRelease({ x: 392, y: 591 });

    expect(info.isSnappingBack).toBe(false);
    expect(info.isFlippingForward).toBe(true);
    expect(info.targetCornerGP).toEqual({ x: 0, y: 600 });
  });

  test('snaps back after a short drag that stays near the corner', () => {
    const info = createFlipping({ x: 390, y: 590 }).getInfoToRelease({ x: 350, y: 550 });

    expect(info.isSnappingBack).toBe(true);
  });

  test('follows the mouse when it was not pressed on the page', () => {
    const flipping = createFlipping({ x: 390, y: 590 });
    flipping.mouseDownGP = undefined;

    expect(flipping.getInfoToRelease({ x: 392, y: 591 }).isSnappingBack).toBe(true);
  });
});
