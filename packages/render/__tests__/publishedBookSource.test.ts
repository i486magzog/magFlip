import { IPublishedBook, IPublishedSurface, SurfaceKind } from '@magflip/doc';
import { describe, expect, it } from 'vitest';
import { PublishedBookSource } from '../src/publishedBookSource';
import { makeImage, publishTestBook, setClientSize } from './helpers';

const { Single, Spread } = SurfaceKind;

/**
 * Serves a published book from memory and counts what a reader asked for.
 */
function serve(book: IPublishedBook, surfaces: Record<string, IPublishedSurface>, manifestUrl = 'https://books.test/b1/v1/book.json') {
  const requested: string[] = [];
  const fetchJson = async (url: string): Promise<unknown> => {
    requested.push(url);
    if (url === manifestUrl) { return book; }

    const id = url.replace(/^.*\/surfaces\//, '').replace(/\.json$/, '');
    const surface = surfaces[id];
    if (!surface) { throw new Error(`No such surface: ${url}`); }
    return surface;
  };
  return { requested, load: () => PublishedBookSource.load(manifestUrl, { fetchJson }) };
}

function createHost(): HTMLElement {
  const host = document.createElement('div');
  setClientSize(host, 300, 450);
  document.body.appendChild(host);
  return host;
}

describe('PublishedBookSource', () => {
  const published = publishTestBook([
    { kind: Single, elements: [makeImage('cover', 0, 600)] },
    { kind: Spread, elements: [makeImage('panorama', 0, 1200)] },
    { kind: Single, elements: [makeImage('last', 0, 600)] },
  ]);

  it('looks for the surfaces next to the manifest', async () => {
    const server = serve(published.book, published.surfaces);
    const source = await server.load();

    await source.loadSurface('s1');

    expect(server.requested).toEqual([
      'https://books.test/b1/v1/book.json',
      'https://books.test/b1/v1/surfaces/s1.json',
    ]);
  });

  it('opens a book without downloading a single page', async () => {
    const server = serve(published.book, published.surfaces);
    const source = await server.load();

    const pages = source.createPageDataList();

    expect(pages).toHaveLength(4);
    expect(server.requested).toEqual(['https://books.test/b1/v1/book.json']);
  });

  it('fetches a page when it is first drawn, and only then', async () => {
    const server = serve(published.book, published.surfaces);
    const source = await server.load();
    const pages = source.createPageDataList();

    const host = createHost();
    pages[1]?.render(host);
    // Both pages of the spread come from the same file.
    pages[2]?.render(createHost());
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(server.requested.filter(url => url.includes('/surfaces/'))).toEqual(['https://books.test/b1/v1/surfaces/s1.json']);
    expect(host.querySelector('.mf-surface')).not.toBeNull();
  });

  it('draws right away once the surface is there', async () => {
    const server = serve(published.book, published.surfaces);
    const source = await server.load();
    await source.loadPages(0, 1);

    const host = createHost();
    source.createPageData(0)?.render(host);

    expect(host.querySelector('.mf-surface')).not.toBeNull();
  });
});
