/**
 * `@magflip/i18n` - the language the interface is written in.
 *
 * The editor, the server and the TV app all show words to a person, so they
 * share the mechanics: what a locale is, how a message is written, how it is
 * filled in, and how numbers and dates follow the language. The words
 * themselves stay in the app they belong to - each keeps its own catalog.
 *
 * What comes out of the document or the database - a book title, a page, what
 * an author typed - is content, not interface, and never goes through here.
 */
export * from './locale';
export * from './localizedText';
export * from './message';
export * from './storage';
export * from './translator';
