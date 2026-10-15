/**
 * The smallest `document` the page elements need, so that core can be tested
 * without a browser and a test can count the elements that were created.
 */
export interface IStubElement {
  className: string;
  innerHTML: string;
  classList: { add: (name: string) => void };
  setAttribute: (name: string, value: string) => void;
  appendChild: (child: unknown) => void;
  removeChild: (child: unknown) => void;
  children: unknown[];
}
/**
 * Puts a stand-in for `document` in place and returns how many elements were
 * created through it. Call `restore()` when the test is done.
 */
export function stubDocument(): { created: () => number, restore: () => void } {
  let created = 0;
  const createElement = (): IStubElement => {
    created += 1;
    const children: unknown[] = [];
    return {
      className: '',
      innerHTML: '',
      classList: { add: () => undefined },
      setAttribute: () => undefined,
      appendChild: (child: unknown) => { children.push(child); },
      removeChild: (child: unknown) => {
        const at = children.indexOf(child);
        if (at >= 0) { children.splice(at, 1); }
      },
      children,
    };
  };

  const globals = globalThis as { document?: unknown };
  const previous = globals.document;
  globals.document = { createElement };
  return {
    created: () => created,
    restore: () => { globals.document = previous; },
  };
}
