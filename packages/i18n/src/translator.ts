import { DEFAULT_LOCALE, Locale } from './locale';
import { Message, MessageCatalog, MessageTranslations, MessageValues, formatMessage } from './message';

/**
 * Every language of one app: the source catalog plus what each other language
 * says. The source language needs no entry here - it is `catalog` itself.
 */
export type LocaleMessages<TKey extends string> = Readonly<Partial<Record<Locale, MessageTranslations<TKey>>>>;

/**
 * What a screen holds to write text: the language it is in, the words, and the
 * numbers and dates of that language.
 *
 * It is a value, not a global. A server answers two requests in two languages
 * at once, and the editor builds one for the locale in its store - nothing
 * reads an ambient "current language".
 */
export interface ITranslator<TKey extends string> {
  /** The language this translator writes, already resolved (never `null`). */
  readonly locale: Locale;
  /** The sentence for `key`, with `{name}` filled in. */
  t(key: TKey, values?: MessageValues): string;
  /** Whether this locale translates `key` itself, rather than falling back. */
  has(key: TKey): boolean;
  /** A number as this language writes it (separators, digits). */
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string;
  /** A moment as this language writes it. Defaults to a short date and time. */
  formatDateTime(value: Date | number, options?: Intl.DateTimeFormatOptions): string;
  /** A list as this language joins it ("a, b and c"). */
  formatList(values: readonly string[], options?: Intl.ListFormatOptions): string;
  /** A file size, in the unit that keeps it short. */
  formatBytes(bytes: number): string;
}

/**
 * The sizes a file is measured in, smallest first. `Intl.NumberFormat` knows
 * the names in every language, so nothing here is translated by hand.
 */
const BYTE_UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'] as const;

/**
 * Builds the translator for one language.
 *
 * `catalog` is the source language and the shape of everything: a key missing
 * from it is a type error, and a key missing from `translations[locale]` is a
 * sentence the reader sees in the source language instead of not at all.
 */
export function createTranslator<TKey extends string>(
  locale: Locale,
  catalog: MessageCatalog<TKey>,
  translations?: LocaleMessages<TKey>,
): ITranslator<TKey> {
  const translated = locale === DEFAULT_LOCALE ? undefined : translations?.[locale];

  const messageFor = (key: TKey): Message => translated?.[key] ?? catalog[key] ?? key;

  return {
    locale,
    t: (key, values) => formatMessage(locale, messageFor(key), values),
    has: key => translated?.[key] !== undefined,
    formatNumber: (value, options) => new Intl.NumberFormat(locale, options).format(value),
    formatDateTime: (value, options) => new Intl.DateTimeFormat(
      locale,
      options ?? { dateStyle: 'medium', timeStyle: 'short' },
    ).format(value),
    formatList: (values, options) => new Intl.ListFormat(locale, options).format(values),
    formatBytes: bytes => {
      let size = Math.max(0, bytes);
      let unit = 0;
      while (size >= 1024 && unit < BYTE_UNITS.length - 1) {
        size /= 1024;
        unit += 1;
      }
      return new Intl.NumberFormat(locale, {
        style: 'unit',
        unit: BYTE_UNITS[unit],
        unitDisplay: 'short',
        maximumFractionDigits: unit === 0 ? 0 : 1,
      }).format(size);
    },
  };
}
