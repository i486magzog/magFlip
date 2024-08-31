export interface IPageSize {
  width: number;
  height: number;
}

export interface IBookSize {
  width: number;
  height: number;
}

export interface IPublication {
  name: string;
  location: string;
  publishedDate: string;
}

export enum PageType {
  Page = "Page",
  Cover = "Cover",
  Empty = "Empty",
  Blank = "Blank",
}

export enum DefaultSize {
  bookWidth = 1200,
  bookHeight = 900,
  pageWidth = 600,
  pageHeight = 900,
}

export enum BookType {
  Book = "Book",
  Magazine = "Magazine",
  Newspaper = "Newspaper",
}

export enum BookStatus {
  Open = "Open",
  Close = "Close",
}

export interface IBookData {
  id: string;
  status: BookStatus;
  title: string;
  author: string;
  type: BookType;
  publication?: IPublication;
  size:IBookSize;
  thumbnails: {
    spine: string;
    small: string;
    medium: string;
    cover: {
      front: string;
      back: string;
    };
  };
}

export interface IPageData {
  id: string;
  type: PageType;
  size: IPageSize;
  index: number;      // index of the page in the book
  number: number | undefined;  // displayed number of the page in the book
  ignore: boolean;    // ignore the page when displaying the book
  content: any;
}
