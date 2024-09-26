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
    if(!this.bookViewerEl){
      let viewerEl = document.getElementById(this.bookViewerDocId);

      if(viewerEl){ viewerEl.innerHTML = ""; } 
      else { viewerEl = document.createElement('div'); }

      viewerEl.innerHTML = "";

      const svgNS = "http://www.w3.org/2000/svg";
      viewerEl.id = this.bookViewerDocId;
      viewerEl.classList.add("hidden");
      // Book Container
      const bookContainer = document.createElement('div');
      bookContainer.id = "bookContainer";
      
      viewerEl.appendChild(bookContainer);

      const btnClose = document.createElement('button');
      btnClose.id = "btnCloseViewer";
      btnClose.innerHTML = "X";
      // btnClose.addEventListener('click', (event: Event) => { this.closeViewer(); });
      viewerEl.appendChild(btnClose);
      
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('width', '0');
      svg.setAttribute('height', '0');
      const defs = document.createElementNS(svgNS, 'defs');
      svg.appendChild(defs);
      
      const mask1 = document.createElementNS(svgNS, 'mask');
      mask1.setAttribute('id', 'mask1');
      const mask1Rect = document.createElementNS(svgNS, 'rect');
      mask1Rect.setAttribute('id', 'mask1-rect');
      mask1Rect.setAttribute('x', '0');
      mask1Rect.setAttribute('y', '0');
      mask1Rect.setAttribute('width', '100%');
      mask1Rect.setAttribute('height', '100%');
      mask1Rect.setAttribute('fill', 'white');
      const mask1Polygon = document.createElementNS(svgNS, 'polygon');
      mask1Polygon.setAttribute('id', 'mask1-shape');
      mask1Polygon.setAttribute('points', '0,0');
      mask1Polygon.setAttribute('fill', 'black');
      mask1Polygon.setAttribute('stroke', 'black');
      mask1Polygon.setAttribute('stroke-width', '1');
      mask1.appendChild(mask1Rect);
      mask1.appendChild(mask1Polygon);

      const mask2 = document.createElementNS(svgNS, 'mask');
      mask2.setAttribute('id', 'mask2');
      const mask2Rect = document.createElementNS(svgNS, 'rect');
      mask2Rect.setAttribute('x', '0');
      mask2Rect.setAttribute('y', '0');
      mask2Rect.setAttribute('width', '100%');
      mask2Rect.setAttribute('height', '100%');
      mask2Rect.setAttribute('fill', 'black');
      const mask2Polygon = document.createElementNS(svgNS, 'polygon');
      mask2Polygon.setAttribute('id', 'mask2-shape');
      mask2Polygon.setAttribute('points', '0,0');
      mask2Polygon.setAttribute('fill', 'white');
      mask2.appendChild(mask2Rect);
      mask2.appendChild(mask2Polygon);
      
      // Shadow1
      const sh1Gradient = document.createElementNS(svgNS, 'linearGradient');
      sh1Gradient.id ='shadow1';
      sh1Gradient.setAttribute('x1', '50%');
      sh1Gradient.setAttribute('y1', '0%');
      sh1Gradient.setAttribute('x2', '50%');
      sh1Gradient.setAttribute('y2', '100%');
      // const sh1Stop1 = document.createElementNS(svgNS, 'stop');
      const sh1Stop2 = document.createElementNS(svgNS, 'stop');
      const sh1Stop3 = document.createElementNS(svgNS, 'stop');
      // sh1Stop1.setAttribute('offset', '0%');
      // sh1Stop1.setAttribute('stop-color', 'rgba(255,255,255,0.5)');
      sh1Stop2.setAttribute('offset', '0%');
      sh1Stop2.setAttribute('stop-color', 'rgba(0,0,0,0.8)');
      sh1Stop3.setAttribute('offset', '100%');
      sh1Stop3.setAttribute('stop-color', 'rgba(0,0,0,0.2)');
      // sh1Gradient.appendChild(sh1Stop1);
      sh1Gradient.appendChild(sh1Stop2);
      sh1Gradient.appendChild(sh1Stop3);
      const sh1Filter = document.createElementNS(svgNS, 'filter');
      sh1Filter.id = "sh1BlurFilter";
      sh1Filter.setAttribute('x', '0%');
      sh1Filter.setAttribute('y', '0%');
      sh1Filter.setAttribute('width', '100%');
      sh1Filter.setAttribute('height', '200%');
      const sh1Blur = document.createElementNS(svgNS, 'feGaussianBlur');
      sh1Blur.setAttribute('in', 'SourceGraphic');
      sh1Blur.setAttribute('stdDeviation', '3');
      sh1Filter.appendChild(sh1Blur);

      // Shadow3
      const shadow3 = document.createElementNS(svgNS, 'linearGradient');
      shadow3.id ='shadow3';
      // shadow3.setAttribute('gradientUnits','userSpaceOnUse');
      shadow3.appendChild(document.createElementNS(svgNS, 'stop'));
      shadow3.appendChild(document.createElementNS(svgNS, 'stop'));
      shadow3.appendChild(document.createElementNS(svgNS, 'stop'));
      shadow3.appendChild(document.createElementNS(svgNS, 'stop'));
      shadow3.appendChild(document.createElementNS(svgNS, 'stop'));

      // Shadow6
      const shadow6 = document.createElementNS(svgNS, 'linearGradient');
      shadow6.id ='shadow6';
      shadow6.setAttribute('gradientUnits','userSpaceOnUse');
      shadow6.appendChild(document.createElementNS(svgNS, 'stop'));
      shadow6.appendChild(document.createElementNS(svgNS, 'stop'));
      shadow6.appendChild(document.createElementNS(svgNS, 'stop'));

      //      
      defs.appendChild(mask1);
      defs.appendChild(mask2);
      defs.appendChild(sh1Gradient);
      defs.appendChild(sh1Filter);
      defs.appendChild(shadow3);
      defs.appendChild(shadow6);
      viewerEl.appendChild(svg);
      document.body.appendChild(viewerEl);
      return { 
        bookContainerEl: bookContainer, 
        bookViewerEl: viewerEl,
      } 
    };

    return { 
      bookContainerEl: this.bookContainerEl, 
      bookViewerEl: this.bookViewerEl,
    };
  }
  view(book:Book, openRightPageIndex?:number):void{

  }
  closeViewer():void{
    
  }
}