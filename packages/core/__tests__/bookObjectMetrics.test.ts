import { BookFace } from '../src/common/models';
import {
  getBookPose,
  getFaceAngle,
  getFaceDepth,
  getRaiseTurn,
  getSpineRatio,
  MAX_SPINE_RATIO,
  MIN_SPINE_RATIO,
  RAISE_PULL_RATIO,
  SPINE_RATIO_PER_PAGE,
} from '../src/common/bookObjectMetrics';

describe('getSpineRatio', () => {
  it('gives a thin book room for its title', () => {
    expect(getSpineRatio(0)).toBe(MIN_SPINE_RATIO);
    expect(getSpineRatio(6)).toBeCloseTo(MIN_SPINE_RATIO + 6 * SPINE_RATIO_PER_PAGE);
  });

  it('grows with the pages', () => {
    expect(getSpineRatio(100)).toBeGreaterThan(getSpineRatio(16));
  });

  it('stops growing at the thickest a book is drawn', () => {
    expect(getSpineRatio(5000)).toBe(MAX_SPINE_RATIO);
  });

  it('treats a count that is not a number as no pages', () => {
    expect(getSpineRatio(NaN)).toBe(MIN_SPINE_RATIO);
    expect(getSpineRatio(-4)).toBe(MIN_SPINE_RATIO);
  });
});

describe('faces', () => {
  it('turns a quarter to show the spine and a half to show the back', () => {
    expect(getFaceAngle(BookFace.Front)).toBe(0);
    expect(getFaceAngle(BookFace.Spine)).toBe(90);
    expect(getFaceAngle(BookFace.Back)).toBe(180);
  });

  it('keeps the face the reader sees on the screen', () => {
    // A cover is half the thickness in front of the middle of the book,
    // the spine half the width.
    expect(getFaceDepth(BookFace.Front, 200, 30)).toBe(-15);
    expect(getFaceDepth(BookFace.Back, 200, 30)).toBe(-15);
    expect(getFaceDepth(BookFace.Spine, 200, 30)).toBe(-100);
  });

  it('turns a raised spine toward its front cover and a raised cover toward its spine', () => {
    // Less than a quarter turn shows the front cover beside the spine.
    expect(getFaceAngle(BookFace.Spine) + getRaiseTurn(BookFace.Spine)).toBeLessThan(90);
    // More than none brings the spine, on the left, toward the reader.
    expect(getFaceAngle(BookFace.Front) + getRaiseTurn(BookFace.Front)).toBeGreaterThan(0);
    expect(getFaceAngle(BookFace.Back) + getRaiseTurn(BookFace.Back)).toBeLessThan(180);
  });
});

describe('getBookPose', () => {
  const WIDTH = 140;
  const THICKNESS = 24;
  const HEIGHT = 200;

  /** Where the middle of the spine ends up: the spine is half a width left of the middle of the book. */
  function spineMiddle(pose: { shiftX: number, depth: number, angle: number }) {
    const radians = pose.angle * Math.PI / 180;
    return {
      x: -WIDTH / 2 * Math.cos(radians) + pose.shiftX,
      z: WIDTH / 2 * Math.sin(radians) + pose.depth,
    };
  }

  it('rests with the face the reader sees on the screen', () => {
    expect(getBookPose(BookFace.Front, WIDTH, THICKNESS, HEIGHT, false)).toEqual({ shiftX: 0, depth: -12, angle: 0 });
    const spine = spineMiddle(getBookPose(BookFace.Spine, WIDTH, THICKNESS, HEIGHT, false));
    expect(spine.x).toBeCloseTo(0);
    expect(spine.z).toBeCloseTo(0);
  });

  it('pulls a raised spine straight out of its place', () => {
    const pose = getBookPose(BookFace.Spine, WIDTH, THICKNESS, HEIGHT, true);
    const spine = spineMiddle(pose);

    expect(pose.angle).toBeLessThan(90);
    // It turned, yet the spine stands where it stood, only nearer.
    expect(spine.x).toBeCloseTo(0);
    expect(spine.z).toBeCloseTo(HEIGHT * RAISE_PULL_RATIO);
  });

  it('lifts a raised cover toward the reader and turns its spine out', () => {
    const pose = getBookPose(BookFace.Front, WIDTH, THICKNESS, HEIGHT, true);

    expect(pose.shiftX).toBe(0);
    expect(pose.depth).toBeCloseTo(-12 + HEIGHT * RAISE_PULL_RATIO);
    expect(pose.angle).toBeGreaterThan(0);
  });
});
