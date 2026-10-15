import * as Y from 'yjs';
import { SCHEMA_VERSION } from '../common/constants';
import { ISize } from '../common/geometry';
import {
  IBookDoc,
  IBookMeta,
  IFontFace,
  IMasterRef,
  IPageNumbering,
  ISurfaceRef,
  ReadingDirection,
} from '../model/book';
import { createBookDoc } from '../model/defaults';

/**
 * Top-level keys of a book room.
 */
export const BOOK_KEYS = {
  book: 'book',
  meta: 'meta',
  surfaces: 'surfaces',
  masters: 'masters',
  fonts: 'fonts',
} as const;

/**
 * Writes a whole manifest into a Yjs document, replacing what is there.
 *
 * The manifest is the only document every editor of a book keeps open, so it
 * holds no element: page order, masters and fonts only.
 */
export function writeBookDoc(ydoc: Y.Doc, book: IBookDoc): void {
  ydoc.transact(() => {
    const bookMap = ydoc.getMap(BOOK_KEYS.book);
    bookMap.set('schemaVersion', SCHEMA_VERSION);
    bookMap.set('id', book.id);
    bookMap.set('pageSize', book.pageSize);
    bookMap.set('readingDirection', book.readingDirection);
    bookMap.set('pageNumbering', book.pageNumbering);

    // Title and author are edited by hand, so each one is written on its own.
    const meta = getMetaMap(ydoc);
    for (const [key, value] of Object.entries(book.meta)) { meta.set(key, value); }

    const surfaces = getSurfacesMap(ydoc);
    surfaces.clear();
    for (const ref of Object.values(book.surfaces)) { surfaces.set(ref.id, ref); }

    const masters = getMastersMap(ydoc);
    masters.clear();
    for (const ref of Object.values(book.masters)) { masters.set(ref.id, ref); }

    const fonts = getFontsMap(ydoc);
    fonts.clear();
    for (const font of Object.values(book.fonts)) { fonts.set(font.id, font); }
  });
}
/**
 * Reads a manifest back from a Yjs document. Fields the document does not
 * have yet fall back to the defaults of a new book.
 */
export function readBookDoc(ydoc: Y.Doc): IBookDoc {
  const bookMap = ydoc.getMap(BOOK_KEYS.book);
  const defaults = createBookDoc({ id: '' });
  return {
    schemaVersion: Number(bookMap.get('schemaVersion') ?? SCHEMA_VERSION),
    id: String(bookMap.get('id') ?? ''),
    meta: { ...defaults.meta, ...getMetaMap(ydoc).toJSON() } as IBookMeta,
    pageSize: (bookMap.get('pageSize') ?? defaults.pageSize) as ISize,
    readingDirection: (bookMap.get('readingDirection') ?? defaults.readingDirection) as ReadingDirection,
    pageNumbering: (bookMap.get('pageNumbering') ?? defaults.pageNumbering) as IPageNumbering,
    surfaces: getSurfacesMap(ydoc).toJSON() as Record<string, ISurfaceRef>,
    masters: getMastersMap(ydoc).toJSON() as Record<string, IMasterRef>,
    fonts: getFontsMap(ydoc).toJSON() as Record<string, IFontFace>,
  };
}
/**
 * Adds a surface to the reading order, or replaces it.
 *
 * Reordering a page only writes the `order` of that one surface, so two people
 * moving different pages at the same time cannot duplicate or lose a page.
 */
export function writeSurfaceRef(ydoc: Y.Doc, ref: ISurfaceRef): void {
  getSurfacesMap(ydoc).set(ref.id, ref);
}
/**
 * Moves a surface by writing its new order key.
 */
export function moveSurface(ydoc: Y.Doc, id: string, order: string): void {
  const ref = getSurfacesMap(ydoc).get(id);
  if (!ref) { return; }
  getSurfacesMap(ydoc).set(id, { ...ref, order });
}
/**
 * Removes a surface from the reading order. Its room is deleted separately.
 */
export function removeSurfaceRef(ydoc: Y.Doc, id: string): void {
  getSurfacesMap(ydoc).delete(id);
}
/**
 * Adds a master surface, or replaces it.
 */
export function writeMasterRef(ydoc: Y.Doc, ref: IMasterRef): void {
  getMastersMap(ydoc).set(ref.id, ref);
}
/**
 * Removes a master surface from the book.
 */
export function removeMasterRef(ydoc: Y.Doc, id: string): void {
  getMastersMap(ydoc).delete(id);
}
/**
 * Adds a font face, or replaces it.
 */
export function writeFontFace(ydoc: Y.Doc, font: IFontFace): void {
  getFontsMap(ydoc).set(font.id, font);
}
/**
 * Removes a font face from the book.
 */
export function removeFontFace(ydoc: Y.Doc, id: string): void {
  getFontsMap(ydoc).delete(id);
}
/**
 * Returns the map that holds the reading order.
 */
export function getSurfacesMap(ydoc: Y.Doc): Y.Map<ISurfaceRef> {
  return ydoc.getMap<ISurfaceRef>(BOOK_KEYS.surfaces);
}
/**
 * Returns the map that holds the master surfaces.
 */
export function getMastersMap(ydoc: Y.Doc): Y.Map<IMasterRef> {
  return ydoc.getMap<IMasterRef>(BOOK_KEYS.masters);
}
/**
 * Returns the map that holds the font faces.
 */
export function getFontsMap(ydoc: Y.Doc): Y.Map<IFontFace> {
  return ydoc.getMap<IFontFace>(BOOK_KEYS.fonts);
}
/**
 * Returns the map that holds title, author, description and language.
 */
export function getMetaMap(ydoc: Y.Doc): Y.Map<string> {
  return ydoc.getMap<string>(BOOK_KEYS.meta);
}
