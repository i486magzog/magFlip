import { ISize } from "../common/dimension";
import { DefaultSize, IPageLabel, IPageLabelData, PageLabelType } from "../common/models";
import { PageLabelEl } from "./pageLabelEl";
/**
 * 
 */
export enum PageLabelEvent {
}
/**
 * Page class
 */
export class PageLabel extends PageLabelEl implements IPageLabel {
  /**
   * Returns the page's index which is the sequence number.
   * This number is unique in a book.
   */
  readonly index: number;
  /**
   * Returns the page's index in the book.
   */
  readonly pageIndex: number;
  /**
   * Returns the page's type.
   */
  readonly type: PageLabelType;
  /**
   * Returns the page's size.
   */
  readonly size: ISize;
  /**
   * Returns the page's number which is set by editors.
   */
  // readonly number: number | undefined;
  /**
   * Returns the ignore value whether this page is ignored or not.
   */
  ignore: boolean;
  /**
   * Returns the content of this page.
   */
  content: any;
  
  constructor(label:IPageLabelData) {
    super(label);
    // TODO: id should be unique and exist.
    this.index = label.index;
    this.pageIndex = label.pageIndex;
    this.type = label.type || PageLabelType.Default;
    this.size = label.size || { width: DefaultSize.pageWidth, height: DefaultSize.pageHeight };
    // TODO: index should be unique and exist.
    this.index = label.index;
    this.ignore = label.ignore || false;
    this.content = label.content || "";
    this.setEvents();
  }
  /**
   * Adds all events related to this page.
   * @param handlers 
   */
  setEvents():void{
    
  }
}