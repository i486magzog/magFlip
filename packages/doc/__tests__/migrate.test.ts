import { describe, expect, it } from 'vitest';
import { SCHEMA_VERSION } from '../src/common/constants';
import { migrateBookBundle } from '../src/migrate/migrate';
import { ProblemCode } from '../src/model/problem';
import { SurfaceKind } from '../src/model/surface';
import { makeBook, makeBundle, makeShape, makeSurface } from './helpers';

describe('migrateBookBundle', () => {
  it('reads a bundle of the current version as it is', () => {
    const bundle = makeBundle(makeBook([SurfaceKind.Single]), [makeSurface('s0', [makeShape('box', 0, 0)])]);

    const result = migrateBookBundle(JSON.parse(JSON.stringify(bundle)));

    expect(result.fromVersion).toBe(SCHEMA_VERSION);
    expect(result.problems).toEqual([]);
    expect(result.bundle).toEqual(bundle);
  });

  it('refuses a bundle written by a newer version', () => {
    const bundle = makeBundle(makeBook([SurfaceKind.Single]), [makeSurface('s0')]);
    bundle.book.schemaVersion = SCHEMA_VERSION + 1;

    const result = migrateBookBundle(bundle);

    expect(result.bundle).toBeUndefined();
    expect(result.problems.map(problem => problem.code)).toEqual([ProblemCode.UnsupportedSchemaVersion]);
  });

  it('refuses JSON without a version', () => {
    const result = migrateBookBundle({ book: {}, surfaces: {} });

    expect(result.fromVersion).toBeNull();
    expect(result.problems.map(problem => problem.code)).toEqual([ProblemCode.InvalidSchema]);
  });

  it('refuses JSON that does not match the schema', () => {
    const bundle = makeBundle(makeBook([SurfaceKind.Single]), [makeSurface('s0')]);
    const broken = { ...bundle, book: { ...bundle.book, pageSize: { width: 0, height: -1 } } };

    const result = migrateBookBundle(broken);

    expect(result.bundle).toBeUndefined();
    expect(result.problems.length).toBeGreaterThan(0);
    expect(result.problems.every(problem => problem.code === ProblemCode.InvalidSchema)).toBe(true);
    expect(result.problems.map(problem => problem.path)).toContain('book.pageSize.width');
  });
});
