'use strict';

var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 *
 */
class ScrollView {
    constructor() {
        /**
         * This id is unique string for FlipView object.
         */
        this.id = 'scroll-view';
        ({ bookContainerEl: this.bookContainerEl } = this.createElements());
    }
    /**
     * Creates the viewer related elements.
     * @returns ViewerElements
     */
    createElements() {
        const bookContainerEl = document.createElement('div');
        bookContainerEl.id = "bookContainer";
        return {
            // bookViewerEl: bookViewerEl,
            bookContainerEl: bookContainerEl
        };
    }
    ;
    getBookContainerEl() { return this.bookContainerEl; }
    /**
     *
     * @param book
     * @param openPageIndex
     */
    view(book, openPageIndex = 0) {
        this.attachBook(book);
        this.setViewer();
        const indexRange = { start: openPageIndex - 3, cnt: 6 };
        this.loadPages(indexRange);
        this.showPages(indexRange);
        return this.bookContainerEl;
    }
    /**
     *
     */
    closeViewer() {
        // TODO Save current book status.
        this.detachBook();
    }
    /**
     * Returns the book back to the BookManager.
     */
    detachBook() {
        this.book = undefined;
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
    }
    /**
     * Set the viewer to work.
     */
    setViewer() {
        if (!this.book) {
            throw new Error("Book object does not exist.");
        }
        const { closed, opened } = this.book.size;
        const docStyle = document.documentElement.style;
        docStyle.setProperty('--opened-book-width', `${opened.width}px`);
        docStyle.setProperty('--closed-book-width', `${closed.width}px`);
        docStyle.setProperty('--book-height', `${closed.height}px`);
        docStyle.setProperty('--page-width', `${closed.width}px`);
        docStyle.setProperty('--page-height', `${closed.height}px`);
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
     * @param index
     */
    showPages(indexRange) {
        const book = this.book;
        if (!book) {
            throw new Error("Error the book opening");
        }
        //
        // Load the pages to the window 
        // & append page elements to dom.
        //
        const maxIndex = indexRange.start + indexRange.cnt;
        for (let i = indexRange.start; i < maxIndex; i++) {
            const page = book.getPage(i);
            if (page) {
                book.appendPageEl(page.element);
            }
        }
    }
}

exports.ScrollView = ScrollView;
