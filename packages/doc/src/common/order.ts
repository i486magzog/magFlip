import { generateKeyBetween, generateNKeysBetween } from 'fractional-indexing';

/**
 * Anything ordered by a fractional index key.
 */
export interface IOrdered {
  id: string;
  order: string;
}

/**
 * Returns a new order key that sorts between `before` and `after`.
 * Pass `null` to insert at the beginning or the end.
 *
 * Keys are compared as plain strings (code unit order), never with `localeCompare`.
 * Moving an item only rewrites its own key, so concurrent moves merge without
 * duplicating items. Two users inserting at the same place may get the same key;
 * `compareOrdered` breaks the tie with the id.
 */
export function createOrderBetween(before: string | null, after: string | null): string {
  return generateKeyBetween(before, after);
}
/**
 * Returns `count` sorted order keys between `before` and `after`.
 */
export function createOrdersBetween(before: string | null, after: string | null, count: number): string[] {
  return generateNKeysBetween(before, after, count);
}
/**
 * Compares two ordered items by order key, then by id.
 */
export function compareOrdered(a: IOrdered, b: IOrdered): number {
  if (a.order !== b.order) { return a.order < b.order ? -1 : 1; }
  if (a.id === b.id) { return 0; }
  return a.id < b.id ? -1 : 1;
}
/**
 * Returns a new array sorted by order key, then by id.
 */
export function sortOrdered<T extends IOrdered>(items: Iterable<T>): T[] {
  return [...items].sort(compareOrdered);
}
