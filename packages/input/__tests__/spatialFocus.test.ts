import { describe, expect, it } from 'vitest';
import { InputAction } from '../src/actions';
import { findFirstFocus, findNextFocus, IFocusRect } from '../src/spatialFocus';

const rect = (id: string, x: number, y: number, width = 100, height = 40): IFocusRect =>
  ({ id, x, y, width, height });

/**
 * Three columns on two rows, the way links sit on a page.
 *
 *   topLeft   topMiddle   topRight
 *   bottomLeft            bottomRight
 */
const topLeft = rect('topLeft', 0, 0);
const topMiddle = rect('topMiddle', 200, 0);
const topRight = rect('topRight', 400, 0);
const bottomLeft = rect('bottomLeft', 0, 200);
const bottomRight = rect('bottomRight', 400, 200);
const page = [topLeft, topMiddle, topRight, bottomLeft, bottomRight];

describe('findNextFocus', () => {
  it('moves to the nearest rect in that direction', () => {
    expect(findNextFocus(topLeft, page, InputAction.Right)?.id).toBe('topMiddle');
    expect(findNextFocus(topMiddle, page, InputAction.Right)?.id).toBe('topRight');
    expect(findNextFocus(topRight, page, InputAction.Left)?.id).toBe('topMiddle');
    expect(findNextFocus(topLeft, page, InputAction.Down)?.id).toBe('bottomLeft');
    expect(findNextFocus(bottomRight, page, InputAction.Up)?.id).toBe('topRight');
  });

  it('prefers what is straight ahead over something nearer but diagonal', () => {
    const ahead = rect('ahead', 300, 0);
    const nearerButBelow = rect('nearerButBelow', 150, 300);

    expect(findNextFocus(topLeft, [ahead, nearerButBelow], InputAction.Right)?.id).toBe('ahead');
  });

  it('returns nothing at the edge, so the host decides what the edge means', () => {
    expect(findNextFocus(topRight, page, InputAction.Right)).toBeUndefined();
    expect(findNextFocus(topLeft, page, InputAction.Up)).toBeUndefined();
    expect(findNextFocus(topLeft, [topLeft], InputAction.Right)).toBeUndefined();
  });

  it('ignores what sits beside the reader rather than ahead', () => {
    const sameColumnAbove = rect('sameColumnAbove', 0, -200);

    expect(findNextFocus(topLeft, [sameColumnAbove], InputAction.Right)).toBeUndefined();
    expect(findNextFocus(topLeft, [sameColumnAbove], InputAction.Up)?.id).toBe('sameColumnAbove');
  });

  it('starts at the first rect when nothing is focused yet', () => {
    expect(findNextFocus(undefined, page, InputAction.Right)?.id).toBe('topLeft');
  });

  it('finds nothing on a page with nothing to focus', () => {
    expect(findNextFocus(topLeft, [], InputAction.Right)).toBeUndefined();
    expect(findNextFocus(undefined, [], InputAction.Down)).toBeUndefined();
  });
});

describe('findFirstFocus', () => {
  it('picks the topmost rect, and the leftmost of those', () => {
    expect(findFirstFocus([bottomRight, topMiddle, topLeft])?.id).toBe('topLeft');
  });

  it('finds nothing in an empty page', () => {
    expect(findFirstFocus([])).toBeUndefined();
  });
});
