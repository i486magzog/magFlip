type Listener = (...args: any[]) => void;
declare class MZEvent {
    private listeners;
    addEventListener(event: string, listener: Listener): void;
    removeEventListener(event: string, listener: Listener): void;
    emitEvent(event: string, ...args: any[]): void;
}

declare class Base extends MZEvent {
    constructor();
}

interface ISize {
    width: number;
    height: number;
}
interface ISizeExt {
    width: number;
    height: number;
    readonly diagonal: number;
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
declare enum BookType {
    Book = "Book",
    Magazine = "Magazine",
    Newspaper = "Newspaper"
}
declare enum BookStatus {
    Open = "Open",
    Close = "Close"
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
interface IPage extends IPageData, IPageEl {
    size: ISize;
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

/**
 * Book element management class
 */
declare class BookEl extends Base {
    /**
     * Returns and sets the info of thumbnails for the book.
     */
    thumbnails: {
        spine: string;
        small: string;
        medium: string;
        cover: {
            front: string;
            back: string;
        };
    };
    /**
     * Returns the the book element shown on the book shelf.
     */
    readonly elementOnShelf: HTMLElement;
    /**
     * Returns the book element shown on the book viewer.
     */
    readonly element: HTMLElement;
    /**
     * Returns the page container element.
     */
    readonly pageContainerEl: HTMLElement;
    constructor(book: IBookData);
    /**
     * Appends a page element into the page container element.
     * @param pageEl the page element to append.
     */
    appendPageEl(pageEl: HTMLElement): void;
    /**
     * Prepends a page element into the page container element.
     * @param pageEl the page element to prepend.
     */
    prependPageEl(pageEl: HTMLElement): void;
    /**
     * Remove a page element from the page container element.
     * @param pageEl the page element to remove.
     */
    removePageEl(pageEl: HTMLElement): void;
    /**
     * Creates the book element and child elements
     * @returns
     */
    private createBookElement;
    /**
     * Clears the children elements of the page container's element.
     */
    private clearPageEls;
    /**
     *
     */
    protected resetBookEls(): void;
}

/**
 * Page class
 */
declare class PageEl extends Base {
    /**
     * Returns the element of this page.
     */
    readonly element: HTMLElement;
    /**
     * Returns the content container element of this page.
     */
    readonly contentContainerEl: HTMLElement;
    /**
     * Returns the content element of this page.
     */
    readonly contentEl: HTMLElement;
    constructor(page: IPageData);
    /**
     * Creates the elements of this page.
     * @param page
     * @returns
     */
    private createPageElement;
    resetPageEls(): void;
}

/**
 *
 */
declare enum PageEvent {
}
/**
 * Page class
 */
declare class Page extends PageEl implements IPage {
    /**
     * Returns the page's id.
     */
    readonly id: string;
    /**
     * Returns the page's type.
     */
    readonly type: PageType;
    /**
     * Returns the page's size.
     */
    readonly size: ISize;
    /**
     * Returns the page's index which is the sequence number.
     * This number is unique in a book.
     */
    readonly index: number;
    /**
     * Returns the page's number which is set by editors.
     */
    readonly number: number | undefined;
    /**
     * Returns the ignore value whether this page is ignored or not.
     */
    ignore: boolean;
    /**
     * Returns the content of this page.
     */
    content: any;
    image: string;
    constructor(page: IPageData);
    /**
     * Creates and return an empty page.
     * @param index
     * @param size
     * @returns
     */
    static emptyPage(index: number, size: ISize): Page;
    /**
     * Creates and return an blank page.
     * @param index
     * @param size
     * @returns
     */
    static blankPage(index: number, size: ISize): Page;
    /**
     * Creates and return an empty or blank page.
     * @param index
     * @param size
     * @returns
     */
    private static createEmptyOrBlankPage;
    /**
     * Adds all events related to this page.
     * @param handlers
     */
    setEvents(): void;
}

declare enum BookEvent {
    pageAdded = "pageAdded"
}
/**
 * Book class
 */
declare class Book extends BookEl implements IBook {
    /**
     * Returns the book id.
     */
    readonly id: string;
    /**
     * Returns and sets the book status such as close, open and so on.
     */
    status: BookStatus;
    /**
     * Returns and sets the book type.
     */
    type: BookType;
    /**
     * Returns the book's title.
     */
    readonly title: string;
    /**
     * Returns the book's author.
     */
    readonly author: string;
    /**
     * Returns the book's publication.
     */
    readonly publication: IPublication;
    /**
     * Returns the book's size.
     */
    readonly size: BookSize;
    /**
     * Return the last page index.
     */
    readonly lastPageIndex: number;
    /**
     * Returns and sets pages that the book contains
     */
    private pages;
    /**
     *
     */
    thumbnails: {
        spine: string;
        small: string;
        medium: string;
        cover: {
            front: string;
            back: string;
        };
    };
    constructor(book: IBookData);
    /**
     * Fetches and adds a page from server.
     * @param index
     * @returns
     */
    fetchPage(index: number): Promise<IPageData>;
    /**
     * Fetches and adds pages from server.
     * @param indexRange the indice of the pages to fetches
     * @returns
     */
    fetchPages(indexRange: {
        start: number;
        cnt: number;
    }): Promise<IPageData[]>;
    importPages(pages: IPageData[], size: ISize): void;
    /**
     * Adds a page object to the book.
     * @param page
     * @param index
     */
    addPage(page: IPage, index: number): void;
    /**
     * Remove a page object from the book.
     * @param index
     */
    removePage(index: number): void;
    /**
     * Returns the page object with the page index.
     * @param index
     * @returns
     */
    getPage(index: number): IPage;
    /**
     * Returns the pages object.
     * @returns
     */
    getPages(): {
        [n: string]: IPage;
        [n: number]: IPage;
    };
    /**
     * Return the pages array length.
     */
    getPageCnt(): number;
    /**
     * Returns the page element with the page index.
     * @param index
     * @returns
     */
    getPageEl(index: number): HTMLElement;
    /**
     * Creates and adds an empty page object.
     * @param index
     * @param size
     * @returns
     */
    createEmptyPage(index: number, size?: ISize): Page;
    setEvents(event: BookEvent, handler: (event: Event) => void): void;
    resetBook(): Promise<void>;
}

/**
 * This is an object type used to reference Elements related to the Viewer.
 */
type BookViewerElements = {
    bookViewerEl: HTMLElement;
};
/**
 * BookViewer class
 * Gutter:
 *
 */
declare class BookViewer extends Base {
    /**
     *
     */
    private registeredViews;
    /**
     *
     * @param id
     * @param view
     */
    registerView(view: IBookView): void;
    /**
     *
     * @param id
     * @returns
     */
    private getView;
    /**
     * Book object.
     * This contains the most information of a book loaded to this viewer.
     */
    private book;
    /**
     * This is html document id of the book viewer.
     * It is set when creating a viewer instance or default value 'bookViewer' is set.
     */
    private readonly bookViewerDocId;
    /**
     * Returns the instance of BookManager.
     */
    private readonly bookShelfManager;
    /**
     * Returns the DOM element of the book viewer with id 'bookViewer'.
     */
    private readonly element;
    /**
     * Returns the DOM element of the book container with id 'bookContainer'.
     */
    private bookContainerEl;
    /**
     * Returns the instance of current Viewer.
     */
    private curView;
    constructor(bookManager: BookShelfManager);
    setCurView(viewId: string): void;
    /**
     * Creates the viewer related elements.
     * @returns ViewerElements
     */
    private createViewerElements;
    /**
     * Opens the book on the viewer.
     * @param book
     * @param openPageIndex
     */
    view(book: Book, openPageIndex?: number): void;
    /**
     * Closes the book on the viewer.
     */
    closeViewer(): void;
    /**
     *
     * @param id
     */
    changeView(id: string): void;
}

/**
 * BookManager class
 */
declare class BookShelfManager {
    /**
     * Returns the BookShelf instance.
     */
    private readonly bookShelf;
    /**
     * Returns the BookViewer instance.
     */
    private readonly bookViewer;
    /**
     *
     * @param bookShelfDocId
     * @param bookViewerId
     */
    constructor();
    /**
     * Change viewing book style.
     * @param type
     */
    getBookViewer(): BookViewer;
    /**
     * Gets a book holder's element with the book's id.
     * @param id
     * @returns
     */
    getBookHolder(id: string): Element;
    /**
     * Gets a book object with the book's id.
     * @param id
     * @returns
     */
    getBook(id: string): Book;
    /**
     * Load books from the server and add them to the shelf.
     */
    loadAndAddBooks(): Promise<void>;
    /**
     * Load a book from the server and add it to the shelf.
     * @param id
     */
    loadAndAddBook(id: string): Promise<void>;
    importBookToShelf(book: Book): void;
    /**
     * Append the book to the shelf.
     * @param id
     */
    addBookToShelf(book: IBookData): void;
    /**
     * Pickup a book from the shelf and view it on the viewer.
     * @param book
     * @returns
     */
    pickupAndView(book: Book): void;
    /**
     * Put back the book from the viewer to the shelf.
     * @param book
     */
    returnBookToShelf(book: Book | undefined): void;
}

interface IBookOnShelf {
    book: Book;
    bookHolderEl: Element;
    position: number;
}
/**
 * BookShelf class
 */
declare class BookShelf {
    /**
     * Returns the BookManager's instance.
     */
    readonly bookManager: BookShelfManager;
    /**
     * Returns the book shelf's document id.
     */
    readonly bookShelfDocId: string;
    /**
     * Returns and sets the books on the book shelf.
     */
    booksOnShelf: {
        [id: string]: IBookOnShelf;
    };
    /**
     * Returns this book shelf's element.
     */
    readonly element: Element;
    constructor(bookManager: BookShelfManager);
    /**
     * Creates all book shelf elements.
     * @returns
     */
    createElement(): Element;
    /**
     * Gets the book holder's element with the book id.
     * @param id
     * @returns
     */
    getBookHolder(id: string): Element;
    /**
     * Gets the book object with the book id.
     * @param id
     * @returns
     */
    getBook(id: string): Book;
    /**
     * Adds a book to this book shelf.
     * @param book
     */
    addBook(book: Book, event: {
        [key: string]: (event: Event) => void;
    }): void;
    /**
     * Put back the book from the viewer to the shelf.
     * @param book
     */
    putbackBook(book: Book): void;
}

export { Base, Book, BookEl, BookEvent, BookShelf, BookShelfManager, BookViewer, type BookViewerElements, Page, PageEl, PageEvent };
