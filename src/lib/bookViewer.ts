import { IBox, EventStatus, Gutter, IPageData, Point, Rect, Zone, IZoneEventParams, ISize, FlipData, PageType, DefaultSize, Line, AutoFlipType } from './models.js';
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
  get pageContainerRect(){
    const el = this.book?.pageContainerEl;
    if(!el){ throw new Error("Not found the page container.") }
    return el && MZMath.getOffset4Fixed(el as HTMLDivElement)
  }
  zoneLT: HTMLElement;
  zoneLC: HTMLElement;
  zoneLB: HTMLElement;
  zoneRT: HTMLElement;
  zoneRC: HTMLElement;
  zoneRB: HTMLElement;
  maskShapeOnPage1: SVGPolygonElement;
  maskShapeOnPage2: SVGPolygonElement;
  
  curOpenLeftPageIndex: number = -1;
  isSpreadOpen:boolean = false;
  // Shadow  

  get isLeftPageActive(){ return this.eventZone & Zone.Left; };
  private get openPage():Page|undefined { return this.eventZone ? this.windows[2].page : this.windows[3].page; }
  private get page2():Page|undefined { return this.isLeftPageActive ? this.windows[1].page : this.windows[4].page; }
  private get page3():Page|undefined { return this.isLeftPageActive ? this.windows[0].page : this.windows[5].page; }
  private get openPageEl():HTMLElement|undefined { return this.openPage?.element; }
  private get page2El():HTMLElement|undefined { return this.page2?.element; }
  private get page3El():HTMLElement|undefined { return this.page3?.element; }
  private get page2ShadowRect():HTMLElement|null|undefined { return this.page2?.element.querySelector('.shadow6'); }

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

  init(){ 
    this.curOpenLeftPageIndex = -1;
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
      btnClose.addEventListener('click', (event: Event) => { this.closeViewer(); });
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
      mask1Polygon.setAttribute('stroke', 'black');
      mask1Polygon.setAttribute('stroke-width', '1');

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

      // Shadow3
      const shadow3Svg = document.createElementNS(svgNS, 'svg');
      const shadow3 = document.createElementNS(svgNS, 'linearGradient');
      shadow3.id ='shadow3';
      shadow3.appendChild(document.createElementNS(svgNS, 'stop'));
      shadow3.appendChild(document.createElementNS(svgNS, 'stop'));
      shadow3.appendChild(document.createElementNS(svgNS, 'stop'));
      shadow3.appendChild(document.createElementNS(svgNS, 'stop'));
      shadow3.appendChild(document.createElementNS(svgNS, 'stop'));
      shadow3Svg.appendChild(shadow3);


      viewerEl.appendChild(mask1Svg);
      viewerEl.appendChild(mask2Svg);
      viewerEl.appendChild(shadow3Svg);
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
    this.init();
    this.bookViewerEl?.classList.remove("hidden");
    this.book = book;
    const newIndexRange = this.getStartPageIndexToLoad(openRightPageIndex);
    this.attachBook();
    this.setViewer(openRightPageIndex);
    this.loadPages(newIndexRange);
    this.showPages(newIndexRange.start);
  }
  /**
   * Close the book on the viewer.
   */
  closeViewer() { 
    this.init();
    this.detachBook(); 
  }
  /**
   * 
   * @param new1stPageIndex The index of the next left page.
   */
  shiftPage(isFoward:boolean){
    const { newPage1, newPage2, removedPage1, removedPage2 } = this.getNewPages(isFoward);
    const book = this.book;

    // Global Var
    this.curOpenLeftPageIndex = isFoward ? this.curOpenLeftPageIndex + 2 : this.curOpenLeftPageIndex - 2;
    if(this.curOpenLeftPageIndex > 0){ this.setSpreadOpen(); } 
    else { this.setReadyToOpen(); }

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
  }
  /**
   * 
   */
  private attachBook() {
    const book = this.book;
    if(!book?.element){ throw new Error("Error the book opening"); }
    this.bookContainerEl.appendChild(book.element);
  }

  private setReadyToOpen(){ 
    this.isSpreadOpen = false;
    this.bookViewerEl.classList.add("ready-to-open", "front"); 
    const bookRect = MZMath.getOffset4Fixed(this.book?.element as HTMLDivElement);
    this.gutter = new Gutter({
      width:0, height:0,
      left: bookRect.left, 
      right: bookRect.left,
      top: bookRect.top,
      bottom: bookRect.bottom
    })
  }
  private setSpreadOpen(){ 
    this.isSpreadOpen = true;
    this.bookViewerEl.classList.remove("ready-to-open", "front", "end"); 
    const bookRect = MZMath.getOffset4Fixed(this.book?.element as HTMLDivElement);
    this.gutter = new Gutter({
      width:0, height:0,
      left: bookRect.left + bookRect.width/2, 
      right: bookRect.left + bookRect.width/2,
      top: bookRect.top,
      bottom: bookRect.bottom
    })
  }
  private setReadyToOpenFromBack(){ this.bookViewerEl.classList.add("ready-to-open", "end"); }

  private setViewer(openRightPageIndex:number){
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
    if(openRightPageIndex <= 0){ this.setReadyToOpen(); }
    else if(openRightPageIndex > 0) { this.setSpreadOpen(); }

    document.documentElement.style.setProperty('--page-diagonal-length', (closed.diagonal || 0) + 'px');
  }
  private detachBook() {
    this.bookViewerEl.className = "";
    this.bookViewerEl.classList.add("hidden");  
    if(this.book){
      this.book.element.removeAttribute('style');
      this.book.clearPageEls();
      this.bookContainerEl.removeChild(this.book.element);
      this.bookManager.returnBookToShelf(this.book);
    }
    this.book = undefined;
    this.clearPageWindow();
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

  private flipPage(page2El:HTMLElement, page1Mask:SVGPolygonElement, page2Mask:SVGPolygonElement, shadowRect:HTMLElement|null, shadowShape:SVGPolygonElement|null, mouseGP:Point, pageWH:ISize){
    const flipData = this.flip(mouseGP, pageWH, this.isSpreadOpen);
    // Mask
    page1Mask.setAttribute('points', flipData.printPage1MaskShape() );
    page2Mask.setAttribute('points', flipData.printPage2MaskShape() );
    shadowShape?.setAttribute('points', flipData.printPage2MaskShape() );
    // Shadow
    const isLeftPageActive = this.isLeftPageActive;
    // Shadow Rect
    const shadowOrigin = flipData.shadow.rect.origin;
    const cssVar = document.documentElement.style;
    const alpa = flipData.shadow.rect.rotate;
    cssVar.setProperty('--shadow-origin-x', `${shadowOrigin.x}px`)
    cssVar.setProperty('--shadow-origin-y', `${shadowOrigin.y}px`)
    cssVar.setProperty('--shadow-rotate', `${alpa}rad`)
    //
    // Shadow5
    //
    const p2Rotate = flipData.page2.rotate;
    const defaultOpacity = isLeftPageActive ? 0.3: 0.5;
    const tempValue = defaultOpacity/Math.PI;
    const opacity = p2Rotate <= Math.PI 
      ? defaultOpacity - tempValue*p2Rotate 
      : defaultOpacity + tempValue*(2*Math.PI - p2Rotate);
    cssVar.setProperty('--shadow5-opacity', `${opacity}`)
    // console.log("op:", opacity, "ro: ", p2Rotate, "tv: ", tempValue, )
    //
    // Shadow3
    //
    const shadow3El = document.getElementById('shadow3') as SVGLinearGradientElement|null;
    const f = flipData.mask.page2.p1;
    const g = flipData.mask.page2.p2;
    const h = flipData.mask.page2.p3;
    const k = flipData.mask.page1.p2;
    const l = flipData.mask.page1.p3;
    const c = flipData.c;
    let x1, y1, x2, y2 = 100;
    const isTopZone = this.eventZone & Zone.Top;
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
        p = MZMath.findPerpendicularFoot( new Line( { x:0, y:0}, { x:l.x-k.x, y:l.x} ), { x:l.x, y:isTopZone ? 0 : l.x} );
        if(isTopZone){ y2 = 0 }
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
        p = MZMath.findPerpendicularFoot( new Line( { x:h.x, y:0}, { x:g.x, y:h.x} ), { x:0, y: isTopZone ? 0 : h.x} );
        if(isTopZone){ y2 = 0 }
      }
      x2 = 0;
    }
    x1 = ((p.x/longLineLength) || 1)*100;
    y1 = ((p.y/longLineLength) || 1)*100;

    if(shadow3El){
      shadow3El.setAttribute('x1', `${x1}%`);
      shadow3El.setAttribute('y1', `${y1}%`);
      shadow3El.setAttribute('x2', `${x2}%`);
      shadow3El.setAttribute('y2', `${y2}%`);
    }

    const stops = shadow3El?.querySelectorAll('stop');
    if(stops){
      // The stop shadow becomes increasingly transparent from one-third of the way toward the closing corner as it gets closer to the corner.
      let opacityScale = flipData.shadow.closingDistance/(pageWH.width/3);
      opacityScale = opacityScale > 1 ? 1 : opacityScale;
      //
      stops[0].setAttribute('offset', '0.5%');
      stops[0].setAttribute('stop-color', `rgba(255, 255, 255, ${0.7*opacityScale})`);
      stops[1].setAttribute('offset', '5%');
      stops[1].setAttribute('stop-color', `rgba(255, 255, 255, ${0.5*opacityScale})`);
      stops[2].setAttribute('offset', '12%');
      stops[2].setAttribute('stop-color', `rgba(255, 255, 255, ${0.7*opacityScale})`);
      stops[3].setAttribute('offset', '50%');
      stops[3].setAttribute('stop-color', 'rgba(0, 0, 0, 0.208)');
      stops[4].setAttribute('offset', '100%');
      stops[4].setAttribute('stop-color', 'rgba(255, 255, 255, 0)');


      // rgba(255, 255, 255, 0.45), 
      // rgba(255, 255, 255, 0.15) 0.015px, 
      // rgba(255, 255, 255, 0.45) 0.0825px, 
      // rgba(0, 0, 0, 0.208) 0.2775px, 
      // transparent 1.5px);
    }
    // Page 2
    cssVar.setProperty('--page2-top', `${flipData.page2.top}px`)
    cssVar.setProperty('--page2-left', `${flipData.page2.left}px`)
    cssVar.setProperty('--page2-rotate', `${flipData.page2.rotate}rad`)
  }

  getShadow3GradientVetors(){

  }

  onFlipStart(){
    this.setViewerToFlip();
  }

  setViewerToAutoFlip(){
    const className = this.isLeftPageActive ? "left" : "right";
    this.bookViewerEl.classList.add(`${className}-page-flipping`);
  }

  unsetViewerToAutoFlip(){
    this.bookViewerEl.classList.remove('left-page-flipping', 'right-page-flipping');
  }

  setViewerToFlip(){
    const className = this.isLeftPageActive ? "left" : "right";
    this.bookViewerEl.classList.add(`${className}-page-flipping`, "noselect");
    this.curAutoFlipWidth = 0;
  }

  unsetViewerToFlip(){
    this.bookViewerEl.classList.remove("noselect", 'left-page-flipping', `right-page-flipping`);
  }

  zoneMouseEntered(event:MouseEvent, param:IZoneEventParams) {
    if(this.eventStatus & EventStatus.Flipping
      || this.eventStatus & EventStatus.Dragging){ return; }
    this.eventStatus = EventStatus.AutoFlipFromCorner;

    this.eventZone = param.zone;
    const page2El = this.page2El;
    if(!page2El || (this.page2 && this.page2.type == PageType.Empty) ){ return }
    const shadowRect = page2El.querySelector('div.shadow6') as HTMLElement | null;
    const shadowShape = page2El.querySelector('div.shadow > .shadow3-svg > polygon.shape') as SVGPolygonElement | null;

    const msEvent = event as MouseEvent;
    const isCenter = this.eventZone & Zone.Center;
    const viewport = { x:msEvent.clientX, y:msEvent.clientY }

    this.setViewerToAutoFlip();
    this.setInitFlipping(param.zone, viewport, this.pageContainerRect as Rect);
    this.animateFlipFromCorner(
      viewport,
      { width: page2El.offsetWidth, height: page2El.offsetHeight },
      (mouseGP:Point, pageWH:ISize) => {
        this.flipPage(
          page2El, 
          this.maskShapeOnPage1, 
          this.maskShapeOnPage2,
          shadowRect,
          shadowShape,
          mouseGP, 
          pageWH
        );
      }, 
      () =>{}
    );
  }

  zoneMouseMoved(event:MouseEvent, param:IZoneEventParams) {
    if(this.eventStatus !== EventStatus.AutoFlipFromCorner){ return; }
    if(this.eventZone & Zone.Center){ return; }
    this.eventZone = param.zone;

    const page2El = this.page2El;
    if(!page2El || (this.page2 && this.page2.type == PageType.Empty) ){ return }
    const shadowRect = page2El.querySelector('div.shadow6') as HTMLElement | null;
    const shadowShape = page2El.querySelector('div.shadow > .shadow3-svg > polygon.shape') as SVGPolygonElement | null;

    const msEvent = event as MouseEvent;
    const viewport = { x:msEvent.clientX, y:msEvent.clientY };

    this.flipPage(
      page2El, 
      this.maskShapeOnPage1, 
      this.maskShapeOnPage2, 
      shadowRect,
      shadowShape,
      viewport, 
      { width: page2El.offsetWidth, height: page2El.offsetHeight });
  }
 
  zoneMouseLeaved(event:MouseEvent, param:IZoneEventParams){
    if(this.eventStatus !== EventStatus.AutoFlipFromCorner){ return; }
    this.eventStatus = EventStatus.AutoFlipToCorner;

    const page2El = this.page2El;
    if(!page2El || (this.page2 && this.page2.type == PageType.Empty) ){ return }
    const shadowRect = page2El.querySelector('div.shadow6') as HTMLElement | null;
    const shadowShape = page2El.querySelector('div.shadow > .shadow3-svg > polygon.shape') as SVGPolygonElement | null;
    const msEvent = event as MouseEvent;
    const viewport = { x:msEvent.clientX, y:msEvent.clientY }

    this.eventZone = param.zone;
    this.animateFlipToCorner(
      viewport,
      { width: page2El.offsetWidth, height: page2El.offsetHeight },
      (mouseGP:Point, pageWH:ISize) => {
        this.flipPage(
          page2El,
          this.maskShapeOnPage1, 
          this.maskShapeOnPage2, 
          shadowRect,
          shadowShape,
          mouseGP, 
          pageWH
        );
      },
      () => { 
        if(this.eventStatus == EventStatus.AutoFlipToCorner){ 
          this.unsetViewerToAutoFlip();
          this.eventStatus = EventStatus.None; 
        }
      }
    );
  }

  zoneMouseDowned(event:MouseEvent, param:IZoneEventParams){
    if(this.eventStatus & EventStatus.Flipping){ return; }
    this.eventStatus = EventStatus.Dragging;
    this.eventZone = param.zone;

    const msEvent = event as MouseEvent;
    const viewport = { x:msEvent.clientX, y:msEvent.clientY };
    const page2El = this.page2El;

    if(!page2El || (this.page2 && this.page2.type == PageType.Empty) ){ return }
    if(!this.pageContainerRect){ return; }

    const shadowRect = page2El.querySelector('div.shadow6') as HTMLElement | null;
    const shadowShape = page2El.querySelector('div.shadow > .shadow3-svg > polygon.shape') as SVGPolygonElement | null;

    this.setViewerToFlip();
    this.setInitFlipping(param.zone, viewport, this.pageContainerRect)
    this.flipPage(
      page2El, 
      this.maskShapeOnPage1, 
      this.maskShapeOnPage2, 
      shadowRect,
      shadowShape,
      viewport, 
      { width: page2El.offsetWidth, height: page2El.offsetHeight }
    );
  }

  documentMouseUp(event:Event){
    if(!(this.eventStatus & EventStatus.Dragging)){ return; }
    
    const page2El = this.page2El;
    if(!page2El || (this.page2 && this.page2.type == PageType.Empty) ){ return }

    const msEvent = event as MouseEvent;
    const viewport = { x:msEvent.clientX, y:msEvent.clientY };
    const dataToFlip = this.getInfoToFlip(viewport);

    if(dataToFlip.isSnappingBack){ this.eventStatus = EventStatus.SnappingBack; }
    else { this.eventStatus = dataToFlip.isFlippingForward ? EventStatus.FlippingForward : EventStatus.FlippingBackward; }

    const shadowRect = page2El.querySelector('div.shadow6') as HTMLElement | null;
    const shadowShape = page2El.querySelector('div.shadow > .shadow3-svg > polygon.shape') as SVGPolygonElement | null;

    this.animateFlip(
      viewport, 
      dataToFlip.targetCornerGP,
      { width: page2El.offsetWidth, height: page2El.offsetHeight },
      (mouseGP:Point, pageWH:ISize) => {
        this.flipPage(
          page2El, 
          this.maskShapeOnPage1, 
          this.maskShapeOnPage2, 
          shadowRect,
          shadowShape,
          mouseGP, 
          pageWH
        );
      },
      () => {
        if(!dataToFlip.isSnappingBack){
          this.shiftPage(dataToFlip.isFlippingForward)
        }
        this.unsetViewerToFlip();
        this.eventStatus = EventStatus.None;
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
    if(!(this.eventStatus & EventStatus.Dragging)){ return; }

    const page2El = this.page2El;
    if(!page2El || (this.page2 && this.page2.type == PageType.Empty) ){ return }

    const shadowRect = page2El.querySelector('div.shadow6') as HTMLElement | null;
    const shadowShape = page2El.querySelector('div.shadow > .shadow3-svg > polygon.shape') as SVGPolygonElement | null;

    const msEvent = event as MouseEvent;
    const viewport = { x:msEvent.clientX, y:msEvent.clientY };

    this.flipPage(
      page2El, 
      this.maskShapeOnPage1, 
      this.maskShapeOnPage2, 
      shadowRect,
      shadowShape,
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

    this.zoneLT.addEventListener('mousemove', (event:Event) => { this.zoneMouseMoved(event as MouseEvent, { zone: Zone.LT }); })
    this.zoneLC.addEventListener('mousemove', (event:Event) => { this.zoneMouseMoved(event as MouseEvent, { zone: Zone.LC }); })
    this.zoneLB.addEventListener('mousemove', (event:Event) => { this.zoneMouseMoved(event as MouseEvent, { zone: Zone.LB }); })
    this.zoneRT.addEventListener('mousemove', (event:Event) => { this.zoneMouseMoved(event as MouseEvent, { zone: Zone.RT }); })
    this.zoneRC.addEventListener('mousemove', (event:Event) => { this.zoneMouseMoved(event as MouseEvent, { zone: Zone.RC }); })
    this.zoneRB.addEventListener('mousemove', (event:Event) => { this.zoneMouseMoved(event as MouseEvent, { zone: Zone.RB }); })

    document.addEventListener('mouseup', this.documentMouseUp.bind(this));
    document.addEventListener('mousemove', this.documentMouseMove.bind(this));
  }
}