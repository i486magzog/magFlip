import { describe, expect, it } from 'vitest';
import { FlipQueue } from '../src/flipQueue';

describe('FlipQueue', () => {
  it('starts empty', () => {
    const queue = new FlipQueue();

    expect(queue.isEmpty).toBe(true);
    expect(queue.size).toBe(0);
    expect(queue.shift()).toBeUndefined();
  });

  it('hands back the turn that was asked for', () => {
    const queue = new FlipQueue();
    queue.push('next');

    expect(queue.size).toBe(1);
    expect(queue.shift()).toBe('next');
    expect(queue.isEmpty).toBe(true);
  });

  it('keeps one turn only, so holding a key does not run the book away', () => {
    const queue = new FlipQueue();

    queue.push('next');
    queue.push('next');
    queue.push('next');

    expect(queue.size).toBe(1);
    expect(queue.shift()).toBe('next');
    expect(queue.shift()).toBeUndefined();
  });

  it('lets the reader change their mind mid-turn', () => {
    const queue = new FlipQueue();

    queue.push('next');
    queue.push('prev');

    expect(queue.shift()).toBe('prev');
  });

  it('keeps as many turns as the limit allows, oldest first', () => {
    const queue = new FlipQueue(2);

    queue.push('next');
    queue.push('next');
    queue.push('prev');

    expect(queue.size).toBe(2);
    expect(queue.shift()).toBe('next');
    expect(queue.shift()).toBe('prev');
  });

  it('forgets everything when the book closes', () => {
    const queue = new FlipQueue();
    queue.push('next');

    queue.clear();

    expect(queue.isEmpty).toBe(true);
  });

  it('refuses a limit below one, which would drop every request', () => {
    expect(() => new FlipQueue(0)).toThrow();
  });
});
