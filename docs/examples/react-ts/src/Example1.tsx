import { useEffect, useState } from "react";
import { Book, BookShelfManager } from "@magflip/core";
import { FlipView } from "@magflip/flipview";

export function Example1() {
  const [shelfManager, setShelfManager] = useState<BookShelfManager | null>(null);

  useEffect(() => {
    if(shelfManager === null) {
      setShelfManager(new BookShelfManager());
      return;
    }
    else {
      const pages = [
        {
            id: "page0",
            index: 0,
            image: '/resources/book1/page0.jpg'
        },
        {
            id: "page1",
            index: 1,
            image: '/resources/book1/page1.jpg'
        },
        {
            id: "page2",
            index: 2,
            image: '/resources/book1/page2.jpg'
        },
        {
            id: "page3",
            index: 3,
            image: '/resources/book1/page3.jpg'
        },
        {
            id: "page4",
            index: 4,
            image: '/resources/book1/page4.jpg'
        },
        {
            id: "page5",
            index: 5,
            image: '/resources/book1/page5.jpg'
        },
      ];

      const book = new Book({ 
        id: 'mybook1', 
        lastPageIndex: 5,
        thumbnails: {
          spine: pages[0].image,
          small: pages[0].image,
          medium: pages[0].image,
          cover: {
            front: pages[0].image,
            back: pages[0].image,
          }
        }
      })

      book.importPages(pages, { width: 700, height: 700 });
      shelfManager.importBookToShelf(book);

      const bookViewer = shelfManager.getBookViewer();
      const view = new FlipView();
      bookViewer.registerView(new FlipView());
      bookViewer.setCurView(view.id)
      // bookManager.loadAndAddBooks();  
      shelfManager.pickupAndView(book);
      bookViewer.setZoomLevel(2.0);
    }
  }, [shelfManager]);
  return (
    <div>
      <div id="bookShelf" className="display-none" />
      <div id="bookViewer" />
    </div>
  )
}