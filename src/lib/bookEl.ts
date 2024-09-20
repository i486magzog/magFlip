import { ISize } from "./models.js";

/**
 * Book class
 */
export class BookEl {
  thumbnails: {
    spine: string;
    small: string;
    medium: string;
    cover: {
      front: string;
      back: string;
    };
  };
  // 
  elementOnShelf: HTMLElement;
  element: HTMLElement;
  pageContainerEl: HTMLElement;

  constructor(size:ISize, thumbnails:any) {
    // TODO: id should be unique and exist.
    this.thumbnails = thumbnails || {
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
    const elements = this.createBookElement(size);
    this.elementOnShelf = elements.bookOnShelfEl;
    this.element = elements.bookEl;
    this.pageContainerEl = elements.containerEl;
  }

  clearPageEls() { this.pageContainerEl.innerHTML = ""; }
  appendPageEl(pageEl:HTMLElement){ this.pageContainerEl.appendChild(pageEl); }
  prependPageEl(pageEl:HTMLElement){ this.pageContainerEl.prepend(pageEl); }
  removePageEl(pageEl:HTMLElement){ this.pageContainerEl.removeChild(pageEl); }

  createBookElement(size:ISize): { bookOnShelfEl: HTMLElement, bookEl: HTMLElement, containerEl: HTMLElement } {
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
}
