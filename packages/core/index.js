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

class Base extends MZEvent {
    constructor() {
        super();
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

/**
 * Book element management class
 */
class BookEl extends Base {
    constructor(book) {
        super();
        // TODO: id should be unique and exist.
        this.thumbnails = book.thumbnails || {
            spine: "resources/default_spine.webp",
            small: "resources/default_small.webp",
            medium: "resources/default_medium.webp",
            cover: {
                front: "resources/default_front_cover.webp",
                back: "resources/default_back_cover.webp",
            }
        };
        //
        // Element creation
        //
        const elements = this.createBookElement();
        this.elementOnShelf = elements.bookOnShelfEl;
        this.element = elements.bookEl;
        this.pageContainerEl = elements.containerEl;
    }
    /**
     * Appends a page element into the page container element.
     * @param pageEl the page element to append.
     */
    appendPageEl(pageEl) { this.pageContainerEl.appendChild(pageEl); }
    /**
     * Prepends a page element into the page container element.
     * @param pageEl the page element to prepend.
     */
    prependPageEl(pageEl) { this.pageContainerEl.prepend(pageEl); }
    /**
     * Remove a page element from the page container element.
     * @param pageEl the page element to remove.
     */
    removePageEl(pageEl) { this.pageContainerEl.removeChild(pageEl); }
    /**
     * Creates the book element and child elements
     * @returns
     */
    createBookElement() {
        const bookOnShelfEl = document.createElement('div');
        bookOnShelfEl.className = "book-on-shelf";
        const coverEl = document.createElement('img');
        coverEl.src = this.thumbnails.medium;
        bookOnShelfEl.appendChild(coverEl);
        const bookEl = document.createElement('div');
        const containerEl = document.createElement('div');
        bookEl.className = "book";
        containerEl.className = "container";
        bookEl.appendChild(containerEl);
        return { bookOnShelfEl: bookOnShelfEl, bookEl: bookEl, containerEl: containerEl };
    }
    /**
     * Clears the children elements of the page container's element.
     */
    clearPageEls() { this.pageContainerEl.innerHTML = ""; }
    /**
     *
     */
    resetBookEls() {
        const children = Array.from(this.element.children);
        children.forEach(child => {
            if (child !== this.pageContainerEl) {
                this.element.removeChild(child);
            }
        });
        this.clearPageEls();
    }
}

/**
 * Page class
 */
class PageEl extends Base {
    constructor(page) {
        super();
        ({ element: this.element,
            contentContainerEl: this.contentContainerEl,
            contentEl: this.contentEl } = this.createPageElement(page));
    }
    /**
     * Creates the elements of this page.
     * @param page
     * @returns
     */
    createPageElement(page) {
        const pageEl = document.createElement('div');
        pageEl.className = "page";
        pageEl.setAttribute('pageIdx', `${page.index}`);
        if (page.type == PageType.Empty) {
            const contentContainerEl = document.createElement('div');
            contentContainerEl.className = `content-container`;
            const contentEl = document.createElement('div');
            contentEl.className = "content";
            contentContainerEl.appendChild(contentEl);
            pageEl.classList.add("empty");
            pageEl.appendChild(contentContainerEl);
            return {
                element: pageEl,
                contentContainerEl: contentContainerEl,
                contentEl: contentEl
            };
        }
        else if (page.type == PageType.Blank) {
            const contentContainerEl = document.createElement('div');
            contentContainerEl.className = `content-container`;
            const contentEl = document.createElement('div');
            contentEl.className = "content";
            contentContainerEl.appendChild(contentEl);
            pageEl.classList.add("blank");
            pageEl.appendChild(contentContainerEl);
            return {
                element: pageEl,
                contentContainerEl: contentContainerEl,
                contentEl: contentEl
            };
        }
        else {
            // Content
            const contentContainerEl = document.createElement('div');
            contentContainerEl.className = `content-container`;
            const contentEl = document.createElement('div');
            contentEl.className = `content`;
            contentEl.innerHTML = page.content || '';
            contentEl.innerHTML += page.image ? `<img src="${page.image}"/>` : '';
            contentContainerEl.appendChild(contentEl);
            pageEl.appendChild(contentContainerEl);
            return {
                element: pageEl,
                contentContainerEl: contentContainerEl,
                contentEl: contentEl
            };
        }
    }
    resetPageEls() {
        const children = Array.from(this.element.children);
        children.forEach(child => {
            if (child === this.contentContainerEl) {
                const grandChildren = Array.from(child.children);
                grandChildren.forEach(grandChild => {
                    if (grandChild !== this.contentEl) {
                        child.removeChild(grandChild);
                    }
                });
            }
            else {
                this.element.removeChild(child);
            }
        });
    }
}

/**
 *
 */
var PageEvent;
(function (PageEvent) {
})(PageEvent || (PageEvent = {}));
/**
 * Page class
 */
class Page extends PageEl {
    constructor(page) {
        super(page);
        // TODO: id should be unique and exist.
        this.id = page.id;
        this.type = page.type || PageType.Page;
        this.number = page.number || undefined;
        this.size = page.size || { width: DefaultSize.pageWidth, height: DefaultSize.pageHeight };
        // TODO: index should be unique and exist.
        this.index = page.index;
        this.ignore = page.ignore || false;
        this.content = page.content || "";
        this.image = page.image || '';
        this.setEvents();
    }
    /**
     * Creates and return an empty page.
     * @param index
     * @param size
     * @returns
     */
    static emptyPage(index, size) { return this.createEmptyOrBlankPage(PageType.Empty, index, size); }
    /**
     * Creates and return an blank page.
     * @param index
     * @param size
     * @returns
     */
    static blankPage(index, size) { return this.createEmptyOrBlankPage(PageType.Blank, index, size); }
    /**
     * Creates and return an empty or blank page.
     * @param index
     * @param size
     * @returns
     */
    static createEmptyOrBlankPage(type, index, size) {
        return new Page({
            id: `emptyPage${index}`,
            type: type,
            size: size,
            number: undefined,
            index: index,
            ignore: true,
            content: "",
        });
    }
    /**
     * Adds all events related to this page.
     * @param handlers
     */
    setEvents() {
    }
}

var BookEvent;
(function (BookEvent) {
    BookEvent["pageAdded"] = "pageAdded";
})(BookEvent || (BookEvent = {}));
/**
 * Book class
 */
class Book extends BookEl {
    constructor(book) {
        super(book);
        // TODO: id should be unique and exist.
        this.id = book.id;
        this.status = BookStatus.Close;
        this.type = book.type || BookType.Book;
        this.title = book.title || "Title";
        this.author = book.author || "Author";
        this.publication = book.publication || {
            name: "Publisher",
            location: "Location",
            publishedDate: "Published Date"
        };
        this.size = new BookSize(book.size || {
            closed: new SizeExt(DefaultSize.bookWidth, DefaultSize.bookHeight),
            opened: new SizeExt(DefaultSize.bookWidth * 2, DefaultSize.bookHeight)
        });
        this.lastPageIndex = book.lastPageIndex % 2 == 0 ? book.lastPageIndex + 1 : book.lastPageIndex;
        this.pages = {};
        this.thumbnails = book.thumbnails || {
            spine: "resources/default_spine.webp",
            small: "resources/default_small.webp",
            medium: "resources/default_medium.webp",
            cover: {
                front: "resources/default_front_cover.webp",
                back: "resources/default_back_cover.webp",
            }
        };
    }
    /**
     * Fetches and adds a page from server.
     * @param index
     * @returns
     */
    fetchPage(index) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: fecth page from the server
            const pageSample = {
                id: `page${index}`,
                type: PageType.Page,
                size: { width: 600, height: 900 },
                index: index,
                number: undefined,
                ignore: false,
                content: "",
                image: `./resources/page${index}.jpg`
            };
            const page = new Page(pageSample);
            this.addPage(page, index);
            return new Promise((resolve, reject) => {
                resolve(pageSample);
            });
        });
    }
    /**
     * Fetches and adds pages from server.
     * @param indexRange the indice of the pages to fetches
     * @returns
     */
    fetchPages(indexRange) {
        return __awaiter(this, void 0, void 0, function* () {
            let startIndex = indexRange.start;
            // if start index is negative set it as zero.
            if (startIndex < 0) {
                startIndex = 0;
            }
            // TODO: fecth page from the server
            const pageSamples = [];
            let maxIndex = startIndex + indexRange.cnt;
            if (maxIndex > this.lastPageIndex) {
                maxIndex = this.lastPageIndex;
            }
            for (let i = startIndex; i < maxIndex; i++) {
                // TODO: if the page is already loaded, do not fetch the page.
                if (this.pages[i]) {
                    continue;
                }
                pageSamples.push({
                    id: `page${i}`,
                    type: PageType.Page,
                    size: { width: 600, height: 900 },
                    index: i,
                    number: undefined,
                    ignore: false,
                    content: "",
                    image: `./resources/page${i}.jpg`
                });
            }
            pageSamples.forEach((pageSample) => {
                const page = new Page(pageSample);
                this.addPage(page, page.index);
            });
            return new Promise((resolve, reject) => {
                resolve(pageSamples);
            });
        });
    }
    importPages(pages, size) {
        this.size.closed = new SizeExt(size.width, size.height);
        this.size.opened = new SizeExt(size.width * 2, size.height);
        pages.forEach(pageData => {
            const page = new Page(pageData);
            this.addPage(page, page.index);
        });
    }
    /**
     * Adds a page object to the book.
     * @param page
     * @param index
     */
    addPage(page, index) {
        this.pages[index] = page;
        this.emitEvent(BookEvent.pageAdded, page);
    }
    /**
     * Remove a page object from the book.
     * @param index
     */
    removePage(index) {
        delete this.pages[index];
    }
    /**
     * Returns the page object with the page index.
     * @param index
     * @returns
     */
    getPage(index) { return this.pages[index]; }
    /**
     * Returns the pages object.
     * @returns
     */
    getPages() { return this.pages; }
    /**
     * Return the pages array length.
     */
    getPageCnt() { return Object.keys(this.pages).length; }
    /**
     * Returns the page element with the page index.
     * @param index
     * @returns
     */
    getPageEl(index) { return this.pages[index].element; }
    /**
     * Creates and adds an empty page object.
     * @param index
     * @param size
     * @returns
     */
    createEmptyPage(index, size) {
        const page = Page.emptyPage(index, size || this.size.closed);
        this.addPage(page, index);
        return page;
    }
    setEvents(event, handler) {
    }
    resetBook() {
        return new Promise((resolve, reject) => {
            this.element.removeAttribute('style');
            this.resetBookEls();
            for (const idxStr in this.pages) {
                const page = this.pages[idxStr];
                if (page.type == PageType.Empty) {
                    this.removePage(Number(idxStr));
                }
                page.resetPageEls();
            }
            resolve();
        });
    }
}

/**
 * BookShelf class
 */
class BookShelf {
    constructor(bookManager) {
        this.booksOnShelf = {};
        this.bookManager = bookManager;
        this.bookShelfDocId = "bookShelf";
        this.element = this.createElement();
    }
    /**
     * Creates all book shelf elements.
     * @returns
     */
    createElement() {
        let bookShelfEl = document.getElementById(this.bookShelfDocId);
        if (!bookShelfEl) {
            bookShelfEl = document.createElement('div');
            bookShelfEl.id = this.bookShelfDocId;
            document.body.appendChild(bookShelfEl);
        }
        return bookShelfEl;
    }
    /**
     * Gets the book holder's element with the book id.
     * @param id
     * @returns
     */
    getBookHolder(id) { return this.booksOnShelf[id].bookHolderEl; }
    /**
     * Gets the book object with the book id.
     * @param id
     * @returns
     */
    getBook(id) { return this.booksOnShelf[id].book; }
    /**
     * Adds a book to this book shelf.
     * @param book
     */
    addBook(book, event) {
        const bookOnShelfEl = book.elementOnShelf;
        const bookHolderEl = document.createElement('div');
        bookHolderEl.className = "book-holder";
        bookHolderEl.appendChild(bookOnShelfEl);
        this.element.appendChild(bookHolderEl);
        this.booksOnShelf[book.id] = {
            book: book,
            bookHolderEl: bookHolderEl,
            position: Object.keys(this.booksOnShelf).length
        };
        //
        // Add event listeners to the book element.
        //
        for (const key in event) {
            bookOnShelfEl.addEventListener(key, event[key]);
        }
    }
    /**
     * Put back the book from the viewer to the shelf.
     * @param book
     */
    putbackBook(book) {
        if (book.elementOnShelf) {
            const bookHolderEl = this.getBookHolder(book.id);
            bookHolderEl.appendChild(book.elementOnShelf);
        }
    }
}

/**
 * BookViewer class
 * Gutter:
 *
 */
class BookViewer extends Base {
    /**
     *
     * @param id
     * @param view
     */
    registerView(view) { this.registeredViews[view.id] = view; }
    /**
     *
     * @param id
     * @returns
     */
    getView(id) { return this.registeredViews[id]; }
    constructor(bookManager) {
        super();
        /**
         *
         */
        this.registeredViews = {};
        this.bookViewerDocId = "bookViewer";
        this.bookShelfManager = bookManager;
        ({ bookViewerEl: this.element } = this.createViewerElements());
    }
    setCurView(viewId) {
        this.curView = this.getView(viewId);
    }
    /**
     * Creates the viewer related elements.
     * @returns ViewerElements
     */
    createViewerElements() {
        let viewerEl = document.getElementById(this.bookViewerDocId);
        if (viewerEl) {
            viewerEl.innerHTML = "";
        }
        else {
            viewerEl = document.createElement('div');
            viewerEl.id = this.bookViewerDocId;
            document.body.appendChild(viewerEl);
        }
        // Viewer
        viewerEl.className = "";
        viewerEl.classList.add("hidden");
        // Close Button
        const btnClose = document.createElement('button');
        btnClose.id = "btnClose";
        btnClose.innerHTML = "X";
        btnClose.addEventListener('click', (event) => { this.closeViewer(); });
        viewerEl.appendChild(btnClose);
        return { bookViewerEl: viewerEl };
    }
    ;
    /**
     * Opens the book on the viewer.
     * @param book
     * @param openPageIndex
     */
    view(book, openPageIndex = 0) {
        if (!this.curView) {
            throw new Error('Please select one view.');
        }
        this.book = book;
        this.element.className = 'hidden';
        const bookContainerEl = this.bookContainerEl = this.curView.getBookContainerEl();
        this.element.appendChild(bookContainerEl);
        this.element.classList.add(this.curView.id);
        this.curView.view(book, openPageIndex);
        this.element.classList.remove("hidden");
    }
    /**
     * Closes the book on the viewer.
     */
    closeViewer() {
        var _a;
        this.element.className = 'hidden';
        this.bookContainerEl && this.element.removeChild(this.bookContainerEl);
        (_a = this.curView) === null || _a === void 0 ? void 0 : _a.closeViewer();
        this.bookShelfManager.returnBookToShelf(this.book);
        if (this.book) {
            this.book.resetBook();
            if (this.bookContainerEl) {
                this.bookContainerEl.className = "";
                this.bookContainerEl.removeChild(this.book.element);
                this.bookContainerEl = undefined;
            }
            this.book = undefined;
        }
    }
    /**
     *
     * @param id
     */
    changeView(id) {
        console.log(this.registeredViews);
        const view = this.getView(id);
        if (view) {
            this.curView = view;
        }
    }
}

/**
 * BookManager class
 */
class BookShelfManager {
    /**
     *
     * @param bookShelfDocId
     * @param bookViewerId
     */
    constructor() {
        this.bookShelf = new BookShelf(this);
        this.bookViewer = new BookViewer(this);
    }
    /**
     * Change viewing book style.
     * @param type
     */
    getBookViewer() { return this.bookViewer; }
    /**
     * Gets a book holder's element with the book's id.
     * @param id
     * @returns
     */
    getBookHolder(id) { return this.bookShelf.getBookHolder(id); }
    /**
     * Gets a book object with the book's id.
     * @param id
     * @returns
     */
    getBook(id) { return this.bookShelf.getBook(id); }
    /**
     * Load books from the server and add them to the shelf.
     */
    loadAndAddBooks() {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Control the number of books to load.
            // TODO: fetch books from the server
            const bookSamplesLoaded = [
                {
                    id: "book1",
                    status: BookStatus.Close,
                    title: "Book 1",
                    type: BookType.Magazine,
                    author: "Shinkee",
                    publication: {
                        name: "Magzog",
                        location: "Auckland in New Zealand",
                        publishedDate: "2022-09-01"
                    },
                    size: new BookSize({
                        closed: { width: 600, height: 900, diagonal: 0 },
                        opened: { width: 1200, height: 900, diagonal: 0 }
                    }),
                    lastPageIndex: 5,
                    thumbnails: {
                        spine: "resources/cover.jpg",
                        small: "resources/cover.jpg",
                        medium: "resources/cover.jpg",
                        cover: {
                            front: "resources/cover.jpg",
                            back: "resources/cover.jpg",
                        }
                    },
                }
            ];
            bookSamplesLoaded.forEach((bookSample) => {
                this.addBookToShelf(bookSample);
            });
        });
    }
    /**
     * Load a book from the server and add it to the shelf.
     * @param id
     */
    loadAndAddBook(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: fetch book from the server
            const bookSample = {
                id: "book6",
                status: BookStatus.Close,
                title: "The Great Gatsby",
                type: BookType.Magazine,
                author: "Shinkee",
                publication: {
                    name: "Magzog",
                    location: "Auckland in New Zealand",
                    publishedDate: "2021-09-01"
                },
                size: new BookSize({
                    closed: { width: 600, height: 900, diagonal: 0 },
                    opened: { width: 1200, height: 900, diagonal: 0 }
                }),
                lastPageIndex: 5,
                thumbnails: {
                    spine: "resources/cover.webp",
                    small: "resources/cover.webp",
                    medium: "resources/cover.webp",
                    cover: {
                        front: "resources/cover.webp",
                        back: "resources/cover.webp",
                    }
                },
            };
            this.addBookToShelf(bookSample);
        });
    }
    importBookToShelf(book) {
        this.bookShelf.addBook(book, {
            click: (event) => { this.pickupAndView(this.getBook(book.id)); }
        });
    }
    /**
     * Append the book to the shelf.
     * @param id
     */
    addBookToShelf(book) {
        this.bookShelf.addBook(new Book(book), {
            click: (event) => { this.pickupAndView(this.getBook(book.id)); }
        });
    }
    /**
     * Pickup a book from the shelf and view it on the viewer.
     * @param book
     * @returns
     */
    pickupAndView(book) {
        var _a;
        if (book.status == BookStatus.Open) {
            return;
        }
        book.status = BookStatus.Open;
        (_a = this.bookViewer) === null || _a === void 0 ? void 0 : _a.view(book);
    }
    /**
     * Put back the book from the viewer to the shelf.
     * @param book
     */
    returnBookToShelf(book) {
        if (!book) ;
        else {
            if (book.status == BookStatus.Close) {
                return;
            }
            book.status = BookStatus.Close;
            this.bookShelf.putbackBook(book);
        }
    }
}

export { Base, Book, BookEl, BookEvent, BookShelf, BookShelfManager, BookViewer, Page, PageEl, PageEvent };
