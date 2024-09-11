import { DefaultSize, Size, IPageData, PageType, EventHandlers } from "./models.js";
/**
 * Page class
 */
export class Page implements IPageData {
    /**
     * id
     */
    id: string;
    type: PageType;
    size: Size;
    index: number;
    number: number | undefined;
    ignore: boolean;
    content: any;
    
    element: HTMLElement;
    
    constructor(page:IPageData, eventHandlers:EventHandlers|null = null) {
      // TODO: id should be unique and exist.
      this.id = page.id;
      this.type = page.type || PageType.Page;
      this.number = page.number || undefined;
      this.size = page.size || { width: DefaultSize.pageWidth, height: DefaultSize.pageHeight };
      // TODO: index should be unique and exist.
      this.index = page.index;
      this.ignore = page.ignore || false;
      this.content = page.content || "";
      this.element = this.createPageElement(page);
      this.addEventListener(eventHandlers);
    }
  
    static emptyPage(index:number):Page { return this.createEmptyOrBlankPage(index, PageType.Empty); }
    static blankPage(index:number):Page { return this.createEmptyOrBlankPage(index, PageType.Blank); }  
    private static createEmptyOrBlankPage(index:number, type:PageType):Page {
      return new Page({
        id: `emptyPage${index}`,
        type: type,
        size: { width: 0, height: 0 },
        number: undefined,
        index: index,
        ignore: true,
        content: "",
      });
    }
    /**
     * 
     * @param page 
     * @returns 
     */
    createPageElement(page: IPageData):HTMLElement {
      const pageEl = document.createElement('div');
      pageEl.className = "page";
      pageEl.setAttribute('pageIdx', `${page.index}`);
      //
      // <div class="page" pageIdx="${page.index}">
      //
      if(page.type == PageType.Empty){ 
        pageEl.classList.add("hidden");
        return pageEl; 
      }
      else if(page.type == PageType.Blank){ 
        const contentEl = document.createElement('div');
        contentEl.className = "content";
        contentEl.style.width = `${page.size.width}px`;
        contentEl.style.height = `${page.size.height}px`;
        contentEl.innerHTML += `<span>${page.number}</span>`;
        pageEl.appendChild(contentEl);
        return pageEl; 
      }
      //
      // <div class="page" pageIdx="${page.index}">
      //   <div class="content" width="${page.size.width}px" height="${page.size.height}px">
      //       ${page.content}
      //       <h1>Magzog</h1>
      //       <p>Magzog is a simple and easy to use magazine layout for web pages. It is a responsive layout that can be used for any kind of web page. It is a simple and easy to use layout that can be used for any kind of web page. It is a simple and easy to use layout that can be used for any kind of web page. It is a simple and easy to use layout that can be used for any kind of web page. It is a simple and easy to use layout that can be used for any kind of web page. It is a simple and easy to use layout that can be used for any kind of web page. It is a simple and easy to use layout that can be used for any kind of web page. It is a simple and easy to use layout that can be used for any kind of web page. It is a simple and easy to use layout that can be used for any kind of web page.</p>
      //       <span>${page.number}</span>
      //   </div>
      // </div>
      //
      else {
        const contentEl = document.createElement('div');
        contentEl.className = "content";
        contentEl.style.width = `${page.size.width}px`;
        contentEl.style.height = `${page.size.height}px`;
        contentEl.innerHTML = page.content;
        contentEl.innerHTML += `<h1>Magzog</h1>`;
        contentEl.innerHTML += `<p>Magzog is a simple and easy to use magazine layout for web pages. It is a responsive layout that can be used for any kind of web page. It is a simple and easy to use layout that can be used for any kind of web page. It is a simple and easy to use layout that can be used for any kind of web page. It is a simple and easy to use layout that can be used for any kind of web page. It is a simple and easy to use layout that can be used for any kind of web page. It is a simple and easy to use layout that can be used for any kind of web page. It is a simple and easy to use layout that can be used for any kind of web page. It is a simple and easy to use layout that can be used for any kind of web page. It is a simple and easy to use layout that can be used for any kind of web page.</p>`;
        contentEl.innerHTML += `<span>${page.number}</span>`;
        pageEl.appendChild(contentEl);
      }
      return pageEl;
    }

    addEventListener(handlers:EventHandlers|null){
      this.element.addEventListener('click', (event:Event) => { handlers?.clicked(event, this) })
      this.element.addEventListener('mousemove', (event:Event) => { handlers?.mousemoved(event, this) })
    }
  }