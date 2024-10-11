import { IPageData, PageType } from "../common/models";
import { Base } from "./base";
/**
 * This is an object type used to reference Elements related to the Page.
 */
type PageElements = {
  element: HTMLElement,
  contentContainerEl: HTMLElement,
  contentEl: HTMLElement,
}
/**
 * Page class
 */
export class PageEl extends Base {
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

  
  constructor(page:IPageData) {
    super();
    ({ element:this.element,
      contentContainerEl:this.contentContainerEl,
      contentEl: this.contentEl } = this.createPageElement(page));
  }
  /**
   * Creates the elements of this page.
   * @param page 
   * @returns 
   */
  private createPageElement(page: IPageData):PageElements {
    const pageEl = document.createElement('div'); 
    pageEl.className = "page";
    pageEl.setAttribute('pageIdx', `${page.index}`);

    if(page.type == PageType.Empty){ 
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
    else if(page.type == PageType.Blank){ 
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
      contentContainerEl.appendChild(contentEl)
      pageEl.appendChild(contentContainerEl);
      
      return {
        element: pageEl,
        contentContainerEl: contentContainerEl,
        contentEl: contentEl
      };
    }
  }

  resetPageEls(){
    const children = Array.from(this.element.children);
    children.forEach(child => {
      if(child === this.contentContainerEl){
        const grandChildren = Array.from(child.children);
        grandChildren.forEach(grandChild => {
          if(grandChild !== this.contentEl){ child.removeChild(grandChild); }
        })
      } else { this.element.removeChild(child); }
    });
  }
}