class FlipActionLine {
    constructor(leftX = 0, rightX = 0, y = 0) {
        this.leftX = leftX;
        this.rightX = rightX;
        this.y = y;
        this._leftP = { x: leftX, y: y };
        this._rightP = { x: rightX, y: y };
        this._centerP = { x: (leftX + rightX) / 2, y: y };
    }
    get leftP() { return this._leftP; }
    get rightP() { return this._rightP; }
    get centerP() { return this._centerP; }
}

class FlipData {
    constructor(flipData) {
        this.alpa = 0;
        this.a = 0;
        this.b = 0;
        this.c = 0;
        this.d = 0;
        this.alpa = flipData.alpa;
        this.a = flipData.a;
        this.b = flipData.b;
        this.c = flipData.c;
        this.d = flipData.d;
        this.page2 = flipData.page2;
        this.mask = flipData.mask;
        this.shadow = flipData.shadow;
    }
    printPage1MaskShape() {
        const pg = this.mask.page1;
        return `${pg.p1.x},${pg.p1.y} ${pg.p2.x},${pg.p2.y} ${pg.p3.x},${pg.p3.y} ${pg.p4.x},${pg.p4.y}`;
    }
    printPage2MaskShape() {
        const pg = this.mask.page2;
        return `${pg.p1.x},${pg.p1.y} ${pg.p2.x},${pg.p2.y} ${pg.p3.x},${pg.p3.y} ${pg.p4.x},${pg.p4.y}`;
    }
    printShadow6(bookSize) {
        this.mask.page1;
        return `0,0 ${bookSize.width},0 ${bookSize.width},${bookSize.height} 0,${bookSize.height}`;
    }
}

var PageType$1;
(function (PageType) {
    PageType["Page"] = "Page";
    PageType["Cover"] = "Cover";
    PageType["Empty"] = "Empty";
    PageType["Blank"] = "Blank";
})(PageType$1 || (PageType$1 = {}));
var DefaultSize$1;
(function (DefaultSize) {
    DefaultSize[DefaultSize["bookWidth"] = 600] = "bookWidth";
    DefaultSize[DefaultSize["bookHeight"] = 900] = "bookHeight";
    DefaultSize[DefaultSize["pageWidth"] = 600] = "pageWidth";
    DefaultSize[DefaultSize["pageHeight"] = 900] = "pageHeight";
})(DefaultSize$1 || (DefaultSize$1 = {}));
var BookType$1;
(function (BookType) {
    BookType["Book"] = "Book";
    BookType["Magazine"] = "Magazine";
    BookType["Newspaper"] = "Newspaper";
})(BookType$1 || (BookType$1 = {}));
var BookStatus$1;
(function (BookStatus) {
    BookStatus["Open"] = "Open";
    BookStatus["Close"] = "Close";
})(BookStatus$1 || (BookStatus$1 = {}));
var EventStatus$1;
(function (EventStatus) {
    EventStatus[EventStatus["None"] = 0] = "None";
    EventStatus[EventStatus["AutoFlip"] = 8] = "AutoFlip";
    EventStatus[EventStatus["AutoFlipFromCorner"] = 12] = "AutoFlipFromCorner";
    EventStatus[EventStatus["AutoFlipToCorner"] = 10] = "AutoFlipToCorner";
    EventStatus[EventStatus["Flipping"] = 128] = "Flipping";
    EventStatus[EventStatus["SnappingBack"] = 144] = "SnappingBack";
    EventStatus[EventStatus["FlippingForward"] = 160] = "FlippingForward";
    EventStatus[EventStatus["FlippingBackward"] = 192] = "FlippingBackward";
    EventStatus[EventStatus["Dragging"] = 2048] = "Dragging";
})(EventStatus$1 || (EventStatus$1 = {}));
var Zone$1;
(function (Zone) {
    Zone[Zone["LT"] = 66] = "LT";
    Zone[Zone["LC"] = 34] = "LC";
    Zone[Zone["LB"] = 18] = "LB";
    Zone[Zone["RT"] = 65] = "RT";
    Zone[Zone["RC"] = 33] = "RC";
    Zone[Zone["RB"] = 17] = "RB";
    Zone[Zone["Left"] = 2] = "Left";
    Zone[Zone["Right"] = 1] = "Right";
    Zone[Zone["Top"] = 64] = "Top";
    Zone[Zone["Center"] = 32] = "Center";
    Zone[Zone["Bottom"] = 16] = "Bottom";
})(Zone$1 || (Zone$1 = {}));
var AutoFlipType$1;
(function (AutoFlipType) {
    AutoFlipType[AutoFlipType["FixedWidth"] = 0] = "FixedWidth";
    AutoFlipType[AutoFlipType["MouseCursor"] = 1] = "MouseCursor";
})(AutoFlipType$1 || (AutoFlipType$1 = {}));
var ViewerType$1;
(function (ViewerType) {
    ViewerType["Flipping"] = "flipping";
    ViewerType["Scrolling"] = "scrolling";
})(ViewerType$1 || (ViewerType$1 = {}));

class Point {
    constructor(point) {
        this.x = (point === null || point === void 0 ? void 0 : point.x) || 0;
        this.y = (point === null || point === void 0 ? void 0 : point.y) || 0;
    }
    toString() { return `${this.x},${this.y}`; }
}
class Line {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }
}
class Rect {
    constructor(rect) {
        this.left = (rect === null || rect === void 0 ? void 0 : rect.left) || 0;
        this.right = (rect === null || rect === void 0 ? void 0 : rect.right) || 0;
        this.top = (rect === null || rect === void 0 ? void 0 : rect.top) || 0;
        this.bottom = (rect === null || rect === void 0 ? void 0 : rect.bottom) || 0;
        this.width = (rect === null || rect === void 0 ? void 0 : rect.width) || 0;
        this.height = (rect === null || rect === void 0 ? void 0 : rect.height) || 0;
        this.center = new Point({ x: (this.left + this.right) / 2, y: (this.top + this.bottom) / 2 });
    }
    get leftTop() { return { x: this.left, y: this.top }; }
    get leftCenter() { return { x: this.left, y: this.center.y }; }
    get leftBottom() { return { x: this.left, y: this.bottom }; }
    get rightTop() { return { x: this.right, y: this.top }; }
    get rightCenter() { return { x: this.right, y: this.center.y }; }
    get rightBottom() { return { x: this.right, y: this.bottom }; }
    get centerTop() { return { x: this.center.x, y: this.top }; }
    get centerCenter() { return this.center; }
    get centerBottom() { return { x: this.center.x, y: this.bottom }; }
}

/**
 * This is Magzog Math object that contains math util-methods.
 */
class MZMath {
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
    static findSymmetricPoint(originPoint, targetPoint) {
        const symmetricX = 2 * originPoint.x - targetPoint.x;
        const symmetricY = 2 * originPoint.y - targetPoint.y;
        return { x: symmetricX, y: symmetricY };
    }
    /**
     * Get degree.
     * 0 <= degree <= 180 or 0 < degree < -180
     * @param startPoint
     * @param destPoint
     * @returns
     */
    static getDegree(startPoint, destPoint) {
        const radian = MZMath.getRadian(startPoint, destPoint);
        const degree = radian * 180 / Math.PI;
        return degree;
    }
    /**
     * Get degree.
     * 0 <= degree
     * @param startPoint
     * @param destPoint
     * @returns
     */
    static getDegreePositive(startPoint, destPoint) {
        const radian = MZMath.getRadian(startPoint, destPoint);
        let degree = (radian * 180 / Math.PI) % 360;
        if (degree < 0) {
            degree += 360;
        }
        return degree;
    }
    /**
     * Get radian angle.
     * 0 <= radian <= pi or 0 < radian < -pi
     * @param startPoint
     * @param destPoint
     * @returns
     */
    static getRadian(startPoint, destPoint) {
        const dx = destPoint.x - startPoint.x;
        const dy = destPoint.y - startPoint.y;
        const radian = Math.atan2(dy, dx);
        return radian;
    }
    /**
     * Get radian angle.
     * 0 <= radian
     * @param startPoint
     * @param destPoint
     * @returns
     */
    static getRadianPositive(startPoint, destPoint) {
        const dx = destPoint.x - startPoint.x;
        const dy = destPoint.y - startPoint.y;
        let radian = Math.atan2(dy, dx) % (2 * Math.PI);
        if (radian < 0) {
            radian += 2 * Math.PI; // 음수일 경우 2π를 더해 0 ~ 2π로 변환
        }
        return radian;
    }
    /**
     * Returns the global location and size of the input element.
     * @param el
     * @returns
     */
    static getOffset(el) {
        var top = 0, left = 0, width = 0, height = 0;
        let bound = el.getBoundingClientRect();
        height = bound.height;
        width = bound.width;
        do {
            bound = el.getBoundingClientRect();
            top += bound.top;
            left += bound.left;
            el = el.offsetParent;
            if (el !== null) {
                bound = el.getBoundingClientRect();
                top -= bound.top - window.scrollY;
                left -= bound.left - window.scrollX;
            }
        } while (el);
        return {
            top: top,
            left: left,
            width: width,
            height: height,
            bottom: top + height,
            right: left + width,
        };
    }
    /**
     * Ignore the scroll position.
     * @param el
     * @returns
     */
    static getOffset4Fixed(el) {
        var top = 0, left = 0, width = 0, height = 0;
        let bound = el.getBoundingClientRect();
        height = bound.height;
        width = bound.width;
        do {
            bound = el.getBoundingClientRect();
            top += bound.top;
            left += bound.left;
            el = el.offsetParent;
            if (el !== null) {
                bound = el.getBoundingClientRect();
                top -= bound.top;
                left -= bound.left;
            }
        } while (el);
        return new Rect({
            top: top,
            left: left,
            width: width,
            height: height,
            bottom: top + height,
            right: left + width,
        });
    }
    /**
     * Returns the length between two points.
     * @param point1
     * @param point2
     * @returns
     */
    static getLength(point1, point2) {
        return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
    }
    /**
     * Find a point on line AB that is a fixed distance from point A toward point B.
     * @param a
     * @param b
     * @param distance
     * @returns
     */
    static findPointOnLine(a, b, distance) {
        // AB Vector calculation.
        const ab = { x: b.x - a.x, y: b.y - a.y };
        // The length of vector AB
        const abLength = Math.sqrt(ab.x * ab.x + ab.y * ab.y);
        // Calculates the vector AB's unit.
        const unitVector = { x: ab.x / abLength, y: ab.y / abLength };
        // Find the point.
        const point = {
            x: a.x + unitVector.x * distance,
            y: a.y + unitVector.y * distance
        };
        return point;
    }
    /**
     * Calculates and returns the coordinates of point D, where the perpendicular from point C meets the line segment AB.
     * @param line line
     * @param c
     * @returns
     */
    static findPerpendicularFoot(line, c) {
        const vectorX = line.p2.x - line.p1.x;
        const vectorY = line.p2.y - line.p1.y;
        const vector_squared = vectorX * vectorX + vectorY * vectorY;
        if (vector_squared === 0) {
            return line.p1;
        }
        // Vector p1,c
        const vector_p1_c_x = c.x - line.p1.x;
        const vector_p1_c_y = c.y - line.p1.y;
        // Vector production.
        const dotProduct = vector_p1_c_x * vectorX + vector_p1_c_y * vectorY;
        const t = dotProduct / vector_squared;
        // Point D
        const dx = line.p1.x + vectorX * t;
        const dy = line.p1.y + vectorY * t;
        return { x: dx, y: dy };
    }
}

class FlipDiagonal {
    get length() { return this._length; }
    get radian() { return this._radian; }
    constructor(startP, endP) {
        this._length = 0;
        this._radian = 0;
        this._length = MZMath.getLength(startP, endP);
        this._radian = MZMath.getRadianPositive(startP, endP);
    }
}

class FlipDiagonals {
    /**
     *
     * @param rect The container that book is spread open.
     * @param actionCenter The center of FlipActionLine.
     */
    constructor(rect, actionCenter) {
        const zeroP = new Point();
        const centerLeftP = { x: (rect === null || rect === void 0 ? void 0 : rect.left) || 0, y: (actionCenter === null || actionCenter === void 0 ? void 0 : actionCenter.y) || 0 };
        const centerRightP = { x: (rect === null || rect === void 0 ? void 0 : rect.right) || 0, y: (actionCenter === null || actionCenter === void 0 ? void 0 : actionCenter.y) || 0 };
        const centerTop = (rect === null || rect === void 0 ? void 0 : rect.centerTop) || zeroP;
        const centerBottom = (rect === null || rect === void 0 ? void 0 : rect.centerBottom) || zeroP;
        //
        const diagonalLeftInArea1 = new FlipDiagonal(centerBottom, centerLeftP);
        const diagonalRightInArea1 = new FlipDiagonal(centerBottom, centerRightP);
        const diagonalLeftInArea2 = new FlipDiagonal(centerTop, centerLeftP);
        const diagonalRightInArea2 = new FlipDiagonal(centerTop, centerRightP);
        diagonalRightInArea1.radian;
        diagonalRightInArea2.radian || 2 * Math.PI;
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

class Gutter extends Rect {
    constructor(gutter) {
        super(gutter);
    }
    get topPoint() { return { x: this.left, y: this.top }; }
    get bottomPoint() { return { x: this.left, y: this.bottom }; }
}

/**
 * PageWindow class
 */
class PageWindow {
    constructor() {
        /**
         * Window array size. The default value is 6.
         */
        this.windowSize = 6;
        this.windows = [];
        for (let i = 0; i < this.windowSize; i++) {
            this.windows[i] = ({ page: undefined });
        }
    }
    /**
     * Loads and adds a page to the window.
     * @param index Window index
     * @param page
     */
    loadPageToWindow(index, page) {
        this.windows[index].page = page;
    }
    /**
     * Loads and adds pages to the window.
     * @param pages The length of the pages should be 6.
     */
    loadPagesToWindow(pages) {
        for (let i = 0; i < this.windowSize; i++) {
            this.windows[i].page = pages[i];
        }
    }
    /**
     * Clears all pages on the window.
     */
    clearPageWindow() {
        this.windows = [];
        for (let i = 0; i < this.windowSize; i++) {
            this.windows[i] = ({ page: undefined });
        }
    }
    /**
     * Window moves to the right.
     * Before: ----[2][3][4][5][6][7]----------
     * After:  ----------[4][5][6][7][8][9]----
     * @param page4
     * @param page5
     */
    moveRight(page4, page5) {
        this.windows.shift();
        this.windows.shift();
        this.windows.push({ page: page4 });
        this.windows.push({ page: page5 });
    }
    /**
     * Window moves to the right.
     * Before: ----------[4][5][6][7][8][9]----
     * After:  ----[2][3][4][5][6][7]----------
     * @param page0
     * @param page1
     */
    moveLeft(page0, page1) {
        this.windows.pop();
        this.windows.pop();
        this.windows.unshift({ page: page1 });
        this.windows.unshift({ page: page0 });
    }
    /**
     * Get a page with window index.
     * @param index Window index
     * @returns
     */
    getPageInWindow(index) { return this.windows[index].page; }
}

/**
 * Flipping class
 */
class Flipping extends PageWindow {
    /**
     * Setter for eventStatus to update the current status of the event.
     */
    set eventStatus(status) { this._eventStatus = status; }
    ;
    /**
     * Getter for eventStatus to retrieve the current event status.
     */
    get eventStatus() { return this._eventStatus; }
    constructor() {
        super();
        /**
         * Current status of the event, initialized to 'None'.
         */
        this._eventStatus = EventStatus$1.None;
        /**
         * The area representing the flipping region.
         * The width is the same as the opened book width.
         */
        this.flipGRect = new Rect();
        /**
         * The gutter of the book, representing the central area between the pages.
         * The position
         */
        this.gutter = new Gutter();
        /**
         * The current zone where the event is occurring, initialized to the right-bottom (RB) zone.
         */
        this.eventZone = Zone$1.RB;
        /**
         * The previous zone where the event occurred, initialized to the right-top (RT) zone.
         */
        this.oldEventZone = Zone$1.RT;
        /**
         * The center point of the active flipping process.
         */
        this.activeCenterGP = new Point();
        /**
         * The point representing the active corner during the flip.
         */
        this.activeCornerGP = new Point();
        /**
         * The opposite corner to the active corner during the flip.
         */
        this.activeCornerOppositeGP = new Point();
        /**
         * Diagonal values used to calculate flipping geometry.
         * The diagonals are depends on the dragging corner point.
         */
        this.diagonals = new FlipDiagonals();
        /**
         * A line that represents the action of flipping a page.
         * The width is the same as the opened book width.
         */
        this.flipActionLine = new FlipActionLine();
        /**
         * The current width being used for automatic flipping when the AutoFlipType is FixedWidth.
         */
        this.curAutoFlipWidth = 0;
        /**
         * The width for automatic flipping, initialized to 20.
         */
        this.autoFlipWidth = 20;
        /**
         * Returns and sets current mouse pointer global point.
         */
        this.curMouseGP = new Point();
        /**
         * Settings related to the flipping behavior.
         */
        this.setting = { autoFlip: { type: AutoFlipType$1.MouseCursor } };
    }
    /**
     * Initializes the flipping process, setting the event zone and configuring the flip action line,
     * diagonal properties, and active corner points.
     * @param eventZone The zone where the event is happening (e.g., LT, RT).
     * @param mouseGP The current position of the mouse pointer.
     * @param containerRect The rectangle defining the boundaries of the container element.
     */
    setInitFlipping(eventZone, mouseGP, containerRect) {
        this.eventZone = eventZone;
        let flipActionLineGY = mouseGP.y;
        // If dragging a corner, the flipActionLineGY will be the top or bottom of the container.
        switch (eventZone) {
            case Zone$1.LT:
            case Zone$1.RT:
                flipActionLineGY = this.gutter.top;
                break;
            case Zone$1.LB:
            case Zone$1.RB:
                flipActionLineGY = this.gutter.bottom;
                break;
        }
        //
        // Flip Rect
        //
        const left = containerRect.left == this.gutter.left ? containerRect.left - containerRect.width : containerRect.left;
        const right = containerRect.right == this.gutter.right ? containerRect.right + containerRect.width : containerRect.right;
        this.flipGRect = new Rect({
            left: left,
            right: right,
            top: this.gutter.top,
            bottom: this.gutter.bottom,
            width: right - left,
            height: this.gutter.height
        });
        //
        // FlipActionLine, Diagonals, ActiveCenterGP
        //
        this.flipActionLine = new FlipActionLine(left, right, flipActionLineGY);
        this.diagonals = new FlipDiagonals(this.flipGRect, this.flipActionLine.centerP);
        this.activeCenterGP = this.flipActionLine.centerP;
        //
        // ActiveCornerGP
        //
        let originX = 0;
        switch (eventZone) {
            case Zone$1.LT:
            case Zone$1.LC:
            case Zone$1.LB:
                originX = this.flipGRect.width / 2;
                this.activeCornerGP = this.flipActionLine.leftP;
                break;
            case Zone$1.RT:
            case Zone$1.RC:
            case Zone$1.RB:
                originX = 0;
                this.activeCornerGP = this.flipActionLine.rightP;
                break;
        }
        this.activeCornerOppositeGP = MZMath.findSymmetricPoint(this.activeCenterGP, this.activeCornerGP);
        //
        // Transform origin
        //
        const originY = this.flipActionLine.y - containerRect.top;
        // page2El.style.transformOrigin = `${originX}px ${originY}px`;
        const docEl = document.documentElement;
        docEl.style.setProperty('--page2-origin', `${originX}px ${originY}px`);
        //
        const zoneWidthStr = getComputedStyle(docEl).getPropertyValue('--zone-width').trim();
        this.autoFlipWidth = parseFloat(zoneWidthStr) * 0.9;
    }
    /**
     * Returns the point of the corner that flipping page has to go back.
     * @param mouseGP The current position of the mouse pointer.
     * @returns The corner point closest to the mouse pointer.
     */
    getTargetCorner(mouseGP) {
        const activeLength = MZMath.getLength(mouseGP, this.activeCornerGP);
        const inactiveLength = MZMath.getLength(mouseGP, this.activeCornerOppositeGP);
        return inactiveLength < activeLength ? this.activeCornerOppositeGP : this.activeCornerGP;
    }
    /**
     * Retrieves information needed to execute the flip, such as the target corner,
     * whether the flip is snapping back, and whether the flip is forward.
     * @param mouseGP The current position of the mouse pointer.
     * @returns An object containing the target corner, snap-back status, and flip direction.
     */
    getInfoToFlip(mouseGP) {
        const targetCornerGP = this.getTargetCorner(mouseGP);
        const isSnappingBack = targetCornerGP == this.activeCornerGP;
        const isForward = targetCornerGP.x < this.gutter.left ? true : false;
        return {
            targetCornerGP: targetCornerGP,
            isSnappingBack: isSnappingBack,
            isFlippingForward: isForward,
        };
    }
    /**
     * Animates the page flip action, gradually moving from the start point to the target point,
     * while applying easing to make the motion smooth. It supports auto-flip from or to the corner.
     * @param isAutoFlippingFromCorner Whether the flip is an automatic flip from the corner.
     * @param mouseGP The current position of the mouse pointer.
     * @param pageWH The width and height of the page.
     * @param onFlip A callback executed during the flip, receiving the mouse position and page size.
     * @param onComplete A callback executed when the flip is complete.
     */
    animateReadyToFlip(isAutoFlippingFromCorner, mouseGP, pageWH, onFlip, onComplete) {
        let currentValue = this.curAutoFlipWidth;
        const isFlipToMouse = (this.setting.autoFlip.type == AutoFlipType$1.MouseCursor) && !(this.eventZone & Zone$1.Center);
        const targetValue = isAutoFlippingFromCorner ? this.autoFlipWidth : 0;
        if (isFlipToMouse && !isAutoFlippingFromCorner) {
            mouseGP = this.activeCornerGP;
        }
        else if (currentValue == targetValue) {
            return onComplete();
        }
        const startTime = performance.now();
        const duration = 200; // 2000ms
        let startP = new Point();
        let endP = new Point();
        switch (this.eventZone) {
            case Zone$1.LT:
                startP = { x: this.activeCornerGP.x + currentValue, y: this.activeCornerGP.y + currentValue };
                endP = isFlipToMouse ? mouseGP : { x: this.activeCornerGP.x + targetValue, y: this.activeCornerGP.y + targetValue };
                break;
            case Zone$1.LC:
                startP = { x: this.activeCornerGP.x + currentValue, y: this.activeCornerGP.y };
                endP = isFlipToMouse ? mouseGP : { x: this.activeCornerGP.x + targetValue, y: this.activeCornerGP.y };
                break;
            case Zone$1.LB:
                startP = { x: this.activeCornerGP.x + currentValue, y: this.activeCornerGP.y - currentValue };
                endP = isFlipToMouse ? mouseGP : { x: this.activeCornerGP.x + targetValue, y: this.activeCornerGP.y - targetValue };
                break;
            case Zone$1.RT:
                startP = { x: this.activeCornerGP.x - currentValue, y: this.activeCornerGP.y + currentValue };
                endP = isFlipToMouse ? mouseGP : { x: this.activeCornerGP.x - targetValue, y: this.activeCornerGP.y + targetValue };
                break;
            case Zone$1.RC:
                startP = { x: this.activeCornerGP.x - currentValue, y: this.activeCornerGP.y };
                endP = isFlipToMouse ? mouseGP : { x: this.activeCornerGP.x - targetValue, y: this.activeCornerGP.y };
                break;
            case Zone$1.RB:
                startP = { x: this.activeCornerGP.x - currentValue, y: this.activeCornerGP.y - currentValue };
                endP = isFlipToMouse ? mouseGP : { x: this.activeCornerGP.x - targetValue, y: this.activeCornerGP.y - targetValue };
                break;
        }
        const animationFrame = (currentTime) => {
            const eventStatus = this.eventStatus;
            if (isFlipToMouse) {
                if (isAutoFlippingFromCorner) {
                    endP = this.curMouseGP;
                }
                else {
                    startP = this.curMouseGP;
                }
            }
            if ((eventStatus != EventStatus$1.AutoFlipToCorner && eventStatus != EventStatus$1.AutoFlipFromCorner)
                || (isAutoFlippingFromCorner && eventStatus == EventStatus$1.AutoFlipToCorner)
                || (!isAutoFlippingFromCorner && eventStatus == EventStatus$1.AutoFlipFromCorner)) {
                return onComplete();
            }
            const elapsed = (currentTime - startTime) / duration; // 0 ~ 1 사이 값
            const progress = Math.min(elapsed, 1); // 진행률 계산 (최대 1)
            const easingProgress = this.easeInOutQuad(progress); // easing 함수 적용
            const currentX = startP.x + (endP.x - startP.x) * easingProgress;
            const currentY = startP.y + (endP.y - startP.y) * easingProgress;
            if (isAutoFlippingFromCorner) {
                currentValue = progress * targetValue;
            }
            else {
                currentValue = currentValue - progress * currentValue;
            }
            this.curAutoFlipWidth = currentValue;
            onFlip({ x: currentX, y: currentY }, pageWH);
            if (progress < 1) {
                requestAnimationFrame(animationFrame);
            }
            else {
                onComplete();
            }
        };
        requestAnimationFrame(animationFrame); // 애니메이션 시작
    }
    /**
     * Starts the animation for flipping the page from the corner.
     * @param mouseGP The current position of the mouse pointer.
     * @param pageWH The width and height of the page.
     * @param onFlip A callback executed during the flip, receiving the mouse position and page size.
     * @param onComplete A callback executed when the flip is complete.
     */
    animateFlipFromCorner(mouseGP, pageWH, onFlip, onComplete) {
        if (this.oldEventZone != this.eventZone) {
            this.curAutoFlipWidth = 0;
        }
        this.oldEventZone = this.eventZone;
        this.animateReadyToFlip(true, mouseGP, pageWH, onFlip, onComplete);
    }
    /**
     * Starts the animation for flipping the page to the corner.
     * @param mouseGP The current position of the mouse pointer.
     * @param pageWH The width and height of the page.
     * @param onFlip A callback executed during the flip, receiving the mouse position and page size.
     * @param onComplete A callback executed when the flip is complete.
     */
    animateFlipToCorner(mouseGP, pageWH, onFlip, onComplete) {
        this.oldEventZone = this.eventZone;
        this.animateReadyToFlip(false, mouseGP, pageWH, onFlip, onComplete);
    }
    /**
     * Easing function for smooth transition during the flip animation.
     * @param t A number between 0 and 1 representing the current progress of the animation.
     * @returns A number representing the eased progress value.
     */
    easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
    /**
     * Animates the page flip, interpolating between the start and end points with easing.
     * @param startP The starting point of the flip.
     * @param endP The ending point of the flip.
     * @param pageWH The width and height of the page.
     * @param onFlip A callback executed during the flip, receiving the mouse position and page size.
     * @param onComplete A callback executed when the flip is complete.
     */
    animateFlip(startP, endP, pageWH, onFlip, onComplete) {
        const startTime = performance.now();
        const duration = 500; // 2000ms
        const animationFrame = (currentTime) => {
            if (this.eventStatus == EventStatus$1.Flipping) {
                return;
            }
            const elapsed = (currentTime - startTime) / duration; // 0 ~ 1 사이 값
            const progress = Math.min(elapsed, 1); // 진행률 계산 (최대 1)
            const easingProgress = this.easeInOutQuad(progress); // easing 함수 적용
            const currentX = startP.x + (endP.x - startP.x) * easingProgress;
            const currentY = startP.y + (endP.y - startP.y) * easingProgress;
            onFlip({ x: currentX, y: currentY }, pageWH);
            if (progress < 1) {
                requestAnimationFrame(animationFrame);
            }
            else {
                onComplete();
            }
        };
        requestAnimationFrame(animationFrame);
    }
    /**
     * Updates and returns the mouse pointer position depends on the area that the mouse pointer position is located in.
     * @param mouseGP The current position of the mouse pointer.
     * @returns The updated mouse pointer position.
     */
    updateMousePointOnArea(mouseGP) {
        const radian4Area1 = MZMath.getRadianPositive(this.gutter.centerBottom, mouseGP);
        const isArea1 = mouseGP.y < this.flipActionLine.y
            && MZMath.getLength(this.gutter.centerBottom, mouseGP) > this.diagonals.area1.length
            && this.diagonals.area1.radian.low <= radian4Area1 && radian4Area1 <= this.diagonals.area1.radian.high;
        const radian4Area2 = MZMath.getRadianPositive(this.gutter.centerTop, mouseGP);
        const isArea2 = mouseGP.y > this.flipActionLine.y
            && MZMath.getLength(this.gutter.centerTop, mouseGP) > this.diagonals.area2.length
            && this.diagonals.area2.radian.low <= radian4Area2 && radian4Area2 <= this.diagonals.area2.radian.high;
        const radian4Area3 = MZMath.getRadianPositive(this.flipActionLine.rightP, mouseGP);
        const radianLow4Area3 = this.diagonals.area3.radian.low;
        const radianHigh4Area3 = this.diagonals.area3.radian.high;
        const isArea3 = mouseGP.x > this.flipActionLine.rightX
            && MZMath.getLength(this.flipActionLine.rightP, mouseGP) > this.diagonals.area3.length
            && (radianLow4Area3 <= radian4Area3 && radian4Area3 <= radianHigh4Area3
                // Ex) low = 5.xx, high = 0.4
                || (radianLow4Area3 > radianHigh4Area3
                    && radianLow4Area3 <= radian4Area3 || radian4Area3 <= radianHigh4Area3));
        const radian4Area4 = MZMath.getRadianPositive(this.flipActionLine.leftP, mouseGP);
        const isArea4 = mouseGP.x < this.flipActionLine.leftX
            && MZMath.getLength(this.flipActionLine.leftP, mouseGP) > this.diagonals.area4.length
            && this.diagonals.area4.radian.low <= radian4Area4 && radian4Area4 <= this.diagonals.area4.radian.high;
        if (isArea1) {
            mouseGP = MZMath.findPointOnLine(this.gutter.centerBottom, mouseGP, this.diagonals.area1.length);
        }
        else if (isArea2) {
            mouseGP = MZMath.findPointOnLine(this.gutter.centerTop, mouseGP, this.diagonals.area2.length);
        }
        else if (isArea3) {
            mouseGP = this.flipActionLine.rightP;
        }
        else if (isArea4) {
            mouseGP = this.flipActionLine.leftP;
        }
        return mouseGP;
    }
    /**
     * Calculates and returns the data needed to flip the page, including the active corner,
     * mask shape, shadow, and rotation angles.
     * @param mouseGP The current position of the mouse pointer.
     * @param pageWH The width and height of the page.
     * @param isSpreadOpen Whether the page is spread open or not.
     * @returns An object containing all the necessary data for rendering the flip.
     */
    flip(mouseGP, pageWH, isSpreadOpen) {
        const page2W = pageWH.width;
        const page2H = pageWH.height;
        let page2ActiveCorner;
        let page3ActiveCorner;
        let zeroX = 0;
        let pivot = 1;
        //
        // Area
        //
        mouseGP = this.updateMousePointOnArea(mouseGP);
        switch (this.eventZone) {
            case Zone$1.LT:
            case Zone$1.LC:
            case Zone$1.LB:
                page2ActiveCorner = { x: page2W, y: page2H };
                page3ActiveCorner = { x: 0, y: page2H };
                zeroX = 0;
                pivot = -1;
                break;
            case Zone$1.RT:
            case Zone$1.RC:
            case Zone$1.RB:
                page2ActiveCorner = { x: 0, y: page2H };
                page3ActiveCorner = { x: page2W, y: page2H };
                zeroX = isSpreadOpen ? page2W : 0;
                pivot = 1;
                break;
            default: throw new Error("Not found an event zone.");
        }
        const halfPI = Math.PI / 2;
        const diffH = this.gutter.bottom - this.flipActionLine.y;
        const beta = MZMath.getRadianPositive(this.activeCornerGP, mouseGP);
        const alpha = pivot * (halfPI * 3 - beta);
        const page2Left = zeroX + (mouseGP.x - this.gutter.left);
        const page2Top = mouseGP.y - this.flipActionLine.y;
        const a = mouseGP.x - this.activeCornerGP.x; // a < 0
        const b = mouseGP.y - this.activeCornerGP.y; // b < 0
        const cosTheta = Math.cos(-halfPI + 2 * beta);
        const tanAlpa = Math.tan(-halfPI - pivot * beta);
        const d = b == 0 ? page2H : (-a / cosTheta) + diffH; // d > 0
        const c = b == 0 ? -a * pivot / 2 : d / tanAlpa;
        // Mask position on Page 2
        const f = { x: page2ActiveCorner.x, y: page2ActiveCorner.y };
        let g = { x: page2ActiveCorner.x + c * pivot, y: page2ActiveCorner.y };
        let h = { x: 0, y: 0 };
        const i = { x: page2ActiveCorner.x, y: page2ActiveCorner.y - d };
        // Shadow
        const closingDistance = MZMath.getLength(mouseGP, this.activeCornerOppositeGP);
        //
        // Update positions
        //
        if (b == 0) {
            h = { x: g.x, y: i.y };
        }
        // Mask shape is triangle when top corner is one of the vertices.
        else if (c < 0) {
            h.x = page2ActiveCorner.x - pivot * c * (page2H - d) / d;
            h.y = i.y = page2H - page2ActiveCorner.y;
            f.y = page2ActiveCorner.y - d;
            g = f;
        }
        // Mask shape is trapezoid and the top side is longer than the bottom side.
        // It is happend when the corner is dragging under book.
        else if (d < 0) {
            h.x = page2ActiveCorner.x + pivot * c * (d - page2H) / d;
            h.y = i.y = page2H - page2ActiveCorner.y;
        }
        // Mask shape is triangle when bottom corner is one of the vertices.
        else if (d < page2H) {
            h = i;
        }
        // Mask shape is trapezoid.
        else if (d > page2H) {
            h.x = page2ActiveCorner.x + pivot * c * (d - page2H) / d;
            h.y = i.y = page2H - page2ActiveCorner.y;
        }
        // Mask position on Page 1
        const j = { x: page3ActiveCorner.x, y: page3ActiveCorner.y };
        const k = { x: page3ActiveCorner.x + page2ActiveCorner.x - g.x, y: g.y };
        const l = { x: page3ActiveCorner.x + page2ActiveCorner.x - h.x, y: h.y };
        const m = { x: page3ActiveCorner.x, y: i.y };
        return new FlipData({
            page2: {
                top: page2Top,
                left: page2Left,
                rotate: (2 * beta) % (2 * Math.PI)
            },
            mask: {
                page2: {
                    p1: f,
                    p2: g,
                    p3: h,
                    p4: i,
                },
                page1: {
                    p1: j,
                    p2: k,
                    p3: l,
                    p4: m,
                }
            },
            alpa: alpha,
            a: a,
            b: b,
            c: c,
            d: d,
            shadow: {
                closingDistance: closingDistance,
                rect: {
                    rotate: alpha,
                    origin: {
                        x: g.x,
                        y: 0
                    }
                },
            },
        });
    }
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var PageType;
(function (PageType) {
    PageType["Page"] = "Page";
    PageType["Cover"] = "Cover";
    PageType["Empty"] = "Empty";
    PageType["Blank"] = "Blank";
})(PageType || (PageType = {}));
var DefaultSize;
(function (DefaultSize) {
    DefaultSize[DefaultSize["bookWidth"] = 600] = "bookWidth";
    DefaultSize[DefaultSize["bookHeight"] = 900] = "bookHeight";
    DefaultSize[DefaultSize["pageWidth"] = 600] = "pageWidth";
    DefaultSize[DefaultSize["pageHeight"] = 900] = "pageHeight";
})(DefaultSize || (DefaultSize = {}));
var BookType;
(function (BookType) {
    BookType["Book"] = "Book";
    BookType["Magazine"] = "Magazine";
    BookType["Newspaper"] = "Newspaper";
})(BookType || (BookType = {}));
var BookStatus;
(function (BookStatus) {
    BookStatus["Open"] = "Open";
    BookStatus["Close"] = "Close";
})(BookStatus || (BookStatus = {}));
var EventStatus;
(function (EventStatus) {
    EventStatus[EventStatus["None"] = 0] = "None";
    EventStatus[EventStatus["AutoFlip"] = 8] = "AutoFlip";
    EventStatus[EventStatus["AutoFlipFromCorner"] = 12] = "AutoFlipFromCorner";
    EventStatus[EventStatus["AutoFlipToCorner"] = 10] = "AutoFlipToCorner";
    EventStatus[EventStatus["Flipping"] = 128] = "Flipping";
    EventStatus[EventStatus["SnappingBack"] = 144] = "SnappingBack";
    EventStatus[EventStatus["FlippingForward"] = 160] = "FlippingForward";
    EventStatus[EventStatus["FlippingBackward"] = 192] = "FlippingBackward";
    EventStatus[EventStatus["Dragging"] = 2048] = "Dragging";
})(EventStatus || (EventStatus = {}));
var Zone;
(function (Zone) {
    Zone[Zone["LT"] = 66] = "LT";
    Zone[Zone["LC"] = 34] = "LC";
    Zone[Zone["LB"] = 18] = "LB";
    Zone[Zone["RT"] = 65] = "RT";
    Zone[Zone["RC"] = 33] = "RC";
    Zone[Zone["RB"] = 17] = "RB";
    Zone[Zone["Left"] = 2] = "Left";
    Zone[Zone["Right"] = 1] = "Right";
    Zone[Zone["Top"] = 64] = "Top";
    Zone[Zone["Center"] = 32] = "Center";
    Zone[Zone["Bottom"] = 16] = "Bottom";
})(Zone || (Zone = {}));
var AutoFlipType;
(function (AutoFlipType) {
    AutoFlipType[AutoFlipType["FixedWidth"] = 0] = "FixedWidth";
    AutoFlipType[AutoFlipType["MouseCursor"] = 1] = "MouseCursor";
})(AutoFlipType || (AutoFlipType = {}));
var ViewerType;
(function (ViewerType) {
    ViewerType["Flipping"] = "flipping";
    ViewerType["Scrolling"] = "scrolling";
})(ViewerType || (ViewerType = {}));

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var BookEvent;
(function (BookEvent) {
    BookEvent["pageAdded"] = "pageAdded";
})(BookEvent || (BookEvent = {}));

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = ":root{--closed-book-width:0px;--opened-book-width:0px;--book-height:0px;--page-width:0px;--page-height:0px;--zone-width:50px;--page2-top:0px;--page2-left:0px;--page2-rotate:0rad;--page2-origin:\"0px 0px\";--page-diagonal-length:0px;--shadow-origin-x:0px;--shadow-origin-y:0px;--shadow-left:calc(var(--page-width) - var(--page-diagonal-length));--shadow-rotate:0rad;--shadow5-opacity:0}#bookViewer.flip-view.hidden{display:none}#bookViewer.flip-view #bookContainer{align-items:center;display:flex;justify-content:center;position:relative}#bookViewer.flip-view #bookContainer .book,#bookViewer.flip-view .book>.container>.page{height:100%;width:100%}#bookViewer.flip-view #bookContainer{filter:drop-shadow(0 0 50px rgba(0,0,0,.4))}#bookViewer.flip-view #bookContainer.ready-to-open .book{width:var(--closed-book-width)}#bookViewer.flip-view #bookContainer.ready-to-open.front .book{border-radius:0 20px 20px 0}#bookViewer.flip-view #bookContainer.ready-to-open.end .book{border-radius:20px 0 0 20px}#bookViewer.flip-view #bookContainer .book{align-items:center;box-sizing:content-box;display:flex;height:var(--book-height);justify-content:center;width:var(--opened-book-width)}#bookViewer.flip-view .book>.container{align-items:center;background:transparent;display:flex;height:100%;justify-content:center;position:relative;width:100%}#bookViewer.flip-view #bookContainer.ready-to-open .book>.container>.page{width:100%}#bookViewer.flip-view .book>.container>.page.empty:nth-child(3){opacity:0}#bookViewer.flip-view #bookContainer.ready-to-open.end .book>.container>.page.empty:nth-child(n+4):nth-child(-n+6),#bookViewer.flip-view #bookContainer.ready-to-open.front .book>.container>.page.empty:nth-child(-n+3){display:none}#bookViewer.flip-view .book>.container>.page{border:0;box-sizing:border-box;height:var(--page-height);position:absolute;width:var(--page-width)}#bookViewer.flip-view .book .page:nth-child(-n+3){left:0}#bookViewer.flip-view .book .page:nth-child(n+4):nth-child(-n+6){left:50%}#bookViewer.flip-view .book .page:nth-child(2),#bookViewer.flip-view .book .page:nth-child(5){display:none}#bookViewer.flip-view #bookContainer.ready-to-open .book .page:nth-child(-n+6){left:0}#bookViewer.flip-view #bookContainer.left-page-flipping .book>.container>.page:nth-child(3),#bookViewer.flip-view #bookContainer.right-page-flipping .book>.container>.page:nth-child(4){z-index:9}#bookViewer.flip-view #bookContainer.left-page-flipping .book>.container>.page:nth-child(2),#bookViewer.flip-view #bookContainer.right-page-flipping .book>.container>.page:nth-child(5){display:block;filter:drop-shadow(0 0 40px rgba(0,0,0,var(--shadow5-opacity)));left:var(--page2-left);top:var(--page2-top);transform:rotate(var(--page2-rotate));transform-origin:var(--page2-origin);z-index:10}#bookViewer.flip-view .book>.container>.page>.content-container{box-sizing:border-box;height:100%;left:0;overflow:hidden;position:absolute;top:0;width:100%}#bookViewer.flip-view #bookContainer.left-page-flipping .book>.container>.page:nth-child(3)>.content-container,#bookViewer.flip-view #bookContainer.right-page-flipping .book>.container>.page:nth-child(4)>.content-container{mask-composite:exclude;-webkit-mask-composite:xor;mask-image:url(#mask1);-webkit-mask-image:url(#mask1);mask-size:cover}#bookViewer.flip-view #bookContainer.left-page-flipping .book>.container>.page:nth-child(2)>.content-container,#bookViewer.flip-view #bookContainer.right-page-flipping .book>.container>.page:nth-child(5)>.content-container{-webkit-mask-composite:intersect;mask-composite:intersect;-webkit-mask-image:url(#mask2);mask-image:url(#mask2);-webkit-mask-mode:alpha;mask-mode:alpha}#bookViewer.flip-view .book>.container>.page>.content-container>.content{height:100%;left:0;position:absolute;top:0;width:100%}#bookViewer.flip-view .shadow1{bottom:-10%;height:10%;left:0;position:absolute;width:100%}#bookViewer.flip-view .shadow1 path{display:none}#bookViewer.flip-view .shadow1 path.sh1-path1,#bookViewer.flip-view .shadow1 path.sh1-path2{fill:url(#shadow1);filter:url(#sh1BlurFilter)}#bookViewer.flip-view .book>.container>.page:nth-child(3) .shadow1 path.sh1-path1,#bookViewer.flip-view .book>.container>.page:nth-child(4) .shadow1 path.sh1-path2{display:block}.shadow6 polygon{fill:url(#shadow6)}#bookViewer.flip-view .book .page .shadow6{display:none;height:100%;width:100%}#bookViewer.flip-view #bookContainer.left-page-flipping .book>.container>.page:nth-child(3)>.shadow6{display:block;height:100%;left:0;position:absolute;top:0;width:calc(var(--page-width)*2)}#bookViewer.flip-view #bookContainer.right-page-flipping .book>.container>.page:nth-child(4)>.shadow6{display:block;height:100%;left:calc(var(--page-width)*-1);position:absolute;top:0;width:calc(var(--page-width)*2)}#bookViewer.flip-view #bookContainer.ready-to-open.left-page-flipping .book>.container>.page:nth-child(3)>.shadow6,#bookViewer.flip-view #bookContainer.ready-to-open.right-page-flipping .book>.container>.page:nth-child(4)>.shadow6{display:none}#bookViewer.flip-view .book>.container>.page>.content-container>.content,#bookViewer.flip-view .book>.container>.page>.shadow3{box-sizing:border-box;overflow:hidden}#bookViewer.flip-view .book>.container>.page:nth-child(odd)>.content-container,#bookViewer.flip-view .book>.container>.page:nth-child(odd)>.content-container>.content,#bookViewer.flip-view .book>.container>.page:nth-child(odd)>.shadow3{border-radius:20px 0 0 20px;border-right-width:0!important}#bookViewer.flip-view .book>.container>.page:nth-child(2n)>.content-container,#bookViewer.flip-view .book>.container>.page:nth-child(2n)>.content-container>.content,#bookViewer.flip-view .book>.container>.page:nth-child(2n)>.shadow3{border-left-width:0!important;border-radius:0 20px 20px 0}#bookViewer.flip-view .book>.container>.page>.shadow3{display:none;height:100%;left:0;position:absolute;top:0;width:100%}#bookViewer.flip-view #bookContainer.left-page-flipping .book>.container>.page:nth-child(2)>.shadow3,#bookViewer.flip-view #bookContainer.right-page-flipping .book>.container>.page:nth-child(5)>.shadow3{display:block}#bookViewer.flip-view .book>.container>.page:nth-child(odd) .shadow2{background-image:-webkit-linear-gradient(left,transparent,rgba(0,0,0,.3) 210%);border-right:1px solid rgba(71,71,71,.1);height:100%;position:absolute;right:0;top:0;width:7%}#bookViewer.flip-view .book>.container>.page:nth-child(2n) .shadow2{background-image:-webkit-linear-gradient(right,transparent,rgba(0,0,0,.3) 210%);border-left:1px solid rgba(71,71,71,.1);height:100%;left:0;position:absolute;top:0;width:7%}#bookViewer.flip-view .page.border>.content-container>.content{border:1px solid #fff}#bookViewer.flip-view .page.border>.shadow3{border:1px solid transparent}#bookViewer.flip-view .page.border .shadow3>.shape{stroke:#fff;stroke-width:1px}#bookViewer.flip-view .page:first-child{z-index:1}#bookViewer.flip-view .page:nth-child(2){z-index:2}#bookViewer.flip-view .page:nth-child(3),#bookViewer.flip-view .page:nth-child(4){z-index:3}#bookViewer.flip-view .page:nth-child(5){z-index:2}#bookViewer.flip-view .page:nth-child(6){z-index:1}#bookViewer.flip-view #bookContainer.ready-to-open.end .event-zone.right,#bookViewer.flip-view #bookContainer.ready-to-open.front .event-zone.left{display:none}#bookViewer.flip-view .event-zone{background:transparent;position:absolute;z-index:20}#bookViewer.flip-view #mzZoneLT{height:calc(var(--zone-width)*2);left:0;top:0;width:calc(var(--zone-width)*3)}#bookViewer.flip-view #mzZoneLC{height:calc(var(--page-height) - var(--zone-width)*4);left:0;top:calc(var(--zone-width)*2);width:var(--zone-width)}#bookViewer.flip-view #mzZoneLB{bottom:0;left:0}#bookViewer.flip-view #mzZoneLB,#bookViewer.flip-view #mzZoneRT{height:calc(var(--zone-width)*2);width:calc(var(--zone-width)*3)}#bookViewer.flip-view #mzZoneRT{right:0;top:0}#bookViewer.flip-view #mzZoneRC{height:calc(var(--page-height) - var(--zone-width)*2);right:0;top:calc(var(--zone-width)*2);width:var(--zone-width)}#bookViewer.flip-view #mzZoneRB{bottom:0;height:calc(var(--zone-width)*2);right:0;width:calc(var(--zone-width)*3)}img{height:100%;width:100%}";
styleInject(css_248z);

/**
 * BookViewer class
 * Gutter:
 *
 */
class FlipView {
    // readonly bookShelfManager: BookShelfManager;
    /**
     * This getter returns Rect data of the page container which is the child element of the book element.
     */
    get pageContainerRect() {
        var _a;
        const el = (_a = this.book) === null || _a === void 0 ? void 0 : _a.pageContainerEl;
        if (!el) {
            throw new Error("Not found the page container.");
        }
        return el && MZMath.getOffset4Fixed(el);
    }
    /**
     * Gets whether the page is flipping. (Includes auto-filp and draggring).
     */
    get isFlipping() {
        return (this.flipManager.eventStatus & EventStatus$1.AutoFlip
            || this.flipManager.eventStatus & EventStatus$1.Flipping
            || this.flipManager.eventStatus & EventStatus$1.Dragging);
    }
    ;
    /**
     * Gets whether the left page is flipping.
     */
    get isLeftPageFlipping() { return this.isFlipping && this.flipManager.eventZone & Zone$1.Left; }
    ;
    /**
     * Gets whether the right page is flipping.
     */
    get isRightPageFlipping() { return this.isFlipping && this.flipManager.eventZone & Zone$1.Right; }
    ;
    /**
     * Gets whether the first page(index is 0) is Opening.
     */
    get isFirstPageOpening() { var _a; return this.isRightPageFlipping && ((_a = this.getActivePage(1)) === null || _a === void 0 ? void 0 : _a.index) == 0; }
    /**
     * Gets whether the first page(index is 0) is closing.
     */
    get isFirstPageClosing() { var _a; return this.isLeftPageFlipping && ((_a = this.getActivePage(2)) === null || _a === void 0 ? void 0 : _a.index) == 0; }
    /**
     * Gets whether the last page is Opening.
     */
    get isLastPageOpening() { var _a, _b; return this.isLeftPageFlipping && ((_a = this.getActivePage(1)) === null || _a === void 0 ? void 0 : _a.index) == ((_b = this.book) === null || _b === void 0 ? void 0 : _b.lastPageIndex); }
    /**
     * Gets whether the last page is closing.
     */
    get isLastPageClosing() { var _a, _b; return this.isRightPageFlipping && ((_a = this.getActivePage(2)) === null || _a === void 0 ? void 0 : _a.index) == ((_b = this.book) === null || _b === void 0 ? void 0 : _b.lastPageIndex); }
    /**
     * Returns the instance of Page with sequence of active page.
     * @param activePageNum The number of active opened top page is 1 and behind page is 2, 3.
     */
    getActivePage(activePageNum) { return this.isLeftPageFlipping ? this.flipManager.windows[3 - activePageNum].page : this.flipManager.windows[2 + activePageNum].page; }
    /**
     * Returns the instance of Page for active page 2.
     */
    get activePage2() { return this.getActivePage(2); }
    /**
     * Returns the element of the active page 1.
     */
    get activePage1El() { var _a; return (_a = this.getActivePage(1)) === null || _a === void 0 ? void 0 : _a.element; }
    /**
     * Returns the element of the active page 2.
     */
    get activePage2El() { var _a; return (_a = this.getActivePage(2)) === null || _a === void 0 ? void 0 : _a.element; }
    constructor() {
        this.zoomLevel = 1;
        /**
         * This id is unique string for FlipView object.
         */
        this.id = 'flip-view';
        /**
         * Sets or retrieves the index of left page when book is open.
         */
        this.curOpenLeftPageIndex = -1;
        /**
         * Sets or retrieves the index of left page when book is open.
         */
        this.isSpreadOpen = false;
        /**
         *
         */
        this.flipManager = new Flipping();
        this.checkNum = 0;
        ({ bookContainerEl: this.bookContainerEl,
            zoneLT: this.zoneLT,
            zoneLC: this.zoneLC,
            zoneLB: this.zoneLB,
            zoneRT: this.zoneRT,
            zoneRC: this.zoneRC,
            zoneRB: this.zoneRB,
            mask1Shape: this.maskShapeOnPage1,
            mask2Shape: this.maskShapeOnPage2 } = this.createElements());
        this.setEvents();
    }
    /**
     * Inits variables and properties when a new book opens.
     */
    init() {
        this.curOpenLeftPageIndex = -1;
    }
    addStyles(css) {
        const styleElement = document.createElement('style');
        styleElement.textContent = css_248z;
        document.head.appendChild(styleElement);
    }
    /**
     * Creates the viewer related elements.
     * @returns ViewerElements
     */
    createElements() {
        // const bookViewerEl = this.bookViewerEl;
        const bookContainerEl = document.createElement('div');
        bookContainerEl.id = "bookContainer";
        // Viewer
        const svgNS = "http://www.w3.org/2000/svg";
        // bookViewerEl.classList.add("flip-view");
        // Book Container
        const zoneLT = document.createElement('div');
        const zoneLC = document.createElement('div');
        const zoneLB = document.createElement('div');
        const zoneRT = document.createElement('div');
        const zoneRC = document.createElement('div');
        const zoneRB = document.createElement('div');
        zoneLT.id = 'mzZoneLT';
        zoneLC.id = 'mzZoneLC';
        zoneLB.id = 'mzZoneLB';
        zoneRT.id = 'mzZoneRT';
        zoneRC.id = 'mzZoneRC';
        zoneRB.id = 'mzZoneRB';
        zoneLT.classList.add('event-zone', 'left');
        zoneLC.classList.add('event-zone', 'left');
        zoneLB.classList.add('event-zone', 'left');
        zoneRT.classList.add('event-zone', 'right');
        zoneRC.classList.add('event-zone', 'right');
        zoneRB.classList.add('event-zone', 'right');
        bookContainerEl.appendChild(zoneLT);
        bookContainerEl.appendChild(zoneLC);
        bookContainerEl.appendChild(zoneLB);
        bookContainerEl.appendChild(zoneRT);
        bookContainerEl.appendChild(zoneRC);
        bookContainerEl.appendChild(zoneRB);
        // Masks & Shadows defs
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('width', '0');
        svg.setAttribute('height', '0');
        const defs = document.createElementNS(svgNS, 'defs');
        svg.appendChild(defs);
        // Mash 1
        const mask1 = document.createElementNS(svgNS, 'mask');
        mask1.setAttribute('id', 'mask1');
        const mask1Rect = document.createElementNS(svgNS, 'rect');
        mask1Rect.setAttribute('id', 'mask1-rect');
        mask1Rect.setAttribute('x', '0');
        mask1Rect.setAttribute('y', '0');
        mask1Rect.setAttribute('width', '100%');
        mask1Rect.setAttribute('height', '100%');
        mask1Rect.setAttribute('fill', 'white');
        const mask1Polygon = document.createElementNS(svgNS, 'polygon');
        mask1Polygon.setAttribute('id', 'mask1-shape');
        mask1Polygon.setAttribute('points', '0,0');
        mask1Polygon.setAttribute('fill', 'black');
        mask1Polygon.setAttribute('stroke', 'black');
        mask1Polygon.setAttribute('stroke-width', '1');
        mask1.appendChild(mask1Rect);
        mask1.appendChild(mask1Polygon);
        // Mask 2
        const mask2 = document.createElementNS(svgNS, 'mask');
        mask2.setAttribute('id', 'mask2');
        const mask2Rect = document.createElementNS(svgNS, 'rect');
        mask2Rect.setAttribute('x', '0');
        mask2Rect.setAttribute('y', '0');
        mask2Rect.setAttribute('width', '100%');
        mask2Rect.setAttribute('height', '100%');
        mask2Rect.setAttribute('fill', 'black');
        const mask2Polygon = document.createElementNS(svgNS, 'polygon');
        mask2Polygon.setAttribute('id', 'mask2-shape');
        mask2Polygon.setAttribute('points', '0,0');
        mask2Polygon.setAttribute('fill', 'white');
        mask2.appendChild(mask2Rect);
        mask2.appendChild(mask2Polygon);
        // Shadow1
        const sh1Gradient = document.createElementNS(svgNS, 'linearGradient');
        sh1Gradient.id = 'shadow1';
        sh1Gradient.setAttribute('x1', '50%');
        sh1Gradient.setAttribute('y1', '0%');
        sh1Gradient.setAttribute('x2', '50%');
        sh1Gradient.setAttribute('y2', '100%');
        const sh1Stop2 = document.createElementNS(svgNS, 'stop');
        const sh1Stop3 = document.createElementNS(svgNS, 'stop');
        sh1Stop2.setAttribute('offset', '0%');
        sh1Stop2.setAttribute('stop-color', 'rgba(0,0,0,0.8)');
        sh1Stop3.setAttribute('offset', '100%');
        sh1Stop3.setAttribute('stop-color', 'rgba(0,0,0,0.2)');
        sh1Gradient.appendChild(sh1Stop2);
        sh1Gradient.appendChild(sh1Stop3);
        const sh1Filter = document.createElementNS(svgNS, 'filter');
        sh1Filter.id = "sh1BlurFilter";
        sh1Filter.setAttribute('x', '0%');
        sh1Filter.setAttribute('y', '0%');
        sh1Filter.setAttribute('width', '100%');
        sh1Filter.setAttribute('height', '200%');
        const sh1Blur = document.createElementNS(svgNS, 'feGaussianBlur');
        sh1Blur.setAttribute('in', 'SourceGraphic');
        sh1Blur.setAttribute('stdDeviation', '3');
        sh1Filter.appendChild(sh1Blur);
        // Shadow3
        const shadow3 = document.createElementNS(svgNS, 'linearGradient');
        shadow3.id = 'shadow3';
        // shadow3.setAttribute('gradientUnits','userSpaceOnUse');
        shadow3.appendChild(document.createElementNS(svgNS, 'stop'));
        shadow3.appendChild(document.createElementNS(svgNS, 'stop'));
        shadow3.appendChild(document.createElementNS(svgNS, 'stop'));
        shadow3.appendChild(document.createElementNS(svgNS, 'stop'));
        shadow3.appendChild(document.createElementNS(svgNS, 'stop'));
        // Shadow6
        const shadow6 = document.createElementNS(svgNS, 'linearGradient');
        shadow6.id = 'shadow6';
        shadow6.setAttribute('gradientUnits', 'userSpaceOnUse');
        shadow6.appendChild(document.createElementNS(svgNS, 'stop'));
        shadow6.appendChild(document.createElementNS(svgNS, 'stop'));
        shadow6.appendChild(document.createElementNS(svgNS, 'stop'));
        //      
        defs.appendChild(mask1);
        defs.appendChild(mask2);
        defs.appendChild(sh1Gradient);
        defs.appendChild(sh1Filter);
        defs.appendChild(shadow3);
        defs.appendChild(shadow6);
        bookContainerEl.appendChild(svg);
        return {
            bookContainerEl: bookContainerEl,
            // bookViewerEl: bookViewerEl,
            zoneLT: zoneLT,
            zoneLC: zoneLC,
            zoneLB: zoneLB,
            zoneRT: zoneRT,
            zoneRC: zoneRC,
            zoneRB: zoneRB,
            mask1Shape: mask1Polygon,
            mask2Shape: mask2Polygon
        };
    }
    ;
    /**
     *
     * @param page
     */
    appendShadowElIntoPageEl(page) {
        const pageW = page.size.width;
        const pageEl = page.element;
        // Shadow
        const svgNS = "http://www.w3.org/2000/svg";
        // Shadow 1
        const sh1El = pageEl.getElementsByClassName('shadow1')[0];
        if (sh1El) {
            sh1El.remove();
        }
        const sh1Svg = document.createElementNS(svgNS, 'svg');
        sh1Svg.classList.add("shadow1");
        const sh1Path = document.createElementNS(svgNS, 'path');
        sh1Path.setAttribute('class', 'sh1-path1');
        sh1Path.setAttribute('d', `M ${pageW / 3} 0 C ${pageW * 13 / 15} ${pageW / 20}, ${pageW * 5 / 6} ${pageW / 20}, ${pageW} 0`);
        const sh2Path = document.createElementNS(svgNS, 'path');
        sh2Path.setAttribute('class', 'sh1-path2');
        sh2Path.setAttribute('d', `M 0 0 C ${pageW / 6} ${pageW / 20}, ${pageW * 2 / 15} ${pageW / 20}, ${pageW * 2 / 3} 0`);
        sh1Svg.appendChild(sh1Path);
        sh1Svg.appendChild(sh2Path);
        // Shadow 6
        const sh6El = pageEl.getElementsByClassName('shadow6')[0];
        if (sh6El) {
            sh6El.remove();
        }
        const sh6Svg = document.createElementNS(svgNS, 'svg');
        sh6Svg.classList.add('shadow6');
        const sh6Shape = document.createElementNS(svgNS, 'polygon');
        sh6Shape.classList.add('shape');
        sh6Shape.setAttribute('points', '0,0');
        sh6Shape.setAttribute('fill', 'white');
        sh6Svg.appendChild(sh6Shape);
        // Shadow 3
        const sh3El = pageEl.getElementsByClassName('shadow3')[0];
        if (sh3El) {
            sh3El.remove();
        }
        const sh3Svg = document.createElementNS(svgNS, 'svg');
        sh3Svg.classList.add('shadow3');
        const sh3Shape = document.createElementNS(svgNS, 'polygon');
        sh3Shape.classList.add('shape');
        sh3Shape.setAttribute('points', '0,0');
        sh3Shape.setAttribute('fill', 'url(#shadow3)');
        sh3Svg.appendChild(sh3Shape);
        // Shadow 2
        const sh2El = page.contentContainerEl.getElementsByClassName('shadow2')[0];
        if (sh2El) {
            sh2El.remove();
        }
        const gutterShadow = document.createElement('div');
        gutterShadow.className = "shadow2";
        page.contentContainerEl.appendChild(gutterShadow);
        pageEl.appendChild(page.contentContainerEl);
        pageEl.appendChild(sh6Svg);
        pageEl.appendChild(sh3Svg);
        pageEl.appendChild(sh1Svg);
    }
    /**
     *
     */
    appendShadowEl4AllPage() {
        var _a;
        const pages = (_a = this.book) === null || _a === void 0 ? void 0 : _a.getPages();
        for (const index in pages) {
            this.appendShadowElIntoPageEl(pages[index]);
        }
    }
    /**
     *
     * @returns
     */
    getBookContainerEl() { return this.bookContainerEl; }
    updateDimensionWhenRendered() {
        if (++this.checkNum > 100) {
            return;
        }
        setTimeout(() => {
            if (this.flipManager.gutter.top == 0 && this.flipManager.gutter.bottom == 0) {
                this.updateDimension();
            }
            else {
                this.updateDimensionWhenRendered();
            }
        }, 200);
    }
    /**
     * Opens the book on the viewer.
     * @param book
     * @param openRightPageIndex
     */
    view(book, openRightPageIndex = 0) {
        this.init();
        this.attachBook(book);
        this.setBookEventListener();
        this.setViewer();
        const newIndexRange = this.getStartPageIndexToLoad(openRightPageIndex);
        this.loadPages(newIndexRange);
        this.showPages(newIndexRange.start);
        this.updateDimensionWhenRendered();
        return this.bookContainerEl;
    }
    /**
     * Closes the book on the viewer.
     */
    closeViewer() {
        // TODO Save current book status.
        this.init();
        this.removeBookEventListener();
        this.detachBook();
    }
    /**
     * Gets pages from book.
     * @param isForward
     * @returns
     */
    getNewPages(isForward) {
        // TODO: Exception
        if (!this.book) {
            throw new Error("No book loaded.");
        }
        const book = this.book;
        const newPage1Index = isForward ? this.curOpenLeftPageIndex + 4 : this.curOpenLeftPageIndex - 4;
        const removedPage1Index = isForward ? this.curOpenLeftPageIndex - 2 : this.curOpenLeftPageIndex + 2;
        return {
            newPage1: book.getPage(newPage1Index) || book.createEmptyPage(newPage1Index),
            newPage2: book.getPage(newPage1Index + 1) || book.createEmptyPage(newPage1Index + 1),
            removedPage1: book.getPage(removedPage1Index) || book.createEmptyPage(removedPage1Index),
            removedPage2: book.getPage(removedPage1Index + 1) || book.createEmptyPage(removedPage1Index + 1),
        };
    }
    /**
     * Update dimension of the book viewer element.
     */
    updateDimension() {
        if (this.curOpenLeftPageIndex < 0) {
            this.setReadyToOpenForward();
        }
        else if (this.curOpenLeftPageIndex >= this.book.lastPageIndex) {
            this.setReadyToOpenBackward();
        }
        else {
            this.setSpreadOpen();
        }
    }
    /**
     * Shifts pages related the flip effect directly.
     * @param isFoward the direction of the flipping.
     */
    shiftPages(isFoward) {
        const { newPage1, newPage2, removedPage1, removedPage2 } = this.getNewPages(isFoward);
        const book = this.book;
        // Global Var
        this.curOpenLeftPageIndex = isFoward ? this.curOpenLeftPageIndex + 2 : this.curOpenLeftPageIndex - 2;
        if (isFoward) {
            this.flipManager.moveRight(newPage1, newPage2);
            book === null || book === void 0 ? void 0 : book.appendPageEl(newPage1.element);
            book === null || book === void 0 ? void 0 : book.appendPageEl(newPage2.element);
        }
        else {
            this.flipManager.moveLeft(newPage1, newPage2);
            book === null || book === void 0 ? void 0 : book.prependPageEl(newPage2.element);
            book === null || book === void 0 ? void 0 : book.prependPageEl(newPage1.element);
        }
        book === null || book === void 0 ? void 0 : book.removePageEl(removedPage1.element);
        book === null || book === void 0 ? void 0 : book.removePageEl(removedPage2.element);
        this.updateDimension();
        this.resetShadow1Paths();
    }
    /**
     * Attach a book to this book viewer.
     */
    attachBook(book) {
        this.book = book;
        if (!(book === null || book === void 0 ? void 0 : book.element)) {
            throw new Error("Error the book opening");
        }
        this.bookContainerEl.appendChild(book.element);
        this.appendShadowEl4AllPage();
    }
    /**
     * Returns the book back to the BookManager.
     */
    detachBook() {
        this.book = undefined;
        this.flipManager.clearPageWindow();
    }
    /**
     * Sets the one of close/open states which has three states.
     * This state represents that the book is ready to open from front.
     */
    setReadyToOpenForward() {
        var _a;
        this.isSpreadOpen = false;
        this.bookContainerEl.classList.add("ready-to-open", "front");
        const bookRect = MZMath.getOffset4Fixed((_a = this.book) === null || _a === void 0 ? void 0 : _a.element);
        this.flipManager.gutter = new Gutter({
            width: 0, height: 0,
            left: bookRect.left,
            right: bookRect.left,
            top: bookRect.top,
            bottom: bookRect.bottom
        });
    }
    /**
     * Sets the one of close/open states which has three states.
     * This state represents that the book is ready to open from back.
     */
    setReadyToOpenBackward() {
        var _a;
        this.isSpreadOpen = false;
        this.bookContainerEl.classList.add("ready-to-open", "end");
        const bookRect = MZMath.getOffset4Fixed((_a = this.book) === null || _a === void 0 ? void 0 : _a.element);
        this.flipManager.gutter = new Gutter({
            width: 0, height: 0,
            left: bookRect.right,
            right: bookRect.right,
            top: bookRect.top,
            bottom: bookRect.bottom
        });
    }
    /**
     * Sets the one of close/open states which has three states.
     * This state represents that the book is ready to open.
     */
    setSpreadOpen() {
        var _a;
        this.isSpreadOpen = true;
        this.bookContainerEl.classList.remove("ready-to-open", "front", "end");
        const bookRect = MZMath.getOffset4Fixed((_a = this.book) === null || _a === void 0 ? void 0 : _a.element);
        this.flipManager.gutter = new Gutter({
            width: 0, height: 0,
            left: bookRect.left + bookRect.width / 2,
            right: bookRect.left + bookRect.width / 2,
            top: bookRect.top,
            bottom: bookRect.bottom
        });
    }
    /**
     * Reset shadow1 path data.
     */
    resetShadow1Paths() {
        var _a, _b, _c;
        const path1Els = (_a = this.book) === null || _a === void 0 ? void 0 : _a.element.querySelectorAll('.sh1-path1');
        const path2Els = (_b = this.book) === null || _b === void 0 ? void 0 : _b.element.querySelectorAll('.sh1-path2');
        const pageW = ((_c = this.book) === null || _c === void 0 ? void 0 : _c.size.closed.width) || 0;
        path1Els === null || path1Els === void 0 ? void 0 : path1Els.forEach(path1El => { path1El.setAttribute('d', `M ${pageW / 3} 0 C ${pageW * 13 / 15} ${pageW / 20}, ${pageW * 5 / 6} ${pageW / 20}, ${pageW} 0`); });
        path2Els === null || path2Els === void 0 ? void 0 : path2Els.forEach(path2El => { path2El.setAttribute('d', `M 0 0 C ${pageW / 6} ${pageW / 20}, ${pageW * 2 / 15} ${pageW / 20}, ${pageW * 2 / 3} 0`); });
    }
    /**
     * Set the viewer to work.
     */
    setViewer() {
        if (!this.book) {
            throw new Error("Book object does not exist.");
        }
        const { closed, opened } = this.book.size;
        // Mask
        const mask1Rect = document.getElementById('mask1-rect');
        if (mask1Rect) {
            mask1Rect.setAttribute('width', `${this.book.size.closed.width}px`);
            mask1Rect.setAttribute('height', `${this.book.size.closed.height}px`);
        }
        const docStyle = document.documentElement.style;
        docStyle.setProperty('--opened-book-width', `${opened.width}px`);
        docStyle.setProperty('--closed-book-width', `${closed.width}px`);
        docStyle.setProperty('--book-height', `${closed.height}px`);
        docStyle.setProperty('--page-width', `${closed.width}px`);
        docStyle.setProperty('--page-height', `${closed.height}px`);
        // Closed
        this.updateDimension();
        document.documentElement.style.setProperty('--page-diagonal-length', (closed.diagonal || 0) + 'px');
    }
    /**
     * Returns the first page's index of 6 pages related flipping effect.
     * @param openPageIndex
     * @returns
     */
    getStartPageIndexToLoad(openPageIndex) {
        const index = openPageIndex % 2 == 1 ? openPageIndex - 2 : openPageIndex - 3;
        return { start: index, cnt: this.flipManager.windowSize };
    }
    /**
     * Fetches and loads pages.
     * @param indexRange
     */
    loadPages(indexRange) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.book) {
                throw new Error("Error the book opening");
            }
            return this.book.fetchPages(indexRange);
        });
    }
    /**
     *
     * @returns
     */
    getLoadedViewablePageCnt() {
        if (!this.book) {
            return 0;
        }
        let cnt = this.book.getPageCnt();
        const pages = this.book.getPages();
        for (const index in pages) {
            const page = pages[index];
            if (Number(index) < 0) {
                --cnt;
            }
            else if (page.type == PageType$1.Empty) {
                --cnt;
            }
        }
        return cnt;
    }
    /**
     *
     * @param startIndex
     */
    showPages(startIndex) {
        const book = this.book;
        if (!book) {
            throw new Error("Error the book opening");
        }
        //
        // Load the pages to the window 
        // & append page elements to dom.
        //
        startIndex = startIndex || -3;
        const maxIndex = startIndex + this.flipManager.windowSize;
        for (let i = startIndex, winIdx = 0; i < maxIndex; i++, winIdx++) {
            const page = book.getPage(i);
            if (page) {
                this.flipManager.loadPageToWindow(winIdx, page);
                book.appendPageEl(page.element);
            }
            else {
                const emptyPage = book.createEmptyPage(i);
                this.flipManager.loadPageToWindow(winIdx, emptyPage);
                book.appendPageEl(emptyPage.element);
            }
        }
    }
    flipPage(page2El, page1Mask, page2Mask, shadow1Paths, shadow3Shape, shadow6Shape, mouseGP, pageWH) {
        const flipData = this.flipManager.flip(mouseGP, pageWH, this.isSpreadOpen);
        const isLeftPageActive = this.isLeftPageFlipping;
        // Mask
        page1Mask.setAttribute('points', flipData.printPage1MaskShape());
        page2Mask.setAttribute('points', flipData.printPage2MaskShape());
        shadow3Shape === null || shadow3Shape === void 0 ? void 0 : shadow3Shape.setAttribute('points', flipData.printPage2MaskShape());
        shadow6Shape === null || shadow6Shape === void 0 ? void 0 : shadow6Shape.setAttribute('points', flipData.printShadow6(this.book.size.opened));
        //
        // Shadow
        //
        // The stop shadow becomes increasingly transparent 
        // from one-third of the way toward the closing corner as it gets closer to the corner.
        let opacityScale = flipData.shadow.closingDistance / (pageWH.width / 3);
        const cssVar = document.documentElement.style;
        const f = flipData.mask.page2.p1;
        const g = flipData.mask.page2.p2;
        const h = flipData.mask.page2.p3;
        flipData.mask.page1.p1;
        const k = flipData.mask.page1.p2;
        const l = flipData.mask.page1.p3;
        const c = flipData.c;
        //
        // Shadow 1
        //
        const sh1Path1 = shadow1Paths && shadow1Paths[0];
        const sh1Path2 = shadow1Paths && shadow1Paths[1];
        let sh1CtlPy = pageWH.width / 20;
        let sh1P1EndPx = pageWH.width / 3;
        let sh1P2EndPx = pageWH.width * 2 / 3;
        if (this.isFirstPageClosing) {
            let sh1CtlPx1 = pageWH.width * 13 / 15;
            if (k.x > sh1P1EndPx) {
                sh1CtlPy = sh1CtlPy * (pageWH.width - k.x) / sh1P2EndPx;
                sh1P1EndPx = k.x;
                sh1CtlPx1 += k.x * .1;
            }
            sh1Path1 === null || sh1Path1 === void 0 ? void 0 : sh1Path1.setAttribute('d', `M ${sh1P1EndPx} 0 C ${sh1CtlPx1} ${sh1CtlPy}, ${pageWH.width * 5 / 6} ${sh1CtlPy}, ${pageWH.width} 0`);
        }
        else if (this.isLastPageClosing) {
            let sh1CtlPx2 = pageWH.width * 2 / 15;
            if (k.x < sh1P2EndPx) {
                sh1CtlPy = sh1CtlPy * k.x / sh1P2EndPx;
                sh1P2EndPx = k.x;
                sh1CtlPx2 -= (pageWH.width - k.x) * .1;
            }
            sh1Path2 === null || sh1Path2 === void 0 ? void 0 : sh1Path2.setAttribute('d', `M 0 0 C ${pageWH.width / 6} ${sh1CtlPy}, ${sh1CtlPx2} ${sh1CtlPy}, ${sh1P2EndPx} 0`);
        }
        //
        // Shadow 5
        //
        const p2Rotate = flipData.page2.rotate;
        const defaultOpacity = isLeftPageActive ? 0.3 : 0.5;
        const tempValue = defaultOpacity / Math.PI;
        const opacity = p2Rotate <= Math.PI
            ? defaultOpacity - tempValue * p2Rotate
            : defaultOpacity + tempValue * (2 * Math.PI - p2Rotate);
        cssVar.setProperty('--shadow5-opacity', `${opacity * opacityScale}`);
        //
        // Shadow 3
        //
        const shadow3El = document.getElementById('shadow3');
        let x1, y1, x2, y2 = 100;
        const isTopOrCenterZone = (this.flipManager.eventZone & Zone$1.Top) || (this.flipManager.eventZone & Zone$1.Center);
        // Points are located on the gradient objectBoundingBox
        let longLineLength = 1;
        let p = new Point({ x: .5, y: .5 });
        if (isLeftPageActive) {
            // Shape is triangle and dragging point is top corner.
            if (c < 0) {
                y2 = 0;
            }
            // Shape is triangle and dragging point is bottom corner.
            else if (f == g) ;
            else if (l.x < k.x) {
                longLineLength = k.x;
                p = MZMath.findPerpendicularFoot(new Line({ x: k.x - l.x, y: 0 }, { x: 0, y: k.x }), { x: k.x, y: k.x });
            }
            else {
                longLineLength = l.x;
                p = MZMath.findPerpendicularFoot(new Line({ x: 0, y: 0 }, { x: l.x - k.x, y: l.x }), { x: l.x, y: isTopOrCenterZone ? 0 : l.x });
                if (isTopOrCenterZone) {
                    y2 = 0;
                }
            }
            x2 = 100;
        }
        else {
            // Shape is triangle and dragging point is top corner.
            if (c < 0) {
                y2 = 0;
            }
            // Shape is triangle and dragging point is bottom corner.
            else if (f == g) ;
            else if (h.x < g.x) {
                longLineLength = g.x;
                p = MZMath.findPerpendicularFoot(new Line({ x: h.x, y: 0 }, { x: g.x, y: g.x }), { x: 0, y: g.x });
            }
            else {
                longLineLength = h.x;
                p = MZMath.findPerpendicularFoot(new Line({ x: h.x, y: 0 }, { x: g.x, y: h.x }), { x: 0, y: isTopOrCenterZone ? 0 : h.x });
                if (isTopOrCenterZone) {
                    y2 = 0;
                }
            }
            x2 = 0;
        }
        x1 = ((p.x / longLineLength) || 0) * 100;
        y1 = ((p.y / longLineLength) || 0) * 100;
        if (shadow3El) {
            shadow3El.setAttribute('x1', `${x1}%`);
            shadow3El.setAttribute('y1', `${y1}%`);
            shadow3El.setAttribute('x2', `${x2}%`);
            shadow3El.setAttribute('y2', `${y2}%`);
        }
        const stops = shadow3El === null || shadow3El === void 0 ? void 0 : shadow3El.querySelectorAll('stop');
        if (stops) {
            opacityScale = opacityScale > 1 ? 1 : opacityScale;
            //
            stops[0].setAttribute('offset', '0.5%');
            stops[0].setAttribute('stop-color', `rgba(255, 255, 255, ${0.7 * opacityScale})`);
            stops[1].setAttribute('offset', '5%');
            stops[1].setAttribute('stop-color', `rgba(255, 255, 255, ${0.5 * opacityScale})`);
            stops[2].setAttribute('offset', '12%');
            stops[2].setAttribute('stop-color', `rgba(255, 255, 255, ${0.7 * opacityScale})`);
            stops[3].setAttribute('offset', '50%');
            stops[3].setAttribute('stop-color', `rgba(0, 0, 0, ${0.208 * opacityScale})`);
            stops[4].setAttribute('offset', '100%');
            stops[4].setAttribute('stop-color', 'rgba(255, 255, 255, 0)');
        }
        //
        // Shadow 6
        //
        const originP = new Point();
        const endCorner = new Point();
        const line = new Line(new Point(), new Point());
        if (isLeftPageActive) {
            originP.x = pageWH.width * 2;
            endCorner.x = 0;
            line.p1.x = k.x;
            line.p1.y = k.y;
            line.p2.x = l.x;
            line.p2.y = l.y;
        }
        else {
            originP.x = 0;
            endCorner.x = pageWH.width * 2;
            line.p1.x = pageWH.width + k.x;
            line.p1.y = k.y;
            line.p2.x = pageWH.width + l.x;
            line.p2.y = l.y;
        }
        if (this.flipManager.eventZone & Zone$1.Top) {
            originP.y = pageWH.height;
            endCorner.y = 0;
        }
        else {
            originP.y = 0;
            endCorner.y = pageWH.height;
        }
        p = MZMath.findPerpendicularFoot(line, originP);
        const p2 = MZMath.findPerpendicularFoot(line, endCorner);
        const diagonalL = MZMath.getLength(originP, endCorner);
        const pLength = MZMath.getLength(p2, endCorner);
        const offset2 = (1 - flipData.shadow.closingDistance / diagonalL) * (pLength / diagonalL) * 100;
        const shadow6El = document.getElementById('shadow6');
        if (shadow6El) {
            shadow6El.setAttribute('x1', `${p.x}`);
            shadow6El.setAttribute('y1', `${p.y}`);
            shadow6El.setAttribute('x2', `${originP.x}`);
            shadow6El.setAttribute('y2', `${originP.y}`);
        }
        const sh6stops = shadow6El === null || shadow6El === void 0 ? void 0 : shadow6El.querySelectorAll('stop');
        if (sh6stops) {
            sh6stops[0].setAttribute('offset', '0%');
            sh6stops[0].setAttribute('stop-color', `rgba(255, 255, 255, 0)`);
            sh6stops[1].setAttribute('offset', '0%');
            sh6stops[1].setAttribute('stop-color', `rgba(0, 0, 0, ${offset2 / 100})`);
            sh6stops[2].setAttribute('offset', `${offset2}%`);
            sh6stops[2].setAttribute('stop-color', `rgba(0, 0, 0, 0`);
        }
        // Page 2
        cssVar.setProperty('--page2-top', `${flipData.page2.top}px`);
        cssVar.setProperty('--page2-left', `${flipData.page2.left}px`);
        cssVar.setProperty('--page2-rotate', `${flipData.page2.rotate}rad`);
    }
    /**
     * Sets the status of viewer as Auto Flipping.
     */
    setViewerToAutoFlip() {
        const className = this.isLeftPageFlipping ? "left" : "right";
        this.bookContainerEl.classList.add(`${className}-page-flipping`);
    }
    /**
     * Unsets the status of viewer as Auto Flipping.
     */
    unsetViewerToAutoFlip() {
        this.bookContainerEl.classList.remove('left-page-flipping', 'right-page-flipping');
    }
    /**
     * Sets the status of viewer as the status Flipping by dragging.
     */
    setViewerToFlip() {
        const className = this.isLeftPageFlipping ? "left" : "right";
        this.bookContainerEl.classList.add(`${className}-page-flipping`, "noselect");
        this.flipManager.curAutoFlipWidth = 0;
    }
    /**
     * Unsets the status of viewer as the status Flipping by dragging.
     */
    unsetViewerToFlip() {
        this.bookContainerEl.classList.remove("noselect", 'left-page-flipping', `right-page-flipping`);
    }
    /**
     * This is the mouseenter event handler on the 6 event zones.
     * @param event
     * @param param
     * @returns
     */
    zoneMouseEntered(event, param) {
        var _a, _b;
        if (this.flipManager.eventStatus & EventStatus$1.Flipping
            || this.flipManager.eventStatus & EventStatus$1.Dragging) {
            return;
        }
        this.flipManager.eventStatus = EventStatus$1.AutoFlipFromCorner;
        this.flipManager.eventZone = param.zone;
        const page2El = this.activePage2El;
        if (!page2El) {
            return;
        }
        // if(!page2El || (this.activePage2 && this.activePage2.type == PageType.Empty) ){ return }
        const shadow1Paths = (_a = this.activePage1El) === null || _a === void 0 ? void 0 : _a.querySelectorAll('.shadow1 > path');
        const shadow3Shape = page2El.querySelector('.shadow3 > polygon.shape');
        const shadow6Shape = (_b = this.activePage1El) === null || _b === void 0 ? void 0 : _b.querySelector('.shadow6 > polygon.shape');
        const msEvent = event;
        const viewport = { x: msEvent.clientX, y: msEvent.clientY };
        this.setViewerToAutoFlip();
        this.flipManager.setInitFlipping(param.zone, viewport, this.pageContainerRect);
        this.flipManager.animateFlipFromCorner(viewport, { width: page2El.offsetWidth, height: page2El.offsetHeight }, (mouseGP, pageWH) => {
            this.flipPage(page2El, this.maskShapeOnPage1, this.maskShapeOnPage2, shadow1Paths, shadow3Shape, shadow6Shape, mouseGP, pageWH);
        }, () => { });
    }
    /**
     * This is the mousedown event handler on the 6 event zones.
     * @param event
     * @param param
     * @returns
     */
    zoneMouseDowned(event, param) {
        var _a, _b;
        if (this.flipManager.eventStatus & EventStatus$1.Flipping) {
            return;
        }
        this.flipManager.eventStatus = EventStatus$1.Dragging;
        this.flipManager.eventZone = param.zone;
        const msEvent = event;
        const viewport = { x: msEvent.clientX, y: msEvent.clientY };
        const page2El = this.activePage2El;
        if (!page2El) {
            return;
        }
        // if(!page2El || (this.activePage2 && this.activePage2.type == PageType.Empty) ){ return }
        if (!this.pageContainerRect) {
            return;
        }
        const shadow1Paths = (_a = this.activePage1El) === null || _a === void 0 ? void 0 : _a.querySelectorAll('.shadow1 > path');
        const shadow3Shape = page2El.querySelector('.shadow3 > polygon.shape');
        const shadow6Shape = (_b = this.activePage1El) === null || _b === void 0 ? void 0 : _b.querySelector('.shadow6 > polygon.shape');
        this.setViewerToFlip();
        this.flipManager.setInitFlipping(param.zone, viewport, this.pageContainerRect);
        this.flipPage(page2El, this.maskShapeOnPage1, this.maskShapeOnPage2, shadow1Paths, shadow3Shape, shadow6Shape, viewport, { width: page2El.offsetWidth, height: page2El.offsetHeight });
    }
    /**
     * This is the mousemove event handler on the 6 event zones.
     * @param event
     * @param param
     * @returns
     */
    zoneMouseMoved(event, param) {
        var _a, _b;
        if (this.flipManager.eventStatus === EventStatus$1.None) {
            this.zoneMouseEntered(event, param);
            return;
        }
        if (this.flipManager.eventStatus !== EventStatus$1.AutoFlipFromCorner) {
            return;
        }
        if (this.flipManager.eventZone & Zone$1.Center) {
            return;
        }
        this.flipManager.eventZone = param.zone;
        const page2El = this.activePage2El;
        if (!page2El) {
            return;
        }
        // if(!page2El || (this.activePage2 && this.activePage2.type == PageType.Empty) ){ return }
        const shadow1Paths = (_a = this.activePage1El) === null || _a === void 0 ? void 0 : _a.querySelectorAll('.shadow1 > path');
        const shadow3Shape = page2El.querySelector('.shadow3 > polygon.shape');
        const shadow6Shape = (_b = this.activePage1El) === null || _b === void 0 ? void 0 : _b.querySelector('.shadow6 > polygon.shape');
        const msEvent = event;
        const viewport = { x: msEvent.clientX, y: msEvent.clientY };
        this.flipPage(page2El, this.maskShapeOnPage1, this.maskShapeOnPage2, shadow1Paths, shadow3Shape, shadow6Shape, viewport, { width: page2El.offsetWidth, height: page2El.offsetHeight });
    }
    /**
     * This is the mouseleave event handler on the 6 event zones.
     * @param event
     * @param param
     * @returns
     */
    zoneMouseLeaved(event, param) {
        var _a, _b;
        if (this.flipManager.eventStatus !== EventStatus$1.AutoFlipFromCorner) {
            return;
        }
        this.flipManager.eventStatus = EventStatus$1.AutoFlipToCorner;
        const page2El = this.activePage2El;
        if (!page2El) {
            return;
        }
        // if(!page2El || (this.activePage2 && this.activePage2.type == PageType.Empty) ){ return }
        const shadow1Paths = (_a = this.activePage1El) === null || _a === void 0 ? void 0 : _a.querySelectorAll('.shadow1 > path');
        const shadow3Shape = page2El.querySelector('.shadow3 > polygon.shape');
        const shadow6Shape = (_b = this.activePage1El) === null || _b === void 0 ? void 0 : _b.querySelector('.shadow6 > polygon.shape');
        const msEvent = event;
        const viewport = { x: msEvent.clientX, y: msEvent.clientY };
        this.flipManager.eventZone = param.zone;
        this.flipManager.animateFlipToCorner(viewport, { width: page2El.offsetWidth, height: page2El.offsetHeight }, (mouseGP, pageWH) => {
            this.flipPage(page2El, this.maskShapeOnPage1, this.maskShapeOnPage2, shadow1Paths, shadow3Shape, shadow6Shape, mouseGP, pageWH);
        }, () => {
            if (this.flipManager.eventStatus == EventStatus$1.AutoFlipToCorner) {
                this.unsetViewerToAutoFlip();
                this.flipManager.eventStatus = EventStatus$1.None;
            }
        });
    }
    /**
     * This is the mouseup event handler on document.
     * @param event
     * @param param
     * @returns
     */
    documentMouseUp(event) {
        var _a, _b;
        if (!(this.flipManager.eventStatus & EventStatus$1.Dragging)) {
            return;
        }
        const page2El = this.activePage2El;
        if (!page2El) {
            return;
        }
        // if(!page2El || (this.activePage2 && this.activePage2.type == PageType.Empty) ){ return }
        const msEvent = event;
        const viewport = { x: msEvent.clientX, y: msEvent.clientY };
        const dataToFlip = this.flipManager.getInfoToFlip(viewport);
        if (dataToFlip.isSnappingBack) {
            this.flipManager.eventStatus = EventStatus$1.SnappingBack;
        }
        else {
            this.flipManager.eventStatus = dataToFlip.isFlippingForward ? EventStatus$1.FlippingForward : EventStatus$1.FlippingBackward;
        }
        const shadow1Paths = (_a = this.activePage1El) === null || _a === void 0 ? void 0 : _a.querySelectorAll('.shadow1 > path');
        const shadow3Shape = page2El.querySelector('.shadow3 > polygon.shape');
        const shadow6Shape = (_b = this.activePage1El) === null || _b === void 0 ? void 0 : _b.querySelector('.shadow6 > polygon.shape');
        this.flipManager.animateFlip(viewport, dataToFlip.targetCornerGP, { width: page2El.offsetWidth, height: page2El.offsetHeight }, (mouseGP, pageWH) => {
            this.flipPage(page2El, this.maskShapeOnPage1, this.maskShapeOnPage2, shadow1Paths, shadow3Shape, shadow6Shape, mouseGP, pageWH);
        }, () => {
            if (!dataToFlip.isSnappingBack) {
                this.shiftPages(dataToFlip.isFlippingForward);
            }
            this.unsetViewerToFlip();
            this.flipManager.eventStatus = EventStatus$1.None;
        });
    }
    /**
     * This is the mousemove event handler on document.
     * @param event
     * @param param
     * @returns
     */
    documentMouseMove(event) {
        var _a, _b;
        const msEvent = event;
        const viewport = { x: msEvent.clientX, y: msEvent.clientY };
        this.flipManager.curMouseGP = viewport;
        if (!(this.flipManager.eventStatus & EventStatus$1.Dragging)) {
            return;
        }
        const page2El = this.activePage2El;
        if (!page2El) {
            return;
        }
        // if(!page2El || (this.activePage2 && this.activePage2.type == PageType.Empty) ){ return }
        const shadow1Paths = (_a = this.activePage1El) === null || _a === void 0 ? void 0 : _a.querySelectorAll('.shadow1 > path');
        const shadow3Shape = page2El.querySelector('.shadow3 > polygon.shape');
        const shadow6Shape = (_b = this.activePage1El) === null || _b === void 0 ? void 0 : _b.querySelector('.shadow6 > polygon.shape');
        this.flipPage(page2El, this.maskShapeOnPage1, this.maskShapeOnPage2, shadow1Paths, shadow3Shape, shadow6Shape, viewport, { width: page2El.offsetWidth, height: page2El.offsetHeight });
    }
    /**
     * Sets all events for viewer.
     */
    setEvents() {
        [
            { zoneEl: this.zoneLT, zone: Zone$1.LT },
            { zoneEl: this.zoneLC, zone: Zone$1.LC },
            { zoneEl: this.zoneLB, zone: Zone$1.LB },
            { zoneEl: this.zoneRT, zone: Zone$1.RT },
            { zoneEl: this.zoneRC, zone: Zone$1.RC },
            { zoneEl: this.zoneRB, zone: Zone$1.RB }
        ].forEach(({ zoneEl, zone }) => {
            zoneEl.addEventListener('mouseenter', (event) => { this.zoneMouseEntered(event, { zone: zone }); });
            zoneEl.addEventListener('mouseleave', (event) => { this.zoneMouseLeaved(event, { zone: zone }); });
            zoneEl.addEventListener('mousedown', (event) => { this.zoneMouseDowned(event, { zone: zone }); });
            zoneEl.addEventListener('mousemove', (event) => { this.zoneMouseMoved(event, { zone: zone }); });
        });
        document.addEventListener('mouseup', this.documentMouseUp.bind(this));
        document.addEventListener('mousemove', this.documentMouseMove.bind(this));
        window.addEventListener('resize', () => { this.updateDimension(); });
    }
    /**
     *
     */
    setBookEventListener() {
        var _a;
        (_a = this.book) === null || _a === void 0 ? void 0 : _a.addEventListener(BookEvent.pageAdded, this.appendShadowElIntoPageEl);
    }
    removeBookEventListener() {
        var _a;
        (_a = this.book) === null || _a === void 0 ? void 0 : _a.removeEventListener(BookEvent.pageAdded, this.appendShadowElIntoPageEl);
    }
}

export { FlipActionLine, FlipData, FlipDiagonal, FlipDiagonals, FlipView, Flipping, Gutter, PageWindow };
