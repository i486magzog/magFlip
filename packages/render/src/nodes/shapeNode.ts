import { ElementType, FillKind, IFill, ShapeKind } from '@magflip/doc';
import { applyStroke, createDiv, round, toGradientVector } from '../common/style';
import { PublishedElementOf } from '../common/types';

type PublishedShape = PublishedElementOf<ElementType.Shape>;

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
let gradientCount = 0;

/**
 * Draws a shape as an SVG scaled to the box of the element.
 */
export function createShapeNode(element: PublishedShape): HTMLElement {
  const box = createDiv('el', 'el-shape');
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  svg.setAttribute('viewBox', `0 0 ${round(element.width)} ${round(element.height)}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');

  const shape = createShape(element);
  applyFill(shape, element.fill, svg);
  applyStroke(shape, element.stroke);
  svg.appendChild(shape);
  box.appendChild(svg);
  return box;
}

function createShape(element: PublishedShape): SVGElement {
  const { width, height } = element;
  switch (element.shape) {
    case ShapeKind.Ellipse: {
      const ellipse = document.createElementNS(SVG_NAMESPACE, 'ellipse');
      ellipse.setAttribute('cx', String(round(width / 2)));
      ellipse.setAttribute('cy', String(round(height / 2)));
      ellipse.setAttribute('rx', String(round(width / 2)));
      ellipse.setAttribute('ry', String(round(height / 2)));
      return ellipse;
    }
    case ShapeKind.Line: {
      const line = document.createElementNS(SVG_NAMESPACE, 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', String(round(height / 2)));
      line.setAttribute('x2', String(round(width)));
      line.setAttribute('y2', String(round(height / 2)));
      return line;
    }
    case ShapeKind.Path: {
      const path = document.createElementNS(SVG_NAMESPACE, 'path');
      path.setAttribute('d', element.path ?? '');
      return path;
    }
    default: {
      const rect = document.createElementNS(SVG_NAMESPACE, 'rect');
      rect.setAttribute('width', String(round(width)));
      rect.setAttribute('height', String(round(height)));
      if (element.cornerRadius > 0) {
        const radius = Math.min(element.cornerRadius, width / 2, height / 2);
        rect.setAttribute('rx', String(round(radius)));
        rect.setAttribute('ry', String(round(radius)));
      }
      return rect;
    }
  }
}
/**
 * A gradient needs a definition of its own inside the SVG, so it is created
 * with a unique id and referenced from the shape.
 */
function applyFill(shape: SVGElement, fill: IFill | null, svg: SVGElement): void {
  if (!fill) {
    shape.setAttribute('fill', 'none');
    return;
  }
  if (fill.kind === FillKind.Solid) {
    shape.setAttribute('fill', fill.color);
    return;
  }

  const id = `mf-gradient-${++gradientCount}`;
  const gradient = document.createElementNS(SVG_NAMESPACE, 'linearGradient');
  gradient.setAttribute('id', id);
  const vector = toGradientVector(fill.angle);
  gradient.setAttribute('x1', String(round(vector.x1)));
  gradient.setAttribute('y1', String(round(vector.y1)));
  gradient.setAttribute('x2', String(round(vector.x2)));
  gradient.setAttribute('y2', String(round(vector.y2)));

  for (const stop of fill.stops) {
    const stopEl = document.createElementNS(SVG_NAMESPACE, 'stop');
    stopEl.setAttribute('offset', `${round(stop.offset * 100)}%`);
    stopEl.setAttribute('stop-color', stop.color);
    gradient.appendChild(stopEl);
  }

  const defs = document.createElementNS(SVG_NAMESPACE, 'defs');
  defs.appendChild(gradient);
  svg.appendChild(defs);
  shape.setAttribute('fill', `url(#${id})`);
}
