import {
  ElementType,
  isTextFieldRun,
  ITextMarks,
  ITextStyle,
  TextAlign,
  TextBlock,
  TextInline,
  TextSizing,
  VerticalAlign,
} from '@magflip/doc';
import { IRenderOptions } from '../common/renderOptions';
import { createDiv, px, round, toCssFill } from '../common/style';
import { PublishedElementOf } from '../common/types';
import { createLink } from './link';

type PublishedText = PublishedElementOf<ElementType.Text>;

const VERTICAL_ALIGNMENTS: Record<VerticalAlign, string> = {
  [VerticalAlign.Top]: 'flex-start',
  [VerticalAlign.Middle]: 'center',
  [VerticalAlign.Bottom]: 'flex-end',
};

/**
 * Draws rich text.
 *
 * Text is written with `textContent`, never with `innerHTML`: the content comes
 * from whoever edited the book, and a book may be published to readers.
 */
export function createTextNode(element: PublishedText, options: IRenderOptions): HTMLElement {
  const box = createDiv('el', 'el-text');
  box.style.alignItems = VERTICAL_ALIGNMENTS[element.verticalAlign];
  box.style.padding = px(element.padding);
  const background = toCssFill(element.fill);
  if (background) { box.style.background = background; }
  // An auto-height box grows with its text; a fixed one clips it.
  box.style.overflow = element.sizing === TextSizing.AutoHeight ? 'visible' : 'hidden';
  applyTextStyle(box, element.style);

  const body = createDiv('text-body');
  for (const block of element.content.blocks) { body.appendChild(createBlock(block, options)); }
  box.appendChild(body);
  return box;
}

function applyTextStyle(element: HTMLElement, style: ITextStyle): void {
  element.style.fontFamily = style.fontFamily;
  element.style.fontSize = px(style.fontSize);
  element.style.fontWeight = String(style.fontWeight);
  element.style.fontStyle = style.isItalic ? 'italic' : 'normal';
  element.style.color = style.color;
  element.style.lineHeight = String(round(style.lineHeight));
  element.style.letterSpacing = px(style.letterSpacing);
}

function createBlock(block: TextBlock, options: IRenderOptions): HTMLElement {
  const paragraph = document.createElement('p');
  paragraph.className = 'mf-text-p';
  paragraph.style.textAlign = toCssTextAlign(block.align);
  for (const inline of block.inlines) { paragraph.appendChild(createInline(inline, options)); }
  // An empty paragraph still takes one line.
  if (block.inlines.length === 0) { paragraph.appendChild(document.createElement('br')); }
  return paragraph;
}

function createInline(inline: TextInline, options: IRenderOptions): Node {
  // Fields are resolved before publishing; one that survived has no value to show.
  const text = isTextFieldRun(inline) ? '' : inline.text;
  const span = document.createElement('span');
  span.textContent = text;
  applyMarks(span, inline.marks);

  const link = inline.marks?.link;
  if (!link) { return span; }
  const anchor = createLink(link, options);
  anchor.appendChild(span);
  return anchor;
}

function applyMarks(element: HTMLElement, marks: ITextMarks | undefined): void {
  if (!marks) { return; }
  if (marks.fontFamily) { element.style.fontFamily = marks.fontFamily; }
  if (marks.fontSize !== undefined) { element.style.fontSize = px(marks.fontSize); }
  if (marks.fontWeight !== undefined) { element.style.fontWeight = String(marks.fontWeight); }
  if (marks.isItalic) { element.style.fontStyle = 'italic'; }
  if (marks.color) { element.style.color = marks.color; }
  if (marks.letterSpacing !== undefined) { element.style.letterSpacing = px(marks.letterSpacing); }

  const decorations: string[] = [];
  if (marks.isUnderlined) { decorations.push('underline'); }
  if (marks.isStruckThrough) { decorations.push('line-through'); }
  if (decorations.length > 0) { element.style.textDecoration = decorations.join(' '); }
}

function toCssTextAlign(align: TextAlign): string {
  return align === TextAlign.Justify ? 'justify' : align;
}
