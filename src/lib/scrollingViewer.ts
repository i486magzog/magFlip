import { Book } from "./book";
import { BookManager } from "./bookManager";
import { IViewer } from "./models";
import { MZMath } from "./mzMath";
/**
 * This is an object type used to reference Elements related to the ScrollingViewer.
 */
type ScrollingViewerElements = {
  bookViewerEl: HTMLElement,
  bookContainerEl: HTMLElement
}
/**
 * 
 */
export class ScrollingViewer implements IViewer {
  /**
   * Book object.
   * This contains the most information of a book loaded to this viewer.
   */
  private book: Book | undefined;
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
  constructor(bookManager:BookManager, viewerId?:string) {
    // super();
    this.bookViewerDocId = viewerId || "bookViewer";
    this.bookManager = bookManager;
    ({
      bookContainerEl:this.bookContainerEl, 
      bookViewerEl: this.bookViewerEl,
      } = this.createElements());
    
    // this.addEventListeners();
  }
  /**
   * Creates the viewer related elements.
   * @returns ViewerElements
   */
  createElements():ScrollingViewerElements {  
    let viewerEl = document.getElementById(this.bookViewerDocId);
    if(viewerEl){ viewerEl.innerHTML = ""; } 
    else { 
      viewerEl = document.createElement('div');
      viewerEl.id = this.bookViewerDocId;
    }

    const svgNS = "http://www.w3.org/2000/svg";
    viewerEl.className = "";
    viewerEl.classList.add("hidden", "scrolling");
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
    document.body.appendChild(viewerEl);

    return { 
      bookContainerEl: bookContainer, 
      bookViewerEl: viewerEl,
    } 
  };
  
  view(book:Book, openRightPageIndex?:number):void{

  }
  closeViewer():void{
    
  }
}