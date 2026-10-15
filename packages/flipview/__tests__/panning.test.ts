import { describe, expect, test } from '@jest/globals';
import { clampPan } from '../src/panning';

const SCREEN = { width: 1000, height: 800 };

describe('clampPan', () => {
  test('keeps a book smaller than the screen in the middle', () => {
    const book = { width: 600, height: 500 };

    expect(clampPan({ x: 300, y: -200 }, book, SCREEN)).toEqual({ x: 0, y: 0 });
  });

  test('lets a wider book move by half of what sticks out on each side', () => {
    const book = { width: 1600, height: 800 };

    expect(clampPan({ x: 100, y: 0 }, book, SCREEN)).toEqual({ x: 100, y: 0 });
    expect(clampPan({ x: 500, y: 0 }, book, SCREEN)).toEqual({ x: 300, y: 0 });
    expect(clampPan({ x: -500, y: 0 }, book, SCREEN)).toEqual({ x: -300, y: 0 });
  });

  test('limits each direction on its own', () => {
    const book = { width: 1200, height: 2000 };

    expect(clampPan({ x: 400, y: 400 }, book, SCREEN)).toEqual({ x: 100, y: 400 });
    expect(clampPan({ x: 0, y: 1000 }, book, SCREEN)).toEqual({ x: 0, y: 600 });
  });

  test('has nowhere to go when the book is exactly the screen', () => {
    expect(clampPan({ x: 50, y: 50 }, { width: 1000, height: 800 }, SCREEN)).toEqual({ x: 0, y: 0 });
  });
});
