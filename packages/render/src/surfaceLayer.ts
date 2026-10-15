import { ElementType, IPublishedNode, IPublishedSurface, IRect } from '@magflip/doc';
import { IRenderOptions } from './common/renderOptions';
import { applyRect, applyTransform, createDiv, px, round, toCssFill } from './common/style';
import { createImageNode } from './nodes/imageNode';
import { createLink } from './nodes/link';
import { createAudioNode, createVideoNode } from './nodes/mediaNode';
import { createShapeNode } from './nodes/shapeNode';
import { createTextNode } from './nodes/textNode';
import { createWidgetNode } from './nodes/widgetNode';

/**
 * Attribute that carries the element id, so the editor can find the DOM of an
 * element and the tests can look one up.
 */
export const ELEMENT_ID_ATTRIBUTE = 'data-mf-id';

/**
 * Every published node except a group, that is, every node with a box.
 */
type PublishedBoxNode = Extract<IPublishedNode, { x: number }>;

/**
 * Draws a whole surface into one element.
 *
 * The layer is exactly `visibleRect` large and its own coordinates start at the
 * top-left of that rect, so `PageRenderer` only has to move and scale it.
 * Elements keep their surface coordinates minus that offset.
 */
export function createSurfaceLayer(surface: IPublishedSurface, options: IRenderOptions = {}): HTMLElement {
  const layer = createDiv('surface');
  const { visibleRect } = surface;
  layer.style.width = px(visibleRect.width);
  layer.style.height = px(visibleRect.height);

  const background = toCssFill(surface.background);
  if (background) { layer.style.background = background; }

  for (const node of surface.nodes) { layer.appendChild(createNode(node, surface, visibleRect, options)); }
  return layer;
}

function createNode(node: IPublishedNode, surface: IPublishedSurface, origin: IRect, options: IRenderOptions): HTMLElement {
  const element = node.type === ElementType.Group
    ? createGroupNode(node, surface, origin, options)
    : createBoxNode(node as PublishedBoxNode, surface, origin, options);

  element.setAttribute(ELEMENT_ID_ATTRIBUTE, node.id);
  if (node.isFromMaster) { element.setAttribute('data-mf-master', 'true'); }
  if (node.opacity !== 1) { element.style.opacity = String(round(node.opacity)); }
  options.onNodeRendered?.(node, element);
  return element;
}
/**
 * A group has no box of its own: it sits at the origin of the layer so that its
 * children keep using surface coordinates, and only carries opacity and links.
 */
function createGroupNode(node: IPublishedNode, surface: IPublishedSurface, origin: IRect, options: IRenderOptions): HTMLElement {
  const group = createDiv('el', 'el-group');
  for (const child of node.children) { group.appendChild(createNode(child, surface, origin, options)); }
  return wrapWithLink(group, node, options);
}

function createBoxNode(node: PublishedBoxNode, surface: IPublishedSurface, origin: IRect, options: IRenderOptions): HTMLElement {
  const element = createContent(node, surface, options);
  applyRect(element, {
    x: node.x - origin.x,
    y: node.y - origin.y,
    width: node.width,
    height: node.height,
  });
  applyTransform(element, node.rotation, node.isFlippedX, node.isFlippedY);
  return wrapWithLink(element, node, options);
}

function createContent(node: IPublishedNode, surface: IPublishedSurface, options: IRenderOptions): HTMLElement {
  switch (node.type) {
    case ElementType.Image:
      return createImageNode(node, surface.assets[node.assetId]);
    case ElementType.Text:
      return createTextNode(node, options);
    case ElementType.Shape:
      return createShapeNode(node);
    case ElementType.Video:
      return createVideoNode(node, surface.assets, options);
    case ElementType.Audio:
      return createAudioNode(node, surface.assets, options);
    case ElementType.Widget:
      return createWidgetNode(node, options);
    default:
      return createDiv('el');
  }
}
/**
 * Wraps an element in its link. The anchor takes the place of the element in
 * the layer, so the whole box becomes clickable.
 */
function wrapWithLink(element: HTMLElement, node: IPublishedNode, options: IRenderOptions): HTMLElement {
  if (!node.link) { return element; }

  const anchor = createLink(node.link, options);
  anchor.style.position = 'absolute';
  anchor.style.left = element.style.left;
  anchor.style.top = element.style.top;
  anchor.style.width = element.style.width;
  anchor.style.height = element.style.height;
  anchor.style.transform = element.style.transform;

  element.style.left = '0';
  element.style.top = '0';
  element.style.width = '100%';
  element.style.height = '100%';
  element.style.transform = '';
  anchor.appendChild(element);
  return anchor;
}
