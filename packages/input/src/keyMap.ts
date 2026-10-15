import { InputAction } from './actions';

/**
 * Maps `KeyboardEvent.key` to an action.
 */
export type KeyMap = Record<string, InputAction>;
/**
 * Maps `KeyboardEvent.keyCode` to an action, for keys that have no `key` name.
 */
export type KeyCodeMap = Record<number, InputAction>;
/**
 * Keys a keyboard and a TV remote send under the same name.
 */
export const DEFAULT_KEY_MAP: KeyMap = {
  ArrowLeft: InputAction.Left,
  ArrowRight: InputAction.Right,
  ArrowUp: InputAction.Up,
  ArrowDown: InputAction.Down,
  Enter: InputAction.Ok,
  Escape: InputAction.Back,
  Backspace: InputAction.Back,
  BrowserBack: InputAction.Back,
  PageDown: InputAction.PageNext,
  PageUp: InputAction.PagePrev,
  ChannelDown: InputAction.PageNext,
  ChannelUp: InputAction.PagePrev,
  MediaPlayPause: InputAction.PlayPause,
  MediaPlay: InputAction.PlayPause,
  MediaPause: InputAction.PlayPause,
};
/**
 * Keys that arrive as a number only. The back button of a TV is the one every
 * platform spells differently.
 *
 * 10009 is Tizen (Samsung), 461 is webOS (LG). An Android TV sends its back
 * button to the app, not to the page, so the app forwards it with
 * `RemoteController.dispatch(InputAction.Back)` instead.
 */
export const DEFAULT_KEY_CODE_MAP: KeyCodeMap = {
  10009: InputAction.Back,
  461: InputAction.Back,
};
/**
 * Replaces or adds entries of the default maps.
 */
export interface IKeyMapOptions {
  /** Entries by `KeyboardEvent.key`. An entry of the same name wins over the default. */
  keyMap?: KeyMap;
  /** Entries by `KeyboardEvent.keyCode`. An entry of the same number wins over the default. */
  keyCodeMap?: KeyCodeMap;
}
/**
 * The part of a keyboard event this package reads. Anything that carries a
 * `key` and a `keyCode` works, which is what a native app bridge sends.
 */
export interface IKeyLike {
  key?: string;
  keyCode?: number;
}
/**
 * Returns what the key press means, or `undefined` when the key is not ours —
 * then the host leaves the event alone.
 *
 * `key` is looked up first: a TV that names its key the usual way needs no
 * number, and a host can rename a key without knowing its code.
 */
export function resolveAction(event: IKeyLike, options: IKeyMapOptions = {}): InputAction | undefined {
  const { key, keyCode } = event;
  if (key !== undefined) {
    const byKey = options.keyMap?.[key] ?? DEFAULT_KEY_MAP[key];
    if (byKey !== undefined) { return byKey; }
  }
  if (keyCode !== undefined) {
    return options.keyCodeMap?.[keyCode] ?? DEFAULT_KEY_CODE_MAP[keyCode];
  }
  return undefined;
}
