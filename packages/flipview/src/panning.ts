/**
 * How far the book is moved from the middle of the viewer, in screen pixels.
 */
export interface IPanOffset {
  x: number;
  y: number;
}
/**
 * Size in screen pixels.
 */
export interface IPanSize {
  width: number;
  height: number;
}
/**
 * Keeps a moved book touching every edge of the screen it is larger than.
 *
 * The book sits in the middle, so it may be moved by half of what sticks out
 * on each side. A book smaller than the screen has nowhere to go: it stays in
 * the middle, where a reader expects it.
 */
export function clampPan(pan: IPanOffset, bookSize: IPanSize, viewportSize: IPanSize): IPanOffset {
  return {
    x: clampAxis(pan.x, (bookSize.width - viewportSize.width) / 2),
    y: clampAxis(pan.y, (bookSize.height - viewportSize.height) / 2),
  };
}
/**
 * Cuts one axis down to `±limit`, where a limit below zero means the book fits
 * and cannot move at all. `-0` is turned into `0`: it would reach both a
 * `translate(-0px)` and a test comparison, and reads as a mistake in either.
 */
function clampAxis(value: number, limit: number): number {
  const reach = Math.max(0, limit);
  const clamped = Math.min(reach, Math.max(-reach, value));
  return clamped === 0 ? 0 : clamped;
}
