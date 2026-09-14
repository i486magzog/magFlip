import { IRect, ISize } from '../common/geometry';
import { JsonValue } from '../common/json';
import { IElement } from './element';
import { IFill } from './paint';

/**
 * How many pages a surface holds.
 *
 * A surface is the unit that elements live on and the unit of one
 * collaboration room. A `Spread` surface is one canvas covering two facing
 * pages, so a single image can cross the gutter.
 */
export enum SurfaceKind {
  /** One page. */
  Single = 'single',
  /** Two facing pages, left page first in surface coordinates. */
  Spread = 'spread',
}
/**
 * The area a surface is designed on when it is wider or taller than its pages.
 *
 * The rect is in surface coordinates and must contain the trim (the pages).
 * Content outside the extent is the pasteboard: it stays in the editor and is
 * never published.
 */
export interface ISurfaceExtent {
  rect: IRect;
  /** When false, readers cannot expand the page and the extra content is stripped at publish time. */
  isViewerVisible: boolean;
}
/**
 * A patch applied to one element of the master surface.
 *
 * Keys are element fields; `id`, `type`, `parentId` and `order` cannot be
 * overridden. Fields that are not overridden keep following the master.
 */
export type IMasterOverride = Record<string, JsonValue>;
/**
 * The content of one surface. Lives in its own collaboration room and is
 * loaded only when a page of it is shown.
 */
export interface ISurfaceDoc {
  /** Same value as the key in `IBookBundle.surfaces` and as the id of the ref. */
  id: string;
  /** Painted under all elements, across the whole extent. */
  background: IFill | null;
  /** `null` when the surface is exactly as large as its pages. */
  extent: ISurfaceExtent | null;
  /** Master surface applied under the elements, or `null`. */
  masterId: string | null;
  /** Patches for elements of the master, keyed by master element id. */
  masterOverrides: Record<string, IMasterOverride>;
  /** Elements keyed by id. The key is always equal to `element.id`. */
  elements: Record<string, IElement>;
}

/**
 * Returns the number of pages of a surface.
 */
export function getSurfacePageCount(kind: SurfaceKind): number {
  return kind === SurfaceKind.Spread ? 2 : 1;
}
/**
 * Returns the size of a surface, that is, the area covered by its pages.
 */
export function getSurfaceSize(kind: SurfaceKind, pageSize: ISize): ISize {
  return { width: pageSize.width * getSurfacePageCount(kind), height: pageSize.height };
}
/**
 * Returns the trim of a surface: the rect readers always see.
 */
export function getSurfaceTrimRect(kind: SurfaceKind, pageSize: ISize): IRect {
  return { x: 0, y: 0, ...getSurfaceSize(kind, pageSize) };
}
/**
 * Returns the trim of one page of a surface.
 * @param surfaceX Left edge of the page in surface coordinates, 0 or one page width.
 */
export function getPageTrimRect(surfaceX: number, pageSize: ISize): IRect {
  return { x: surfaceX, y: 0, width: pageSize.width, height: pageSize.height };
}
/**
 * Returns the rect a reader can see: the extent when it is published,
 * the trim otherwise.
 */
export function getVisibleRect(surface: ISurfaceDoc, kind: SurfaceKind, pageSize: ISize): IRect {
  const trimRect = getSurfaceTrimRect(kind, pageSize);
  if (!surface.extent || !surface.extent.isViewerVisible) { return trimRect; }
  return surface.extent.rect;
}
