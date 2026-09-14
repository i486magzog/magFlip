import { ElementType, isSafeUrl, IWidgetElement } from '@magflip/doc';
import { IRenderOptions } from '../common/renderOptions';
import { createDiv } from '../common/style';
import { PublishedElementOf } from '../common/types';

type PublishedWidget = PublishedElementOf<ElementType.Widget>;

/**
 * Message a widget receives once its iframe has loaded.
 */
export const WIDGET_PROPS_MESSAGE = 'magflip:widget-props';

/**
 * Draws a widget in a sandboxed iframe.
 *
 * The iframe gets `allow-scripts` but not `allow-same-origin`, so widget code
 * runs in an opaque origin: it cannot read the page that embeds it, its
 * cookies or its storage. Props are handed over with `postMessage` after load,
 * addressed to the origin of the widget URL only.
 */
export function createWidgetNode(element: PublishedWidget, options: IRenderOptions): HTMLElement {
  const box = createDiv('el', 'el-widget');
  const url = options.resolveWidgetUrl?.(element as IWidgetElement);
  if (!url || !isSafeUrl(url)) {
    box.setAttribute('data-widget-type', element.widgetType);
    return box;
  }

  const frame = document.createElement('iframe');
  frame.src = url;
  frame.title = element.widgetType;
  frame.setAttribute('sandbox', 'allow-scripts allow-forms allow-popups');
  frame.setAttribute('referrerpolicy', 'no-referrer');
  frame.setAttribute('loading', 'lazy');
  frame.style.width = '100%';
  frame.style.height = '100%';
  frame.style.border = '0';
  if (options.isInteractive === false) { frame.style.pointerEvents = 'none'; }

  frame.addEventListener('load', () => {
    frame.contentWindow?.postMessage({
      type: WIDGET_PROPS_MESSAGE,
      widgetType: element.widgetType,
      widgetVersion: element.widgetVersion,
      props: element.props,
    }, new URL(url).origin);
  });

  box.appendChild(frame);
  return box;
}
