import { IPageLink, IPublishedNode, IUrlLink, IWidgetElement } from '@magflip/doc';

/**
 * How a surface is drawn.
 */
export interface IRenderOptions {
  /**
   * Returns the URL of the iframe a widget is rendered in.
   * Widgets stay empty placeholders while this is not set.
   */
  resolveWidgetUrl?: (element: IWidgetElement) => string | undefined;
  /**
   * Called when a reader follows a link to another page of the same book.
   */
  onPageLink?: (link: IPageLink) => void;
  /**
   * Called when a reader follows a link to an address outside the book, and
   * stops the page from going there. Leave it unset to let the browser follow
   * the link as usual.
   *
   * A host that cannot leave its own page sets it: an app packaged for a TV
   * has nowhere to come back from, so it shows the address instead.
   */
  onUrlLink?: (link: IUrlLink) => void;
  /**
   * False turns the page into a picture: links do not react and media does not
   * play. The editor canvas uses it so that clicking selects instead of navigating.
   * Defaults to true.
   */
  isInteractive?: boolean;
  /**
   * Called for every rendered node, after its element is built. The editor uses
   * it to attach selection handles to the element of an id.
   */
  onNodeRendered?: (node: IPublishedNode, element: HTMLElement) => void;
}
