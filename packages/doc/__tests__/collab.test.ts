import { describe, expect, it } from 'vitest';
import * as Y from 'yjs';
import { DOC_LIMITS } from '../src/common/constants';
import { createOrderBetween } from '../src/common/order';
import { moveSurface, readBookDoc, writeBookDoc, writeSurfaceRef } from '../src/collab/bookYDoc';
import { getTextFragment, patchElement, readSurfaceDoc, removeElement, setSurfaceSetting, writeElement, writeSurfaceDoc } from '../src/collab/surfaceYDoc';
import { LIST_KIND_ATTRIBUTE, LIST_LEVEL_ATTRIBUTE, toMarkAttributes, toTextList, toTextMarks } from '../src/collab/textYXml';
import { computeBookLayout } from '../src/layout/bookLayout';
import { createElement } from '../src/model/defaults';
import { ElementType, IShapeElement, ITextElement } from '../src/model/element';
import { LinkKind } from '../src/model/link';
import { SurfaceKind } from '../src/model/surface';
import { ListKind, TextAlign, TextBlockType, TextFieldKind } from '../src/model/text';
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

  it('removes an optional field that was patched away', () => {
    const link = { kind: LinkKind.Url as const, href: 'https://magzog.com', isNewTab: false };
    const ydoc = new Y.Doc();
    writeSurfaceDoc(ydoc, makeSurface('s0', [makeShape('box', 0, 0, 10, 10, { link })]));

    patchElement(ydoc, 'box', { link: undefined });

    expect(readSurfaceDoc(ydoc).elements['box']).not.toHaveProperty('link');
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

describe('surface settings', () => {
  it('writes one field without touching the others', () => {
    const doc = new Y.Doc();
    writeSurfaceDoc(doc, makeSurface('s0', [createElement(ElementType.Shape, { id: 'a' })]));

    setSurfaceSetting(doc, 'extent', { rect: { x: 0, y: 0, width: 1200, height: 900 }, isViewerVisible: true });
    setSurfaceSetting(doc, 'masterId', 'm0');

    const read = readSurfaceDoc(doc);
    expect(read.extent).toEqual({ rect: { x: 0, y: 0, width: 1200, height: 900 }, isViewerVisible: true });
    expect(read.masterId).toBe('m0');
    expect(Object.keys(read.elements)).toEqual(['a']);
  });

  it('keeps both changes when two editors set different fields', () => {
    const one = new Y.Doc();
    writeSurfaceDoc(one, makeSurface('s0'));
    const two = new Y.Doc();
    Y.applyUpdate(two, Y.encodeStateAsUpdate(one));

    setSurfaceSetting(one, 'extent', { rect: { x: 0, y: 0, width: 1200, height: 900 }, isViewerVisible: false });
    setSurfaceSetting(two, 'masterId', 'm0');
    Y.applyUpdate(one, Y.encodeStateAsUpdate(two));

    expect(readSurfaceDoc(one).extent?.rect.width).toBe(1200);
    expect(readSurfaceDoc(one).masterId).toBe('m0');
  });
});

describe('rich text marks', () => {
  /** The content a text element starts from, with a mark on part of a line. */
  const content = {
    blocks: [{
      type: TextBlockType.Paragraph,
      align: TextAlign.Start,
      inlines: [
        { text: 'plain ' },
        { text: 'bold red', marks: { fontWeight: 700, color: '#ff0000', isItalic: true } },
        { field: TextFieldKind.PageNumber, marks: { fontSize: 9 } },
      ],
    }],
  };

  it('keeps every mark through a round trip', () => {
    const doc = new Y.Doc();
    writeSurfaceDoc(doc, makeSurface('s0', [createElement(ElementType.Text, { id: 't', content })]));

    const read = readSurfaceDoc(doc).elements['t'] as ITextElement;

    expect(read.content).toEqual(content);
  });

  it('stores a mark as its own attribute, the way an editor bound to it does', () => {
    const doc = new Y.Doc();
    writeSurfaceDoc(doc, makeSurface('s0', [createElement(ElementType.Text, { id: 't', content })]));

    const fragment = getTextFragment(doc, 't');
    const paragraph = fragment?.toArray()[0] as Y.XmlElement;
    const text = paragraph.toArray()[0] as Y.XmlText;
    const delta = text.toDelta() as { insert: string, attributes?: Record<string, unknown> }[];

    expect(delta[0]).toEqual({ insert: 'plain ' });
    expect(delta[1]).toEqual({
      insert: 'bold red',
      // A value under `value`, and a flag as an empty object.
      attributes: { fontWeight: { value: 700 }, isItalic: {}, color: { value: '#ff0000' } },
    });
    // The field keeps its own attribute beside its marks.
    const field = paragraph.toArray()[1] as Y.XmlElement;
    expect(field.getAttributes()).toEqual({ field: 'pageNumber', fontSize: { value: 9 } });
  });

  it('turns marks into attributes and back', () => {
    const marks = { fontWeight: 700, isItalic: true, isUnderlined: false, color: '#112233' };

    const attributes = toMarkAttributes(marks);

    expect(attributes).toEqual({ fontWeight: { value: 700 }, isItalic: {}, color: { value: '#112233' } });
    // A flag that is off is not a mark, so it does not come back as false.
    expect(toTextMarks(attributes)).toEqual({ fontWeight: 700, isItalic: true, color: '#112233' });
  });

  it('ignores attributes that are not marks', () => {
    expect(toTextMarks({ field: 'pageNumber', align: 'center' })).toBeUndefined();
  });

  it('keeps a list through a round trip, as two plain attributes', () => {
    const list = {
      blocks: [
        { type: TextBlockType.Paragraph, align: TextAlign.Start, list: { kind: ListKind.Ordered, level: 1 }, inlines: [{ text: 'item' }] },
        { type: TextBlockType.Paragraph, align: TextAlign.Start, inlines: [{ text: 'after' }] },
      ],
    };
    const doc = new Y.Doc();
    writeSurfaceDoc(doc, makeSurface('s0', [createElement(ElementType.Text, { id: 't', content: list })]));

    const [item, after] = getTextFragment(doc, 't')?.toArray() as Y.XmlElement[];

    expect(item?.getAttributes()).toEqual({ align: 'start', listKind: 'ordered', listLevel: 1 });
    expect(after?.getAttributes()).toEqual({ align: 'start' });
    expect((readSurfaceDoc(doc).elements['t'] as ITextElement).content).toEqual(list);
  });

  it('reads a list attribute that is out of range without losing the item', () => {
    expect(toTextList('bullet', 40)).toEqual({ kind: ListKind.Bullet, level: DOC_LIMITS.maxListLevel });
    expect(toTextList('bullet', undefined)).toEqual({ kind: ListKind.Bullet, level: 0 });
    expect(toTextList('checkbox', 0)).toBeUndefined();
  });

  it('keeps what one editor types while another turns the paragraph into a list item', () => {
    const { a, b, sync } = connect(ydoc => writeSurfaceDoc(ydoc, makeSurface('s0', [
      createElement(ElementType.Text, {
        id: 't',
        content: { blocks: [{ type: TextBlockType.Paragraph, align: TextAlign.Start, inlines: [{ text: 'milk' }] }] },
      }),
    ])));

    const paragraphOf = (doc: Y.Doc) => getTextFragment(doc, 't')?.toArray()[0] as Y.XmlElement;
    paragraphOf(a).setAttribute(LIST_KIND_ATTRIBUTE, ListKind.Bullet);
    paragraphOf(a).setAttribute(LIST_LEVEL_ATTRIBUTE, 0 as never);
    (paragraphOf(b).toArray()[0] as Y.XmlText).insert(4, ' and eggs');
    sync();

    // The paragraph was never replaced, so neither change is lost.
    expect((readSurfaceDoc(b).elements['t'] as ITextElement).content.blocks).toEqual([{
      type: TextBlockType.Paragraph,
      align: TextAlign.Start,
      list: { kind: ListKind.Bullet, level: 0 },
      inlines: [{ text: 'milk and eggs' }],
    }]);
  });

  it('lets two editors mark different words of one paragraph', () => {
    const { a, b, sync } = connect(ydoc => writeSurfaceDoc(ydoc, makeSurface('s0', [
      createElement(ElementType.Text, {
        id: 't',
        content: { blocks: [{ type: TextBlockType.Paragraph, align: TextAlign.Start, inlines: [{ text: 'one two' }] }] },
      }),
    ])));

    // Both write straight into the fragment, as a bound editor does.
    const textOf = (doc: Y.Doc) => ((getTextFragment(doc, 't')?.toArray()[0] as Y.XmlElement).toArray()[0] as Y.XmlText);
    textOf(a).format(0, 3, toMarkAttributes({ fontWeight: 700 }));
    textOf(b).format(4, 3, toMarkAttributes({ isItalic: true }));
    sync();

    const inlines = (readSurfaceDoc(a).elements['t'] as ITextElement).content.blocks[0]?.inlines;
    expect(inlines).toEqual([
      { text: 'one', marks: { fontWeight: 700 } },
      { text: ' ' },
      { text: 'two', marks: { isItalic: true } },
    ]);
  });
});
