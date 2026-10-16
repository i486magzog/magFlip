import { IBookData, IPageLabelData } from "../common/models";
import { Base } from "./base";
import { PageLabelEl } from "./pageLabelEl";

interface IBookElElements {
  bookEl: HTMLElement;
  containerEl: HTMLElement;
  labelContainerEl: HTMLElement;
  // labelLeftSubContainerEl: HTMLElement;
  // labelRightSubContainerEl: HTMLElement;
}
/**
 * A label's element, the page it marks and the data it was made from.
 */
export interface IPageLabelElement {
  pageIndex: number;
  element: HTMLElement;
  data: IPageLabelData;
}
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
   * Returns the book element shown on the book viewer.
   */
  readonly element: HTMLElement;
  /**
   * Returns the page container element.
   */
  readonly pageContainerEl: HTMLElement;
  /**
   * Returns the label container element.
   */
  readonly labelContainerEl: HTMLElement;
  /**
   * Returns the labels' elements, each with the page it marks.
   * A view decides which side of the book each one sticks out of.
   */
  readonly labelEls: IPageLabelElement[] = [];
  /**
   * Returns the left sub container element.
   */
  // readonly labelLeftSubContainerEl: HTMLElement;
  /**
   * Returns the right sub container element.
   */
  // readonly labelRightSubContainerEl: HTMLElement;

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
    this.element = elements.bookEl;
    this.pageContainerEl = elements.containerEl;
    this.labelContainerEl = elements.labelContainerEl;
    this.createLabels(book.labels || {});
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
  private createBookElement(): IBookElElements {
    const bookEl = document.createElement('div');
    const containerEl = document.createElement('div');
    // const labelContainerEls = this.createLabelContainerEl();
    const labelContainerEl = document.createElement('div');
    labelContainerEl.className = "label-container";
    bookEl.className = "book";
    containerEl.className = "container";
    bookEl.appendChild(labelContainerEl);
    bookEl.appendChild(containerEl);

    return { 
      bookEl: bookEl, 
      containerEl: containerEl, 
      labelContainerEl: labelContainerEl, 
    };
  }
  /**
   * Creates and adds the page labels to the book.
   * @param labels 
   */
  private createLabels(labels:{ [key:number|string]: IPageLabelData }){
    Object.keys(labels).forEach(label => { this.addLabelEl(labels[label]); })
  }
  /**
   * Adds the page label to the book.
   * @param label 
   */
  private addLabelEl(label:IPageLabelData){ 
    const labelEl = new PageLabelEl(label);
    this.labelContainerEl.appendChild(labelEl.element);
    this.labelEls.push({ pageIndex: label.pageIndex, element: labelEl.element, data: label });
  }
  /**
   * Makes another element for a label, for a view that shows the label in more than one place,
   * such as on the page it marks as well as in the label container.
   * @param label The data of the label.
   * @returns A new element that answers a click as the label does.
   */
  createLabelEl(label:IPageLabelData):HTMLElement { return new PageLabelEl(label).element; }
  /**
   * Clears the children elements of the page container's element.
   */
  private clearPageEls() { this.pageContainerEl.innerHTML = ""; }
  /**
   * Removes what a view added to the book, keeping the pages' container and the labels,
   * which the book made itself and needs the next time it opens.
   */
  protected resetBookEls(){ 
    const children = Array.from(this.element.children);
    children.forEach(child => {
      if(child !== this.pageContainerEl && child !== this.labelContainerEl){ this.element.removeChild(child); }
    });
    this.clearPageEls(); 
  }
}
