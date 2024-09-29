import { BookViewer, BookViewerElements } from "@lib/core/bookViewer";
import { Book } from "../core/book";
import { BookManager } from "../core/bookManager";
import { IPageData, IViewer } from "../models";
import { MZMath } from "../mzMath";
/**
 * This is an object type used to reference Elements related to the ScrollingViewer.
 */
type ScrollViewerElements =  {
  
}
/**
 * 
 */
export class ScrollViewer extends BookViewer implements IViewer {
  /**
   * This getter returns Rect data of the page container which is the child element of the book element.
   */
  get pageContainerRect(){
    const el = this.book?.pageContainerEl;
    if(!el){ throw new Error("Not found the page container.") }
    return el && MZMath.getOffset4Fixed(el as HTMLDivElement)
  }
  constructor(bookManager:BookManager, viewerId?:string) {
    super(bookManager);
    this.createElements();
  }
  /**
   * Creates the viewer related elements.
   * @returns ViewerElements
   */
  createElements():ScrollViewerElements {  
    const bookViewerEl = this.bookViewerEl;
    const bookContainerEl = this.bookContainerEl;
    // Viewer
    // const svgNS = "http://www.w3.org/2000/svg";
    bookViewerEl.classList.add("scroll-type");

    return {
      bookViewerEl: bookViewerEl,
      bookContainerEl: bookContainerEl
    };
  };
  /**
   * 
   * @param book 
   * @param openPageIndex 
   */
  view(book:Book, openPageIndex:number = 0):void{
    super.view(book);
    // this.init();
    this.bookViewerEl?.classList.add('scroll-type');
    this.bookViewerEl?.classList.remove("hidden");
    this.book = book;
    this.attachBook();
    this.setViewer();
    const indexRange = { start:openPageIndex-3, cnt:6 };
    this.loadPages(indexRange);
    this.showPages(indexRange);
  }
  /**
   * 
   */
  closeViewer():void{
    // TODO Save current book status.
    // this.init();
    this.detachBook(); 
  }
  /**
   * Returns the book back to the BookManager.
   */
  private detachBook() {
    this.bookContainerEl.className = "";
    this.bookViewerEl.className = "";
    this.bookViewerEl.classList.add("hidden");  
    if(this.book){
      this.book.element.removeAttribute('style');
      this.book.resetBook();
      this.bookContainerEl.removeChild(this.book.element);
      this.bookManager.returnBookToShelf(this.book);
    }
    this.book = undefined;
  }
  /**
   * Attach a book to this book viewer.
   */
  private attachBook() {
    const book = this.book;
    if(!book?.element){ throw new Error("Error the book opening"); }
    this.bookContainerEl.appendChild(book.element);
  }
  /**
   * Set the viewer to work.
   */
  private setViewer(){
    if(!this.book){ throw new Error("Book object does not exist."); }
    const { closed, opened } = this.book.size;

    const docStyle = document.documentElement.style;
    docStyle.setProperty('--opened-book-width', `${opened.width}px`);
    docStyle.setProperty('--closed-book-width', `${closed.width}px`);
    docStyle.setProperty('--book-height', `${closed.height}px`);
    docStyle.setProperty('--page-width', `${closed.width}px`);
    docStyle.setProperty('--page-height', `${closed.height}px`);
  }
  /**
   * Fetches and loads pages.
   * @param indexRange 
   */
  private async loadPages(indexRange: {start:number, cnt:number}): Promise<IPageData[]> {
    if(!this.book){ throw new Error("Error the book opening"); }
    return this.book.fetchPages(indexRange);
  }
  /**
   * 
   * @param index 
   */
  private showPages(indexRange: {start:number, cnt:number}) {
    const book = this.book;
    if(!book){ throw new Error("Error the book opening"); }
    //
    // Load the pages to the window 
    // & append page elements to dom.
    //
    const maxIndex = indexRange.start + indexRange.cnt;
    for(let i=indexRange.start; i<maxIndex; i++){
      const page = book.getPage(i);
      if(page){
        book.appendPageEl(page.element);
      }
    }
  }
}