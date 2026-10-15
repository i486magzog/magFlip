import { z } from 'zod';
import { DOC_LIMITS } from '../common/constants';
import { ElementSchema } from './elementSchema';
import { FillSchema } from './paintSchema';
import { IdSchema, JsonValueSchema, RectSchema } from './primitives';

/**
 * Key of a master override: the master element id, followed by `@0` or `@1`
 * when a single master is repeated on both pages of a spread.
 */
export const MasterOverrideKeySchema = z.string().regex(
  new RegExp(`^[A-Za-z0-9_-]{1,${DOC_LIMITS.maxIdLength}}(@[01])?$`),
);
/**
 * A patch applied to one element of the master.
 */
export const MasterOverrideSchema = z.record(z.string().max(64), JsonValueSchema);
/**
 * The area a surface is designed on, when it is larger than its pages.
 */
export const SurfaceExtentSchema = z.object({
  rect: RectSchema,
  isViewerVisible: z.boolean(),
});
/**
 * The content of one surface.
 */
export const SurfaceDocSchema = z.object({
  id: IdSchema,
  background: FillSchema.nullable(),
  extent: SurfaceExtentSchema.nullable(),
  masterId: IdSchema.nullable(),
  masterOverrides: z.record(MasterOverrideKeySchema, MasterOverrideSchema),
  elements: z.record(IdSchema, ElementSchema).refine(
    elements => Object.keys(elements).length <= DOC_LIMITS.maxElementsPerSurface,
    { message: `A surface cannot hold more than ${DOC_LIMITS.maxElementsPerSurface} elements.` },
  ),
});
