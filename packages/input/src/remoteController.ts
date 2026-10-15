import { InputAction } from './actions';
import { BookNavigator, IBookNavigatorOptions } from './bookNavigator';
import { IKeyMapOptions, resolveAction } from './keyMap';

export interface IRemoteControllerOptions extends IBookNavigatorOptions, IKeyMapOptions {
  /**
   * Where key presses are listened for. Defaults to `document`, which is where
   * a TV sends them: nothing on the page is really focused.
   */
  target?: Pick<EventTarget, 'addEventListener' | 'removeEventListener'>;
}
/**
 * Drives a book with a keyboard or a TV remote.
 *
 * ```ts
 * const controller = new RemoteController({
 *   view: flipView,
 *   getPageContentEl: index => book.getPage(index)?.contentEl,
 *   onBack: () => bookViewer.closeViewer(),
 * });
 * ```
 */
export class RemoteController {
  /** Does the work. Reach for it to read the mode or to move focus yourself. */
  readonly navigator: BookNavigator;
  private readonly options: IRemoteControllerOptions;
  private readonly target: Pick<EventTarget, 'addEventListener' | 'removeEventListener'>;
  private readonly onKeyDown: (event: Event) => void;

  constructor(options: IRemoteControllerOptions) {
    this.options = options;
    this.navigator = new BookNavigator(options);
    this.target = options.target ?? document;
    this.onKeyDown = (event: Event) => { this.handleKeyDown(event as KeyboardEvent); };
    this.target.addEventListener('keydown', this.onKeyDown);
  }
  /**
   * Does what an action means, without a key press.
   *
   * An app around the page uses it for keys that never reach the page: the
   * back button of an Android TV goes to the app, not to the document.
   *
   * @returns whether the action was used.
   */
  dispatch(action: InputAction, options: { isRepeat?: boolean } = {}): boolean {
    return this.navigator.handle(action, options);
  }
  /**
   * Stops listening and lets go of the view. Call it when the viewer closes:
   * a controller left behind keeps answering keys for a book nobody sees.
   */
  destroy(): void {
    this.target.removeEventListener('keydown', this.onKeyDown);
    this.navigator.destroy();
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const action = resolveAction(event, this.options);
    if (!action) { return; }
    // Only a key we used is taken from the page: the host keeps its shortcuts.
    if (this.dispatch(action, { isRepeat: event.repeat })) { event.preventDefault(); }
  }
}
