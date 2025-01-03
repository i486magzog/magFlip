// import { Book } from "../../core/src/book";
// import { BookShelfManager } from "../../core/src/bookShelfManager";
// import { BookViewer } from "../../core/src/bookViewer";
import { IBookSize, ISize } from "./dimension";
import { Rect } from "./shape";


export type DeepRequired<T> = Required<{
  [K in keyof T]: T[K] extends Required<T[K]> ? T[K] : DeepRequired<T[K]>
}>

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

export enum PageLabelType {
  Default = "Default",
  Empty = "Empty",
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
  labels?:{ [n:number|string]: IPageLabelData };
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

export interface IBook extends IBookData {
  fetchPage(index: number):Promise<IPageData>;
  fetchPages(indexRange: {start:number, cnt:number}):Promise<IPageData[]>;
  importPages(pages:IPageData[], size: ISize):void;
  addPage(page: IPage, index: number):void;
  removePage(index: number):void;
  getPage(index: number):IPage;
  getPages():{ [n:string]: IPage };
  getPageCnt():number;
  getPageEl(index: number):HTMLElement;
  createEmptyPage(index:number, size?:ISize):IPage;
  // setEvents(event:BookEvent, handler:(event:Event)=>void):void;
  resetBook():Promise<void>;
}

export interface IBookEl {
  readonly elementOnShelf: HTMLElement;
  readonly element: HTMLElement;
  readonly pageContainerEl: HTMLElement;
  
  appendPageEl(pageEl:HTMLElement):void;
  prependPageEl(pageEl:HTMLElement):void;
  removePageEl(pageEl:HTMLElement):void;
}

export interface IPageLabel extends IPageLabelData, IPageLabelEl {
  setEvents():void;
}
export interface IPageLabelData {
  index: number;    // index of the label
  pageIndex: number; // index of the page in the book
  type?: PageLabelType;
  size?: ISize;     // size of the label sub container
  top?: number;
  ignore?: boolean; // ignore the page when displaying the book
  content?: any;
  backgroundColor?: string;
  opacity?: number | string;
  onClick?: (pageIndex: number) => void;
}

export interface IPageLabelEl {
  readonly element: HTMLElement;
  // readonly contentContainerEl: HTMLElement;
  readonly contentEl: HTMLElement;
  resetLabelEls():void;
}


export interface IPage extends IPageData, IPageEl {
  size: ISize;
  setEvents():void;
}

export interface IPageEl {
  readonly element: HTMLElement;
  readonly contentContainerEl: HTMLElement;
  readonly contentEl: HTMLElement;
  resetPageEls():void;
}

export interface IPageData {
  id: string;
  type?: PageType;
  size?: ISize;
  index: number; // index of the page in the book
  number?: number | undefined;  // displayed number of the page in the book
  ignore?: boolean; // ignore the page when displaying the book
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
  zoom(zoomLevel:number):void;
  nextPage(offsetY?:number):void;
  prevPage(offsetY?:number):void;
  moveTo(pageIndex:number, offsetY?:number):void;
}