import { isJsonEqual } from '../common/json';
import {
  isTextFieldRun,
  ITextContent,
  ITextMarks,
  ITextRun,
  TextAlign,
  TextBlock,
  TextBlockType,
  TextFieldKind,
  TextInline,
} from '../model/text';

/**
 * Values a text field is replaced with when a page is rendered or published.
 */
export interface ITextFieldValues {
  /** `null` on a page that shows no number; the field then renders as empty. */
  pageNumber: number | null;
  pageCount: number;
  bookTitle: string;
}

/**
 * Replaces every field run with the text it stands for.
 */
export function resolveTextFields(content: ITextContent, values: ITextFieldValues): ITextContent {
  const blocks = content.blocks.map(block => ({
    ...block,
    inlines: block.inlines.map(inline => (isTextFieldRun(inline)
      ? { text: getFieldText(inline.field, values), ...(inline.marks ? { marks: inline.marks } : {}) }
      : inline)),
  }));
  return normalizeTextContent({ blocks });
}
/**
 * Returns the text a field stands for.
 */
export function getFieldText(field: TextFieldKind, values: ITextFieldValues): string {
  switch (field) {
    case TextFieldKind.PageNumber:
      return values.pageNumber === null ? '' : String(values.pageNumber);
    case TextFieldKind.PageCount:
      return String(values.pageCount);
    case TextFieldKind.BookTitle:
      return values.bookTitle;
    default:
      return '';
  }
}
/**
 * Merges neighbouring runs that share the same marks and drops empty ones.
 *
 * Rich text is stored as a Yjs delta, which merges equal runs on its own.
 * Normalizing here keeps a document and its collaboration copy equal.
 */
export function normalizeTextContent(content: ITextContent): ITextContent {
  return { blocks: content.blocks.map(normalizeBlock) };
}
/**
 * Returns the text of the content, fields excluded, paragraphs joined with `\n`.
 */
export function getPlainText(content: ITextContent): string {
  return content.blocks
    .map(block => block.inlines.map(inline => (isTextFieldRun(inline) ? '' : inline.text)).join(''))
    .join('\n');
}
/**
 * Returns the number of characters of the content, used to check the limit.
 */
export function getTextLength(content: ITextContent): number {
  return getPlainText(content).length;
}
/**
 * Returns true when both runs carry the same marks.
 */
export function haveSameMarks(a: TextInline, b: TextInline): boolean {
  return isJsonEqual(a.marks ?? {}, b.marks ?? {});
}
/**
 * Creates a content of one paragraph.
 */
export function createTextContent(text: string, marks?: ITextMarks): ITextContent {
  const inlines: TextInline[] = text.length === 0 ? [] : [{ text, ...(marks ? { marks } : {}) }];
  return normalizeTextContent({ blocks: [{ type: TextBlockType.Paragraph, align: TextAlign.Start, inlines }] });
}

function normalizeBlock(block: TextBlock): TextBlock {
  const inlines: TextInline[] = [];
  for (const inline of block.inlines) {
    if (!isTextFieldRun(inline) && inline.text.length === 0) { continue; }

    const previous = inlines[inlines.length - 1];
    const canMerge = previous !== undefined
      && !isTextFieldRun(previous)
      && !isTextFieldRun(inline)
      && haveSameMarks(previous, inline);
    if (canMerge) {
      inlines[inlines.length - 1] = { ...(previous as ITextRun), text: (previous as ITextRun).text + inline.text };
      continue;
    }
    inlines.push(dropEmptyMarks(inline));
  }
  return { ...block, inlines };
}

function dropEmptyMarks(inline: TextInline): TextInline {
  if (!inline.marks || Object.keys(inline.marks).length > 0) { return inline; }
  const { marks: _marks, ...rest } = inline;
  return rest as TextInline;
}
