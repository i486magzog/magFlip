import { beforeEach, describe, expect, it } from 'vitest';
import {
  createElement,
  ElementType,
  IPublishedSurface,
  LinkKind,
  ListKind,
  MediaFit,
  ShapeKind,
  SurfaceKind,
  TextAlign,
  TextBlockType,
} from '@magflip/doc';
import { createSurfaceLayer, ELEMENT_ID_ATTRIBUTE } from '../src/surfaceLayer';
import { IMAGE_ASSET, makeImage, PAGE_SIZE, publishSurfaces } from './helpers';

const { Single, Spread } = SurfaceKind;

function findElement(layer: HTMLElement, id: string): HTMLElement {
  const element = layer.querySelector(`[${ELEMENT_ID_ATTRIBUTE}="${id}"]`);
  if (!element) { throw new Error(`Element "${id}" was not rendered.`); }
  return element as HTMLElement;
}

function layerOf(surfaces: Record<string, IPublishedSurface>, id = 's0'): HTMLElement {
  const surface = surfaces[id];
  if (!surface) { throw new Error(`Surface "${id}" was not published.`); }
  return createSurfaceLayer(surface);
}

describe('createSurfaceLayer', () => {
  beforeEach(() => { document.body.replaceChildren(); });

  it('makes the layer as large as the visible rect', () => {
    const layer = layerOf(publishSurfaces([{ kind: Spread }]));

    expect(layer.style.width).toBe(`${PAGE_SIZE.width * 2}px`);
    expect(layer.style.height).toBe(`${PAGE_SIZE.height}px`);
  });

  it('draws an image at its surface coordinates with the published URL', () => {
    const layer = layerOf(publishSurfaces([{ kind: Spread, elements: [makeImage('photo', 100, 400)] }]));
    const box = findElement(layer, 'photo');
    const image = box.querySelector('img') as HTMLImageElement;

    expect(box.style.left).toBe('100px');
    expect(box.style.width).toBe('400px');
    expect(image.src).toBe(`https://cdn.test/${IMAGE_ASSET.id}.webp`);
  });

  it('keeps one image across both pages of a spread', () => {
    const layer = layerOf(publishSurfaces([{ kind: Spread, elements: [makeImage('panorama', 0, PAGE_SIZE.width * 2)] }]));

    expect(findElement(layer, 'panorama').style.width).toBe(`${PAGE_SIZE.width * 2}px`);
  });

  it('moves the coordinates when the layer starts left of the pages', () => {
    // An expandable surface whose extent reaches 200px to the left of the pages.
    const extent = {
      rect: { x: -200, y: 0, width: PAGE_SIZE.width + 200, height: PAGE_SIZE.height },
      isViewerVisible: true,
    };
    const surfaces = publishSurfaces([{ kind: Single, elements: [makeImage('onPage', 0, 100)], doc: { extent } }]);
    const layer = layerOf(surfaces);

    expect(layer.style.width).toBe(`${PAGE_SIZE.width + 200}px`);
    // The element sits at x 0 of the surface, which is 200px inside the layer.
    expect(findElement(layer, 'onPage').style.left).toBe('200px');
  });

  it('applies rotation and opacity', () => {
    const image = makeImage('tilted', 10, 100, { rotation: 30, opacity: 0.4 });
    const box = findElement(layerOf(publishSurfaces([{ kind: Single, elements: [image] }])), 'tilted');

    expect(box.style.transform).toBe('rotate(30deg)');
    expect(box.style.opacity).toBe('0.4');
  });

  it('writes text as text, never as markup', () => {
    const text = createElement(ElementType.Text, {
      id: 'title',
      x: 10, y: 10, width: 300, height: 80, order: 'a0',
      content: {
        blocks: [{
          type: TextBlockType.Paragraph,
          align: TextAlign.Center,
          inlines: [{ text: '<img src=x onerror="alert(1)">', marks: { fontWeight: 700 } }],
        }],
      },
    });
    const box = findElement(layerOf(publishSurfaces([{ kind: Single, elements: [text] }])), 'title');

    expect(box.querySelector('img')).toBeNull();
    expect(box.textContent).toBe('<img src=x onerror="alert(1)">');
    expect((box.querySelector('span') as HTMLElement).style.fontWeight).toBe('700');
    expect((box.querySelector('p') as HTMLElement).style.textAlign).toBe('center');
  });

  it('shows the cropped part of an image filling its box', () => {
    // `fill` stretches the region, which keeps the arithmetic visible here.
    const image = makeImage('cropped', 0, 200, { fit: MediaFit.Fill, crop: { x: 0.25, y: 0.5, width: 0.5, height: 0.25 } });
    const img = findElement(layerOf(publishSurfaces([{ kind: Single, elements: [image] }])), 'cropped').querySelector('img') as HTMLImageElement;
    const { width, height } = image as { width: number, height: number };

    // The region is `crop` of the source, stretched over the whole box.
    expect(parseFloat(img.style.width)).toBeCloseTo(width / 0.5);
    expect(parseFloat(img.style.height)).toBeCloseTo(height / 0.25);
    expect(parseFloat(img.style.left)).toBeCloseTo(-0.25 * width / 0.5);
    expect(parseFloat(img.style.top)).toBeCloseTo(-0.5 * height / 0.25);
  });

  it('marks list items and numbers them the way the document model does', () => {
    const item = (text: string, list?: { kind: ListKind, level: number }) => ({
      type: TextBlockType.Paragraph as const,
      align: TextAlign.Start,
      ...(list ? { list } : {}),
      inlines: [{ text }],
    });
    const text = createElement(ElementType.Text, {
      id: 'todo',
      x: 0, y: 0, width: 300, height: 200, order: 'a0',
      content: {
        blocks: [
          item('Shopping'),
          item('milk', { kind: ListKind.Ordered, level: 0 }),
          item('whole', { kind: ListKind.Ordered, level: 1 }),
          item('eggs', { kind: ListKind.Ordered, level: 0 }),
        ],
      },
    });
    const paragraphs = [...findElement(layerOf(publishSurfaces([{ kind: Single, elements: [text] }])), 'todo').querySelectorAll('p')];

    expect(paragraphs.map(paragraph => paragraph.dataset['mfMarker'])).toEqual([undefined, '1.', 'a.', '2.']);
    expect(paragraphs[0]?.classList.contains('mf-text-li')).toBe(false);
    expect(paragraphs[2]?.classList.contains('mf-text-li')).toBe(true);
    expect(paragraphs[2]?.style.getPropertyValue('--mf-list-level')).toBe('1');
    // The marker is not text: a reader copying the item gets the item only.
    expect(paragraphs[1]?.textContent).toBe('milk');
  });

  it('draws a shape as an SVG of the size of its box', () => {
    const shape = createElement(ElementType.Shape, {
      id: 'divider', x: 0, y: 0, width: 200, height: 4, order: 'a0', shape: ShapeKind.Line,
    });
    const svg = findElement(layerOf(publishSurfaces([{ kind: Single, elements: [shape] }])), 'divider').querySelector('svg');

    expect(svg?.getAttribute('viewBox')).toBe('0 0 200 4');
    expect(svg?.querySelector('line')?.getAttribute('x2')).toBe('200');
  });

  it('follows a safe link and drops an unsafe one', () => {
    const safe = makeImage('safe', 0, 100, {
      link: { kind: LinkKind.Url, href: 'https://magzog.com', isNewTab: true },
    });
    const layer = layerOf(publishSurfaces([{ kind: Single, elements: [safe] }]));
    const anchor = findElement(layer, 'safe') as HTMLAnchorElement;

    expect(anchor.tagName).toBe('A');
    expect(anchor.href).toBe('https://magzog.com/');
    expect(anchor.rel).toBe('noopener noreferrer');
    // The box moves into the anchor, which takes its place in the layer.
    expect(anchor.style.left).toBe('0px');
    expect((anchor.firstElementChild as HTMLElement).style.width).toBe('100%');
  });

  it('calls back to the book instead of navigating on a page link', () => {
    const link = { kind: LinkKind.Page as const, surfaceId: 's0', surfaceX: 0 };
    const surfaces = publishSurfaces([{ kind: Single, elements: [makeImage('toCover', 0, 100, { link })] }]);
    const followed: string[] = [];
    const surface = surfaces['s0'] as IPublishedSurface;
    const layer = createSurfaceLayer(surface, { onPageLink: target => followed.push(target.surfaceId) });

    document.body.appendChild(layer);
    findElement(layer, 'toCover').click();

    expect(followed).toEqual(['s0']);
  });

  it('draws the master layer below the page and marks it', () => {
    const master = { id: 'm', kind: Single, elements: [makeImage('watermark', 0, 100)] };
    const surfaces = publishSurfaces(
      [{ kind: Single, elements: [makeImage('own', 200, 100)], doc: { masterId: 'm' } }],
      [master],
    );
    const layer = layerOf(surfaces);
    const ids = [...layer.children].map(child => child.getAttribute(ELEMENT_ID_ATTRIBUTE));

    expect(ids).toEqual(['master:watermark', 'own']);
    expect(findElement(layer, 'master:watermark').getAttribute('data-mf-master')).toBe('true');
  });

  it('nests the children of a group', () => {
    const group = createElement(ElementType.Group, { id: 'g', order: 'a0' });
    const child = makeImage('inside', 40, 80, { parentId: 'g', order: 'a1' });
    const layer = layerOf(publishSurfaces([{ kind: Single, elements: [group, child] }]));

    expect(findElement(layer, 'g').contains(findElement(layer, 'inside'))).toBe(true);
    // The child keeps surface coordinates, because a group is not a coordinate system.
    expect(findElement(layer, 'inside').style.left).toBe('40px');
  });
});
