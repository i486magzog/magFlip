import { IPageLabelData, PageLabelType } from "../common/models";
import { Base } from "./base";
/**
 * This is an object type used to reference Elements related to the Page.
 */
type PageLabelElements = {
  element: HTMLElement,
  // contentContainerEl: HTMLElement,
  contentEl: HTMLElement,
}
/**
 * Page class
 */
export class PageLabelEl extends Base {
  /**
   * Returns the element of this page.
   */
  readonly element: HTMLElement;
  /**
   * Returns the content container element of this page.
   */
  // readonly contentContainerEl: HTMLElement;
  /**
   * Returns the content element of this page.
   */
  readonly contentEl: HTMLElement;

  
  constructor(label:IPageLabelData) {
    super();
    ({ element:this.element,
      // contentContainerEl:this.contentContainerEl,
        contentEl: this.contentEl } = this.createPageLabelElement(label));
    }
  /**
   * Creates the elements of this page.
   * @param page 
   * @returns 
   */
  private createPageLabelElement(label: IPageLabelData):PageLabelElements {
    const labelEl = document.createElement('div'); 
    const initialTop = 30;
    const gap = 7;
    labelEl.className = "page-label";
    labelEl.style.top = label.top 
      ? label.top + "px" 
      : label.index * (label.size?.height || 30 + gap) + initialTop + 'px';  
    if(label.type == PageLabelType.Empty){ labelEl.classList.add("blank"); }

    const contentEl = document.createElement('div');
    contentEl.className = "page-label-content";
    contentEl.innerHTML = label.content;
    contentEl.style.backgroundColor = label.backgroundColor || 'rgb(48, 171, 237)';
    contentEl.style.opacity = label.opacity ? label.opacity.toString() : '1';
    labelEl.appendChild(contentEl);

    if(label.onClick){
      contentEl.addEventListener('click', (event: Event) => {
        label.onClick && label.onClick(label.pageIndex);
      });
    }
    
    return {
      element: labelEl,
      contentEl: contentEl
    };
  }

  resetLabelEls(){
    const children = Array.from(this.element.children);
    children.forEach(child => {
      if(child === this.contentEl){
        const grandChildren = Array.from(child.children);
        grandChildren.forEach(grandChild => {
          child.removeChild(grandChild);
        })
      } else { this.element.removeChild(child); }
    });
  }
}