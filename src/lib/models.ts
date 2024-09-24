import { MZMath } from "./mzMath.js";

export interface ISize {
  width: number;
  height: number;
}

export interface ISizeExt {
  width: number;
  height: number;
  readonly diagonal: number;
}
export class SizeExt implements ISizeExt {
  width: number;
  height: number;
  readonly diagonal: number;
  constructor(w:number, h:number){
    this.width = w;
    this.height = h;
    this.diagonal = Math.sqrt(w**2+h**2);
  }
}
// export interface IPageSize {
//   width: number;
//   height: number;
// }

export interface IBookSize {
  closed: ISizeExt
  opened: ISizeExt
}

export class BookSize {
  closed: ISizeExt;
  opened: ISizeExt;
  constructor(size:IBookSize){
    this.closed = new SizeExt(size.closed.width, size.closed.height);
    this.opened = new SizeExt(size.opened.width, size.opened.height);
  }
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
export class Point implements IPoint{
  x:number;
  y:number;
  constructor(point?:IPoint){
    this.x = point?.x || 0;
    this.y = point?.y || 0;
  }
  toString(): string { return `${this.x},${this.y}`; }
}
export interface ILine {
  p1:Point
  p2:Point
}
export class Line {
  p1:Point
  p2:Point
  constructor(p1:Point, p2:Point){
    this.p1 = p1;
    this.p2 = p2;
  }
}
export interface ITopBottom{
  top: number,
  bottom: number,
}
export interface ILeftRight{
  left: number,
  right: number,
}
export interface IRect extends ITopBottom, ILeftRight {
  width: number,
  height: number,
}
export class Rect implements IRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width:number;
  height:number;
  private center: Point;

  constructor(rect?:IRect){
    this.left = rect?.left || 0;
    this.right = rect?.right || 0;
    this.top = rect?.top || 0;
    this.bottom = rect?.bottom || 0;
    this.width = rect?.width || 0;
    this.height = rect?.height || 0;
    this.center = new Point({x:(this.left + this.right)/2, y:(this.top+this.bottom)/2})
  }
  get leftTop(){ return { x: this.left, y:this.top } }
  get leftCenter(){ return { x: this.left, y:this.center.y } }
  get leftBottom() { return { x: this.left, y:this.bottom } }
  get rightTop(){ return { x: this.right, y:this.top } }
  get rightCenter() { return { x: this.right, y:this.center.y } }
  get rightBottom() { return { x: this.right, y:this.bottom } }
  get centerTop() { return { x: this.center.x, y: this.top } }
  get centerCenter() { return this.center }
  get centerBottom() { return { x: this.center.x, y: this.bottom } }
}

export class Gutter extends Rect{
  constructor(gutter?:IRect){
    super(gutter as IRect);
  }
  get topPoint() { return {x:this.left, y:this.top} }
  get bottomPoint() { return {x:this.left, y:this.bottom} }
}

export class FlipActionLine {
  private _leftP:Point;
  private _rightP:Point;
  private _centerP:Point;
  leftX:number;
  rightX:number;
  y:number;

  constructor(leftX:number = 0, rightX:number = 0, y:number = 0){
    this.leftX = leftX;
    this.rightX = rightX;
    this.y = y;
    this._leftP = { x: leftX, y: y };
    this._rightP =  { x: rightX, y: y };
    this._centerP = { x: (leftX + rightX)/2, y: y };
  }
  get leftP() { return this._leftP; }
  get rightP() { return this._rightP; }
  get centerP() { return this._centerP; }
}


export class FlipDiagonal {
  private _length: number = 0;
  private _radian: number = 0;
  get length() { return this._length; }
  get radian(){ return this._radian; }

  constructor(startP:Point, endP:Point){
    this._length = MZMath.getLength(startP, endP);
    this._radian = MZMath.getRadianPositive(startP, endP);
  }
}
export class FlipDiagonals {
  area1:{
    length: number
    radian: {
      low: number
      high: number
    }
  };
  area2: {
    length: number
    radian: {
      low: number
      high: number
    }
  };

  area3: {
    length: number
    radian: {
      low: number
      high: number
    }
  }

  area4: {
    length: number
    radian: {
      low: number
      high: number
    }
  }

  /**
   * 
   * @param rect The container that book is spread open.
   * @param actionCenter The center of FlipActionLine.
   */
  constructor(rect?:Rect, actionCenter?:Point){
    const zeroP = new Point();
    const centerLeftP = { x: rect?.left || 0, y:actionCenter?.y || 0 }
    const centerRightP = { x: rect?.right || 0, y:actionCenter?.y || 0 }
    const centerTop = rect?.centerTop || zeroP;
    const centerBottom = rect?.centerBottom || zeroP;
    //
    const diagonalLeftInArea1 = new FlipDiagonal(centerBottom, centerLeftP);
    const diagonalRightInArea1 = new FlipDiagonal(centerBottom, centerRightP);
    const diagonalLeftInArea2 = new FlipDiagonal(centerTop, centerLeftP);
    const diagonalRightInArea2 = new FlipDiagonal(centerTop, centerRightP);

    const area3RadianLow = diagonalRightInArea1.radian;
    const area3RadianHigh = diagonalRightInArea2.radian || 2 * Math.PI;
    if(area3RadianHigh < area3RadianLow){

    }
    // Upper side
    this.area1 = {
      length: diagonalLeftInArea1.length,
      radian: {
        low: diagonalLeftInArea1.radian,
        high: diagonalRightInArea1.radian || 2 * Math.PI,
      }
    };
    // Lower side
    this.area2 = {
      length: diagonalLeftInArea2.length,
      radian: {
        low: diagonalRightInArea2.radian,
        high: diagonalLeftInArea2.radian,
      }
    };
    // Right side
    this.area3 = {
      length: 0,
      radian: {
        low: diagonalRightInArea1.radian,
        high: diagonalRightInArea2.radian || 2 * Math.PI,
      }
    };
    // Left side
    this.area4 = {
      length: 0,
      radian: {
        low: diagonalLeftInArea2.radian,
        high: diagonalLeftInArea1.radian,
      }
    };
  }

}

export interface IFlipData {
  alpa: number;
  a:number;
  b:number;
  c:number;
  d:number;
  page2:{
    top: number;
    left: number;
    rotate: number;
  }
  mask:{
    page2:{
      p1:Point;
      p2:Point;
      p3:Point;
      p4:Point;
    }
    page1:{
      p1:Point;
      p2:Point;
      p3:Point;
      p4:Point;
    }
  }
  shadow: {
    closingDistance: number,
    rect:{
      rotate: number,
      origin: Point
    }
  };
}

export class FlipData implements IFlipData {
  alpa: number = 0;
  a:number = 0;
  b:number = 0;
  c:number = 0;
  d:number = 0;
  page2:{
    top: number;
    left: number;
    rotate: number;
  };
  mask:{
    page2:{
      p1:Point;
      p2:Point;
      p3:Point;
      p4:Point;
    }
    page1:{
      p1:Point;
      p2:Point;
      p3:Point;
      p4:Point;
    },
  };
  shadow: {
    closingDistance: number,
    rect:{
      rotate: number,
      origin: Point
    }
  };

  constructor(flipData:IFlipData){
    this.alpa = flipData.alpa;
    this.a = flipData.a;
    this.b = flipData.b;
    this.c = flipData.c;
    this.d = flipData.d;
    this.page2 = flipData.page2;
    this.mask = flipData.mask;
    this.shadow = flipData.shadow;
  }

  printPage2MaskShape(){
    const pg = this.mask.page2;
    return `${pg.p1.x},${pg.p1.y} ${pg.p2.x},${pg.p2.y} ${pg.p3.x},${pg.p3.y} ${pg.p4.x},${pg.p4.y}`;
  }

  printPage1MaskShape(){
    const pg = this.mask.page1;
    return `${pg.p1.x},${pg.p1.y} ${pg.p2.x},${pg.p2.y} ${pg.p3.x},${pg.p3.y} ${pg.p4.x},${pg.p4.y}`;
  }
}

export interface IBox {
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
  size: ISize;
  index: number;      // index of the page in the book
  number: number | undefined;  // displayed number of the page in the book
  ignore: boolean;    // ignore the page when displaying the book
  content: any;
}
