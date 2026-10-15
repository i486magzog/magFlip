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
 * Message a widget may send to its host to ask for its props again, for a
 * widget whose script starts after the frame has loaded.
 */
export const WIDGET_READY_MESSAGE = 'magflip:widget-ready';

/**
 * Draws a widget in a sandboxed iframe.
 *
 * The address comes from the publication (`url`), so a viewer draws a widget
 * without knowing which widgets a server offers; a host that serves its own
 * widgets overrides it with `resolveWidgetUrl`.
 *
 * The iframe gets `allow-scripts` but not `allow-same-origin`, so widget code
 * runs in an opaque origin: it cannot read the page that embeds it, its
 * cookies or its storage. That opaque origin is also why the props are sent
 * with `*` as the target - no other value ever matches it. Props are part of
 * the published book, which anyone who can open the widget can read anyway,
 * so nothing secret travels here.
 */
export function createWidgetNode(element: PublishedWidget, options: IRenderOptions): HTMLElement {
  const box = createDiv('el', 'el-widget');
  const url = options.resolveWidgetUrl?.(element as IWidgetElement) ?? element.url ?? undefined;
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

  const sendProps = () => frame.contentWindow?.postMessage({
    type: WIDGET_PROPS_MESSAGE,
    widgetType: element.widgetType,
    widgetVersion: element.widgetVersion,
    props: element.props,
    locale: options.locale,
  }, '*');

  frame.addEventListener('load', sendProps);
  // A widget whose script runs later asks again; only this frame is answered.
  window.addEventListener('message', event => {
    if (event.source === frame.contentWindow && (event.data as { type?: string } | null)?.type === WIDGET_READY_MESSAGE) {
      sendProps();
    }
  });

  box.appendChild(frame);
  return box;
}
