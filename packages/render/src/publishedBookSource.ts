import { IPublishedBook, IPublishedPage, IPublishedSurface } from '@magflip/doc';
import { IRenderOptions } from './common/renderOptions';
import { PageRenderer } from './pageRenderer';

/**
 * Where the files of a published book are and how to draw them.
 */
export interface IPublishedBookSourceOptions extends IRenderOptions {
  /**
   * Returns the URL of one surface file.
   * Defaults to `<folder of the manifest>/surfaces/<surfaceId>.json`.
   */
  resolveSurfaceUrl?: (surfaceId: string) => string;
  /** Replaces `fetch` in tests and in hosts that need their own headers. */
  fetchJson?: (url: string) => Promise<unknown>;
}
/**
 * A page of a published book in the shape the MagFlip viewer takes.
 * Structurally the same as `IPageData` of `@magflip/core`, plus `render`.
 */
export interface IViewerPageData {
  id: string;
  index: number;
  size: { width: number, height: number };
  number?: number;
  /** Draws the page into the content element the viewer created. */
  render: (contentEl: HTMLElement) => void;
}

/**
 * Loads a published book and turns its pages into something a viewer can show.
 *
 * Surfaces are fetched one by one and kept, because a book can have thousands
 * of pages and a viewer only ever shows a handful of them.
 */
export class PublishedBookSource {
  readonly manifest: IPublishedBook;
  private readonly options: IPublishedBookSourceOptions;
  private readonly surfaces = new Map<string, IPublishedSurface>();
  private readonly pendingSurfaces = new Map<string, Promise<IPublishedSurface>>();

  constructor(manifest: IPublishedBook, options: IPublishedBookSourceOptions = {}) {
    this.manifest = manifest;
    this.options = options;
  }
  /**
   * Loads the manifest of a published book.
   * @param manifestUrl URL of `book.json`.
   */
  static async load(manifestUrl: string, options: IPublishedBookSourceOptions = {}): Promise<PublishedBookSource> {
    // Surfaces are looked for next to the manifest that was actually loaded.
    // A server may keep every publication under its own folder and send the
    // stable address there, so the address after the redirect is the one the
    // rest of the book hangs off.
    const loaded = options.fetchJson
      ? { json: await options.fetchJson(manifestUrl), url: manifestUrl }
      : await fetchJsonAtUrl(manifestUrl);
    const base = loaded.url.length > 0 ? loaded.url : manifestUrl;
    const resolveSurfaceUrl = options.resolveSurfaceUrl
      ?? ((surfaceId: string) => `${base.replace(/\/[^/]*$/, '')}/surfaces/${surfaceId}.json`);
    return new PublishedBookSource(loaded.json as IPublishedBook, { ...options, resolveSurfaceUrl });
  }
  /**
   * Number of pages of the book.
   */
  get pageCount(): number {
    return this.manifest.pageCount;
  }
  /**
   * Returns the page of an index, or `undefined` outside the book.
   */
  getPage(index: number): IPublishedPage | undefined {
    return this.manifest.pages[index];
  }
  /**
   * Returns true when the reader may expand the page beyond its trim.
   */
  isExpandable(index: number): boolean {
    const page = this.getPage(index);
    return page ? this.manifest.surfaces[page.surfaceId]?.isExpandable === true : false;
  }
  /**
   * Returns a surface that is already loaded.
   */
  getSurface(surfaceId: string): IPublishedSurface | undefined {
    return this.surfaces.get(surfaceId);
  }
  /**
   * Loads one surface. Loading the same surface twice waits for the first load
   * instead of fetching it again, which matters when both pages of a spread
   * are shown at once.
   */
  async loadSurface(surfaceId: string): Promise<IPublishedSurface> {
    const loaded = this.surfaces.get(surfaceId);
    if (loaded) { return loaded; }

    const pending = this.pendingSurfaces.get(surfaceId);
    if (pending) { return pending; }

    const fetchJson = this.options.fetchJson ?? defaultFetchJson;
    const url = this.options.resolveSurfaceUrl?.(surfaceId) ?? `surfaces/${surfaceId}.json`;
    const request = fetchJson(url)
      .then(json => {
        const surface = json as IPublishedSurface;
        this.surfaces.set(surfaceId, surface);
        this.pendingSurfaces.delete(surfaceId);
        return surface;
      })
      .catch(error => {
        this.pendingSurfaces.delete(surfaceId);
        throw error;
      });
    this.pendingSurfaces.set(surfaceId, request);
    return request;
  }
  /**
   * Loads the surfaces the given pages need.
   */
  async loadPages(startIndex: number, count: number): Promise<void> {
    const surfaceIds = new Set<string>();
    for (let index = startIndex; index < startIndex + count; index++) {
      const page = this.getPage(index);
      if (page) { surfaceIds.add(page.surfaceId); }
    }
    await Promise.all([...surfaceIds].map(surfaceId => this.loadSurface(surfaceId)));
  }
  /**
   * Returns the page data of every page, loading every surface first.
   *
   * Use it when a book is small enough to hold at once, or when every page has
   * to be drawn the moment the viewer opens. `createPageDataList` is the one to
   * reach for otherwise.
   */
  async createAllPageData(): Promise<IViewerPageData[]> {
    await this.loadPages(0, this.pageCount);
    return this.createPageDataList();
  }
  /**
   * Returns the page data of every page without loading anything.
   *
   * A page fetches its surface the first time it is drawn, so a book of
   * thousands of pages opens as fast as one of ten and a reader only ever
   * downloads the pages they turned to.
   */
  createPageDataList(): IViewerPageData[] {
    return this.manifest.pages
      .map(page => this.createPageData(page.index))
      .filter((page): page is IViewerPageData => page !== undefined);
  }
  /**
   * Returns the page data of one page. The surface it needs is loaded when the
   * page is first drawn, unless it is already there.
   */
  createPageData(index: number): IViewerPageData | undefined {
    const page = this.getPage(index);
    if (!page) { return undefined; }

    const { pageSize } = this.manifest;
    return {
      id: `${page.surfaceId}@${page.surfaceX}`,
      index: page.index,
      size: pageSize,
      ...(page.number === null ? {} : { number: page.number }),
      render: (contentEl: HTMLElement) => {
        const draw = (surface: IPublishedSurface) => {
          new PageRenderer(contentEl, this.options).renderPage({ surface, surfaceX: page.surfaceX, pageSize });
        };
        // The element belongs to this page for as long as it exists, so a
        // surface that arrives late is still drawn in the right place.
        const loaded = this.surfaces.get(page.surfaceId);
        if (loaded) { draw(loaded); return; }
        void this.loadSurface(page.surfaceId).then(draw).catch(() => undefined);
      },
    };
  }
  /**
   * Draws the whole surface of a page, including the part outside the pages.
   * Returns `undefined` when the surface is not loaded.
   */
  renderExpanded(hostEl: HTMLElement, index: number): PageRenderer | undefined {
    const page = this.getPage(index);
    const surface = page ? this.surfaces.get(page.surfaceId) : undefined;
    if (!surface) { return undefined; }

    const renderer = new PageRenderer(hostEl, this.options);
    renderer.renderExpanded(surface);
    return renderer;
  }
}

async function defaultFetchJson(url: string): Promise<unknown> {
  return (await fetchJsonAtUrl(url)).json;
}
/**
 * Fetches JSON and reports where it came from, which is not the address that
 * was asked for when the server redirected.
 */
async function fetchJsonAtUrl(url: string): Promise<{ json: unknown, url: string }> {
  const response = await fetch(url);
  if (!response.ok) { throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`); }
  return { json: await response.json(), url: response.url ?? url };
}
