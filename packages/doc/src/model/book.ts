import { ISize } from '../common/geometry';
import { ISurfaceDoc, SurfaceKind } from './surface';

/**
 * The side a page is shown on when the book is open.
 */
export enum PageSide {
  Left = 'left',
  Right = 'right',
}
/**
 * The order pages are read in. It decides which side a page index falls on.
 */
export enum ReadingDirection {
  /** Latin, Korean: page 0 (the cover) is on the right. */
  LeftToRight = 'ltr',
  /** Arabic, Japanese manga: page 0 is on the left. */
  RightToLeft = 'rtl',
}
/**
 * Font style of a font face.
 */
export enum FontStyle {
  Normal = 'normal',
  Italic = 'italic',
}
/**
 * Descriptive data of a book.
 */
export interface IBookMeta {
  title: string;
  author: string;
  description: string;
  /** BCP 47 language tag, e.g. `ko`, `en-US`. */
  language: string;
}
/**
 * Where printed page numbers start.
 *
 * Pages before `firstNumberedPageIndex` (covers, front matter) show no number.
 */
export interface IPageNumbering {
  firstNumberedPageIndex: number;
  firstNumber: number;
}
/**
 * One weight and style of a font family used by the book.
 */
export interface IFontFace {
  id: string;
  family: string;
  /** CSS font weight, 100 - 900. */
  weight: number;
  style: FontStyle;
  assetId: string;
}
/**
 * A surface in the reading order of the book.
 */
export interface ISurfaceRef {
  id: string;
  /** Single page or two facing pages. Only stored here. */
  kind: SurfaceKind;
  /** Fractional index that orders the surfaces of the book. */
  order: string;
  /** Name shown in the editor. Empty means "use the page number". */
  name: string;
}
/**
 * A master surface. Masters are not part of the reading order.
 */
export interface IMasterRef {
  id: string;
  kind: SurfaceKind;
  name: string;
}
/**
 * The manifest of a book: everything except the content of the surfaces.
 * Small enough to stay loaded while a book with thousands of pages is edited.
 */
export interface IBookDoc {
  schemaVersion: number;
  id: string;
  meta: IBookMeta;
  /** Size of one page. Every page of a book has the same size. */
  pageSize: ISize;
  readingDirection: ReadingDirection;
  pageNumbering: IPageNumbering;
  /** Content surfaces keyed by id. The key is always equal to `ref.id`. */
  surfaces: Record<string, ISurfaceRef>;
  /** Master surfaces keyed by id. */
  masters: Record<string, IMasterRef>;
  /** Font faces keyed by id. */
  fonts: Record<string, IFontFace>;
}
/**
 * A whole book in one JSON value: the manifest plus every surface,
 * masters included. Used for import, export and tests, not for editing.
 */
export interface IBookBundle {
  book: IBookDoc;
  surfaces: Record<string, ISurfaceDoc>;
}
