import { IBookData } from "@magflip/common";
import { Base } from "./base";

/**
 * Book element management class
 */
export class BookEl extends Base {
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

  constructor(book:IBookData) {
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
  appendPageEl(pageEl:HTMLElement){ this.pageContainerEl.appendChild(pageEl); }
  /**
   * Prepends a page element into the page container element.
   * @param pageEl the page element to prepend.
   */
  prependPageEl(pageEl:HTMLElement){ this.pageContainerEl.prepend(pageEl); }
  /**
   * Remove a page element from the page container element.
   * @param pageEl the page element to remove.
   */
  removePageEl(pageEl:HTMLElement){ this.pageContainerEl.removeChild(pageEl); }
  /**
   * Creates the book element and child elements
   * @returns 
   */
  private createBookElement(): { bookOnShelfEl: HTMLElement, bookEl: HTMLElement, containerEl: HTMLElement } {
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
  private clearPageEls() { this.pageContainerEl.innerHTML = ""; }
  /**
   * 
   */
  protected resetBookEls(){ 
    const children = Array.from(this.element.children);
    children.forEach(child => {
      if(child !== this.pageContainerEl){ this.element.removeChild(child); }
    });
    this.clearPageEls(); 
  }
}