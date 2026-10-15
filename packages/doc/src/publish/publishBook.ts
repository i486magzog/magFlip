import { SCHEMA_VERSION } from '../common/constants';
import { computeBookLayout, getSortedSurfaceRefs, IBookLayout } from '../layout/bookLayout';
import { IBookBundle, IBookDoc, IFontFace } from '../model/book';
import { IDocProblem } from '../model/problem';
import { IPublishedBook, IPublishedSurface, IPublishedSurfaceRef } from '../model/published';
import { ISurfaceDoc, SurfaceKind } from '../model/surface';
import { validateBookBundle } from '../validate/validateBook';
import { createSurfaceTextContext } from './resolveNodes';
import { IPublishAssetOptions, publishSurface } from './publishSurface';

/**
 * What a publication needs on top of the assets.
 */
export interface IPublishBookOptions extends IPublishAssetOptions {
  /** Publication number, increased on every publish. */
  version: number;
  /** ISO 8601 timestamp. Defaults to now. */
  publishedAt?: string;
  /** Returns the URL a reader fetches a font file from. */
  resolveFontUrl: (font: IFontFace) => string;
}
/**
 * A published book: one manifest and one file per surface.
 */
export interface IPublishBookResult {
  /** `undefined` when the book could not be compiled. */
  book?: IPublishedBook;
  surfaces: Record<string, IPublishedSurface>;
  /** Check with `hasError` before storing the result. */
  problems: IDocProblem[];
}

/**
 * Builds the manifest the viewer loads first.
 * @param surfaceRefs What each surface turned into, from `publishSurface`.
 */
export function publishBookManifest(
  book: IBookDoc,
  layout: IBookLayout,
  surfaceRefs: Record<string, IPublishedSurfaceRef>,
  options: Pick<IPublishBookOptions, 'version' | 'publishedAt' | 'resolveFontUrl'>,
): IPublishedBook {
  return {
    schemaVersion: SCHEMA_VERSION,
    bookId: book.id,
    version: options.version,
    publishedAt: options.publishedAt ?? new Date().toISOString(),
    meta: book.meta,
    pageSize: book.pageSize,
    readingDirection: book.readingDirection,
    pageCount: layout.pages.length,
    pages: layout.pages.map(page => ({
      index: page.index,
      surfaceId: page.surfaceId,
      surfaceX: page.surfaceX,
      side: page.side,
      number: page.number,
    })),
    surfaces: surfaceRefs,
    fonts: Object.values(book.fonts).map(font => ({
      id: font.id,
      family: font.family,
      weight: font.weight,
      style: font.style,
      url: options.resolveFontUrl(font),
    })),
  };
}
/**
 * Compiles a whole book. Small books can be published in one call; a book with
 * thousands of pages is published surface by surface with `publishSurface`,
 * and `publishBookManifest` is called once at the end.
 */
export function publishBookBundle(bundle: IBookBundle, options: IPublishBookOptions): IPublishBookResult {
  const problems: IDocProblem[] = [...validateBookBundle(bundle)];
  const { book } = bundle;
  const layout = computeBookLayout(book);
  const surfaces: Record<string, IPublishedSurface> = {};
  const surfaceRefs: Record<string, IPublishedSurfaceRef> = {};

  for (const ref of getSortedSurfaceRefs(book)) {
    const surface = bundle.surfaces[ref.id];
    if (!surface) { continue; }

    const master = getMaster(bundle, surface);
    const result = publishSurface({
      surface,
      kind: ref.kind,
      pageSize: book.pageSize,
      master,
      side: layout.surfacePages.get(ref.id)?.[0]?.side,
      textContext: createSurfaceTextContext(book, layout, ref.id),
    }, options);
    problems.push(...result.problems);
    if (!result.surface) { continue; }

    surfaces[ref.id] = result.surface;
    surfaceRefs[ref.id] = { id: ref.id, kind: ref.kind, isExpandable: result.surface.isExpandable };
  }

  return {
    book: publishBookManifest(book, layout, surfaceRefs, options),
    surfaces,
    problems,
  };
}

function getMaster(bundle: IBookBundle, surface: ISurfaceDoc): { doc: ISurfaceDoc, kind: SurfaceKind } | null {
  if (surface.masterId === null) { return null; }

  const doc = bundle.surfaces[surface.masterId];
  const ref = bundle.book.masters[surface.masterId];
  if (!doc || !ref) { return null; }
  return { doc, kind: ref.kind };
}
