import { describe, expect, it } from 'vitest';
import { canSpreadStartAt, computeBookLayout, getFacingPageIndex, getPageSide } from '../src/layout/bookLayout';
import { PageSide, ReadingDirection } from '../src/model/book';
import { hasError, ProblemCode } from '../src/model/problem';
import { SurfaceKind } from '../src/model/surface';
import { makeBook, PAGE_SIZE } from './helpers';

const { Single, Spread } = SurfaceKind;

describe('getPageSide', () => {
  it('puts the cover alone on the right of a left-to-right book', () => {
    expect(getPageSide(0, ReadingDirection.LeftToRight)).toBe(PageSide.Right);
    expect(getPageSide(1, ReadingDirection.LeftToRight)).toBe(PageSide.Left);
    expect(getPageSide(2, ReadingDirection.LeftToRight)).toBe(PageSide.Right);
  });

  it('mirrors a right-to-left book', () => {
    expect(getPageSide(0, ReadingDirection.RightToLeft)).toBe(PageSide.Left);
    expect(getPageSide(1, ReadingDirection.RightToLeft)).toBe(PageSide.Right);
  });
});

describe('getFacingPageIndex', () => {
  it('leaves the cover alone', () => {
    expect(getFacingPageIndex(0, 10)).toBeNull();
  });

  it('pairs (1, 2) and (3, 4)', () => {
    expect(getFacingPageIndex(1, 10)).toBe(2);
    expect(getFacingPageIndex(2, 10)).toBe(1);
    expect(getFacingPageIndex(3, 10)).toBe(4);
  });

  it('leaves the last page alone when it has no facing page', () => {
    expect(getFacingPageIndex(3, 4)).toBeNull();
  });
});

describe('computeBookLayout', () => {
  it('numbers the pages of single and spread surfaces in order', () => {
    const layout = computeBookLayout(makeBook([Single, Spread, Single]));

    expect(layout.pages.map(page => page.index)).toEqual([0, 1, 2, 3]);
    expect(layout.pages.map(page => page.surfaceId)).toEqual(['s0', 's1', 's1', 's2']);
    expect(layout.lastPageIndex).toBe(3);
    expect(layout.problems).toEqual([]);
  });

  it('places the two pages of a spread left and right', () => {
    const layout = computeBookLayout(makeBook([Single, Spread]));
    const spreadPages = layout.surfacePages.get('s1');

    expect(spreadPages?.map(page => page.side)).toEqual([PageSide.Left, PageSide.Right]);
    expect(spreadPages?.map(page => page.surfaceX)).toEqual([0, PAGE_SIZE.width]);
  });

  it('mirrors the pages of a spread in a right-to-left book', () => {
    const book = makeBook([Single, Spread], { readingDirection: ReadingDirection.RightToLeft });
    const spreadPages = computeBookLayout(book).surfacePages.get('s1');

    // Page 1 is read first and sits on the right, so it is the second half of the surface.
    expect(spreadPages?.map(page => page.side)).toEqual([PageSide.Right, PageSide.Left]);
    expect(spreadPages?.map(page => page.surfaceX)).toEqual([PAGE_SIZE.width, 0]);
  });

  it('reports a spread that a page insertion pushed onto the wrong side', () => {
    // Two single pages before the spread make it start at page 2, a right page.
    const layout = computeBookLayout(makeBook([Single, Single, Spread]));

    expect(canSpreadStartAt(2)).toBe(false);
    expect(layout.problems.map(problem => problem.code)).toEqual([ProblemCode.SpreadMisaligned]);
    expect(hasError(layout.problems)).toBe(true);
    expect(layout.problems[0]?.pageIndex).toBe(2);
  });

  it('follows the order keys, not the insertion order of the record', () => {
    const book = makeBook([Single, Single, Single]);
    // Move the last surface in front of the first one.
    book.surfaces['s2'] = { ...book.surfaces['s2']!, order: 'Zz' };

    expect(computeBookLayout(book).pages.map(page => page.surfaceId)).toEqual(['s2', 's0', 's1']);
  });

  it('starts the page numbers where the book says', () => {
    const book = makeBook([Single, Single, Single], {
      pageNumbering: { firstNumberedPageIndex: 1, firstNumber: 1 },
    });

    expect(computeBookLayout(book).pages.map(page => page.number)).toEqual([null, 1, 2]);
  });

  it('has no page for an empty book', () => {
    const layout = computeBookLayout(makeBook([]));

    expect(layout.pages).toEqual([]);
    expect(layout.lastPageIndex).toBe(-1);
  });
});
