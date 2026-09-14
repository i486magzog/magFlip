import { z } from 'zod';
import { DOC_LIMITS } from '../common/constants';
import { TextAlign, TextBlockType, TextFieldKind } from '../model/text';
import { LinkSchema } from './paintSchema';
import { ColorSchema, CoordinateSchema, FontWeightSchema, LengthSchema } from './primitives';

/**
 * Character-level overrides of the paragraph style.
 */
export const TextMarksSchema = z.object({
  fontFamily: z.string().max(120).optional(),
  fontSize: LengthSchema.optional(),
  fontWeight: FontWeightSchema.optional(),
  isItalic: z.boolean().optional(),
  isUnderlined: z.boolean().optional(),
  isStruckThrough: z.boolean().optional(),
  color: ColorSchema.optional(),
  letterSpacing: CoordinateSchema.optional(),
  link: LinkSchema.optional(),
});
/**
 * Paragraph style of a text element.
 */
export const TextStyleSchema = z.object({
  fontFamily: z.string().max(120),
  fontSize: LengthSchema,
  fontWeight: FontWeightSchema,
  isItalic: z.boolean(),
  color: ColorSchema,
  lineHeight: z.number().min(0).max(10),
  letterSpacing: CoordinateSchema,
});
/**
 * A run of characters sharing the same marks.
 */
export const TextRunSchema = z.object({
  text: z.string().max(DOC_LIMITS.maxTextLength),
  marks: TextMarksSchema.optional(),
});
/**
 * A field placeholder such as the page number.
 */
export const TextFieldRunSchema = z.object({
  field: z.enum(TextFieldKind),
  marks: TextMarksSchema.optional(),
});
/**
 * A run of text or a field.
 */
export const TextInlineSchema = z.union([TextRunSchema, TextFieldRunSchema]);
/**
 * One paragraph.
 */
export const TextParagraphSchema = z.object({
  type: z.literal(TextBlockType.Paragraph),
  align: z.enum(TextAlign),
  inlines: z.array(TextInlineSchema),
});
/**
 * The rich text of one text element.
 */
export const TextContentSchema = z.object({
  blocks: z.array(TextParagraphSchema),
});
