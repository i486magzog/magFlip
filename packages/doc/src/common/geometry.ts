/**
 * A point in px.
 */
export interface IPoint {
  x: number;
  y: number;
}
/**
 * A size in px.
 */
export interface ISize {
  width: number;
  height: number;
}
/**
 * An axis-aligned rectangle. `x`, `y` is the top-left corner.
 */
export interface IRect extends IPoint, ISize {}
/**
 * Tolerance used when comparing coordinates, in px.
 */
const EPSILON = 1e-6;

/**
 * Returns the center point of the rectangle.
 */
export function getRectCenter(rect: IRect): IPoint {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}
/**
 * Rotates the point clockwise around the center.
 * @param degrees Clockwise angle in degrees (y axis points down).
 */
export function rotatePoint(point: IPoint, center: IPoint, degrees: number): IPoint {
  if (degrees % 360 === 0) { return { x: point.x, y: point.y }; }

  const radian = degrees * Math.PI / 180;
  const cos = Math.cos(radian);
  const sin = Math.sin(radian);
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}
/**
 * Returns the four corners of the rectangle rotated around its center,
 * in the order top-left, top-right, bottom-right, bottom-left.
 * @param rotation Clockwise angle in degrees.
 */
export function getRotatedCorners(rect: IRect, rotation: number): IPoint[] {
  const center = getRectCenter(rect);
  const corners: IPoint[] = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height },
  ];
  return corners.map(corner => rotatePoint(corner, center, rotation));
}
/**
 * Returns the smallest axis-aligned rectangle that contains all points.
 */
export function getBoundingRect(points: IPoint[]): IRect | undefined {
  if (points.length === 0) { return undefined; }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const point of points) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
/**
 * Returns the axis-aligned bounds of the rectangle rotated around its center.
 */
export function getRotatedBounds(rect: IRect, rotation: number): IRect {
  return getBoundingRect(getRotatedCorners(rect, rotation)) as IRect;
}
/**
 * Returns the smallest rectangle that contains all rectangles.
 */
export function unionRects(rects: IRect[]): IRect | undefined {
  return getBoundingRect(rects.flatMap(rect => [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
  ]));
}
/**
 * Returns true when `inner` lies completely inside `outer`. Shared edges count as inside.
 */
export function containsRect(outer: IRect, inner: IRect): boolean {
  return inner.x >= outer.x - EPSILON
    && inner.y >= outer.y - EPSILON
    && inner.x + inner.width <= outer.x + outer.width + EPSILON
    && inner.y + inner.height <= outer.y + outer.height + EPSILON;
}
/**
 * Returns true when the two rectangles overlap with a positive area.
 * Rectangles that only touch at an edge do not intersect.
 */
export function rectsIntersect(a: IRect, b: IRect): boolean {
  return a.x < b.x + b.width - EPSILON
    && b.x < a.x + a.width - EPSILON
    && a.y < b.y + b.height - EPSILON
    && b.y < a.y + a.height - EPSILON;
}
/**
 * Returns true when the rectangle rotated around its center overlaps the
 * axis-aligned `target` with a positive area.
 *
 * Uses the separating axis theorem: two convex polygons do not overlap
 * when their projections on one of the edge normals do not overlap.
 * A zero-size rectangle (e.g. a line with height 0) is treated as a segment.
 * @param rotation Clockwise angle in degrees.
 */
export function rotatedRectIntersectsRect(rect: IRect, rotation: number, target: IRect): boolean {
  if (rotation % 90 === 0) { return rectIntersectsWithSegments(getRotatedBounds(rect, rotation), target); }

  const corners = getRotatedCorners(rect, rotation);
  const targetCorners = getRotatedCorners(target, 0);
  const radian = rotation * Math.PI / 180;
  const axes: IPoint[] = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: Math.cos(radian), y: Math.sin(radian) },
    { x: -Math.sin(radian), y: Math.cos(radian) },
  ];
  return axes.every(axis => projectionsOverlap(corners, targetCorners, axis));
}
/**
 * Moves the rectangle by `dx`, `dy`.
 */
export function offsetRect(rect: IRect, dx: number, dy: number): IRect {
  return { x: rect.x + dx, y: rect.y + dy, width: rect.width, height: rect.height };
}
/**
 * Like `rectsIntersect`, but a zero-width or zero-height rectangle (a segment)
 * intersects when it crosses the inside of `target`.
 */
function rectIntersectsWithSegments(a: IRect, target: IRect): boolean {
  if (a.width > EPSILON && a.height > EPSILON) { return rectsIntersect(a, target); }

  const isInsideX = a.width > EPSILON
    ? a.x < target.x + target.width - EPSILON && target.x < a.x + a.width - EPSILON
    : a.x > target.x + EPSILON && a.x < target.x + target.width - EPSILON;
  const isInsideY = a.height > EPSILON
    ? a.y < target.y + target.height - EPSILON && target.y < a.y + a.height - EPSILON
    : a.y > target.y + EPSILON && a.y < target.y + target.height - EPSILON;
  return isInsideX && isInsideY;
}
/**
 * Returns true when the projections of both polygons on the axis overlap.
 * A degenerate polygon (zero-length projection) must fall strictly inside.
 */
function projectionsOverlap(polygonA: IPoint[], polygonB: IPoint[], axis: IPoint): boolean {
  const a = project(polygonA, axis);
  const b = project(polygonB, axis);
  const isDegenerate = a.max - a.min <= EPSILON;
  if (isDegenerate) { return a.min > b.min + EPSILON && a.min < b.max - EPSILON; }
  return a.min < b.max - EPSILON && b.min < a.max - EPSILON;
}

function project(polygon: IPoint[], axis: IPoint): { min: number, max: number } {
  let min = Infinity, max = -Infinity;
  for (const point of polygon) {
    const value = point.x * axis.x + point.y * axis.y;
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  return { min, max };
}
