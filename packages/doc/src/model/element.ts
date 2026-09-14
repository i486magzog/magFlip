import { JsonObject } from '../common/json';
import { IRect } from '../common/geometry';
import { ILink } from './link';
import { IFill, IStroke } from './paint';
import { ITextContent, ITextStyle, TextSizing, VerticalAlign } from './text';

/**
 * Element types.
 */
export enum ElementType {
  Group = 'group',
  Image = 'image',
  Text = 'text',
  Shape = 'shape',
  Video = 'video',
  Audio = 'audio',
  Widget = 'widget',
}
/**
 * How an image or a video fills its box.
 */
export enum MediaFit {
  /** Fills the box and crops the overflow. */
  Cover = 'cover',
  /** Fits inside the box and leaves empty space. */
  Contain = 'contain',
  /** Stretches to the box, ignoring the aspect ratio. */
  Fill = 'fill',
}
/**
 * Shapes drawn by a shape element.
 */
export enum ShapeKind {
  Rectangle = 'rectangle',
  Ellipse = 'ellipse',
  /** A straight line from the left center to the right center of the box. */
  Line = 'line',
  /** An SVG path, see `IShapeElement.path`. */
  Path = 'path',
}
/**
 * Fields shared by every element.
 *
 * Every field is written independently in the collaboration document, so two
 * users changing different fields of the same element never overwrite each other.
 */
export interface IElementBase {
  /** Unique within the surface. */
  id: string;
  type: ElementType;
  /** Name shown in the layer panel. Empty means "use the default name". */
  name: string;
  /** Id of the parent group, or `null` when the element sits on the surface. */
  parentId: string | null;
  /** Fractional index that orders siblings from back (smaller) to front. */
  order: string;
  /** Opacity, 0 - 1. Applies to the whole subtree of a group. */
  opacity: number;
  /** Hidden elements are neither rendered on the canvas nor published. */
  isHidden: boolean;
  /** Locked elements cannot be picked on the canvas. */
  isLocked: boolean;
  /** Followed when a reader clicks the element. */
  link?: ILink;
}
/**
 * An element that owns a box in surface coordinates.
 *
 * A group is the only element without a box: its bounds are the union of its
 * children, so moving a group moves each child instead of a container.
 */
export interface IBoxElement extends IElementBase {
  /** Left edge in surface coordinates before rotation, in px. */
  x: number;
  /** Top edge in surface coordinates before rotation, in px. */
  y: number;
  width: number;
  height: number;
  /** Clockwise rotation around the center of the box, in degrees. */
  rotation: number;
  /** Mirrors the content horizontally. Does not change the box. */
  isFlippedX: boolean;
  /** Mirrors the content vertically. Does not change the box. */
  isFlippedY: boolean;
}
/**
 * A logical group of elements. Children keep surface coordinates.
 */
export interface IGroupElement extends IElementBase {
  type: ElementType.Group;
}
/**
 * A raster image.
 */
export interface IImageElement extends IBoxElement {
  type: ElementType.Image;
  assetId: string;
  fit: MediaFit;
  /**
   * Region of the source image to show, in normalized coordinates (0 - 1),
   * applied before `fit`. `null` uses the whole image.
   */
  crop: IRect | null;
  /** Alternative text for screen readers. */
  alt: string;
}
/**
 * Rich text.
 */
export interface ITextElement extends IBoxElement {
  type: ElementType.Text;
  content: ITextContent;
  /** Paragraph defaults; runs override single properties with their marks. */
  style: ITextStyle;
  verticalAlign: VerticalAlign;
  sizing: TextSizing;
  /** Background painted behind the text box. */
  fill: IFill | null;
  /** Inner padding in px. */
  padding: number;
}
/**
 * A vector shape.
 */
export interface IShapeElement extends IBoxElement {
  type: ElementType.Shape;
  shape: ShapeKind;
  /**
   * SVG path data, drawn in a `0 0 width height` viewBox.
   * Used only when `shape` is `Path`.
   */
  path: string | null;
  fill: IFill | null;
  stroke: IStroke | null;
  /** Corner radius of a rectangle, in px. */
  cornerRadius: number;
}
/**
 * A video.
 */
export interface IVideoElement extends IBoxElement {
  type: ElementType.Video;
  assetId: string;
  /** Image shown before playback starts. */
  posterAssetId: string | null;
  fit: MediaFit;
  isAutoplay: boolean;
  isLooping: boolean;
  isMuted: boolean;
  hasControls: boolean;
}
/**
 * A sound clip.
 */
export interface IAudioElement extends IBoxElement {
  type: ElementType.Audio;
  assetId: string;
  isAutoplay: boolean;
  isLooping: boolean;
  hasControls: boolean;
}
/**
 * An interactive widget rendered in a sandboxed iframe.
 *
 * `widgetType` is the id of a widget registered on the server (`vendor.name`);
 * the server holds the URL and the schema of `props`.
 */
export interface IWidgetElement extends IBoxElement {
  type: ElementType.Widget;
  widgetType: string;
  widgetVersion: number;
  props: JsonObject;
}
/**
 * Any element of a surface.
 */
export type IElement =
  | IGroupElement
  | IImageElement
  | ITextElement
  | IShapeElement
  | IVideoElement
  | IAudioElement
  | IWidgetElement;
/**
 * Any element except a group, that is, every element with a box.
 */
export type BoxElement = Exclude<IElement, IGroupElement>;

/**
 * Returns true when the element owns a box in surface coordinates.
 */
export function isBoxElement(element: IElement): element is BoxElement {
  return element.type !== ElementType.Group;
}
/**
 * Returns the box of the element, ignoring its rotation.
 */
export function getElementRect(element: BoxElement): IRect {
  return { x: element.x, y: element.y, width: element.width, height: element.height };
}
