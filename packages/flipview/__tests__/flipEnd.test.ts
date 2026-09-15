import { describe, expect, jest, test } from '@jest/globals';
import { EventStatus } from '@magflip/core';
import { Flipping } from '../src/flipManager';

describe('Flipping.isTurningPage', () => {
  test.each([
    ['Flipping', EventStatus.Flipping],
    ['SnappingBack', EventStatus.SnappingBack],
    ['FlippingForward', EventStatus.FlippingForward],
    ['FlippingBackward', EventStatus.FlippingBackward],
    ['Dragging', EventStatus.Dragging],
  ])('is true while %s', (_name, status) => {
    const flipping = new Flipping();
    flipping.eventStatus = status;

    expect(flipping.isTurningPage).toBe(true);
  });

  test.each([
    ['None', EventStatus.None],
    ['AutoFlipFromCorner', EventStatus.AutoFlipFromCorner],
    ['AutoFlipToCorner', EventStatus.AutoFlipToCorner],
  ])('is false while %s, because no page is turning', (_name, status) => {
    const flipping = new Flipping();
    flipping.eventStatus = status;

    expect(flipping.isTurningPage).toBe(false);
  });
});

describe('Flipping.finishFlip', () => {
  test('resets the status and calls every flip-end listener once', () => {
    const flipping = new Flipping();
    const first = jest.fn();
    const second = jest.fn();
    flipping.onFlipEnd(first);
    flipping.onFlipEnd(second);
    flipping.eventStatus = EventStatus.FlippingForward;

    flipping.finishFlip();

    expect(flipping.eventStatus).toBe(EventStatus.None);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  test('lets a listener start the next turn, because the status is reset first', () => {
    const flipping = new Flipping();
    let wasTurningInListener: boolean | undefined;
    flipping.onFlipEnd(() => { wasTurningInListener = flipping.isTurningPage; });
    flipping.eventStatus = EventStatus.Flipping;

    flipping.finishFlip();

    expect(wasTurningInListener).toBe(false);
  });

  test('stops calling a listener after it is removed', () => {
    const flipping = new Flipping();
    const listener = jest.fn();
    const removeListener = flipping.onFlipEnd(listener);

    removeListener();
    flipping.finishFlip();

    expect(listener).not.toHaveBeenCalled();
  });
});
