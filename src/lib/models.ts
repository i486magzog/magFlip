export interface Size {
  width: number;
  height: number;
}
// export interface IPageSize {
//   width: number;
//   height: number;
// }

export interface BookSize {
  closed: Size
  opened: Size
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
  None = "none",
  AutoFlipInCorner = "autoFlipInCorner",
  AutoFlipOutCorner = "autoFlipOutCorner",
  Flipping = "flipping",
  FlippingOut = "flippingOut"
}

export enum Zone {
  LT="lt",
  LC="lc",
  LB="lb",
  RT="rt",
  RC="rc",
  RB="rb"
}

export interface ZoneEventParams {
  zone: Zone,
  // backPage1El: HTMLElement,
  // backPage2El: HTMLElement 
}

export interface EventHandlers {
  clicked: (event:Event, param:any)=>void
  mousemoved: (event:Event, param:any)=>void
}

export interface Gutter {
  topPoint:Point;
  bottomPoint:Point;
  rect: Rect;
}

export class Gutter implements Gutter {
  constructor(){
    this.topPoint = new Point();
    this.bottomPoint = new Point();
    this.rect = new Rect();
  }
}

export interface Point {
  x: number,
  y: number
}
export class Point implements Point{
  constructor(){
    this.x = 0;
    this.y = 0;
  }
}
export interface TopBottom{
  top: number,
  bottom: number,
}
export interface LeftRight{
  left: number,
  right: number,
}
export interface Rect extends TopBottom, LeftRight {
  width: number,
  height: number,
}
export class Rect implements Rect {
  width:number;
  height:number;
  constructor(){
    this.width = 0;
    this.height = 0;
  }
}
export interface Box {
  x: number,
  y: number,
  width: number,
  height:number
}

export interface IBookData {
  id: string;
  status: BookStatus;
  title: string;
  author: string;
  type: BookType;
  publication?: IPublication;
  /**
   * The book size when it is close.
   */
  size:BookSize;
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
  size: Size;
  index: number;      // index of the page in the book
  number: number | undefined;  // displayed number of the page in the book
  ignore: boolean;    // ignore the page when displaying the book
  content: any;
}
