import { Point, ISize, Rect, IRect, EventStatus, Zone, AutoFlipType, IBookView } from '@magflip/common';
import { Page, Book } from '@magflip/core';

declare class FlipActionLine {
    private _leftP;
    private _rightP;
    private _centerP;
    leftX: number;
    rightX: number;
    y: number;
    constructor(leftX?: number, rightX?: number, y?: number);
    get leftP(): Point;
    get rightP(): Point;
    get centerP(): Point;
}

interface IFlipData {
    alpa: number;
    a: number;
    b: number;
    c: number;
    d: number;
    page2: {
        top: number;
        left: number;
        rotate: number;
    };
    mask: {
        page2: {
            p1: Point;
            p2: Point;
            p3: Point;
            p4: Point;
        };
        page1: {
            p1: Point;
            p2: Point;
            p3: Point;
            p4: Point;
        };
    };
    shadow: {
        closingDistance: number;
        rect: {
            rotate: number;
            origin: Point;
        };
    };
}
declare class FlipData implements IFlipData {
    alpa: number;
    a: number;
    b: number;
    c: number;
    d: number;
    page2: {
        top: number;
        left: number;
        rotate: number;
    };
    mask: {
        page2: {
            p1: Point;
            p2: Point;
            p3: Point;
            p4: Point;
        };
        page1: {
            p1: Point;
            p2: Point;
            p3: Point;
            p4: Point;
        };
    };
    shadow: {
        closingDistance: number;
        rect: {
            rotate: number;
            origin: Point;
        };
    };
    constructor(flipData: IFlipData);
    printPage1MaskShape(): string;
    printPage2MaskShape(): string;
    printShadow6(bookSize: ISize): string;
}

declare class FlipDiagonal {
    private _length;
    private _radian;
    get length(): number;
    get radian(): number;
    constructor(startP: Point, endP: Point);
}

declare class FlipDiagonals {
    area1: {
        length: number;
        radian: {
            low: number;
            high: number;
        };
    };
    area2: {
        length: number;
        radian: {
            low: number;
            high: number;
        };
    };
    area3: {
        length: number;
        radian: {
            low: number;
            high: number;
        };
    };
    area4: {
        length: number;
        radian: {
            low: number;
            high: number;
        };
    };
    /**
     *
     * @param rect The container that book is spread open.
     * @param actionCenter The center of FlipActionLine.
     */
    constructor(rect?: Rect, actionCenter?: Point);
}

declare class Gutter extends Rect {
    constructor(gutter?: IRect);
    get topPoint(): {
        x: number;
        y: number;
    };
    get bottomPoint(): {
        x: number;
        y: number;
    };
}

/**
 * Page Window Interface
 */
interface IPageWindow {
    page: Page | undefined;
}
/**
 * PageWindow class
 */
declare class PageWindow {
    /**
     * Window array that contains active pages regarding flipping.
     */
    windows: IPageWindow[];
    /**
     * Window array size. The default value is 6.
     */
    readonly windowSize: number;
    constructor();
    /**
     * Loads and adds a page to the window.
     * @param index Window index
     * @param page
     */
    loadPageToWindow(index: number, page: Page): void;
    /**
     * Loads and adds pages to the window.
     * @param pages The length of the pages should be 6.
     */
    loadPagesToWindow(pages: Page[]): void;
    /**
     * Clears all pages on the window.
     */
    clearPageWindow(): void;
    /**
     * Window moves to the right.
     * Before: ----[2][3][4][5][6][7]----------
     * After:  ----------[4][5][6][7][8][9]----
     * @param page4
     * @param page5
     */
    moveRight(page4: Page, page5: Page): void;
    /**
     * Window moves to the right.
     * Before: ----------[4][5][6][7][8][9]----
     * After:  ----[2][3][4][5][6][7]----------
     * @param page0
     * @param page1
     */
    moveLeft(page0: Page, page1: Page): void;
    /**
     * Get a page with window index.
     * @param index Window index
     * @returns
     */
    getPageInWindow(index: number): Page | undefined;
}

/**
 * Flipping class
 */
declare class Flipping extends PageWindow {
    /**
     * Current status of the event, initialized to 'None'.
     */
    private _eventStatus;
    /**
     * Setter for eventStatus to update the current status of the event.
     */
    set eventStatus(status: EventStatus);
    /**
     * Getter for eventStatus to retrieve the current event status.
     */
    get eventStatus(): EventStatus;
    /**
     * The area representing the flipping region.
     * The width is the same as the opened book width.
     */
    flipGRect: Rect;
    /**
     * The gutter of the book, representing the central area between the pages.
     * The position
     */
    gutter: Gutter;
    /**
     * The current zone where the event is occurring, initialized to the right-bottom (RB) zone.
     */
    eventZone: Zone;
    /**
     * The previous zone where the event occurred, initialized to the right-top (RT) zone.
     */
    oldEventZone: Zone;
    /**
     * The center point of the active flipping process.
     */
    activeCenterGP: Point;
    /**
     * The point representing the active corner during the flip.
     */
    activeCornerGP: Point;
    /**
     * The opposite corner to the active corner during the flip.
     */
    activeCornerOppositeGP: Point;
    /**
     * Diagonal values used to calculate flipping geometry.
     * The diagonals are depends on the dragging corner point.
     */
    diagonals: FlipDiagonals;
    /**
     * A line that represents the action of flipping a page.
     * The width is the same as the opened book width.
     */
    flipActionLine: FlipActionLine;
    /**
     * The current width being used for automatic flipping when the AutoFlipType is FixedWidth.
     */
    curAutoFlipWidth: number;
    /**
     * The width for automatic flipping, initialized to 20.
     */
    autoFlipWidth: number;
    /**
     * Returns and sets current mouse pointer global point.
     */
    curMouseGP: Point;
    /**
     * Settings related to the flipping behavior.
     */
    setting: {
        autoFlip: {
            type: AutoFlipType;
        };
    };
    constructor();
    /**
     * Initializes the flipping process, setting the event zone and configuring the flip action line,
     * diagonal properties, and active corner points.
     * @param eventZone The zone where the event is happening (e.g., LT, RT).
     * @param mouseGP The current position of the mouse pointer.
     * @param containerRect The rectangle defining the boundaries of the container element.
     */
    setInitFlipping(eventZone: Zone, mouseGP: Point, containerRect: Rect): void;
    /**
     * Returns the point of the corner that flipping page has to go back.
     * @param mouseGP The current position of the mouse pointer.
     * @returns The corner point closest to the mouse pointer.
     */
    getTargetCorner(mouseGP: Point): Point;
    /**
     * Retrieves information needed to execute the flip, such as the target corner,
     * whether the flip is snapping back, and whether the flip is forward.
     * @param mouseGP The current position of the mouse pointer.
     * @returns An object containing the target corner, snap-back status, and flip direction.
     */
    getInfoToFlip(mouseGP: Point): {
        targetCornerGP: Point;
        isSnappingBack: boolean;
        isFlippingForward: boolean;
    };
    /**
     * Animates the page flip action, gradually moving from the start point to the target point,
     * while applying easing to make the motion smooth. It supports auto-flip from or to the corner.
     * @param isAutoFlippingFromCorner Whether the flip is an automatic flip from the corner.
     * @param mouseGP The current position of the mouse pointer.
     * @param pageWH The width and height of the page.
     * @param onFlip A callback executed during the flip, receiving the mouse position and page size.
     * @param onComplete A callback executed when the flip is complete.
     */
    private animateReadyToFlip;
    /**
     * Starts the animation for flipping the page from the corner.
     * @param mouseGP The current position of the mouse pointer.
     * @param pageWH The width and height of the page.
     * @param onFlip A callback executed during the flip, receiving the mouse position and page size.
     * @param onComplete A callback executed when the flip is complete.
     */
    animateFlipFromCorner(mouseGP: Point, pageWH: ISize, onFlip: (mouseGP: Point, pageWH: ISize) => void, onComplete: () => void): void;
    /**
     * Starts the animation for flipping the page to the corner.
     * @param mouseGP The current position of the mouse pointer.
     * @param pageWH The width and height of the page.
     * @param onFlip A callback executed during the flip, receiving the mouse position and page size.
     * @param onComplete A callback executed when the flip is complete.
     */
    animateFlipToCorner(mouseGP: Point, pageWH: ISize, onFlip: (mouseGP: Point, pageWH: ISize) => void, onComplete: () => void): void;
    /**
     * Easing function for smooth transition during the flip animation.
     * @param t A number between 0 and 1 representing the current progress of the animation.
     * @returns A number representing the eased progress value.
     */
    easeInOutQuad(t: number): number;
    /**
     * Animates the page flip, interpolating between the start and end points with easing.
     * @param startP The starting point of the flip.
     * @param endP The ending point of the flip.
     * @param pageWH The width and height of the page.
     * @param onFlip A callback executed during the flip, receiving the mouse position and page size.
     * @param onComplete A callback executed when the flip is complete.
     */
    animateFlip(startP: Point, endP: Point, pageWH: ISize, onFlip: (mouseGP: Point, pageWH: ISize) => void, onComplete: () => void): void;
    /**
     * Updates and returns the mouse pointer position depends on the area that the mouse pointer position is located in.
     * @param mouseGP The current position of the mouse pointer.
     * @returns The updated mouse pointer position.
     */
    updateMousePointOnArea(mouseGP: Point): Point;
    /**
     * Calculates and returns the data needed to flip the page, including the active corner,
     * mask shape, shadow, and rotation angles.
     * @param mouseGP The current position of the mouse pointer.
     * @param pageWH The width and height of the page.
     * @param isSpreadOpen Whether the page is spread open or not.
     * @returns An object containing all the necessary data for rendering the flip.
     */
    flip(mouseGP: Point, pageWH: ISize, isSpreadOpen: boolean): FlipData;
}

/**
 * BookViewer class
 * Gutter:
 *
 */
declare class FlipView implements IBookView {
    private zoomLevel;
    /**
     * This id is unique string for FlipView object.
     */
    readonly id = "flip-view";
    /**
     * Book object.
     * This contains the most information of a book loaded to this viewer.
     */
    private book;
    /**
     * Returns the DOM element of the book container with id 'bookContainer'.
     */
    readonly bookContainerEl: HTMLElement;
    /**
     * This getter returns Rect data of the page container which is the child element of the book element.
     */
    get pageContainerRect(): Rect;
    /**
     * Returns the element of the mouse event zone on the viewer's left top.
     */
    private readonly zoneLT;
    /**
     * Returns the element of the mouse event zone on the viewer's left center.
     */
    private readonly zoneLC;
    /**
     * Returns the element of the mouse event zone on the viewer's left bottom.
     */
    private readonly zoneLB;
    /**
     * Returns the element of the mouse event zone on the viewer's right top.
     */
    private readonly zoneRT;
    /**
     * Returns the element of the mouse event zone on the viewer's right center.
     */
    private readonly zoneRC;
    /**
     * Returns the element of the mouse event zone on the viewer's right bottom.
     */
    private readonly zoneRB;
    /**
     * Returns the mask1 shape element. The element is added to Page 1 for flip effect.
     */
    private readonly maskShapeOnPage1;
    /**
     * Returns the mask2 shape element. The element is added to Page 2 for flip effect.
     */
    private readonly maskShapeOnPage2;
    /**
     * Sets or retrieves the index of left page when book is open.
     */
    private curOpenLeftPageIndex;
    /**
     * Sets or retrieves the index of left page when book is open.
     */
    private isSpreadOpen;
    /**
     * Gets whether the page is flipping. (Includes auto-filp and draggring).
     */
    private get isFlipping();
    /**
     * Gets whether the left page is flipping.
     */
    private get isLeftPageFlipping();
    /**
     * Gets whether the right page is flipping.
     */
    private get isRightPageFlipping();
    /**
     * Gets whether the first page(index is 0) is Opening.
     */
    private get isFirstPageOpening();
    /**
     * Gets whether the first page(index is 0) is closing.
     */
    private get isFirstPageClosing();
    /**
     * Gets whether the last page is Opening.
     */
    private get isLastPageOpening();
    /**
     * Gets whether the last page is closing.
     */
    private get isLastPageClosing();
    /**
     * Returns the instance of Page with sequence of active page.
     * @param activePageNum The number of active opened top page is 1 and behind page is 2, 3.
     */
    private getActivePage;
    /**
     * Returns the instance of Page for active page 2.
     */
    private get activePage2();
    /**
     * Returns the element of the active page 1.
     */
    private get activePage1El();
    /**
     * Returns the element of the active page 2.
     */
    private get activePage2El();
    /**
     *
     */
    private flipManager;
    constructor();
    /**
     * Inits variables and properties when a new book opens.
     */
    private init;
    addStyles(css: string): void;
    /**
     * Creates the viewer related elements.
     * @returns ViewerElements
     */
    private createElements;
    /**
     *
     * @param page
     */
    private appendShadowElIntoPageEl;
    /**
     *
     */
    private appendShadowEl4AllPage;
    /**
     *
     * @returns
     */
    getBookContainerEl(): HTMLElement;
    private checkNum;
    private updateDimensionWhenRendered;
    /**
     * Opens the book on the viewer.
     * @param book
     * @param openRightPageIndex
     */
    view(book: Book, openRightPageIndex?: number): HTMLElement;
    /**
     * Closes the book on the viewer.
     */
    closeViewer(): void;
    /**
     * Gets pages from book.
     * @param isForward
     * @returns
     */
    private getNewPages;
    /**
     * Update dimension of the book viewer element.
     */
    private updateDimension;
    /**
     * Shifts pages related the flip effect directly.
     * @param isFoward the direction of the flipping.
     */
    private shiftPages;
    /**
     * Attach a book to this book viewer.
     */
    private attachBook;
    /**
     * Returns the book back to the BookManager.
     */
    private detachBook;
    /**
     * Sets the one of close/open states which has three states.
     * This state represents that the book is ready to open from front.
     */
    private setReadyToOpenForward;
    /**
     * Sets the one of close/open states which has three states.
     * This state represents that the book is ready to open from back.
     */
    private setReadyToOpenBackward;
    /**
     * Sets the one of close/open states which has three states.
     * This state represents that the book is ready to open.
     */
    private setSpreadOpen;
    /**
     * Reset shadow1 path data.
     */
    private resetShadow1Paths;
    /**
     * Set the viewer to work.
     */
    private setViewer;
    /**
     * Returns the first page's index of 6 pages related flipping effect.
     * @param openPageIndex
     * @returns
     */
    private getStartPageIndexToLoad;
    /**
     * Fetches and loads pages.
     * @param indexRange
     */
    private loadPages;
    /**
     *
     * @returns
     */
    private getLoadedViewablePageCnt;
    /**
     *
     * @param startIndex
     */
    private showPages;
    private flipPage;
    /**
     * Sets the status of viewer as Auto Flipping.
     */
    private setViewerToAutoFlip;
    /**
     * Unsets the status of viewer as Auto Flipping.
     */
    private unsetViewerToAutoFlip;
    /**
     * Sets the status of viewer as the status Flipping by dragging.
     */
    private setViewerToFlip;
    /**
     * Unsets the status of viewer as the status Flipping by dragging.
     */
    private unsetViewerToFlip;
    /**
     * This is the mouseenter event handler on the 6 event zones.
     * @param event
     * @param param
     * @returns
     */
    private zoneMouseEntered;
    /**
     * This is the mousedown event handler on the 6 event zones.
     * @param event
     * @param param
     * @returns
     */
    private zoneMouseDowned;
    /**
     * This is the mousemove event handler on the 6 event zones.
     * @param event
     * @param param
     * @returns
     */
    private zoneMouseMoved;
    /**
     * This is the mouseleave event handler on the 6 event zones.
     * @param event
     * @param param
     * @returns
     */
    private zoneMouseLeaved;
    /**
     * This is the mouseup event handler on document.
     * @param event
     * @param param
     * @returns
     */
    private documentMouseUp;
    /**
     * This is the mousemove event handler on document.
     * @param event
     * @param param
     * @returns
     */
    private documentMouseMove;
    /**
     * Sets all events for viewer.
     */
    private setEvents;
    /**
     *
     */
    private setBookEventListener;
    private removeBookEventListener;
}

export { FlipActionLine, FlipData, FlipDiagonal, FlipDiagonals, FlipView, Flipping, Gutter, type IFlipData, PageWindow };
