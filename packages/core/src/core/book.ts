import { IBookData, BookStatus, BookType, IPublication, DefaultSize, IPageData, PageType, IBook, IPage, IPageLabel, IPageLabelData, DeepRequired } from "../common/models";
import { BookSize, ISize, SizeExt } from "../common/dimension";
import { BookEl } from "./bookEl";
import { Page } from "./page";
import { PageLabel } from "./pageLabel";
import { deepMerge } from "src/common/helper";


export type TRequiredBookData = DeepRequired<IBookData>;
export enum BookEvent {
  pageAdded = 'pageAdded',
}
/**
 * Book class
 */
export class Book extends BookEl implements IBook {
  private bookData:TRequiredBookData = {
    id: "book1",
    status: BookStatus.Close,
    type: BookType.Book,
    title: "",
    author: "",
    publication: {
      name: "",
      location: "",
      publishedDate: ""
    },
    lastPageIndex: 0,
    labels: {},
    size: {
      closed: new SizeExt(DefaultSize.bookWidth, DefaultSize.bookHeight),
      opened: new SizeExt(DefaultSize.bookWidth*2, DefaultSize.bookHeight)
    },
    thumbnails: {
      spine: "",
      small: "",
      medium: "",
      cover: {
        front: "",
        back: "",
      }
    }
  }
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
  private pages: { [n:number|string]: IPage };
  /**
   * Returns and sets the page labels.
   */
  private pageLabels: { [n:number|string]: PageLabel };
  /**
   * 
   */
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
    super(book);
    const bookdata = deepMerge(this.bookData, book) as TRequiredBookData;
    // TODO: id should be unique and exist.
    this.id = bookdata.id;
    this.status = BookStatus.Close;
    this.type = bookdata.type || BookType.Book;
    this.title = bookdata.title || "Title";
    this.author = bookdata.author || "Author";
    this.publication = bookdata.publication || {
      name: "Publisher",
      location: "Location",
      publishedDate: "Published Date"
    };
    this.size = new BookSize(bookdata.size|| {
      closed: new SizeExt(DefaultSize.bookWidth, DefaultSize.bookHeight),
      opened: new SizeExt(DefaultSize.bookWidth*2, DefaultSize.bookHeight)
    });
    this.lastPageIndex = bookdata.lastPageIndex%2 == 0 ? bookdata.lastPageIndex+1: bookdata.lastPageIndex ;
    this.pages = {};
    this.pageLabels = {};
    Object.keys(bookdata.labels || {}).forEach(pageIndex => {
      this.pageLabels[pageIndex] = new PageLabel(bookdata.labels[pageIndex]);
    });
    this.thumbnails = bookdata.thumbnails || {
      spine: "resources/default_spine.webp",
      small: "resources/default_small.webp",
      medium: "resources/default_medium.webp",
      cover: {
        front: "resources/default_front_cover.webp",
        back: "resources/default_back_cover.webp",
      }
    };
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
      image: `./resources/page${index}.jpg`
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
    const pageSamples:IPageData[] = [];
    let maxIndex = startIndex + indexRange.cnt;
    if(maxIndex > this.lastPageIndex){ maxIndex = this.lastPageIndex; }

    // TODO: fecth page from the server
    for(let i=startIndex; i<maxIndex; i++){
      // If the page is already loaded, do not fetch the page.
      if(this.pages[i]){ continue; }

      pageSamples.push({
        id: `page${i}`,
        type: PageType.Page,
        size: { width: 600, height: 900 },
        index: i,
        number: undefined,
        ignore: false,
        content: "",
        image: `./resources/page${i}.jpg`
      },);
    }

    pageSamples.forEach((pageSample) => {
      const page = new Page(pageSample);
      this.addPage(page, page.index);
    });

    return new Promise((resolve, reject) => {
      resolve(pageSamples);
    })
  }

  importPages(pages:IPageData[], size: ISize){
    this.size.closed = new SizeExt(size.width, size.height);
    this.size.opened = new SizeExt(size.width*2, size.height);
    pages.forEach(pageData => {
      const page = new Page(pageData);
      this.addPage(page, page.index);
    })
  }
  /**
   * Adds a page object to the book.
   * @param page 
   * @param index 
   */
  addPage(page: IPage, index: number) {
    this.pages[index] = page;
    this.emitEvent(BookEvent.pageAdded, page);
  }
  /**
   * Remove a page object from the book.
   * @param index 
   */
  removePage(index: number) { 
    delete this.pages[index];
  }
  /**
   * Returns the page object with the page index.
   * @param index 
   * @returns 
   */
  getPage(index: number, emptyPage:boolean = false){ return this.pages[index] || (emptyPage ? this.createEmptyPage(index) : undefined); }
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
  /**
   * Sets the events for the book.
   * @param event 
   * @param handler 
   */
  setEvents(event:BookEvent, handler:(event:Event)=>void){

  }

  resetBook():Promise<void>{
    return new Promise((resolve, reject) => {
      this.element.removeAttribute('style');
      this.resetBookEls();
      for(const idxStr in this.pages){ 
        const page = this.pages[idxStr];
        if(page.type == PageType.Empty){ this.removePage(Number(idxStr)); }
        page.resetPageEls(); 
      }
      resolve();
    })
  }
}
