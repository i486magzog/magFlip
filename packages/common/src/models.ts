// import { Book } from "../../core/src/book";
// import { BookShelfManager } from "../../core/src/bookShelfManager";
// import { BookViewer } from "../../core/src/bookViewer";
import { IBookSize, ISize } from "./dimension";
import { Rect } from "./shape";


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
  bookWidth = 600,
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

export enum EventStatus {
  None = 0b0000_0000,
  
  AutoFlip = 0b0000_1000,
  AutoFlipFromCorner = 0b0000_1100,
  AutoFlipToCorner = 0b0000_1010,
  
  Flipping = 0b1000_0000,
  SnappingBack = 0b1001_0000,
  FlippingForward = 0b1010_0000,
  FlippingBackward = 0b1100_0000,
  
  Dragging = 0b1000_0000_0000,
}

export enum Zone {
  LT=0b0100_0010,
  LC=0b0010_0010,
  LB=0b0001_0010,
  RT=0b0100_0001,
  RC=0b0010_0001,
  RB=0b0001_0001,
  Left=0b0000_0010,
  Right=0b0000_0001,
  Top=0b0100_0000,
  Center=0b0010_0000,
  Bottom=0b0001_0000,
}

export enum AutoFlipType {
  FixedWidth=0,
  MouseCursor=1,
}

export enum ViewerType {
  Flipping="flipping",
  Scrolling="scrolling"
}

export interface IZoneEventParams {
  zone: Zone,
  // backPage1El: HTMLElement,
  // backPage2El: HTMLElement 
}

export interface IEventHandlers {
  clicked: (event:Event, param:any)=>void
  mousemoved: (event:Event, param:any)=>void
}

export interface IPoint {
  x: number,
  y: number
}

export interface IBox {
  x: number,
  y: number,
  width: number,
  height:number
}

export interface IBookData {
  id: string;
  status?: BookStatus;
  title?: string;
  author?: string;
  type?: BookType;
  publication?: IPublication;
  lastPageIndex: number;
  /**
   * The book size when it is close.
   */
  readonly size?:IBookSize;
  thumbnails?: {
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
  type?: PageType;
  size?: ISize;
  index: number;      // index of the page in the book
  number?: number | undefined;  // displayed number of the page in the book
  ignore?: boolean;    // ignore the page when displaying the book
  content?: any;
  image?: string;
}

export interface IBookView {
  readonly id: string;
  // private book: Book|undefined;
  readonly bookContainerEl: HTMLElement;
  getBookContainerEl():HTMLElement;
  view(book:IBookData, openPageIndex?:number):HTMLElement;
  closeViewer():void;
}