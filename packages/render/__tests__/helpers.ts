import {
  AssetKind,
  createBookDoc,
  createElement,
  createOrdersBetween,
  createSurfaceDoc,
  DEFAULT_PAGE_SIZE,
  ElementType,
  IAsset,
  IBookBundle,
  IElement,
  IPublishedBook,
  IPublishedSurface,
  ISurfaceDoc,
  ISurfaceRef,
  SurfaceKind,
} from '@magflip/doc';
import { publishBookBundle } from '@magflip/doc/authoring';

/**
 * Page size used by the tests.
 */
export const PAGE_SIZE = DEFAULT_PAGE_SIZE;
/**
 * The one image asset the tests reference.
 */
export const IMAGE_ASSET: IAsset = {
  id: 'a1',
  kind: AssetKind.Image,
  mimeType: 'image/webp',
  byteSize: 2048,
  width: 1200,
  height: 900,
};

/**
 * Publishes a book whose surfaces follow the given kinds, so that the renderer
 * is always tested on the output of the real publishing pipeline.
 */
export function publishSurfaces(
  surfaces: { kind: SurfaceKind, elements?: IElement[], doc?: Partial<ISurfaceDoc> }[],
  masters: { id: string, kind: SurfaceKind, elements: IElement[] }[] = [],
): Record<string, IPublishedSurface> {
  return publishTestBook(surfaces, masters).surfaces;
}
/**
 * Publishes a book and keeps the manifest, which a `PublishedBookSource` needs.
 */
export function publishTestBook(
  surfaces: { kind: SurfaceKind, elements?: IElement[], doc?: Partial<ISurfaceDoc> }[],
  masters: { id: string, kind: SurfaceKind, elements: IElement[] }[] = [],
): { book: IPublishedBook, surfaces: Record<string, IPublishedSurface> } {
  const orders = createOrdersBetween(null, null, Math.max(surfaces.length, 1));
  const refs: Record<string, ISurfaceRef> = {};
  const docs: ISurfaceDoc[] = [];

  surfaces.forEach((surface, index) => {
    const id = `s${index}`;
    refs[id] = { id, kind: surface.kind, order: orders[index] as string, name: '' };
    docs.push(createSurfaceDoc({
      id,
      elements: Object.fromEntries((surface.elements ?? []).map(element => [element.id, element])),
      ...surface.doc,
    }));
  });

  const book = createBookDoc({
    id: 'book',
    surfaces: refs,
    masters: Object.fromEntries(masters.map(master => [master.id, { id: master.id, kind: master.kind, name: master.id }])),
  });
  for (const master of masters) {
    docs.push(createSurfaceDoc({
      id: master.id,
      elements: Object.fromEntries(master.elements.map(element => [element.id, element])),
    }));
  }

  const bundle: IBookBundle = { book, surfaces: Object.fromEntries(docs.map(doc => [doc.id, doc])) };
  const result = publishBookBundle(bundle, {
    assets: { a1: IMAGE_ASSET },
    resolveAssetUrl: asset => `https://cdn.test/${asset.id}.webp`,
    resolveFontUrl: () => 'https://cdn.test/font.woff2',
    version: 1,
    publishedAt: '2026-01-01T00:00:00.000Z',
  });
  if (!result.book) { throw new Error('The test book was not published.'); }
  return { book: result.book, surfaces: result.surfaces };
}
/**
 * An image element with a fixed order key, so the z-order of a test is readable.
 */
export function makeImage(id: string, x: number, width: number, init: Record<string, unknown> = {}): IElement {
  return createElement(ElementType.Image, {
    id, assetId: 'a1', x, y: 0, width, height: 300, order: 'a0', ...init,
  } as never);
}
/**
 * Gives an element a size, which happy-dom does not compute on its own.
 */
export function setClientSize(element: HTMLElement, width: number, height: number): void {
  Object.defineProperty(element, 'clientWidth', { value: width, configurable: true });
  Object.defineProperty(element, 'clientHeight', { value: height, configurable: true });
}
