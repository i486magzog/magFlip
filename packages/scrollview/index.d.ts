import { Book } from '@magflip/core';
import { IBookView } from '@magflip/common';

/**
 * This is an object type used to reference Elements related to the ScrollingViewer.
 */
type ScrollViewerElements = {
    bookContainerEl: HTMLElement;
};
/**
 *
 */
declare class ScrollView implements IBookView {
    /**
     * This id is unique string for FlipView object.
     */
    readonly id = "scroll-view";
    /**
     * Book object.
     * This contains the most information of a book loaded to this viewer.
     */
    private book;
    /**
     * Returns the DOM element of the book container with id 'bookContainer'.
     */
    readonly bookContainerEl: HTMLElement;
    constructor();
    /**
     * Creates the viewer related elements.
     * @returns ViewerElements
     */
    createElements(): ScrollViewerElements;
    getBookContainerEl(): HTMLElement;
    /**
     *
     * @param book
     * @param openPageIndex
     */
    view(book: Book, openPageIndex?: number): HTMLElement;
    /**
     *
     */
    closeViewer(): void;
    /**
     * Returns the book back to the BookManager.
     */
    private detachBook;
    /**
     * Attach a book to this book viewer.
     */
    private attachBook;
    /**
     * Set the viewer to work.
     */
    private setViewer;
    /**
     * Fetches and loads pages.
     * @param indexRange
     */
    private loadPages;
    /**
     *
     * @param index
     */
    private showPages;
}

export { ScrollView };
