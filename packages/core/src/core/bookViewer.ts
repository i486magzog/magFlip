import { IBookView } from '../common/models';
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
   * Zoom level of the viewer.
   */
  private zoomLevel:number = 1;
  /**
   * 
   */
  private registeredViews: { [n:string] : IBookView } = {};
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
  readonly element: HTMLElement;
  /**
   * The DOM element of the book container with id 'bookContainer'.
   */
  private _bookContainerEl: HTMLElement|undefined;
  /**
   * Getter of the bookContainerEl.
   */
  get bookContainerEl(){ return this._bookContainerEl; }
  /**
   * Setter of the bookContainerEl.
   * @param el 
   */
  private set bookContainerEl(el:HTMLElement|undefined){ this._bookContainerEl = el; }
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
   * 
   * @param id 
   * @returns 
   */
  private getView(id:string){ return this.registeredViews[id]; }
  /**
   * 
   * @param id 
   * @param view 
   */
  registerView(view: IBookView) { 
    this.registeredViews[view.id] = view; 
    if(!this.curView){ this.curView = view; }
  }
  /**
   * Sets the zoom level of the viewer.
   * @param zoomLevel 
   */
  setZoomLevel(zoomLevel:number){ 
    this.zoomLevel = zoomLevel; 
    this.curView?.zoom(zoomLevel);
  }
  /**
   * Sets the current view.
   * @param viewId 
   */
  setCurView(viewId:string){ this.curView = this.getView(viewId); }
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
    const view = this.getView(id);
    if(view){
      this.setCurView(id);
    }
  }
}