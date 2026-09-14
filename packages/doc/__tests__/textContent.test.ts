import { describe, expect, it } from 'vitest';
import { ITextContent, TextAlign, TextBlockType, TextFieldKind } from '../src/model/text';
import { getPlainText, normalizeTextContent, resolveTextFields } from '../src/text/textContent';

function paragraph(inlines: ITextContent['blocks'][number]['inlines']): ITextContent {
  return { blocks: [{ type: TextBlockType.Paragraph, align: TextAlign.Start, inlines }] };
}

describe('normalizeTextContent', () => {
  it('merges neighbouring runs with the same marks', () => {
    const content = paragraph([{ text: 'Hel' }, { text: 'lo' }, { text: '!', marks: { isItalic: true } }]);

    expect(normalizeTextContent(content).blocks[0]?.inlines).toEqual([
      { text: 'Hello' },
      { text: '!', marks: { isItalic: true } },
    ]);
  });

  it('ignores the order in which marks were written', () => {
    const content = paragraph([
      { text: 'a', marks: { isItalic: true, color: '#000000' } },
      { text: 'b', marks: { color: '#000000', isItalic: true } },
    ]);

    expect(normalizeTextContent(content).blocks[0]?.inlines).toHaveLength(1);
  });

  it('drops empty runs and empty mark objects', () => {
    const content = paragraph([{ text: '' }, { text: 'a', marks: {} }]);

    expect(normalizeTextContent(content).blocks[0]?.inlines).toEqual([{ text: 'a' }]);
  });

  it('keeps a field between two runs', () => {
    const content = paragraph([{ text: 'p. ' }, { field: TextFieldKind.PageNumber }, { text: ' of ' }]);

    expect(normalizeTextContent(content).blocks[0]?.inlines).toHaveLength(3);
  });
});

describe('resolveTextFields', () => {
  const content = paragraph([
    { text: 'Page ' },
    { field: TextFieldKind.PageNumber },
    { text: ' of ' },
    { field: TextFieldKind.PageCount },
  ]);

  it('fills in the values of the page', () => {
    const resolved = resolveTextFields(content, { pageNumber: 7, pageCount: 120, bookTitle: 'Magzog' });

    expect(getPlainText(resolved)).toBe('Page 7 of 120');
  });

  it('leaves the field empty on a page without a number', () => {
    const resolved = resolveTextFields(content, { pageNumber: null, pageCount: 120, bookTitle: 'Magzog' });

    expect(getPlainText(resolved)).toBe('Page  of 120');
  });

  it('keeps the marks of the field', () => {
    const numbered = paragraph([{ field: TextFieldKind.PageNumber, marks: { isItalic: true } }]);

    expect(resolveTextFields(numbered, { pageNumber: 2, pageCount: 9, bookTitle: '' }).blocks[0]?.inlines)
      .toEqual([{ text: '2', marks: { isItalic: true } }]);
  });
});
