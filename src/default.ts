import { BookViewer } from '@lib/core/bookViewer';
import { BookShelfManager } from './lib/core/bookShelfManager';
import { Book } from '@lib/core/book';

var bookManager: BookShelfManager;
var bookViewer: BookViewer;
document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM fully loaded and parsed');
  // DOM이 로딩된 후 실행할 코드를 여기에 작성
  bookManager = new BookShelfManager();
  bookViewer = bookManager.getBookViewer();
  bookManager.loadAndAddBooks();

  (window as any).bookManager = bookManager;
  (window as any).bookViewer = bookViewer;
});
  
window.onload = function () {
  console.log('All resources including images are loaded');
  // 모든 리소스가 로딩된 후 실행할 코드를 여기에 작성
};
