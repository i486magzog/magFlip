/**
 * How serious a problem is.
 */
export enum ProblemSeverity {
  /** The book cannot be published until it is fixed. */
  Error = 'error',
  /** The book can be published, but something is probably wrong. */
  Warning = 'warning',
}
/**
 * Problem codes. The editor maps them to a message and to a fix.
 */
export enum ProblemCode {
  /** A document does not match the schema. */
  InvalidSchema = 'invalid-schema',
  /** The schema version is newer than this package. */
  UnsupportedSchemaVersion = 'unsupported-schema-version',
  /** A record key does not match the id of its value. */
  KeyIdMismatch = 'key-id-mismatch',
  /** A surface listed in the manifest has no document. */
  MissingSurface = 'missing-surface',
  /** A surface document does not appear in the manifest. */
  OrphanSurface = 'orphan-surface',
  /** A spread surface does not start on a left page. */
  SpreadMisaligned = 'spread-misaligned',
  /** The book does not end with a single page standing alone. */
  LastPageMisaligned = 'last-page-misaligned',
  /** `masterId` points to a master that does not exist. */
  MissingMaster = 'missing-master',
  /** A master surface uses another master. */
  NestedMaster = 'nested-master',
  /** An override points to an element the master does not have. */
  UnknownMasterOverride = 'unknown-master-override',
  /** An override would make the element invalid, so it was ignored. */
  InvalidMasterOverride = 'invalid-master-override',
  /** The extent does not contain the pages of the surface. */
  ExtentExcludesTrim = 'extent-excludes-trim',
  /** `parentId` points to an element that does not exist. */
  OrphanElement = 'orphan-element',
  /** `parentId` points to an element that is not a group. */
  InvalidParent = 'invalid-parent',
  /** Groups contain each other. */
  ElementCycle = 'element-cycle',
  /** Groups are nested deeper than `DOC_LIMITS.maxGroupDepth`. */
  GroupTooDeep = 'group-too-deep',
  /** An element references an asset that does not exist. */
  MissingAsset = 'missing-asset',
  /** A link points to a surface that does not exist. */
  BrokenPageLink = 'broken-page-link',
  /** A text run uses a font family the book does not define. */
  UnknownFontFamily = 'unknown-font-family',
  /** A limit in `DOC_LIMITS` was exceeded. */
  LimitExceeded = 'limit-exceeded',
  /** A widget names a type the server does not offer; it is published as an empty box. */
  UnknownWidget = 'unknown-widget',
  /** The props of a widget do not fit its settings. */
  InvalidWidgetProps = 'invalid-widget-props',
}
/**
 * One problem found while validating or publishing a book.
 */
export interface IDocProblem {
  code: ProblemCode;
  severity: ProblemSeverity;
  /** English message for developers. The editor shows its own localized text. */
  message: string;
  surfaceId?: string;
  elementId?: string;
  /** Page index, when the problem belongs to a page rather than a surface. */
  pageIndex?: number;
  /** Path inside the document, e.g. `surfaces.abc.elements.def.width`. */
  path?: string;
}

/**
 * Creates a problem.
 */
export function createProblem(
  code: ProblemCode,
  severity: ProblemSeverity,
  message: string,
  location: Omit<IDocProblem, 'code' | 'severity' | 'message'> = {},
): IDocProblem {
  return { code, severity, message, ...location };
}
/**
 * Returns true when at least one problem blocks publishing.
 */
export function hasError(problems: IDocProblem[]): boolean {
  return problems.some(problem => problem.severity === ProblemSeverity.Error);
}
