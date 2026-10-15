import { ILink, isSafeUrl, LinkKind } from '@magflip/doc';
import { IRenderOptions } from '../common/renderOptions';

/**
 * Creates the anchor of a link.
 *
 * A URL is checked again here even though the schema already refused unsafe
 * ones: this renderer also draws documents that are still being edited, and a
 * link is the one place where document content becomes executable.
 *
 * A URL link is followed by the browser unless the host takes it over with
 * `onUrlLink`; a page link never navigates and is always handed to `onPageLink`.
 */
export function createLink(link: ILink, options: IRenderOptions): HTMLAnchorElement {
  const anchor = document.createElement('a');
  anchor.className = 'mf-link';
  const isInteractive = options.isInteractive !== false;

  if (link.kind === LinkKind.Url) {
    if (isSafeUrl(link.href)) { anchor.href = link.href; }
    if (link.isNewTab) {
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    }
    const onUrlLink = options.onUrlLink;
    if (onUrlLink) {
      anchor.addEventListener('click', event => {
        event.preventDefault();
        if (isInteractive) { onUrlLink(link); }
      });
    }
  } else {
    anchor.href = `#${link.surfaceId}`;
    anchor.addEventListener('click', event => {
      event.preventDefault();
      if (isInteractive) { options.onPageLink?.(link); }
    });
  }

  if (!isInteractive) {
    anchor.addEventListener('click', event => event.preventDefault());
    anchor.style.pointerEvents = 'none';
  }
  return anchor;
}
