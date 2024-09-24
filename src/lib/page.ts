import { DefaultSize, ISize, IPageData, PageType, IEventHandlers } from "./models.js";
/**
 * Page class
 */
export class Page implements IPageData {
    /**
     * id
     */
    id: string;
    type: PageType;
    size: ISize;
    index: number;
    number: number | undefined;
    ignore: boolean;
    content: any;
    
    element: HTMLElement;
    
    constructor(page:IPageData, eventHandlers:IEventHandlers|null = null) {
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
  
    static emptyPage(index:number, size:ISize):Page { return this.createEmptyOrBlankPage(PageType.Empty, index, size); }
    static blankPage(index:number, size:ISize):Page { return this.createEmptyOrBlankPage(PageType.Blank, index, size); }  
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
        pageEl.classList.add("empty");
        const contentEl = document.createElement('div');
        contentEl.className = "content";
        // contentEl.style.width = `${page.size.width}px`;
        // contentEl.style.height = `${page.size.height}px`;
        contentEl.innerHTML += `<span>${page.index}</span>`;
        pageEl.appendChild(contentEl);
        return pageEl; 
      }
      else if(page.type == PageType.Blank){ 
        const contentEl = document.createElement('div');
        contentEl.className = "content";
        // contentEl.style.width = `${page.size.width}px`;
        // contentEl.style.height = `${page.size.height}px`;
        contentEl.innerHTML += `<span>${page.index}</span>`;
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
        // Shadow
        const shadowDiv = document.createElement('div');
        shadowDiv.classList.add('shadow');
        const shadow6 = document.createElement('div');
        shadow6.classList.add('shadow6');
        const svgNS = "http://www.w3.org/2000/svg";
        const shadow3Svg = document.createElementNS(svgNS, 'svg');
        shadow3Svg.classList.add('shadow3-svg');
        const shadow3Shape = document.createElementNS(svgNS, 'polygon');
        shadow3Shape.classList.add('shape');
        shadow3Shape.setAttribute('points', '0,0');
        shadow3Shape.setAttribute('fill', 'url(#shadow3)');
        
        // shadowSvg.append(shadow3);
        shadow3Svg.appendChild(shadow3Shape);
        shadowDiv.appendChild(shadow3Svg);
        
        const gutterShadow = document.createElement('div');
        gutterShadow.className = "shadow2";
        const contentContainerEl = document.createElement('div');
        contentContainerEl.className = `content-container`;
        const contentEl = document.createElement('div');
        contentEl.className = `content bg${page.index}`;
        contentEl.innerHTML = page.content;
        contentEl.innerHTML += `<img src="./resources/page${page.index+1}.jpg"/>`;
        // contentEl.innerHTML += `<h1>Magzog</h1>`;
        // contentEl.innerHTML += `<p>Magzog is a simple and easy to use magazine layout for web pages. It is a responsive layout that can be used for any kind of web page. It is a simple and easy to use layout that can be used for any kind of web page. It is a simple and easy to use layout that can be used for any kind of web page. It is a simple and easy to use layout that can be used for any kind of web page. It is a simple and easy to use layout that can be used for any kind of web page. It is a simple and easy to use layout that can be used for any kind of web page. It is a simple and easy to use layout that can be used for any kind of web page. It is a simple and easy to use layout that can be used for any kind of web page. It is a simple and easy to use layout that can be used for any kind of web page.</p>`;
        // contentEl.innerHTML += `<span>${page.index}</span>`;
        contentContainerEl.appendChild(contentEl)
        contentContainerEl.appendChild(gutterShadow)
        pageEl.appendChild(contentContainerEl);
        pageEl.appendChild(shadow6);
        pageEl.appendChild(shadowDiv);
      }

      return pageEl;
    }

    addEventListener(handlers:IEventHandlers|null){
      this.element.addEventListener('click', (event:Event) => { handlers?.clicked(event, this) })
      this.element.addEventListener('mousemove', (event:Event) => { handlers?.mousemoved(event, this) })
    }
  }