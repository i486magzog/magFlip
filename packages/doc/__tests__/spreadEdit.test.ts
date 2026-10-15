import { describe, expect, it } from 'vitest';
import * as Y from 'yjs';
import { getTextFragment, patchElement, readSurfaceDoc, writeSurfaceChange, writeSurfaceDoc } from '../src/collab/surfaceYDoc';
import { computeBookLayout, findFacingSinglePair } from '../src/layout/bookLayout';
import { PageSide, ReadingDirection } from '../src/model/book';
import { createElement } from '../src/model/defaults';
import { ElementType, IShapeElement } from '../src/model/element';
import { FillKind } from '../src/model/paint';
import { applySurfaceChange, SurfaceKind } from '../src/model/surface';
import { planSpreadMerge, planSpreadSplit } from '../src/spread/spreadEdit';
import { makeBook, makeShape, makeSurface, PAGE_SIZE } from './helpers';

const { Single, Spread } = SurfaceKind;
const W = PAGE_SIZE.width;
const red = { kind: FillKind.Solid, color: '#ff0000' } as const;
const blue = { kind: FillKind.Solid, color: '#0000ff' } as const;

function xOf(surface: { elements: Record<string, unknown> }, id: string): number {
  return (surface.elements[id] as IShapeElement).x;
}

describe('findFacingSinglePair', () => {
  it('pairs the two single pages of an opening, left page first', () => {
    const book = makeBook([Single, Single, Single, Single]);
    const layout = computeBookLayout(book);
    expect(findFacingSinglePair(book, layout, 's2')).toEqual({ firstId: 's1', secondId: 's2', leftId: 's1', rightId: 's2' });
  });

  it('reads the right page first in a right-to-left book', () => {
    const book = makeBook([Single, Single, Single, Single], { readingDirection: ReadingDirection.RightToLeft });
    const layout = computeBookLayout(book);
    expect(findFacingSinglePair(book, layout, 's1')).toEqual({ firstId: 's1', secondId: 's2', leftId: 's2', rightId: 's1' });
  });

  it('refuses the cover, the last page, spreads and a page facing a spread half', () => {
    const book = makeBook([Single, Spread, Single]);
    const layout = computeBookLayout(book);
    expect(findFacingSinglePair(book, layout, 's0')).toBeNull();
    expect(findFacingSinglePair(book, layout, 's1')).toBeNull();
    expect(findFacingSinglePair(book, layout, 's2')).toBeNull();

    const misaligned = makeBook([Single, Single, Spread, Single]);
    expect(findFacingSinglePair(misaligned, computeBookLayout(misaligned), 's1')).toBeNull();
  });
});

describe('planSpreadMerge', () => {
  it('moves the right page one page width to the right', () => {
    const left = makeSurface('l', [makeShape('a', 10, 10)]);
    const right = makeSurface('r', [makeShape('b', 20, 10)]);
    const change = planSpreadMerge({ left, right, firstSide: PageSide.Left, pageSize: PAGE_SIZE });
    const merged = applySurfaceChange(left, change);

    expect(xOf(merged, 'a')).toBe(10);
    expect(xOf(merged, 'b')).toBe(W + 20);
    expect(change.patches).toEqual({});
  });

  it('patches the kept page in place when it is the right one', () => {
    const left = makeSurface('l', [makeShape('a', 10, 10)]);
    const right = makeSurface('r', [makeShape('b', 20, 10)]);
    const change = planSpreadMerge({ left, right, firstSide: PageSide.Right, pageSize: PAGE_SIZE });
    const merged = applySurfaceChange(right, change);

    expect(change.patches).toEqual({ b: { x: W + 20 } });
    expect(xOf(merged, 'a')).toBe(10);
    expect(xOf(merged, 'b')).toBe(W + 20);
  });

  it('gives a copied element a new id when the kept page already uses it, and keeps its children with it', () => {
    const group = createElement(ElementType.Group, { id: 'g' });
    const left = makeSurface('l', [makeShape('g', 0, 0)]);
    const right = makeSurface('r', [group, makeShape('child', 30, 30, 10, 10, { parentId: 'g' })]);
    const change = planSpreadMerge({ left, right, firstSide: PageSide.Left, pageSize: PAGE_SIZE });

    const copiedGroup = change.added.find(element => element.type === ElementType.Group);
    const child = change.added.find(element => element.id === 'child');
    expect(copiedGroup?.id).not.toBe('g');
    expect(child?.parentId).toBe(copiedGroup?.id);
  });

  it('keeps one background when both pages share it', () => {
    const change = planSpreadMerge({
      left: makeSurface('l', [], { background: red }),
      right: makeSurface('r', [], { background: red }),
      firstSide: PageSide.Left,
      pageSize: PAGE_SIZE,
    });
    expect(change.background).toEqual(red);
    expect(change.added).toEqual([]);
  });

  it('turns different backgrounds into locked rectangles behind each page', () => {
    const change = planSpreadMerge({
      left: makeSurface('l', [makeShape('a', 0, 0, 10, 10, { order: 'a0' })], { background: red }),
      right: makeSurface('r', [], { background: blue }),
      firstSide: PageSide.Left,
      pageSize: PAGE_SIZE,
      backgroundName: 'Background',
    });
    const backgrounds = change.added.filter((element): element is IShapeElement => element.type === ElementType.Shape);

    expect(change.background).toBeNull();
    expect(backgrounds.map(shape => [shape.fill, shape.x, shape.width, shape.isLocked, shape.name])).toEqual([
      [red, 0, W, true, 'Background'],
      [blue, W, W, true, 'Background'],
    ]);
    for (const shape of backgrounds) { expect(shape.order < 'a0').toBe(true); }
  });

  it('keeps a background that only one page has on that page', () => {
    const change = planSpreadMerge({
      left: makeSurface('l'),
      right: makeSurface('r', [], { background: blue }),
      firstSide: PageSide.Left,
      pageSize: PAGE_SIZE,
    });
    expect(change.background).toBeNull();
    expect(change.added).toHaveLength(1);
    expect(change.added[0]).toMatchObject({ x: W, width: W });
  });

  it('joins the extents of both pages', () => {
    const left = makeSurface('l', [], { extent: { rect: { x: -100, y: 0, width: W + 100, height: PAGE_SIZE.height }, isViewerVisible: false } });
    const right = makeSurface('r', [], { extent: { rect: { x: 0, y: -50, width: W, height: PAGE_SIZE.height + 50 }, isViewerVisible: true } });
    const change = planSpreadMerge({ left, right, firstSide: PageSide.Left, pageSize: PAGE_SIZE });

    expect(change.extent).toEqual({
      rect: { x: -100, y: -50, width: 2 * W + 100, height: PAGE_SIZE.height + 50 },
      isViewerVisible: true,
    });
  });

  it('renames overrides of a single master to the page they now sit on', () => {
    const master = { doc: makeSurface('m', [makeShape('title', 0, 0)]), kind: Single };
    const change = planSpreadMerge({
      left: makeSurface('l', [], { masterId: 'm', masterOverrides: { title: { opacity: 0.5 } } }),
      right: makeSurface('r', [], { masterId: 'm', masterOverrides: { title: { opacity: 0.2 } } }),
      firstSide: PageSide.Left,
      pageSize: PAGE_SIZE,
      master,
    });
    expect(change.masterId).toBe('m');
    expect(change.masterOverrides).toEqual({ 'title@0': { opacity: 0.5 }, 'title@1': { opacity: 0.2 } });
  });

  it('drops the overrides of the other page when it follows another master', () => {
    const change = planSpreadMerge({
      left: makeSurface('l', [], { masterId: 'm', masterOverrides: { title: { opacity: 0.5 } } }),
      right: makeSurface('r', [], { masterId: 'other', masterOverrides: { logo: { opacity: 0.2 } } }),
      firstSide: PageSide.Left,
      pageSize: PAGE_SIZE,
      master: { doc: makeSurface('m'), kind: Spread },
    });
    expect(change.masterOverrides).toEqual({ title: { opacity: 0.5 } });
  });
});

describe('planSpreadSplit', () => {
  it('sends each element to the page holding its center', () => {
    const spread = makeSurface('s', [
      makeShape('left', 10, 10),
      makeShape('right', W + 10, 10),
      makeShape('across', W - 50, 10, 200, 100),
    ]);
    const { kept, created } = planSpreadSplit({ spread, firstSide: PageSide.Left, newSurfaceId: 'n', pageSize: PAGE_SIZE });
    const first = applySurfaceChange(spread, kept);

    expect(Object.keys(first.elements).sort()).toEqual(['left']);
    expect(Object.keys(created.elements).sort()).toEqual(['across', 'right']);
    expect(xOf(created, 'right')).toBe(10);
    expect(xOf(created, 'across')).toBe(-50);
    expect(created.id).toBe('n');
  });

  it('keeps a group together on one page', () => {
    const spread = makeSurface('s', [
      createElement(ElementType.Group, { id: 'g' }),
      makeShape('a', 10, 10, 10, 10, { parentId: 'g' }),
      makeShape('b', W + 600, 10, 10, 10, { parentId: 'g' }),
    ]);
    const { kept, created } = planSpreadSplit({ spread, firstSide: PageSide.Left, newSurfaceId: 'n', pageSize: PAGE_SIZE });
    expect(kept.removedIds.sort()).toEqual(['a', 'b', 'g']);
    expect(xOf(created, 'a')).toBe(10 - W);
  });

  it('keeps the right page in a right-to-left book and moves it to x 0', () => {
    const spread = makeSurface('s', [makeShape('left', 10, 10), makeShape('right', W + 10, 10)]);
    const { kept, created } = planSpreadSplit({ spread, firstSide: PageSide.Right, newSurfaceId: 'n', pageSize: PAGE_SIZE });
    const first = applySurfaceChange(spread, kept);

    expect(xOf(first, 'right')).toBe(10);
    expect(Object.keys(first.elements)).toEqual(['right']);
    expect(xOf(created, 'left')).toBe(10);
  });

  it('cuts the extent at the gutter', () => {
    const spread = makeSurface('s', [], {
      background: red,
      extent: { rect: { x: -100, y: 0, width: 2 * W + 100, height: PAGE_SIZE.height }, isViewerVisible: true },
    });
    const { kept, created } = planSpreadSplit({ spread, firstSide: PageSide.Left, newSurfaceId: 'n', pageSize: PAGE_SIZE });

    expect(kept.extent).toEqual({ rect: { x: -100, y: 0, width: W + 100, height: PAGE_SIZE.height }, isViewerVisible: true });
    expect(created.extent).toBeNull();
    expect(created.background).toEqual(red);
  });

  it('gives each page the overrides of its copy of a single master', () => {
    const spread = makeSurface('s', [], { masterId: 'm', masterOverrides: { 'title@0': { opacity: 0.5 }, 'title@1': { opacity: 0.2 } } });
    const { kept, created } = planSpreadSplit({
      spread, firstSide: PageSide.Left, newSurfaceId: 'n', pageSize: PAGE_SIZE,
      master: { doc: makeSurface('m', [makeShape('title', 0, 0)]), kind: Single },
    });
    expect(kept.masterOverrides).toEqual({ title: { opacity: 0.5 } });
    expect(created.masterOverrides).toEqual({ title: { opacity: 0.2 } });
  });

  it('gives each page the overrides of the spread master elements on it', () => {
    const master = makeSurface('m', [makeShape('leftMark', 10, 10), makeShape('rightMark', W + 10, 10)]);
    const spread = makeSurface('s', [], { masterId: 'm', masterOverrides: { leftMark: { opacity: 0.5 }, rightMark: { opacity: 0.2 } } });
    const { kept, created } = planSpreadSplit({
      spread, firstSide: PageSide.Left, newSurfaceId: 'n', pageSize: PAGE_SIZE,
      master: { doc: master, kind: Spread },
    });
    expect(kept.masterOverrides).toEqual({ leftMark: { opacity: 0.5 } });
    expect(created.masterOverrides).toEqual({ rightMark: { opacity: 0.2 } });
  });

  it('undoes a merge', () => {
    const left = makeSurface('l', [makeShape('a', 10, 10)]);
    const right = makeSurface('r', [makeShape('b', 20, 10)]);
    const spread = applySurfaceChange(left, planSpreadMerge({ left, right, firstSide: PageSide.Left, pageSize: PAGE_SIZE }));
    const { kept, created } = planSpreadSplit({ spread, firstSide: PageSide.Left, newSurfaceId: 'r', pageSize: PAGE_SIZE });

    expect(applySurfaceChange(spread, kept)).toEqual(left);
    expect(created).toEqual(right);
  });
});

describe('writeSurfaceChange', () => {
  it('moves elements in place, so a text editor stays bound to its fragment', () => {
    const left = makeSurface('l', [makeShape('b', 20, 10)]);
    const room = new Y.Doc();
    writeSurfaceDoc(room, makeSurface('r', [createElement(ElementType.Text, { id: 't', x: 10 })]));
    const boundFragment = getTextFragment(room, 't');

    writeSurfaceChange(room, planSpreadMerge({ left, right: readSurfaceDoc(room), firstSide: PageSide.Right, pageSize: PAGE_SIZE }));

    expect(getTextFragment(room, 't')).toBe(boundFragment);
    const merged = readSurfaceDoc(room);
    expect(xOf(merged, 't')).toBe(W + 10);
    expect(xOf(merged, 'b')).toBe(20);
  });

  it('keeps a field another editor changed at the same time', () => {
    const a = new Y.Doc();
    writeSurfaceDoc(a, makeSurface('s', [makeShape('box', 10, 10)]));
    const b = new Y.Doc();
    Y.applyUpdate(b, Y.encodeStateAsUpdate(a));

    writeSurfaceChange(a, {
      background: null, extent: null, masterId: null, masterOverrides: {},
      removedIds: [], patches: { box: { x: W + 10 } }, added: [makeShape('new', 0, 0)],
    });
    patchElement(b, 'box', { width: 300 });
    Y.applyUpdate(b, Y.encodeStateAsUpdate(a, Y.encodeStateVector(b)));
    Y.applyUpdate(a, Y.encodeStateAsUpdate(b, Y.encodeStateVector(a)));

    const merged = readSurfaceDoc(a);
    expect(merged).toEqual(readSurfaceDoc(b));
    expect(merged.elements['box']).toMatchObject({ x: W + 10, width: 300 });
    expect(Object.keys(merged.elements).sort()).toEqual(['box', 'new']);
  });
});
