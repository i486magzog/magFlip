import { DOC_LIMITS } from '../common/constants';
import { getRotatedBounds, IRect, unionRects } from '../common/geometry';
import { compareOrdered } from '../common/order';
import { ElementType, getElementRect, IElement, isBoxElement } from '../model/element';
import { createProblem, IDocProblem, ProblemCode, ProblemSeverity } from '../model/problem';

/**
 * An element together with its children, ordered back to front.
 */
export interface IElementNode {
  element: IElement;
  children: IElementNode[];
}
/**
 * The element tree of one surface.
 */
export interface IElementTree {
  /** Elements that sit directly on the surface, ordered back to front. */
  roots: IElementNode[];
  nodesById: Map<string, IElementNode>;
  problems: IDocProblem[];
}

/**
 * Builds the element tree of a surface.
 *
 * Elements store `parentId`, not a nested list, so that two users moving
 * elements between groups at the same time cannot duplicate or lose one.
 * The price is that a merge can produce a broken shape - a missing parent, a
 * parent that is not a group, or two groups inside each other. This function
 * repairs those cases deterministically (the element ends up on the surface)
 * and reports them, so every client shows the same tree.
 */
export function buildElementTree(elements: Record<string, IElement>, surfaceId?: string): IElementTree {
  const problems: IDocProblem[] = [];
  const parentById = resolveParents(elements, problems, surfaceId);
  breakCycles(parentById, problems, surfaceId);

  const nodesById = new Map<string, IElementNode>();
  for (const element of Object.values(elements)) {
    nodesById.set(element.id, { element, children: [] });
  }

  const roots: IElementNode[] = [];
  for (const node of nodesById.values()) {
    const parentId = parentById.get(node.element.id) ?? null;
    const parent = parentId === null ? undefined : nodesById.get(parentId);
    if (parent) { parent.children.push(node); } else { roots.push(node); }
  }

  detachTooDeepNodes(roots, nodesById, problems, surfaceId);
  sortNodes(roots);
  return { roots, nodesById, problems };
}
/**
 * Returns the bounds of a node in surface coordinates: the rotated box of an
 * element, or the union of the children of a group.
 * Returns `undefined` for an empty group.
 */
export function getNodeBounds(node: IElementNode): IRect | undefined {
  if (isBoxElement(node.element)) {
    return getRotatedBounds(getElementRect(node.element), node.element.rotation);
  }
  const childBounds = node.children.map(getNodeBounds).filter((rect): rect is IRect => rect !== undefined);
  return unionRects(childBounds);
}
/**
 * Calls `visit` for every node, parents before children.
 * Returning `false` skips the children of that node.
 */
export function walkNodes(nodes: IElementNode[], visit: (node: IElementNode, depth: number) => boolean | void, depth = 0): void {
  for (const node of nodes) {
    if (visit(node, depth) === false) { continue; }
    walkNodes(node.children, visit, depth + 1);
  }
}
/**
 * Returns the ids of every element inside the node, the node itself included.
 */
export function getSubtreeIds(node: IElementNode): string[] {
  const ids: string[] = [];
  walkNodes([node], child => { ids.push(child.element.id); });
  return ids;
}

/**
 * Maps every element to the parent it can actually have. An element whose
 * parent is missing or is not a group moves to the surface.
 */
function resolveParents(elements: Record<string, IElement>, problems: IDocProblem[], surfaceId?: string): Map<string, string | null> {
  const parentById = new Map<string, string | null>();
  for (const element of Object.values(elements)) {
    const parentId = element.parentId;
    if (parentId === null) {
      parentById.set(element.id, null);
      continue;
    }

    const parent = elements[parentId];
    if (!parent) {
      problems.push(createProblem(
        ProblemCode.OrphanElement,
        ProblemSeverity.Warning,
        `Element "${element.id}" has parent "${parentId}", which does not exist.`,
        { surfaceId, elementId: element.id },
      ));
      parentById.set(element.id, null);
      continue;
    }
    if (parent.type !== ElementType.Group) {
      problems.push(createProblem(
        ProblemCode.InvalidParent,
        ProblemSeverity.Warning,
        `Element "${element.id}" has parent "${parentId}", which is not a group.`,
        { surfaceId, elementId: element.id },
      ));
      parentById.set(element.id, null);
      continue;
    }
    parentById.set(element.id, parentId);
  }
  return parentById;
}
/**
 * Moves one element of every cycle to the surface. The element with the
 * smallest id is chosen so that every client repairs the cycle the same way.
 */
function breakCycles(parentById: Map<string, string | null>, problems: IDocProblem[], surfaceId?: string): void {
  const visitedIds = new Set<string>();

  for (const startId of [...parentById.keys()].sort()) {
    const path: string[] = [];
    const pathIndexById = new Map<string, number>();
    let currentId: string | null = startId;

    while (currentId !== null && !visitedIds.has(currentId)) {
      const cycleStart = pathIndexById.get(currentId);
      if (cycleStart !== undefined) {
        const cycle = path.slice(cycleStart);
        const detachedId = [...cycle].sort()[0] as string;
        parentById.set(detachedId, null);
        problems.push(createProblem(
          ProblemCode.ElementCycle,
          ProblemSeverity.Warning,
          `Groups ${cycle.map(id => `"${id}"`).join(' → ')} contain each other. "${detachedId}" was moved to the surface.`,
          { surfaceId, elementId: detachedId },
        ));
        break;
      }
      pathIndexById.set(currentId, path.length);
      path.push(currentId);
      currentId = parentById.get(currentId) ?? null;
    }
    for (const id of path) { visitedIds.add(id); }
  }
}
/**
 * Moves nodes nested deeper than the limit to the surface, so that a document
 * cannot force unbounded recursion in the renderer.
 */
function detachTooDeepNodes(roots: IElementNode[], nodesById: Map<string, IElementNode>, problems: IDocProblem[], surfaceId?: string): void {
  const tooDeepNodes: IElementNode[] = [];
  walkNodes(roots, (node, depth) => {
    if (depth < DOC_LIMITS.maxGroupDepth) { return; }
    tooDeepNodes.push(node);
    return false;
  });

  for (const node of tooDeepNodes) {
    const parentId = node.element.parentId;
    const parent = parentId === null ? undefined : nodesById.get(parentId);
    if (parent) { parent.children = parent.children.filter(child => child !== node); }
    roots.push(node);
    problems.push(createProblem(
      ProblemCode.GroupTooDeep,
      ProblemSeverity.Warning,
      `Element "${node.element.id}" is nested deeper than ${DOC_LIMITS.maxGroupDepth} groups and was moved to the surface.`,
      { surfaceId, elementId: node.element.id },
    ));
  }
}

function sortNodes(nodes: IElementNode[]): void {
  nodes.sort((a, b) => compareOrdered(a.element, b.element));
  for (const node of nodes) { sortNodes(node.children); }
}
