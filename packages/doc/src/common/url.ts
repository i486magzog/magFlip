/**
 * Protocols a link may use. Everything else (`javascript:`, `data:` …) is rejected.
 */
const SAFE_URL_PROTOCOLS: ReadonlySet<string> = new Set(['http:', 'https:', 'mailto:', 'tel:']);

/**
 * Returns true when the URL is absolute and uses a safe protocol.
 *
 * Lives next to the model rather than in the schemas, because the renderer
 * checks a URL again right before it puts it into the DOM.
 */
export function isSafeUrl(value: string): boolean {
  try {
    return SAFE_URL_PROTOCOLS.has(new URL(value).protocol);
  } catch {
    return false;
  }
}
