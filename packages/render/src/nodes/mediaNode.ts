import { ElementType, IPublishedAsset } from '@magflip/doc';
import { IRenderOptions } from '../common/renderOptions';
import { createDiv } from '../common/style';
import { PublishedElementOf } from '../common/types';

type PublishedVideo = PublishedElementOf<ElementType.Video>;
type PublishedAudio = PublishedElementOf<ElementType.Audio>;

/**
 * Draws a video. On the editor canvas (`isInteractive: false`) it shows the
 * poster and does not play, so that dragging the element does not start a video.
 */
export function createVideoNode(
  element: PublishedVideo,
  assets: Record<string, IPublishedAsset>,
  options: IRenderOptions,
): HTMLElement {
  const box = createDiv('el', 'el-video');
  const video = document.createElement('video');
  const isInteractive = options.isInteractive !== false;

  video.src = assets[element.assetId]?.url ?? '';
  const poster = element.posterAssetId === null ? undefined : assets[element.posterAssetId];
  if (poster) { video.poster = poster.url; }
  video.style.width = '100%';
  video.style.height = '100%';
  video.style.objectFit = element.fit;
  video.controls = element.hasControls && isInteractive;
  video.loop = element.isLooping;
  video.muted = element.isMuted;
  video.playsInline = true;
  video.autoplay = element.isAutoplay && isInteractive;
  if (!isInteractive) { video.preload = 'metadata'; }

  box.appendChild(video);
  return box;
}
/**
 * Draws an audio player.
 */
export function createAudioNode(
  element: PublishedAudio,
  assets: Record<string, IPublishedAsset>,
  options: IRenderOptions,
): HTMLElement {
  const box = createDiv('el', 'el-audio');
  const audio = document.createElement('audio');
  const isInteractive = options.isInteractive !== false;

  audio.src = assets[element.assetId]?.url ?? '';
  audio.style.width = '100%';
  audio.controls = element.hasControls && isInteractive;
  audio.loop = element.isLooping;
  audio.autoplay = element.isAutoplay && isInteractive;

  box.appendChild(audio);
  return box;
}
