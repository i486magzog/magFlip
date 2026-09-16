import { MASTER_ELEMENT_ID_PREFIX } from '../common/constants';
import { IRect, ISize } from '../common/geometry';
import { createId } from '../common/ids';
import { isJsonEqual } from '../common/json';
import { compareOrdered, createOrderBetween } from '../common/order';
import { createElement } from '../model/defaults';
import { PageSide } from '../model/book';
import { ElementType, IElement, isBoxElement } from '../model/element';
import { IFill } from '../model/paint';
import { getEditRect, IMasterOverride, ISurfaceChange, ISurfaceDoc, ISurfaceExtent, SurfaceKind } from '../model/surface';
import { resolveMasterElements } from '../master/resolveMaster';
import { buildElementTree, getNodeBounds, getSubtreeIds } from '../tree/elementTree';

/**
 * The master a surface follows, when the caller could load it.
 */
export interface ISpreadMaster {
  doc: ISurfaceDoc;
  kind: SurfaceKind;
}
/**
 * Two facing single pages to turn into one spread.
 */
export interface ISpreadMergeInput {
  left: ISurfaceDoc;
  right: ISurfaceDoc;
  /** The page read first, whose surface becomes the spread. */
  firstSide: PageSide;
  pageSize: ISize;
  /** The master of the first page. Without it, its overrides are kept as they are. */
  master?: ISpreadMaster | null;
  /** Name of the rectangles that keep a page background, see `planSpreadMerge`. */
  backgroundName?: string;
}
/**
 * A spread to cut into two single pages.
 */
export interface ISpreadSplitInput {
  spread: ISurfaceDoc;
  /** The page read first, which keeps the surface of the spread. */
  firstSide: PageSide;
  /** Id of the surface the other page gets. */
  newSurfaceId: string;
  pageSize: ISize;
  /** The master of the spread. Without it, both pages keep every override. */
  master?: ISpreadMaster | null;
}
/**
 * The two surfaces a split leaves.
 */
export interface ISpreadSplitResult {
  /** Applied to the spread surface, which becomes the page read first. */
  kept: ISurfaceChange;
  /** The page read second, as a new surface. */
  created: ISurfaceDoc;
}

/**
 * Works out how the surface of the page read first becomes a spread holding
 * both pages.
 *
 * - Elements of the right page move one page width to the right. Only the
 *   page that was not kept is copied; the kept one is patched in place, so
 *   editors on it do not lose their text bindings.
 * - The spread keeps the master of the first page. The other page's overrides
 *   are kept when it follows the same master.
 * - Backgrounds paint the whole surface. When the two pages differ, the spread
 *   gets none and each page background becomes a locked rectangle at the back
 *   of its page, so both pages look as they did.
 */
export function planSpreadMerge(input: ISpreadMergeInput): ISurfaceChange {
  const { left, right, pageSize } = input;
  const isFirstLeft = input.firstSide === PageSide.Left;
  const kept = isFirstLeft ? left : right;
  const other = isFirstLeft ? right : left;
  const width = pageSize.width;

  const patches: Record<string, Partial<IElement>> = {};
  if (!isFirstLeft) {
    for (const element of Object.values(kept.elements)) {
      if (isBoxElement(element)) { patches[element.id] = { x: element.x + width }; }
    }
  }
  const added = copyElements(other.elements, new Set(Object.keys(kept.elements)), isFirstLeft ? width : 0);

  const leftRect = getEditRect(left, SurfaceKind.Single, pageSize);
  const rightRect = offsetX(getEditRect(right, SurfaceKind.Single, pageSize), width);
  const hasSameBackground = isJsonEqual(left.background, right.background);
  if (!hasSameBackground) {
    const allElements = [...Object.values(kept.elements), ...added];
    let backOrder = getBackOrder(allElements);
    const pageBackgrounds: [IFill | null, IRect][] = [
      [left.background, { ...leftRect, width: width - leftRect.x }],
      [right.background, { ...rightRect, x: width, width: rightRect.x + rightRect.width - width }],
    ];
    for (const [fill, rect] of pageBackgrounds) {
      if (!fill) { continue; }
      backOrder = createOrderBetween(null, backOrder);
      added.push(createElement(ElementType.Shape, {
        id: createId(), name: input.backgroundName ?? '', order: backOrder, isLocked: true, fill, ...rect,
      }));
    }
  }

  return {
    background: hasSameBackground ? kept.background : null,
    extent: mergeExtents(left.extent, right.extent, leftRect, rightRect, pageSize),
    masterId: kept.masterId,
    masterOverrides: mergeOverrides(kept, other, isFirstLeft, input.master ?? null),
    removedIds: [],
    patches,
    added,
  };
}
/**
 * Works out how a spread becomes two single pages.
 *
 * - Every element goes, with its whole group, to the page holding the center
 *   of its bounds. What sticks out over the gutter stays on the pasteboard of
 *   that page, so the content itself is never cut.
 * - Both pages keep the background and the master of the spread. The extent
 *   is cut at the gutter.
 */
export function planSpreadSplit(input: ISpreadSplitInput): ISpreadSplitResult {
  const { spread, pageSize } = input;
  const width = pageSize.width;
  const isFirstLeft = input.firstSide === PageSide.Left;

  const rightIds = new Set<string>();
  for (const root of buildElementTree(spread.elements, spread.id).roots) {
    const bounds = getNodeBounds(root);
    if (bounds && bounds.x + bounds.width / 2 >= width) {
      for (const id of getSubtreeIds(root)) { rightIds.add(id); }
    }
  }
  const isOnFirst = (id: string) => rightIds.has(id) !== isFirstLeft;

  const patches: Record<string, Partial<IElement>> = {};
  const removedIds: string[] = [];
  const moved: Record<string, IElement> = {};
  for (const element of Object.values(spread.elements)) {
    if (!isOnFirst(element.id)) {
      removedIds.push(element.id);
      moved[element.id] = element;
    } else if (!isFirstLeft && isBoxElement(element)) {
      patches[element.id] = { x: element.x - width };
    }
  }
  const createdElements = copyElements(moved, new Set(), isFirstLeft ? -width : 0);

  const editRect = getEditRect(spread, SurfaceKind.Spread, pageSize);
  const extents = {
    [PageSide.Left]: splitExtent(spread.extent, { ...editRect, width: width - editRect.x }, pageSize),
    [PageSide.Right]: splitExtent(spread.extent, { ...editRect, x: 0, width: editRect.x + editRect.width - width }, pageSize),
  };
  const secondSide = isFirstLeft ? PageSide.Right : PageSide.Left;
  const overrides = {
    [PageSide.Left]: splitOverrides(spread, PageSide.Left, pageSize, input.master ?? null),
    [PageSide.Right]: splitOverrides(spread, PageSide.Right, pageSize, input.master ?? null),
  };

  return {
    kept: {
      background: spread.background,
      extent: extents[input.firstSide],
      masterId: spread.masterId,
      masterOverrides: overrides[input.firstSide],
      removedIds,
      patches,
      added: [],
    },
    created: {
      id: input.newSurfaceId,
      background: spread.background,
      extent: extents[secondSide],
      masterId: spread.masterId,
      masterOverrides: overrides[secondSide],
      elements: Object.fromEntries(createdElements.map(element => [element.id, element])),
    },
  };
}

/**
 * Copies elements shifted by `dx`. An id already taken on the target surface
 * gets a new one, and its children follow it.
 */
function copyElements(elements: Record<string, IElement>, takenIds: Set<string>, dx: number): IElement[] {
  const newIds = new Map<string, string>();
  for (const id of Object.keys(elements)) {
    if (takenIds.has(id)) { newIds.set(id, createId()); }
  }
  return Object.values(elements).map(element => {
    const id = newIds.get(element.id) ?? element.id;
    const parentId = element.parentId === null ? null : newIds.get(element.parentId) ?? element.parentId;
    if (!isBoxElement(element)) { return { ...element, id, parentId }; }
    return { ...element, id, parentId, x: element.x + dx };
  });
}
/**
 * Returns the order key of the backmost element on the surface itself, or
 * `null` when there is none.
 */
function getBackOrder(elements: IElement[]): string | null {
  const roots = elements.filter(element => element.parentId === null).sort(compareOrdered);
  return roots[0]?.order ?? null;
}
/**
 * Joins the extents of two pages. `null` when neither page had one.
 */
function mergeExtents(
  left: ISurfaceExtent | null,
  right: ISurfaceExtent | null,
  leftRect: IRect,
  rightRect: IRect,
  pageSize: ISize,
): ISurfaceExtent | null {
  if (!left && !right) { return null; }

  const x = leftRect.x;
  const y = Math.min(leftRect.y, rightRect.y);
  const rect = {
    x,
    y,
    width: rightRect.x + rightRect.width - x,
    height: Math.max(leftRect.y + leftRect.height, rightRect.y + rightRect.height) - y,
  };
  const isViewerVisible = Boolean(left?.isViewerVisible || right?.isViewerVisible);
  return toExtent(rect, isViewerVisible, pageSize.width * 2, pageSize.height);
}
/**
 * Returns the extent of one page cut out of a spread, in page coordinates.
 */
function splitExtent(extent: ISurfaceExtent | null, rect: IRect, pageSize: ISize): ISurfaceExtent | null {
  if (!extent) { return null; }
  return toExtent(rect, extent.isViewerVisible, pageSize.width, pageSize.height);
}
/**
 * An extent as large as the pages is no extent.
 */
function toExtent(rect: IRect, isViewerVisible: boolean, width: number, height: number): ISurfaceExtent | null {
  const isTrim = rect.x === 0 && rect.y === 0 && rect.width === width && rect.height === height;
  return isTrim ? null : { rect, isViewerVisible };
}
/**
 * Keys of master overrides follow the pages they apply to: a single master
 * repeated on a spread is keyed `id@0` on the left page and `id@1` on the
 * right one, and plain `id` everywhere else.
 */
function mergeOverrides(
  kept: ISurfaceDoc,
  other: ISurfaceDoc,
  isFirstLeft: boolean,
  master: ISpreadMaster | null,
): Record<string, IMasterOverride> {
  if (kept.masterId === null) { return {}; }
  if (!master) { return { ...kept.masterOverrides }; }

  const sources: [ISurfaceDoc, string][] = [[kept, isFirstLeft ? '@0' : '@1']];
  if (other.masterId === kept.masterId) { sources.push([other, isFirstLeft ? '@1' : '@0']); }

  const overrides: Record<string, IMasterOverride> = {};
  // The kept page goes last so that it wins when a spread master element spans both pages.
  for (const [surface, suffix] of sources.reverse()) {
    for (const [key, override] of Object.entries(surface.masterOverrides)) {
      overrides[master.kind === SurfaceKind.Single ? `${key}${suffix}` : key] = override;
    }
  }
  return overrides;
}
/**
 * Returns the overrides of a spread that still apply to one of its pages.
 */
function splitOverrides(
  spread: ISurfaceDoc,
  side: PageSide,
  pageSize: ISize,
  master: ISpreadMaster | null,
): Record<string, IMasterOverride> {
  if (spread.masterId === null) { return {}; }
  if (!master) { return { ...spread.masterOverrides }; }

  const overrides: Record<string, IMasterOverride> = {};
  if (master.kind === SurfaceKind.Single) {
    const suffix = side === PageSide.Left ? '@0' : '@1';
    for (const [key, override] of Object.entries(spread.masterOverrides)) {
      if (key.endsWith(suffix)) { overrides[key.slice(0, -suffix.length)] = override; }
    }
    return overrides;
  }

  const { elements } = resolveMasterElements({
    master: master.doc,
    masterKind: SurfaceKind.Spread,
    targetKind: SurfaceKind.Single,
    targetSide: side,
    pageSize,
  });
  for (const [key, override] of Object.entries(spread.masterOverrides)) {
    if (elements[`${MASTER_ELEMENT_ID_PREFIX}${key}`]) { overrides[key] = override; }
  }
  return overrides;
}

function offsetX(rect: IRect, dx: number): IRect {
  return { ...rect, x: rect.x + dx };
}
