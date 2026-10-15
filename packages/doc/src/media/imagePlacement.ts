import { IRect, ISize } from '../common/geometry';
import { MediaFit } from '../model/element';

/**
 * A crop that keeps the whole source image.
 */
export const FULL_CROP: IRect = { x: 0, y: 0, width: 1, height: 1 };
/**
 * The narrowest crop drawn, as a share of the source, so that a crop of no
 * width does not divide by zero.
 */
const MIN_CROP_RATIO = 1e-6;

/**
 * Returns where the whole source image lies inside the box of an image
 * element, in px from the top-left of the box and before the element is
 * flipped or turned.
 *
 * The crop picks a region of the source, and that region is then fitted into
 * the box: `cover` fills the box and centres the overflow, `contain` fits
 * inside it and centres the gap. `fill` - and any fit when the pixel size of
 * the source is unknown - stretches the region to the box.
 *
 * The renderer places an image with this, and the editor crops with it, so
 * what an author drags is exactly what a reader sees.
 */
export function getImagePlacement(box: ISize, fit: MediaFit, crop: IRect | null, source: ISize | undefined): IRect {
  const region = crop ?? FULL_CROP;
  const regionWidth = Math.max(region.width, MIN_CROP_RATIO);
  const regionHeight = Math.max(region.height, MIN_CROP_RATIO);

  if (!source || source.width <= 0 || source.height <= 0 || fit === MediaFit.Fill) {
    const width = box.width / regionWidth;
    const height = box.height / regionHeight;
    return { x: -region.x * width, y: -region.y * height, width, height };
  }

  const visibleWidth = source.width * regionWidth;
  const visibleHeight = source.height * regionHeight;
  const scale = fit === MediaFit.Cover
    ? Math.max(box.width / visibleWidth, box.height / visibleHeight)
    : Math.min(box.width / visibleWidth, box.height / visibleHeight);
  const width = source.width * scale;
  const height = source.height * scale;
  return {
    x: -region.x * width + (box.width - visibleWidth * scale) / 2,
    y: -region.y * height + (box.height - visibleHeight * scale) / 2,
    width,
    height,
  };
}
