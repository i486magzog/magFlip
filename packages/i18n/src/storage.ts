import { Locale, isLocale } from './locale';

/**
 * Where a browser remembers the language.
 *
 * The account is what owns the setting - it follows the reader to another
 * machine - but a browser needs the language before it has asked who is
 * signed in, or while the server is unreachable. So this is a cache of the
 * account setting, written whenever that setting is known.
 */
export const LOCALE_STORAGE_KEY = 'magflip.locale';

/**
 * As much of `Storage` as this uses, so a test can pass a map and a worker
 * does not need one at all.
 */
export interface ILocaleStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * The language this browser last knew, or `null` for "follow the system".
 *
 * Storage throws in a private window and comes back empty after site data is
 * cleared, so every failure here means the same thing as an empty one.
 */
export function readStoredLocale(storage: ILocaleStorage | null | undefined): Locale | null {
  try {
    const saved = storage?.getItem(LOCALE_STORAGE_KEY);
    return isLocale(saved) ? saved : null;
  } catch {
    return null;
  }
}

/**
 * Remembers the language for the next visit. `null` clears it, which is what
 * "follow the system" means once it has been chosen on purpose.
 */
export function storeLocale(storage: ILocaleStorage | null | undefined, locale: Locale | null): void {
  try {
    if (locale) { storage?.setItem(LOCALE_STORAGE_KEY, locale); }
    else { storage?.removeItem(LOCALE_STORAGE_KEY); }
  } catch {
    // A browser that refuses to remember still shows the language it was given.
  }
}
