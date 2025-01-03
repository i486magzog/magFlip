import { IBookData, BookStatus, BookType } from '../common/models';
import { BookSize } from '../common/dimension';
import { BookShelf } from './bookShelf';
import { Book } from './book';
import { BookViewer } from './bookViewer';
import { deepMerge } from 'src/common/helper';

export interface IBookShelfManagerConfig {
  hideBookShelf?: boolean;
  onViewerClose?: () => void;
  onViewerOpen?: () => void;
}
/**
 * BookManager class
 */
export class BookShelfManager {
  config:IBookShelfManagerConfig = {
    hideBookShelf: false
  };
  /**
   * Returns the BookShelf instance.
   */
  private readonly bookShelf: BookShelf;
  /**
   * Returns the BookViewer instance.
   */
  private readonly bookViewer: BookViewer;
  /**
   * 
   * @param bookShelfDocId 
   * @param bookViewerId 
   */
  constructor(config?:IBookShelfManagerConfig) {
    this.config = deepMerge(this.config, config);
    this.bookShelf = new BookShelf(this);
    this.bookViewer = new BookViewer(this);
  }
  /**
   * Change viewing book style.
   * @param type 
   */
  getBookViewer(){ return this.bookViewer; }
  /**
   * Gets a book holder's element with the book's id.
   * @param id 
   * @returns 
   */
  getBookHolder(id:string):Element { return this.bookShelf.getBookHolder(id); }
  /**
   * Gets a book object with the book's id.
   * @param id 
   * @returns 
   */
  getBook(id:string):Book { return this.bookShelf.getBook(id); }
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
  importBookToShelf(book:Book){
    this.bookShelf.addBook(book, {
      click: (event: Event) => { this.pickupAndView(this.getBook(book.id)); }
    });
  }
  /**
   * Append the book to the shelf.
   * @param id 
   */
  addBookToShelf(book:IBookData) { 
    this.bookShelf.addBook(new Book(book), {
      click: (event: Event) => { this.pickupAndView(this.getBook(book.id)); }
    });
  }
  /**
   * Pickup a book from the shelf and view it on the viewer.
   * @param book 
   * @returns 
   */
  pickupAndView(book: Book) { 
    if(book.status == BookStatus.Open){ return; }
    book.status = BookStatus.Open;
    this.bookViewer?.view(book); 
  }
  /**
   * Put back the book from the viewer to the shelf.
   * @param book 
   */
  returnBookToShelf(book: Book | undefined) { 
    if(!book){ 
      // TODO: Find empty book cases and reload the books.
    } else {
      if(book.status == BookStatus.Close){ return; }
      book.status = BookStatus.Close;
      this.bookShelf.putbackBook(book);
    }
  }
}