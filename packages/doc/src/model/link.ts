/**
 * Target type of a link.
 */
export enum LinkKind {
  /** An external address. Only http, https, mailto and tel are allowed. */
  Url = 'url',
  /** Another page of the same book. */
  Page = 'page',
}
/**
 * A link to an external address.
 */
export interface IUrlLink {
  kind: LinkKind.Url;
  href: string;
  isNewTab: boolean;
}
/**
 * A link to a page of the same book.
 *
 * The target is a surface, not a page index, so the link survives page
 * reordering. `surfaceX` picks the page of a spread surface (0 or page width).
 */
export interface IPageLink {
  kind: LinkKind.Page;
  surfaceId: string;
  surfaceX: number;
}
/**
 * A link attached to an element or a text run.
 */
export type ILink = IUrlLink | IPageLink;
