import { FillKind, IFill, IRect, IStroke } from '@magflip/doc';

/**
 * Prefix of every class name this package creates.
 */
export const CLASS_PREFIX = 'mf';

/**
 * Returns a CSS length in px.
 */
export function px(value: number): string {
  return `${round(value)}px`;
}
/**
 * Rounds to 3 decimals, which is below one device pixel at any zoom we support
 * and keeps the inline styles short.
 */
export function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
/**
 * Places an element at a rect of the layer coordinate system.
 */
export function applyRect(element: HTMLElement, rect: IRect): void {
  element.style.left = px(rect.x);
  element.style.top = px(rect.y);
  element.style.width = px(rect.width);
  element.style.height = px(rect.height);
}
/**
 * Applies rotation and mirroring around the center of the element.
 */
export function applyTransform(element: HTMLElement, rotation: number, isFlippedX: boolean, isFlippedY: boolean): void {
  const transforms: string[] = [];
  if (rotation % 360 !== 0) { transforms.push(`rotate(${round(rotation)}deg)`); }
  if (isFlippedX || isFlippedY) { transforms.push(`scale(${isFlippedX ? -1 : 1}, ${isFlippedY ? -1 : 1})`); }
  if (transforms.length > 0) { element.style.transform = transforms.join(' '); }
}
/**
 * Returns a fill as a CSS value for `background`, or `undefined` for no fill.
 */
export function toCssFill(fill: IFill | null): string | undefined {
  if (!fill) { return undefined; }
  if (fill.kind === FillKind.Solid) { return fill.color; }

  const stops = fill.stops
    .map(stop => `${stop.color} ${round(stop.offset * 100)}%`)
    .join(', ');
  return `linear-gradient(${round(fill.angle)}deg, ${stops})`;
}
/**
 * Returns the direction of a gradient as an SVG vector on the unit box.
 * The angle follows CSS: 0 runs to the top, 90 to the right.
 */
export function toGradientVector(angle: number): { x1: number, y1: number, x2: number, y2: number } {
  const radian = angle * Math.PI / 180;
  const dx = Math.sin(radian) / 2;
  // The y axis points down in SVG, so "to the top" is a negative dy.
  const dy = -Math.cos(radian) / 2;
  return { x1: 0.5 - dx, y1: 0.5 - dy, x2: 0.5 + dx, y2: 0.5 + dy };
}
/**
 * Applies a stroke to an SVG shape.
 */
export function applyStroke(shape: SVGElement, stroke: IStroke | null): void {
  if (!stroke || stroke.width <= 0) {
    shape.setAttribute('stroke', 'none');
    return;
  }
  shape.setAttribute('stroke', stroke.color);
  shape.setAttribute('stroke-width', String(round(stroke.width)));
  if (stroke.dash.length > 0) { shape.setAttribute('stroke-dasharray', stroke.dash.map(round).join(' ')); }
}
/**
 * Creates a div with the class names prefixed for this package.
 */
export function createDiv(...classNames: string[]): HTMLDivElement {
  const element = document.createElement('div');
  element.className = classNames.map(name => `${CLASS_PREFIX}-${name}`).join(' ');
  return element;
}
