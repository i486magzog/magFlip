import { getRectCenter, IRect, ISize, rotatedRectIntersectsRect } from '../common/geometry';
import { IBookDoc, PageSide } from '../model/book';
import { ElementType, getElementRect, IElement, isBoxElement } from '../model/element';
import { createProblem, IDocProblem, ProblemCode, ProblemSeverity } from '../model/problem';
import { IPublishedNode } from '../model/published';
import { ISurfaceDoc, SurfaceKind } from '../model/surface';
import { IBookLayout } from '../layout/bookLayout';
import { resolveMasterElements } from '../master/resolveMaster';
import { ITextFieldValues, resolveTextFields } from '../text/textContent';
import { buildElementTree, IElementNode } from '../tree/elementTree';

/**
 * Page numbers of a surface, used to fill text fields.
 */
export interface ISurfaceTextContext {
  bookTitle: string;
  pageCount: number;
  /** One entry per page of the surface. */
  pages: { surfaceX: number, pageNumber: number | null }[];
}
/**
 * A surface together with everything needed to render it.
 */
export interface IResolveSurfaceInput {
  surface: ISurfaceDoc;
  kind: SurfaceKind;
  pageSize: ISize;
  /** The master applied to the surface, or `null`. */
  master?: { doc: ISurfaceDoc, kind: SurfaceKind } | null;
  /** Side of the page. Needed when a spread master is applied to a single page. */
  side?: PageSide;
  textContext: ISurfaceTextContext;
}
/**
 * How much of the surface to keep.
 */
export interface IResolveSurfaceOptions {
  /** Elements that do not touch this rect are dropped. `null` keeps them all. */
  clipRect?: IRect | null;
  /** Keep hidden elements. The editor canvas never does. */
  includeHidden?: boolean;
  /** When set, elements referencing an unknown asset are dropped. */
  hasAsset?: (assetId: string) => boolean;
}
/**
 * The renderable tree of one surface.
 */
export interface IResolveSurfaceResult {
  /** Root nodes ordered back to front, master elements first. */
  nodes: IPublishedNode[];
  /** Ids of the assets the nodes reference. */
  assetIds: Set<string>;
  problems: IDocProblem[];
}
/**
 * Fields that exist only while editing.
 */
const EDITOR_ONLY_FIELDS = ['parentId', 'order', 'name', 'isHidden', 'isLocked'] as const;

/**
 * Turns a surface into the tree the renderer draws: the master layer resolved,
 * text fields filled in, hidden elements removed and - when `clipRect` is set -
 * everything the reader must not see dropped.
 *
 * The editor calls it without `clipRect` to draw the pasteboard as well; the
 * publisher calls it with the visible rect, which is how a page that is not
 * expandable loses its extra content instead of only hiding it with CSS.
 */
export function resolveSurfaceNodes(input: IResolveSurfaceInput, options: IResolveSurfaceOptions = {}): IResolveSurfaceResult {
  const problems: IDocProblem[] = [];
  const assetIds = new Set<string>();

  const masterNodes = input.master
    ? resolveMasterNodes(input, options, problems, assetIds)
    : [];
  const contentTree = buildElementTree(input.surface.elements, input.surface.id);
  problems.push(...contentTree.problems);
  const contentNodes = toPublishedNodes(contentTree.roots, false, input, options, problems, assetIds);

  return { nodes: [...masterNodes, ...contentNodes], assetIds, problems };
}
/**
 * Returns the page numbers of a surface, used to fill text fields.
 */
export function createSurfaceTextContext(book: IBookDoc, layout: IBookLayout, surfaceId: string): ISurfaceTextContext {
  const pages = layout.surfacePages.get(surfaceId) ?? [];
  return {
    bookTitle: book.meta.title,
    pageCount: layout.pages.length,
    pages: pages.map(page => ({ surfaceX: page.surfaceX, pageNumber: page.number })),
  };
}
/**
 * Returns the field values of the page an element sits on. An element that
 * crosses the gutter belongs to the page holding its center.
 */
export function getFieldValuesAt(context: ISurfaceTextContext, centerX: number, pageWidth: number): ITextFieldValues {
  const page = context.pages.find(candidate => centerX >= candidate.surfaceX && centerX < candidate.surfaceX + pageWidth)
    ?? context.pages[0];
  return {
    pageNumber: page ? page.pageNumber : null,
    pageCount: context.pageCount,
    bookTitle: context.bookTitle,
  };
}

function resolveMasterNodes(
  input: IResolveSurfaceInput,
  options: IResolveSurfaceOptions,
  problems: IDocProblem[],
  assetIds: Set<string>,
): IPublishedNode[] {
  const master = input.master;
  if (!master) { return []; }

  const resolved = resolveMasterElements({
    master: master.doc,
    masterKind: master.kind,
    targetKind: input.kind,
    targetSide: input.side,
    overrides: input.surface.masterOverrides,
    pageSize: input.pageSize,
    surfaceId: input.surface.id,
  });
  problems.push(...resolved.problems);

  const tree = buildElementTree(resolved.elements, input.surface.id);
  return toPublishedNodes(tree.roots, true, input, options, problems, assetIds);
}

function toPublishedNodes(
  nodes: IElementNode[],
  isFromMaster: boolean,
  input: IResolveSurfaceInput,
  options: IResolveSurfaceOptions,
  problems: IDocProblem[],
  assetIds: Set<string>,
): IPublishedNode[] {
  const published: IPublishedNode[] = [];
  for (const node of nodes) {
    const element = node.element;
    if (element.isHidden && !options.includeHidden) { continue; }
    if (isOutsideClip(element, options.clipRect)) { continue; }
    if (!hasEveryAsset(element, options, problems, input.surface.id)) { continue; }

    const children = toPublishedNodes(node.children, isFromMaster, input, options, problems, assetIds);
    // A group whose children are all gone would draw nothing.
    if (element.type === ElementType.Group && children.length === 0) { continue; }

    const publishedElement = toPublishedElement(element, input, options);
    collectAssetIds(publishedElement, assetIds);
    published.push({ ...publishedElement, isFromMaster, children } as IPublishedNode);
  }
  return published;
}
/**
 * Removes editing-only fields, fills in text fields and drops a poster image
 * that no longer exists.
 */
function toPublishedElement(
  element: IElement,
  input: IResolveSurfaceInput,
  options: IResolveSurfaceOptions,
): Record<string, unknown> {
  const published: Record<string, unknown> = { ...element };
  for (const field of EDITOR_ONLY_FIELDS) { delete published[field]; }

  if (element.type === ElementType.Text) {
    const centerX = getRectCenter(getElementRect(element)).x;
    const values = getFieldValuesAt(input.textContext, centerX, input.pageSize.width);
    published['content'] = resolveTextFields(element.content, values);
  }
  const posterAssetId = element.type === ElementType.Video ? element.posterAssetId : null;
  if (posterAssetId !== null && options.hasAsset && !options.hasAsset(posterAssetId)) {
    published['posterAssetId'] = null;
  }
  return published;
}

function isOutsideClip(element: IElement, clipRect: IRect | null | undefined): boolean {
  if (!clipRect || !isBoxElement(element)) { return false; }
  return !rotatedRectIntersectsRect(getElementRect(element), element.rotation, clipRect);
}

function hasEveryAsset(
  element: IElement,
  options: IResolveSurfaceOptions,
  problems: IDocProblem[],
  surfaceId: string,
): boolean {
  if (!options.hasAsset) { return true; }

  for (const assetId of getAssetIds(element)) {
    if (options.hasAsset(assetId)) { continue; }
    problems.push(createProblem(
      ProblemCode.MissingAsset,
      ProblemSeverity.Error,
      `Element "${element.id}" references asset "${assetId}", which does not exist.`,
      { surfaceId, elementId: element.id },
    ));
    return false;
  }
  return true;
}

/**
 * Collects the assets of an element that is already published, so that a
 * poster dropped above is not listed.
 */
function collectAssetIds(element: Record<string, unknown>, assetIds: Set<string>): void {
  for (const field of ['assetId', 'posterAssetId']) {
    const assetId = element[field];
    if (typeof assetId === 'string' && assetId.length > 0) { assetIds.add(assetId); }
  }
}
/**
 * Returns the assets an element cannot be rendered without. The poster of a
 * video is not one of them: a video without a poster still plays.
 */
function getAssetIds(element: IElement): string[] {
  switch (element.type) {
    case ElementType.Image:
    case ElementType.Video:
    case ElementType.Audio:
      return [element.assetId];
    default:
      return [];
  }
}
