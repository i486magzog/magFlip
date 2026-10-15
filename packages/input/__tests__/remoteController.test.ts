import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InputAction } from '../src/actions';
import { RemoteController } from '../src/remoteController';
import { FakeView, makeLink, makePage } from './helpers';

function controllerOf(view: FakeView, options = {}) {
  const pages = [makePage([makeLink(0, 0)]), makePage([makeLink(400, 0)])];
  return new RemoteController({
    view,
    getPageContentEl: (index) => pages[view.openPageIndexes.indexOf(index)],
    ...options,
  });
}

function press(key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  document.dispatchEvent(event);
  return event;
}

describe('RemoteController', () => {
  beforeEach(() => { document.body.replaceChildren(); });

  it('turns the page on the arrow keys and keeps the key from the page', () => {
    const view = new FakeView();
    const controller = controllerOf(view);

    const event = press('ArrowRight');

    expect(view.turns).toEqual(['next']);
    expect(event.defaultPrevented).toBe(true);
    controller.destroy();
  });

  it('leaves a key it does not know to the host', () => {
    const view = new FakeView();
    const controller = controllerOf(view);

    const event = press('a');

    expect(view.turns).toEqual([]);
    expect(event.defaultPrevented).toBe(false);
    controller.destroy();
  });

  it('leaves a key it knows but cannot use, such as Back with no host', () => {
    const view = new FakeView();
    const controller = controllerOf(view);

    const event = press('Escape');

    expect(event.defaultPrevented).toBe(false);
    controller.destroy();
  });

  it('reads the back button of a TV, which arrives as a number', () => {
    const view = new FakeView();
    const onBack = vi.fn();
    const controller = controllerOf(view, { onBack });

    press('Unidentified', { keyCode: 10009 });

    expect(onBack).toHaveBeenCalledTimes(1);
    controller.destroy();
  });

  it('takes an action straight from an app around the page', () => {
    const view = new FakeView();
    const onBack = vi.fn();
    const controller = controllerOf(view, { onBack });

    expect(controller.dispatch(InputAction.PageNext)).toBe(true);
    expect(controller.dispatch(InputAction.Back)).toBe(true);

    expect(view.turns).toEqual(['next']);
    expect(onBack).toHaveBeenCalledTimes(1);
    controller.destroy();
  });

  it('listens where the host says, so a page may hold more than one', () => {
    const view = new FakeView();
    const target = document.createElement('div');
    document.body.appendChild(target);
    const controller = controllerOf(view, { target });

    press('ArrowRight');
    expect(view.turns).toEqual([]);

    target.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true }));
    expect(view.turns).toEqual(['next']);
    controller.destroy();
  });

  it('stops listening once it is destroyed', () => {
    const view = new FakeView();
    const controller = controllerOf(view);

    controller.destroy();
    press('ArrowRight');

    expect(view.turns).toEqual([]);
  });
});
