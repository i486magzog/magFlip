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
 * for headings without breaking stored documents. A list is not a block type:
 * it is a paragraph with `list` set (see `ITextList`).
 */
export enum TextBlockType {
  Paragraph = 'paragraph',
}
/**
 * The marker a list item is drawn with.
 */
export enum ListKind {
  /** A bullet: •, ◦ or ▪ depending on the level. */
  Bullet = 'bullet',
  /** A number: 1., a. or i. depending on the level. */
  Ordered = 'ordered',
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
 * Makes a paragraph an item of a list.
 *
 * Lists are flat: an item says how deep it is instead of sitting inside a list
 * node. Turning a paragraph into an item, or moving it a level in, then only
 * changes this field, so it never removes and re-inserts the paragraph - which
 * would drop what someone else is typing in it at the same time.
 * Consecutive items make one list; `getListMarkers` numbers them.
 */
export interface ITextList {
  kind: ListKind;
  /** How far the item is indented, from 0 to `DOC_LIMITS.maxListLevel`. */
  level: number;
}
/**
 * One paragraph of a text element.
 */
export interface ITextParagraph {
  type: TextBlockType.Paragraph;
  align: TextAlign;
  /** Set when the paragraph is an item of a list. */
  list?: ITextList;
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
