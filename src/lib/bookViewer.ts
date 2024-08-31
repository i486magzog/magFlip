import { IPageData } from './models.js';
import { Book } from './book.js'
import { Page } from './page.js'
import { BookManager } from './bookManager.js'
import { Flipping } from './flipping.js'

type ViewerElements = {
    bookContainerEl: Element,
    bookViewerEl: Element,
    zoneLT: Element,
    zoneLC: Element,
    zoneLB: Element,
    zoneRT: Element,
    zoneRC: Element,
    zoneRB: Element,
  }
  
  
  /**
   * BookViewer class
   */
  export class BookViewer extends Flipping {
    book: Book | undefined;
    bookViewerDocId: string;
    bookManager: BookManager;
  
    bookViewerEl: Element;
    bookContainerEl: Element;
    zoneLT: Element;
    zoneLC: Element;
    zoneLB: Element;
    zoneRT: Element;
    zoneRC: Element;
    zoneRB: Element;
    
    curLeftPageIndex: number;
    curRightPageIndex: number;
  
  
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
        zoneRB: this.zoneRB } = this.createElements());
      this.curLeftPageIndex = -1;
      this.curRightPageIndex = 0;
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
      if(openPageIndex == 0){ book.setReadyToOpen(); }
      this.loadPages(newIndexRange);
      this.showPages(newIndexRange.start);
  
      this.addEventListeners();
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
  
    addEventListeners() {
      if(!this.book){ throw new Error("Error the book opening"); }
      
      // const containerRect = this.book?.pageContainerEl.getBoundingClientRect();
      const containerRect = this.getOffset4Fixed(this.book?.pageContainerEl as HTMLDivElement);
      const page1El = this.book?.getPageEl(1) as HTMLDivElement;
      const page2El = this.book?.getPageEl(2) as HTMLDivElement;
      const maskShape1 = document.getElementById('mask1-shape');
      const maskShape2 = document.getElementById('mask2-shape');
      let isFlipping = false;
  
      // const bottomCenter = { x: containerRect.left + containerRect.width/2, y: containerRect.bottom };
      const bottomCenter = { x: containerRect.left, y: containerRect.bottom };
  
      this.book?.pageContainerEl.addEventListener('mouseenter', (event:Event) => { 
        page1El.classList.add("flipping");
        page2El.classList.add("back2");
        isFlipping = true;
      });
      document.addEventListener('mouseup', (event) => { 
        isFlipping = false;
        page1El.classList.remove("flipping");
        page1El.style.top = "";
        page1El.style.left = "";
        page1El.style.transform = `rotate(0rad)`;
        page2El.classList.remove("back2");
      });
      // this.book?.pageContainerEl.addEventListener('mousemove', (event) => { 
      document.addEventListener('mousemove', (event) => { 
        const msEvent = event as MouseEvent;
  
        if(!isFlipping){ return; }
        // The position of mouse pointer in the viewport.
        let viewportX = msEvent.clientX;
        let viewportY = msEvent.clientY;
        if(this.getLength(bottomCenter.x, bottomCenter.y, msEvent.clientX, msEvent.clientY) > 600){
          ({ x:viewportX, y:viewportY } = this.findPointOnLine(bottomCenter, { x: viewportX, y: viewportY }, 600));
        }
  
        // 오른쪽 하단을 기준점으로 해서 마우스가 있는 위치의 각도를 구한다.
        const radian = this.getRadian(containerRect.right, containerRect.bottom, viewportX, viewportY);
        if(page1El){
          const b = containerRect.bottom - viewportY;
          const c = containerRect.right - viewportX;
          const d = c / Math.cos(Math.PI*3/2 + 2*radian);
          const e = b / Math.cos(Math.PI*3/2 + 2*radian);
  
          // maskShape?.setAttribute('points', `0,900 0,${900-d} ${c},${900-b} ${e},900`);
          maskShape1?.setAttribute('points', `0,900 0,${900-d} ${e},900`);
          maskShape2?.setAttribute('points', `600,900 ${600-e},900 600,${900-d}`);
          page1El.style.top = `${viewportY - containerRect.top - containerRect.height}px`;
          page1El.style.left = `${viewportX - containerRect.left}px`;
          page1El.style.transform = `rotate(${2*radian}rad)`;
        }
      });
    }
  }