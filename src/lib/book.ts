import { IBookData, BookStatus, BookType, IPublication, IBookSize, DefaultSize, IPageData, PageType, ISize } from "./models.js";
import { BookEl } from "./bookEl.js";
import { Page } from "./page.js";

/**
 * Book class
 */
export class Book extends BookEl implements IBookData {
  id: string;
  status: BookStatus;
  type: BookType;
  title: string;
  author: string;
  publication: IPublication;
  size: IBookSize;
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
  // 
  // elementOnShelf: HTMLElement;
  // element: HTMLElement;
  // pageContainerEl: HTMLElement;
  // flippingPageIndex: number = 0;

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
    this.size = book.size || {
      closed: { width: DefaultSize.bookWidth, height: DefaultSize.bookHeight },
      opened: { width: DefaultSize.bookWidth*2, height: DefaultSize.bookHeight }
    };
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

  createInitialPages() {
    this.createEmptyPage(-3);
    this.createEmptyPage(-2);
    this.createEmptyPage(-1);
    // this.addPage(Page.emptyPage(-3), -3);
    // this.addPage(Page.emptyPage(-2), -2);
    // this.addPage(Page.emptyPage(-1), -1);
  }

  async fetchPage(index: number):Promise<IPageData>{
    // TODO: fecth page from the server
    const pageSample:IPageData = {
      id: `page${index}`,
      type: PageType.Page,
      size: { width: 600, height: 900 },
      index: index,
      number: undefined,
      ignore: false,
      content: "This is a page content",
    };
    const page = new Page(pageSample);
    this.addPage(page, index);

    return new Promise((resolve, reject) => {
      resolve(pageSample);
    })
  }

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
        content: "This is a page content",
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

  // setReadyToOpen() { super.setReadyToOpen(this.size.closed); }
  // setSpreadOpen() { super.setSpreadOpen(this.size.opened); }
  // changeSize(){

  // }
  addPage(page: Page, index: number) { this.pages[index] = page; }
  removePage(index: number) { delete this.pages[index]; }
  getPage(index: number){ return this.pages[index]; }
  getPageEl(index: number):HTMLElement { return this.pages[index].element; }
  clearPageEls() { this.pageContainerEl.innerHTML = ""; }
  createEmptyPage(index:number, size?:ISize){
    const page = Page.emptyPage(index, size || this.size.closed)
    this.addPage(page, index);
    return page;
  }
  pageClicked(event:Event, param:any){ 
    // this.flippingPageIndex = (param as Page).index; 
  }
  pageActive(event:Event, param:any){ ; }
}
