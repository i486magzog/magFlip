import { SCHEMA_VERSION } from '../common/constants';
import { ISize } from '../common/geometry';
import { createId } from '../common/ids';
import { createOrderBetween } from '../common/order';
import { IBookDoc, ReadingDirection } from './book';
import { ElementType, IBoxElement, IElement, IElementBase, MediaFit, ShapeKind } from './element';
import { ISurfaceDoc } from './surface';
import { ITextStyle, TextAlign, TextSizing, VerticalAlign } from './text';

/**
 * Default page size in px, the same as the MagFlip viewer default.
 */
export const DEFAULT_PAGE_SIZE: ISize = { width: 600, height: 900 };
/**
 * Default paragraph style of a new text element.
 */
export const DEFAULT_TEXT_STYLE: ITextStyle = {
  fontFamily: 'sans-serif',
  fontSize: 16,
  fontWeight: 400,
  isItalic: false,
  color: '#000000',
  lineHeight: 1.5,
  letterSpacing: 0,
};
/**
 * Default box of a new element, in px.
 */
const DEFAULT_ELEMENT_SIZE: ISize = { width: 200, height: 200 };

/**
 * An element of one concrete type.
 */
export type ElementOfType<T extends ElementType> = Extract<IElement, { type: T }>;

/**
 * Creates an empty book manifest.
 */
export function createBookDoc(init: Partial<IBookDoc> = {}): IBookDoc {
  return {
    schemaVersion: SCHEMA_VERSION,
    id: createId(),
    meta: { title: '', author: '', description: '', language: 'ko' },
    pageSize: { ...DEFAULT_PAGE_SIZE },
    readingDirection: ReadingDirection.LeftToRight,
    pageNumbering: { firstNumberedPageIndex: 0, firstNumber: 1 },
    surfaces: {},
    masters: {},
    fonts: {},
    ...init,
  };
}
/**
 * Creates an empty surface.
 */
export function createSurfaceDoc(init: Partial<ISurfaceDoc> = {}): ISurfaceDoc {
  return {
    id: createId(),
    background: null,
    extent: null,
    masterId: null,
    masterOverrides: {},
    elements: {},
    ...init,
  };
}
/**
 * Creates an element of the given type, filling every field the schema requires.
 */
export function createElement<T extends ElementType>(type: T, init: Partial<ElementOfType<T>> = {}): ElementOfType<T> {
  const base: IElementBase = {
    id: createId(),
    type,
    name: '',
    parentId: null,
    order: createOrderBetween(null, null),
    opacity: 1,
    isHidden: false,
    isLocked: false,
  };
  const box: Omit<IBoxElement, keyof IElementBase> = {
    x: 0,
    y: 0,
    width: DEFAULT_ELEMENT_SIZE.width,
    height: DEFAULT_ELEMENT_SIZE.height,
    rotation: 0,
    isFlippedX: false,
    isFlippedY: false,
  };
  const typeDefaults = type === ElementType.Group ? {} : { ...box, ...getTypeDefaults(type) };
  return { ...base, ...typeDefaults, ...init, type } as ElementOfType<T>;
}

function getTypeDefaults(type: ElementType): Record<string, unknown> {
  switch (type) {
    case ElementType.Image:
      return { assetId: '', fit: MediaFit.Cover, crop: null, alt: '' };
    case ElementType.Text:
      return {
        content: { blocks: [{ type: 'paragraph', align: TextAlign.Start, inlines: [] }] },
        style: { ...DEFAULT_TEXT_STYLE },
        verticalAlign: VerticalAlign.Top,
        sizing: TextSizing.AutoHeight,
        fill: null,
        padding: 0,
      };
    case ElementType.Shape:
      return { shape: ShapeKind.Rectangle, path: null, fill: null, stroke: null, cornerRadius: 0 };
    case ElementType.Video:
      return {
        assetId: '',
        posterAssetId: null,
        fit: MediaFit.Cover,
        isAutoplay: false,
        isLooping: false,
        isMuted: true,
        hasControls: true,
      };
    case ElementType.Audio:
      return { assetId: '', isAutoplay: false, isLooping: false, hasControls: true };
    case ElementType.Widget:
      return { widgetType: '', widgetVersion: 1, props: {} };
    default:
      return {};
  }
}
