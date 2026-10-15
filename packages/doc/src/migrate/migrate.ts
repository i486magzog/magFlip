import { SCHEMA_VERSION } from '../common/constants';
import { IBookBundle } from '../model/book';
import { createProblem, IDocProblem, ProblemCode, ProblemSeverity } from '../model/problem';
import { BookBundleSchema } from '../schema/bookSchema';

/**
 * The result of reading stored JSON.
 */
export interface IMigrateResult {
  /** `undefined` when the JSON could not be read. */
  bundle?: IBookBundle;
  /** Version the JSON was stored with, or `null` when it has none. */
  fromVersion: number | null;
  problems: IDocProblem[];
}
/**
 * Steps that bring a bundle from version n to version n + 1.
 * Add one whenever `SCHEMA_VERSION` is raised.
 */
const MIGRATIONS: Record<number, (bundle: Record<string, unknown>) => Record<string, unknown>> = {};

/**
 * Reads stored JSON: applies the migrations it needs and validates the result.
 *
 * A bundle written by a newer version of this package is refused rather than
 * read partially, so an old editor cannot silently drop fields it does not know.
 */
export function migrateBookBundle(input: unknown): IMigrateResult {
  const fromVersion = getSchemaVersion(input);
  if (fromVersion === null) {
    return {
      fromVersion: null,
      problems: [createProblem(
        ProblemCode.InvalidSchema,
        ProblemSeverity.Error,
        'The book has no schemaVersion.',
        { path: 'book.schemaVersion' },
      )],
    };
  }
  if (fromVersion > SCHEMA_VERSION) {
    return {
      fromVersion,
      problems: [createProblem(
        ProblemCode.UnsupportedSchemaVersion,
        ProblemSeverity.Error,
        `The book uses schema version ${fromVersion}, but this package only knows ${SCHEMA_VERSION}.`,
        { path: 'book.schemaVersion' },
      )],
    };
  }

  let migrated = input as Record<string, unknown>;
  for (let version = fromVersion; version < SCHEMA_VERSION; version++) {
    const migrate = MIGRATIONS[version];
    if (!migrate) { continue; }
    migrated = migrate(migrated);
  }

  const parsed = BookBundleSchema.safeParse(migrated);
  if (!parsed.success) {
    return {
      fromVersion,
      problems: parsed.error.issues.map(issue => createProblem(
        ProblemCode.InvalidSchema,
        ProblemSeverity.Error,
        `The book is invalid at "${issue.path.join('.')}": ${issue.message}`,
        { path: issue.path.join('.') },
      )),
    };
  }
  return { bundle: parsed.data as IBookBundle, fromVersion, problems: [] };
}

function getSchemaVersion(input: unknown): number | null {
  const book = (input as { book?: { schemaVersion?: unknown } } | null)?.book;
  return typeof book?.schemaVersion === 'number' ? book.schemaVersion : null;
}
