import { sortOrdered } from '../common/order';
import { IBookDoc, ISurfaceRef, PageSide, ReadingDirection } from '../model/book';
import { createProblem, IDocProblem, ProblemCode, ProblemSeverity } from '../model/problem';
import { getSurfacePageCount, SurfaceKind } from '../model/surface';

/**
 * One page of the book, derived from the ordered surfaces.
 */
export interface IPageSlot {
  /** Position in the book, starting at 0. */
  index: number;
  surfaceId: string;
  /** Left edge of this page in surface coordinates: 0 or one page width. */
  surfaceX: number;
  side: PageSide;
  /** Printed page number, or `null` when the page shows no number. */
  number: number | null;
}
/**
 * The page order of a book, computed from its manifest.
 */
export interface IBookLayout {
  pages: IPageSlot[];
  /** Pages of each surface, in page order, keyed by surface id. */
  surfacePages: Map<string, IPageSlot[]>;
  /** Index of the last page, or -1 when the book has no page. */
  lastPageIndex: number;
  problems: IDocProblem[];
}

/**
 * Returns the content surfaces of the book in reading order.
 */
export function getSortedSurfaceRefs(book: IBookDoc): ISurfaceRef[] {
  return sortOrdered(Object.values(book.surfaces));
}
/**
 * Returns the side a page index is shown on.
 *
 * Page 0 (the cover) stands alone on the right of a left-to-right book, so
 * even pages are on the right and odd pages on the left. A right-to-left book
 * is the mirror image.
 */
export function getPageSide(index: number, direction: ReadingDirection): PageSide {
  const isEven = index % 2 === 0;
  const isRight = direction === ReadingDirection.LeftToRight ? isEven : !isEven;
  return isRight ? PageSide.Right : PageSide.Left;
}
/**
 * Returns the index of the page facing this one, or `null` when the page
 * stands alone (the cover, and the last page of a book with an even page count).
 */
export function getFacingPageIndex(index: number, pageCount: number): number | null {
  if (index <= 0 || index >= pageCount) { return null; }

  const facingIndex = index % 2 === 1 ? index + 1 : index - 1;
  return facingIndex < pageCount ? facingIndex : null;
}
/**
 * Returns true when a spread surface may start at this page index.
 *
 * Facing pages are the pairs (1, 2), (3, 4) …, so a spread has to start on an
 * odd index. Inserting a single page in front of a spread breaks this, which
 * is why `computeBookLayout` reports `SpreadMisaligned`.
 */
export function canSpreadStartAt(index: number): boolean {
  return index % 2 === 1;
}
/**
 * Blank pages that have to go in with a new surface so that the page order
 * stays valid.
 */
export interface ISurfaceInsertPlan {
  /** A single page in front of the new surface, so that a spread starts on the left. */
  blankBefore: boolean;
  /** A single page right after the new surface, so that the spreads behind it stay on the left. */
  blankAfter: boolean;
}
/**
 * Works out what inserting a surface right after `afterSurfaceId` (or at the
 * end) takes to keep the spreads aligned.
 *
 * - The cover is a single page, so a spread added to an empty book gets a
 *   blank cover in front of it.
 * - A spread whose first page would fall on the right gets a blank page in
 *   front of it.
 * - When the pages added shift the next spread onto the right, a blank page
 *   goes in right after the new surface, which leaves every page behind it
 *   where it was.
 *
 * The last page is not taken care of here: while pages are added one by one
 * the book is short of a page every other step, and `computeBookLayout`
 * reports that.
 */
export function planSurfaceInsert(book: IBookDoc, kind: SurfaceKind, afterSurfaceId?: string): ISurfaceInsertPlan {
  const refs = getSortedSurfaceRefs(book);
  const layout = computeBookLayout(book);
  const afterIndex = afterSurfaceId === undefined ? -1 : refs.findIndex(ref => ref.id === afterSurfaceId);
  const position = afterIndex < 0 ? refs.length - 1 : afterIndex;

  const afterPages = refs[position] ? layout.surfacePages.get(refs[position].id) : undefined;
  const startIndex = afterPages ? (afterPages[afterPages.length - 1]?.index ?? -1) + 1 : 0;

  const blankBefore = kind === SurfaceKind.Spread && !canSpreadStartAt(startIndex);
  const addedPageCount = (blankBefore ? 1 : 0) + getSurfacePageCount(kind);

  const nextSpread = refs.slice(position + 1).find(ref => ref.kind === SurfaceKind.Spread);
  const nextSpreadIndex = nextSpread ? layout.surfacePages.get(nextSpread.id)?.[0]?.index : undefined;
  const blankAfter = nextSpreadIndex !== undefined && !canSpreadStartAt(nextSpreadIndex + addedPageCount);

  return { blankBefore, blankAfter };
}
/**
 * Walks the surfaces of a book in order and assigns a page index to each page.
 *
 * Runs in O(n log n) for n surfaces; it is cheap enough to recompute whenever
 * the manifest changes, even for a book with thousands of pages.
 */
export function computeBookLayout(book: IBookDoc): IBookLayout {
  const pages: IPageSlot[] = [];
  const surfacePages = new Map<string, IPageSlot[]>();
  const problems: IDocProblem[] = [];

  for (const ref of getSortedSurfaceRefs(book)) {
    const startIndex = pages.length;
    if (ref.kind === SurfaceKind.Spread && !canSpreadStartAt(startIndex)) {
      problems.push(createProblem(
        ProblemCode.SpreadMisaligned,
        ProblemSeverity.Error,
        `Spread surface "${ref.id}" starts at page ${startIndex}, which is not a left page. Insert or remove a single page before it.`,
        { surfaceId: ref.id, pageIndex: startIndex },
      ));
    }

    const slots: IPageSlot[] = [];
    for (let offset = 0; offset < getSurfacePageCount(ref.kind); offset++) {
      const index = startIndex + offset;
      const side = getPageSide(index, book.readingDirection);
      slots.push({
        index,
        surfaceId: ref.id,
        surfaceX: getSurfaceX(ref.kind, side, book.pageSize.width),
        side,
        number: getPageNumber(index, book),
      });
    }
    pages.push(...slots);
    surfacePages.set(ref.id, slots);
  }

  // The back cover stands alone, on the side the cover does not use. That
  // needs an even page count, which also rules out a spread at the end.
  if (pages.length % 2 === 1) {
    problems.push(createProblem(
      ProblemCode.LastPageMisaligned,
      ProblemSeverity.Error,
      `The book has ${pages.length} pages, so its last page does not stand alone opposite the cover. Add or remove a single page.`,
      { surfaceId: pages[pages.length - 1]?.surfaceId as string, pageIndex: pages.length - 1 },
    ));
  }

  return { pages, surfacePages, lastPageIndex: pages.length - 1, problems };
}
/**
 * Returns the printed page number of a page index, or `null` when the page
 * is before the first numbered page.
 */
export function getPageNumber(index: number, book: IBookDoc): number | null {
  const { firstNumberedPageIndex, firstNumber } = book.pageNumbering;
  if (index < firstNumberedPageIndex) { return null; }
  return index - firstNumberedPageIndex + firstNumber;
}

/**
 * A single page always sits at x 0. On a spread the left page sits at x 0 and
 * the right page one page width further, whatever the reading direction is.
 */
function getSurfaceX(kind: SurfaceKind, side: PageSide, pageWidth: number): number {
  if (kind === SurfaceKind.Single) { return 0; }
  return side === PageSide.Left ? 0 : pageWidth;
}
