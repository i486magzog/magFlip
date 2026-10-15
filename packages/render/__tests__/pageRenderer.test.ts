import { beforeEach, describe, expect, it } from 'vitest';
import { IPublishedSurface, SurfaceKind } from '@magflip/doc';
import { PageRenderer } from '../src/pageRenderer';
import { ELEMENT_ID_ATTRIBUTE } from '../src/surfaceLayer';
import { makeImage, PAGE_SIZE, publishSurfaces, setClientSize } from './helpers';

const { Single, Spread } = SurfaceKind;

function createHost(width = PAGE_SIZE.width, height = PAGE_SIZE.height): HTMLElement {
  const host = document.createElement('div');
  setClientSize(host, width, height);
  document.body.appendChild(host);
  return host;
}

function publishOne(kind: SurfaceKind, elements: Parameters<typeof publishSurfaces>[0][number]['elements'], doc = {}): IPublishedSurface {
  const surface = publishSurfaces([{ kind, elements, doc }])['s0'];
  if (!surface) { throw new Error('The test surface was not published.'); }
  return surface;
}

describe('PageRenderer', () => {
  beforeEach(() => { document.body.replaceChildren(); });

  it('shows the left page of a spread at the origin of the surface', () => {
    const host = createHost();
    const surface = publishOne(Spread, [makeImage('panorama', 0, PAGE_SIZE.width * 2)]);

    new PageRenderer(host).renderPage({ surface, surfaceX: 0, pageSize: PAGE_SIZE });

    const fit = host.querySelector('.mf-page-fit') as HTMLElement;
    expect(fit.style.transform).toBe('translate(0px, 0px) scale(1) translate(0px, 0px)');
    expect(host.querySelector(`[${ELEMENT_ID_ATTRIBUTE}="panorama"]`)).not.toBeNull();
  });

  it('slides the surface over to show the right page', () => {
    const host = createHost();
    const surface = publishOne(Spread, [makeImage('panorama', 0, PAGE_SIZE.width * 2)]);

    new PageRenderer(host).renderPage({ surface, surfaceX: PAGE_SIZE.width, pageSize: PAGE_SIZE });

    const fit = host.querySelector('.mf-page-fit') as HTMLElement;
    expect(fit.style.transform).toContain(`translate(${-PAGE_SIZE.width}px, 0px)`);
  });

  it('scales the page to the size the viewer shows it at', () => {
    // Half the document size: the page still has to fill the host.
    const host = createHost(PAGE_SIZE.width / 2, PAGE_SIZE.height / 2);
    const surface = publishOne(Single, [makeImage('photo', 0, 100)]);

    new PageRenderer(host).renderPage({ surface, surfaceX: 0, pageSize: PAGE_SIZE });

    expect((host.querySelector('.mf-page-fit') as HTMLElement).style.transform).toContain('scale(0.5)');
  });

  it('centers a page whose aspect ratio differs from the host', () => {
    const host = createHost(PAGE_SIZE.width * 2, PAGE_SIZE.height);
    const surface = publishOne(Single, [makeImage('photo', 0, 100)]);

    new PageRenderer(host).renderPage({ surface, surfaceX: 0, pageSize: PAGE_SIZE });

    expect((host.querySelector('.mf-page-fit') as HTMLElement).style.transform)
      .toContain(`translate(${PAGE_SIZE.width / 2}px, 0px)`);
  });

  it('shows the whole extent when the page is expanded', () => {
    const extent = {
      rect: { x: 0, y: 0, width: PAGE_SIZE.width * 2, height: PAGE_SIZE.height },
      isViewerVisible: true,
    };
    const host = createHost(PAGE_SIZE.width * 2, PAGE_SIZE.height * 2);
    const surface = publishOne(Single, [makeImage('onPage', 0, 100), makeImage('extra', PAGE_SIZE.width, 100)], { extent });

    const renderer = new PageRenderer(host);
    renderer.renderPage({ surface, surfaceX: 0, pageSize: PAGE_SIZE });
    const pageTransform = (host.querySelector('.mf-page-fit') as HTMLElement).style.transform;

    renderer.renderExpanded(surface);
    const expandedTransform = (host.querySelector('.mf-page-fit') as HTMLElement).style.transform;

    // One page fills the host at scale 2; the whole extent is twice as wide, so it fits at scale 1.
    expect(pageTransform).toContain('scale(2)');
    expect(expandedTransform).toContain('scale(1)');
    expect(host.querySelector(`[${ELEMENT_ID_ATTRIBUTE}="extra"]`)).not.toBeNull();
  });

  it('clears and removes what it added', () => {
    const host = createHost();
    const surface = publishOne(Single, [makeImage('photo', 0, 100)]);
    const renderer = new PageRenderer(host);

    renderer.renderPage({ surface, surfaceX: 0, pageSize: PAGE_SIZE });
    renderer.clear();
    expect(host.querySelector(`[${ELEMENT_ID_ATTRIBUTE}="photo"]`)).toBeNull();

    renderer.destroy();
    expect(host.querySelector('.mf-page-window')).toBeNull();
  });
});
