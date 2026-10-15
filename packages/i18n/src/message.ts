import { Locale } from './locale';

/**
 * A message that changes with a number: `{count}` decides which form is used.
 *
 * `other` is the only form every language has, so it is the only one
 * required - Korean writes nothing else, English adds `one`, and a language
 * with more forms fills in what it needs. The names are the ones
 * `Intl.PluralRules` returns.
 */
export interface IPluralMessage {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

/**
 * One entry of a catalog: a sentence, or the forms of a sentence that counts.
 */
export type Message = string | IPluralMessage;

/**
 * The messages of one app, keyed by `screen.thing` - the whole set, which is
 * what the source language (`DEFAULT_LOCALE`) writes.
 *
 * The key type comes from that catalog, so a key that is not in it is a type
 * error at the call, and a translation cannot invent one.
 */
export type MessageCatalog<TKey extends string> = Readonly<Record<TKey, Message>>;

/**
 * What one other language says. Partial on purpose: a key nobody translated
 * yet falls back to the source language instead of breaking the build, so a
 * new string can land in one commit and be translated in the next.
 */
export type MessageTranslations<TKey extends string> = Readonly<Partial<Record<TKey, Message>>>;

/**
 * The values a message interpolates: `{title}`, `{count}`.
 *
 * Numbers are written with `Intl.NumberFormat` for the locale, so a thousands
 * separator is the one the reader expects. Anything already formatted - a date
 * the caller made, a file size - is passed as a string.
 */
export type MessageValues = Readonly<Record<string, string | number>>;

/**
 * `{name}`, and nothing else: no nested braces, no expressions. A message that
 * needs logic is two keys, picked by the code that knows the condition.
 */
const PLACEHOLDER = /\{(\w+)\}/g;

/**
 * The plural form for `count`, by the rules of `locale`.
 *
 * A form the translation left out falls back to `other`, which every language
 * fills in - so `{ other: '...' }` alone is a complete translation for a
 * language that does not count, and for one that does it is at worst plain.
 */
function selectPluralForm(locale: Locale, message: IPluralMessage, count: number): string {
  const category = new Intl.PluralRules(locale).select(count);
  return message[category] ?? message.other;
}

/**
 * The message as the reader sees it.
 *
 * A placeholder with no value is left as it was written (`{title}`), because a
 * hole in a sentence says where to look, while silently dropping it leaves a
 * sentence that reads fine and means something else.
 */
export function formatMessage(locale: Locale, message: Message, values?: MessageValues): string {
  const count = values?.['count'];
  const pattern = typeof message === 'string'
    ? message
    : selectPluralForm(locale, message, typeof count === 'number' ? count : 0);
  if (!values) { return pattern; }
  return pattern.replace(PLACEHOLDER, (placeholder, name: string) => {
    const value = values[name];
    if (value === undefined) { return placeholder; }
    return typeof value === 'number' ? new Intl.NumberFormat(locale).format(value) : value;
  });
}
