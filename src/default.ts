import { BookViewer } from '@lib/core/bookViewer';
import { BookShelfManager } from './lib/core/bookShelfManager';
import { Book } from '@lib/core/book';
import { Page } from '@lib/core/page';
import './magzog.css';

var bookManager: BookShelfManager;
var bookViewer: BookViewer;
document.addEventListener('DOMContentLoaded', function () {
  const pages = [
    {
      id: "page0",
      index: 0,
      image: './resources/book1/page0.jpg'
    },
    {
      id: "page1",
      index: 1,
      image: './resources/book1/page1.jpg'
    },
    {
      id: "page2",
      index: 2,
      image: './resources/book1/page2.jpg'
    },
    {
      id: "page3",
      index: 3,
      image: './resources/book1/page3.jpg'
    },
    {
      id: "page4",
      index: 4,
      image: './resources/book1/page4.jpg'
    },
    {
      id: "page5",
      index: 5,
      image: './resources/book1/page5.jpg'
    },
    {
      id: "page6",
      index: 6,
      image: './resources/book1/page6.jpg'
    },
    {
      id: "page7",
      index: 7,
      image: './resources/book1/page7.jpg'
    }
  ];

  const book = new Book({ 
    id: 'mybook1', 
    lastPageIndex: 7,
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
  book.importPages(pages, { width: 790, height: 1024 });

  // DOM이 로딩된 후 실행할 코드를 여기에 작성
  bookManager = new BookShelfManager();
  bookViewer = bookManager.getBookViewer();
  bookManager.loadAndAddBooks();
  bookManager.importBookToShelf(book);

  (window as any).bookManager = bookManager;
  (window as any).bookViewer = bookViewer;
});
  
window.onload = function () {
  console.log('All resources including images are loaded');
  // 모든 리소스가 로딩된 후 실행할 코드를 여기에 작성
};
