import { z } from 'zod';
import { DOC_LIMITS } from '../common/constants';

/**
 * Protocols a link may use. Everything else (`javascript:`, `data:` …) is rejected.
 */
const SAFE_URL_PROTOCOLS: ReadonlySet<string> = new Set(['http:', 'https:', 'mailto:', 'tel:']);

/**
 * Returns true when the URL is absolute and uses a safe protocol.
 */
export function isSafeUrl(value: string): boolean {
  try {
    return SAFE_URL_PROTOCOLS.has(new URL(value).protocol);
  } catch {
    return false;
  }
}

/**
 * Id of a surface, an element, an asset or a font.
 * `:` and `@` are excluded so that ids of the master layer never collide.
 */
export const IdSchema = z.string().min(1).max(DOC_LIMITS.maxIdLength).regex(/^[A-Za-z0-9_-]+$/);
/**
 * A coordinate or a length in px, bounded so that a document cannot carry
 * values that break layout maths.
 */
export const CoordinateSchema = z.number().min(-DOC_LIMITS.maxCoordinate).max(DOC_LIMITS.maxCoordinate);
/**
 * A length in px. Never negative.
 */
export const LengthSchema = z.number().min(0).max(DOC_LIMITS.maxCoordinate);
/**
 * An angle in degrees.
 */
export const AngleSchema = z.number().min(-DOC_LIMITS.maxCoordinate).max(DOC_LIMITS.maxCoordinate);
/**
 * A ratio between 0 and 1, such as an opacity.
 */
export const RatioSchema = z.number().min(0).max(1);
/**
 * `#rrggbb` or `#rrggbbaa`.
 */
export const ColorSchema = z.string().regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);
/**
 * A size in px.
 */
export const SizeSchema = z.object({
  width: LengthSchema,
  height: LengthSchema,
});
/**
 * An axis-aligned rectangle in px.
 */
export const RectSchema = z.object({
  x: CoordinateSchema,
  y: CoordinateSchema,
  width: LengthSchema,
  height: LengthSchema,
});
/**
 * A rectangle in normalized coordinates (0 - 1), used for image crops.
 */
export const NormalizedRectSchema = z.object({
  x: RatioSchema,
  y: RatioSchema,
  width: RatioSchema,
  height: RatioSchema,
});
/**
 * An absolute URL a reader may be sent to.
 */
export const UrlSchema = z.string().max(DOC_LIMITS.maxUrlLength).refine(isSafeUrl, {
  message: 'Only http, https, mailto and tel URLs are allowed.',
});
/**
 * A CSS font weight.
 */
export const FontWeightSchema = z.number().int().min(100).max(900);
/**
 * Any JSON value.
 */
export const JsonValueSchema = z.json();
/**
 * A JSON object, such as the props of a widget.
 */
export const JsonObjectSchema = z.record(z.string(), z.json());
