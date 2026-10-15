import { z } from 'zod';
import { DOC_LIMITS } from '../common/constants';
import { ElementType, MediaFit, ShapeKind } from '../model/element';
import { TextSizing, VerticalAlign } from '../model/text';
import { FillSchema, LinkSchema, StrokeSchema } from './paintSchema';
import {
  AngleSchema,
  CoordinateSchema,
  IdSchema,
  JsonObjectSchema,
  LengthSchema,
  NormalizedRectSchema,
  RatioSchema,
} from './primitives';
import { TextContentSchema, TextStyleSchema } from './textSchema';

/**
 * Only characters that cannot break an SVG path attribute.
 */
const SVG_PATH_PATTERN = /^[MmLlHhVvCcSsQqTtAaZz0-9eE ,.+\-\t\n\r]*$/;

/**
 * Fields shared by every element.
 */
const elementBaseFields = {
  id: IdSchema,
  name: z.string().max(200),
  parentId: IdSchema.nullable(),
  order: z.string().min(1).max(120),
  opacity: RatioSchema,
  isHidden: z.boolean(),
  isLocked: z.boolean(),
  link: LinkSchema.optional(),
};
/**
 * Fields of every element that owns a box.
 */
const boxFields = {
  ...elementBaseFields,
  x: CoordinateSchema,
  y: CoordinateSchema,
  width: LengthSchema,
  height: LengthSchema,
  rotation: AngleSchema,
  isFlippedX: z.boolean(),
  isFlippedY: z.boolean(),
};

/**
 * A logical group. Children keep surface coordinates.
 */
export const GroupElementSchema = z.object({
  ...elementBaseFields,
  type: z.literal(ElementType.Group),
});
/**
 * A raster image.
 */
export const ImageElementSchema = z.object({
  ...boxFields,
  type: z.literal(ElementType.Image),
  assetId: IdSchema.or(z.literal('')),
  fit: z.enum(MediaFit),
  crop: NormalizedRectSchema.nullable(),
  alt: z.string().max(1000),
});
/**
 * Rich text.
 */
export const TextElementSchema = z.object({
  ...boxFields,
  type: z.literal(ElementType.Text),
  content: TextContentSchema,
  style: TextStyleSchema,
  verticalAlign: z.enum(VerticalAlign),
  sizing: z.enum(TextSizing),
  fill: FillSchema.nullable(),
  padding: LengthSchema,
});
/**
 * A vector shape.
 */
export const ShapeElementSchema = z.object({
  ...boxFields,
  type: z.literal(ElementType.Shape),
  shape: z.enum(ShapeKind),
  path: z.string().max(DOC_LIMITS.maxPathLength).regex(SVG_PATH_PATTERN).nullable(),
  fill: FillSchema.nullable(),
  stroke: StrokeSchema.nullable(),
  cornerRadius: LengthSchema,
});
/**
 * A video.
 */
export const VideoElementSchema = z.object({
  ...boxFields,
  type: z.literal(ElementType.Video),
  assetId: IdSchema.or(z.literal('')),
  posterAssetId: IdSchema.nullable(),
  fit: z.enum(MediaFit),
  isAutoplay: z.boolean(),
  isLooping: z.boolean(),
  isMuted: z.boolean(),
  hasControls: z.boolean(),
});
/**
 * A sound clip.
 */
export const AudioElementSchema = z.object({
  ...boxFields,
  type: z.literal(ElementType.Audio),
  assetId: IdSchema.or(z.literal('')),
  isAutoplay: z.boolean(),
  isLooping: z.boolean(),
  hasControls: z.boolean(),
});
/**
 * An interactive widget rendered in a sandboxed iframe. The props are checked
 * again by the widget registry on the server, which owns their schema.
 */
export const WidgetElementSchema = z.object({
  ...boxFields,
  type: z.literal(ElementType.Widget),
  widgetType: z.string().max(120).regex(/^[a-z0-9]+(\.[a-z0-9-]+)*$/).or(z.literal('')),
  widgetVersion: z.number().int().min(1).max(10_000),
  props: JsonObjectSchema.refine(
    props => JSON.stringify(props).length <= DOC_LIMITS.maxWidgetPropsLength,
    { message: `Widget props must stay below ${DOC_LIMITS.maxWidgetPropsLength} characters.` },
  ),
});
/**
 * Any element of a surface.
 */
export const ElementSchema = z.discriminatedUnion('type', [
  GroupElementSchema,
  ImageElementSchema,
  TextElementSchema,
  ShapeElementSchema,
  VideoElementSchema,
  AudioElementSchema,
  WidgetElementSchema,
]);
