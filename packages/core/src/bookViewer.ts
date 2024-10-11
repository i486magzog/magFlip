import { IBookView } from './models';
import { Book} from './book'
import { BookShelfManager as BookShelfManager } from './bookShelfManager'
import { Base } from './base';

/**
 * This is an object type used to reference Elements related to the Viewer.
 */
export type BookViewerElements = {
  bookViewerEl: HTMLElement,
}
/**
 * BookViewer class
 * Gutter:
 * 
 */
export class BookViewer extends Base {
  /**
   * 
   */
  private registeredViews: { [n:string] : IBookView } = {};
  /**
   * 
   * @param id 
   * @param view 
   */
  registerView(view: IBookView) { this.registeredViews[view.id] = view; }
  /**
   * 
   * @param id 
   * @returns 
   */
  private getView(id:string){ return this.registeredViews[id]; }
  /**
   * Book object.
   * This contains the most information of a book loaded to this viewer.
   */
  private book:Book|undefined;
  /**
   * This is html document id of the book viewer.
   * It is set when creating a viewer instance or default value 'bookViewer' is set.
   */
  private readonly bookViewerDocId: string;
  /**
   * Returns the instance of BookManager.
   */
  private readonly bookShelfManager: BookShelfManager;
  /**
   * Returns the DOM element of the book viewer with id 'bookViewer'.
   */
  private readonly element: HTMLElement;
  /**
   * Returns the DOM element of the book container with id 'bookContainer'.
   */
  private bookContainerEl: HTMLElement|undefined;
  /**
   * Returns the instance of current Viewer.
   */
  private curView:IBookView|undefined;

  constructor(bookManager:BookShelfManager) {
    super();
    this.bookViewerDocId = "bookViewer";
    this.bookShelfManager = bookManager;

    ({ bookViewerEl: this.element } = this.createViewerElements());
  }
  setCurView(viewId:string){
    this.curView = this.getView(viewId);
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

    // Close Button
    const btnClose = document.createElement('button');
    btnClose.id = "btnClose";
    btnClose.innerHTML = "X";
    btnClose.addEventListener('click', (event: Event) => { this.closeViewer(); });
    viewerEl.appendChild(btnClose);

    return { bookViewerEl: viewerEl } 
  };
  /**
   * Opens the book on the viewer.
   * @param book 
   * @param openPageIndex 
   */
  view(book: Book, openPageIndex: number = 0) {
    if(!this.curView){ throw new Error('Please select one view.'); }
    this.book = book;
    this.element.className = 'hidden';
    const bookContainerEl = this.bookContainerEl = this.curView.getBookContainerEl();
    this.element.appendChild(bookContainerEl);
    this.element.classList.add(this.curView.id);
    this.curView.view(book, openPageIndex);
    this.element.classList.remove("hidden");
  }
  /**
   * Closes the book on the viewer.
   */
  closeViewer(){
    this.element.className = 'hidden';
    this.bookContainerEl && this.element.removeChild(this.bookContainerEl);
    this.curView?.closeViewer();
    this.bookShelfManager.returnBookToShelf(this.book);
    if(this.book){
      this.book.resetBook();
      if(this.bookContainerEl){
        this.bookContainerEl.className = "";
        this.bookContainerEl.removeChild(this.book.element);
        this.bookContainerEl = undefined;
      }
      this.book = undefined;
    }
  }
  /**
   * 
   * @param id 
   */
  changeView(id:string){
    console.log(this.registeredViews)
    const view = this.getView(id);
    if(view){
      this.curView = view;
    }
  }
}