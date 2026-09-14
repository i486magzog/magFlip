import { ElementType, IPublishedAsset, IRect, MediaFit } from '@magflip/doc';
import { createDiv, px, round } from '../common/style';
import { PublishedElementOf } from '../common/types';

type PublishedImage = PublishedElementOf<ElementType.Image>;

/**
 * Draws an image, applying its crop and then its fit.
 *
 * Cropping is done by scaling and moving the `<img>` inside a box that hides
 * the overflow, because `object-fit` alone cannot express "use this part of
 * the source and then fill the box with it".
 */
export function createImageNode(element: PublishedImage, asset: IPublishedAsset | undefined): HTMLElement {
  const box = createDiv('el', 'el-image');
  const image = document.createElement('img');
  image.alt = element.alt;
  image.draggable = false;
  image.src = asset ? asset.url : '';

  if (!element.crop) {
    image.style.width = '100%';
    image.style.height = '100%';
    image.style.objectFit = element.fit;
    box.appendChild(image);
    return box;
  }

  applyCrop(image, element, asset);
  box.appendChild(image);
  return box;
}

/**
 * Places the image so that its cropped region fills the box the way `fit` asks.
 * Without the pixel size of the source, the cropped region is simply stretched.
 */
function applyCrop(image: HTMLImageElement, element: PublishedImage, asset: IPublishedAsset | undefined): void {
  const crop = element.crop as IRect;
  const sourceWidth = asset?.width ?? 0;
  const sourceHeight = asset?.height ?? 0;
  const cropWidth = Math.max(crop.width, 1e-6);
  const cropHeight = Math.max(crop.height, 1e-6);

  if (sourceWidth <= 0 || sourceHeight <= 0 || element.fit === MediaFit.Fill) {
    image.style.position = 'absolute';
    image.style.width = `${round(100 / cropWidth)}%`;
    image.style.height = `${round(100 / cropHeight)}%`;
    image.style.left = `${round(-crop.x * 100 / cropWidth)}%`;
    image.style.top = `${round(-crop.y * 100 / cropHeight)}%`;
    return;
  }

  const visibleWidth = sourceWidth * cropWidth;
  const visibleHeight = sourceHeight * cropHeight;
  const scaleToBox = element.fit === MediaFit.Cover
    ? Math.max(element.width / visibleWidth, element.height / visibleHeight)
    : Math.min(element.width / visibleWidth, element.height / visibleHeight);

  const width = sourceWidth * scaleToBox;
  const height = sourceHeight * scaleToBox;
  image.style.position = 'absolute';
  image.style.width = px(width);
  image.style.height = px(height);
  image.style.left = px(-crop.x * width + (element.width - visibleWidth * scaleToBox) / 2);
  image.style.top = px(-crop.y * height + (element.height - visibleHeight * scaleToBox) / 2);
}
