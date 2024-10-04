import { ISize, DefaultSize, IPageData, PageType } from "@magflip/common";
import { PageEl } from "./pageEl";
/**
 * 
 */
export enum PageEvent {
}
/**
 * Page class
 */
export class Page extends PageEl implements IPageData {
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

  
  constructor(page:IPageData) {
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
  static emptyPage(index:number, size:ISize):Page { return this.createEmptyOrBlankPage(PageType.Empty, index, size); }
  /**
   * Creates and return an blank page.
   * @param index 
   * @param size 
   * @returns 
   */
  static blankPage(index:number, size:ISize):Page { return this.createEmptyOrBlankPage(PageType.Blank, index, size); }  
  /**
   * Creates and return an empty or blank page.
   * @param index 
   * @param size 
   * @returns 
   */
  private static createEmptyOrBlankPage(type:PageType, index:number, size:ISize):Page {
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
  setEvents(){
    
  }
}