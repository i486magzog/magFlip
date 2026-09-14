/**
 * `@magflip/doc/authoring` - everything an editor or the server needs on top of
 * the model: zod schemas, master resolution, publishing, validation and
 * migration. Kept apart from `@magflip/doc` because it depends on zod.
 */
export * from './schema/bookSchema';
export * from './schema/elementSchema';
export * from './schema/paintSchema';
export * from './schema/primitives';
export * from './schema/surfaceSchema';
export * from './schema/textSchema';

export * from './master/resolveMaster';
export * from './publish/resolveNodes';
export * from './publish/publishSurface';
export * from './publish/publishBook';
export * from './validate/validateBook';
export * from './migrate/migrate';
