import { ILink } from './link';

/**
 * Horizontal alignment of a text block.
 */
export enum TextAlign {
  Start = 'start',
  Center = 'center',
  End = 'end',
  Justify = 'justify',
}
/**
 * Vertical alignment of the whole text inside its element box.
 */
export enum VerticalAlign {
  Top = 'top',
  Middle = 'middle',
  Bottom = 'bottom',
}
/**
 * How the height of a text element follows its content.
 */
export enum TextSizing {
  /** The box keeps the authored height; overflowing text is clipped. */
  Fixed = 'fixed',
  /** The box grows downwards with the content. */
  AutoHeight = 'autoHeight',
}
/**
 * Block types. Only paragraphs exist today; the discriminator leaves room
 * for lists and headings without breaking stored documents.
 */
export enum TextBlockType {
  Paragraph = 'paragraph',
}
/**
 * A value that the renderer fills in from the book, such as the page number.
 */
export enum TextFieldKind {
  PageNumber = 'pageNumber',
  PageCount = 'pageCount',
  BookTitle = 'bookTitle',
}
/**
 * Character-level overrides of `ITextStyle`.
 */
export interface ITextMarks {
  fontFamily?: string;
  /** Font size in px. */
  fontSize?: number;
  /** CSS font weight, 100 - 900. */
  fontWeight?: number;
  isItalic?: boolean;
  isUnderlined?: boolean;
  isStruckThrough?: boolean;
  /** `#rrggbb` or `#rrggbbaa`. */
  color?: string;
  /** Letter spacing in px. */
  letterSpacing?: number;
  link?: ILink;
}
/**
 * Paragraph-level style of a text element.
 */
export interface ITextStyle {
  fontFamily: string;
  /** Font size in px. */
  fontSize: number;
  /** CSS font weight, 100 - 900. */
  fontWeight: number;
  isItalic: boolean;
  /** `#rrggbb` or `#rrggbbaa`. */
  color: string;
  /** Line height as a multiple of the font size. */
  lineHeight: number;
  /** Letter spacing in px. */
  letterSpacing: number;
}
/**
 * A run of characters that share the same marks.
 */
export interface ITextRun {
  text: string;
  marks?: ITextMarks;
}
/**
 * An inline placeholder resolved when the page is rendered or published.
 */
export interface ITextFieldRun {
  field: TextFieldKind;
  marks?: ITextMarks;
}
/**
 * A run of text or a field.
 */
export type TextInline = ITextRun | ITextFieldRun;
/**
 * One paragraph of a text element.
 */
export interface ITextParagraph {
  type: TextBlockType.Paragraph;
  align: TextAlign;
  inlines: TextInline[];
}
/**
 * A block of a text element.
 */
export type TextBlock = ITextParagraph;
/**
 * The rich text of one text element.
 */
export interface ITextContent {
  blocks: TextBlock[];
}

/**
 * Returns true when the inline run is a field placeholder.
 */
export function isTextFieldRun(inline: TextInline): inline is ITextFieldRun {
  return 'field' in inline;
}
