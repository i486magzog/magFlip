import { describe, expect, it } from 'vitest';
import { createElement } from '../src/model/defaults';
import { ElementType, IElement } from '../src/model/element';
import { ProblemCode } from '../src/model/problem';
import { buildElementTree, getNodeBounds, getSubtreeIds } from '../src/tree/elementTree';
import { makeShape } from './helpers';

function toRecord(elements: IElement[]): Record<string, IElement> {
  return Object.fromEntries(elements.map(element => [element.id, element]));
}

describe('buildElementTree', () => {
  it('orders siblings back to front by order key', () => {
    const elements = toRecord([
      makeShape('front', 0, 0, 10, 10, { order: 'a2' }),
      makeShape('back', 0, 0, 10, 10, { order: 'a0' }),
      makeShape('middle', 0, 0, 10, 10, { order: 'a1' }),
    ]);

    expect(buildElementTree(elements).roots.map(node => node.element.id)).toEqual(['back', 'middle', 'front']);
  });

  it('breaks ties with the id so that every client sees the same order', () => {
    const elements = toRecord([
      makeShape('b', 0, 0, 10, 10, { order: 'a0' }),
      makeShape('a', 0, 0, 10, 10, { order: 'a0' }),
    ]);

    expect(buildElementTree(elements).roots.map(node => node.element.id)).toEqual(['a', 'b']);
  });

  it('nests children under their group', () => {
    const elements = toRecord([
      createElement(ElementType.Group, { id: 'g', order: 'a0' }),
      makeShape('child', 0, 0, 10, 10, { parentId: 'g' }),
    ]);
    const tree = buildElementTree(elements);

    expect(tree.roots.map(node => node.element.id)).toEqual(['g']);
    expect(getSubtreeIds(tree.roots[0]!)).toEqual(['g', 'child']);
  });

  it('moves an element whose group was deleted back onto the surface', () => {
    const tree = buildElementTree(toRecord([makeShape('child', 0, 0, 10, 10, { parentId: 'gone' })]));

    expect(tree.roots.map(node => node.element.id)).toEqual(['child']);
    expect(tree.problems.map(problem => problem.code)).toEqual([ProblemCode.OrphanElement]);
  });

  it('moves an element whose parent is not a group back onto the surface', () => {
    const tree = buildElementTree(toRecord([
      makeShape('box', 0, 0, 10, 10),
      makeShape('child', 0, 0, 10, 10, { parentId: 'box' }),
    ]));

    expect(tree.roots).toHaveLength(2);
    expect(tree.problems.map(problem => problem.code)).toEqual([ProblemCode.InvalidParent]);
  });

  it('repairs two groups that ended up inside each other', () => {
    // What two people dragging groups into each other at the same time produce.
    const tree = buildElementTree(toRecord([
      createElement(ElementType.Group, { id: 'g1', parentId: 'g2', order: 'a0' }),
      createElement(ElementType.Group, { id: 'g2', parentId: 'g1', order: 'a1' }),
    ]));

    expect(tree.problems.map(problem => problem.code)).toEqual([ProblemCode.ElementCycle]);
    // The smallest id is detached, so every client repairs it the same way.
    expect(tree.roots.map(node => node.element.id)).toEqual(['g1']);
    expect(getSubtreeIds(tree.roots[0]!)).toEqual(['g1', 'g2']);
  });
});

describe('getNodeBounds', () => {
  it('returns the rotated bounds of an element', () => {
    const tree = buildElementTree(toRecord([makeShape('box', 0, 0, 100, 20, { rotation: 90 })]));
    const bounds = getNodeBounds(tree.roots[0]!);

    expect(bounds?.width).toBeCloseTo(20);
    expect(bounds?.height).toBeCloseTo(100);
  });

  it('returns the union of the children of a group', () => {
    const tree = buildElementTree(toRecord([
      createElement(ElementType.Group, { id: 'g', order: 'a0' }),
      makeShape('a', 0, 0, 100, 100, { parentId: 'g' }),
      makeShape('b', 200, 50, 100, 100, { parentId: 'g' }),
    ]));

    expect(getNodeBounds(tree.roots[0]!)).toEqual({ x: 0, y: 0, width: 300, height: 150 });
  });

  it('returns undefined for an empty group', () => {
    const tree = buildElementTree(toRecord([createElement(ElementType.Group, { id: 'g', order: 'a0' })]));

    expect(getNodeBounds(tree.roots[0]!)).toBeUndefined();
  });
});
