import { IBookView, IClosedBookPlace } from '../common/models';
import { Book} from './book'
import { BookShelfManager as BookShelfManager } from './bookShelfManager'
import { Base } from './base';

/**
 * How long the viewer takes to come in while a book flies to it, in milliseconds.
 */
const VIEWER_FADE_IN_DURATION = 420;
/**
 * How long the viewer takes to go while a closed book flies away, in milliseconds.
 */
const VIEWER_FADE_OUT_DURATION = 300;

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
  private registeredEventHandlers: { [n:string] : (...args:any[]) => void } = {};
  private callbackEventHandler = (handlerName: string, ...args: any[]) => {
    if(this.registeredEventHandlers[handlerName]){
      this.registeredEventHandlers[handlerName](...args);
    }
  };
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
  /**
   * The viewer fading away after it was closed. Opening a book stops it.
   */
  private closing:Animation|undefined;



  constructor(bookManager:BookShelfManager) {
    super();
    this.bookViewerDocId = "bookViewer";
    this.bookShelfManager = bookManager;

    if(bookManager.config.onViewerClose) {
      this.registeredEventHandlers['close'] = bookManager.config.onViewerClose;
    }
    if(bookManager.config.onViewerOpen) {
      this.registeredEventHandlers['open'] = bookManager.config.onViewerOpen;
    }

    ({ bookViewerEl: this.element } = this.createViewerElements());
  }
  /**
   * Creates the viewer related elements.
   * @returns ViewerElements
   */
  private createViewerElements():BookViewerElements {    
    let viewerEl = document.getElementById(this.bookViewerDocId);

    if(viewerEl){ this.resetBookEls(viewerEl); } 
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
    this.closing?.cancel();
    this.closing = undefined;
    this.book = book;
    this.element.className = 'hidden';
    const bookContainerEl = this.bookContainerEl = this.curView.getBookContainerEl();
    this.element.appendChild(bookContainerEl);
    this.element.classList.add(this.curView.id);
    this.curView.view(book, openPageIndex);
    this.element.classList.remove("hidden");
    this.callbackEventHandler('open', book);
  }
  /**
   * Closes the book on the viewer.
   */
  closeViewer(){
    // Taken before the book leaves the view: a closed book flies back from here.
    const closedPlace = this.getClosedBookPlace();
    this.hide(closedPlace !== undefined && this.bookShelfManager.animatesBooks);
    this.bookContainerEl && this.element.removeChild(this.bookContainerEl);
    this.curView?.closeViewer();
    this.bookShelfManager.returnBookToShelf(this.book, closedPlace);
    if(this.book){
      this.book.resetBook();
      if(this.bookContainerEl){
        this.bookContainerEl.className = "";
        this.bookContainerEl.removeChild(this.book.element);
        this.bookContainerEl = undefined;
      }
      this.book = undefined;
    }
    this.callbackEventHandler('close');
  }
  /**
   * Where the current view shows the book closed, or would if it were closed
   * now. `undefined` without a book, or when the view never shows one closed.
   */
  getClosedBookPlace():IClosedBookPlace|undefined {
    if(!this.book){ return undefined; }
    return this.curView?.getClosedBookPlace?.();
  }
  /**
   * Keeps the open book out of sight until `arrival` settles, while a copy of
   * it flies in, and brings the viewer in over the same time.
   * @param arrival settles when the copy has landed where the book is.
   */
  awaitBook(arrival:Promise<void>){
    const book = this.book;
    this.element.classList.add('book-arriving');
    this.element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: VIEWER_FADE_IN_DURATION, easing: 'ease-out' });
    arrival.then(() => {
      if(this.book === book){ this.element.classList.remove('book-arriving'); }
    });
  }
  /**
   * Hides the viewer - at once, or fading while the closed book flies away.
   */
  private hide(isFading:boolean){
    if(!isFading){
      this.element.className = 'hidden';
      return;
    }
    // Still drawn while it fades, but no longer in the reader's way.
    this.element.classList.add('is-closing');
    const closing = this.closing = this.element.animate([{ opacity: 1 }, { opacity: 0 }], { duration: VIEWER_FADE_OUT_DURATION, easing: 'ease-in', fill: 'forwards' });
    closing.finished.then(() => {
      if(this.closing !== closing){ return; }
      this.closing = undefined;
      this.element.className = 'hidden';
      // Held at nothing until now, so that it could not flash back first.
      closing.cancel();
    }, () => undefined);
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

  private resetBookEls(viewerEl:HTMLElement){ 
    const children = Array.from(viewerEl.children);
    children.forEach(child => {
      if(child !== this.bookContainerEl
        && !child.classList.contains('do-not-remove')
      ){ 
        viewerEl.removeChild(child); 
      }
    });
  }
}