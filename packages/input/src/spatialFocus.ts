import { DirectionAction, InputAction } from './actions';

/**
 * Where something the reader can focus sits on screen.
 *
 * Coordinates are whatever the caller measures in, as long as they all come
 * from the same place: `getBoundingClientRect()` in a browser, published
 * coordinates in a test.
 */
export interface IFocusRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
/**
 * How much an offset sideways counts against a candidate. Above 1 it means
 * "prefer what is straight ahead, even when something diagonal is nearer".
 */
const CROSS_AXIS_PENALTY = 3;

interface IAxes {
  /** Distance along the direction of travel, negative when behind the reader. */
  ahead: number;
  /** Gap across that direction, 0 when the two overlap. */
  aside: number;
}
/**
 * Splits the distance between two rects into "ahead" and "aside" for one direction.
 */
function measure(from: IFocusRect, to: IFocusRect, direction: DirectionAction): IAxes {
  const fromCenterX = from.x + from.width / 2;
  const fromCenterY = from.y + from.height / 2;
  const toCenterX = to.x + to.width / 2;
  const toCenterY = to.y + to.height / 2;
  const gap = (a1: number, a2: number, b1: number, b2: number) => Math.max(0, Math.max(b1 - a2, a1 - b2));

  const acrossX = gap(from.x, from.x + from.width, to.x, to.x + to.width);
  const acrossY = gap(from.y, from.y + from.height, to.y, to.y + to.height);

  switch (direction) {
    case InputAction.Left: return { ahead: fromCenterX - toCenterX, aside: acrossY };
    case InputAction.Right: return { ahead: toCenterX - fromCenterX, aside: acrossY };
    case InputAction.Up: return { ahead: fromCenterY - toCenterY, aside: acrossX };
    case InputAction.Down: return { ahead: toCenterY - fromCenterY, aside: acrossX };
  }
}
/**
 * Returns the rect a reader reaches by pressing one direction, or `undefined`
 * when there is nothing that way — then the host decides what the edge means
 * (turn the page, or leave the page).
 *
 * Nearest wins, but something straight ahead beats something closer diagonally.
 */
export function findNextFocus(
  from: IFocusRect | undefined,
  candidates: IFocusRect[],
  direction: DirectionAction,
): IFocusRect | undefined {
  if (!from) { return findFirstFocus(candidates); }

  let best: IFocusRect | undefined;
  let bestScore = Number.POSITIVE_INFINITY;
  for (const candidate of candidates) {
    if (candidate.id === from.id) { continue; }
    const { ahead, aside } = measure(from, candidate, direction);
    if (ahead <= 0) { continue; }

    const score = ahead + aside * CROSS_AXIS_PENALTY;
    if (score < bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}
/**
 * Returns where focus starts on a page: the topmost rect, and the leftmost of
 * those — where a reader of a left-to-right page looks first.
 */
export function findFirstFocus(candidates: IFocusRect[]): IFocusRect | undefined {
  let first: IFocusRect | undefined;
  for (const candidate of candidates) {
    if (!first || candidate.y < first.y || (candidate.y === first.y && candidate.x < first.x)) {
      first = candidate;
    }
  }
  return first;
}
