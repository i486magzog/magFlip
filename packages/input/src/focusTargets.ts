import { IFocusRect } from './spatialFocus';

/**
 * Something on a page the reader can reach with the arrow keys.
 */
export interface IFocusTarget {
  id: string;
  element: HTMLElement;
  rect: IFocusRect;
}
/**
 * What `@magflip/render` draws that a reader can use: links, video, audio and
 * widgets. Text and pictures without a link are not reachable — there is
 * nothing to do with them.
 */
export const DEFAULT_FOCUS_SELECTOR = 'a.mf-link, .mf-el-video, .mf-el-audio, .mf-el-widget';
/**
 * Finds what the reader can reach inside the given page elements, in the order
 * the pages were given.
 *
 * Something of no size is left out: it is a page that has not been drawn yet,
 * or an element the layout hid.
 */
export function collectFocusTargets(
  hostEls: (HTMLElement | null | undefined)[],
  selector: string = DEFAULT_FOCUS_SELECTOR,
): IFocusTarget[] {
  const targets: IFocusTarget[] = [];
  hostEls.forEach((hostEl, hostIndex) => {
    if (!hostEl) { return; }
    const elements = hostEl.querySelectorAll<HTMLElement>(selector);
    elements.forEach((element, index) => {
      const box = element.getBoundingClientRect();
      if (box.width <= 0 || box.height <= 0) { return; }
      targets.push({
        id: `${hostIndex}:${index}`,
        element,
        rect: { id: `${hostIndex}:${index}`, x: box.x, y: box.y, width: box.width, height: box.height },
      });
    });
  });
  return targets;
}
