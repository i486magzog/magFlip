import { ISize, Point } from '@magflip/core';
/**
 * Below this length (px) two points are taken as one, and the line through them as no line.
 */
const SAME_POINT_DISTANCE = 0.01;
/**
 * Which side of the line from `a` to `b` a point is on: positive on one side,
 * negative on the other, 0 on the line.
 */
function getSide(a:Point, b:Point, point:Point):number {
  return (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x);
}
/**
 * The part of a convex polygon on one side of a line (Sutherland–Hodgman, for one edge).
 * @param polygon The corners of the polygon, in order.
 * @param a A point on the line.
 * @param b Another point on the line.
 * @param inside A point on the side to keep.
 * @returns The corners of what is left; empty when nothing is.
 */
export function clipPolygonToSide(polygon:Point[], a:Point, b:Point, inside:Point):Point[] {
  const sign = Math.sign(getSide(a, b, inside));
  const isKept = (point:Point) => Math.sign(getSide(a, b, point)) * sign >= 0;
  const clipped:Point[] = [];

  polygon.forEach((current, index) => {
    const previous = polygon[(index + polygon.length - 1) % polygon.length];
    const isCurrentKept = isKept(current);
    if(isCurrentKept !== isKept(previous)){
      // Where the edge from the previous corner to this one crosses the line.
      const sidePrevious = getSide(a, b, previous);
      const sideCurrent = getSide(a, b, current);
      const t = sidePrevious / (sidePrevious - sideCurrent);
      clipped.push({ x: previous.x + (current.x - previous.x) * t, y: previous.y + (current.y - previous.y) * t });
    }
    if(isCurrentKept){ clipped.push(current); }
  });
  return clipped;
}
/**
 * The area, in a page's own coordinates, where the tabs of a page may show while the page folds:
 * the page and a margin around it for the tabs that stick out, cut along the fold line.
 * @param foldA A point on the fold line.
 * @param foldB Another point on the fold line.
 * @param reference A point that is not on the fold line.
 * @param isReferenceSideKept True to keep the side of the fold line `reference` is on, false the other.
 * @param pageSize The size of the page.
 * @param margin How far around the page the tabs may reach.
 * @returns The corners of the area, `undefined` for no cut (the whole page and margin),
 *   or an empty list for nothing.
 */
export function getFoldClip(
  foldA:Point,
  foldB:Point,
  reference:Point,
  isReferenceSideKept:boolean,
  pageSize:ISize,
  margin:number
):Point[] | undefined {
  const isNoLine = Math.hypot(foldB.x - foldA.x, foldB.y - foldA.y) < SAME_POINT_DISTANCE;
  const isReferenceOnLine = Math.abs(getSide(foldA, foldB, reference)) < SAME_POINT_DISTANCE;
  // No fold yet: all of the page is where it was, and none of it has come over.
  if(isNoLine || isReferenceOnLine){ return isReferenceSideKept ? [] : undefined; }

  const area:Point[] = [
    { x: -margin, y: -margin },
    { x: pageSize.width + margin, y: -margin },
    { x: pageSize.width + margin, y: pageSize.height + margin },
    { x: -margin, y: pageSize.height + margin },
  ];
  // A point on the side to keep: the reference itself, or its mirror across the line.
  const inside = isReferenceSideKept ? reference : mirrorAcross(foldA, foldB, reference);
  return clipPolygonToSide(area, foldA, foldB, inside);
}
/**
 * The mirror image of a point across the line from `a` to `b`.
 */
function mirrorAcross(a:Point, b:Point, point:Point):Point {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const t = ((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy);
  const foot = { x: a.x + dx * t, y: a.y + dy * t };
  return { x: 2 * foot.x - point.x, y: 2 * foot.y - point.y };
}
/**
 * Writes the corners of an area as a CSS `clip-path` value.
 * @param area The corners from `getFoldClip`.
 */
export function toClipPath(area:Point[] | undefined):string {
  if(area === undefined){ return ''; }
  if(area.length === 0){ return 'polygon(0 0, 0 0, 0 0)'; }
  return `polygon(${area.map(point => `${point.x}px ${point.y}px`).join(', ')})`;
}
