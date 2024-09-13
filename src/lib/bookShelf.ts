import './models.js'
import { Book } from './book.js'
import { BookManager } from './bookManager.js'

interface IBookOnShelf {
  book: Book; 
  bookHolderEl: Element;
  // TODO: Change the meaning of the position.
  position: number;  
}
  
  
/**
 * BookShelf class
 */
export class BookShelf {
  bookManager: BookManager;
  bookShelfDocId: string;
  booksOnShelf: { [id:string]: IBookOnShelf };
  element: Element;

  constructor(bookManager:BookManager, bookShelfDocId?:string) {
    this.booksOnShelf = {};
    this.bookManager = bookManager;
    this.bookShelfDocId = bookShelfDocId || "bookShelf";
    this.element = this.createElement();
  }

  createElement():Element {
    let bookShelfEl = document.getElementById(this.bookShelfDocId);
    if(!bookShelfEl){
      bookShelfEl = document.createElement('div');
      bookShelfEl.id = this.bookShelfDocId;
      document.body.appendChild(bookShelfEl);
    }

    return bookShelfEl;
  }
  /**
   * 
   * @param id 
   * @returns 
   */
  getBookHolder(id:string):Element { return this.booksOnShelf[id].bookHolderEl; }
  /**
   * 
   * @param id 
   * @returns 
   */
  getBook(id:string):Book { return this.booksOnShelf[id].book; }
  /**
   * 
   * @param book 
   */
  addBook(book: Book, event: { [key:string]: (event:Event)=>void } ) {
    const bookOnShelfEl = book.elementOnShelf;
    const bookHolderEl = document.createElement('div');
    bookHolderEl.className = "book-holder";
    bookHolderEl.appendChild(bookOnShelfEl);
    this.element.appendChild(bookHolderEl);
    this.booksOnShelf[book.id] = { 
      book: book,
      bookHolderEl: bookHolderEl,
      position: Object.keys(this.booksOnShelf).length
    };
    //
    // Add event listeners to the book element.
    //
    for(const key in event){
        bookOnShelfEl.addEventListener(key, event[key]);
    }
    
  }
  /**
   * Put back the book from the viewer to the shelf.
   * @param book 
   */
  putbackBook(book: Book) {
    if(book.elementOnShelf){
      const bookHolderEl = this.getBookHolder(book.id);
      bookHolderEl.appendChild(book.elementOnShelf);
    }
  }
}