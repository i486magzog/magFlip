import { BookManager } from './lib/core/bookManager';

var bookManager: BookManager;
document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM fully loaded and parsed');
  // DOM이 로딩된 후 실행할 코드를 여기에 작성
  bookManager = new BookManager();
  bookManager.loadAndAddBooks();

  (window as any).bookManager = bookManager;
});
  
window.onload = function () {
  console.log('All resources including images are loaded');
  // 모든 리소스가 로딩된 후 실행할 코드를 여기에 작성
};
