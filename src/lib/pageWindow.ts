import { Page } from './page.js';

/**
 * Page Window Interface
 */
interface IPageWindow {
  page: Page | undefined;
}
  
  
/**
 * PageWindow class
 */
export class PageWindow {
  windows: IPageWindow[];
  readonly windowSize: number = 6;

  constructor(){
    this.windows = [];
    for(let i=0; i<this.windowSize; i++){
      this.windows[i] = ({ page: undefined });
    }
  }
  /**
   * 
   * @param index Window index
   * @param page 
   */
  loadPageToWindow(index: number, page: Page) {
    this.windows[index].page = page;
  }
  /**
   * 
   * @param pages The length of the pages should be 6.
   */
  loadPagesToWindow(pages: Page[]) {
    for(let i=0; i<this.windowSize; i++){
      this.windows[i].page = pages[i];
    }
  }
  /**
   * Window moves to the right.
   * Before: ----[2][3][4][5][6][7]----------
   * After:  ----------[4][5][6][7][8][9]----
   * @param page4 
   * @param page5 
   */
  moveRight(page4: Page, page5: Page) {
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
  moveLeft(page0: Page, page1: Page) {
    this.windows.pop();
    this.windows.pop();
    this.windows.unshift({ page: page1 });
    this.windows.unshift({ page: page0 });
  }
}