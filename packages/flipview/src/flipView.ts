import { EventStatus, IPageData, Zone, IZoneEventParams, PageType, IBookView, MZMath, ISize, Line, Point, Rect, IPage, Book, BookEvent } from '@magflip/core';
import { Flipping as FlipManager } from './flipManager'
import { Gutter } from './gutter';
import styles from './flipView.css'; 
/**
 * This is an object type used to reference Elements related to the Viewer.
 */
type FlipViewerElements = {
  bookContainerEl: HTMLElement,
  zoneLT: HTMLElement,
  zoneLC: HTMLElement,
  zoneLB: HTMLElement,
  zoneRT: HTMLElement,
  zoneRC: HTMLElement,
  zoneRB: HTMLElement,
  mask1Shape: SVGPolygonElement;
  mask2Shape: SVGPolygonElement;
}
/**
 * BookViewer class
 * Gutter:
 * 
 */
export class FlipView implements IBookView {
  /**
   * Zoom level of the viewer.
   */
  private zoomLevel:number = 1;
  /**
   * This id is unique string for FlipView object.
   */
  readonly id = 'flip-view';
  /**
   * Book object.
   * This contains the most information of a book loaded to this viewer.
   */
  private book: Book | undefined;
  /**
   * Returns the DOM element of the book container with id 'bookContainer'.
   */
  readonly bookContainerEl: HTMLElement;

  // readonly bookShelfManager: BookShelfManager;
  /**
   * This getter returns Rect data of the page container which is the child element of the book element.
   */
  get pageContainerRect(){
    const el = this.book?.pageContainerEl;
    if(!el){ throw new Error("Not found the page container.") }
    return el && MZMath.getOffset4Fixed(el as HTMLDivElement);
  }
  /**
   * Returns the element of the mouse event zone on the viewer's left top.
   */
  private readonly zoneLT: HTMLElement;
  /**
   * Returns the element of the mouse event zone on the viewer's left center.
   */
  private readonly zoneLC: HTMLElement;
  /**
   * Returns the element of the mouse event zone on the viewer's left bottom.
   */
  private readonly zoneLB: HTMLElement;
  /**
   * Returns the element of the mouse event zone on the viewer's right top.
   */
  private readonly zoneRT: HTMLElement;
  /**
   * Returns the element of the mouse event zone on the viewer's right center.
   */
  private readonly zoneRC: HTMLElement;
  /**
   * Returns the element of the mouse event zone on the viewer's right bottom.
   */
  private readonly zoneRB: HTMLElement;
  /**
   * Returns the mask1 shape element. The element is added to Page 1 for flip effect.
   */
  private readonly maskShapeOnPage1: SVGPolygonElement;
  /**
   * Returns the mask2 shape element. The element is added to Page 2 for flip effect.
   */
  private readonly maskShapeOnPage2: SVGPolygonElement;
  /**
   * Sets or retrieves the index of left page when book is open.
   */
  private curOpenLeftPageIndex: number = -1;
  /**
   * Sets or retrieves the index of left page when book is open.
   */
  private isSpreadOpen:boolean = false;
  /**
   * Gets whether the page is flipping. (Includes auto-filp and draggring).
   */
  private get isFlipping(){ return ( this.flipManager.eventStatus & EventStatus.AutoFlip
    || this.flipManager.eventStatus & EventStatus.Flipping
    || this.flipManager.eventStatus & EventStatus.Dragging ); 
  };
  /**
   * Gets whether the left page is flipping.
   */
  private get isLeftPageFlipping(){ return this.isFlipping && this.flipManager.eventZone & Zone.Left; };
  /**
   * Gets whether the right page is flipping.
   */
  private get isRightPageFlipping(){ return this.isFlipping && this.flipManager.eventZone & Zone.Right; };
  /**
   * Gets whether the first page(index is 0) is Opening.
   */
  private get isFirstPageOpening(){ return this.isRightPageFlipping && this.getActivePage(1)?.index == 0; }
  /**
   * Gets whether the first page(index is 0) is closing.
   */
  private get isFirstPageClosing(){ return this.isLeftPageFlipping && this.getActivePage(2)?.index == 0; }
  /**
   * Gets whether the last page is Opening.
   */
  private get isLastPageOpening(){ return this.isLeftPageFlipping && this.getActivePage(1)?.index == this.book?.lastPageIndex; }
  /**
   * Gets whether the last page is closing.
   */
  private get isLastPageClosing(){ return this.isRightPageFlipping && this.getActivePage(2)?.index == this.book?.lastPageIndex; }
  /**
   * Returns the instance of Page with sequence of active page.
   * @param activePageNum The number of active opened top page is 1 and behind page is 2, 3.
   */
  private getActivePage(activePageNum:number):IPage|undefined { return this.isLeftPageFlipping ? this.flipManager.windows[3-activePageNum].page : this.flipManager.windows[2+activePageNum].page; }
  /**
   * Returns the instance of Page for active page 2.
   */
  private get activePage2():IPage|undefined { return this.getActivePage(2); }
  /**
   * Returns the element of the active page 1.
   */
  private get activePage1El():HTMLElement|undefined { return this.getActivePage(1)?.element; }
  /**
   * Returns the element of the active page 2.
   */
  private get activePage2El():HTMLElement|undefined { return this.getActivePage(2)?.element; }
  /**
   * 
   */
  private flipManager = new FlipManager();

  constructor() {
    ({ bookContainerEl: this.bookContainerEl,
      zoneLT: this.zoneLT,
      zoneLC: this.zoneLC,
      zoneLB: this.zoneLB,
      zoneRT: this.zoneRT,
      zoneRC: this.zoneRC,
      zoneRB: this.zoneRB,
      mask1Shape: this.maskShapeOnPage1,
      mask2Shape: this.maskShapeOnPage2 } = this.createElements());
    
    this.setEvents();
  }
  /**
   * Inits variables and properties when a new book opens.
   */
  private init(){ 
    this.curOpenLeftPageIndex = -1;
  }
  addStyles(css: string):void {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }
  /**
   * Creates the viewer related elements.
   * @returns ViewerElements
   */
  private createElements():FlipViewerElements {
    // const bookViewerEl = this.bookViewerEl;
    const bookContainerEl = document.createElement('div');
    bookContainerEl.id = "bookContainer";
    // Viewer
    const svgNS = "http://www.w3.org/2000/svg";
    // bookViewerEl.classList.add("flip-view");
    // Book Container
    const zoneLT = document.createElement('div');
    const zoneLC = document.createElement('div');
    const zoneLB = document.createElement('div');
    const zoneRT = document.createElement('div');
    const zoneRC = document.createElement('div');
    const zoneRB = document.createElement('div');
    zoneLT.id = 'mzZoneLT';
    zoneLC.id = 'mzZoneLC';
    zoneLB.id = 'mzZoneLB';
    zoneRT.id = 'mzZoneRT';
    zoneRC.id = 'mzZoneRC';
    zoneRB.id = 'mzZoneRB';
    zoneLT.classList.add('event-zone', 'left');
    zoneLC.classList.add('event-zone', 'left');
    zoneLB.classList.add('event-zone', 'left');
    zoneRT.classList.add('event-zone', 'right');
    zoneRC.classList.add('event-zone', 'right');
    zoneRB.classList.add('event-zone', 'right');
    bookContainerEl.appendChild(zoneLT);
    bookContainerEl.appendChild(zoneLC);      
    bookContainerEl.appendChild(zoneLB);
    bookContainerEl.appendChild(zoneRT);
    bookContainerEl.appendChild(zoneRC);
    bookContainerEl.appendChild(zoneRB);

    // Masks & Shadows defs
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    const defs = document.createElementNS(svgNS, 'defs');
    svg.appendChild(defs);
    // Mash 1
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

    // Mask 2
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
    const sh1Stop2 = document.createElementNS(svgNS, 'stop');
    const sh1Stop3 = document.createElementNS(svgNS, 'stop');
    sh1Stop2.setAttribute('offset', '0%');
    sh1Stop2.setAttribute('stop-color', 'rgba(0,0,0,0.8)');
    sh1Stop3.setAttribute('offset', '100%');
    sh1Stop3.setAttribute('stop-color', 'rgba(0,0,0,0.2)');
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
    bookContainerEl.appendChild(svg);

    return { 
      bookContainerEl: bookContainerEl, 
      // bookViewerEl: bookViewerEl,
      zoneLT: zoneLT,
      zoneLC: zoneLC,
      zoneLB: zoneLB,
      zoneRT: zoneRT,
      zoneRC: zoneRC,
      zoneRB: zoneRB,
      mask1Shape: mask1Polygon,
      mask2Shape: mask2Polygon
    } 
  };
  /**
   * 
   * @param page 
   */
  private appendShadowElIntoPageEl(page:IPage){
    const pageW = page.size.width;
    const pageEl = page.element;
    // Shadow
    const svgNS = "http://www.w3.org/2000/svg";
    // Shadow 1
    const sh1El = pageEl.getElementsByClassName('shadow1')[0];
    if(sh1El){ sh1El.remove(); }
    const sh1Svg = document.createElementNS(svgNS, 'svg');
    sh1Svg.classList.add("shadow1");
    const sh1Path = document.createElementNS(svgNS, 'path');
    sh1Path.setAttribute('class', 'sh1-path1');
    sh1Path.setAttribute('d', `M ${pageW/3} 0 C ${pageW*13/15} ${pageW/20}, ${pageW*5/6} ${pageW/20}, ${pageW} 0`);
    const sh2Path = document.createElementNS(svgNS, 'path');
    sh2Path.setAttribute('class', 'sh1-path2');
    sh2Path.setAttribute('d', `M 0 0 C ${pageW/6} ${pageW/20}, ${pageW*2/15} ${pageW/20}, ${pageW*2/3} 0`);
    sh1Svg.appendChild(sh1Path); 
    sh1Svg.appendChild(sh2Path); 

    // Shadow 6
    const sh6El = pageEl.getElementsByClassName('shadow6')[0];
    if(sh6El){ sh6El.remove(); }
    const sh6Svg = document.createElementNS(svgNS, 'svg');
    sh6Svg.classList.add('shadow6');
    const sh6Shape = document.createElementNS(svgNS, 'polygon');
    sh6Shape.classList.add('shape');
    sh6Shape.setAttribute('points', '0,0');
    sh6Shape.setAttribute('fill', 'white');
    sh6Svg.appendChild(sh6Shape);

    // Shadow 3
    const sh3El = pageEl.getElementsByClassName('shadow3')[0];
    if(sh3El){ sh3El.remove(); }
    const sh3Svg = document.createElementNS(svgNS, 'svg');
    sh3Svg.classList.add('shadow3');
    const sh3Shape = document.createElementNS(svgNS, 'polygon');
    sh3Shape.classList.add('shape');
    sh3Shape.setAttribute('points', '0,0');
    sh3Shape.setAttribute('fill', 'url(#shadow3)');
    sh3Svg.appendChild(sh3Shape);

    // Shadow 2
    const sh2El = page.contentContainerEl.getElementsByClassName('shadow2')[0];
    if(sh2El){ sh2El.remove(); }
    const gutterShadow = document.createElement('div');
    gutterShadow.className = "shadow2";
    
    page.contentContainerEl.appendChild(gutterShadow)
    pageEl.appendChild(page.contentContainerEl);
    pageEl.appendChild(sh6Svg);
    pageEl.appendChild(sh3Svg);
    pageEl.appendChild(sh1Svg)
  }
  /**
   * 
   */
  private appendShadowEl4AllPage(){
    const pages = this.book?.getPages();
    for(const index in pages){
      this.appendShadowElIntoPageEl(pages[index]);
    }
  }
  /**
   * 
   * @returns 
   */
  getBookContainerEl(){ return this.bookContainerEl; }
  
  private checkNum = 0;
  private updateDimensionWhenRendered(){
    if(++this.checkNum > 100){ return; }
    setTimeout(() => {
      if(this.flipManager.gutter.top == 0 && this.flipManager.gutter.bottom == 0){
        this.updateDimension()
      } else { this.updateDimensionWhenRendered(); }
    }, 200);
  }
  /**
   * Opens the book on the viewer.
   * @param book 
   * @param openRightPageIndex 
   */
  view(book: Book, openRightPageIndex: number = 0) {
    this.init();
    this.attachBook(book);
    this.setBookEventListener();
    this.setViewer();
    const newIndexRange = this.getStartPageIndexToLoad(openRightPageIndex);
    this.loadPages(newIndexRange);
    this.showPages(newIndexRange.start);
    
    this.updateDimensionWhenRendered();
    return this.bookContainerEl;
  }
  /**
   * Closes the book on the viewer.
   */
  closeViewer() { 
    // TODO Save current book status.
    this.init();
    this.removeBookEventListener();
    this.detachBook(); 
  }
  /**
   * 
   * @param zoomLevel 
   */
  zoom(zoomLevel:number){
    this.zoomLevel = zoomLevel;
    this.bookContainerEl.style.transform = `scale(${this.zoomLevel})`;
    this.setViewer();
    // this.updateDimension();
  }
  /**
   * Gets pages from book.
   * @param isForward 
   * @returns 
   */
  private getNewPages(isForward:boolean){
    // TODO: Exception
    if(!this.book){ throw new Error("No book loaded.") }
    const book = this.book;
    const newPage1Index = isForward ? this.curOpenLeftPageIndex + 4 : this.curOpenLeftPageIndex - 4;
    const removedPage1Index = isForward ? this.curOpenLeftPageIndex -2: this.curOpenLeftPageIndex + 2;
    return { 
      newPage1: book.getPage(newPage1Index) || book.createEmptyPage(newPage1Index), 
      newPage2: book.getPage(newPage1Index+1) || book.createEmptyPage(newPage1Index+1),
      removedPage1: book.getPage(removedPage1Index) || book.createEmptyPage(removedPage1Index), 
      removedPage2: book.getPage(removedPage1Index+1) || book.createEmptyPage(removedPage1Index+1),
    }
  }
  /**
   * Update dimension of the book viewer element.
   */
  private updateDimension(){
    if(this.curOpenLeftPageIndex < 0){ this.setReadyToOpenForward(); } 
    else if(this.curOpenLeftPageIndex >= this.book!.lastPageIndex){ this.setReadyToOpenBackward(); }
    else { this.setSpreadOpen(); }
  }
  /**
   * Shifts pages related the flip effect directly.
   * @param isFoward the direction of the flipping.
   */
  private shiftPages(isFoward:boolean){
    const { newPage1, newPage2, removedPage1, removedPage2 } = this.getNewPages(isFoward);
    const book = this.book;

    // Global Var
    this.curOpenLeftPageIndex = isFoward ? this.curOpenLeftPageIndex + 2 : this.curOpenLeftPageIndex - 2;

    if(isFoward){
      this.flipManager.moveRight(newPage1, newPage2);
      book?.appendPageEl(newPage1.element);
      book?.appendPageEl(newPage2.element);
    }
    else {
      this.flipManager.moveLeft(newPage1, newPage2);
      book?.prependPageEl(newPage2.element);
      book?.prependPageEl(newPage1.element);
    }

    book?.removePageEl(removedPage1.element);
    book?.removePageEl(removedPage2.element);

    this.updateDimension();
    this.resetShadow1Paths();
  }
  /**
   * Attach a book to this book viewer.
   */
  private attachBook(book:Book) {
    this.book = book;
    if(!book?.element){ throw new Error("Error the book opening"); }
  
    this.bookContainerEl.appendChild(book.element);
    this.appendShadowEl4AllPage();
  }
  /**
   * Returns the book back to the BookManager.
   */
  private detachBook() {
    this.book = undefined;
    this.flipManager.clearPageWindow();
  }
  /**
   * Sets the one of close/open states which has three states.
   * This state represents that the book is ready to open from front.
   */
  private setReadyToOpenForward(){ 
    this.isSpreadOpen = false;
    this.bookContainerEl.classList.add("ready-to-open", "front"); 
    const bookRect = MZMath.getOffset4Fixed(this.book?.element as HTMLDivElement);
    this.flipManager.gutter = new Gutter({
      width:0, height:0,
      left: bookRect.left, 
      right: bookRect.left,
      top: bookRect.top,
      bottom: bookRect.bottom
    });
  }
  /**
   * Sets the one of close/open states which has three states.
   * This state represents that the book is ready to open from back.
   */
  private setReadyToOpenBackward(){ 
    this.isSpreadOpen = false;
    this.bookContainerEl.classList.add("ready-to-open", "end"); 
    const bookRect = MZMath.getOffset4Fixed(this.book?.element as HTMLDivElement);
    this.flipManager.gutter = new Gutter({
      width:0, height:0,
      left: bookRect.right, 
      right: bookRect.right,
      top: bookRect.top,
      bottom: bookRect.bottom
    });
  }
  /**
   * Sets the one of close/open states which has three states.
   * This state represents that the book is ready to open.
   */
  private setSpreadOpen(){ 
    this.isSpreadOpen = true;
    this.bookContainerEl.classList.remove("ready-to-open", "front", "end"); 
    const bookRect = MZMath.getOffset4Fixed(this.book?.element as HTMLDivElement);
    this.flipManager.gutter = new Gutter({
      width:0, height:0,
      left: bookRect.left + bookRect.width/2, 
      right: bookRect.left + bookRect.width/2,
      top: bookRect.top,
      bottom: bookRect.bottom
    });
  }
  /**
   * Reset shadow1 path data.
   */
  private resetShadow1Paths(){
    const path1Els = this.book?.element.querySelectorAll('.sh1-path1');
    const path2Els = this.book?.element.querySelectorAll('.sh1-path2');
    const pageW = this.book?.size.closed.width || 0;
    path1Els?.forEach(path1El => { path1El.setAttribute('d', `M ${pageW/3} 0 C ${pageW*13/15} ${pageW/20}, ${pageW*5/6} ${pageW/20}, ${pageW} 0`); });
    path2Els?.forEach(path2El =>{ path2El.setAttribute('d', `M 0 0 C ${pageW/6} ${pageW/20}, ${pageW*2/15} ${pageW/20}, ${pageW*2/3} 0`); });
  }
  /**
   * Set the viewer to work.
   */
  private setViewer(){
    if(!this.book){ throw new Error("Book object does not exist."); }
    const { closed, opened } = this.book.size;

    // Mask
    const mask1Rect = document.getElementById('mask1-rect');
    if(mask1Rect){
      mask1Rect.setAttribute('width', `${this.book.size.closed.width}px`);
      mask1Rect.setAttribute('height', `${this.book.size.closed.height}px`);
    }

    const docStyle = document.documentElement.style;
    docStyle.setProperty('--opened-book-width', `${opened.width}px`)
    docStyle.setProperty('--closed-book-width', `${closed.width}px`)
    docStyle.setProperty('--book-height', `${closed.height}px`)
    docStyle.setProperty('--page-width', `${closed.width}px`)
    docStyle.setProperty('--page-height', `${closed.height}px`)

    // Closed
    this.updateDimension();

    document.documentElement.style.setProperty('--page-diagonal-length', (closed.diagonal || 0) + 'px');
  }
  /**
   * Returns the first page's index of 6 pages related flipping effect.
   * @param openPageIndex 
   * @returns 
   */
  private getStartPageIndexToLoad(openPageIndex: number){
    const index = openPageIndex%2 == 1 ? openPageIndex - 2 : openPageIndex - 3; 
    return { start:index, cnt: this.flipManager.windowSize };
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
   * @returns 
   */
  private getLoadedViewablePageCnt(){
    if(!this.book){ return 0; }
    let cnt = this.book.getPageCnt();
    const pages = this.book.getPages();
    for(const index in pages){
      const page = pages[index];
      if(Number(index) < 0){ --cnt; }
      else if(page.type == PageType.Empty){ --cnt; }
    }
    return cnt;
  }
  /**
   * 
   * @param startIndex 
   */
  private showPages(startIndex:number) {
    const book = this.book;
    if(!book){ throw new Error("Error the book opening"); }
    //
    // Load the pages to the window 
    // & append page elements to dom.
    //
    startIndex = startIndex || -3;
    const maxIndex = startIndex + this.flipManager.windowSize;
    for(let i=startIndex, winIdx=0; i<maxIndex; i++, winIdx++){
      const page = book.getPage(i);
      if(page){
        this.flipManager.loadPageToWindow(winIdx, page);
        book.appendPageEl(page.element);
      } else {
        const emptyPage = book.createEmptyPage(i);
        this.flipManager.loadPageToWindow(winIdx, emptyPage);
        book.appendPageEl(emptyPage.element);
      }
    }
  }

  private flipPage(
    page2El:HTMLElement, 
    page1Mask:SVGPolygonElement, 
    page2Mask:SVGPolygonElement, 
    shadow1Paths:NodeListOf<SVGPathElement> | undefined,
    shadow3Shape:SVGPolygonElement|null, 
    shadow6Shape:SVGPolygonElement|null, 
    mouseGP:Point, 
    pageWH:ISize
  ){
    const flipData = this.flipManager.flip(mouseGP, pageWH, this.isSpreadOpen);
    const isLeftPageActive = this.isLeftPageFlipping;
    const zoomLevel = this.zoomLevel;
    // Mask
    page1Mask.setAttribute('points', flipData.printPage1MaskShape(zoomLevel) );
    page2Mask.setAttribute('points', flipData.printPage2MaskShape(zoomLevel) );
    shadow3Shape?.setAttribute('points', flipData.printPage2MaskShape(zoomLevel) );
    shadow6Shape?.setAttribute('points', flipData.printShadow6(this.book!.size.opened) );
    //
    // Shadow
    //
    // The stop shadow becomes increasingly transparent 
    // from one-third of the way toward the closing corner as it gets closer to the corner.
    let opacityScale = flipData.shadow.closingDistance/(pageWH.width/3);
    const cssVar = document.documentElement.style;
    const f = flipData.mask.page2.p1;
    const g = flipData.mask.page2.p2;
    const h = flipData.mask.page2.p3;
    const j = flipData.mask.page1.p1;
    const k = flipData.mask.page1.p2;
    const l = flipData.mask.page1.p3;
    const c = flipData.c;
    //
    // Shadow 1
    //
    const sh1Path1 = shadow1Paths && shadow1Paths[0];
    const sh1Path2 = shadow1Paths && shadow1Paths[1];
    let sh1CtlPy = pageWH.width/20;
    let sh1P1EndPx = pageWH.width/3;
    let sh1P2EndPx = pageWH.width*2/3;
    if(this.isFirstPageClosing){
      let sh1CtlPx1 = pageWH.width*13/15;
      if(k.x > sh1P1EndPx){
        sh1CtlPy = sh1CtlPy * (pageWH.width - k.x)/sh1P2EndPx;
        sh1P1EndPx = k.x;
        sh1CtlPx1 += k.x*.1;
      }
      sh1Path1?.setAttribute('d', `M ${sh1P1EndPx/zoomLevel} 0 C ${sh1CtlPx1/zoomLevel} ${sh1CtlPy/zoomLevel}, ${pageWH.width*5/6/zoomLevel} ${sh1CtlPy/zoomLevel}, ${pageWH.width/zoomLevel} 0`);
    } else if(this.isLastPageClosing){
      let sh1CtlPx2 = pageWH.width*2/15;
      if(k.x < sh1P2EndPx){
        sh1CtlPy = sh1CtlPy * k.x/sh1P2EndPx;
        sh1P2EndPx = k.x;
        sh1CtlPx2 -= (pageWH.width-k.x)*.1;
      }
      sh1Path2?.setAttribute('d', `M 0 0 C ${pageWH.width/6/zoomLevel} ${sh1CtlPy/zoomLevel}, ${sh1CtlPx2/zoomLevel} ${sh1CtlPy/zoomLevel}, ${sh1P2EndPx/zoomLevel} 0`);
    }
    //
    // Shadow 5
    //
    const p2Rotate = flipData.page2.rotate;
    const defaultOpacity = isLeftPageActive ? 0.3: 0.5;
    const tempValue = defaultOpacity/Math.PI;
    const opacity = p2Rotate <= Math.PI 
      ? defaultOpacity - tempValue*p2Rotate 
      : defaultOpacity + tempValue*(2*Math.PI - p2Rotate);
    cssVar.setProperty('--shadow5-opacity', `${opacity*opacityScale}`)
    //
    // Shadow 3
    //
    const shadow3El = document.getElementById('shadow3') as SVGLinearGradientElement|null;
    let x1, y1, x2, y2 = 100;
    const isTopOrCenterZone = (this.flipManager.eventZone & Zone.Top) || (this.flipManager.eventZone & Zone.Center);
    // Points are located on the gradient objectBoundingBox
    let longLineLength = 1;
    let p:Point = new Point({x:.5,y:.5});
    if(isLeftPageActive){
      // Shape is triangle and dragging point is top corner.
      if(c < 0){ y2 = 0; }
      // Shape is triangle and dragging point is bottom corner.
      else if(f == g){ }
      else if(l.x < k.x){
        longLineLength = k.x;
        p = MZMath.findPerpendicularFoot( new Line( { x:k.x-l.x, y:0}, { x:0, y:k.x} ), { x:k.x, y:k.x} );
      } else {
        longLineLength = l.x;
        p = MZMath.findPerpendicularFoot( new Line( { x:0, y:0}, { x:l.x-k.x, y:l.x} ), { x:l.x, y:isTopOrCenterZone ? 0 : l.x} );
        if(isTopOrCenterZone){ y2 = 0 }
      }
      x2 = 100;
    }
    else {
      // Shape is triangle and dragging point is top corner.
      if(c < 0){ y2 = 0; }
      // Shape is triangle and dragging point is bottom corner.
      else if(f == g){  }
      else if(h.x < g.x){
        longLineLength = g.x;
        p = MZMath.findPerpendicularFoot( new Line( { x:h.x, y:0}, { x:g.x, y:g.x} ), { x:0, y:g.x} );
      } else {
        longLineLength = h.x;
        p = MZMath.findPerpendicularFoot( new Line( { x:h.x, y:0}, { x:g.x, y:h.x} ), { x:0, y: isTopOrCenterZone ? 0 : h.x} );
        if(isTopOrCenterZone){ y2 = 0 }
      }
      x2 = 0;
    }
    x1 = ((p.x/longLineLength) || 0)*100;
    y1 = ((p.y/longLineLength) || 0)*100;

    if(shadow3El){
      shadow3El.setAttribute('x1', `${x1}%`);
      shadow3El.setAttribute('y1', `${y1}%`);
      shadow3El.setAttribute('x2', `${x2}%`);
      shadow3El.setAttribute('y2', `${y2}%`);
    }

    const stops = shadow3El?.querySelectorAll('stop');
    if(stops){
      opacityScale = opacityScale > 1 ? 1 : opacityScale;
      //
      stops[0].setAttribute('offset', '0.5%');
      stops[0].setAttribute('stop-color', `rgba(255, 255, 255, ${0.7*opacityScale})`);
      stops[1].setAttribute('offset', '5%');
      stops[1].setAttribute('stop-color', `rgba(255, 255, 255, ${0.5*opacityScale})`);
      stops[2].setAttribute('offset', '12%');
      stops[2].setAttribute('stop-color', `rgba(255, 255, 255, ${0.7*opacityScale})`);
      stops[3].setAttribute('offset', '50%');
      stops[3].setAttribute('stop-color', `rgba(0, 0, 0, ${0.208*opacityScale})`);
      stops[4].setAttribute('offset', '100%');
      stops[4].setAttribute('stop-color', 'rgba(255, 255, 255, 0)');
    }
    //
    // Shadow 6
    //
    const originP = new Point();
    const endCorner = new Point();
    const line = new Line(new Point(), new Point());

    if(isLeftPageActive){
      originP.x = pageWH.width*2;
      endCorner.x = 0;
      line.p1.x = k.x;
      line.p1.y = k.y;
      line.p2.x = l.x;
      line.p2.y = l.y;
    } else {
      originP.x = 0;
      endCorner.x = pageWH.width*2;
      line.p1.x = pageWH.width+k.x;
      line.p1.y = k.y;
      line.p2.x = pageWH.width+l.x;
      line.p2.y = l.y;
    }

    if(this.flipManager.eventZone & Zone.Top){
      originP.y = pageWH.height;
      endCorner.y = 0;
    } else {
      originP.y = 0;
      endCorner.y = pageWH.height;
    }

    p = MZMath.findPerpendicularFoot( line, originP );
    const p2 = MZMath.findPerpendicularFoot( line, endCorner);
    const diagonalL = MZMath.getLength(originP, endCorner);
    const pLength = MZMath.getLength(p2, endCorner);
    const offset2 = (1-flipData.shadow.closingDistance/diagonalL)*(pLength/diagonalL)*3*100;

    const shadow6El = document.getElementById('shadow6') as SVGLinearGradientElement|null;
    if(shadow6El){
      shadow6El.setAttribute('x1', `${p.x/zoomLevel}`);
      shadow6El.setAttribute('y1', `${p.y/zoomLevel}`);
      shadow6El.setAttribute('x2', `${originP.x/zoomLevel}`);
      shadow6El.setAttribute('y2', `${originP.y/zoomLevel}`);
    }

    const sh6stops = shadow6El?.querySelectorAll('stop');
    if(sh6stops){
      sh6stops[0].setAttribute('offset', '0%');
      sh6stops[0].setAttribute('stop-color', `rgba(255, 255, 255, 0)`);
      sh6stops[1].setAttribute('offset', '0%');
      sh6stops[1].setAttribute('stop-color', `rgba(0, 0, 0, ${offset2/100})`);
      sh6stops[2].setAttribute('offset', `${offset2}%`);
      sh6stops[2].setAttribute('stop-color', `rgba(0, 0, 0, 0)`);
    }

    // Page 2
    cssVar.setProperty('--page2-top', `${flipData.page2.top/zoomLevel}px`)
    cssVar.setProperty('--page2-left', `${flipData.page2.left/zoomLevel}px`)
    cssVar.setProperty('--page2-rotate', `${flipData.page2.rotate}rad`)
  }
  /**
   * Sets the status of viewer as Auto Flipping.
   */
  private setViewerToAutoFlip(){
    const className = this.isLeftPageFlipping ? "left" : "right";
    this.bookContainerEl.classList.add(`${className}-page-flipping`);
  }
  /**
   * Unsets the status of viewer as Auto Flipping.
   */
  private unsetViewerToAutoFlip(){
    this.bookContainerEl.classList.remove('left-page-flipping', 'right-page-flipping');
  }
  /**
   * Sets the status of viewer as the status Flipping by dragging.
   */
  private setViewerToFlip(){
    const className = this.isLeftPageFlipping ? "left" : "right";
    this.bookContainerEl.classList.add(`${className}-page-flipping`, "noselect");
    this.flipManager.curAutoFlipWidth = {x:0, y:0};
  }
  /**
   * Unsets the status of viewer as the status Flipping by dragging.
   */
  private unsetViewerToFlip(){
    this.bookContainerEl.classList.remove("noselect", 'left-page-flipping', `right-page-flipping`);
  }
  /**
   * This is the mouseenter event handler on the 6 event zones.
   * @param event 
   * @param param 
   * @returns 
   */
  private zoneMouseEntered(event:MouseEvent, param:IZoneEventParams) {
    if(this.flipManager.eventStatus & EventStatus.Flipping
      || this.flipManager.eventStatus & EventStatus.Dragging){ return; }
    this.flipManager.eventStatus = EventStatus.AutoFlipFromCorner;
    this.flipManager.eventZone = param.zone;

    const page2El = this.activePage2El;
    if(!page2El){ return }
    
    const zoomLevel = this.zoomLevel;
    const shadow1Paths = this.activePage1El?.querySelectorAll('.shadow1 > path') as NodeListOf<SVGPathElement> | undefined;
    const shadow3Shape = page2El.querySelector('.shadow3 > polygon.shape') as SVGPolygonElement | null;
    const shadow6Shape = this.activePage1El?.querySelector('.shadow6 > polygon.shape') as SVGPolygonElement | null;
    const viewport = { x:event.clientX, y:event.clientY }

    this.setViewerToAutoFlip();
    this.flipManager.setInitFlipping(param.zone, viewport, this.pageContainerRect as Rect, zoomLevel);
    this.flipManager.animateFlipFromCorner(
      viewport,
      { width: page2El.offsetWidth*zoomLevel, height: page2El.offsetHeight*zoomLevel },
      (mouseGP:Point, pageWH:ISize) => {
        this.flipPage(
          page2El, 
          this.maskShapeOnPage1, 
          this.maskShapeOnPage2,
          shadow1Paths,
          shadow3Shape,
          shadow6Shape,
          mouseGP, 
          pageWH
        );
      }, 
      () =>{}
    );
  }
  /**
   * This is the mousedown event handler on the 6 event zones.
   * @param event 
   * @param param 
   * @returns 
   */
  private zoneMouseDowned(event:MouseEvent, param:IZoneEventParams){
    if(this.flipManager.eventStatus & EventStatus.Flipping){ return; }
    this.flipManager.eventStatus = EventStatus.Dragging;
    this.flipManager.eventZone = param.zone;

    const viewport = { x:event.clientX, y:event.clientY };
    const page2El = this.activePage2El;

    if(!page2El){ return }
    if(!this.pageContainerRect){ return; }
    
    const zoomLevel = this.zoomLevel;
    const shadow1Paths = this.activePage1El?.querySelectorAll('.shadow1 > path') as NodeListOf<SVGPathElement> | undefined;
    const shadow3Shape = page2El.querySelector('.shadow3 > polygon.shape') as SVGPolygonElement | null;
    const shadow6Shape = this.activePage1El?.querySelector('.shadow6 > polygon.shape') as SVGPolygonElement | null;

    this.setViewerToFlip();
    this.flipManager.setInitFlipping(param.zone, viewport, this.pageContainerRect, zoomLevel);
    this.flipPage(
      page2El, 
      this.maskShapeOnPage1, 
      this.maskShapeOnPage2, 
      shadow1Paths,
      shadow3Shape,
      shadow6Shape,
      viewport, 
      { width: page2El.offsetWidth*zoomLevel, height: page2El.offsetHeight*zoomLevel }
    );
  }
  /**
   * This is the mousemove event handler on the 6 event zones.
   * @param event 
   * @param param 
   * @returns 
   */
  private zoneMouseMoved(event:MouseEvent, param:IZoneEventParams) {
    if(this.flipManager.eventStatus === EventStatus.None){ this.zoneMouseEntered(event, param); return; }
    if(this.flipManager.eventStatus !== EventStatus.AutoFlipFromCorner){ return; }
    this.flipManager.eventZone = param.zone;

    const page2El = this.activePage2El;
    if(!page2El){ return }

    const zoomLevel = this.zoomLevel;
    const shadow1Paths = this.activePage1El?.querySelectorAll('.shadow1 > path') as NodeListOf<SVGPathElement> | undefined;
    const shadow3Shape = page2El.querySelector('.shadow3 > polygon.shape') as SVGPolygonElement | null;
    const shadow6Shape = this.activePage1El?.querySelector('.shadow6 > polygon.shape') as SVGPolygonElement | null;
    const viewport = { x:event.clientX, y:event.clientY };
    // If eventZone is Zone.Center, set the y value to the active corner's y value.
    if(this.flipManager.eventZone & Zone.Center){ viewport.y = this.flipManager.activeCornerGP.y; }

    this.flipPage(
      page2El, 
      this.maskShapeOnPage1, 
      this.maskShapeOnPage2, 
      shadow1Paths,
      shadow3Shape,
      shadow6Shape,
      viewport, 
      { width: page2El.offsetWidth*zoomLevel, height: page2El.offsetHeight*zoomLevel });
  }
  /**
   * This is the mouseleave event handler on the 6 event zones.
   * @param event 
   * @param param 
   * @returns 
   */
  private zoneMouseLeaved(event:MouseEvent, param:IZoneEventParams){
    if(this.flipManager.eventStatus !== EventStatus.AutoFlipFromCorner){ return; }
    this.flipManager.eventStatus = EventStatus.AutoFlipToCorner;

    const page2El = this.activePage2El;
    if(!page2El){ return }

    const zoomLevel = this.zoomLevel;
    const shadow1Paths = this.activePage1El?.querySelectorAll('.shadow1 > path') as NodeListOf<SVGPathElement> | undefined;
    const shadow3Shape = page2El.querySelector('.shadow3 > polygon.shape') as SVGPolygonElement | null;
    const shadow6Shape = this.activePage1El?.querySelector('.shadow6 > polygon.shape') as SVGPolygonElement | null;
    const viewport = { x:event.clientX, y:event.clientY }

    this.flipManager.eventZone = param.zone;
    this.flipManager.animateFlipToCorner(
      viewport,
      { width: page2El.offsetWidth*zoomLevel, height: page2El.offsetHeight*zoomLevel },
      (mouseGP:Point, pageWH:ISize) => {
        this.flipPage(
          page2El,
          this.maskShapeOnPage1, 
          this.maskShapeOnPage2, 
          shadow1Paths,
          shadow3Shape,
          shadow6Shape,
          mouseGP, 
          pageWH
        );
      },
      () => { 
        if(this.flipManager.eventStatus == EventStatus.AutoFlipToCorner){ 
          this.unsetViewerToAutoFlip();
          this.flipManager.eventStatus = EventStatus.None; 
        }
      }
    );
  }
  /**
   * This is the mouseup event handler on document.
   * @param event 
   * @param param 
   * @returns 
   */
  private documentMouseUp(event:MouseEvent){
    if(!(this.flipManager.eventStatus & EventStatus.Dragging)){ return; }
    
    const page2El = this.activePage2El;
    if(!page2El){ return }

    const viewport = { x:event.clientX, y:event.clientY };
    const dataToFlip = this.flipManager.getInfoToFlip(viewport);

    if(dataToFlip.isSnappingBack){ this.flipManager.eventStatus = EventStatus.SnappingBack; }
    else { this.flipManager.eventStatus = dataToFlip.isFlippingForward ? EventStatus.FlippingForward : EventStatus.FlippingBackward; }
    
    const zoomLevel = this.zoomLevel;
    const shadow1Paths = this.activePage1El?.querySelectorAll('.shadow1 > path') as NodeListOf<SVGPathElement> | undefined;
    const shadow3Shape = page2El.querySelector('.shadow3 > polygon.shape') as SVGPolygonElement | null;
    const shadow6Shape = this.activePage1El?.querySelector('.shadow6 > polygon.shape') as SVGPolygonElement | null;

    this.flipManager.animateFlip(
      viewport, 
      dataToFlip.targetCornerGP,
      { width: page2El.offsetWidth*zoomLevel, height: page2El.offsetHeight*zoomLevel },
      (mouseGP:Point, pageWH:ISize) => {
        this.flipPage(
          page2El, 
          this.maskShapeOnPage1, 
          this.maskShapeOnPage2, 
          shadow1Paths,
          shadow3Shape,
          shadow6Shape,
          mouseGP, 
          pageWH
        );
      },
      () => {
        if(!dataToFlip.isSnappingBack){
          this.shiftPages(dataToFlip.isFlippingForward)
        }
        this.unsetViewerToFlip();
        this.flipManager.eventStatus = EventStatus.None;
      }
    );
  }
  /**
   * This is the mousemove event handler on document.
   * @param event 
   * @param param 
   * @returns 
   */
  private documentMouseMove(event:MouseEvent){
    const viewport = { x:event.clientX, y:event.clientY };
    this.flipManager.curMouseGP = viewport;

    if(!(this.flipManager.eventStatus & EventStatus.Dragging)){ return; }

    const page2El = this.activePage2El;
    if(!page2El){ return }
    
    const zoomLevel = this.zoomLevel;
    const shadow1Paths = this.activePage1El?.querySelectorAll('.shadow1 > path') as NodeListOf<SVGPathElement> | undefined;
    const shadow3Shape = page2El.querySelector('.shadow3 > polygon.shape') as SVGPolygonElement | null;
    const shadow6Shape = this.activePage1El?.querySelector('.shadow6 > polygon.shape') as SVGPolygonElement | null;

    this.flipPage(
      page2El, 
      this.maskShapeOnPage1, 
      this.maskShapeOnPage2, 
      shadow1Paths,
      shadow3Shape,
      shadow6Shape,
      viewport, 
      { width: page2El.offsetWidth*zoomLevel, height: page2El.offsetHeight*zoomLevel });
  }
  /**
   * Sets all events for viewer.
   */
  private setEvents(){ 
    [
      { zoneEl: this.zoneLT, zone: Zone.LT },
      { zoneEl: this.zoneLC, zone: Zone.LC },
      { zoneEl: this.zoneLB, zone: Zone.LB },
      { zoneEl: this.zoneRT, zone: Zone.RT },
      { zoneEl: this.zoneRC, zone: Zone.RC },
      { zoneEl: this.zoneRB, zone: Zone.RB }
    ].forEach(({zoneEl, zone}) => {
      zoneEl.addEventListener('mouseenter', (event:Event) => { this.zoneMouseEntered(event as MouseEvent, { zone: zone }); });
      zoneEl.addEventListener('mouseleave', (event:Event) => { this.zoneMouseLeaved(event as MouseEvent, { zone: zone }); });
      zoneEl.addEventListener('mousedown', (event:Event) => { this.zoneMouseDowned(event as MouseEvent, { zone: zone }); });
      zoneEl.addEventListener('mousemove', (event:Event) => { this.zoneMouseMoved(event as MouseEvent, { zone: zone }); });
    })
    document.addEventListener('mouseup', this.documentMouseUp.bind(this));
    document.addEventListener('mousemove', this.documentMouseMove.bind(this));
    window.addEventListener('resize', () => { this.updateDimension(); });
  }
  /**
   * 
   */
  private setBookEventListener(){
    this.book?.addEventListener(BookEvent.pageAdded, this.appendShadowElIntoPageEl)
  }
  private removeBookEventListener(){
    this.book?.removeEventListener(BookEvent.pageAdded, this.appendShadowElIntoPageEl)
  }
}