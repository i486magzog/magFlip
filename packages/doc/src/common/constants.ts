/**
 * Version of the document schema.
 * Bump it together with a migration in `migrate/migrate.ts`.
 */
export const SCHEMA_VERSION = 1;
/**
 * Hard limits that keep one surface small enough for a single
 * collaboration room (Durable Object) and for the viewer.
 */
export const DOC_LIMITS = {
  /** Maximum length of an id (surface, element, asset, font). */
  maxIdLength: 64,
  /** Maximum number of content surfaces in a book. */
  maxSurfaces: 10_000,
  /** Maximum number of elements in one surface. */
  maxElementsPerSurface: 5_000,
  /** Maximum nesting depth of groups. */
  maxGroupDepth: 32,
  /** Maximum number of characters in one text element. */
  maxTextLength: 100_000,
  /** Deepest level of a list item. Levels count from 0, so this allows nine. */
  maxListLevel: 8,
  /** Maximum size of the JSON-serialized props of one widget, in characters. */
  maxWidgetPropsLength: 64 * 1024,
  /** Maximum length of SVG path data of one shape. */
  maxPathLength: 64 * 1024,
  /** Maximum length of a URL. */
  maxUrlLength: 2048,
  /** Maximum absolute coordinate or length, in px. */
  maxCoordinate: 1_000_000,
} as const;
/**
 * Element ids of the master layer are prefixed with this value when a master
 * surface is resolved into a content surface. Content element ids cannot
 * contain `:`, so they never collide with master element ids.
 */
export const MASTER_ELEMENT_ID_PREFIX = 'master:';
