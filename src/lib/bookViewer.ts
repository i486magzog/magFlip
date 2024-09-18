import { IBox, EventStatus, Gutter, IPageData, Point, Rect, Zone, IZoneEventParams, ISize, FlipData, PageType } from './models.js';
import { Book } from './book.js'
import { Page } from './page.js'
import { BookManager } from './bookManager.js'
import { Flipping } from './flipping.js'
import { MZMath } from './mzMath.js';

type ViewerElements = {
  bookViewerEl: HTMLElement,
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
export class BookViewer extends Flipping {
  book: Book | undefined;
  bookViewerDocId: string;
  bookManager: BookManager;

  bookViewerEl: HTMLElement;
  bookContainerEl: HTMLElement;
  pageContainerRect?:Rect;
  zoneLT: HTMLElement;
  zoneLC: HTMLElement;
  zoneLB: HTMLElement;
  zoneRT: HTMLElement;
  zoneRC: HTMLElement;
  zoneRB: HTMLElement;
  maskShapeOnPage1: SVGPolygonElement;
  maskShapeOnPage2: SVGPolygonElement;
  
  curOpenLeftPageIndex: number = -1;
  isLeftPageActive:boolean = false;
  isSpreadOpen:boolean = false;

  private get openPage():Page|undefined { return this.isLeftPageActive ? this.windows[2].page : this.windows[3].page; }
  private get page2():Page|undefined { return this.isLeftPageActive ? this.windows[1].page : this.windows[4].page; }
  private get page3():Page|undefined { return this.isLeftPageActive ? this.windows[0].page : this.windows[5].page; }
  private get openPageEl():HTMLElement|undefined { return this.openPage?.element; }
  private get page2El():HTMLElement|undefined { return this.page2?.element; }
  private get page3El():HTMLElement|undefined { return this.page3?.element; }

  constructor(bookManager:BookManager, viewerId?:string) {
    super();
    this.bookViewerDocId = viewerId || "bookViewer";
    this.bookManager = bookManager;
    ({ bookContainerEl:this.bookContainerEl, 
      bookViewerEl: this.bookViewerEl,
      zoneLT: this.zoneLT,
      zoneLC: this.zoneLC,
      zoneLB: this.zoneLB,
      zoneRT: this.zoneRT,
      zoneRC: this.zoneRC,
      zoneRB: this.zoneRB,
      mask1Shape: this.maskShapeOnPage1,
      mask2Shape: this.maskShapeOnPage2 } = this.createElements());
    
    this.addEventListeners();
  }

  createElements():ViewerElements {    
    if(!this.bookViewerEl){
      let viewerEl = document.getElementById(this.bookViewerDocId);

      if(viewerEl){ viewerEl.innerHTML = ""; } 
      else { viewerEl = document.createElement('div'); }
      //
      // <div id="bookViewer" class="hidden">
      //   <div id="bookContainer">
      //     <div id="mzZoneLT"></div>
      //     <div id="mzZoneLC"></div>
      //     <div id="mzZoneLB"></div>
      //     <div id="mzZoneRT"></div>
      //     <div id="mzZoneRC"></div>
      //     <div id="mzZoneRB"></div>
      //   </div>
      //   <button id="btnCloseViewer">X</button>
      // </div>
      //
      // <svg width="0" height="0">
      //     <defs>
      //         <mask id="mask1">
      //             <rect x="0" y="0" width="100%" height="100%" fill="black"/>
      //             <polygon id="mask1-shape" points="50,50 150,50 150,150 50,150" fill="white"/>
      //         </mask>
      //     </defs>
      // </svg>
      // <svg width="0" height="0">
      //     <defs>
      //         <mask id="mask2">
      //             <rect x="0" y="0" width="100%" height="100%" fill="black"/>
      //             <polygon id="mask2-shape" points="0,0" fill="white"/>
      //         </mask>
      //     </defs>
      // </svg>
      viewerEl.id = this.bookViewerDocId;
      viewerEl.classList.add("hidden");
      const bookContainer = document.createElement('div');
      bookContainer.id = "bookContainer";
      
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
      bookContainer.appendChild(zoneLT);
      bookContainer.appendChild(zoneLC);      
      bookContainer.appendChild(zoneLB);
      bookContainer.appendChild(zoneRT);
      bookContainer.appendChild(zoneRC);
      bookContainer.appendChild(zoneRB);

      viewerEl.appendChild(bookContainer);
      const btnClose = document.createElement('button');
      btnClose.id = "btnCloseViewer";
      btnClose.innerHTML = "X";
      btnClose.addEventListener('click', (event: Event) => { this.closeBook(); });
      viewerEl.appendChild(btnClose);
      
      // SVG 네임스페이스
      const svgNS = "http://www.w3.org/2000/svg";

      const mask1Svg = document.createElementNS(svgNS, 'svg');
      mask1Svg.setAttribute('width', '0');
      mask1Svg.setAttribute('height', '0');
      const mask1SvgDefs = document.createElementNS(svgNS, 'defs');
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

      const mask2Svg = document.createElementNS(svgNS, 'svg');
      mask2Svg.setAttribute('width', '0');
      mask2Svg.setAttribute('height', '0');
      const mask2SvgDefs = document.createElementNS(svgNS, 'defs');
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

      // 요소들을 트리 구조로 연결
      mask1.appendChild(mask1Rect);
      mask1.appendChild(mask1Polygon);
      mask1SvgDefs.appendChild(mask1);
      mask1Svg.appendChild(mask1SvgDefs);

      mask2.appendChild(mask2Rect);
      mask2.appendChild(mask2Polygon);
      mask2SvgDefs.appendChild(mask2);
      mask2Svg.appendChild(mask2SvgDefs);

      viewerEl.appendChild(mask1Svg);
      viewerEl.appendChild(mask2Svg);
      document.body.appendChild(viewerEl);
      return { 
        bookContainerEl: bookContainer, 
        bookViewerEl: viewerEl,
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

    return { 
      bookContainerEl: this.bookContainerEl, 
      bookViewerEl: this.bookViewerEl,
      zoneLT: this.zoneLT,
      zoneLC: this.zoneLC,
      zoneLB: this.zoneLB,
      zoneRT: this.zoneRT,
      zoneRC: this.zoneRC,
      zoneRB: this.zoneRB,
      mask1Shape: this.maskShapeOnPage1,
      mask2Shape: this.maskShapeOnPage2
    };
  }
  /**
   * Open the book on the viewer.
   * @param book 
   * @param openRightPageIndex 
   */
  view(book: Book, openRightPageIndex: number = 0) {
    this.bookViewerEl?.classList.remove("hidden");
    this.book = book;
    const newIndexRange = this.getStartPageIndexToLoad(openRightPageIndex);
    this.attachBook();
    this.setViewer();
    if(openRightPageIndex == 0){ 
      this.bookViewerEl.classList.add("ready-to-open", "front");
      book.setReadyToOpen(); 
    }
    this.loadPages(newIndexRange);
    this.showPages(newIndexRange.start);
  }
  /**
   * Close the book on the viewer.
   */
  closeBook() { this.detachBook(); }
  /**
   * 
   * @param new1stPageIndex The index of the next left page.
   */
  shiftPage(isFoward:boolean){
    const { newPage1, newPage2, removedPage1, removedPage2 } = this.getNewPages(isFoward);
    const book = this.book;

    if(isFoward){
      super.moveRight(newPage1, newPage2);
      book?.appendPageEl(newPage1.element);
      book?.appendPageEl(newPage2.element);
    }
    else {
      super.moveLeft(newPage1, newPage2);
      book?.prependPageEl(newPage2.element);
      book?.prependPageEl(newPage1.element);
    }

    book?.removePageEl(removedPage1.element);
    book?.removePageEl(removedPage2.element);

    // Global Var
    this.curOpenLeftPageIndex = isFoward ? this.curOpenLeftPageIndex + 2 : this.curOpenLeftPageIndex - 2;
    if(this.curOpenLeftPageIndex > 0){
      this.bookViewerEl.classList.remove("ready-to-open", "front");
      this.isSpreadOpen = true;
      this.book?.setSpreadOpen();
      const pageContainerRect = this.pageContainerRect = MZMath.getOffset4Fixed(this.book?.pageContainerEl as HTMLDivElement)
      this.gutter = new Gutter({
        width:0, height:0,
        left: pageContainerRect.left + pageContainerRect.width/2, 
        right: pageContainerRect.left + pageContainerRect.width/2,
        top: pageContainerRect.top,
        bottom: pageContainerRect.bottom
      })
    } else {
      this.bookViewerEl.classList.add("ready-to-open", "front");
      this.isSpreadOpen = false;
      this.book?.setReadyToOpen();
      const pageContainerRect = this.pageContainerRect = MZMath.getOffset4Fixed(this.book?.pageContainerEl as HTMLDivElement)
      this.gutter = new Gutter({
        width:0, height:0,
        left: pageContainerRect.left, 
        right: pageContainerRect.left,
        top: pageContainerRect.top,
        bottom: pageContainerRect.bottom
      })
    }
  }
  /**
   * 
   */
  private attachBook() {
    const book = this.book;
    if(!book?.element){ throw new Error("Error the book opening"); }
    this.bookContainerEl.appendChild(book.element);
  }

  private setViewer(){
    if(!this.book){ throw new Error("Book object does not exist."); }
    const { closed, opened } = this.book.size;
    const pageContainerRect = this.pageContainerRect = MZMath.getOffset4Fixed(this.book.pageContainerEl as HTMLDivElement);
    // Mask
    const mask1Rect = document.getElementById('mask1-rect');
    if(mask1Rect){
      mask1Rect.setAttribute('width', `${this.book.size.closed.width}px`);
      mask1Rect.setAttribute('height', `${this.book.size.closed.height}px`);
    }

    if(pageContainerRect.width > (closed.width+10)){ 
      const docStyle = document.documentElement.style;
      docStyle.setProperty('--page-width', `${opened.width}px`)
      docStyle.setProperty('--page-height', `${opened.height}px`)

      this.gutter = new Gutter({
        width:0, height:0,
        left: pageContainerRect.left + pageContainerRect.width/2, 
        right: pageContainerRect.left + pageContainerRect.width/2,
        top: pageContainerRect.top,
        bottom: pageContainerRect.bottom
      })
    }
    else { // Closed
      const docStyle = document.documentElement.style;
      docStyle.setProperty('--page-width', `${closed.width}px`)
      docStyle.setProperty('--page-height', `${closed.height}px`)

      this.gutter = new Gutter({
        width:0, height:0,
        left: pageContainerRect.left, 
        right: pageContainerRect.left,
        top: pageContainerRect.top,
        bottom: pageContainerRect.bottom
      })
    }
  }
  private detachBook() {
    this.bookViewerEl.classList.add("hidden");  
    this.book?.clearPageEls();
    this.bookManager.returnBookToShelf(this.book);
    this.bookContainerEl.innerHTML = "";
    this.book = undefined;
  }
  /**
   * 
   * @param openPageIndex 
   * @returns 
   */
  private getStartPageIndexToLoad(openPageIndex: number){
    const index = openPageIndex%2 == 1 ? openPageIndex - 2 : openPageIndex - 3; 
    return { start:index, cnt: this.windowSize };
  }
  /**
   * 
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
  private showPages(startIndex:number) {
    const book = this.book;
    if(!book){ throw new Error("Error the book opening"); }
    //
    // Load the pages to the window 
    // & append page elements to dom.
    //
    const maxIndex = startIndex + this.windowSize;
    for(let i=startIndex, winIdx=0; i<maxIndex; i++, winIdx++){
      const page = book.getPage(i);
      if(page){
        this.loadPageToWindow(winIdx, page);
        book.appendPageEl(page.element);
      }
    }
  }

  private flipPage(page2El:HTMLElement, page1Mask:SVGPolygonElement, page2Mask:SVGPolygonElement, mouseGP:Point, pageWH:ISize){
    const flipData = this.flip(mouseGP, pageWH, this.isSpreadOpen);
    // Mask
    page1Mask.setAttribute('points', flipData.printPage1MaskShape() );
    page2Mask.setAttribute('points', flipData.printPage2MaskShape() );
    // Page 2
    page2El.style.top = `${flipData?.page2.top}px`;
    page2El.style.left = `${flipData?.page2.left}px`;
    page2El.style.transform = `rotate(${flipData?.page2.rotate}rad)`;
  }


  onFlipStart(page2El:HTMLElement){
    this.setViewerToFlip(page2El);
  }

  setViewerToAutoFlip(page2El:HTMLElement){
    const className = this.isLeftPageActive ? "left" : "right";
    this.bookViewerEl.classList.add(`${className}-page-flipping`);
  }

  unsetViewerToAutoFlip(page2El:HTMLElement){
    document.querySelectorAll('.page').forEach( pageEl =>{
      pageEl.removeAttribute('style');
    })
    this.bookViewerEl.classList.remove('left-page-flipping', 'right-page-flipping');
  }

  setViewerToFlip(page2El:HTMLElement){
    const className = this.isLeftPageActive ? "left" : "right";
    this.bookViewerEl.classList.add(`${className}-page-flipping`, "noselect");
    this.curAutoFlipWidth = 0;
  }

  unsetViewerToFlip(page2El:HTMLElement){
    this.bookViewerEl.classList.remove("noselect", 'left-page-flipping', `right-page-flipping`);
    document.querySelectorAll('.page').forEach( pageEl =>{
      pageEl.removeAttribute('style');
    })
    this.eventStatus = EventStatus.None;
  }

  zoneMouseEntered(event:MouseEvent, param:IZoneEventParams) {
console.log("mouseEnter1", this.eventStatus)
    if(this.eventStatus & EventStatus.Flipping){ return; }

    let isCenter = false;
    switch(param.zone){
      case Zone.LT: 
        this.isLeftPageActive = true;
        break;
      case Zone.LC:
        isCenter = true;
        this.isLeftPageActive = true;
        break;
      case Zone.LB: 
        this.isLeftPageActive = true;
        break;
      case Zone.RT: 
        this.isLeftPageActive = false;
        break;
      case Zone.RC: 
        isCenter = true;
        this.isLeftPageActive = false;
        break;
      case Zone.RB: 
        this.isLeftPageActive = false;
        break;
    }

    const page2El = this.page2El;
    if(!page2El || (this.page2 && this.page2.type == PageType.Empty) ){ return }
  console.log("mouseEnter2", this.eventStatus)
    const msEvent = event as MouseEvent;
    const viewport = { x:msEvent.clientX, y:isCenter ? this.gutter.centerCenter.y : msEvent.clientY }
    this.eventStatus = EventStatus.AutoFlipFromCorner; 

    this.setViewerToAutoFlip(page2El);
    this.setInitFlipping(param.zone, viewport, this.pageContainerRect as Rect, page2El);
    this.animateFlipFromCorner(
      { width: page2El.offsetWidth, height: page2El.offsetHeight },
      (mouseGP:Point, pageWH:ISize) => {
        this.flipPage(
          page2El, 
          this.maskShapeOnPage1, 
          this.maskShapeOnPage2, 
          mouseGP, 
          pageWH
        );
      }, 
      () =>{}
    );
  }
 
  zoneMouseLeaved(event:MouseEvent, param:IZoneEventParams){
console.log("zoneLeave1", this.eventStatus)
    if(this.eventStatus & EventStatus.Flipping){ return; }

    const page2El = this.page2El;
    if(!page2El || (this.page2 && this.page2.type == PageType.Empty) ){ return }

    this.eventStatus = EventStatus.AutoFlipToCorner;
    this.eventZone = param.zone;
console.log("zoneLeave2", this.eventStatus)
    this.animateFlipToCorner(
      { width: page2El.offsetWidth, height: page2El.offsetHeight },
      (mouseGP:Point, pageWH:ISize) => {
        this.flipPage(
          page2El,
          this.maskShapeOnPage1, 
          this.maskShapeOnPage2, 
          mouseGP, 
          pageWH
        );
      },
      () => { this.unsetViewerToAutoFlip(page2El); }
    );
  }

  zoneMouseDowned(event:MouseEvent, param:IZoneEventParams){
console.log("zoneDown1", this.eventStatus)
    if(this.eventStatus & EventStatus.Flipping){ return; }

    const msEvent = event as MouseEvent;
    const viewport = { x:msEvent.clientX, y:msEvent.clientY };
    const page2El = this.page2El;

    if(!page2El || (this.page2 && this.page2.type == PageType.Empty) ){ return }
    if(!this.pageContainerRect){ return; }
console.log("zoneDown2", this.eventStatus)
    this.eventStatus = EventStatus.Flipping;
    this.setViewerToFlip(page2El);
    this.setInitFlipping(
      param.zone, 
      viewport,
      this.pageContainerRect as Rect,
      this.page2El as HTMLElement,
    )

    this.flipPage(
      page2El, 
      this.maskShapeOnPage1, 
      this.maskShapeOnPage2, 
      viewport, 
      { width: page2El.offsetWidth, height: page2El.offsetHeight }
    );
  }

  documentMouseUp(event:Event){
console.log("mouseUp1")
    if(!(this.eventStatus & EventStatus.Flipping)){ return; }
console.log("mouseUp2")
    const page2El = this.page2El;
    if(!page2El || (this.page2 && this.page2.type == PageType.Empty) ){ return }
console.log("mouseUp3")
    const msEvent = event as MouseEvent;
    const viewport = { x:msEvent.clientX, y:msEvent.clientY };

    const dataToFlip = this.getInfoToFlip(viewport);
    if(dataToFlip.isSnappingBack){ this.eventStatus & EventStatus.SnappingBack; }
    else { this.eventStatus = dataToFlip.isFlippingForward ? EventStatus.FlippingForward : EventStatus.FlippingBackward; }
    this.animateFlip(
      viewport, 
      dataToFlip.targetCornerGP,
      { width: page2El.offsetWidth, height: page2El.offsetHeight },
      (mouseGP:Point, pageWH:ISize) => {
        this.flipPage(
          page2El, 
          this.maskShapeOnPage1, 
          this.maskShapeOnPage2, 
          mouseGP, 
          pageWH
        );
      },
      () => {
        if(!dataToFlip.isSnappingBack){
console.log("mouseUp4")
          this.shiftPage(dataToFlip.isFlippingForward)
        }
console.log("mouseUp5")
        this.unsetViewerToFlip(page2El);
      }
    );
  }

  getNewPages(isForward:boolean){
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

  documentMouseMove(event:Event){
    if(!(this.eventStatus & EventStatus.Flipping)){ return; }
    const page2El = this.page2El;
    if(!page2El || (this.page2 && this.page2.type == PageType.Empty) ){ return }

    const msEvent = event as MouseEvent;
    const viewport = { x:msEvent.clientX, y:msEvent.clientY };

    this.flipPage(
      page2El, 
      this.maskShapeOnPage1, 
      this.maskShapeOnPage2, 
      viewport, 
      { width: page2El.offsetWidth, height: page2El.offsetHeight });
  }

  addEventListeners() {    
    this.zoneLT.addEventListener('mouseenter', (event:Event) => { this.zoneMouseEntered(event as MouseEvent, { zone: Zone.LT }); })
    this.zoneLC.addEventListener('mouseenter', (event:Event) => { this.zoneMouseEntered(event as MouseEvent, { zone: Zone.LC }); })
    this.zoneLB.addEventListener('mouseenter', (event:Event) => { this.zoneMouseEntered(event as MouseEvent, { zone: Zone.LB }); })
    this.zoneRT.addEventListener('mouseenter', (event:Event) => { this.zoneMouseEntered(event as MouseEvent, { zone: Zone.RT }); })
    this.zoneRC.addEventListener('mouseenter', (event:Event) => { this.zoneMouseEntered(event as MouseEvent, { zone: Zone.RC }); })
    this.zoneRB.addEventListener('mouseenter', (event:Event) => { this.zoneMouseEntered(event as MouseEvent, { zone: Zone.RB }); })

    this.zoneLT.addEventListener('mouseleave', (event:Event) => { this.zoneMouseLeaved(event as MouseEvent, { zone: Zone.LT }); })
    this.zoneLC.addEventListener('mouseleave', (event:Event) => { this.zoneMouseLeaved(event as MouseEvent, { zone: Zone.LC }); })
    this.zoneLB.addEventListener('mouseleave', (event:Event) => { this.zoneMouseLeaved(event as MouseEvent, { zone: Zone.LB }); })
    this.zoneRT.addEventListener('mouseleave', (event:Event) => { this.zoneMouseLeaved(event as MouseEvent, { zone: Zone.RT }); })
    this.zoneRC.addEventListener('mouseleave', (event:Event) => { this.zoneMouseLeaved(event as MouseEvent, { zone: Zone.RC }); })
    this.zoneRB.addEventListener('mouseleave', (event:Event) => { this.zoneMouseLeaved(event as MouseEvent, { zone: Zone.RB }); })

    this.zoneLT.addEventListener('mousedown', (event:Event) => { this.zoneMouseDowned(event as MouseEvent, { zone: Zone.LT }); })
    this.zoneLC.addEventListener('mousedown', (event:Event) => { this.zoneMouseDowned(event as MouseEvent, { zone: Zone.LC }); })
    this.zoneLB.addEventListener('mousedown', (event:Event) => { this.zoneMouseDowned(event as MouseEvent, { zone: Zone.LB }); })
    this.zoneRT.addEventListener('mousedown', (event:Event) => { this.zoneMouseDowned(event as MouseEvent, { zone: Zone.RT }); })
    this.zoneRC.addEventListener('mousedown', (event:Event) => { this.zoneMouseDowned(event as MouseEvent, { zone: Zone.RC }); })
    this.zoneRB.addEventListener('mousedown', (event:Event) => { this.zoneMouseDowned(event as MouseEvent, { zone: Zone.RB }); })

    document.addEventListener('mouseup', this.documentMouseUp.bind(this));
    document.addEventListener('mousemove', this.documentMouseMove.bind(this));
  }
}