import { z } from 'zod';
import { FillKind } from '../model/paint';
import { LinkKind } from '../model/link';
import { AngleSchema, ColorSchema, CoordinateSchema, IdSchema, LengthSchema, RatioSchema, UrlSchema } from './primitives';

/**
 * A single color fill.
 */
export const SolidFillSchema = z.object({
  kind: z.literal(FillKind.Solid),
  color: ColorSchema,
});
/**
 * One stop of a gradient.
 */
export const GradientStopSchema = z.object({
  offset: RatioSchema,
  color: ColorSchema,
});
/**
 * A linear gradient fill.
 */
export const LinearGradientFillSchema = z.object({
  kind: z.literal(FillKind.LinearGradient),
  angle: AngleSchema,
  stops: z.array(GradientStopSchema).min(2).max(16),
});
/**
 * Any fill.
 */
export const FillSchema = z.discriminatedUnion('kind', [SolidFillSchema, LinearGradientFillSchema]);
/**
 * An outline of a shape.
 */
export const StrokeSchema = z.object({
  color: ColorSchema,
  width: LengthSchema,
  dash: z.array(LengthSchema).max(8),
});
/**
 * A link to an external address.
 */
export const UrlLinkSchema = z.object({
  kind: z.literal(LinkKind.Url),
  href: UrlSchema,
  isNewTab: z.boolean(),
});
/**
 * A link to a page of the same book.
 */
export const PageLinkSchema = z.object({
  kind: z.literal(LinkKind.Page),
  surfaceId: IdSchema,
  surfaceX: CoordinateSchema,
});
/**
 * Any link.
 */
export const LinkSchema = z.discriminatedUnion('kind', [UrlLinkSchema, PageLinkSchema]);
