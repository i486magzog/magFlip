/**
 * Which way a waiting page turn goes.
 */
export type FlipDirection = 'next' | 'prev';
/**
 * Remembers the page turns a reader asked for while a turn was still running.
 *
 * A viewer ignores `nextPage()` during a turn, so without this a reader who
 * presses the key three times sees one page. Keeping every press is just as
 * wrong: the book would keep turning long after the reader stopped. So the
 * queue holds the last `limit` requests (one by default) and drops older ones,
 * which also lets a reader change their mind mid-turn: press left after right
 * and the left is what happens next.
 */
export class FlipQueue {
  private readonly requests: FlipDirection[] = [];
  /**
   * How many turns may wait. One means "finish this turn, then do the last
   * thing the reader asked for".
   */
  readonly limit: number;

  constructor(limit: number = 1) {
    if (limit < 1) { throw new Error('A FlipQueue holds at least one request.'); }
    this.limit = limit;
  }
  /**
   * Number of turns waiting.
   */
  get size(): number { return this.requests.length; }
  /**
   * True while nothing is waiting.
   */
  get isEmpty(): boolean { return this.requests.length === 0; }
  /**
   * Adds a turn to wait for, dropping the oldest one when the queue is full.
   */
  push(direction: FlipDirection): void {
    this.requests.push(direction);
    while (this.requests.length > this.limit) { this.requests.shift(); }
  }
  /**
   * Takes the turn to do next, or `undefined` when nothing waits.
   */
  shift(): FlipDirection | undefined { return this.requests.shift(); }
  /**
   * Forgets every waiting turn. Use it when the book closes or the reader
   * jumps somewhere else.
   */
  clear(): void { this.requests.length = 0; }
}
