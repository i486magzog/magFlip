import { BookFace } from "./models";

/**
 * The thinnest a book is drawn, as a share of its height. A real magazine is
 * thinner, but then its spine would have no room for the title.
 */
export const MIN_SPINE_RATIO = 0.14;
/**
 * The thickest a book is drawn, as a share of its height. Past this it stops
 * looking like a book and starts looking like a box.
 */
export const MAX_SPINE_RATIO = 0.3;
/**
 * How much each page adds to the spine, as a share of the book's height. It is
 * many times real paper, so that a thick book and a thin one can be told apart
 * at a glance.
 */
export const SPINE_RATIO_PER_PAGE = 0.001;
/**
 * How far a book comes toward the reader when it is raised - under the
 * pointer, or holding the keyboard focus - as a share of its height.
 */
export const RAISE_PULL_RATIO = 0.14;
/**
 * How far a raised book turns, in degrees, to show a little of the face next
 * to the one the reader was looking at.
 */
export const RAISE_TURN = 18;

/**
 * How thick a closed book is drawn, as a share of its height.
 * @param pageCount the number of pages in the book.
 */
export function getSpineRatio(pageCount:number):number {
  const pages = Number.isFinite(pageCount) ? Math.max(0, pageCount) : 0;
  return Math.min(MAX_SPINE_RATIO, MIN_SPINE_RATIO + pages * SPINE_RATIO_PER_PAGE);
}
/**
 * How far a closed book is turned about its upright axis, in degrees, for the
 * reader to see one of its faces.
 *
 * A positive turn brings the spine - the left edge of a book read from left
 * to right - toward the reader.
 */
export function getFaceAngle(face:BookFace):number {
  if(face === BookFace.Spine){ return 90; }
  if(face === BookFace.Back){ return 180; }
  return 0;
}
/**
 * How far the middle of a closed book lies behind the screen when one of its
 * faces is shown flat on the screen: half the width behind the spine, half the
 * thickness behind a cover. Negative is behind.
 * @param face the face the reader sees.
 * @param width the width of a cover.
 * @param thickness the width of the spine.
 */
export function getFaceDepth(face:BookFace, width:number, thickness:number):number {
  return face === BookFace.Spine ? -width / 2 : -thickness / 2;
}
/**
 * Which way a raised book turns, in degrees: a spine turns its front cover
 * toward the reader, a cover turns its spine toward the reader.
 */
export function getRaiseTurn(face:BookFace):number {
  return face === BookFace.Front ? RAISE_TURN : -RAISE_TURN;
}
/**
 * How a closed book is held: moved sideways and toward the reader, then
 * turned about its upright axis. `bookObject.css` draws the same poses.
 */
export interface IBookPose {
  /** Sideways, in pixels. Positive is to the right. */
  shiftX: number;
  /** Toward the reader, in pixels. Negative is behind the screen. */
  depth: number;
  /** The turn about the upright axis, in degrees (see `getFaceAngle`). */
  angle: number;
}
/**
 * The pose of a closed book that shows one face, resting or raised.
 *
 * A raised spine turns about itself, so that it stays in its place on a shelf
 * while its front cover swings out beside it. A raised cover turns about its
 * middle.
 * @param face the face the reader sees.
 * @param width the width of a cover.
 * @param thickness the width of the spine.
 * @param height the height of the book.
 * @param isRaised whether the book is pulled toward the reader.
 */
export function getBookPose(face:BookFace, width:number, thickness:number, height:number, isRaised:boolean):IBookPose {
  const angle = getFaceAngle(face);
  const depth = getFaceDepth(face, width, thickness);
  if(!isRaised){ return { shiftX: 0, depth, angle }; }

  const pull = height * RAISE_PULL_RATIO;
  const turn = getRaiseTurn(face);
  if(face !== BookFace.Spine){ return { shiftX: 0, depth: depth + pull, angle: angle + turn }; }

  // Turning by `turn` about the middle of the book would carry the spine
  // sideways; moving the book back by as much keeps the spine where it stood.
  const radians = Math.abs(turn) * Math.PI / 180;
  return {
    shiftX: width / 2 * Math.sin(radians),
    depth: -width / 2 * Math.cos(radians) + pull,
    angle: angle + turn,
  };
}
