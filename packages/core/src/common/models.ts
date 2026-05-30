import { IBookSize, ISize } from "./dimension";
import { Rect } from "./shape";

/**
 * Deeply required type.
 */
export type DeepRequired<T> = Required<{
  [K in keyof T]: T[K] extends Required<T[K]> ? T[K] : DeepRequired<T[K]>
}>
/**
 * Publication data.
 * 하나의 책에 들어갈 수 있는 출판사 정보.
 */
export interface IPublication {
  /**
   * Name of the publication.
   */
  name: string;
  /**
   * Location of the publication.
   */
  location: string;
  /**
   * Published date of the publication.
   */
  publishedDate: string;
}
/**
 * Page type.
 */
export enum PageType {
  Page = "Page",
  Cover = "Cover",
  Empty = "Empty",
  Blank = "Blank",
}
/**
 * Page label type.
 */
export enum PageLabelType {
  Default = "Default",
  Empty = "Empty",
}
/**
 * Default size of the book.
 */
export enum DefaultSize {
  bookWidth = 600,
  bookHeight = 900,
  pageWidth = 600,
  pageHeight = 900,
}
/**
 * Book type.
 */
export enum BookType {
  Book = "Book",
  Magazine = "Magazine",
  Newspaper = "Newspaper",
}
/**
 * Book status.
 */
export enum BookStatus {
  Open = "Open",
  Close = "Close",
}
/**
 * Flipping event status.
 * TODO: FlipEventStatus 로 변경 필요.
 * TODO: FlipView 패키지로 옮길 필요 있음.
 */
export enum EventStatus {
  /**
   * No event.
   */
  None = 0b0000_0000,
  /**
   * Auto flip event.
   * 페이지 자동 넘기기 진행중
   */
  AutoFlip = 0b0000_1000,
  /**
   * FlipZone 영역에 마우스가 들어가 있는 상태(MouseEnter)로
   * 이때 페이지의 코너가 마우스 포인트 위치로 따라 다니는 애니메이션 진행중
   */
  AutoFlipFromCorner = 0b0000_1100,
  /**
   * FlipZone 영역에 마우스가 나온 상태(MouseLeave)로
   * 마우스를 따라다니던 페이지의 코너가 원래 위치로 돌아가는 애니메이션 진행중
   */
  AutoFlipToCorner = 0b0000_1010,
  /**
   * Flipping event.
   * 자동으로 책장이 넘어가는 애니메이션이 진행중인 상태.
   */
  Flipping = 0b1000_0000,
  /**
   * 페이지를 넘기기 위해 마우스로 드래그 하다가 마우스를 놓은 상태(MouseUp)로
   * 원래 위치로 페이지가 자동으로 넘어가는 애니메이션 진행중
   */
  SnappingBack = 0b1001_0000,
  /**
   * 페이지를 넘기기 위해 마우스로 드래그 하다가 마우스를 놓은 상태(MouseUp)로
   * Page Index 가 높아지는 방향의 페이지로 페이지가 자동으로 넘어가는 애니메이션 진행중
   */
  FlippingForward = 0b1010_0000,
  /**
   * 페이지를 넘기기 위해 마우스로 드래그 하다가 마우스를 놓은 상태(MouseUp)로
   * Page Index 가 낮아지는 방향의 페이지로 페이지가 자동으로 넘어가는 애니메이션 진행중
   */
  FlippingBackward = 0b1100_0000,
  /**
   * 페이지를 넘기기 위해 MouseDown 한 상태 또는 MouseDown 후 드래그 하는 상태
   */
  Dragging = 0b1000_0000_0000,
}
/**
 * Flipping 을 위한 이벤트 Zone.
 * TODO: 이름을 FlipEventZone 으로 변경 필요.
 * TODO: Zone 패키지로 옮길 필요 있음.
 */
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
/**
 * Flipping Zone 에 마우스가 있거나 마우스가 해당 Zone 을 나가능 경우
 * 발생하는 Auto Flip 효과의 종류
 */
export enum AutoFlipType {
  /**
   * 마우스가 Flipping Zone 들어 왔을 때 
   * 해당 코너가 고정된 크기로 정해진 위치까지 Flipping 하는 타입
   */
  FixedWidth=0,
  /**
   * 마우스가 Flipping Zone 들어 왔을 때 
   * 해당 코너가 마우스 포인트 위치까지 Flipping 하는 타입
   */
  MouseCursor=1,
}
/**
 * Viewer type.
 */
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
/**
 * Data of the page label.
 */
export interface IPageLabelData {
  /**
   * Index of the label.
   */
  index: number;
  /**
   * Index of the page in the book.
   */
  pageIndex: number;
  /**
   * Type of the label.
   */
  type?: PageLabelType;
  /**
   * Size of the label sub container.
   */
  size?: ISize;
  /**
   * Top position of the label sub container.
   */
  top?: number;
  /**
   * Whether to ignore the page label when displaying the book.
   */
  ignore?: boolean;
  /**
   * Content of the label.
   */
  content?: any;
  /**
   * Background color of the label.
   */
  backgroundColor?: string;
  /**
   * Opacity of the label.
   */
  opacity?: number | string;
  /**
   * Click event handler of the label.
   */
  onClick?: (pageIndex: number) => void;
}
/**
 * Element of the page label.
 */
export interface IPageLabelEl {
  readonly element: HTMLElement;
  // readonly contentContainerEl: HTMLElement;
  readonly contentEl: HTMLElement;
  resetLabelEls():void;
}
/**
 * Page class
 */
export interface IPage extends IPageData, IPageEl {
  size: ISize;
  setEvents():void;
}
/**
 * Element of the page.
 */
export interface IPageEl {
  readonly element: HTMLElement;
  readonly contentContainerEl: HTMLElement;
  readonly contentEl: HTMLElement;
  resetPageEls():void;
}
/**
 * Data of the page.
 */
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