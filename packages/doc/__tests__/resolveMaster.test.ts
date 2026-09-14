import { describe, expect, it } from 'vitest';
import { MASTER_ELEMENT_ID_PREFIX } from '../src/common/constants';
import { resolveMasterElements } from '../src/master/resolveMaster';
import { PageSide } from '../src/model/book';
import { createElement } from '../src/model/defaults';
import { ElementType, IShapeElement } from '../src/model/element';
import { ProblemCode } from '../src/model/problem';
import { SurfaceKind } from '../src/model/surface';
import { makeShape, makeSurface, PAGE_SIZE } from './helpers';

const leftMark = makeShape('left', 20, 20, 50, 50);
const rightMark = makeShape('right', PAGE_SIZE.width + 20, 20, 50, 50);
const spreadMaster = makeSurface('m', [leftMark, rightMark]);

describe('resolveMasterElements', () => {
  it('copies a spread master onto a spread surface unchanged', () => {
    const result = resolveMasterElements({
      master: spreadMaster,
      masterKind: SurfaceKind.Spread,
      targetKind: SurfaceKind.Spread,
      pageSize: PAGE_SIZE,
    });

    expect(Object.keys(result.elements).sort()).toEqual(['master:left', 'master:right']);
    expect((result.elements['master:right'] as IShapeElement).x).toBe(PAGE_SIZE.width + 20);
  });

  it('gives a single right page only the right half of a spread master', () => {
    const result = resolveMasterElements({
      master: spreadMaster,
      masterKind: SurfaceKind.Spread,
      targetKind: SurfaceKind.Single,
      targetSide: PageSide.Right,
      pageSize: PAGE_SIZE,
    });

    expect(Object.keys(result.elements)).toEqual(['master:right']);
    // The element moves to the coordinates of a single page.
    expect((result.elements['master:right'] as IShapeElement).x).toBe(20);
  });

  it('gives a single left page only the left half', () => {
    const result = resolveMasterElements({
      master: spreadMaster,
      masterKind: SurfaceKind.Spread,
      targetKind: SurfaceKind.Single,
      targetSide: PageSide.Left,
      pageSize: PAGE_SIZE,
    });

    expect(Object.keys(result.elements)).toEqual(['master:left']);
    expect((result.elements['master:left'] as IShapeElement).x).toBe(20);
  });

  it('repeats a single master on both pages of a spread', () => {
    const result = resolveMasterElements({
      master: makeSurface('m', [makeShape('mark', 20, 20, 50, 50)]),
      masterKind: SurfaceKind.Single,
      targetKind: SurfaceKind.Spread,
      pageSize: PAGE_SIZE,
    });

    expect(Object.keys(result.elements).sort()).toEqual(['master:mark@0', 'master:mark@1']);
    expect((result.elements['master:mark@0'] as IShapeElement).x).toBe(20);
    expect((result.elements['master:mark@1'] as IShapeElement).x).toBe(PAGE_SIZE.width + 20);
  });

  it('keeps a group and its children together', () => {
    const master = makeSurface('m', [
      createElement(ElementType.Group, { id: 'g', order: 'a0' }),
      makeShape('child', 30, 30, 40, 40, { parentId: 'g' }),
    ]);
    const result = resolveMasterElements({
      master,
      masterKind: SurfaceKind.Single,
      targetKind: SurfaceKind.Single,
      pageSize: PAGE_SIZE,
    });

    expect(result.elements['master:child']?.parentId).toBe('master:g');
  });

  it('applies an override of the surface', () => {
    const result = resolveMasterElements({
      master: spreadMaster,
      masterKind: SurfaceKind.Spread,
      targetKind: SurfaceKind.Spread,
      overrides: { left: { isHidden: true, opacity: 0.5 } },
      pageSize: PAGE_SIZE,
    });

    expect(result.elements['master:left']?.isHidden).toBe(true);
    expect(result.elements['master:left']?.opacity).toBe(0.5);
    expect(result.elements['master:right']?.isHidden).toBe(false);
  });

  it('ignores an override that would break the element', () => {
    const result = resolveMasterElements({
      master: spreadMaster,
      masterKind: SurfaceKind.Spread,
      targetKind: SurfaceKind.Spread,
      overrides: { left: { opacity: 42 } },
      pageSize: PAGE_SIZE,
    });

    expect(result.elements['master:left']?.opacity).toBe(1);
    expect(result.problems.map(problem => problem.code)).toEqual([ProblemCode.InvalidMasterOverride]);
  });

  it('cannot be tricked into changing the identity of an element', () => {
    const result = resolveMasterElements({
      master: spreadMaster,
      masterKind: SurfaceKind.Spread,
      targetKind: SurfaceKind.Spread,
      overrides: { left: { id: 'hacked', type: ElementType.Widget, parentId: 'master:right' } },
      pageSize: PAGE_SIZE,
    });

    expect(result.elements['master:left']?.id).toBe(`${MASTER_ELEMENT_ID_PREFIX}left`);
    expect(result.elements['master:left']?.type).toBe(ElementType.Shape);
    expect(result.elements['master:left']?.parentId).toBeNull();
  });

  it('reports an override that matches no element', () => {
    const result = resolveMasterElements({
      master: spreadMaster,
      masterKind: SurfaceKind.Spread,
      targetKind: SurfaceKind.Spread,
      overrides: { gone: { opacity: 0.5 } },
      pageSize: PAGE_SIZE,
    });

    expect(result.problems.map(problem => problem.code)).toEqual([ProblemCode.UnknownMasterOverride]);
  });
});
