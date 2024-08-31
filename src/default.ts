import { BookManager } from './lib/bookManager.js';

document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM fully loaded and parsed');
  // DOM이 로딩된 후 실행할 코드를 여기에 작성
  const bookManager = new BookManager();
  bookManager.loadAndAddBooks();
});
  
window.onload = function () {
  console.log('All resources including images are loaded');
  // 모든 리소스가 로딩된 후 실행할 코드를 여기에 작성
};