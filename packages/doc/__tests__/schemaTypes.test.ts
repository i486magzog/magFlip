import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { IBookBundle, IBookDoc } from '../src/model/book';
import { IElement } from '../src/model/element';
import { ISurfaceDoc } from '../src/model/surface';
import { ITextContent } from '../src/model/text';
import { BookBundleSchema, BookDocSchema } from '../src/schema/bookSchema';
import { ElementSchema } from '../src/schema/elementSchema';
import { SurfaceDocSchema } from '../src/schema/surfaceSchema';
import { TextContentSchema } from '../src/schema/textSchema';

/**
 * `true` when the schema produces the model and accepts it back.
 *
 * A field that only the interface has makes the output stop fitting the model;
 * a field that only the schema has makes the model stop being accepted. Either
 * way this type stops being `true` and `tsc --noEmit` fails, which is what
 * keeps the runtime checks and the types from drifting apart.
 */
type MatchesModel<Schema extends z.ZodType, Model> =
  [z.infer<Schema>] extends [Model]
    ? ([Model] extends [z.input<Schema>] ? true : ['the model is not accepted by the schema', Model])
    : ['the schema does not produce the model', z.infer<Schema>];

const elementMatches: MatchesModel<typeof ElementSchema, IElement> = true;
const surfaceMatches: MatchesModel<typeof SurfaceDocSchema, ISurfaceDoc> = true;
const bookMatches: MatchesModel<typeof BookDocSchema, IBookDoc> = true;
const bundleMatches: MatchesModel<typeof BookBundleSchema, IBookBundle> = true;
const textMatches: MatchesModel<typeof TextContentSchema, ITextContent> = true;

describe('schemas and types', () => {
  it('describe the same documents', () => {
    expect([elementMatches, surfaceMatches, bookMatches, bundleMatches, textMatches]).toEqual([true, true, true, true, true]);
  });
});
