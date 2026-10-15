import { IPublishedSurface, IRect, ISize } from '@magflip/doc';
import { IRenderOptions } from './common/renderOptions';
import { createDiv, round } from './common/style';
import { createSurfaceLayer } from './surfaceLayer';
import './render.css';

/**
 * One page of a surface.
 */
export interface IPageView {
  surface: IPublishedSurface;
  /** Left edge of the page inside the surface: 0 or one page width. */
  surfaceX: number;
  pageSize: ISize;
}

/**
 * Draws one page - or the whole expanded surface - inside a host element and
 * keeps it fitted while the host changes size.
 *
 * The viewer decides how large a page is shown (zoom, window size); the
 * document says how large it was designed. This class owns the scaling between
 * the two, so neither the viewer nor the editor has to think in two units.
 */
export class PageRenderer {
  private readonly hostEl: HTMLElement;
  private readonly options: IRenderOptions;
  private readonly windowEl: HTMLElement;
  private readonly fitEl: HTMLElement;
  private readonly resizeObserver?: ResizeObserver;
  /** Rect of the surface that is currently shown, in surface coordinates. */
  private shownRect: IRect = { x: 0, y: 0, width: 0, height: 0 };
  /** Top-left of the layer in surface coordinates. */
  private layerOrigin: IRect = { x: 0, y: 0, width: 0, height: 0 };

  constructor(hostEl: HTMLElement, options: IRenderOptions = {}) {
    this.hostEl = hostEl;
    this.options = options;
    this.windowEl = createDiv('page-window');
    this.fitEl = createDiv('page-fit');
    this.windowEl.appendChild(this.fitEl);
    this.hostEl.appendChild(this.windowEl);

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.fit());
      this.resizeObserver.observe(this.hostEl);
    }
  }
  /**
   * Draws one page of a surface, clipped to that page.
   */
  renderPage(view: IPageView): void {
    this.render(view.surface, {
      x: view.surfaceX,
      y: 0,
      width: view.pageSize.width,
      height: view.pageSize.height,
    });
  }
  /**
   * Draws everything a reader may see of the surface, which is more than the
   * pages when the surface was designed wider and published as expandable.
   */
  renderExpanded(surface: IPublishedSurface): void {
    this.render(surface, surface.visibleRect);
  }
  /**
   * Recomputes the scale. Call it after the host changed size in a browser
   * without `ResizeObserver`.
   */
  fit(): void {
    const hostWidth = this.hostEl.clientWidth;
    const hostHeight = this.hostEl.clientHeight;
    if (hostWidth <= 0 || hostHeight <= 0 || this.shownRect.width <= 0 || this.shownRect.height <= 0) { return; }

    const scale = Math.min(hostWidth / this.shownRect.width, hostHeight / this.shownRect.height);
    const offsetX = (hostWidth - this.shownRect.width * scale) / 2;
    const offsetY = (hostHeight - this.shownRect.height * scale) / 2;
    // The layer starts at `layerOrigin`, so the shown rect has to be pulled back to it.
    const layerX = this.shownRect.x - this.layerOrigin.x;
    const layerY = this.shownRect.y - this.layerOrigin.y;
    this.fitEl.style.transform = `translate(${round(offsetX)}px, ${round(offsetY)}px)`
      + ` scale(${round(scale)})`
      + ` translate(${round(-layerX)}px, ${round(-layerY)}px)`;
  }
  /**
   * Removes what was drawn, keeping the renderer usable.
   */
  clear(): void {
    this.fitEl.replaceChildren();
    this.shownRect = { x: 0, y: 0, width: 0, height: 0 };
  }
  /**
   * Removes everything this renderer added to the host.
   */
  destroy(): void {
    this.resizeObserver?.disconnect();
    this.windowEl.remove();
  }

  private render(surface: IPublishedSurface, shownRect: IRect): void {
    this.shownRect = shownRect;
    this.layerOrigin = surface.visibleRect;
    this.fitEl.replaceChildren(createSurfaceLayer(surface, this.options));
    this.fit();
  }
}
