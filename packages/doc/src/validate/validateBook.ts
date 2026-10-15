import { z } from 'zod';
import { DOC_LIMITS } from '../common/constants';
import { containsRect, ISize } from '../common/geometry';
import { computeBookLayout } from '../layout/bookLayout';
import { IBookBundle, IBookDoc } from '../model/book';
import { ElementType, IElement } from '../model/element';
import { ILink, LinkKind } from '../model/link';
import { createProblem, IDocProblem, ProblemCode, ProblemSeverity } from '../model/problem';
import { getSurfaceTrimRect, ISurfaceDoc, SurfaceKind } from '../model/surface';
import { BookDocSchema } from '../schema/bookSchema';
import { SurfaceDocSchema } from '../schema/surfaceSchema';
import { getTextLength } from '../text/textContent';
import { buildElementTree } from '../tree/elementTree';

/**
 * What a surface has to be checked against.
 */
export interface IValidateSurfaceContext {
  kind: SurfaceKind;
  pageSize: ISize;
  /** Master surfaces cannot use a master themselves. */
  isMaster?: boolean;
  /** Ids page links may point to. */
  knownSurfaceIds?: ReadonlySet<string>;
  /** Ids `masterId` may point to. */
  knownMasterIds?: ReadonlySet<string>;
  /** Font families the book defines. */
  knownFontFamilies?: ReadonlySet<string>;
}
/**
 * Font families every browser has, so they need no font face.
 */
const GENERIC_FONT_FAMILIES: ReadonlySet<string> = new Set([
  'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui',
]);

/**
 * Checks a whole book: schemas, page order, masters, elements and links.
 *
 * Run it before publishing. Warnings are fine to keep editing with; an error
 * means the book cannot be turned into a correct publication.
 */
export function validateBookBundle(bundle: IBookBundle): IDocProblem[] {
  const problems = validateBookDoc(bundle.book);
  if (problems.some(problem => problem.code === ProblemCode.InvalidSchema)) { return problems; }

  const { book } = bundle;
  const masterIds = new Set(Object.keys(book.masters));
  const surfaceIds = new Set(Object.keys(book.surfaces));
  const fontFamilies = new Set(Object.values(book.fonts).map(font => font.family));

  for (const [id, ref] of Object.entries({ ...book.surfaces, ...book.masters })) {
    const surface = bundle.surfaces[id];
    if (!surface) {
      problems.push(createProblem(
        ProblemCode.MissingSurface,
        ProblemSeverity.Error,
        `Surface "${id}" is listed in the book but has no document.`,
        { surfaceId: id },
      ));
      continue;
    }
    problems.push(...validateSurfaceDoc(surface, {
      kind: ref.kind,
      pageSize: book.pageSize,
      isMaster: masterIds.has(id),
      knownSurfaceIds: surfaceIds,
      knownMasterIds: masterIds,
      knownFontFamilies: fontFamilies,
    }));
  }

  for (const id of Object.keys(bundle.surfaces)) {
    if (surfaceIds.has(id) || masterIds.has(id)) { continue; }
    problems.push(createProblem(
      ProblemCode.OrphanSurface,
      ProblemSeverity.Warning,
      `Surface "${id}" has a document but is not listed in the book.`,
      { surfaceId: id },
    ));
  }
  return problems;
}
/**
 * Checks the manifest of a book on its own.
 */
export function validateBookDoc(book: IBookDoc): IDocProblem[] {
  const parsed = BookDocSchema.safeParse(book);
  if (!parsed.success) { return toSchemaProblems(parsed.error, 'Book'); }

  const problems: IDocProblem[] = [
    ...validateRecordKeys(book.surfaces, 'surfaces'),
    ...validateRecordKeys(book.masters, 'masters'),
    ...validateRecordKeys(book.fonts, 'fonts'),
    ...computeBookLayout(book).problems,
  ];
  return problems;
}
/**
 * Checks one surface. The server runs this on the state of a single
 * collaboration room, without loading the rest of the book.
 */
export function validateSurfaceDoc(surface: ISurfaceDoc, context: IValidateSurfaceContext): IDocProblem[] {
  const parsed = SurfaceDocSchema.safeParse(surface);
  if (!parsed.success) { return toSchemaProblems(parsed.error, `Surface "${surface.id}"`, surface.id); }

  const problems: IDocProblem[] = [];
  problems.push(...validateMasterLink(surface, context));
  problems.push(...validateExtent(surface, context));
  problems.push(...buildElementTree(surface.elements, surface.id).problems);

  for (const [id, element] of Object.entries(surface.elements)) {
    if (id !== element.id) {
      problems.push(createProblem(
        ProblemCode.KeyIdMismatch,
        ProblemSeverity.Error,
        `Element "${element.id}" is stored under key "${id}".`,
        { surfaceId: surface.id, elementId: element.id, path: `elements.${id}` },
      ));
    }
    problems.push(...validateElement(element, surface, context));
  }
  return problems;
}

function validateElement(element: IElement, surface: ISurfaceDoc, context: IValidateSurfaceContext): IDocProblem[] {
  const problems: IDocProblem[] = [];
  if (element.link) { problems.push(...validateLink(element.link, element, surface, context)); }
  if (element.type !== ElementType.Text) { return problems; }

  if (getTextLength(element.content) > DOC_LIMITS.maxTextLength) {
    problems.push(createProblem(
      ProblemCode.LimitExceeded,
      ProblemSeverity.Error,
      `Text element "${element.id}" is longer than ${DOC_LIMITS.maxTextLength} characters.`,
      { surfaceId: surface.id, elementId: element.id },
    ));
  }

  const families = new Set<string>([element.style.fontFamily]);
  for (const block of element.content.blocks) {
    for (const inline of block.inlines) {
      if (inline.marks?.fontFamily) { families.add(inline.marks.fontFamily); }
      if (inline.marks?.link) { problems.push(...validateLink(inline.marks.link, element, surface, context)); }
    }
  }
  for (const family of families) {
    if (!context.knownFontFamilies || context.knownFontFamilies.has(family) || GENERIC_FONT_FAMILIES.has(family)) { continue; }
    problems.push(createProblem(
      ProblemCode.UnknownFontFamily,
      ProblemSeverity.Warning,
      `Text element "${element.id}" uses font family "${family}", which the book does not define.`,
      { surfaceId: surface.id, elementId: element.id },
    ));
  }
  return problems;
}

function validateLink(link: ILink, element: IElement, surface: ISurfaceDoc, context: IValidateSurfaceContext): IDocProblem[] {
  if (link.kind !== LinkKind.Page) { return []; }

  const problems: IDocProblem[] = [];
  if (context.knownSurfaceIds && !context.knownSurfaceIds.has(link.surfaceId)) {
    problems.push(createProblem(
      ProblemCode.BrokenPageLink,
      ProblemSeverity.Warning,
      `Element "${element.id}" links to surface "${link.surfaceId}", which is not in the book.`,
      { surfaceId: surface.id, elementId: element.id },
    ));
  }
  if (link.surfaceX !== 0 && link.surfaceX !== context.pageSize.width) {
    problems.push(createProblem(
      ProblemCode.BrokenPageLink,
      ProblemSeverity.Warning,
      `Element "${element.id}" links to x ${link.surfaceX}, which is not the left or the right page.`,
      { surfaceId: surface.id, elementId: element.id },
    ));
  }
  return problems;
}

function validateMasterLink(surface: ISurfaceDoc, context: IValidateSurfaceContext): IDocProblem[] {
  if (surface.masterId === null) { return []; }
  if (context.isMaster) {
    return [createProblem(
      ProblemCode.NestedMaster,
      ProblemSeverity.Error,
      `Master surface "${surface.id}" uses master "${surface.masterId}". Masters cannot be nested.`,
      { surfaceId: surface.id },
    )];
  }
  if (context.knownMasterIds && !context.knownMasterIds.has(surface.masterId)) {
    return [createProblem(
      ProblemCode.MissingMaster,
      ProblemSeverity.Error,
      `Surface "${surface.id}" uses master "${surface.masterId}", which does not exist.`,
      { surfaceId: surface.id },
    )];
  }
  return [];
}

function validateExtent(surface: ISurfaceDoc, context: IValidateSurfaceContext): IDocProblem[] {
  if (!surface.extent) { return []; }

  const trimRect = getSurfaceTrimRect(context.kind, context.pageSize);
  if (containsRect(surface.extent.rect, trimRect)) { return []; }
  return [createProblem(
    ProblemCode.ExtentExcludesTrim,
    ProblemSeverity.Warning,
    `The extent of surface "${surface.id}" does not contain its pages.`,
    { surfaceId: surface.id },
  )];
}

function validateRecordKeys(record: Record<string, { id: string }>, path: string): IDocProblem[] {
  return Object.entries(record)
    .filter(([key, value]) => key !== value.id)
    .map(([key, value]) => createProblem(
      ProblemCode.KeyIdMismatch,
      ProblemSeverity.Error,
      `"${value.id}" is stored under key "${key}".`,
      { path: `${path}.${key}` },
    ));
}

function toSchemaProblems(error: z.ZodError, subject: string, surfaceId?: string): IDocProblem[] {
  return error.issues.map(issue => createProblem(
    ProblemCode.InvalidSchema,
    ProblemSeverity.Error,
    `${subject} is invalid at "${issue.path.join('.')}": ${issue.message}`,
    { surfaceId, path: issue.path.join('.') },
  ));
}
