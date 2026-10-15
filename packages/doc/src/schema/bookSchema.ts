import { z } from 'zod';
import { DOC_LIMITS, SCHEMA_VERSION } from '../common/constants';
import { FontStyle, ReadingDirection } from '../model/book';
import { SurfaceKind } from '../model/surface';
import { FontWeightSchema, IdSchema, LengthSchema } from './primitives';
import { SurfaceDocSchema } from './surfaceSchema';

/**
 * Descriptive data of a book.
 */
export const BookMetaSchema = z.object({
  title: z.string().max(300),
  author: z.string().max(300),
  description: z.string().max(2000),
  language: z.string().max(35),
});
/**
 * Where printed page numbers start.
 */
export const PageNumberingSchema = z.object({
  firstNumberedPageIndex: z.number().int().min(0).max(DOC_LIMITS.maxSurfaces * 2),
  firstNumber: z.number().int().min(0).max(1_000_000),
});
/**
 * One weight and style of a font family used by the book.
 */
export const FontFaceSchema = z.object({
  id: IdSchema,
  family: z.string().min(1).max(120),
  weight: FontWeightSchema,
  style: z.enum(FontStyle),
  assetId: IdSchema,
});
/**
 * A surface in the reading order.
 */
export const SurfaceRefSchema = z.object({
  id: IdSchema,
  kind: z.enum(SurfaceKind),
  order: z.string().min(1).max(120),
  name: z.string().max(200),
});
/**
 * A master surface.
 */
export const MasterRefSchema = z.object({
  id: IdSchema,
  kind: z.enum(SurfaceKind),
  name: z.string().max(200),
});
/**
 * The manifest of a book.
 *
 * `schemaVersion` must already be the current one: run `migrateBookBundle`
 * on stored JSON before validating it.
 */
export const BookDocSchema = z.object({
  schemaVersion: z.number().int().refine(version => version === SCHEMA_VERSION, {
    message: `The book must be migrated to schema version ${SCHEMA_VERSION} first.`,
  }),
  id: IdSchema,
  meta: BookMetaSchema,
  pageSize: z.object({
    width: LengthSchema.min(1),
    height: LengthSchema.min(1),
  }),
  readingDirection: z.enum(ReadingDirection),
  pageNumbering: PageNumberingSchema,
  surfaces: z.record(IdSchema, SurfaceRefSchema).refine(
    surfaces => Object.keys(surfaces).length <= DOC_LIMITS.maxSurfaces,
    { message: `A book cannot hold more than ${DOC_LIMITS.maxSurfaces} surfaces.` },
  ),
  masters: z.record(IdSchema, MasterRefSchema),
  fonts: z.record(IdSchema, FontFaceSchema),
});
/**
 * A whole book in one JSON value.
 */
export const BookBundleSchema = z.object({
  book: BookDocSchema,
  surfaces: z.record(IdSchema, SurfaceDocSchema),
});
