import { IClosedBookPlace } from "./models";
import { getBookPose } from "./bookObjectMetrics";

/**
 * The shape of a book that flies.
 */
export interface IFlightBook {
  /** Width over height of a cover. */
  aspect: number;
  /** Thickness over height (see `getSpineRatio`). */
  spineRatio: number;
}
/**
 * One moment of a flight.
 */
export interface IFlightFrame {
  /** When this moment comes, from 0 (take-off) to 1 (landing). */
  offset: number;
  /** Where the middle of the face the reader sees is, in viewport pixels. */
  centerX: number;
  centerY: number;
  /** How large the book is drawn, against the height it flies at. */
  scale: number;
  /**
   * How far the middle of the book is moved sideways from `centerX`, in
   * pixels of the height it flies at. Only a raised spine is moved.
   */
  shiftX: number;
  /** The turn about the upright axis, in degrees (see `getFaceAngle`). */
  angle: number;
  /**
   * How far the middle of the book is from the screen, in pixels of the
   * height it flies at. Negative is behind the screen.
   */
  depth: number;
}
/**
 * A flight from one place to another.
 */
export interface IFlightPath {
  /**
   * The height the flying book is drawn at before it is scaled: the larger
   * end, so that the book is only ever made smaller and its pictures stay sharp.
   */
  height: number;
  frames: IFlightFrame[];
}
/**
 * When the book has come clear of where it stood, from 0 to 1.
 */
export const CLEAR_OFFSET = 0.3;
/**
 * How far along the way the book is when it has come clear, from 0 to 1.
 * Less than `CLEAR_OFFSET`: it comes toward the reader before it goes anywhere.
 */
const CLEAR_TRAVEL = 0.18;
/**
 * How much of its turn the book has made when it has come clear.
 */
const CLEAR_TURN = 0.35;
/**
 * How far toward the reader the book is when it has come clear, as a share of
 * the height it flies at.
 */
const CLEAR_PULL_RATIO = 0.35;

/**
 * Works out how a book flies from one place to another, turning from the face
 * the reader sees at the start to the face waiting at the end.
 *
 * The book first comes toward the reader, as a book is pulled off a shelf,
 * and then settles into the other place.
 * @param from where the book takes off.
 * @param to where the book lands.
 * @param book the shape of the book.
 */
export function getFlightPath(from:IClosedBookPlace, to:IClosedBookPlace, book:IFlightBook):IFlightPath {
  const height = Math.max(from.box.height, to.box.height);
  const width = height * book.aspect;
  const thickness = height * book.spineRatio;

  const start = frameAt(0, from, height, width, thickness);
  const end = frameAt(1, { ...to, isRaised: false }, height, width, thickness);
  const clear:IFlightFrame = {
    offset: CLEAR_OFFSET,
    centerX: between(start.centerX, end.centerX, CLEAR_TRAVEL),
    centerY: between(start.centerY, end.centerY, CLEAR_TRAVEL),
    scale: between(start.scale, end.scale, CLEAR_TRAVEL),
    shiftX: between(start.shiftX, end.shiftX, CLEAR_TURN),
    angle: between(start.angle, end.angle, CLEAR_TURN),
    depth: between(start.depth, end.depth, CLEAR_TURN) + height * CLEAR_PULL_RATIO,
  };
  return { height, frames: [start, clear, end] };
}
/**
 * The book standing at one place, drawn at the height it flies at.
 */
function frameAt(offset:number, place:IClosedBookPlace, height:number, width:number, thickness:number):IFlightFrame {
  const { box, face } = place;
  const pose = getBookPose(face, width, thickness, height, place.isRaised === true);
  return {
    offset,
    centerX: box.x + box.width / 2,
    centerY: box.y + box.height / 2,
    scale: box.height / height,
    ...pose,
  };
}
function between(from:number, to:number, progress:number):number {
  return from + (to - from) * progress;
}
