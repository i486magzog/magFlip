import { IBookView } from '@magflip/core';
import { DirectionAction, InputAction, isDirection } from './actions';
import { FlipDirection, FlipQueue } from './flipQueue';
import { collectFocusTargets, DEFAULT_FOCUS_SELECTOR, IFocusTarget } from './focusTargets';
import { findNextFocus } from './spatialFocus';
import './input.css';

/**
 * What the arrow keys do right now.
 */
export enum NavigatorMode {
  /** Left and right turn the page. This is where a reader starts. */
  Page = 'page',
  /** Arrows walk the links and media of the open pages. */
  Element = 'element',
}
/**
 * Class put on the element the reader is standing on.
 *
 * The element is marked rather than really focused: a widget is a cross-origin
 * iframe, and once focus moves inside one the page stops receiving key events,
 * so the reader could not get out again.
 */
export const FOCUSED_CLASS_NAME = 'mf-focused';

export interface IBookNavigatorOptions {
  /** The view the reader is looking at. Any `IBookView` works. */
  view: IBookView;
  /**
   * Returns the element a page draws into, or nothing when that page has not
   * been drawn. Pages build themselves when first asked, so a host that keeps
   * its own page list should check `hasElements` before answering.
   */
  getPageContentEl: (pageIndex: number) => HTMLElement | null | undefined;
  /**
   * Called when the reader presses Back with nothing open on the page. The
   * host decides what that means: close an overlay, close the book, leave the
   * app. Order differs per platform, so this package does not choose.
   */
  onBack?: () => void;
  /** Called after the mode changes, for a host that shows a hint on screen. */
  onModeChange?: (mode: NavigatorMode) => void;
  /** Overrides which elements the reader can reach. */
  focusSelector?: string;
  /** How many turns may wait while one is running. */
  flipQueueLimit?: number;
  /** Zoom steps `ZoomIn` / `ZoomOut` walk through. */
  zoom?: { min?: number, max?: number, step?: number };
  /** How far one arrow press moves a zoomed-in book, in screen pixels. */
  panStep?: number;
}
const DEFAULT_ZOOM = { min: 1, max: 3, step: 0.25 };
const DEFAULT_PAN_STEP = 120;
/**
 * Turns reader actions into calls on a book view.
 *
 * It owns two things the view does not: which of the two modes the arrows are
 * in, and the turns asked for while the view was busy.
 */
export class BookNavigator {
  private readonly options: IBookNavigatorOptions;
  private readonly queue: FlipQueue;
  private readonly zoomRange: Required<NonNullable<IBookNavigatorOptions['zoom']>>;
  private readonly removeFlipEndListener: () => void;
  private _mode: NavigatorMode = NavigatorMode.Page;
  private focused: IFocusTarget | undefined;

  constructor(options: IBookNavigatorOptions) {
    this.options = options;
    this.queue = new FlipQueue(options.flipQueueLimit ?? 1);
    this.zoomRange = { ...DEFAULT_ZOOM, ...options.zoom };
    this.removeFlipEndListener = options.view.onFlipEnd(() => { this.onFlipEnd(); });
  }
  /**
   * What the arrow keys do right now.
   */
  get mode(): NavigatorMode { return this._mode; }
  /**
   * The element the reader is standing on, if any.
   */
  get focusedElement(): HTMLElement | undefined { return this.focused?.element; }
  /**
   * Does what the action means and returns whether it was used. An unused
   * action is left to the host — a key it knows, or the browser's own.
   */
  handle(action: InputAction, options: { isRepeat?: boolean } = {}): boolean {
    switch (action) {
      case InputAction.PageNext: return this.turn('next', options.isRepeat);
      case InputAction.PagePrev: return this.turn('prev', options.isRepeat);
      case InputAction.Ok: return this.enterOrUse();
      case InputAction.Back: return this.goBack();
      case InputAction.PlayPause: return this.playOrPause();
      case InputAction.ZoomIn: return this.zoomBy(this.zoomRange.step);
      case InputAction.ZoomOut: return this.zoomBy(-this.zoomRange.step);
      default: return isDirection(action) ? this.move(action, options.isRepeat) : false;
    }
  }
  /**
   * Stands on the first element of the open pages and switches to element mode.
   * Returns false when the pages hold nothing to use.
   */
  enterElementMode(): boolean {
    const target = findNextFocus(undefined, this.focusRects(), InputAction.Right);
    if (!target) { return false; }
    this.focusTargetOf(target.id);
    this.setMode(NavigatorMode.Element);
    return true;
  }
  /**
   * Leaves element mode: nothing is marked and the arrows turn pages again.
   */
  leaveElementMode(): void {
    this.clearFocus();
    this.setMode(NavigatorMode.Page);
  }
  /**
   * Unmarks the element the reader was standing on.
   */
  clearFocus(): void {
    this.focused?.element.classList.remove(FOCUSED_CLASS_NAME);
    this.focused = undefined;
  }
  /**
   * Stops listening to the view and forgets waiting turns. Call it when the
   * book closes.
   */
  destroy(): void {
    this.removeFlipEndListener();
    this.queue.clear();
    this.leaveElementMode();
  }

  private setMode(mode: NavigatorMode): void {
    if (this._mode === mode) { return; }
    this._mode = mode;
    this.options.onModeChange?.(mode);
  }
  /**
   * The elements of the pages the reader is looking at, measured now: a page
   * moves while it turns, and its elements are built only when first shown.
   */
  private targets(): IFocusTarget[] {
    const contentEls = this.options.view.openPageIndexes.map(index => this.options.getPageContentEl(index));
    return collectFocusTargets(contentEls, this.options.focusSelector ?? DEFAULT_FOCUS_SELECTOR);
  }
  private focusRects() { return this.targets().map(target => target.rect); }
  /**
   * Marks the target of the given id, if it is still on the page.
   */
  private focusTargetOf(id: string): void {
    const target = this.targets().find(candidate => candidate.id === id);
    this.clearFocus();
    if (!target) { return; }
    target.element.classList.add(FOCUSED_CLASS_NAME);
    this.focused = target;
  }
  private move(direction: DirectionAction, isRepeat?: boolean): boolean {
    if (this._mode === NavigatorMode.Page) {
      // While zoomed in the arrows walk around the page. Only once the book
      // cannot move further that way does the press turn a page, which is how
      // a reader gets to the next spread without zooming out first.
      if (this.panTowards(direction)) { return true; }
      if (direction === InputAction.Left) { return this.turn('prev', isRepeat); }
      if (direction === InputAction.Right) { return this.turn('next', isRepeat); }
      return false;
    }

    const next = findNextFocus(this.focused?.rect, this.focusRects(), direction);
    if (next) {
      this.focusTargetOf(next.id);
      return true;
    }
    // Nothing that way. Left and right carry on to the next spread, which is
    // what a reader means by pressing right at the right edge of a page.
    if (direction === InputAction.Left) { return this.turnAndLeaveElementMode('prev', isRepeat); }
    if (direction === InputAction.Right) { return this.turnAndLeaveElementMode('next', isRepeat); }
    return false;
  }
  private turnAndLeaveElementMode(direction: FlipDirection, isRepeat?: boolean): boolean {
    const turned = this.turn(direction, isRepeat);
    if (turned) { this.leaveElementMode(); }
    return turned;
  }
  /**
   * Turns a page, or remembers the request while the view is busy.
   */
  private turn(direction: FlipDirection, isRepeat?: boolean): boolean {
    const view = this.options.view;
    if (view.isFlipping) {
      // A held-down key would otherwise fill the queue with turns the reader
      // never sees, and the book would run on after they let go.
      if (isRepeat && !this.queue.isEmpty) { return true; }
      this.queue.push(direction);
      return true;
    }
    this.clearFocus();
    if (direction === 'next') { view.nextPage(); } else { view.prevPage(); }
    return true;
  }
  /**
   * The pages changed, so what the reader was standing on is gone. Element
   * mode ends too: a reader who lands on a new spread expects left and right
   * to turn pages again, whether they got there by turning or by a link.
   */
  private onFlipEnd(): void {
    this.leaveElementMode();
    const waiting = this.queue.shift();
    if (waiting) { this.turn(waiting); }
  }
  private enterOrUse(): boolean {
    if (this._mode === NavigatorMode.Page) { return this.enterElementMode(); }
    return this.use();
  }
  /**
   * Uses the element the reader stands on. A link is clicked, so the renderer
   * decides what the link does (`onPageLink` / `onUrlLink`) and this package
   * never has to know. Media starts or stops.
   */
  private use(): boolean {
    const element = this.focused?.element;
    if (!element) { return false; }
    if (element.tagName === 'A') {
      element.click();
      return true;
    }
    return this.playOrPause();
  }
  private playOrPause(): boolean {
    const media = this.focused?.element.querySelector('video, audio') as HTMLMediaElement | null;
    if (!media) { return false; }
    if (media.paused) {
      // A browser may refuse to play without a gesture it recognises.
      void Promise.resolve(media.play()).catch(() => {});
    } else {
      media.pause();
    }
    return true;
  }
  private goBack(): boolean {
    if (this._mode === NavigatorMode.Element) {
      this.leaveElementMode();
      return true;
    }
    if (!this.options.onBack) { return false; }
    this.options.onBack();
    return true;
  }
  /**
   * Moves the book the way the reader is looking. Pressing left shows what is
   * on the left, which means the book itself moves right.
   *
   * Up and down move whenever the book is taller than the screen, since they
   * do nothing else on a page. Left and right are the page keys, so they only
   * move a book the reader chose to zoom into — otherwise a book a little
   * wider than the window would slide instead of turning.
   */
  private panTowards(direction: DirectionAction): boolean {
    const view = this.options.view;
    const step = this.options.panStep ?? DEFAULT_PAN_STEP;
    switch (direction) {
      case InputAction.Up: return view.pan(0, step);
      case InputAction.Down: return view.pan(0, -step);
      case InputAction.Left: return view.zoomLevel > 1 && view.pan(step, 0);
      case InputAction.Right: return view.zoomLevel > 1 && view.pan(-step, 0);
    }
  }
  private zoomBy(step: number): boolean {
    const view = this.options.view;
    const { min, max } = this.zoomRange;
    // The view is asked rather than counted from here: a host with its own
    // zoom control (a slider, a pinch) changes it without telling us.
    const level = Math.min(max, Math.max(min, view.zoomLevel + step));
    if (level === view.zoomLevel) { return false; }
    view.zoom(level);
    return true;
  }
}
