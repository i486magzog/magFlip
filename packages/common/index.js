class SizeExt {
    constructor(w, h) {
        this.width = w;
        this.height = h;
        this.diagonal = Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2));
    }
}
class BookSize {
    constructor(size) {
        this.closed = new SizeExt(size.closed.width, size.closed.height);
        this.opened = new SizeExt(size.opened.width, size.opened.height);
    }
}

class MZEvent {
    constructor() {
        this.listeners = {};
    }
    // 이벤트 리스너 등록
    addEventListener(event, listener) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(listener);
    }
    // 이벤트 리스너 제거
    removeEventListener(event, listener) {
        if (!this.listeners[event])
            return;
        this.listeners[event] = this.listeners[event].filter(l => l !== listener);
    }
    // 이벤트 발생
    emitEvent(event, ...args) {
        if (!this.listeners[event])
            return;
        this.listeners[event].forEach(listener => listener(...args));
    }
}

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

export { AutoFlipType, BookSize, BookStatus, BookType, DefaultSize, EventStatus, Line, MZEvent, MZMath, PageType, Point, Rect, SizeExt, ViewerType, Zone };
