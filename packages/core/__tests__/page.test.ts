import { Page } from '../src/core/page';
import { IPageData } from '../src/common/models';
import { stubDocument } from './documentStub';

const SIZE = { width: 600, height: 900 };

function makePageData(render?: (contentEl: HTMLElement) => void): IPageData {
  return { id: 'p1', index: 0, size: SIZE, ...(render ? { render } : {}) };
}

describe('Page elements', () => {
  let stub: ReturnType<typeof stubDocument>;

  beforeEach(() => { stub = stubDocument(); });
  afterEach(() => { stub.restore(); });

  it('is not built until something asks for it', () => {
    let drawn = 0;
    const page = new Page(makePageData(() => { drawn += 1; }));

    expect(page.hasElements).toBe(false);
    expect(stub.created()).toBe(0);
    expect(drawn).toBe(0);
  });

  it('is built once, the first time it is asked for', () => {
    let drawn = 0;
    const page = new Page(makePageData(() => { drawn += 1; }));

    const element = page.element;

    expect(page.hasElements).toBe(true);
    expect(drawn).toBe(1);
    // The same element comes back, and nothing more is created.
    const createdAfterFirst = stub.created();
    expect(page.element).toBe(element);
    expect(page.contentEl).toBeDefined();
    expect(stub.created()).toBe(createdAfterFirst);
    expect(drawn).toBe(1);
  });

  it('draws content and image when no renderer was given', () => {
    const page = new Page({ id: 'p1', index: 0, size: SIZE, content: '<p>hi</p>', image: 'cover.jpg' });

    expect(page.contentEl.innerHTML).toBe('<p>hi</p><img src="cover.jpg"/>');
  });

  it('resets nothing when the page was never shown', () => {
    const page = new Page(makePageData());

    page.resetPageEls();

    expect(page.hasElements).toBe(false);
    expect(stub.created()).toBe(0);
  });
});
