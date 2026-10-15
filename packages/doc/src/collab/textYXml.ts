import * as Y from 'yjs';
import { DOC_LIMITS } from '../common/constants';
import { ITextContent, ITextList, ITextMarks, ListKind, TextAlign, TextBlock, TextBlockType, TextFieldKind, TextInline } from '../model/text';
import { normalizeTextContent } from '../text/textContent';

/**
 * Node name of a paragraph inside the fragment.
 */
export const PARAGRAPH_NODE_NAME = 'paragraph';
/**
 * Attribute of a paragraph holding the `kind` of its `list`.
 *
 * A list is two plain attributes rather than one object: an editor bound to
 * the fragment compares attributes with `!==`, and an object would look
 * changed on every keystroke and be written again each time.
 */
export const LIST_KIND_ATTRIBUTE = 'listKind';
/**
 * Attribute of a paragraph holding the `level` of its `list`.
 */
export const LIST_LEVEL_ATTRIBUTE = 'listLevel';
/**
 * Node name of a field placeholder inside a paragraph.
 */
export const FIELD_NODE_NAME = 'field';
/**
 * Every mark of `ITextMarks`, under the name it has in the fragment.
 *
 * A rich text editor bound to the fragment declares its marks under these
 * names, so that what one editor writes another one reads back as the same
 * mark. See `toMarkAttributes` for the shape of the values.
 */
export const MARK_NAMES = [
  'fontFamily',
  'fontSize',
  'fontWeight',
  'isItalic',
  'isUnderlined',
  'isStruckThrough',
  'color',
  'letterSpacing',
  'link',
] as const;
/**
 * The marks that are simply on or off. The rest carry a value.
 */
export const FLAG_MARK_NAMES: readonly MarkName[] = ['isItalic', 'isUnderlined', 'isStruckThrough'];
/**
 * Attribute that carries the value of a mark that has one.
 */
export const MARK_VALUE_ATTRIBUTE = 'value';
/**
 * Name of one mark.
 */
export type MarkName = typeof MARK_NAMES[number];

/**
 * Turns marks into the attributes the fragment stores them as.
 *
 * Each mark becomes one attribute holding an object, which is the shape a
 * ProseMirror mark takes in a Yjs document: a mark that is on or off holds an
 * empty object, and the others hold their value under `value`. Writing them
 * this way is what lets an editor bind to the fragment directly instead of
 * rewriting the text on every keystroke.
 */
export function toMarkAttributes(marks: ITextMarks | undefined): Record<string, object> {
  const attributes: Record<string, object> = {};
  if (!marks) { return attributes; }

  for (const name of MARK_NAMES) {
    const value = marks[name];
    if (value === undefined) { continue; }
    if (FLAG_MARK_NAMES.includes(name)) {
      // A flag that is off is not a mark at all.
      if (value === true) { attributes[name] = {}; }
      continue;
    }
    attributes[name] = { [MARK_VALUE_ATTRIBUTE]: value };
  }
  return attributes;
}
/**
 * Reads marks back out of the attributes of a text run or a field.
 * Attributes that are not marks - the kind of a field, for one - are ignored.
 */
export function toTextMarks(attributes: Record<string, unknown> | undefined): ITextMarks | undefined {
  if (!attributes) { return undefined; }

  const marks: Record<string, unknown> = {};
  for (const name of MARK_NAMES) {
    const attribute = attributes[name];
    if (attribute === undefined || attribute === null) { continue; }
    if (FLAG_MARK_NAMES.includes(name)) { marks[name] = true; continue; }

    const value = (attribute as Record<string, unknown>)[MARK_VALUE_ATTRIBUTE];
    if (value !== undefined) { marks[name] = value; }
  }
  return Object.keys(marks).length === 0 ? undefined : marks as ITextMarks;
}

/**
 * Writes rich text into a Yjs fragment, replacing what is there.
 *
 * Paragraphs become `Y.XmlElement`s and runs become `Y.XmlText` with the marks
 * as formatting attributes, which is what lets two people type in the same
 * paragraph at the same time. Fields stay separate nodes so that their value
 * is filled in at render time, not stored.
 */
export function writeTextContent(fragment: Y.XmlFragment, content: ITextContent): void {
  const write = () => {
    fragment.delete(0, fragment.length);
    for (const block of normalizeTextContent(content).blocks) {
      const paragraph = new Y.XmlElement(PARAGRAPH_NODE_NAME);
      fragment.insert(fragment.length, [paragraph]);
      paragraph.setAttribute('align', block.align);
      if (block.list) {
        paragraph.setAttribute(LIST_KIND_ATTRIBUTE, block.list.kind);
        paragraph.setAttribute(LIST_LEVEL_ATTRIBUTE, block.list.level as never);
      }
      writeInlines(paragraph, block.inlines);
    }
  };
  if (fragment.doc) { fragment.doc.transact(write); } else { write(); }
}
/**
 * Reads rich text back from a Yjs fragment.
 */
export function readTextContent(fragment: Y.XmlFragment): ITextContent {
  const blocks: TextBlock[] = [];
  for (const node of fragment.toArray()) {
    if (!(node instanceof Y.XmlElement) || node.nodeName !== PARAGRAPH_NODE_NAME) { continue; }
    const attributes = node.getAttributes() as Record<string, unknown>;
    const list = toTextList(attributes[LIST_KIND_ATTRIBUTE], attributes[LIST_LEVEL_ATTRIBUTE]);
    blocks.push({
      type: TextBlockType.Paragraph,
      align: toTextAlign(attributes['align']),
      ...(list ? { list } : {}),
      inlines: readInlines(node),
    });
  }
  return normalizeTextContent({ blocks });
}

/**
 * Reads the list of a paragraph from its two attributes, or `undefined` when
 * it is not a list item. A missing level is the first one, and a level out of
 * range is brought back into it rather than dropping the item.
 */
export function toTextList(kind: unknown, level: unknown): ITextList | undefined {
  const kinds = Object.values(ListKind) as unknown[];
  if (!kinds.includes(kind)) { return undefined; }

  const depth = typeof level === 'number' && Number.isFinite(level) ? Math.trunc(level) : 0;
  return { kind: kind as ListKind, level: Math.min(Math.max(depth, 0), DOC_LIMITS.maxListLevel) };
}

function writeInlines(paragraph: Y.XmlElement, inlines: TextInline[]): void {
  let text: Y.XmlText | undefined;
  for (const inline of inlines) {
    if ('field' in inline) {
      const field = new Y.XmlElement(FIELD_NODE_NAME);
      paragraph.insert(paragraph.length, [field]);
      field.setAttribute('field', inline.field);
      // The marks of a node sit beside its own attributes, the way an editor
      // bound to this fragment writes them.
      for (const [name, value] of Object.entries(toMarkAttributes(inline.marks))) {
        field.setAttribute(name, value as never);
      }
      text = undefined;
      continue;
    }
    if (!text) {
      text = new Y.XmlText();
      paragraph.insert(paragraph.length, [text]);
    }
    text.insert(text.length, inline.text, toMarkAttributes(inline.marks));
  }
}

function readInlines(paragraph: Y.XmlElement): TextInline[] {
  const inlines: TextInline[] = [];
  for (const node of paragraph.toArray()) {
    if (node instanceof Y.XmlText) {
      for (const op of node.toDelta() as { insert?: unknown, attributes?: Record<string, unknown> }[]) {
        if (typeof op.insert !== 'string') { continue; }
        const marks = toTextMarks(op.attributes);
        inlines.push({ text: op.insert, ...(marks ? { marks } : {}) });
      }
      continue;
    }
    if (node instanceof Y.XmlElement && node.nodeName === FIELD_NODE_NAME) {
      const field = toTextField(node.getAttribute('field'));
      if (!field) { continue; }
      const marks = toTextMarks(node.getAttributes() as Record<string, unknown>);
      inlines.push({ field, ...(marks ? { marks } : {}) });
    }
  }
  return inlines;
}

function toTextAlign(value: unknown): TextAlign {
  const aligns = Object.values(TextAlign) as string[];
  return typeof value === 'string' && aligns.includes(value) ? value as TextAlign : TextAlign.Start;
}

function toTextField(value: unknown): TextFieldKind | undefined {
  const fields = Object.values(TextFieldKind) as string[];
  return typeof value === 'string' && fields.includes(value) ? value as TextFieldKind : undefined;
}
