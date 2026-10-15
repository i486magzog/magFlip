import { BookFace, IClosedBookPlace } from '../src/common/models';
import { getBookPose, getFaceDepth } from '../src/common/bookObjectMetrics';
import { CLEAR_OFFSET, getFlightPath } from '../src/common/flightPath';

const BOOK = { aspect: 2 / 3, spineRatio: 0.12 };

/** A spine 24 wide and 200 tall, standing on a shelf. */
const ON_SHELF:IClosedBookPlace = { box: { x: 100, y: 400, width: 24, height: 200 }, face: BookFace.Spine };
/** A front cover 600 by 900 in the viewer. */
const IN_VIEWER:IClosedBookPlace = { box: { x: 300, y: 50, width: 600, height: 900 }, face: BookFace.Front };

describe('getFlightPath', () => {
  it('flies at the larger end, so the book is only ever made smaller', () => {
    expect(getFlightPath(ON_SHELF, IN_VIEWER, BOOK).height).toBe(900);
    expect(getFlightPath(IN_VIEWER, ON_SHELF, BOOK).height).toBe(900);
  });

  it('takes off from the spine on the shelf', () => {
    const [start] = getFlightPath(ON_SHELF, IN_VIEWER, BOOK).frames;

    expect(start.offset).toBe(0);
    expect(start.centerX).toBe(112);
    expect(start.centerY).toBe(500);
    expect(start.scale).toBeCloseTo(200 / 900);
    expect(start.angle).toBe(90);
    expect(start.depth).toBeCloseTo(getFaceDepth(BookFace.Spine, 600, 108));
  });

  it('lands on the cover in the viewer, flat on the screen', () => {
    const { frames } = getFlightPath(ON_SHELF, IN_VIEWER, BOOK);
    const end = frames[frames.length - 1];

    expect(end.offset).toBe(1);
    expect(end.centerX).toBe(600);
    expect(end.centerY).toBe(500);
    expect(end.scale).toBe(1);
    expect(end.angle).toBe(0);
    expect(end.depth).toBeCloseTo(-54);
  });

  it('comes toward the reader before it goes anywhere', () => {
    const [start, clear, end] = getFlightPath(ON_SHELF, IN_VIEWER, BOOK).frames;

    expect(clear.offset).toBe(CLEAR_OFFSET);
    // Nearer than both ends...
    expect(clear.depth).toBeGreaterThan(start.depth);
    expect(clear.depth).toBeGreaterThan(end.depth);
    // ...having gone less of the way than the time that passed.
    const travelled = (clear.centerX - start.centerX) / (end.centerX - start.centerX);
    expect(travelled).toBeLessThan(CLEAR_OFFSET);
    // It is turning, not yet turned.
    expect(clear.angle).toBeLessThan(start.angle);
    expect(clear.angle).toBeGreaterThan(end.angle);
  });

  it('takes off from where a raised book already is', () => {
    const [start] = getFlightPath({ ...ON_SHELF, isRaised: true }, IN_VIEWER, BOOK).frames;
    const raised = getBookPose(BookFace.Spine, 600, 108, 900, true);

    expect(start.angle).toBe(raised.angle);
    expect(start.depth).toBeCloseTo(raised.depth);
    expect(start.shiftX).toBeCloseTo(raised.shiftX);
  });

  it('flies back to the shelf and lands on its spine', () => {
    const { frames } = getFlightPath(IN_VIEWER, { ...ON_SHELF, isRaised: true }, BOOK);
    const [start] = frames;
    const end = frames[frames.length - 1];

    expect(start.angle).toBe(0);
    expect(start.scale).toBe(1);
    expect(end.angle).toBe(90);
    expect(end.shiftX).toBe(0);
    expect(end.scale).toBeCloseTo(200 / 900);
    // It lands where the spine rests, not where a raised one would be.
    expect(end.depth).toBeCloseTo(getFaceDepth(BookFace.Spine, 600, 108));
  });

  it('turns from the back cover when the book was closed at its end', () => {
    const [start] = getFlightPath({ ...IN_VIEWER, face: BookFace.Back }, ON_SHELF, BOOK).frames;

    expect(start.angle).toBe(180);
  });
});
