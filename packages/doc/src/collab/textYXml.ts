import * as Y from 'yjs';
import { ITextContent, ITextMarks, TextAlign, TextBlock, TextBlockType, TextFieldKind, TextInline } from '../model/text';
import { normalizeTextContent } from '../text/textContent';

/**
 * Node name of a paragraph inside the fragment.
 */
export const PARAGRAPH_NODE_NAME = 'paragraph';
/**
 * Node name of a field placeholder inside a paragraph.
 */
export const FIELD_NODE_NAME = 'field';

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
    blocks.push({
      type: TextBlockType.Paragraph,
      align: toTextAlign(node.getAttribute('align')),
      inlines: readInlines(node),
    });
  }
  return normalizeTextContent({ blocks });
}

function writeInlines(paragraph: Y.XmlElement, inlines: TextInline[]): void {
  let text: Y.XmlText | undefined;
  for (const inline of inlines) {
    if ('field' in inline) {
      const field = new Y.XmlElement(FIELD_NODE_NAME);
      paragraph.insert(paragraph.length, [field]);
      field.setAttribute('field', inline.field);
      if (inline.marks) { field.setAttribute('marks', inline.marks as never); }
      text = undefined;
      continue;
    }
    if (!text) {
      text = new Y.XmlText();
      paragraph.insert(paragraph.length, [text]);
    }
    text.insert(text.length, inline.text, inline.marks ? { ...inline.marks } : undefined);
  }
}

function readInlines(paragraph: Y.XmlElement): TextInline[] {
  const inlines: TextInline[] = [];
  for (const node of paragraph.toArray()) {
    if (node instanceof Y.XmlText) {
      for (const op of node.toDelta() as { insert?: unknown, attributes?: ITextMarks }[]) {
        if (typeof op.insert !== 'string') { continue; }
        inlines.push({ text: op.insert, ...(op.attributes ? { marks: op.attributes } : {}) });
      }
      continue;
    }
    if (node instanceof Y.XmlElement && node.nodeName === FIELD_NODE_NAME) {
      const field = toTextField(node.getAttribute('field'));
      if (!field) { continue; }
      const marks = node.getAttribute('marks') as ITextMarks | undefined;
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
