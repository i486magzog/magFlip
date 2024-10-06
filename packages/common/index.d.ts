interface ISize {
    width: number;
    height: number;
}
interface ISizeExt {
    width: number;
    height: number;
    readonly diagonal: number;
}
declare class SizeExt implements ISizeExt {
    width: number;
    height: number;
    readonly diagonal: number;
    constructor(w: number, h: number);
}
interface IBookSize {
    closed: ISizeExt;
    opened: ISizeExt;
}
declare class BookSize {
    closed: ISizeExt;
    opened: ISizeExt;
    constructor(size: IBookSize);
}

type Listener = (...args: any[]) => void;
declare class MZEvent {
    private listeners;
    addEventListener(event: string, listener: Listener): void;
    removeEventListener(event: string, listener: Listener): void;
    emitEvent(event: string, ...args: any[]): void;
}

interface IPublication {
    name: string;
    location: string;
    publishedDate: string;
}
declare enum PageType {
    Page = "Page",
    Cover = "Cover",
    Empty = "Empty",
    Blank = "Blank"
}
declare enum DefaultSize {
    bookWidth = 600,
    bookHeight = 900,
    pageWidth = 600,
    pageHeight = 900
}
declare enum BookType {
    Book = "Book",
    Magazine = "Magazine",
    Newspaper = "Newspaper"
}
declare enum BookStatus {
    Open = "Open",
    Close = "Close"
}
declare enum EventStatus {
    None = 0,
    AutoFlip = 8,
    AutoFlipFromCorner = 12,
    AutoFlipToCorner = 10,
    Flipping = 128,
    SnappingBack = 144,
    FlippingForward = 160,
    FlippingBackward = 192,
    Dragging = 2048
}
declare enum Zone {
    LT = 66,
    LC = 34,
    LB = 18,
    RT = 65,
    RC = 33,
    RB = 17,
    Left = 2,
    Right = 1,
    Top = 64,
    Center = 32,
    Bottom = 16
}
declare enum AutoFlipType {
    FixedWidth = 0,
    MouseCursor = 1
}
declare enum ViewerType {
    Flipping = "flipping",
    Scrolling = "scrolling"
}
interface IZoneEventParams {
    zone: Zone;
}
interface IEventHandlers {
    clicked: (event: Event, param: any) => void;
    mousemoved: (event: Event, param: any) => void;
}
interface IPoint {
    x: number;
    y: number;
}
interface IBox {
    x: number;
    y: number;
    width: number;
    height: number;
}
interface IBookData {
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
    readonly size?: IBookSize;
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
interface IBook extends IBookData {
    fetchPage(index: number): Promise<IPageData>;
    fetchPages(indexRange: {
        start: number;
        cnt: number;
    }): Promise<IPageData[]>;
    importPages(pages: IPageData[], size: ISize): void;
    addPage(page: IPage, index: number): void;
    removePage(index: number): void;
    getPage(index: number): IPage;
    getPages(): {
        [n: string]: IPage;
    };
    getPageCnt(): number;
    getPageEl(index: number): HTMLElement;
    createEmptyPage(index: number, size?: ISize): IPage;
    resetBook(): Promise<void>;
}
interface IBookEl {
    readonly elementOnShelf: HTMLElement;
    readonly element: HTMLElement;
    readonly pageContainerEl: HTMLElement;
    appendPageEl(pageEl: HTMLElement): void;
    prependPageEl(pageEl: HTMLElement): void;
    removePageEl(pageEl: HTMLElement): void;
}
interface IPage extends IPageData, IPageEl {
    setEvents(): void;
}
interface IPageEl {
    readonly element: HTMLElement;
    readonly contentContainerEl: HTMLElement;
    readonly contentEl: HTMLElement;
    resetPageEls(): void;
}
interface IPageData {
    id: string;
    type?: PageType;
    size?: ISize;
    index: number;
    number?: number | undefined;
    ignore?: boolean;
    content?: any;
    image?: string;
}
interface IBookView {
    readonly id: string;
    readonly bookContainerEl: HTMLElement;
    getBookContainerEl(): HTMLElement;
    view(book: IBookData, openPageIndex?: number): HTMLElement;
    closeViewer(): void;
}

interface ILine {
    p1: Point;
    p2: Point;
}
interface ITopBottom {
    top: number;
    bottom: number;
}
interface ILeftRight {
    left: number;
    right: number;
}
interface IRect extends ITopBottom, ILeftRight {
    width: number;
    height: number;
}
declare class Point implements IPoint {
    x: number;
    y: number;
    constructor(point?: IPoint);
    toString(): string;
}
declare class Line {
    p1: Point;
    p2: Point;
    constructor(p1: Point, p2: Point);
}
declare class Rect implements IRect {
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
    private center;
    constructor(rect?: IRect);
    get leftTop(): {
        x: number;
        y: number;
    };
    get leftCenter(): {
        x: number;
        y: number;
    };
    get leftBottom(): {
        x: number;
        y: number;
    };
    get rightTop(): {
        x: number;
        y: number;
    };
    get rightCenter(): {
        x: number;
        y: number;
    };
    get rightBottom(): {
        x: number;
        y: number;
    };
    get centerTop(): {
        x: number;
        y: number;
    };
    get centerCenter(): Point;
    get centerBottom(): {
        x: number;
        y: number;
    };
}

/**
 * This is Magzog Math object that contains math util-methods.
 */
declare class MZMath {
    /**
     * Finds the symmetric point of a given target point with respect to a reference origin point.
     *
     * This function calculates the point that is symmetric to the target point,
     * using the origin point as the reference. The symmetric point is determined by
     * reflecting the target point across the origin.
     *
     * @param {Object} originPoint - The reference point for symmetry, containing x and y coordinates.
     * @param {Object} targetPoint - The point for which the symmetric point is calculated, containing x and y coordinates.
     * @returns {Object} - The symmetric point with x and y coordinates.
     */
    static findSymmetricPoint(originPoint: Point, targetPoint: Point): Point;
    /**
     * Get degree.
     * 0 <= degree <= 180 or 0 < degree < -180
     * @param startPoint
     * @param destPoint
     * @returns
     */
    static getDegree(startPoint: Point, destPoint: Point): number;
    /**
     * Get degree.
     * 0 <= degree
     * @param startPoint
     * @param destPoint
     * @returns
     */
    static getDegreePositive(startPoint: Point, destPoint: Point): number;
    /**
     * Get radian angle.
     * 0 <= radian <= pi or 0 < radian < -pi
     * @param startPoint
     * @param destPoint
     * @returns
     */
    static getRadian(startPoint: Point, destPoint: Point): number;
    /**
     * Get radian angle.
     * 0 <= radian
     * @param startPoint
     * @param destPoint
     * @returns
     */
    static getRadianPositive(startPoint: Point, destPoint: Point): number;
    /**
     * Returns the global location and size of the input element.
     * @param el
     * @returns
     */
    static getOffset(el: HTMLDivElement): {
        top: number;
        left: number;
        width: number;
        height: number;
        bottom: number;
        right: number;
    };
    /**
     * Ignore the scroll position.
     * @param el
     * @returns
     */
    static getOffset4Fixed(el: HTMLElement): Rect;
    /**
     * Returns the length between two points.
     * @param point1
     * @param point2
     * @returns
     */
    static getLength(point1: Point, point2: Point): number;
    /**
     * Find a point on line AB that is a fixed distance from point A toward point B.
     * @param a
     * @param b
     * @param distance
     * @returns
     */
    static findPointOnLine(a: Point, b: Point, distance: number): Point;
    /**
     * Calculates and returns the coordinates of point D, where the perpendicular from point C meets the line segment AB.
     * @param line line
     * @param c
     * @returns
     */
    static findPerpendicularFoot(line: Line, c: Point): Point;
}

export { AutoFlipType, BookSize, BookStatus, BookType, DefaultSize, EventStatus, type IBook, type IBookData, type IBookEl, type IBookSize, type IBookView, type IBox, type IEventHandlers, type ILeftRight, type ILine, type IPage, type IPageData, type IPageEl, type IPoint, type IPublication, type IRect, type ISize, type ISizeExt, type ITopBottom, type IZoneEventParams, Line, MZEvent, MZMath, PageType, Point, Rect, SizeExt, ViewerType, Zone };
