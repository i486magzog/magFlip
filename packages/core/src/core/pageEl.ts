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
   * The data this page was created from. Kept because the elements are built
   * from it later, not in the constructor.
   */
  protected readonly pageData: IPageData;
  /**
   * The elements of this page, once they were needed.
   */
  private pageEls: PageElements | undefined;

  
  constructor(page:IPageData) {
    super();
    this.pageData = page;
  }
  /**
   * Returns the element of this page.
   */
  get element():HTMLElement { return this.getPageEls().element; }
  /**
   * Returns the content container element of this page.
   */
  get contentContainerEl():HTMLElement { return this.getPageEls().contentContainerEl; }
  /**
   * Returns the content element of this page.
   */
  get contentEl():HTMLElement { return this.getPageEls().contentEl; }
  /**
   * Returns whether the elements of this page were built.
   *
   * A book can hold thousands of pages while only the handful in the window
   * has elements, so anything that walks every page should ask this before
   * reaching for one.
   */
  get hasElements():boolean { return this.pageEls !== undefined; }
  /**
   * Returns the elements of this page, building them the first time they are
   * asked for.
   *
   * Building a page means drawing its content, which for a published book also
   * downloads it. Doing that for every page of a long book when the book is
   * opened is what this defers: a page is built when a view puts it on screen.
   */
  private getPageEls():PageElements {
    if(!this.pageEls){ this.pageEls = this.createPageElement(this.pageData); }
    return this.pageEls;
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
      if(page.render){ page.render(contentEl); }
      else {
        contentEl.innerHTML = page.content || '';
        contentEl.innerHTML += page.image ? `<img src="${page.image}"/>` : '';
      }
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
    // A page that was never shown has nothing to reset, and building it here
    // would undo the point of building it late.
    if(!this.pageEls){ return; }

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
