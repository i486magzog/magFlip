import { Box, EventStatus, Gutter, IPageData, Point, Rect, Zone, ZoneEventParams } from './models.js';
import { Book } from './book.js'
import { Page } from './page.js'
import { BookManager } from './bookManager.js'
import { Flipping } from './flipping.js'

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
  zoneLT: HTMLElement;
  zoneLC: HTMLElement;
  zoneLB: HTMLElement;
  zoneRT: HTMLElement;
  zoneRC: HTMLElement;
  zoneRB: HTMLElement;
  maskShapeOnPage2: SVGPolygonElement;
  maskShapeOnPage3: SVGPolygonElement;
  
  // isFlipping: boolean = false;
  isLeftPageActive:boolean = false;
  curActiveOpenPageIndex: number = 0;
  isSpreadOpen:boolean = false;
  gutter:Gutter = new Gutter();

  pageContainerRect?:Rect;
  // bottomCenter:Point = {x:0, y:0}

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
      mask1Shape: this.maskShapeOnPage2,
      mask2Shape: this.maskShapeOnPage3 } = this.createElements());
    
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
      zoneLT.id = "mzZoneLT";
      zoneLC.id = "mzZoneLC";
      zoneLB.id = "mzZoneLB";
      zoneRT.id = "mzZoneRT";
      zoneRC.id = "mzZoneRC";
      zoneRB.id = "mzZoneRB";
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
      mask1Rect.setAttribute('x', '0');
      mask1Rect.setAttribute('y', '0');
      mask1Rect.setAttribute('width', '100%');
      mask1Rect.setAttribute('height', '100%');
      mask1Rect.setAttribute('fill', 'black');
      const mask1Polygon = document.createElementNS(svgNS, 'polygon');
      mask1Polygon.setAttribute('id', 'mask1-shape');
      mask1Polygon.setAttribute('points', '0,0');
      mask1Polygon.setAttribute('fill', 'white');

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
      mask1Shape: this.maskShapeOnPage2,
      mask2Shape: this.maskShapeOnPage3
    };
  }
  /**
   * Open the book on the viewer.
   * @param book 
   * @param openPageIndex 
   */
  view(book: Book, openPageIndex: number = 0) {
    this.bookViewerEl?.classList.remove("hidden");
    this.book = book;
    const newIndexRange = this.getStartPageIndexToLoad(openPageIndex);
    this.attachBook();
    this.setViewer();
    if(openPageIndex == 0){ book.setReadyToOpen(); }
    this.loadPages(newIndexRange);
    this.showPages(newIndexRange.start);
  }
  /**
   * Close the book on the viewer.
   */
  closeBook() { this.detachBook(); }
  /**
   * 
   * @param nextLeftPageIndex The index of the next left page.
   * @param nextRightPageIndex 
   */
  moveNextPage(nextLeftPageIndex: number, nextRightPageIndex: number) {
    const book = this.book;
    if(!book){ throw new Error("Error the book opening"); }

    const nextLeftPage = book.getPage(nextLeftPageIndex) || Page.emptyPage(nextLeftPageIndex);
    const nextRightPage = book.getPage(nextRightPageIndex) || Page.emptyPage(nextRightPageIndex);
    super.moveRight(nextLeftPage, nextRightPage);
    book.appendPageEl(nextLeftPageIndex);
    book.appendPageEl(nextRightPageIndex);
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
    if(this.book){
      const { closed, opened } = this.book.size;
      const pageContainerRect = this.pageContainerRect = this.getOffset4Fixed(this.book.pageContainerEl as HTMLDivElement);

      if(pageContainerRect.width > (closed.width+10)){ 
        this.gutter = {
          topPoint: { x:pageContainerRect.left + pageContainerRect.width/2, y: pageContainerRect.top },
          bottomPoint: { x:pageContainerRect.left + pageContainerRect.width/2, y: pageContainerRect.bottom },
          rect: {
            width:0, height:0,
            left: pageContainerRect.left + pageContainerRect.width/2, 
            right: pageContainerRect.left + pageContainerRect.width/2,
            top: pageContainerRect.top,
            bottom: pageContainerRect.bottom
          }
        } 
      }
      else { 
        this.gutter = {
          topPoint: { x:pageContainerRect.left, y: pageContainerRect.top },
          bottomPoint: { x:pageContainerRect.left, y: pageContainerRect.bottom },
          rect: {
            width:0, height:0,
            left: pageContainerRect.left, 
            right: pageContainerRect.left,
            top: pageContainerRect.top,
            bottom: pageContainerRect.bottom
          }
        } 
      }
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
    const book = this.book;
    if(!book){ throw new Error("Error the book opening"); }
    return book.fetchPages(indexRange);
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
        book.appendPageEl(page.index);
      }
    }
  }

  zoneMouseEntered(event:MouseEvent, param:ZoneEventParams) {
    if(this.eventStatus == EventStatus.Flipping
      || this.eventStatus == EventStatus.FlippingOut){ return; }

    switch(param.zone){
      case Zone.LT: 
      case Zone.LC:
      case Zone.LB: 
        this.isLeftPageActive = true;
        break;
      case Zone.RT: 
      case Zone.RC: 
      case Zone.RB: 
        this.isLeftPageActive = false;
        break;
    }

    const msEvent = event as MouseEvent;
    this.setTransformOrigin(param.zone);
    this.eventStatus = EventStatus.AutoFlipInCorner; 
    this.eventZone = param.zone;
    this.page2El?.classList.add("flipping-page2");
    this.page3El?.classList.add("flipping-page3");
    this.flipInCorner(this.page2El as HTMLElement, this.maskShapeOnPage2 as SVGPolygonElement, this.maskShapeOnPage3 as SVGPolygonElement, () =>{});
  }

  setTransformOrigin(zone:Zone){
    this.unsetTransformOrigin();
    this.bookViewerEl?.classList.add(`zone-${zone}`)
  }
  unsetTransformOrigin(){
    const classListArray = Array.from(this.bookViewerEl?.classList || []);
    classListArray.forEach(className => {
      if (className.startsWith('zone-')) {
        this.bookViewerEl?.classList.remove(className);
      }
    });
  }

  zoneMouseLeaved(event:MouseEvent, param:ZoneEventParams){
    if(this.eventStatus == EventStatus.Flipping
      || this.eventStatus == EventStatus.FlippingOut){ return; }

    this.eventStatus = EventStatus.AutoFlipOutCorner;
    this.eventZone = param.zone;

    this.flipOutCorner(
      this.page2El as HTMLElement, 
      this.maskShapeOnPage2 as SVGPolygonElement, 
      this.maskShapeOnPage3 as SVGPolygonElement, 
      () => {
        if(this.page2El){
          this.page2El.classList.remove("flipping-page2");
          this.page2El.style.top = "";
          this.page2El.style.left = "";
          this.page2El.style.transform = `rotate(0rad)`;
        }
        if(this.page3El){
          this.page3El.classList.remove("flipping-page3");
        }
        this.eventStatus = EventStatus.None;
      }
    );

    // switch(param.zone){
    //   case Zone.LT: break;
    //   case Zone.LC: break;
    //   case Zone.LB: break;
    //   case Zone.RT: break;
    //   case Zone.RC: break;
    //   case Zone.RB: break;
    // }
  }

  zoneMouseDowned(event:MouseEvent, param:ZoneEventParams){
    if(this.eventStatus == EventStatus.FlippingOut){ return; }

    const msEvent = event as MouseEvent;
    const viewport = { x:msEvent.clientX, y:msEvent.clientY };

    if(this.page2El){ 
      this.page2El.classList.remove("flipping-page2");
      this.page2El.classList.add("flipping-page2");
    }
    this.setTransformOrigin(param.zone);
    this.bookViewerEl.classList.add("noselect");
    this.page3El && this.page3El.classList.add("flipping-page3");
    this.eventStatus = EventStatus.Flipping;
    this.eventZone = param.zone;
    this.curAutoFlipWidth = 0;

    if(!this.pageContainerRect){ return; }
    // let gutterPoint:Point;
    switch(param.zone){
      case Zone.LT:
        this.activeCenterGP = this.gutter.topPoint;
        this.activeCenterOppositeGP = this.gutter.bottomPoint;
        this.activeCornerGP = { x:this.pageContainerRect?.left, y: this.pageContainerRect?.top }
        this.setDiagonalLength();
        this.setInitFlipping();
        break;
      case Zone.RT:
        this.activeCenterGP = this.gutter.topPoint;
        this.activeCenterOppositeGP = this.gutter.bottomPoint;
        this.activeCornerGP = { x:this.pageContainerRect?.right, y: this.pageContainerRect?.top }
        this.setDiagonalLength();
        this.setInitFlipping();
        break;
      case Zone.LC:
        this.activeCenterGP = this.gutter.bottomPoint;
        this.activeCenterOppositeGP = this.gutter.topPoint;
        this.activeCornerGP = { x:this.pageContainerRect?.left, y: this.pageContainerRect?.top }
        this.setDiagonalLength();
        this.setInitFlipping();
        break;
      case Zone.RC:
        {
          this.activeCenterGP = this.gutter.bottomPoint;
          this.activeCenterOppositeGP = this.gutter.topPoint;
          this.activeCornerGP = { x:this.pageContainerRect?.right, y: viewport.y }
          this.setDiagonalLength();
          this.setInitFlipping();
        }
        break;
      case Zone.LB:
        this.activeCenterGP = this.gutter.bottomPoint;
        this.activeCenterOppositeGP = this.gutter.topPoint;
        this.activeCornerGP = { x:this.pageContainerRect?.left, y: this.pageContainerRect?.bottom }
        this.setDiagonalLength();
        this.setInitFlipping();
        break;
      case Zone.RB:
        {
          this.activeCenterGP = this.gutter.bottomPoint;
          this.activeCenterOppositeGP = this.gutter.topPoint;
          this.activeCornerGP = { x:this.pageContainerRect?.right, y: this.pageContainerRect?.bottom }
          this.setDiagonalLength();
          this.setInitFlipping();
        }
        break;
    }

    this.flip(
      viewport, 
      this.pageContainerRect as Rect,
      this.page2El as HTMLElement,
      this.maskShapeOnPage2,
      this.maskShapeOnPage3
    );
  }

  documentMouseUp(event:Event){
    if(this.eventStatus != EventStatus.Flipping){ return; }

    this.eventStatus = EventStatus.FlippingOut;

    const msEvent = event as MouseEvent;
    const viewport = { x:msEvent.clientX, y:msEvent.clientY };

    this.flipOut(
      viewport, 
      this.pageContainerRect as Rect, 
      this.page2El as HTMLElement, 
      this.maskShapeOnPage2,
      this.maskShapeOnPage3,
      () => {
        this.eventStatus = EventStatus.None;
        this.unsetTransformOrigin();
        this.bookViewerEl.classList.remove("noselect");
        this.page3El?.classList.remove("flipping-page3");
        if(this.page2El){
          this.page2El.classList.remove("flipping-page2");
          this.page2El.style.top = "";
          this.page2El.style.left = "";
          this.page2El.style.transform = `rotate(0rad)`;
        }
      }
    );
  }

  documentMouseMove(event:Event){
    if(this.eventStatus != EventStatus.Flipping){ return; }

    const msEvent = event as MouseEvent;
    const viewport = { x:msEvent.clientX, y:msEvent.clientY };
    this.flip(
      viewport, 
      // this.bottomCenter,
      this.pageContainerRect as Rect,
      this.page2El as HTMLElement,
      this.maskShapeOnPage2,
      this.maskShapeOnPage3
    );
  }

  addEventListeners() {
    // if(!this.book){ throw new Error("Error the book opening"); }
    
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