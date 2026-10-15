import { DEFAULT_LOCALE, Locale } from './locale';

/**
 * A short piece of text that travels as data rather than living in a catalog:
 * a widget's name, the label of a field the server describes.
 *
 * The editor cannot have a catalog for these - the server decides what widgets
 * exist, and a build of the editor from last month has to show a widget added
 * this morning. So the text carries its own languages, and the source language
 * is required for the same reason a catalog's is.
 *
 * This is for text the product writes. Text a person wrote - a book title, a
 * page, what an author typed into a widget - is content and is never
 * translated, in either direction.
 */
export type ILocalizedText = Readonly<Partial<Record<Locale, string>>> & { readonly en: string };

/**
 * Text that is either one plain string or localized, which is what a field
 * coming over the wire looks like while older servers are still out there.
 */
export type LocalizableText = string | ILocalizedText;

/**
 * The string to show, falling back to the source language.
 */
export function pickText(locale: Locale, text: LocalizableText): string {
  if (typeof text === 'string') { return text; }
  return text[locale] ?? text.en;
}

/**
 * Whether a value is a localized text map rather than a plain string.
 *
 * Used where JSON arrives from elsewhere: a value with no source language is
 * not one of these, however many other languages it has.
 */
export function isLocalizedText(value: unknown): value is ILocalizedText {
  if (typeof value !== 'object' || value === null) { return false; }
  const source = (value as Record<string, unknown>)[DEFAULT_LOCALE];
  return typeof source === 'string';
}
