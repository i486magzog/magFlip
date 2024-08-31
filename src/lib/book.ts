import { IBookData, BookStatus, BookType, IPublication, IBookSize, DefaultSize, IPageData, PageType } from "./models.js";
import { Page } from "./page.js";

/**
 * Book class
 */
export class Book implements IBookData {
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
  elementOnShelf: Element;
  element: Element;
  pageContainerEl: Element;

  constructor(book:IBookData) {
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
    this.size = book.size || { width: DefaultSize.bookWidth, height: DefaultSize.bookHeight };
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
    // Element creation
    //
    const elements = this.createBookElement();
    this.elementOnShelf = elements.bookOnShelfEl;
    this.element = elements.bookEl;
    this.pageContainerEl = elements.containerEl;
    //
    // Create initial pages
    //
    this.createInitialPages();
  }

  createInitialPages() {
    this.addPage(Page.emptyPage(-3), -3);
    this.addPage(Page.emptyPage(-2), -2);
    this.addPage(Page.emptyPage(-1), -1);
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
      const page = new Page(pageSample);
      this.addPage(page, page.index);
    });

    return new Promise((resolve, reject) => {
      resolve(pageSamples);
    })
  }

  setReadyToOpen() { 
    const el = this.element as HTMLDivElement;
    el.style.width = `${Math.round(this.size.width/2)}px`;
    el.style.height = `${this.size.height}px`;
    el.classList.add("ready-to-open");
  }
  addPage(page: Page, index: number) { this.pages[index] = page; }
  removePage(index: number) { delete this.pages[index]; }
  getPage(index: number){ return this.pages[index]; }
  getPageEl(index: number):Element { return this.pages[index].element; }
  clearPageEls() { this.pageContainerEl.innerHTML = ""; }
  appendPageEl(pageIndex: number) { this.pageContainerEl.appendChild(this.getPageEl(pageIndex)); }

  createBookElement(): { bookOnShelfEl: Element, bookEl: Element, containerEl: Element } {
    const bookOnShelfEl = document.createElement('div');
    bookOnShelfEl.className = "book-on-shelf";
    const coverEl = document.createElement('img');
    coverEl.src = this.thumbnails.medium;
    bookOnShelfEl.appendChild(coverEl);
    // <div class="book">
    //   <div class="container">
    // </div>
    const bookEl = document.createElement('div');
    const containerEl = document.createElement('div');
    bookEl.className = "book";
    bookEl.style.width = `${this.size.width}px`;
    bookEl.style.height = `${this.size.height}px`;
    containerEl.className = "container";
    bookEl.appendChild(containerEl);

    return { bookOnShelfEl: bookOnShelfEl, bookEl: bookEl, containerEl: containerEl };
  }
}
