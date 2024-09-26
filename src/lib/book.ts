import { IBookData, BookStatus, BookType, IPublication, DefaultSize, IPageData, PageType } from "./models.js";
import { BookEl } from "./bookEl.js";
import { Page } from "./page.js";
import { BookSize, ISize, SizeExt } from "./dimension.js";

/**
 * Book class
 */
export class Book extends BookEl implements IBookData {
  /**
   * Returns the book id.
   */
  readonly id: string;
  /**
   * Returns and sets the book status such as close, open and so on.
   */
  status: BookStatus;
  /**
   * Returns and sets the book type.
   */
  type: BookType;
  /**
   * Returns the book's title.
   */
  readonly title: string;
  /**
   * Returns the book's author.
   */
  readonly author: string;
  /**
   * Returns the book's publication.
   */
  readonly publication: IPublication;
  /**
   * Returns the book's size.
   */
  readonly size:BookSize;
  /**
   * Return the last page index.
   */
  readonly lastPageIndex: number;
  /**
   * Returns and sets pages that the book contains
   */
  private pages: { [n:number|string]: Page };
  thumbnails: {
    spine: string;
    small: string;
    medium: string;
    cover: {
      front: string;
      back: string;
    };
  };

  constructor(book:IBookData) {
    super(book.size.closed, book.thumbnails);
    // TODO: id should be unique and exist.
    this.id = book.id;
    this.status = BookStatus.Close;
    this.type = book.type || BookType.Book;
    this.title = book.title || "Title";
    this.author = book.author || "Author";
    this.publication = book.publication || {
      name: "Publisher",
      location: "Location",
      publishedDate: "Published Date"
    };
    this.size = new BookSize(book.size) || {
      closed: new SizeExt(DefaultSize.bookWidth, DefaultSize.bookHeight),
      opened: new SizeExt(DefaultSize.bookWidth*2, DefaultSize.bookHeight)
    };
    this.lastPageIndex = book.lastPageIndex;
    this.pages = {};
    this.thumbnails = book.thumbnails || {
      spine: "resources/default_spine.webp",
      small: "resources/default_small.webp",
      medium: "resources/default_medium.webp",
      cover: {
        front: "resources/default_front_cover.webp",
        back: "resources/default_back_cover.webp",
      }
    };
    //
    // Create initial pages
    //
    this.createInitialPages();
  }
  /**
   * Creats empty pages to fill the book viewer for flipping effect.
   */
  createInitialPages() {
    this.createEmptyPage(-3);
    this.createEmptyPage(-2);
    this.createEmptyPage(-1);
  }
  /**
   * Fetches and adds a page from server.
   * @param index 
   * @returns 
   */
  async fetchPage(index: number):Promise<IPageData>{
    // TODO: fecth page from the server
    const pageSample:IPageData = {
      id: `page${index}`,
      type: PageType.Page,
      size: { width: 600, height: 900 },
      index: index,
      number: undefined,
      ignore: false,
      content: "",
    };
    const page = new Page(pageSample);
    this.addPage(page, index);

    return new Promise((resolve, reject) => {
      resolve(pageSample);
    })
  }
  /**
   * Fetches and adds pages from server.
   * @param indexRange the indice of the pages to fetches
   * @returns 
   */
  async fetchPages(indexRange: {start:number, cnt:number}):Promise<IPageData[]>{
    let startIndex = indexRange.start;
    // if start index is negative set it as zero.
    if(startIndex < 0){ startIndex = 0; }
    // TODO: fecth page from the server
    const pageSamples:IPageData[] = [];
    const maxIndex = startIndex + indexRange.cnt;
    for(let i=startIndex; i<maxIndex; i++){
      // TODO: if the page is already loaded, do not fetch the page.
      if(this.pages[i]){ continue; }

      pageSamples.push({
        id: `page${i}`,
        type: PageType.Page,
        size: { width: 600, height: 900 },
        index: i,
        number: undefined,
        ignore: false,
        content: ""
      },);
    }

    pageSamples.forEach((pageSample) => {
      const page = new Page(pageSample, { 
        clicked: this.pageClicked,
        mousemoved: this.pageActive
      });
      this.addPage(page, page.index);
    });

    return new Promise((resolve, reject) => {
      resolve(pageSamples);
    })
  }
  /**
   * Adds a page object to the book.
   * @param page 
   * @param index 
   */
  addPage(page: Page, index: number) { this.pages[index] = page; }
  /**
   * Remove a page object from the book.
   * @param index 
   */
  removePage(index: number) { delete this.pages[index]; }
  /**
   * Returns the page object with the page index.
   * @param index 
   * @returns 
   */
  getPage(index: number){ return this.pages[index]; }
  /**
   * Returns the pages object.
   * @returns 
   */
  getPages(){ return this.pages; }
  /**
   * Return the pages array length.
   */
  getPageCnt(){ return Object.keys(this.pages).length; }
  /**
   * Returns the page element with the page index.
   * @param index 
   * @returns 
   */
  getPageEl(index: number):HTMLElement { return this.pages[index].element; }
  /**
   * Creates and adds an empty page object.
   * @param index 
   * @param size 
   * @returns 
   */
  createEmptyPage(index:number, size?:ISize){
    const page = Page.emptyPage(index, size || this.size.closed)
    this.addPage(page, index);
    return page;
  }
  pageClicked = (event:Event, param:any) => { }
  pageActive = (event:Event, param:any) => { }
}
