import { describe, expect, it } from 'vitest';
import { createElement } from '../src/model/defaults';
import { ElementType } from '../src/model/element';
import { LinkKind } from '../src/model/link';
import { hasError, ProblemCode } from '../src/model/problem';
import { SurfaceKind } from '../src/model/surface';
import { validateBookBundle } from '../src/validate/validateBook';
import { makeBook, makeBundle, makeShape, makeSurface, PAGE_SIZE } from './helpers';

const { Single, Spread } = SurfaceKind;

function codesOf(bundleProblems: ReturnType<typeof validateBookBundle>): ProblemCode[] {
  return bundleProblems.map(problem => problem.code);
}

describe('validateBookBundle', () => {
  it('accepts a plain book', () => {
    const bundle = makeBundle(makeBook([Single, Spread]), [makeSurface('s0'), makeSurface('s1')]);

    expect(validateBookBundle(bundle)).toEqual([]);
  });

  it('reports a surface that has no document', () => {
    const bundle = makeBundle(makeBook([Single, Single]), [makeSurface('s0')]);

    expect(codesOf(validateBookBundle(bundle))).toEqual([ProblemCode.MissingSurface]);
  });

  it('reports a document that the book does not list', () => {
    const bundle = makeBundle(makeBook([Single]), [makeSurface('s0'), makeSurface('left-over')]);

    expect(codesOf(validateBookBundle(bundle))).toEqual([ProblemCode.OrphanSurface]);
  });

  it('reports a spread that no longer starts on a left page', () => {
    const bundle = makeBundle(makeBook([Single, Single, Spread]), [
      makeSurface('s0'), makeSurface('s1'), makeSurface('s2'),
    ]);

    expect(codesOf(validateBookBundle(bundle))).toEqual([ProblemCode.SpreadMisaligned]);
  });

  it('reports a master that does not exist', () => {
    const bundle = makeBundle(makeBook([Single]), [makeSurface('s0', [], { masterId: 'gone' })]);

    expect(codesOf(validateBookBundle(bundle))).toEqual([ProblemCode.MissingMaster]);
  });

  it('refuses a master that uses another master', () => {
    const book = makeBook([Single]);
    book.masters['m'] = { id: 'm', kind: Single, name: 'Base' };
    book.masters['m2'] = { id: 'm2', kind: Single, name: 'On top' };
    const bundle = makeBundle(book, [makeSurface('s0'), makeSurface('m'), makeSurface('m2', [], { masterId: 'm' })]);

    const problems = validateBookBundle(bundle);
    expect(codesOf(problems)).toEqual([ProblemCode.NestedMaster]);
    expect(hasError(problems)).toBe(true);
  });

  it('warns when the extent does not cover the pages', () => {
    const extent = { rect: { x: 100, y: 0, width: 200, height: 200 }, isViewerVisible: true };
    const bundle = makeBundle(makeBook([Single]), [makeSurface('s0', [], { extent })]);

    const problems = validateBookBundle(bundle);
    expect(codesOf(problems)).toEqual([ProblemCode.ExtentExcludesTrim]);
    expect(hasError(problems)).toBe(false);
  });

  it('warns about a link to a page that was deleted', () => {
    const link = { kind: LinkKind.Page as const, surfaceId: 'gone', surfaceX: 0 };
    const bundle = makeBundle(makeBook([Single]), [makeSurface('s0', [makeShape('hotspot', 0, 0, 50, 50, { link })])]);

    expect(codesOf(validateBookBundle(bundle))).toEqual([ProblemCode.BrokenPageLink]);
  });

  it('warns about a font family the book does not define', () => {
    const text = createElement(ElementType.Text, { id: 't', style: { ...createElement(ElementType.Text).style, fontFamily: 'Pretendard' } });
    const bundle = makeBundle(makeBook([Single]), [makeSurface('s0', [text])]);

    expect(codesOf(validateBookBundle(bundle))).toEqual([ProblemCode.UnknownFontFamily]);
  });

  it('accepts the font families every browser has', () => {
    const bundle = makeBundle(makeBook([Single]), [makeSurface('s0', [createElement(ElementType.Text, { id: 't' })])]);

    expect(validateBookBundle(bundle)).toEqual([]);
  });

  it('reports an element stored under the wrong key', () => {
    const surface = makeSurface('s0');
    surface.elements['wrong-key'] = makeShape('box', 0, 0);
    const bundle = makeBundle(makeBook([Single]), [surface]);

    expect(codesOf(validateBookBundle(bundle))).toEqual([ProblemCode.KeyIdMismatch]);
  });

  it('reports a value the schema refuses', () => {
    const bundle = makeBundle(makeBook([Single]), [makeSurface('s0', [makeShape('box', 0, 0, 50, 50, { opacity: 42 })])]);

    const problems = validateBookBundle(bundle);
    expect(codesOf(problems)).toEqual([ProblemCode.InvalidSchema]);
    expect(problems[0]?.path).toContain('opacity');
  });

  it('refuses a link that is not http, https, mailto or tel', () => {
    const link = { kind: LinkKind.Url as const, href: 'javascript:alert(1)', isNewTab: false };
    const bundle = makeBundle(makeBook([Single]), [makeSurface('s0', [makeShape('trap', 0, 0, 50, 50, { link })])]);

    expect(codesOf(validateBookBundle(bundle))).toEqual([ProblemCode.InvalidSchema]);
  });

  it('checks the pages of a spread against the page size of the book', () => {
    const link = { kind: LinkKind.Page as const, surfaceId: 's1', surfaceX: PAGE_SIZE.width / 2 };
    const bundle = makeBundle(makeBook([Single, Spread]), [
      makeSurface('s0', [makeShape('hotspot', 0, 0, 50, 50, { link })]),
      makeSurface('s1'),
    ]);

    expect(codesOf(validateBookBundle(bundle))).toEqual([ProblemCode.BrokenPageLink]);
  });
});
