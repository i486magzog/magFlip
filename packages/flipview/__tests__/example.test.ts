import { Flipping } from '../src/flipManager';
import { Point, Zone, Rect } from '@magflip/core';
import { describe, it, expect, beforeEach, test } from '@jest/globals';
import { FlipActionLine } from '../src/flipActionLine';
import { Gutter } from '../src/gutter';

// describe('Flipping', () => {
//   let flipping: Flipping;

//   beforeEach(() => {
//     flipping = new Flipping();
//     flipping.gutter = new Gutter({
//       left: 100,
//       right: 300,
//       top: 0,
//       bottom: 600,
//       width: 200,
//       height: 600
//     });
//     flipping.flipActionLine = new FlipActionLine(0, 400, 300);
//     flipping.activeCornerGP = new Point({x:400, y:600});
//     flipping.activeCornerOppositeGP = new Point({x:0, y:600});
//     flipping.eventZone = Zone.RB;
//   });

//   test('flip method should return correct FlipData', () => {
//     const mouseGP = new Point({x:350, y:550});
//     const pageWH = { width: 200, height: 600 };
//     const isSpreadOpen = true;
//     const result = flipping.flip(mouseGP, pageWH, isSpreadOpen);

//     expect(result).toBeDefined();
//     expect(result.page2).toBeDefined();
//     expect(result.mask).toBeDefined();
//     expect(result.shadow).toBeDefined();

//     // Page2
//     expect(result.page2.left).toBeCloseTo(250);
//     expect(result.page2.top).toBeCloseTo(250);
//     expect(result.page2.rotate).toBeCloseTo(5.176, 3);

//     // Mask
//     expect(result.mask.page2.p1).toEqual({ x: 0, y: 600 });
//     expect(result.mask.page1.p1).toEqual({ x: 200, y: 600 });

//     // Shadow
//     expect(result.shadow.closingDistance).toBeCloseTo(353.55, 2);
//   });  
// });