import { MASTER_ELEMENT_ID_PREFIX } from '../common/constants';
import { IRect, ISize, rectsIntersect } from '../common/geometry';
import { PageSide } from '../model/book';
import { IElement, isBoxElement } from '../model/element';
import { createProblem, IDocProblem, ProblemCode, ProblemSeverity } from '../model/problem';
import { getPageTrimRect, IMasterOverride, ISurfaceDoc, SurfaceKind } from '../model/surface';
import { ElementSchema } from '../schema/elementSchema';
import { buildElementTree, getNodeBounds, walkNodes } from '../tree/elementTree';

/**
 * What a master surface is applied to.
 */
export interface IResolveMasterInput {
  master: ISurfaceDoc;
  masterKind: SurfaceKind;
  /** Kind of the surface the master is applied to. */
  targetKind: SurfaceKind;
  /**
   * Side of the target page. Needed when a spread master is applied to a
   * single page: only the half of the master on that side is used.
   */
  targetSide?: PageSide;
  /** Patches keyed by master element key, see `getMasterElementKey`. */
  overrides?: Record<string, IMasterOverride>;
  pageSize: ISize;
  /** Id of the target surface, used in problem messages. */
  surfaceId?: string;
}
/**
 * The master layer of one surface.
 */
export interface IResolveMasterResult {
  /** Elements keyed by their resolved id (`master:` + master element key). */
  elements: Record<string, IElement>;
  problems: IDocProblem[];
}
/**
 * Fields an override may never change.
 */
const PROTECTED_OVERRIDE_KEYS: ReadonlySet<string> = new Set(['id', 'type', 'parentId', 'order']);
/**
 * One copy of the master elements placed on the target surface.
 */
interface IMasterWindow {
  /** Appended to the master element id, e.g. `@1` for the right page. */
  idSuffix: string;
  /** Moves the elements into place on the target surface, in px. */
  shiftX: number;
  /** Only elements intersecting this rect are taken. `null` takes all. */
  filterRect: IRect | null;
}

/**
 * Builds the master layer of a surface: the elements of the master, moved
 * into the coordinates of the target surface and patched with its overrides.
 *
 * A spread master applied to a single page contributes only the half on that
 * page's side; a single master applied to a spread is repeated on both pages.
 */
export function resolveMasterElements(input: IResolveMasterInput): IResolveMasterResult {
  const problems: IDocProblem[] = [];
  const tree = buildElementTree(input.master.elements, input.master.id);
  problems.push(...tree.problems);

  const elements: Record<string, IElement> = {};
  for (const window of getMasterWindows(input)) {
    for (const root of tree.roots) {
      const bounds = getNodeBounds(root);
      const isInWindow = window.filterRect === null || (bounds !== undefined && rectsIntersect(bounds, window.filterRect));
      if (!isInWindow) { continue; }

      walkNodes([root], node => {
        const element = createMasterElement(node.element, window);
        elements[element.id] = element;
      });
    }
  }

  applyOverrides(elements, input.overrides ?? {}, problems, input.surfaceId);
  return { elements, problems };
}
/**
 * Returns true when the id belongs to the master layer.
 */
export function isMasterElementId(id: string): boolean {
  return id.startsWith(MASTER_ELEMENT_ID_PREFIX);
}
/**
 * Returns the key an override uses for a resolved master element:
 * the master element id, plus `@0` or `@1` when a single master is repeated
 * on both pages of a spread.
 */
export function getMasterElementKey(resolvedId: string): string {
  return isMasterElementId(resolvedId) ? resolvedId.slice(MASTER_ELEMENT_ID_PREFIX.length) : resolvedId;
}

/**
 * Returns the copies of the master that the target surface receives.
 */
function getMasterWindows(input: IResolveMasterInput): IMasterWindow[] {
  const { masterKind, targetKind, pageSize } = input;
  if (masterKind === targetKind) {
    return [{ idSuffix: '', shiftX: 0, filterRect: null }];
  }
  if (masterKind === SurfaceKind.Spread && targetKind === SurfaceKind.Single) {
    const masterX = input.targetSide === PageSide.Right ? pageSize.width : 0;
    return [{ idSuffix: '', shiftX: -masterX, filterRect: getPageTrimRect(masterX, pageSize) }];
  }
  // A single master on a spread: the same elements on the left and on the right page.
  return [
    { idSuffix: '@0', shiftX: 0, filterRect: null },
    { idSuffix: '@1', shiftX: pageSize.width, filterRect: null },
  ];
}
/**
 * Copies one master element into the target surface coordinates.
 */
function createMasterElement(element: IElement, window: IMasterWindow): IElement {
  const id = `${MASTER_ELEMENT_ID_PREFIX}${element.id}${window.idSuffix}`;
  const parentId = element.parentId === null
    ? null
    : `${MASTER_ELEMENT_ID_PREFIX}${element.parentId}${window.idSuffix}`;
  if (!isBoxElement(element)) { return { ...element, id, parentId }; }
  return { ...element, id, parentId, x: element.x + window.shiftX };
}
/**
 * Merges the overrides of the surface into the master elements. An override
 * that would break the element is ignored, so a bad patch never hides the master.
 */
function applyOverrides(
  elements: Record<string, IElement>,
  overrides: Record<string, IMasterOverride>,
  problems: IDocProblem[],
  surfaceId?: string,
): void {
  for (const [key, override] of Object.entries(overrides)) {
    const id = `${MASTER_ELEMENT_ID_PREFIX}${key}`;
    const element = elements[id];
    if (!element) {
      problems.push(createProblem(
        ProblemCode.UnknownMasterOverride,
        ProblemSeverity.Warning,
        `Override "${key}" does not match any element of the master.`,
        { surfaceId, elementId: id },
      ));
      continue;
    }

    const patch = Object.fromEntries(
      Object.entries(override).filter(([field]) => !PROTECTED_OVERRIDE_KEYS.has(field)),
    );
    // Ids of the master layer carry a `master:` prefix, which the id pattern
    // rejects, so the check runs on a copy with a plain id. `id` and `parentId`
    // cannot be patched anyway.
    const patched = ElementSchema.safeParse({ ...element, ...patch, id: 'checked', parentId: null });
    if (!patched.success) {
      problems.push(createProblem(
        ProblemCode.InvalidMasterOverride,
        ProblemSeverity.Warning,
        `Override "${key}" does not fit the element and was ignored: ${patched.error.issues[0]?.message ?? ''}`,
        { surfaceId, elementId: id },
      ));
      continue;
    }
    elements[id] = { ...patched.data, id: element.id, parentId: element.parentId } as IElement;
  }
}
