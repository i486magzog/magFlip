import { IBookData, IBookView } from '@magflip/core';

/**
 * A book view that records what the navigator asked it to do.
 *
 * It behaves like `FlipView` in the one way that matters here: while a turn
 * runs it is busy, and it ignores anything asked of it until the turn ends.
 */
export class FakeView implements IBookView {
  readonly id = 'fake-view';
  readonly bookContainerEl = document.createElement('div');
  openPageIndexes: number[] = [1, 2];
  isFlipping = false;
  /** Every turn the view actually made, in order. */
  readonly turns: string[] = [];
  readonly zoomLevels: number[] = [];
  private readonly listeners: (() => void)[] = [];

  getBookContainerEl(): HTMLElement { return this.bookContainerEl; }
  view(_book: IBookData, _openPageIndex?: number): HTMLElement { return this.bookContainerEl; }
  closeViewer(): void {}
  zoom(zoomLevel: number): void { this.zoomLevels.push(zoomLevel); }
  nextPage(): void { this.startTurn('next'); }
  prevPage(): void { this.startTurn('prev'); }
  moveTo(pageIndex: number): void { this.startTurn(`to:${pageIndex}`); }
  onFlipEnd(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index >= 0) { this.listeners.splice(index, 1); }
    };
  }
  /** Ends the running turn, the way `Flipping.finishFlip` does. */
  finishTurn(): void {
    this.isFlipping = false;
    [...this.listeners].forEach(listener => listener());
  }

  private startTurn(what: string): void {
    if (this.isFlipping) { return; }
    this.turns.push(what);
    this.isFlipping = true;
  }
}
/**
 * Gives an element a place on screen, which happy-dom does not compute.
 */
export function place(element: HTMLElement, x: number, y: number, width = 100, height = 40): HTMLElement {
  element.getBoundingClientRect = () => ({
    x, y, width, height, top: y, left: x, right: x + width, bottom: y + height,
    toJSON: () => ({}),
  }) as DOMRect;
  return element;
}
/**
 * Builds a page element holding the given elements, each placed on screen.
 */
export function makePage(elements: HTMLElement[]): HTMLElement {
  const page = document.createElement('div');
  elements.forEach(element => page.appendChild(element));
  document.body.appendChild(page);
  return page;
}
/**
 * A link of the shape `@magflip/render` draws.
 */
export function makeLink(x: number, y: number, onClick?: () => void): HTMLAnchorElement {
  const anchor = document.createElement('a');
  anchor.className = 'mf-link';
  if (onClick) { anchor.addEventListener('click', onClick); }
  place(anchor, x, y);
  return anchor;
}
/**
 * A video box of the shape `@magflip/render` draws, with a stand-in for the
 * media element: happy-dom does not play anything.
 */
export function makeVideo(x: number, y: number): { box: HTMLElement, video: HTMLVideoElement, state: { playing: boolean } } {
  const box = document.createElement('div');
  box.className = 'mf-el mf-el-video';
  const video = document.createElement('video');
  const state = { playing: false };
  Object.defineProperty(video, 'paused', { get: () => !state.playing });
  video.play = () => { state.playing = true; return Promise.resolve(); };
  video.pause = () => { state.playing = false; };
  box.appendChild(video);
  place(box, x, y);
  return { box, video, state };
}
