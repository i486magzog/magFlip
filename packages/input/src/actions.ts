/**
 * What a key press means to the reader, whatever key sent it.
 *
 * The rest of the package only ever sees an action, so a TV whose remote sends
 * its own key codes is handled in one place (`keyMap.ts`).
 */
export enum InputAction {
  /** Move left: to the previous spread, or to the element on the left. */
  Left = 'left',
  /** Move right: to the next spread, or to the element on the right. */
  Right = 'right',
  Up = 'up',
  Down = 'down',
  /** The middle button of a remote, or Enter: enter the page, or use the focused element. */
  Ok = 'ok',
  /** Leave what is open now: the focused element, the page, then the book. */
  Back = 'back',
  /** Turn one spread, whichever way the reader is facing. */
  PageNext = 'pageNext',
  PagePrev = 'pagePrev',
  /** Start or stop the focused video or audio. */
  PlayPause = 'playPause',
  ZoomIn = 'zoomIn',
  ZoomOut = 'zoomOut',
}
/**
 * The four directions, as a narrower type than `InputAction`.
 */
export type DirectionAction =
  | InputAction.Left
  | InputAction.Right
  | InputAction.Up
  | InputAction.Down;
/**
 * True when the action is one of the four directions.
 */
export function isDirection(action: InputAction): action is DirectionAction {
  return action === InputAction.Left
    || action === InputAction.Right
    || action === InputAction.Up
    || action === InputAction.Down;
}
