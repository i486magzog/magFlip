import { MZEvent, IPage } from '@magflip/core';
/**
 * Page Window Interface
 */
interface IPageWindow {
  page: IPage | undefined;
}
/**
 * PageWindow class
 */
export class PageWindow extends MZEvent {
  /**
   * Window array that contains active pages regarding flipping.
   */
  windows: IPageWindow[];
  /**
   * Window array size. The default value is 6.
   */
  readonly windowSize: number = 6;

  constructor(){
    super();
    this.windows = [];
    for(let i=0; i<this.windowSize; i++){
      this.windows[i] = ({ page: undefined });
    }
  }
  /**
   * Loads and adds a page to the window.
   * @param index Window index
   * @param page 
   */
  loadPageToWindow(index: number, page: IPage) {
    this.windows[index].page = page;
  }
  /**
   * Loads and adds pages to the window.
   * @param pages The length of the pages should be 6.
   */
  loadPagesToWindow(pages: IPage[]) {
    for(let i=0; i<this.windowSize; i++){
      this.windows[i].page = pages[i];
    }
  }
  /**
   * Clears all pages on the window.
   */
  clearPageWindow(){
    this.windows = [];
    for(let i=0; i<this.windowSize; i++){
      this.windows[i] = ({ page: undefined });
    }
  }
  /**
   * Window moves to the right.
   * Before: ----[2][3][4][5][6][7]----------
   * After:  ----------[4][5][6][7][8][9]----
   * @param page4 
   * @param page5 
   */
  moveRight(page4: IPage, page5: IPage) {
    this.windows.shift();
    this.windows.shift();
    this.windows.push({ page: page4 });
    this.windows.push({ page: page5 });
  }
  /**
   * Window moves to the right.
   * Before: ----------[4][5][6][7][8][9]----
   * After:  ----[2][3][4][5][6][7]----------
   * @param page0 
   * @param page1 
   */
  moveLeft(page0: IPage, page1: IPage) {
    this.windows.pop();
    this.windows.pop();
    this.windows.unshift({ page: page1 });
    this.windows.unshift({ page: page0 });
  }
  /**
   * Get a page with window index.
   * @param index Window index
   * @returns 
   */
  getPageInWindow(index:number){ return this.windows[index].page; }
}