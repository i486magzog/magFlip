import { SCHEMA_VERSION } from '../common/constants';
import { containsRect, IRect, unionRects } from '../common/geometry';
import { IAsset, IPublishedAsset } from '../model/asset';
import { IWidgetElement } from '../model/element';
import { createProblem, IDocProblem, ProblemCode, ProblemSeverity } from '../model/problem';
import { IPublishedSurface } from '../model/published';
import { getSurfaceTrimRect } from '../model/surface';
import { SurfaceDocSchema } from '../schema/surfaceSchema';
import { IResolveSurfaceInput, resolveSurfaceNodes } from './resolveNodes';

/**
 * Where the published files of the assets live.
 */
export interface IPublishAssetOptions {
  /** Assets of the book, keyed by id. */
  assets: Record<string, IAsset>;
  /** Returns the URL a reader fetches the asset from. */
  resolveAssetUrl: (asset: IAsset) => string;
  /** Returns the address of the page a widget runs in; see `IResolveSurfaceOptions`. */
  resolveWidgetUrl?: (element: IWidgetElement) => string | undefined;
}
/**
 * The result of publishing one surface.
 */
export interface IPublishSurfaceResult {
  /** `undefined` when the surface does not match the schema. */
  surface?: IPublishedSurface;
  problems: IDocProblem[];
}

/**
 * Compiles one surface into the file the viewer downloads.
 *
 * Everything a reader must not see is removed here rather than hidden:
 * hidden elements, the pasteboard, and - when the extent is not published -
 * every element outside the pages. An element that only partly reaches into
 * the visible area is kept and clipped by the renderer.
 */
export function publishSurface(input: IResolveSurfaceInput, options: IPublishAssetOptions): IPublishSurfaceResult {
  const problems: IDocProblem[] = [];
  const parsed = SurfaceDocSchema.safeParse(input.surface);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      problems.push(createProblem(
        ProblemCode.InvalidSchema,
        ProblemSeverity.Error,
        `Surface "${input.surface.id}" is invalid: ${issue.message}`,
        { surfaceId: input.surface.id, path: issue.path.join('.') },
      ));
    }
    return { problems };
  }

  const trimRect = getSurfaceTrimRect(input.kind, input.pageSize);
  const visibleRect = getPublishedVisibleRect(input, trimRect, problems);
  const resolved = resolveSurfaceNodes(input, {
    clipRect: visibleRect,
    includeHidden: false,
    hasAsset: assetId => options.assets[assetId] !== undefined,
    ...(options.resolveWidgetUrl ? { resolveWidgetUrl: options.resolveWidgetUrl } : {}),
  });
  problems.push(...resolved.problems);

  const surface: IPublishedSurface = {
    schemaVersion: SCHEMA_VERSION,
    id: input.surface.id,
    kind: input.kind,
    trimRect,
    visibleRect,
    isExpandable: !containsRect(trimRect, visibleRect),
    background: input.surface.background,
    nodes: resolved.nodes,
    assets: toPublishedAssets(resolved.assetIds, options),
  };
  return { surface, problems };
}

/**
 * Returns what the reader may see. An extent that does not contain the pages
 * is a broken document, so the trim is added back instead of losing content.
 */
function getPublishedVisibleRect(input: IResolveSurfaceInput, trimRect: IRect, problems: IDocProblem[]): IRect {
  const extent = input.surface.extent;
  if (!extent || !extent.isViewerVisible) { return trimRect; }

  if (!containsRect(extent.rect, trimRect)) {
    problems.push(createProblem(
      ProblemCode.ExtentExcludesTrim,
      ProblemSeverity.Warning,
      `The extent of surface "${input.surface.id}" does not contain its pages.`,
      { surfaceId: input.surface.id },
    ));
    return unionRects([extent.rect, trimRect]) as IRect;
  }
  return extent.rect;
}

function toPublishedAssets(assetIds: Set<string>, options: IPublishAssetOptions): Record<string, IPublishedAsset> {
  const published: Record<string, IPublishedAsset> = {};
  for (const assetId of assetIds) {
    const asset = options.assets[assetId];
    if (!asset) { continue; }
    published[assetId] = { ...asset, url: options.resolveAssetUrl(asset) };
  }
  return published;
}
