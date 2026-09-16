import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InputAction } from '../src/actions';
import { BookNavigator, FOCUSED_CLASS_NAME, NavigatorMode } from '../src/bookNavigator';
import { FakeView, makeLink, makePage, makeVideo } from './helpers';

/**
 * Two pages side by side, each with two links:
 *
 *   left page:  leftTop (0,0)    leftBottom (0,200)
 *   right page: rightTop (400,0) rightBottom (400,200)
 */
function twoPages() {
  const leftTop = makeLink(0, 0);
  const leftBottom = makeLink(0, 200);
  const rightTop = makeLink(400, 0);
  const rightBottom = makeLink(400, 200);
  const pages = [makePage([leftTop, leftBottom]), makePage([rightTop, rightBottom])];
  return { pages, leftTop, leftBottom, rightTop, rightBottom };
}

function navigatorOf(view: FakeView, pages: HTMLElement[], options = {}) {
  return new BookNavigator({
    view,
    getPageContentEl: (index) => pages[view.openPageIndexes.indexOf(index)],
    ...options,
  });
}

describe('BookNavigator in page mode', () => {
  beforeEach(() => { document.body.replaceChildren(); });

  it('turns the page with left and right', () => {
    const view = new FakeView();
    const navigator = navigatorOf(view, twoPages().pages);

    expect(navigator.handle(InputAction.Right)).toBe(true);
    view.finishTurn();
    navigator.handle(InputAction.Left);

    expect(view.turns).toEqual(['next', 'prev']);
  });

  it('keeps a press made during a turn and does it when the turn ends', () => {
    const view = new FakeView();
    const navigator = navigatorOf(view, twoPages().pages);

    navigator.handle(InputAction.Right);
    navigator.handle(InputAction.Right);   // the view is busy and ignores this
    expect(view.turns).toEqual(['next']);

    view.finishTurn();

    expect(view.turns).toEqual(['next', 'next']);
  });

  it('does the last thing asked for, so a reader can change their mind', () => {
    const view = new FakeView();
    const navigator = navigatorOf(view, twoPages().pages);

    navigator.handle(InputAction.Right);
    navigator.handle(InputAction.Right);
    navigator.handle(InputAction.Left);
    view.finishTurn();

    expect(view.turns).toEqual(['next', 'prev']);
  });

  it('does not pile up turns while a key is held down', () => {
    const view = new FakeView();
    const navigator = navigatorOf(view, twoPages().pages);

    navigator.handle(InputAction.Right);
    for (let i = 0; i < 10; i++) { navigator.handle(InputAction.Right, { isRepeat: true }); }
    view.finishTurn();
    view.finishTurn();

    expect(view.turns).toEqual(['next', 'next']);
  });

  it('turns the page on the page keys of a remote, whatever the mode', () => {
    const view = new FakeView();
    const navigator = navigatorOf(view, twoPages().pages);

    navigator.handle(InputAction.PageNext);
    view.finishTurn();
    navigator.handle(InputAction.PagePrev);

    expect(view.turns).toEqual(['next', 'prev']);
  });

  it('hands Back to the host, and says so when nobody wants it', () => {
    const view = new FakeView();
    const onBack = vi.fn();

    expect(navigatorOf(view, twoPages().pages, { onBack }).handle(InputAction.Back)).toBe(true);
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(navigatorOf(view, twoPages().pages).handle(InputAction.Back)).toBe(false);
  });

  it('leaves up and down alone, so the host may use them', () => {
    const view = new FakeView();
    const navigator = navigatorOf(view, twoPages().pages);

    expect(navigator.handle(InputAction.Up)).toBe(false);
    expect(view.turns).toEqual([]);
  });

  it('zooms within its range and stops at the ends', () => {
    const view = new FakeView();
    const navigator = navigatorOf(view, twoPages().pages, { zoom: { min: 1, max: 1.5, step: 0.5 } });

    expect(navigator.handle(InputAction.ZoomIn)).toBe(true);
    navigator.handle(InputAction.ZoomIn);
    expect(navigator.handle(InputAction.ZoomIn)).toBe(false);
    navigator.handle(InputAction.ZoomOut);

    expect(view.zoomLevels).toEqual([1.5, 1]);
  });

  it('zooms from where the view stands, not from what it last set', () => {
    const view = new FakeView();
    const navigator = navigatorOf(view, twoPages().pages, { zoom: { min: 1, max: 3, step: 0.5 } });
    // The host zoomed with its own control, a slider say.
    view.zoomLevel = 2;

    navigator.handle(InputAction.ZoomIn);

    expect(view.zoomLevels).toEqual([2.5]);
  });
});

describe('BookNavigator with a book larger than the screen', () => {
  beforeEach(() => { document.body.replaceChildren(); });

  it('walks around the page with the arrows instead of turning', () => {
    const view = new FakeView();
    view.zoomLevel = 2;
    view.panLimit = 300;
    const navigator = navigatorOf(view, twoPages().pages, { panStep: 100 });

    navigator.handle(InputAction.Right);
    navigator.handle(InputAction.Down);

    // Looking right and down means the book moves left and up.
    expect(view.panOffset).toEqual({ x: -100, y: -100 });
    expect(view.turns).toEqual([]);
  });

  it('turns the page once the book cannot move that way any more', () => {
    const view = new FakeView();
    view.zoomLevel = 2;
    view.panLimit = 100;
    const navigator = navigatorOf(view, twoPages().pages, { panStep: 100 });

    navigator.handle(InputAction.Right);          // moves to the edge
    expect(view.turns).toEqual([]);

    navigator.handle(InputAction.Right);          // nowhere left to go

    expect(view.turns).toEqual(['next']);
  });

  it('stays put at the top and bottom, where there is no page to turn to', () => {
    const view = new FakeView();
    view.zoomLevel = 2;
    view.panLimit = 0;
    const navigator = navigatorOf(view, twoPages().pages);

    expect(navigator.handle(InputAction.Up)).toBe(false);
    expect(navigator.handle(InputAction.Down)).toBe(false);
    expect(view.turns).toEqual([]);
  });

  it('turns the page when the book fits and has nowhere to move', () => {
    const view = new FakeView();
    view.panLimit = 0;
    const navigator = navigatorOf(view, twoPages().pages);

    navigator.handle(InputAction.Right);

    expect(view.panOffset).toEqual({ x: 0, y: 0 });
    expect(view.turns).toEqual(['next']);
  });

  it('scrolls a tall book up and down at zoom 1, where nothing else uses those keys', () => {
    const view = new FakeView();
    view.zoomLevel = 1;
    view.panLimit = 200;   // taller than the screen, as a tall book can be
    const navigator = navigatorOf(view, twoPages().pages, { panStep: 100 });

    expect(navigator.handle(InputAction.Down)).toBe(true);

    expect(view.panOffset).toEqual({ x: 0, y: -100 });
  });

  it('still turns the page on left and right at zoom 1, rather than sliding a little', () => {
    const view = new FakeView();
    view.zoomLevel = 1;
    view.panLimit = 200;   // a book slightly wider than the window
    const navigator = navigatorOf(view, twoPages().pages, { panStep: 100 });

    navigator.handle(InputAction.Right);

    expect(view.panOffset.x).toBe(0);
    expect(view.turns).toEqual(['next']);
  });
});

describe('BookNavigator in element mode', () => {
  beforeEach(() => { document.body.replaceChildren(); });

  it('enters on Ok, standing on the first element', () => {
    const view = new FakeView();
    const { pages, leftTop } = twoPages();
    const navigator = navigatorOf(view, pages);

    expect(navigator.handle(InputAction.Ok)).toBe(true);

    expect(navigator.mode).toBe(NavigatorMode.Element);
    expect(navigator.focusedElement).toBe(leftTop);
    expect(leftTop.classList.contains(FOCUSED_CLASS_NAME)).toBe(true);
  });

  it('stays in page mode when the pages hold nothing to use', () => {
    const view = new FakeView();
    const navigator = navigatorOf(view, [makePage([]), makePage([])]);

    expect(navigator.handle(InputAction.Ok)).toBe(false);
    expect(navigator.mode).toBe(NavigatorMode.Page);
  });

  it('walks the elements with the arrows, marking one at a time', () => {
    const view = new FakeView();
    const { pages, leftTop, leftBottom, rightTop } = twoPages();
    const navigator = navigatorOf(view, pages);
    navigator.handle(InputAction.Ok);

    navigator.handle(InputAction.Down);
    expect(navigator.focusedElement).toBe(leftBottom);
    expect(leftTop.classList.contains(FOCUSED_CLASS_NAME)).toBe(false);

    navigator.handle(InputAction.Up);
    navigator.handle(InputAction.Right);
    expect(navigator.focusedElement).toBe(rightTop);
    expect(view.turns).toEqual([]);
  });

  it('turns the page at the far edge and goes back to page mode', () => {
    const view = new FakeView();
    const { pages, rightTop } = twoPages();
    const navigator = navigatorOf(view, pages);
    navigator.handle(InputAction.Ok);
    navigator.handle(InputAction.Right);
    expect(navigator.focusedElement).toBe(rightTop);

    navigator.handle(InputAction.Right);

    expect(view.turns).toEqual(['next']);
    expect(navigator.mode).toBe(NavigatorMode.Page);
    expect(rightTop.classList.contains(FOCUSED_CLASS_NAME)).toBe(false);
  });

  it('goes back to page mode on Back without telling the host', () => {
    const view = new FakeView();
    const onBack = vi.fn();
    const { pages, leftTop } = twoPages();
    const navigator = navigatorOf(view, pages, { onBack });
    navigator.handle(InputAction.Ok);

    navigator.handle(InputAction.Back);

    expect(navigator.mode).toBe(NavigatorMode.Page);
    expect(leftTop.classList.contains(FOCUSED_CLASS_NAME)).toBe(false);
    expect(onBack).not.toHaveBeenCalled();
  });

  it('clicks a link on Ok, leaving what the link does to the renderer', () => {
    const view = new FakeView();
    const clicked = vi.fn();
    const link = makeLink(0, 0, clicked);
    const navigator = navigatorOf(view, [makePage([link]), makePage([])]);
    navigator.handle(InputAction.Ok);

    navigator.handle(InputAction.Ok);

    expect(clicked).toHaveBeenCalledTimes(1);
  });

  it('starts and stops a video on Ok and on the play key', () => {
    const view = new FakeView();
    const { box, state } = makeVideo(0, 0);
    const navigator = navigatorOf(view, [makePage([box]), makePage([])]);
    navigator.handle(InputAction.Ok);

    navigator.handle(InputAction.Ok);
    expect(state.playing).toBe(true);

    navigator.handle(InputAction.PlayPause);
    expect(state.playing).toBe(false);
  });

  it('lets go of the marked element and goes back to page mode when the pages change', () => {
    const view = new FakeView();
    const { pages, leftTop } = twoPages();
    const navigator = navigatorOf(view, pages);
    navigator.handle(InputAction.Ok);

    navigator.handle(InputAction.PageNext);
    view.finishTurn();

    expect(navigator.focusedElement).toBeUndefined();
    expect(leftTop.classList.contains(FOCUSED_CLASS_NAME)).toBe(false);
    // Also after a link moved the book, which the view reports the same way.
    expect(navigator.mode).toBe(NavigatorMode.Page);
  });

  it('tells the host when the mode changes', () => {
    const view = new FakeView();
    const onModeChange = vi.fn();
    const navigator = navigatorOf(view, twoPages().pages, { onModeChange });

    navigator.handle(InputAction.Ok);
    navigator.handle(InputAction.Back);

    expect(onModeChange.mock.calls.map(call => call[0])).toEqual([NavigatorMode.Element, NavigatorMode.Page]);
  });

  it('stops answering the view once it is destroyed', () => {
    const view = new FakeView();
    const navigator = navigatorOf(view, twoPages().pages);
    navigator.handle(InputAction.Right);
    navigator.handle(InputAction.Right);

    navigator.destroy();
    view.finishTurn();

    expect(view.turns).toEqual(['next']);
  });
});
