import { Book } from '../src/core/book';
import { BookFace } from '../src/common/models';
import { stubDocument } from './documentStub';

const COVER = 'cover.jpg';

function makeBook():Book {
  return new Book({
    id: 'book1',
    title: 'A Book',
    lastPageIndex: 15,
    thumbnails: { spine: COVER, small: COVER, medium: COVER, cover: { front: COVER, back: COVER } },
  });
}

describe('Book object', () => {
  let stub: ReturnType<typeof stubDocument>;

  beforeEach(() => { stub = stubDocument(); });
  afterEach(() => { stub.restore(); });

  it('is not built until something asks for it', () => {
    const book = makeBook();
    const createdByBook = stub.created();

    expect(book.hasObjectEl).toBe(false);
    // Nothing else was built for it, so no cover picture was asked for.
    expect(book.getObjectPlace()).toBeUndefined();
    book.setObjectPickedUp(true);
    expect(book.hasObjectEl).toBe(false);
    expect(stub.created()).toBe(createdByBook);
  });

  it('remembers the face it should show until it is built', () => {
    const book = makeBook();

    expect(book.objectFace).toBe(BookFace.Front);
    book.setObjectFace(BookFace.Spine);

    expect(book.objectFace).toBe(BookFace.Spine);
    expect(book.hasObjectEl).toBe(false);
  });

  it('tells a flight what to draw', () => {
    const book = makeBook();
    book.importPages([], { width: 700, height: 700 });

    expect(book.getObjectData()).toEqual({
      title: 'A Book',
      spineImage: COVER,
      frontImage: COVER,
      backImage: COVER,
      size: expect.objectContaining({ width: 700, height: 700 }),
      pageCount: 16,
    });
  });
});
