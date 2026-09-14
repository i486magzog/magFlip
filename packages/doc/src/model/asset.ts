/**
 * Kinds of uploaded file an element can reference.
 */
export enum AssetKind {
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
  Font = 'font',
}
/**
 * An uploaded file.
 *
 * Assets are owned by the server (object storage plus a metadata row), not by
 * the collaboration document: elements only store `assetId`.
 */
export interface IAsset {
  id: string;
  kind: AssetKind;
  mimeType: string;
  byteSize: number;
  /** Pixel width of an image or a video. */
  width?: number;
  /** Pixel height of an image or a video. */
  height?: number;
  /** Duration of a video or an audio clip, in seconds. */
  durationSec?: number;
}
/**
 * An asset as it appears in a published book, with a URL a reader can fetch.
 */
export interface IPublishedAsset {
  id: string;
  kind: AssetKind;
  url: string;
  mimeType: string;
  width?: number;
  height?: number;
  durationSec?: number;
}
