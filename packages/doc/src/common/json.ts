/**
 * A JSON value.
 */
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
/**
 * A JSON object.
 */
export type JsonObject = { [key: string]: JsonValue };

/**
 * Returns true when both JSON values are equal. Object key order is ignored.
 */
export function isJsonEqual(a: unknown, b: unknown): boolean {
  if (a === b) { return true; }
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) { return false; }
  if (Array.isArray(a) !== Array.isArray(b)) { return false; }

  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, i) => isJsonEqual(item, b[i]));
  }
  const objectA = a as Record<string, unknown>;
  const objectB = b as Record<string, unknown>;
  const keysA = Object.keys(objectA).filter(key => objectA[key] !== undefined);
  const keysB = Object.keys(objectB).filter(key => objectB[key] !== undefined);
  return keysA.length === keysB.length && keysA.every(key => isJsonEqual(objectA[key], objectB[key]));
}
