import { ElementType, getImagePlacement, IPublishedAsset } from '@magflip/doc';
import { createDiv, px } from '../common/style';
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

  // The same placement the editor crops with, so a crop looks the same there.
  const source = asset?.width && asset.height ? { width: asset.width, height: asset.height } : undefined;
  const placement = getImagePlacement(element, element.fit, element.crop, source);
  image.style.position = 'absolute';
  image.style.left = px(placement.x);
  image.style.top = px(placement.y);
  image.style.width = px(placement.width);
  image.style.height = px(placement.height);
  box.appendChild(image);
  return box;
}
