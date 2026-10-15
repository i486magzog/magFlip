import { createOrdersBetween } from '../src/common/order';
import { IBookBundle, IBookDoc, IMasterRef, ISurfaceRef } from '../src/model/book';
import { createBookDoc, createElement, createSurfaceDoc, DEFAULT_PAGE_SIZE } from '../src/model/defaults';
import { ElementType, IElement } from '../src/model/element';
import { ISurfaceDoc, SurfaceKind } from '../src/model/surface';

/**
 * Page size used by the tests, the same as the default one.
 */
export const PAGE_SIZE = DEFAULT_PAGE_SIZE;

/**
 * Builds a book whose surfaces follow the given kinds, in order.
 * Ids are `s0`, `s1` … so that tests can name them.
 */
export function makeBook(kinds: SurfaceKind[], init: Partial<IBookDoc> = {}): IBookDoc {
  const orders = createOrdersBetween(null, null, Math.max(kinds.length, 1));
  const surfaces: Record<string, ISurfaceRef> = {};
  kinds.forEach((kind, index) => {
    const id = `s${index}`;
    surfaces[id] = { id, kind, order: orders[index] as string, name: '' };
  });
  return createBookDoc({ id: 'book', surfaces, ...init });
}
/**
 * Builds a bundle from a book and the surfaces it lists.
 */
export function makeBundle(book: IBookDoc, surfaces: ISurfaceDoc[]): IBookBundle {
  return {
    book,
    surfaces: Object.fromEntries(surfaces.map(surface => [surface.id, surface])),
  };
}
/**
 * Builds a surface holding the given elements.
 */
export function makeSurface(id: string, elements: IElement[] = [], init: Partial<ISurfaceDoc> = {}): ISurfaceDoc {
  return createSurfaceDoc({
    id,
    elements: Object.fromEntries(elements.map(element => [element.id, element])),
    ...init,
  });
}
/**
 * Builds a master ref plus its (empty) surface document.
 */
export function makeMaster(id: string, kind: SurfaceKind, elements: IElement[] = []): { ref: IMasterRef, doc: ISurfaceDoc } {
  return { ref: { id, kind, name: id }, doc: makeSurface(id, elements) };
}
/**
 * Builds a rectangle shape at a known place, with a fixed order key so that
 * the z-order of a test is readable.
 */
export function makeShape(id: string, x: number, y: number, width = 100, height = 100, init: Partial<IElement> = {}): IElement {
  return createElement(ElementType.Shape, { id, x, y, width, height, order: 'a0', ...init } as never);
}
