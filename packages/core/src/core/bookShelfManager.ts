import { IBookData, BookStatus, BookType, IClosedBookPlace } from '../common/models';
import { BookSize } from '../common/dimension';
import { Book, BookEvent } from './book';
import { BookFlight } from './bookFlight';
import { BookViewer } from './bookViewer';
import { deepMerge } from '../common/helper';

/**
 * How long a book flies from where it was chosen to the viewer, in milliseconds.
 */
const OPEN_FLIGHT_DURATION = 700;
/**
 * How long a closed book flies back to where it was chosen, in milliseconds.
 */
const RETURN_FLIGHT_DURATION = 550;
/**
 * How long the flying copy fades over the book the viewer shows, in milliseconds.
 */
const LANDING_FADE_DURATION = 160;

export interface IBookShelfManagerConfig {
  /**
   * @deprecated core no longer draws a shelf, so there is nothing to hide.
   * Place the books with `@magflip/shelf`, or draw your own from `book.objectEl`.
   */
  hideBookShelf?: boolean;
  /**
   * Flies a book from the place it was chosen - its `objectEl` - to the viewer
   * when it is opened, and back when it is closed. Default true. A reader who
   * asked for less motion never sees it.
   */
  animateBook?: boolean;
  onViewerClose?: () => void;
  /**
   * Called with the book the viewer just opened. A host that drives the book
   * from outside - a keyboard, a remote, its own buttons - starts there,
   * because that is when the pages exist.
   */
  onViewerOpen?: (book: Book) => void;
}
/**
 * Holds the books a reader can open, and opens them in the viewer.
 *
 * It does not show the books. Whoever lets the reader choose places each
 * book's `objectEl` - `@magflip/shelf` does it as a grid or a bookshelf - and
 * pressing one opens that book here.
 */
export class BookShelfManager {
  config:IBookShelfManagerConfig = {
    animateBook: true
  };
  /**
   * The books this manager can open, by id.
   */
  private readonly books: { [id:string]: Book } = {};
  /**
   * Returns the BookViewer instance.
   */
  private readonly bookViewer: BookViewer;
  /**
   * The flight in the air, if any. A new one takes its place.
   */
  private flight: BookFlight|undefined;
  /**
   *
   * @param bookShelfDocId
   * @param bookViewerId
   */
  constructor(config?:IBookShelfManagerConfig) {
    this.config = deepMerge(this.config, config);
    this.bookViewer = new BookViewer(this);
  }
  /**
   * True when books fly between the place they were chosen and the viewer.
   */
  get animatesBooks():boolean { return this.config.animateBook !== false && BookFlight.canFly(); }
  /**
   * Change viewing book style.
   * @param type
   */
  getBookViewer(){ return this.bookViewer; }
  /**
   * @deprecated The shelf left core. Returns the element the book's object was
   * placed in, if it was placed.
   * @param id
   * @returns
   */
  getBookHolder(id:string):Element|null {
    const book = this.books[id];
    return book?.hasObjectEl ? book.objectEl.parentElement : null;
  }
  /**
   * Gets a book object with the book's id.
   * @param id
   * @returns
   */
  getBook(id:string):Book { return this.books[id]; }
  /**
   * Load books from the server and add them to the shelf.
   */
  async loadAndAddBooks():Promise<void> {
    // TODO: Control the number of books to load.
    // TODO: fetch books from the server
    const bookSamplesLoaded:IBookData[] = [
      {
        id: "book1",
        status: BookStatus.Close,
        title: "Book 1",
        type: BookType.Magazine,
        author: "Shinkee",
        publication: {
          name: "Magzog",
          location: "Auckland in New Zealand",
          publishedDate: "2022-09-01"
        },
        size: new BookSize({
          closed: { width: 600, height: 900, diagonal:0 },
          opened: { width: 1200, height: 900, diagonal:0 }
        }),
        lastPageIndex:5,
        thumbnails: {
          spine: "resources/cover.jpg",
          small: "resources/cover.jpg",
          medium: "resources/cover.jpg",
          cover: {
            front: "resources/cover.jpg",
            back: "resources/cover.jpg",
          }
        },
      }
    ];

    bookSamplesLoaded.forEach((bookSample) => {
      this.addBookToShelf(bookSample);
    });
  }
  /**
   * Load a book from the server and add it to the shelf.
   * @param id
   */
  async loadAndAddBook(id:string):Promise<void> {
    // TODO: fetch book from the server
    const bookSample:IBookData = {
      id: "book6",
      status: BookStatus.Close,
      title: "The Great Gatsby",
      type: BookType.Magazine,
      author: "Shinkee",
      publication: {
        name: "Magzog",
        location: "Auckland in New Zealand",
        publishedDate: "2021-09-01"
      },
      size: new BookSize({
        closed: { width: 600, height: 900, diagonal:0 },
        opened: { width: 1200, height: 900, diagonal:0 }
      }),
      lastPageIndex:5,
      thumbnails: {
        spine: "resources/cover.webp",
        small: "resources/cover.webp",
        medium: "resources/cover.webp",
        cover: {
          front: "resources/cover.webp",
          back: "resources/cover.webp",
        }
      },
    };

    this.addBookToShelf(bookSample);
  }
  /**
   * Adds a book to the books this manager can open. Pressing its object
   * (`book.objectEl`) opens it from then on. Adding the same book again does
   * nothing.
   * @param book
   */
  importBookToShelf(book:Book){
    if(this.books[book.id] === book){ return; }
    this.books[book.id] = book;
    book.addEventListener(BookEvent.objectActivated, () => { this.pickupAndView(book); });
  }
  /**
   * Makes a book from its data and adds it (see `importBookToShelf`).
   * @param book
   * @returns the book that was made.
   */
  addBookToShelf(book:IBookData):Book {
    const newBook = new Book(book);
    this.importBookToShelf(newBook);
    return newBook;
  }
  /**
   * Opens the book in the viewer, at its front cover.
   *
   * When the book's object is on the screen, the book flies from there to the
   * viewer, and its place stays empty while it is being read.
   * @param book
   * @returns
   */
  pickupAndView(book: Book) {
    if(book.status == BookStatus.Open){ return; }
    book.status = BookStatus.Open;
    this.flight?.cancel();

    const from = this.animatesBooks ? book.getObjectPlace() : undefined;
    book.setObjectPickedUp(true);
    this.bookViewer.view(book);

    const to = from && this.bookViewer.getClosedBookPlace();
    if(!from || !to){ return; }

    const flight = this.flight = new BookFlight(book.getObjectData(), from, to, OPEN_FLIGHT_DURATION);
    this.bookViewer.awaitBook(flight.finished);
    flight.finished.then(() => {
      if(this.flight !== flight){ return; }
      this.flight = undefined;
      flight.land(LANDING_FADE_DURATION);
    });
  }
  /**
   * Puts the book back where it was chosen. `BookViewer.closeViewer` calls this.
   * @param book
   * @param from where the viewer showed the closed book. The book flies back
   * from there when it is given and animation is on.
   */
  returnBookToShelf(book: Book | undefined, from?: IClosedBookPlace) {
    if(!book){
      // TODO: Find empty book cases and reload the books.
      return;
    }
    if(book.status == BookStatus.Close){ return; }
    book.status = BookStatus.Close;
    this.flight?.cancel();

    const to = from && this.animatesBooks ? book.getObjectPlace() : undefined;
    if(!from || !to){
      book.setObjectPickedUp(false);
      return;
    }

    const flight = this.flight = new BookFlight(book.getObjectData(), from, to, RETURN_FLIGHT_DURATION);
    flight.finished.then(() => {
      if(this.flight === flight){ this.flight = undefined; }
      flight.land();
      // Opened again before it got back: it stays out of its place.
      if(book.status == BookStatus.Close){ book.setObjectPickedUp(false); }
    });
  }
}
