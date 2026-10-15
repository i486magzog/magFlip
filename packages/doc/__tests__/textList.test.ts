import { describe, expect, it } from 'vitest';
import { ITextList, ListKind } from '../src/model/text';
import { formatListMarker, getListMarkers } from '../src/text/textList';

const bullet = (level = 0): ITextList => ({ kind: ListKind.Bullet, level });
const ordered = (level = 0): ITextList => ({ kind: ListKind.Ordered, level });

describe('getListMarkers', () => {
  it('numbers consecutive items and leaves other paragraphs alone', () => {
    expect(getListMarkers([undefined, ordered(), ordered(), ordered()])).toEqual([undefined, '1.', '2.', '3.']);
  });

  it('starts over after a paragraph that is not an item', () => {
    expect(getListMarkers([ordered(), ordered(), undefined, ordered()])).toEqual(['1.', '2.', undefined, '1.']);
  });

  it('numbers each level on its own and goes on after a nested list', () => {
    const lists = [ordered(0), ordered(1), ordered(1), ordered(0), ordered(1)];

    // A new parent starts its children from the beginning again.
    expect(getListMarkers(lists)).toEqual(['1.', 'a.', 'b.', '2.', 'a.']);
  });

  it('starts a numbered list over after bullets at the same level', () => {
    expect(getListMarkers([ordered(), ordered(), bullet(), ordered()])).toEqual(['1.', '2.', '•', '1.']);
  });

  it('keeps the numbers of a level through deeper bullets', () => {
    expect(getListMarkers([ordered(0), bullet(1), bullet(2), ordered(0)])).toEqual(['1.', '◦', '▪', '2.']);
  });
});

describe('formatListMarker', () => {
  it('changes the bullet and the numbering style with the level', () => {
    expect([0, 1, 2, 3].map(level => formatListMarker(ListKind.Bullet, level, 1))).toEqual(['•', '◦', '▪', '•']);
    expect([0, 1, 2, 3].map(level => formatListMarker(ListKind.Ordered, level, 4))).toEqual(['4.', 'd.', 'iv.', '4.']);
  });

  it('keeps counting past the end of the alphabet and in roman numerals', () => {
    expect(formatListMarker(ListKind.Ordered, 1, 27)).toBe('aa.');
    expect(formatListMarker(ListKind.Ordered, 2, 1994)).toBe('mcmxciv.');
  });
});
