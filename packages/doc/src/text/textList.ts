import { ITextList, ListKind } from '../model/text';

/**
 * Bullets by level. Deeper levels start over from the first one.
 */
const BULLETS = ['•', '◦', '▪'] as const;
/**
 * Roman numerals, largest first, used for the third level of a numbered list.
 */
const ROMAN_NUMERALS: readonly [number, string][] = [
  [1000, 'm'], [900, 'cm'], [500, 'd'], [400, 'cd'], [100, 'c'], [90, 'xc'],
  [50, 'l'], [40, 'xl'], [10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i'],
];

/**
 * Returns the marker of every paragraph, or `undefined` for one that is not a
 * list item. Pass the `list` of each paragraph in order.
 *
 * The numbering follows what nested HTML lists would show:
 * - consecutive items make one list; a paragraph that is not an item ends it,
 * - an item continues the numbering of the last item at its level, unless an
 *   item at a shallower level came in between (a new parent starts its
 *   children from 1) or the last item at its level was a bullet.
 *
 * The editor and the renderer both draw markers from this, so a book shows the
 * same numbers while it is written and when it is read.
 */
export function getListMarkers(lists: readonly (ITextList | undefined)[]): (string | undefined)[] {
  // What the list so far holds at each level: the last kind and its number.
  let levels: { kind: ListKind, count: number }[] = [];

  return lists.map(list => {
    if (!list) {
      levels = [];
      return undefined;
    }

    const { kind, level } = list;
    // Deeper levels belong to the previous parent.
    levels = levels.slice(0, level + 1);
    const previous = levels[level];
    const count = previous?.kind === kind ? previous.count + 1 : 1;
    levels[level] = { kind, count };
    return formatListMarker(kind, level, count);
  });
}
/**
 * Returns the marker of one item: its bullet, or its number in the style of
 * its level (`1.`, `a.`, `i.`, then again from `1.`).
 */
export function formatListMarker(kind: ListKind, level: number, count: number): string {
  if (kind === ListKind.Bullet) { return BULLETS[level % BULLETS.length] as string; }

  switch (level % 3) {
    case 1:
      return `${toLetters(count)}.`;
    case 2:
      return `${toRomanNumeral(count)}.`;
    default:
      return `${count}.`;
  }
}

/** 1 → a, 26 → z, 27 → aa, the way a spreadsheet names its columns. */
function toLetters(count: number): string {
  let letters = '';
  for (let rest = count; rest > 0; rest = Math.floor((rest - 1) / 26)) {
    letters = String.fromCharCode(97 + ((rest - 1) % 26)) + letters;
  }
  return letters;
}

function toRomanNumeral(count: number): string {
  let numeral = '';
  let rest = count;
  for (const [value, symbol] of ROMAN_NUMERALS) {
    for (; rest >= value; rest -= value) { numeral += symbol; }
  }
  return numeral;
}
