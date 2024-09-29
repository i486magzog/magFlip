import { Book, BookEvent } from '../core/book'
import { BookManager } from '../core/bookManager'
import { MZMath } from '../mzMath';
import { Base } from './base';

/**
 * This is an object type used to reference Elements related to the Viewer.
 */
export type BookViewerElements = {
  bookViewerEl: HTMLElement,
  bookContainerEl: HTMLElement
}
/**
 * BookViewer class
 * Gutter:
 * 
 */
export class BookViewer extends Base {
  /**
   * Book object.
   * This contains the most information of a book loaded to this viewer.
   */
  protected book: Book | undefined;
  /**
   * This is html document id of the book viewer.
   * It is set when creating a viewer instance or default value 'bookViewer' is set.
   */
  readonly bookViewerDocId: string;
  /**
   * Returns the instance of BookManager.
   */
  readonly bookManager: BookManager;
  /**
   * Returns the DOM element of the book viewer with id 'bookViewer'.
   */
  readonly bookViewerEl: HTMLElement;
  /**
   * Returns the DOM element of the book container with id 'bookContainer'.
   */
  readonly bookContainerEl: HTMLElement;
  /**
   * This getter returns Rect data of the page container which is the child element of the book element.
   */
  get pageContainerRect(){
    const el = this.book?.pageContainerEl;
    if(!el){ throw new Error("Not found the page container.") }
    return el && MZMath.getOffset4Fixed(el as HTMLDivElement)
  }

  constructor(bookManager:BookManager) {
    super();
    this.bookViewerDocId = "bookViewer";
    this.bookManager = bookManager;
    ({ bookContainerEl:this.bookContainerEl, 
      bookViewerEl: this.bookViewerEl } = this.createViewerElements());
  }
  /**
   * Creates the viewer related elements.
   * @returns ViewerElements
   */
  private createViewerElements():BookViewerElements {    
    let viewerEl = document.getElementById(this.bookViewerDocId);

    if(viewerEl){ viewerEl.innerHTML = ""; } 
    else { 
      viewerEl = document.createElement('div'); 
      viewerEl.id = this.bookViewerDocId;
      document.body.appendChild(viewerEl);
    }
    // Viewer
    viewerEl.className = "";
    viewerEl.classList.add("hidden");
    // Book Container
    const bookContainer = document.createElement('div');
    bookContainer.id = "bookContainer";
    viewerEl.appendChild(bookContainer);
    // Close Button
    const btnClose = document.createElement('button');
    btnClose.id = "btnClose";
    btnClose.innerHTML = "X";
    btnClose.addEventListener('click', (event: Event) => { this.closeViewer(); });
    viewerEl.appendChild(btnClose);

    return { 
      bookContainerEl: bookContainer, 
      bookViewerEl: viewerEl
    } 
  };
  /**
   * Opens the book on the viewer.
   * @param book 
   * @param openRightPageIndex 
   */
  view(book: Book, openRightPageIndex: number = 0) {
    this.bookViewerEl?.classList.remove("hidden");
    this.book = book;
  }
  /**
   * Closes the book on the viewer.
   */
  closeViewer() { }
}