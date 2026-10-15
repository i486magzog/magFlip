import { describe, expect, it } from 'vitest';
import { IAsset, AssetKind } from '../src/model/asset';
import { PageSide } from '../src/model/book';
import { createElement } from '../src/model/defaults';
import { ElementType, IWidgetElement } from '../src/model/element';
import { hasError, ProblemCode } from '../src/model/problem';
import { IPublishedNode } from '../src/model/published';
import { SurfaceKind } from '../src/model/surface';
import { TextAlign, TextBlockType, TextFieldKind } from '../src/model/text';
import { getDefaultWidgetProps, IWidgetDefinition, validateWidgetProps, WidgetFieldKind } from '../src/model/widget';
import { computeBookLayout } from '../src/layout/bookLayout';
import { publishBookBundle } from '../src/publish/publishBook';
import { createSurfaceTextContext, resolveSurfaceNodes } from '../src/publish/resolveNodes';
import { getPlainText } from '../src/text/textContent';
import { makeBook, makeBundle, makeShape, makeSurface, PAGE_SIZE } from './helpers';

const { Single, Spread } = SurfaceKind;

const image: IAsset = { id: 'a1', kind: AssetKind.Image, mimeType: 'image/webp', byteSize: 1024, width: 1200, height: 900 };
const publishOptions = {
  assets: { a1: image },
  resolveAssetUrl: (asset: IAsset) => `https://cdn.test/${asset.id}.webp`,
  resolveFontUrl: () => 'https://cdn.test/font.woff2',
  version: 3,
  publishedAt: '2026-01-02T03:04:05.000Z',
};

function makeImage(id: string, x: number, width: number, init: Record<string, unknown> = {}) {
  return createElement(ElementType.Image, { id, assetId: 'a1', x, y: 0, width, height: 400, order: 'a0', ...init } as never);
}

function makePageNumber(id: string, x: number) {
  return createElement(ElementType.Text, {
    id,
    x,
    y: 800,
    width: 100,
    height: 40,
    order: 'a1',
    content: { blocks: [{ type: TextBlockType.Paragraph, align: TextAlign.Start, inlines: [{ field: TextFieldKind.PageNumber }] }] },
  } as never);
}

function idsOf(nodes: IPublishedNode[]): string[] {
  return nodes.map(node => node.id);
}

describe('publishBookBundle', () => {
  it('keeps one image that covers both pages of a spread', () => {
    const book = makeBook([Single, Spread, Single]);
    const bundle = makeBundle(book, [
      makeSurface('s0'),
      makeSurface('s1', [makeImage('cover', 0, PAGE_SIZE.width * 2)]),
      makeSurface('s2'),
    ]);

    const result = publishBookBundle(bundle, publishOptions);

    expect(hasError(result.problems)).toBe(false);
    const nodes = result.surfaces['s1']?.nodes ?? [];
    expect(idsOf(nodes)).toEqual(['cover']);
    expect(nodes[0]?.type === ElementType.Image && nodes[0].width).toBe(PAGE_SIZE.width * 2);
    // The two pages of the spread are windows into the same surface.
    expect(result.book?.pages.slice(1, 3)).toEqual([
      { index: 1, surfaceId: 's1', surfaceX: 0, side: PageSide.Left, number: 2 },
      { index: 2, surfaceId: 's1', surfaceX: PAGE_SIZE.width, side: PageSide.Right, number: 3 },
    ]);
  });

  it('removes the extra content of a page the reader may not expand', () => {
    const extent = { rect: { x: 0, y: 0, width: PAGE_SIZE.width * 2, height: PAGE_SIZE.height }, isViewerVisible: false };
    const bundle = makeBundle(makeBook([Single]), [makeSurface('s0', [
      makeImage('onPage', 10, 200),
      makeImage('expanded', PAGE_SIZE.width + 10, 200),
    ], { extent })]);

    const surface = publishBookBundle(bundle, publishOptions).surfaces['s0'];

    // The hidden half is gone from the file, not just hidden with CSS.
    expect(idsOf(surface?.nodes ?? [])).toEqual(['onPage']);
    expect(JSON.stringify(surface)).not.toContain('expanded');
    expect(surface?.visibleRect).toEqual({ x: 0, y: 0, ...PAGE_SIZE });
    expect(surface?.isExpandable).toBe(false);
  });

  it('keeps the extra content when the page may be expanded', () => {
    const extent = { rect: { x: 0, y: 0, width: PAGE_SIZE.width * 2, height: PAGE_SIZE.height }, isViewerVisible: true };
    const bundle = makeBundle(makeBook([Single]), [makeSurface('s0', [
      makeImage('onPage', 10, 200),
      makeImage('expanded', PAGE_SIZE.width + 10, 200),
    ], { extent })]);

    const surface = publishBookBundle(bundle, publishOptions).surfaces['s0'];

    // Both elements share an order key, so the id decides the z-order.
    expect(idsOf(surface?.nodes ?? [])).toEqual(['expanded', 'onPage']);
    expect(surface?.visibleRect).toEqual(extent.rect);
    expect(surface?.isExpandable).toBe(true);
  });

  it('never publishes the pasteboard', () => {
    const extent = { rect: { x: 0, y: 0, width: PAGE_SIZE.width * 2, height: PAGE_SIZE.height }, isViewerVisible: true };
    const bundle = makeBundle(makeBook([Single]), [makeSurface('s0', [
      makeImage('onPage', 10, 200),
      makeImage('scratch', PAGE_SIZE.width * 2 + 50, 200),
    ], { extent })]);

    expect(idsOf(publishBookBundle(bundle, publishOptions).surfaces['s0']?.nodes ?? [])).toEqual(['onPage']);
  });

  it('keeps an element that only reaches into the page', () => {
    const bundle = makeBundle(makeBook([Single]), [makeSurface('s0', [makeImage('half', PAGE_SIZE.width - 50, 200)])]);

    expect(idsOf(publishBookBundle(bundle, publishOptions).surfaces['s0']?.nodes ?? [])).toEqual(['half']);
  });

  it('drops hidden elements', () => {
    const bundle = makeBundle(makeBook([Single]), [makeSurface('s0', [
      makeImage('shown', 10, 200),
      makeImage('draft', 10, 200, { id: 'draft', isHidden: true }),
    ])]);

    expect(idsOf(publishBookBundle(bundle, publishOptions).surfaces['s0']?.nodes ?? [])).toEqual(['shown']);
  });

  it('drops an element whose asset is gone and reports it as an error', () => {
    const bundle = makeBundle(makeBook([Single]), [makeSurface('s0', [makeImage('broken', 10, 200, { assetId: 'missing' })])]);

    const result = publishBookBundle(bundle, publishOptions);

    expect(idsOf(result.surfaces['s0']?.nodes ?? [])).toEqual([]);
    expect(result.problems.map(problem => problem.code)).toContain(ProblemCode.MissingAsset);
    expect(hasError(result.problems)).toBe(true);
  });

  it('lists the assets the surface uses with their URL', () => {
    const bundle = makeBundle(makeBook([Single]), [makeSurface('s0', [makeImage('photo', 10, 200)])]);

    expect(publishBookBundle(bundle, publishOptions).surfaces['s0']?.assets).toEqual({
      a1: { ...image, url: 'https://cdn.test/a1.webp' },
    });
  });

  it('fills in the page number of the page an element sits on', () => {
    const book = makeBook([Single, Spread]);
    const bundle = makeBundle(book, [
      makeSurface('s0'),
      makeSurface('s1', [makePageNumber('left', 20), makePageNumber('right', PAGE_SIZE.width + 20)]),
    ]);

    const nodes = publishBookBundle(bundle, publishOptions).surfaces['s1']?.nodes ?? [];

    expect(nodes.map(node => (node.type === ElementType.Text ? getPlainText(node.content) : ''))).toEqual(['2', '3']);
  });

  it('drops the fields only the editor needs', () => {
    const bundle = makeBundle(makeBook([Single]), [makeSurface('s0', [makeImage('photo', 10, 200, { name: 'Cover photo' })])]);

    const node = publishBookBundle(bundle, publishOptions).surfaces['s0']?.nodes[0] as Record<string, unknown>;

    for (const field of ['parentId', 'order', 'name', 'isHidden', 'isLocked']) {
      expect(node).not.toHaveProperty(field);
    }
    expect(node['isFromMaster']).toBe(false);
  });

  it('puts the master layer under the elements of the page', () => {
    const book = makeBook([Single]);
    book.masters['m'] = { id: 'm', kind: Single, name: 'Base' };
    const bundle = makeBundle(book, [
      makeSurface('s0', [makeShape('own', 10, 10)], { masterId: 'm' }),
      makeSurface('m', [makeShape('fromMaster', 0, 0)]),
    ]);

    const nodes = publishBookBundle(bundle, publishOptions).surfaces['s0']?.nodes ?? [];

    expect(idsOf(nodes)).toEqual(['master:fromMaster', 'own']);
    expect(nodes.map(node => node.isFromMaster)).toEqual([true, false]);
  });

  it('writes a manifest the viewer can read', () => {
    const bundle = makeBundle(makeBook([Single, Spread]), [makeSurface('s0'), makeSurface('s1')]);

    const published = publishBookBundle(bundle, publishOptions).book;

    expect(published?.version).toBe(3);
    expect(published?.publishedAt).toBe('2026-01-02T03:04:05.000Z');
    expect(published?.pageCount).toBe(3);
    expect(published?.surfaces['s1']).toEqual({ id: 's1', kind: Spread, isExpandable: false });
  });
});

describe('resolveSurfaceNodes', () => {
  it('keeps the pasteboard for the editor canvas', () => {
    const book = makeBook([Single]);
    const surface = makeSurface('s0', [makeImage('onPage', 10, 200), makeImage('scratch', 2000, 200)]);
    const layout = computeBookLayout(book);

    const result = resolveSurfaceNodes({
      surface,
      kind: Single,
      pageSize: PAGE_SIZE,
      textContext: createSurfaceTextContext(book, layout, 's0'),
    });

    expect(idsOf(result.nodes)).toEqual(['onPage', 'scratch']);
  });
});

describe('widgets', () => {
  function resolveWidget(widgetType: string, resolveWidgetUrl?: (element: IWidgetElement) => string | undefined) {
    const book = makeBook([Single]);
    const widget = createElement(ElementType.Widget, { id: 'w', widgetType, widgetVersion: 2, x: 0, y: 0, width: 100, height: 100, order: 'a0' });
    return resolveSurfaceNodes({
      surface: makeSurface('s0', [widget]),
      kind: Single,
      pageSize: PAGE_SIZE,
      textContext: createSurfaceTextContext(book, computeBookLayout(book), 's0'),
    }, resolveWidgetUrl ? { resolveWidgetUrl } : {});
  }

  it('writes the address of the widget page into the published widget', () => {
    const result = resolveWidget('magflip.quiz', element => `https://widgets.test/${element.widgetType}/${element.widgetVersion}`);

    expect(result.nodes[0]).toMatchObject({ type: ElementType.Widget, url: 'https://widgets.test/magflip.quiz/2' });
    expect(result.problems).toEqual([]);
  });

  it('keeps a widget nobody offers as an empty box, and says so', () => {
    const result = resolveWidget('someone.gone', () => undefined);

    expect(result.nodes[0]).toMatchObject({ url: null });
    expect(result.problems.map(problem => [problem.code, problem.severity])).toEqual([[ProblemCode.UnknownWidget, 'warning']]);
  });

  it('leaves the address out when nothing resolves it', () => {
    expect(resolveWidget('magflip.quiz').nodes[0]).not.toHaveProperty('url');
  });
});

describe('widget settings', () => {
  const definition: IWidgetDefinition = {
    type: 'magflip.quiz',
    version: 1,
    name: 'Quiz',
    description: '',
    defaultSize: { width: 300, height: 200 },
    fields: [
      { kind: WidgetFieldKind.Text, key: 'question', label: 'Question', defaultValue: 'Why?', maxLength: 10 },
      { kind: WidgetFieldKind.Lines, key: 'choices', label: 'Choices', defaultValue: ['A', 'B'], maxItems: 3 },
      { kind: WidgetFieldKind.Number, key: 'answer', label: 'Answer', defaultValue: 1, min: 1, isInteger: true },
      { kind: WidgetFieldKind.Color, key: 'color', label: 'Color', defaultValue: '#1f2937' },
    ],
  };

  it('starts from the defaults, as copies', () => {
    const props = getDefaultWidgetProps(definition);

    expect(props).toEqual({ question: 'Why?', choices: ['A', 'B'], answer: 1, color: '#1f2937' });
    expect(props['choices']).not.toBe(definition.fields[1]?.defaultValue);
  });

  it('accepts what fits and props it does not know', () => {
    expect(validateWidgetProps(definition, { ...getDefaultWidgetProps(definition), legacy: true })).toEqual([]);
  });

  it('says which props do not fit', () => {
    const errors = validateWidgetProps(definition, {
      question: 'Far too long a question',
      choices: ['A', 'B', 'C', 'D'],
      answer: 1.5,
      color: 'red',
    });

    expect(errors).toHaveLength(4);
    expect(errors[0]).toContain('"question"');
  });
});
