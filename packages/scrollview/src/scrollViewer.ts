import { IPageData, IBookView, Book } from "@magflip/core";
/**
 * This is an object type used to reference Elements related to the ScrollingViewer.
 */
type ScrollViewerElements =  {
  bookContainerEl:HTMLElement
}
/**
 * 
 */
export class ScrollView implements IBookView{
  /**
   * This id is unique string for FlipView object.
   */
  readonly id = 'scroll-view';
  /**
   * Book object.
   * This contains the most information of a book loaded to this viewer.
   */
  private book: Book | undefined;
  /**
   * Returns the DOM element of the book container with id 'bookContainer'.
   */
  readonly bookContainerEl: HTMLElement;
  constructor() {
    ({ bookContainerEl: this.bookContainerEl} = this.createElements());
  }
  /**
   * Creates the viewer related elements.
   * @returns ViewerElements
   */
  createElements():ScrollViewerElements {  
    const svgNS = "http://www.w3.org/2000/svg";
    const bookContainerEl = document.createElement('div');
    bookContainerEl.id = "bookContainer";
    
    return {
      // bookViewerEl: bookViewerEl,
      bookContainerEl: bookContainerEl
    };
  };
  getBookContainerEl(){ return this.bookContainerEl; }
  /**
   * 
   * @param book 
   * @param openPageIndex 
   */
  view(book:Book, openPageIndex:number = 0):HTMLElement{
    this.attachBook(book);
    this.setViewer();
    const indexRange = { start:openPageIndex-3, cnt:6 };
    this.loadPages(indexRange);
    this.showPages(indexRange);

    return this.bookContainerEl;
  }
  /**
   * 
   */
  closeViewer():void{
    // TODO Save current book status.
    this.detachBook(); 
  }
  /**
   * Returns the book back to the BookManager.
   */
  private detachBook() {
    this.book = undefined;
  }
  /**
   * Attach a book to this book viewer.
   */
  private attachBook(book:Book) {
    this.book = book;
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