import { describe, expect, test } from '@jest/globals';
import { IPage } from '@magflip/core';
import { PageWindow } from '../src/pageWindow';

/** Creates a minimal page stub. Only `index` matters for window tests. */
const fakePage = (index: number) => ({ index } as unknown as IPage);

const indicesOf = (pageWindow: PageWindow) =>
  pageWindow.windows.map((slot) => slot.page?.index);

describe('PageWindow', () => {
  test('starts with 6 empty slots', () => {
    const pageWindow = new PageWindow();

    expect(pageWindow.windowSize).toBe(6);
    expect(indicesOf(pageWindow)).toEqual([undefined, undefined, undefined, undefined, undefined, undefined]);
  });

  test('moveRight drops two pages on the left and appends two on the right', () => {
    const pageWindow = new PageWindow();
    pageWindow.loadPagesToWindow([2, 3, 4, 5, 6, 7].map(fakePage));

    pageWindow.moveRight(fakePage(8), fakePage(9));

    expect(indicesOf(pageWindow)).toEqual([4, 5, 6, 7, 8, 9]);
  });

  test('moveLeft drops two pages on the right and prepends two on the left', () => {
    const pageWindow = new PageWindow();
    pageWindow.loadPagesToWindow([4, 5, 6, 7, 8, 9].map(fakePage));

    pageWindow.moveLeft(fakePage(2), fakePage(3));

    expect(indicesOf(pageWindow)).toEqual([2, 3, 4, 5, 6, 7]);
  });

  test('clearPageWindow empties every slot', () => {
    const pageWindow = new PageWindow();
    pageWindow.loadPagesToWindow([0, 1, 2, 3, 4, 5].map(fakePage));

    pageWindow.clearPageWindow();

    expect(pageWindow.getPageInWindow(0)).toBeUndefined();
    expect(pageWindow.windows).toHaveLength(6);
  });
});
