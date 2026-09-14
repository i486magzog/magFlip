import { describe, expect, it } from 'vitest';
import * as Y from 'yjs';
import { createOrderBetween } from '../src/common/order';
import { moveSurface, readBookDoc, writeBookDoc, writeSurfaceRef } from '../src/collab/bookYDoc';
import { getTextFragment, patchElement, readSurfaceDoc, removeElement, writeElement, writeSurfaceDoc } from '../src/collab/surfaceYDoc';
import { computeBookLayout } from '../src/layout/bookLayout';
import { createElement } from '../src/model/defaults';
import { ElementType, IShapeElement } from '../src/model/element';
import { SurfaceKind } from '../src/model/surface';
import { TextAlign, TextBlockType, TextFieldKind } from '../src/model/text';
import { getPlainText } from '../src/text/textContent';
import { makeBook, makeShape, makeSurface } from './helpers';

/**
 * Two editors of the same room that start from the same state.
 */
function connect(write: (ydoc: Y.Doc) => void): { a: Y.Doc, b: Y.Doc, sync: () => void } {
  const a = new Y.Doc();
  const b = new Y.Doc();
  write(a);
  Y.applyUpdate(b, Y.encodeStateAsUpdate(a));

  const sync = () => {
    const updateA = Y.encodeStateAsUpdate(a, Y.encodeStateVector(b));
    const updateB = Y.encodeStateAsUpdate(b, Y.encodeStateVector(a));
    Y.applyUpdate(b, updateA);
    Y.applyUpdate(a, updateB);
  };
  return { a, b, sync };
}

/**
 * The `Y.XmlText` of the first paragraph of a text element, which a rich text
 * editor binds to.
 */
function getParagraphText(ydoc: Y.Doc, elementId: string): Y.XmlText {
  const paragraph = getTextFragment(ydoc, elementId)?.get(0) as Y.XmlElement;
  return paragraph.get(0) as Y.XmlText;
}

/**
 * The text of a text element, read back through the document model.
 */
function readPlainText(ydoc: Y.Doc, elementId: string): string {
  const element = readSurfaceDoc(ydoc).elements[elementId];
  return element?.type === ElementType.Text ? getPlainText(element.content) : '';
}

describe('surface room', () => {
  it('reads back what it wrote', () => {
    const surface = makeSurface('s0', [makeShape('box', 10, 20, 30, 40)], {
      background: null,
      extent: { rect: { x: -100, y: 0, width: 800, height: 900 }, isViewerVisible: true },
      masterId: 'm',
      masterOverrides: { mark: { isHidden: true } },
    });
    const ydoc = new Y.Doc();
    writeSurfaceDoc(ydoc, surface);

    expect(readSurfaceDoc(ydoc)).toEqual(surface);
  });

  it('reads back rich text with its marks and fields', () => {
    const text = createElement(ElementType.Text, {
      id: 't',
      content: {
        blocks: [{
          type: TextBlockType.Paragraph,
          align: TextAlign.Center,
          inlines: [
            { text: 'Chapter ', marks: { isItalic: true, color: '#112233' } },
            { field: TextFieldKind.PageNumber },
            { text: ' end' },
          ],
        }],
      },
    });
    const ydoc = new Y.Doc();
    writeSurfaceDoc(ydoc, makeSurface('s0', [text]));

    expect(readSurfaceDoc(ydoc).elements['t']).toEqual(text);
  });

  it('keeps both changes when one editor moves an element and another resizes it', () => {
    const { a, b, sync } = connect(ydoc => writeSurfaceDoc(ydoc, makeSurface('s0', [makeShape('box', 0, 0, 100, 100)])));

    patchElement(a, 'box', { x: 250 } as Partial<IShapeElement>);
    patchElement(b, 'box', { width: 400 } as Partial<IShapeElement>);
    sync();

    const box = readSurfaceDoc(a).elements['box'] as IShapeElement;
    expect({ x: box.x, width: box.width }).toEqual({ x: 250, width: 400 });
    expect(readSurfaceDoc(b).elements['box']).toEqual(box);
  });

  it('keeps an element added while another one was deleted', () => {
    const { a, b, sync } = connect(ydoc => writeSurfaceDoc(ydoc, makeSurface('s0', [makeShape('old', 0, 0)])));

    writeElement(a, makeShape('new', 10, 10));
    removeElement(b, 'old');
    sync();

    expect(Object.keys(readSurfaceDoc(a).elements)).toEqual(['new']);
    expect(readSurfaceDoc(b).elements).toEqual(readSurfaceDoc(a).elements);
  });

  it('keeps what both editors typed in the same paragraph', () => {
    const text = createElement(ElementType.Text, {
      id: 't',
      content: { blocks: [{ type: TextBlockType.Paragraph, align: TextAlign.Start, inlines: [{ text: 'Hello' }] }] },
    });
    const { a, b, sync } = connect(ydoc => writeSurfaceDoc(ydoc, makeSurface('s0', [text])));

    // Both type at the end of the paragraph, as two people in the same text box would.
    getParagraphText(a, 't').insert(5, ' from A');
    getParagraphText(b, 't').insert(5, ' from B');
    sync();

    const merged = readPlainText(a, 't');
    expect(merged).toContain('from A');
    expect(merged).toContain('from B');
    expect(readPlainText(b, 't')).toBe(merged);
  });
});

describe('book room', () => {
  it('reads back what it wrote', () => {
    const book = makeBook([SurfaceKind.Single, SurfaceKind.Spread]);
    const ydoc = new Y.Doc();
    writeBookDoc(ydoc, book);

    expect(readBookDoc(ydoc)).toEqual(book);
  });

  it('keeps every page when two editors reorder different pages', () => {
    const book = makeBook([SurfaceKind.Single, SurfaceKind.Single, SurfaceKind.Single]);
    const { a, b, sync } = connect(ydoc => writeBookDoc(ydoc, book));
    const orders = Object.values(book.surfaces).map(ref => ref.order).sort();

    // A moves the last page to the front, B moves the first page to the end.
    moveSurface(a, 's2', createOrderBetween(null, orders[0] as string));
    moveSurface(b, 's0', createOrderBetween(orders[2] as string, null));
    sync();

    const pages = computeBookLayout(readBookDoc(a)).pages.map(page => page.surfaceId);
    expect(pages).toEqual(['s2', 's1', 's0']);
    expect(computeBookLayout(readBookDoc(b)).pages.map(page => page.surfaceId)).toEqual(pages);
  });

  it('keeps both pages when two editors insert at the same place', () => {
    const book = makeBook([SurfaceKind.Single]);
    const { a, b, sync } = connect(ydoc => writeBookDoc(ydoc, book));
    const order = createOrderBetween(book.surfaces['s0']!.order, null);

    writeSurfaceRef(a, { id: 'fromA', kind: SurfaceKind.Single, order, name: '' });
    writeSurfaceRef(b, { id: 'fromB', kind: SurfaceKind.Single, order, name: '' });
    sync();

    // Same order key: the id decides, and no page is lost.
    expect(computeBookLayout(readBookDoc(a)).pages.map(page => page.surfaceId)).toEqual(['s0', 'fromA', 'fromB']);
    expect(computeBookLayout(readBookDoc(b)).pages.map(page => page.surfaceId)).toEqual(['s0', 'fromA', 'fromB']);
  });
});
