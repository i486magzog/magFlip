/**
 * The languages the interface is written in.
 *
 * Adding one is a line here and a catalog file in every app that has text.
 * The order is the order a language picker shows, so it stays alphabetical by
 * the tag rather than by however a language is spelled in itself.
 */
export const LOCALES = ['en', 'ko'] as const;

/**
 * One of `LOCALES`. Everything that carries a language - a setting, a request,
 * a translator - carries this, never a free `string`.
 */
export type Locale = (typeof LOCALES)[number];

/**
 * The language used when nothing else is known, and the one every message is
 * written in first: a missing translation falls back to it, so it is the only
 * locale that is never incomplete.
 */
export const DEFAULT_LOCALE: Locale = 'en';

/**
 * How a locale writes its own name, for the picker in the settings. These are
 * not translated - a reader looking for their language looks for it in itself.
 */
export const LOCALE_NAMES: Readonly<Record<Locale, string>> = {
  en: 'English',
  ko: '한국어',
};

/**
 * Whether a value is a locale this build knows.
 */
export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/**
 * The locale a language tag asks for, or `null` when none of ours fits.
 *
 * A tag carries more than a language (`ko-KR`, `en-GB`, `zh-Hant-TW`), and a
 * region we do not translate for is not a reason to fall back: only the
 * language part decides. Tags are compared in lower case because a browser or
 * a header may send any casing.
 */
export function matchLocale(tag: string): Locale | null {
  const language = tag.trim().toLowerCase().split('-')[0];
  if (!language) { return null; }
  return LOCALES.find(locale => locale === language) ?? null;
}

/**
 * The first tag in `tags` this build has a language for, or `null`.
 *
 * `tags` is in order of preference - `navigator.languages`, or an
 * `Accept-Language` header sorted by quality.
 */
export function matchLocales(tags: readonly string[]): Locale | null {
  for (const tag of tags) {
    const locale = matchLocale(tag);
    if (locale) { return locale; }
  }
  return null;
}

/**
 * What the user asked for, in the order it is asked.
 *
 * `chosen` is the setting they picked themselves - `null` or an unknown value
 * means "follow the system", which is what a fresh account has.
 */
export interface ILocalePreference {
  /** The setting, from the account or from this browser. */
  chosen?: string | null;
  /** The languages the device asks for, most wanted first. */
  system?: readonly string[] | null;
}

/**
 * The locale to show, from the setting first and the device second.
 *
 * Both are untrusted strings: a setting saved by an older build, a header sent
 * by anything. Whatever does not match ends at `DEFAULT_LOCALE`.
 */
export function resolveLocale(preference: ILocalePreference): Locale {
  if (isLocale(preference.chosen)) { return preference.chosen; }
  return matchLocales(preference.system ?? []) ?? DEFAULT_LOCALE;
}

/**
 * The languages an `Accept-Language` header asks for, best first.
 *
 * Quality decides the order (`ko;q=0.9` before `en;q=0.8`), equal qualities
 * keep the order they were written in, and `q=0` means "not this one". A
 * malformed part is dropped rather than failing the request - a header is
 * something a client sends, not something this server promised.
 */
export function parseAcceptLanguage(header: string | null | undefined): string[] {
  if (!header) { return []; }
  const parts = header.split(',');
  const tags: { tag: string; quality: number; index: number }[] = [];
  for (const [index, part] of parts.entries()) {
    const [rawTag, ...parameters] = part.split(';');
    const tag = rawTag?.trim();
    if (!tag) { continue; }
    let quality = 1;
    for (const parameter of parameters) {
      const [name, value] = parameter.split('=');
      if (name?.trim() !== 'q') { continue; }
      const parsed = Number(value);
      quality = Number.isFinite(parsed) ? parsed : 0;
    }
    if (quality <= 0) { continue; }
    tags.push({ tag, quality, index });
  }
  return tags
    .sort((left, right) => (right.quality - left.quality) || (left.index - right.index))
    .map(entry => entry.tag);
}
