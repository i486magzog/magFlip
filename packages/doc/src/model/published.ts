import { IRect, ISize } from '../common/geometry';
import { IPublishedAsset } from './asset';
import { FontStyle, IBookMeta, PageSide, ReadingDirection } from './book';
import { IElement, IWidgetElement } from './element';
import { IFill } from './paint';
import { SurfaceKind } from './surface';

/**
 * `Omit` applied to each member of a union separately.
 */
type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never;

type EditorOnlyField = 'parentId' | 'order' | 'name' | 'isHidden' | 'isLocked';
/**
 * A widget as it is published: with the address of the page it runs in, so
 * that a viewer draws it without knowing the widgets the server offers.
 */
export type PublishedWidget = Omit<IWidgetElement, EditorOnlyField> & {
  /**
   * Address of the widget page. `null` when the server does not offer the
   * widget; absent in books published before widgets got their address.
   */
  url?: string | null;
};
/**
 * An element as it is published: editor-only fields removed and the tree
 * already resolved, so the viewer renders it without any further lookup.
 */
export type PublishedElement = DistributiveOmit<Exclude<IElement, IWidgetElement>, EditorOnlyField> | PublishedWidget;
/**
 * A published element together with its children, ordered back to front.
 */
export type IPublishedNode = PublishedElement & {
  /** True when the element comes from the master surface. */
  isFromMaster: boolean;
  /** Children of a group. Always empty for other elements. */
  children: IPublishedNode[];
};
/**
 * One page of a published book.
 */
export interface IPublishedPage {
  /** Position in the book, starting at 0. */
  index: number;
  surfaceId: string;
  /** Left edge of this page in surface coordinates: 0 or one page width. */
  surfaceX: number;
  side: PageSide;
  /** Printed page number, or `null` when the page shows no number. */
  number: number | null;
}
/**
 * What the viewer needs to know about a surface before loading it.
 */
export interface IPublishedSurfaceRef {
  id: string;
  kind: SurfaceKind;
  /** True when the reader may expand the page beyond its trim. */
  isExpandable: boolean;
}
/**
 * A font face with a URL a reader can fetch.
 */
export interface IPublishedFontFace {
  id: string;
  family: string;
  weight: number;
  style: FontStyle;
  url: string;
}
/**
 * The manifest of a published book. One small file the viewer loads first.
 */
export interface IPublishedBook {
  schemaVersion: number;
  bookId: string;
  /** Publication number, increased on every publish. */
  version: number;
  /** ISO 8601 timestamp. */
  publishedAt: string;
  meta: IBookMeta;
  pageSize: ISize;
  readingDirection: ReadingDirection;
  pageCount: number;
  pages: IPublishedPage[];
  surfaces: Record<string, IPublishedSurfaceRef>;
  fonts: IPublishedFontFace[];
}
/**
 * One published surface. Loaded lazily, one file per surface.
 *
 * Content a reader must not see is already gone from this file: hidden
 * elements, the pasteboard, and - when the extent is not published - everything
 * outside the trim.
 */
export interface IPublishedSurface {
  schemaVersion: number;
  id: string;
  kind: SurfaceKind;
  /** The pages of this surface, always at `0, 0`. */
  trimRect: IRect;
  /** What the reader may see: the trim, or the extent when it is published. */
  visibleRect: IRect;
  /** True when `visibleRect` is larger than `trimRect`. */
  isExpandable: boolean;
  background: IFill | null;
  /** Root elements ordered back to front, master elements first. */
  nodes: IPublishedNode[];
  /** Assets referenced by the nodes, keyed by id. */
  assets: Record<string, IPublishedAsset>;
}
